/**
 * 配置对象
 */
export default class Config {
  constructor (
    multiple,
    singleLineMode,
    onlyLeaf,
    disableMerge2parent,
    clearable,
    renderFormat,
    separator,
    placeholder,
    filterable,
    notFoundText,
    disabled,
    transfer,
  ){
    this.multiple = multiple;

    // 单行显示模式
    this.singleLineMode = singleLineMode;

    // 只选叶子模式
    this.onlyLeaf = onlyLeaf;

    // 禁止选中项合并模式（只有在onlyLeaf关闭时有效）
    this.disableMerge2parent = disableMerge2parent;

    // 可清空
    this.clearable = clearable;

    // 自定义选中项显示函数
    this.renderFormat = renderFormat;

    // 选中项显示使用的分割符
    this.separator = separator;

    // 占位符
    this.placeholder = placeholder;

    // 可搜索
    this.filterable = filterable;

    // 搜索无结果时显示的问题
    this.notFoundText = notFoundText;

    // 禁用
    this.disabled = disabled;

    // 同iview
    this.transfer = transfer;
  }
}
