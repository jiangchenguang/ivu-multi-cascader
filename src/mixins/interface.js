// 组件提供的接口

import { assist } from '../utils';

export default {
  methods: {
    /**
     * 通过简单的路径返回options中对象的路径
     * @param attrName
     * @param attrPathList
     * @param attrPathString
     * @return {*}
     */
    findPathByPath (attrName = 'value', attrPathList = [], attrPathString = ""){
      return this.getItemPath(attrName, attrPathList, attrPathString);
    },
    /**
     * 根据 对象数组或字符串 获取options中完整的对象路径数组
     * 因为：
     * 一个选中项是使用选中路径上的item的数组
     * 如果指定一个属性，那么组数的对象只有该属性也是可以匹配出唯一（或第一个）对象
     * 或者更简单的，提供一个separator分割的指定属性的字符串也是可以的
     * attrName 指定哪个属性匹配路径，对应值类型必须是基础类型
     * attrPathList 对象数组，每个对象至少有一个attrName属性
     * attrPathString 路径上的对象的attrName属性值 使用separator拼接的字符串
     */
    getItemPath (attrName = 'value', attrPathList = [], attrPathString = ""){
      let format2OptionObjPath = (attrPath) =>{
        let selectedPath = [];
        let currNode = this.options;
        let find = true;
        for (let item of attrPath) {
          currNode = currNode.find(i => i[ attrName ] === item[ attrName ]);
          if (currNode) {
            selectedPath.push(currNode);
            currNode = currNode.children;
          } else {
            find = false;
            break;
          }
        }

        return find ? selectedPath : [];
      };

      if ((!attrPathList || !attrPathList.length) && !attrPathString) return [];

      let attrPath = !!attrPathList.length
        ? assist.deepCopy(attrPathList)
        : attrPathString.split(this.separator).map(str =>{
          return { [ attrName ]: str.trim() }
        });

      return format2OptionObjPath(attrPath);
    },

    /**
     * 通过值找到选项对象（可能多个）
     * @param attrName    匹配哪个属性
     * @param attrValue   匹配对应的值
     */
    findPathByValue (attrName = "", attrValue = ""){
      /**
       * 判断当前节点及其子节点是否满足要求
       * @param currNode
       * @param parentNodePath
       * @param rltList
       */
      function findInCurrNode (currNode, parentNodePath, rltList){
        // 路径更新为当前节点
        let currentNodePath = parentNodePath.slice();
        currentNodePath.push(currNode);

        // 当前节点
        if (currNode[ attrName ] === attrValue) {
          rltList.push(currentNodePath);
        }

        // 子节点
        if (assist.isDef(currNode.children) && currNode.children.length > 0) {
          for (let child of currNode.children) {
            findInCurrNode(child, currentNodePath, rltList);
          }
        }
      }


      let itemPathList = [];
      if (assist.typeOf(attrName) !== "string" ||
        assist.typeOf(attrValue) !== "string" ||
        attrName.length === 0 ||
        attrValue.length === 0) {
        console.error("invalid args!", attrName, attrValue);
        return itemPathList;
      }

      // 遍历整个选项
      for (let treeNode of this.options) {
        findInCurrNode(treeNode, [], itemPathList);
      }
      return itemPathList;
    }
  }
}