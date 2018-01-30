let defaultView = document.defaultView;

export function getStyleSet(elm) {
  return defaultView
    ? defaultView.getComputedStyle(elm)
    : elm.currentStyle
}

export function property(set, name) {
  return defaultView
    ? set.getPropertyValue(name)
    : set[ name ]
}

export function getStyle(elm, name) {
  return defaultView
    ? defaultView.getComputedStyle(elm).getPropertyValue(name)
    : elm.currentStyle[ name ];
}

/**
 * 获取元素内容宽度
 * @param elm
 * @returns {number}
 */
export function getContentWidth(elm) {
  let style = getStyleSet(elm);
  return parseInt(property(style, 'width'))
    - parseInt(property(style, 'border-left-width'))
    - parseInt(property(style, 'padding-left'))
    - parseInt(property(style, 'padding-right'))
    - parseInt(property(style, 'border-right-width'));
}
/**
 * 获取元素内容宽度
 * @param elm
 * @returns {number}
 */
export function getTotalWidth(elm) {
  let style = getStyleSet(elm);
  return parseInt(property(style, 'margin-left'))
    + parseInt(property(style, 'width'))
    + parseInt(property(style, 'margin-right'));
}
