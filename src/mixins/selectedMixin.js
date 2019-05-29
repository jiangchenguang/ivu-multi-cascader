/**
 * 选中项混合，业务无关
 */

import { Selected } from "@/clazz";

export default {
  props   : {
    /**
     * 用户提供的选中项
     * 单选：需要一维数组
     * 复选：需要二维数组
     * @param {{value: String}[]}
     */
    value: {
      type: Array,
      default (){
        return [];
      }
    },
  },
  data (){
    return {
      /**
       * 选中项列表
       * @type {Selected[]}
       */
      selected: [],
    }
  },
  computed: {
    /**
     * 组件内部使用的value，对应外部的value，用于emit或其他判断
     * 即：单选时是一个选中项的路径，复选时是多个选中项路径的数组
     */
    // inner_value (){
    //   return this.config.multiple
    //     ? this.selected.map(selectedNode => selectedNode.getOptionPath())
    //     : this.selected.length
    //       ? this.selected[ 0 ].getOptionPath()
    //       : [];
    // },
  },
  created (){
  },
  methods : {
    /**
     * 通过value初始化选中项
     * 初始化逻辑应该放在外面（因为是业务相关的）
     */
    initByValue (){
      // todo
      if (!Array.isArray(this.value)) return;

      // 标准化成二维数组
      let userValue = this.config.multiple ? this.value : [ this.value ];

      // 根据用户的选中项，找到选项中的节点，并保存到selected中
      for (let item of userValue) {
      }
    },

    // ------ interface start 以selected作为函数的prefix ------

    /**
     * 是否需要添加
     * @param {OptionNode[]} optionPath
     */
    selectedCouldAdd (optionPath){
      return (
        optionPath.length // 不能空
        && this.selected.every(i => !i.isSamePath(optionPath)) // 不在选中项之列
        && !(this.config.onlyLeaf && optionPath[ optionPath.length - 1 ].children.length) // 非 只能选叶子节点的情况下，选择非叶子节点
      )
    },

    /**
     * 直接添加选中项
     * @param {Selected} selected
     */
    selectedAdd (selected){
      // 删除后代选中项
      this.doDeleteDescendant(selected);

      // 添加选中项
      this.selected.push(selected);
    },

    /**
     * 删除选中项
     * @param {number[]} idxList 待删除选中项的index的数组
     * @return {Selected[]}
     */
    selectedDelete (idxList = []){
      return this.doDelete(idxList);
    },

    /**
     * 移除所有选中项
     * @return {Selected[]}
     */
    selectedDeleteAll (){
      return this.doDelete(this.selected.map((v, idx) => idx));
    },

    // ------ interface end ------

    /**
     * 真正删除选中项
     * @param {number[]} idxList 待删除选中项的index的数组
     * @return {Selected[]}
     */
    doDelete (idxList = []){
      let len, idx, toRemoved, removed = [];

      // 从后往前删除
      idxList = idxList.filter(i => i >= 0 && i < this.selected.length).sort((a, b) => a - b);
      len     = idxList.length;
      while (len--) {
        idx       = idxList[ len ];
        toRemoved = this.selected[ idx ];
        removed.push(toRemoved);
        this.selected.splice(idx, 1);
      }

      return removed;
    },

    /**
     * 移除待添加项的后代选中项
     * @param {Selected} selected
     * @return {Selected[]}
     */
    doDeleteDescendant (selected){
      // 没有子孙节点
      if (!selected.lastNode().children.length) return [];

      let toDel = [];
      let len   = this.selected.length;
      while (len--) {
        if (this.selected[ len ].isDescendantOf(selected.path)) {
          toDel.push(len);
        }
      }

      return this.doDelete(toDel);
    },

    /**
     * 选中项是否变化
     * @param userSelected
     */
    /*
     ifSelectedModified (userSelected){
     try {
     if (assist.typeOf(userSelected) !== "array") return true;

     // 统一使用二维数组
     let user  = this.config.multiple ? userSelected : [ userSelected ];
     let inner = this.config.multiple ? this.inner_value : [ this.inner_value ];
     if (user.length !== inner.length) return true;

     // 逐个判断每个选中项是否一致
     for (let idx = 0; idx < user.length; idx++) {
     let userItem  = user[ idx ];
     let innerItem = inner[ idx ];
     if (userItem.length !== innerItem.length) return true;
     for (let deep = 0; deep < userItem.length; deep++) {
     if (userItem[ deep ].value !== innerItem[ deep ].value) return true;
     }
     }
     }
     catch (e) {
     return true;
     }
     return false;
     },
     */
  }
}
