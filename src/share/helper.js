/**
 * 二维字符数组中是否存在一个元素
 * @param {string[][]} strListList
 * @param {string[]} toFind
 * @return {boolean}
 */
export function findSpecialStrList (strListList, toFind){
  return strListList
    .filter(i => i.length === toFind.length)
    .find(list => list.every((value, index) => value === toFind[ index ]));
}
