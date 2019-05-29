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
     * 选中项节点路径
     * @type {OptionNode[]}
     */
    this.path = optionsNodeList;
  }

  /**
   * 是否相同路径
   * @param {OptionNode[]} path
   * @returns {boolean}
   */
  isSamePath (path){
    if (this.path.length !== path.length) return false;

    let len = this.path.length;
    while (len--) {
      if (this.path[ len ].value !== path[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是入参的子孙节点
   * @param {OptionNode[]} path
   * @return {boolean}
   */
  isDescendantOf (path){
    // 路径长度必须长于入参
    if (this.path.length <= path.length) return false;

    let len = path.length;
    while (len--) {
      if (this.path[ len ].value !== path[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是入参的祖先节点
   * @param {OptionNode[]} path
   * @return {boolean}
   */
  isAncestorOf (path){
    // 路径长度必须短于入参
    if (this.path.length >= path.length) return false;

    let len = this.path.length;
    while (len--) {
      if (this.path[ len ].value !== path[ len ].value) return false;
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
   * 末端节点
   * @return {OptionNode}
   */
  lastNode (){
    return this.path[ this.path.length - 1 ];
  }
}
