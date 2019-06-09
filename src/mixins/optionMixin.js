/**
 * 选项混合，业务无关
 */

import { OptionNode, Selected } from "@/clazz";

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
    optionInit (){
      this.inner_option_list.splice(
        0,
        this.inner_option_list.length,
        ...this.optionGenerate(this.options)
      )
    },

    /**
     * 根据用户提供的选项列表生成内部选项列表
     * @param optionList
     */
    optionGenerate (optionList){
      if (!Array.isArray(optionList)) return [];

      let list = [];
      for (let item of optionList) {
        if (!this.optionCheckAndNormalize(item)) {
          console.warn(item, "is invalid!");
          continue;
        }

        list.push(new OptionNode(
          item.label,
          item.value,
          this.optionGenerate(item.children),
          item.disabled,
        ));
      }
      return list;
    },

    /**
     * 检查 并 标准化
     * @param optNode
     */
    optionCheckAndNormalize (optNode){
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
     * 根据一个value的数组，找到对应的选项节点路径
     * @param {string[]} valueList 指示了选项的路径
     * @return {OptionNode[]}
     */
    optionGetPathByValueList (valueList = []){
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

      return path;
    },
  }
}
