/**
 * 选中项混合，业务无关
 */

import { Selected } from "@/clazz";
import { findSpecialStrList } from "@/share";

export default {
  props   : {
    /**
     * 用户提供的选中项
     * 单选：需要一维数组
     * 复选：需要二维数组
     * @param {string[][]}
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
     * 和selected一一对应，也是选中项，每个选中项都使用value的数组表示
     * @return {*}
     */
    selectedValuePathList (){
      return this.selected.map(selected => selected.path.map(opt => opt.value));
    },
  },
  created (){
  },
  methods : {
    /**
     * 选中项初始化
     * @param {string[][]|string[]} list
     */
    selectedInit (list){
      if (!Array.isArray(list)) return;

      // 标准化成二维数组
      let selectedList = this.config.multiple ? this.value : [ this.value ];

      // 根据用户的选中项，找到选项中的节点，并保存到selected中
      for (let valueList of selectedList) {
        if (!valueList.every(i => typeof i === 'string')) continue;

        let path = this.optionGetPathByValueList(valueList);
        if (path) {
          this.onUserSelect(path);
        }
      }
    },

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
      this.selectedDeleteDescendant(selected);

      // 添加选中项
      this.selected.push(selected);
    },

    /**
     * 删除选中项
     * @param {number[]} idxList 待删除选中项的index的数组
     * @return {Selected[]}
     */
    selectedDelete (idxList = []){
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
     * 移除所有选中项
     * @return {Selected[]}
     */
    selectedDeleteAll (){
      return this.selectedDelete(this.selected.map((v, idx) => idx));
    },

    /**
     * 移除待添加项的后代选中项
     * @param {Selected} selected
     * @return {Selected[]}
     */
    selectedDeleteDescendant (selected){
      // 没有子孙节点
      if (!selected.lastNode().children.length) return [];

      let toDel = [];
      let len   = this.selected.length;
      while (len--) {
        if (this.selected[ len ].isDescendantOf(selected.path)) {
          toDel.push(len);
        }
      }

      return this.selectedDelete(toDel);
    },

    /**
     * 判断value和选中项是等价的
     */
    selectedEqualWithValue (){
      // v-model
      if (this.value === this.selectedValuePathList) return true;

      // 通过长度快速判断
      if (this.value.length !== this.selectedValuePathList.length) return false;

      // 一一查找
      for (let valueList of this.value) {
        if (!valueList.every(i => typeof i === 'string')
          || !findSpecialStrList(this.selectedValuePathList, valueList)
        ) return false;
      }

      return true;
    }
  }
}
