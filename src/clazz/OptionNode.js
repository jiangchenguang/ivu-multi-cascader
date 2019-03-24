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
    // 标签
    this.label = label.trim();

    // 值
    this.value = value.trim();

    // 前置图标
    this.icon = icon.trim();

    // icon颜色
    this.iconColor = iconColor.trim();

    // 指定分组名
    this.group = group.trim();

    // 是否禁用
    this.disabled = disabled;

    // 是否被选中
    this.selected = false;

    // 子节点列表
    this.children = children;
  }

  /**
   * 标记选中
   * @param recursive
   */
  select (recursive = true){
    this.selected = true;

    if (recursive) {
      for (let child of this.children) {
        child.select();
      }
    }
  }

  /**
   * 标记未选
   * @param recursive
   */
  unSelect (recursive = true){
    this.selected = false;

    if (recursive) {
      for (let child of this.children) {
        child.unSelect();
      }
    }
  }

  ifSelected (){
    return this.selected;
  }

  ifDisabled (){
    return this.disabled;
  }

  /**
   * 所有子节点均选中
   * @return {boolean}
   */
  ifAllChildrenSelected (){
    return this.children.length > 0 && this.children.every(i => i.selected);
  }
}
