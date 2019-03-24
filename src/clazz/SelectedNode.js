/**
 * 选中项对象
 */
import { assist } from '@/utils';

export default class SelectedNode {
  constructor (
    innerOptionNodePath
  ){
    // 选中项路径
    this.nodePath = innerOptionNodePath.slice();

    this.toDelete = false;
  }

  /**
   * 返回选中项路径
   * @return {*}
   */
  getOptionPath (){
    return this.nodePath;
  }

  /**
   * 返回待删除的标记
   * @return {boolean}
   */
  getDeleteFlag (){
    return this.toDelete;
  }

  /**
   * 设置将要删除的标记
   */
  setDeleteFlag (){
    this.toDelete = true;
  }

  /**
   * 判断入参是否与当前实例同一路径
   * 入参是一个对象数组，必须存在value属性用于判断
   * @param nodePath
   * @returns {number} -1：非法 0：非同一路径 1：同一路径
   */
  ifSamePath (nodePath = []){
    if (assist.typeOf(nodePath) !== "array") return -1;
    if (!nodePath.length) return -1;

    let selfNodePath = this.nodePath;
    if (selfNodePath.length !== nodePath.length) return 0;

    try {
      for (let deep = 0; deep < nodePath.length; deep++) {
        if (selfNodePath[ deep ].value !== nodePath[ deep ].value) {
          return 0;
        }
      }
    } catch (e) {
      console.warn("invalid param!", nodePath, "err:", e);
      return -1;
    }
    return 1;
  }

  /**
   * 判断是否是入参的子孙节点
   * @param ancestorNodePath
   */
  isDescendantOf (ancestorNodePath = []){
    let selfPath = this.nodePath;
    if (ancestorNodePath.length === 0 ||
      selfPath.length <= ancestorNodePath.length) {
      return false;
    }

    for (let deep = 0; deep < ancestorNodePath.length; deep++) {
      if (selfPath[ deep ].value !== ancestorNodePath[ deep ].value) return false;
    }

    return true;
  }

  /**
   * 判断是否是入参的祖先节点
   * @param descendantNodePath
   */
  isAncestorOf (descendantNodePath = []){
    let selfPath = this.nodePath;
    if (selfPath.length >= descendantNodePath.length) return false;

    for (let deep = 0; deep < selfPath.length; deep++) {
      if (selfPath[ deep ].value !== descendantNodePath[ deep ].value) return false;
    }

    return true;
  }
}