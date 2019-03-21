/**
 * 选项相关的基础函数、属性，业务无关
 */

// import { FilterItem, OptionNode } from "@/clazz";
import { OptionNode } from "@/clazz";
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
      inner_options: [],
    }
  },
  computed: {
    /**
     * 扁平化选项
     * 级联 -> 一维数组
     */
    flattenInnerOptions (){
      // let flattenedOptions = [];
      // doFlatten(this.inner_options, [], "", "", this.onlyLeaf, this.separator);
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
  created (){
    this.initOptions();
  },
  mounted (){
  },
  methods : {
    /**
     * 选项的初始化
     */
    initOptions (){
      let userOpts = assist.deepCopy(this.options);
      if (!this.checkValid(userOpts)) {
        return false;
      }

      this.inner_options.splice(
        0,
        this.inner_options.length,
        ...this.createOptionNode(userOpts)
      )
    },

    /**
     * 检验是否合法
     */
    checkValid (userOpts){
      if (assist.typeOf(userOpts) !== "array") {
        console.error("options is not array!");
        return false;
      }

      return this.doCheckValid(userOpts);
    },

    /**
     * 真正的检查操作
     * @param userOpts
     * @return {*}
     */
    doCheckValid (userOpts){
      for (let userOpt of userOpts) {
        if (!this.optionsCheckAndNormalize(userOpt)) {
          console.error("options is invalid!", userOpt);
          return false;
        }

        if (userOpt.children.length > 0) {
          if (!this.doCheckValid(userOpt.children)) return false;
        }
      }
      return true;
    },

    /**
     * 单个节点检查和统一化
     * @param optNode
     */
    optionsCheckAndNormalize (optNode){
      if (assist.typeOf(optNode.label) !== "string" ||
        optNode.label.trim().length === 0 ||
        assist.typeOf(optNode.value) !== "string" ||
        optNode.value.trim().length === 0) {
        return false;
      }
      if (assist.isUndef(optNode.icon) ||
        assist.typeOf(optNode.icon) !== "string") {
        optNode.icon = undefined;
      }

      if (assist.isUndef(optNode.group) ||
        assist.typeOf(optNode.group) !== "string" ||
        optNode.group.trim().length === 0) {
        optNode.group = undefined;
      }

      if (assist.isUndef(optNode.iconColor) ||
        assist.typeOf(optNode.iconColor) !== "string") {
        optNode.iconColor = undefined;
      }

      if (assist.isUndef(optNode.children) ||
        assist.typeOf(optNode.children) !== "array") {
        optNode.children = [];
      }

      optNode.disabled = !!optNode.disabled;

      return true;
    },

    /**
     * 创建一个节点对象
     * @param userOpts 用户传入的选项节点
     */
    createOptionNode (userOpts){
      let options = [];
      for (let userOpt of userOpts) {
        if (userOpt.children.length > 0) {
          userOpt.children = this.createOptionNode(userOpt.children);
        }
        options.push(new OptionNode(
          userOpt.label,
          userOpt.value,
          userOpt.icon,
          userOpt.group,
          userOpt.iconColor,
          userOpt.disabled,
          userOpt.children
        ));
      }
      return options;
    },

    /**
     * 判断可选项是否由唯一路径组成，如果是的话，返回值路径，否则返回null
     * 【唯一路径】:可选项有且只有1个，且子选项也是
     */
    ifOptionIsOnlyPath (){
      if (this.inner_options.length === 0) return null;

      let valuePath = [];
      let opt       = this.inner_options;

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

    /**
     * 根据用户对象的路径找到一个相同的路径，但节点都是option中的对象
     * @param userObjPath 用户提供的对象路径，至少有propName对应的属性
     * @param propName 指定通过对应的属性查找
     */
    getOptionPathByUserObjPath (userObjPath = [], propName = "value"){
      let selectedPath = [];
      let currNode     = this.inner_options;
      for (let path of userObjPath) {
        currNode = currNode.find(item => {
          return assist.isDef(item[ propName ])
            && assist.typeOf(path) === "object"
            && assist.isDef(path[ propName ])
            && item[ propName ] === path[ propName ]
        });
        if (currNode) {
          selectedPath.push(currNode);
          currNode = currNode.children;
        } else {
          return [];
        }
      }

      return selectedPath;
    },

    /**
     * 判断一个路径是否是OptionNode组成的路径
     * @param optionNodePath
     * @return {boolean}
     */
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
  }
}
