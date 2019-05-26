/**
 * 选项混合，业务无关
 */

import { OptionNode, Selected } from "@/clazz";
import { assist } from '@/utils';

export default {
  props   : {
    /**
     * 用户传入选项
     */
    options: {
      type: Array,
      default (){
        return [];
      }
    },
  },
  data (){
    return {
      /**
       * 内部选项
       */
      inner_option_list: [],
    }
  },
  computed: {
    /**
     * 扁平化选项
     * 级联 -> 一维数组
     */
    flattenInnerOptions (){
      // let flattenedOptions = [];
      // doFlatten(this.inner_option_list, [], "", "", this.config.onlyLeaf, this.separator);
      // return flattenedOptions;
      //
      // function doFlatten (
      //   optionNodeList,
      //   parentPath,
      //   parentPathLabel,
      //   parentPathValue,
      //   onlyLeaf,
      //   separator
      // ){
      //   for (let optionNode of optionNodeList) {
      //     if (!optionNode.children || !onlyLeaf) {
      //       // 子节点 或 允许选中父节点
      //       flattenedOptions.push(new FilterItem(
      //         optionNode,
      //         parentPath,
      //         parentPathLabel,
      //         parentPathValue,
      //         separator,
      //       ));
      //     }
      //
      //     if (optionNode.children) {
      //       doFlatten(
      //         optionNode.children,
      //         parentPath.concat([ optionNode ]),
      //         parentPathLabel ? `${parentPathLabel}${separator}${optionNode.label}` : optionNode.label,
      //         parentPathValue ? `${parentPathValue} ${optionNode.value}` : optionNode.value,
      //         onlyLeaf,
      //         separator
      //       );
      //     }
      //   }
      // }
    },
  },
  mounted (){
  },
  methods : {
    /**
     * 选项的初始化
     */
    initOptions (){
      this.inner_option_list.splice(
        0,
        this.inner_option_list.length,
        ...this.genList(this.options)
      )
    },

    /**
     * 根据用户提供的选项列表生成内部选项列表
     * @param optionList
     */
    genList (optionList){
      if (assist.typeOf(optionList) !== "array") return [];

      let list = [];
      for (let item of optionList) {
        if (!this.checkAndNormalize(item)) {
          console.warn(item, "is invalid!");
          continue;
        }

        list.push(new OptionNode(
          item.label,
          item.value,
          this.genList(item.children),
          item.disabled,
        ));
      }
      return list;
    },

    /**
     * 检查 并 标准化
     * @param optNode
     */
    checkAndNormalize (optNode){
      if (typeof optNode.label !== "string"
        || optNode.label.trim().length === 0
        || typeof optNode.value !== "string"
        || optNode.value.trim().length === 0
      ) {
        return false;
      }

      optNode.disabled = !!optNode.disabled;

      return true;
    },

    /**
     * 判断可选项是否由唯一路径组成，如果是的话，返回值路径，否则返回null
     * 【唯一路径】:可选项有且只有1个，且子选项也是
     */
    /*
     ifOptionIsOnlyPath (){
     if (this.inner_option_list.length === 0) return null;

     let valuePath = [];
     let opt       = this.inner_option_list;

     while (assist.isDef(opt)) {
     if (opt.length === 1) {
     valuePath.push(opt[ 0 ]);
     opt = opt[ 0 ].children;
     } else if (opt.length === 0) {
     // 最后一个节点了
     return valuePath;
     } else {
     return null;
     }
     }
     return valuePath;
     },
     */

    /**
     * 根据一个value的数组，找到对应的选项节点路径
     * @param {string[]} valueList 指示了选项的路径
     * @return {Selected}
     */
    getOptionPathByValueList (valueList = []){
      let find, path = [], list = this.inner_option_list;

      for (let value of valueList) {
        find = list.find(item => item.value === value);
        if (find) {
          path.push(find);
          list = find.children;
        } else {
          return null;
        }
      }

      return new Selected(path);
    },
    /**
     * 根据用户对象的路径找到一个相同的路径，但节点都是option中的对象
     * @param userObjPath 用户提供的对象路径，至少有propName对应的属性
     * @param propName 指定通过对应的属性查找
     */
    getOptionPathByUserObjPath (userObjPath = [], propName = "value"){
      let selected = [];
      let currNode     = this.inner_option_list;
      for (let path of userObjPath) {
        currNode = currNode.find(item => {
          return assist.isDef(item[ propName ])
            && assist.typeOf(path) === "object"
            && assist.isDef(path[ propName ])
            && item[ propName ] === path[ propName ]
        });
        if (currNode) {
          selected.push(currNode);
          currNode = currNode.children;
        } else {
          return [];
        }
      }

      return selected;
    },

    /**
     * 判断一个路径是否是OptionNode组成的路径
     * @param optionNodePath
     * @return {boolean}
     */
    /*
     isInnerOptionPath (optionNodePath){
     if (assist.typeOf(optionNodePath) !== "array" ||
     optionNodePath.length === 0) {
     return false;
     }

     for (let idx = optionNodePath.length - 1; idx >= 0; idx--) {
     let currNode, parentNode;

     currNode = optionNodePath[ idx ];
     if (!(currNode instanceof OptionNode)) {
     return false;
     }
     if (idx > 1) {
     parentNode = optionNodePath[ idx - 1 ];
     if (!(parentNode instanceof OptionNode)) {
     return false;
     }

     let find = parentNode.children.find(child => child.value === currNode.value);
     if (!find) {
     return false;
     }
     }
     }

     return true;
     },
     */
  }
}
