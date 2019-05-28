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
      if (!Array.isArray(this.value)) return;

      // 标准化成二维数组
      let userValue = this.config.multiple ? this.value : [ this.value ];

      // 根据用户的选中项，找到选项中的节点，并保存到selected中
      for (let item of userValue) {
        this.selectedAddByValueList(item.map(i => i.value));
      }
    },

    // ------ interface start 以selected作为函数的prefix ------

    /**
     * 添加选中项
     * @param {Selected} selected
     */
    selectedAdd (selected){
      this.doAdd(selected);
    },

    /**
     * 通过value数组添加一个选中项
     * @param {string[]} valueList 指示了选项的路径
     */
    selectedAddByValueList (valueList){
      let selected = this.getOptionPathByValueList(valueList);
      if (selected) {
        this.doAdd(selected);
      }
    },

    /**
     * 删除选中项
     * @param {number[]} idxList 待删除选中项的index的数组
     * @return {Selected[]}
     */
    selectedDelete (idxList = []){
      let deleted = this.doDelete(idxList);
      deleted.forEach(i => i.setSelectedDownstream(false));
      return deleted;
    },

    /**
     * 移除所有选中项
     * @return {Selected[]}
     */
    selectedDeleteAll (){
      let deleted = this.doDelete(this.selected.map((v, idx) => idx));
      deleted.forEach(i => i.setSelectedDownstream(false));
      return deleted;
    },

    // ------ interface end ------

    /**
     * 真正添加一个选中项
     * @param {Selected} selected
     */
    doAdd (selected){
      {
        // 判断是否需要添加
        if (
          !selected instanceof Selected ||
          !selected.path.length || // 没有长度
          this.selected.some(i => i.isSamePath(selected)) || // 已在选中项之列
          (this.config.onlyLeaf && !selected.isLeaf()) // 在只能选叶子节点的情况下，添加一个非叶子节点
        ) {
          return;
        }
      }

      {
        // 删除现有选中项
        // 不管是单选还是复现，现有选中项如果是待添加选中项的后代，移除
        this.doDeleteDescendant(selected);
        if (!this.config.multiple && this.selected.length) {
          // 单选模式下，如果选中项不是待选中项的后代，就指定移除并清空标记。
          let [ only ] = this.doDelete([ 0 ]);
          only.unselectUpstream();
        }
      }

      {
        // 添加选中项并置标记
        this.selected.push(selected);
        let path = selected.selectUpstream();
        // 如果返回的路径比selectedPath短，说明合并过了，根据配置决定是否向上合并
        if (!this.config.disableMerge2parent && path.length < selected.path.length) {
          this.doAdd(new Selected(path));
        }
      }
    },

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
     * @param {Selected} optionPath
     * @return {Selected[]}
     */
    doDeleteDescendant (optionPath){
      if (optionPath.isLeaf()) return [];

      let toDel = [];
      let len   = this.selected.length;
      while (len--) {
        if (this.selected[ len ].isDescendantOf(optionPath)) {
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
