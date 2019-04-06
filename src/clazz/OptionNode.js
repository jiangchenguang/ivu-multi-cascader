/**
 * 选项节点对象
 */
export default class OptionNode {
  constructor (
    label,
    value,
    icon      = "",
    group     = "",
    iconColor = "black",
    disabled  = false,
    children  = [],
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
     * 图标（iview中icon的名字）
     * @type {string}
     */
    this.icon = icon.trim();

    /**
     * 图标颜色
     * @type {string}
     */
    this.iconColor = iconColor.trim();

    /**
     * 分组名
     * @type {string}
     */
    this.group = group.trim();

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

    /**
     * 目前来说：如果设置一个节点选中，则所有子节点都选中
     * 设置一个节点未选中，因保留其子节点的选中状态
     */
    if (selected) {
      for (let child of this.children) {
        // 子节点状态是正确的，跳过
        if (child.selected === selected) continue;

        child.setSelected(selected);
      }
    }
  }

  isDisabled (){
    return this.disabled;
  }
}
