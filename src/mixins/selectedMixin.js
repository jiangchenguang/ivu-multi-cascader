/**
 * 选中项相关的基础函数、属性，业务无关
 */

import { SelectedPath, SelectedNode } from "@/clazz";
import { assist } from "@/utils";

export default {
  props   : {
    /**
     * 用户提供的选中项
     * 单选：需要一维数组
     * 复选：需要二维数组
     * @param {[{value: String}]}
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
       * @type {[SelectedPath]}
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
    //   return this.multiple
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
     */
    initByValue (){
      if (!Array.isArray(this.value)) return;

      // 标准化成二维数组
      let userValue = this.multiple ? this.value : [ this.value ];

      // 根据用户的选中项，找到选项中的节点，并保存到selected中
      for (let item of userValue) {
        let selectedPath = this.getOptionPathByValueList(item.map(i => i.value));
        if (selectedPath) {
          this.addSelectedPath(selectedPath);
        }
      }
    },

    /**
     * 通过 自动选择 来初始化选中项
     */
    initSelectedByAutoSelected (){
      let onlyPath;

      // 启用自动选择
      // 当前还没有选中项
      // 选项是唯一路径
      if (this.autoSelect &&
        this.selected.length === 0 &&
        (onlyPath = this.ifOptionIsOnlyPath(this.options))
      ) {
        this.addSelectedPath(onlyPath);
      }
    },

    /**
     * 添加一个选中项
     * @param {SelectedPath} selectedPath
     */
    addSelectedPath (selectedPath){
      if (!this.needAdd(selectedPath)) return;

      // 多选模式下清除子孙选中项
      // 单选模式下清除唯一项
      if (this.multiple) {
        if (!this.onlyLeaf) this.deleteSelectedDescendantNodes(selectedPath);
      } else {
        this.clearSelected();
      }

      // 模型标记
      selectedPath.select();
      // 添加选中项
      this.selected.push(selectedPath);

      // 单选模式下仅为父节点打选中的标记
      // 多选模式下尝试合并成父节点
      if (this.onlyLeaf || this.disableMerge2parent) {
        this.setParentNodeSelectedStatusRecursively(selectedPath, true);
      } else {
        this.merge2parentNodeRecursively(selectedPath);
      }
    },

    /**
     * 移除选中项
     * @param {[number]} toDelIdxList 待删除选项的idx组成的数组
     */
    deleteSelectedByIdx (toDelIdxList = []){
      let i, idx, selectedPath;

      // 从后往前删除
      toDelIdxList = toDelIdxList.filter(i => i >= 0 && i < this.selected.length).sort((a, b) => b - a);
      for (i = 0; i < toDelIdxList.length; i++) {
        idx          = toDelIdxList[ i ];
        selectedPath = this.selected[ idx ];

        // 模型标记
        selectedPath.unselect();
        this.setParentNodeSelectedStatusRecursively(selectedPath, false);

        this.selected.splice(idx, 1);
      }
    },

    /**
     * 移除所有选中项
     */
    clearSelected (){
      let list = [];
      for (let idx = 0; idx < this.selected.length; idx++) {
        list.push(idx);
      }
      this.deleteSelectedByIdx(list);
    },

    /**
     * 判断选中项是否有必要被添加
     * @param {SelectedPath} toAdd
     * @return {boolean}
     */
    needAdd (toAdd){
      if (!toAdd instanceof SelectedPath || !toAdd.path.length) return false;

      // 已经存在，不用添加
      if (this.selected.some(i => i.isSamePath(toAdd))) return false;

      // 只能选叶子节点，但传入了父节点，不能添加
      let path = toAdd.path;
      if (this.onlyLeaf && path[ path.length - 1 ].children.length) return false;

      return true;
    },

    /**
     * 向上递归，设置父结点的选中状态
     * 即子结点全部被选中，则父节点选中，向上递归；不选中的情况同理。
     * @param {[SelectedNode]} nodeList
     * @param {boolean} selectedStatus
     */
    setParentNodeSelectedStatusRecursively (nodeList, selectedStatus){
      let parentPath = nodeList.slice(0, nodeList.length - 1);
      let parentNode = parentPath[ parentPath.length - 1 ];

      if (selectedStatus) {
        if (parentNode.children.every(i => i.ifSelected())) {
          // todo select和unselect有重复设置的情况？
          parentNode.select(false);
        }
      } else {
        if (parentNode.children.some(i => !i.ifSelected())) {
          parentNode.unSelect(false);
        }
      }
      this.setParentNodeSelectedStatusRecursively(parentPath, selectedStatus);
    },

    /**
     * 向上递归，合并成父结点
     * 即子结点全部选中，则被替换成父结点
     * @param innerOptionPath
     */
    merge2parentNodeRecursively (innerOptionPath = []){
      // 一级节点返回
      if (innerOptionPath.length <= 1) return;

      // 如果父节点的所有子节点都被选中了，就合并
      let parentPath = innerOptionPath.slice(0, innerOptionPath.length - 1);
      let parentNode = parentPath[ parentPath.length - 1 ];
      if (parentNode.ifAllChildrenSelected()) {
        this.addSelectedPath(parentPath);
      }
    },

    /**
     * 移除是入参子孙节点的选中项
     * @param {SelectedPath} optionPath
     */
    deleteSelectedDescendantNodes (optionPath){
      // 没有子节点，返回。
      if (!optionPath.path[ optionPath.path.length - 1 ].children.length) return;

      let toDel = [];
      let len   = this.selected.length;
      while (len--) {
        if (this.selected[ len ].isDescendantOf(optionPath)) {
          toDel.push(len);
        }
      }

      this.deleteSelectedByIdx(toDel);
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
     let user  = this.multiple ? userSelected : [ userSelected ];
     let inner = this.multiple ? this.inner_value : [ this.inner_value ];
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
