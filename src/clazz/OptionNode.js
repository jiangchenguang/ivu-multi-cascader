/**
 * 选项节点对象
 */
export default class OptionNode {
  constructor (
    label,
    value,
    children = [],
    disabled = false,
  ){
    /**
     * 标签
     * @type {string}
     */
    this.label = label.trim();

    /**
     * 值
     * @type {string}
     */
    this.value = value.trim();

    /**
     * 选中状态
     * @type {boolean}
     */
    this.selected = false;

    /**
     * 禁用状态
     * @type {boolean}
     */
    this.disabled = disabled;

    /**
     * 子选项列表
     * @type {[OptionNode]}
     */
    this.children = children;
  }

  /**
   * 是否所有子节点都选中
   * @return {boolean}
   */
  isAllChildSelected (){
    return this.children.every(i => i.selected);
  }

  /**
   * 设置选中状态
   * @param {boolean} selected
   */
  setSelected (selected){
    this.selected = selected;
  }
}
