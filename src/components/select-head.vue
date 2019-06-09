<template>
  <div @click="onHeaderClick">
    <div :style="multiSelectedStyle">
      <div v-if="config.multiple" ref="tags" class="ivu-tag ivu-tag-checked" v-for="(i, idx) of multiDisplayValue">
        <span class="ivu-tag-text">{{ i }}</span>
        <Icon type="ios-close-empty" @click.native.stop="removeTag(idx)"></Icon>
      </div>
    </div>
    <span v-show="!selected.length"
          :class="singleDisplayClasses"
    >
      {{ config.placeholder }}
    </span>

    <input ref="input"
           type="text"
           v-if="config.filterable"
           v-model="query"
           :disabled="config.disabled"
           :class="inputCls"
           :placeholder="config.placeholder"
           :style="inputStyle"
           autocomplete="off"
           spellcheck="false"
           @keydown="resetInputState"
           @focus="onInputFocus"
           @blur="onInputFocus"
    >
    <div class="mask"></div>
    <Icon type="ios-close"
          :class="iconCls"
          v-show="showClearIcon"
          @click.native.stop="onClear"
    ></Icon>
    <Icon type="arrow-down-b"
          :class="iconCls"
          v-show="!config.disabled"
    ></Icon>
  </div>
</template>
<script>
  import { Config } from '@/clazz';
  import { selPrefix, casPrefix } from "@/share";

  export default {
    mixins  : [],
    props   : {
      /**
       * @type Config
       */
      config       : Config,
      /**
       * 选中项
       * @type {Selected[]}
       */
      selected     : Array,
      /**
       * clear icon
       */
      showClearIcon: Boolean,
    },
    data (){
      return {
        query      : '',
        inputLength: 20,

        // 所有标签的总宽度
        totalTagsWidth: 0,
      };
    },
    computed: {
      singleDisplayClasses (){
        const { filterable, multiple } = this.config;
        return [ {
          [ selPrefix + '-placeholder' ]   : !this.selected.length && !filterable,
          [ selPrefix + '-selected-value' ]: this.selected.length && !multiple && !filterable,
        } ];
      },
      multiSelectedStyle (){
        return {
          position: 'relative',
          width   : !this.config.singleLineMode ? '100%' : `${this.totalTagsWidth + 200}px`, // +200 心里踏实
        }
      },
      /**
       * 输入框
       */
      inputCls (){
        return `${selPrefix}-input`;
      },

      iconCls (){
        return `${casPrefix}-arrow`;
      },

      /**
       * 单选时显示
       * @return {string}
       */
      singleDisplayValue (){
        const { multiple, renderFormat } = this.config;
        return !multiple
          ? renderFormat(this.selected[ 0 ].path.map(i => i.label))
          : '';
      },

      /**
       * 选中项显示值
       * @return {string[]}
       */
      multiDisplayValue (){
        const { multiple, renderFormat } = this.config;
        return multiple
          ? this.selected.map(i => renderFormat(i.path.map(i => i.label)))
          : []
      },
      resetSelect (){
        return this.selected.length && this.config.clearable;
      },
      inputStyle (){
        let style = {};

        if (this.config.multiple) {
          if (!this.selected.length) {
            style.width = '100%';
          } else {
            style.width = `${this.inputLength}px`;
          }
        }

        return style;
      },
    },
    methods : {
      onInputFocus (e){
        this.$emit(e.type === 'focus' ? 'on-input-focus' : 'on-input-blur');
      },
      removeTag (idx){
        const { disabled } = this.config;
        if (disabled) return false;
        this.$emit('remove', [ idx ]);
      },
      onClear (){
        this.$emit('remove', this.selected.map((i, idx) => idx));
      },
      resetInputState (){
        this.inputLength = this.$refs.input.value.length * 12 + 20;
      },
      onHeaderClick (e){
        if (this.filterable && e.target === this.$el) {
          this.$refs.input.focus();
        }
      },
    },
    watch   : {
      /**
       * 计算总宽度，适用于单行模式
       */
      selected (){
        this.totalTagsWidth = 0;
        let marginRight     = 4;
        this.$nextTick(() => {
          if (this.$refs.tags) {
            this.$refs.tags.forEach(i => this.totalTagsWidth += i.offsetWidth + marginRight)
          }
        });
      },
      query (){
        // this.$emit('query', this.query);
      },
    }
  };
</script>

<style>
  .mask {
    border-radius: 4px;
    position: absolute;
    right: 1px;
    top: 1px;
    height: calc(100% - 2px);
    width: 22px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 1));
  }
</style>
