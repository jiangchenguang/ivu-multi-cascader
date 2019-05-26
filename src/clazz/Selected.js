/**
 * 选中项
 */
export default class Selected {

  /**
   * 构造函数
   * @param {[OptionNode]} optionsNodeList
   */
  constructor (optionsNodeList){
    if (!optionsNodeList.length) {
      console.error("the len of selectedPath at least 1!");
    }

    /**
     * 选项路径数组
     * @type {OptionNode[]}
     */
    this.path = optionsNodeList;
  }

  /**
   * 是否相同路径
   * @param {Selected} other
   * @returns {boolean}
   */
  isSamePath (other){
    if (this.path.length !== other.path.length) return false;

    let len = this.path.length;
    while (len--) {
      if (this.path[ len ].value !== other.path[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是入参的子孙节点
   * @param {Selected} other
   * @return {boolean}
   */
  isDescendantOf (other){
    // 路径长度必须长于入参
    if (this.path.length <= other.path.length) return false;

    let len = other.path.length;
    while (len--) {
      if (this.path[ len ].value !== other.path[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是入参的祖先节点
   * @param {Selected} other
   * @return {boolean}
   */
  isAncestorOf (other){
    // 路径长度必须短于入参
    if (this.path.length >= other.path.length) return false;

    let len = this.path.length;
    while (len--) {
      if (this.path[ len ].value !== other.path[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是叶子结点
   */
  isLeaf (){
    return this.path[ this.path.length - 1 ].children.length === 0;
  }

  /**
   * 向上设置选中状态
   * @return {OptionNode[]} 最上层能合并的节点的路径
   */
  selectUpstream (){
    this.path[ this.path.length - 1 ].selected = true;
    return this.doSetSelectUpstream(this.path, true);
  }

  /**
   * 向上设置非选中状态
   */
  unselectUpstream (){
    this.path[ this.path.length - 1 ].selected = false;
    this.doSetSelectUpstream(this.path, false);
  }

  /**
   * 真正向上设置选中标记
   * @param {OptionNode[]} path
   * @param {boolean} selected
   * @return {OptionNode[]} 最上层能合并的节点的路径
   */
  doSetSelectUpstream (path, selected){
    if (path.length > 1) {
      let parentPath = path.slice(0, path.length - 1);
      let parentNode = parentPath[ parentPath.length - 1 ];

      if (
        (selected && !parentNode.selected && parentNode.isAllChildSelected()) // 父节点未选中，且子节点节点全部选中
        || (!selected && parentNode.selected && !parentNode.isAllChildSelected()) // 父节点选中，且子节点未全部选中
      ) {
        parentNode.setSelected(selected);
        return this.doSetSelectUpstream(parentPath, selected);
      }
    }
    return path;
  }
}
