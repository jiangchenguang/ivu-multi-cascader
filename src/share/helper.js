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

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

function camelCase (name){
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset){
    return offset ? letter.toUpperCase() : letter;
  }).replace(MOZ_HACK_REGEXP, 'Moz$1');
}

export function getStyle (element, styleName){
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    const computed = document.defaultView.getComputedStyle(element, '');
    return element.style[ styleName ] || computed ? computed[ styleName ] : null;
  } catch (e) {
    return element.style[ styleName ];
  }
}
