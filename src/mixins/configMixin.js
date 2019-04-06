/**
 * 配置混合，业务无关
 */

import { Config } from '@/clazz';

export default {
  props   : {
    // 多选模式
    multiple: {
      type   : Boolean,
      default: true
    },

    // 单行显示模式
    singleLineMode: {
      type   : Boolean,
      default: false,
    },

    // 只选叶子模式
    onlyLeaf: {
      type   : Boolean,
      default: false,
    },

    // 禁止选中项合并模式（只有在onlyLeaf关闭时有效）
    disableMerge2parent: {
      type   : Boolean,
      default: false,
    },

    // 可清空
    clearable: {
      type   : Boolean,
      default: true
    },

    // 自定义选中项显示函数
    renderFormat: {
      type: Function,
      default (label){
        return label.join(`${this.config.separator}`);
      }
    },

    // 选中项显示使用的分割符
    separator: {
      type   : String,
      default: ' / ',
    },

    // 占位符
    placeholder: {
      type   : String,
      default: '请选择',
    },

    // 可搜索
    filterable: {
      type   : Boolean,
      default: false
    },

    // 搜索无结果时显示的问题
    notFoundText: {
      type   : String,
      default: '无匹配内容',
    },

    // 禁用
    disabled: {
      type   : Boolean,
      default: false
    },

    // （初始化）自动选中模式
    autoSelect: {
      type   : Boolean,
      default: false,
    },

    // 同iview
    transfer: {
      type   : Boolean,
      default: false
    },

    // 全选按钮（暂不支持）
    allSelectable: {
      type   : Boolean,
      default: false
    },
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
    this.configInit();
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
        this.multiple,
        this.singleLineMode,
        this.onlyLeaf,
        this.onlyLeaf || this.disableMerge2parent,
        this.clearable,
        this.renderFormat,
        this.separator,
        this.placeholder,
        this.filterable,
        this.notFoundText,
        this.disabled,
        this.autoSelect,
        this.transfer,
        false
      )
    }
  }
}
