/**
 * 配置混合，业务无关
 */

import { Config } from '@/clazz';

export default {
  props   : {
    // 多选模式
    multiple: Boolean,

    // 单行显示模式
    singleLineMode: Boolean,

    // 只选叶子模式
    onlyLeaf: Boolean,

    // 禁止选中项合并模式（只有在onlyLeaf关闭时有效）
    disableMerge2parent: Boolean,

    // 可清空
    clearable: Boolean,

    // 自定义选中项显示函数
    renderFormat: Function,

    // 选中项显示使用的分割符
    separator: String,

    // 占位符
    placeholder: String,

    // 可搜索
    filterable: Boolean,

    // 搜索无结果时显示的问题
    notFoundText: String,

    // 禁用
    disabled: Boolean,

    // 同iview
    transfer: Boolean,
  },
  data (){
    return {
      /**
       * 配置项
       * @type {Config}
       */
      config: null,
    }
  },
  created (){
  },
  computed: {},
  methods : {
    // ------ interface start ------

    // ------ interface end ------

    /**
     * 配置初始化
     */
    configInit (){
      this.config = new Config(
        true,
        this.singleLineMode,
        false,
        false,
        this.clearable,
        this.renderFormat,
        this.separator,
        this.placeholder,
        false,
        this.notFoundText,
        this.disabled,
        this.transfer,
      )
    }
  }
}
