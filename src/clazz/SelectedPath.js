/**
 * 选中项路径
 */
export default class SelectedPath {
  /**
   * 构造函数
   * @param {[OptionNode]} optionsNodeList
   */
  constructor (optionsNodeList){
    // 选项路径数组
    this.path = optionsNodeList;
  }

  /**
   * 是否相同路径
   * @param {SelectedPath} nodePath
   * @returns {boolean}
   */
  isSamePath (nodePath){
    if (this.path.length !== nodePath.path.length) return false;

    let len = this.path.length;
    while (len--) {
      if (this.path[ len ].value !== nodePath.path[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是入参的子孙节点
   * @param {SelectedPath} ancestorPath
   * @return {boolean}
   */
  isDescendantOf (ancestorPath = []){
    // 路径长度必须长于入参
    if (this.path.length <= ancestorPath.path.length) return false;

    let len = ancestorPath.path.length;
    while (len--) {
      if (this.path[ len ].value !== ancestorPath[ len ].value) return false;
    }

    return true;
  }

  /**
   * 是否是入参的祖先节点
   * @param {SelectedPath} descendantPath
   * @return {boolean}
   */
  isAncestorOf (descendantPath = []){
    // 路径长度必须短于入参
    if (this.path.length < descendantPath.path.length) return false;

    let len = this.path.length;
    while (len--) {
      if (this.path[ len ].value !== descendantPath[ len ].value) return false;
    }

    return true;
  }

  /**
   * 置选项的标记
   */
  select (){
    this.path[ this.path.length - 1 ].select();
  }

  /**
   * 置选项的标记
   */
  unselect (){
    this.path[ this.path.length - 1 ].unSelect();
  }
}
