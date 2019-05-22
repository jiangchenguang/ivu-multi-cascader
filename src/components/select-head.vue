<template>
  <div @click="onHeaderClick">
    <div v-if="config.multiple" class="ivu-tag ivu-tag-checked" v-for="(i, idx) of multiDisplayValue">
      <span class="ivu-tag-text">{{ i }}</span>
      <Icon type="ios-close-empty" @click.native.stop="removeTag(idx)"></Icon>
    </div>
    <span v-else :class="singleDisplayClasses">
      {{ singleDisplayValue }}
    </span>

    <input ref="input"
           type="text"
           v-if="config.filterable"
           v-model="query"
           :disabled="config.disabled"
           :class="[prefixCls + '-input']"
           :placeholder="config.placeholder"
           :style="inputStyle"
           autocomplete="off"
           spellcheck="false"
           @keydown="resetInputState"
           @focus="onInputFocus"
           @blur="onInputFocus"
    >
    <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-if="resetSelect" @click.native.stop="onClear"></Icon>
    <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']" v-if="!resetSelect && !config.disabled"></Icon>
  </div>
</template>
<script>
  import { Config } from '@/clazz';

  const prefixCls = 'ivu-select';

  export default {
    mixins  : [],
    props   : {
      /**
       * @type Config
       */
      config  : Config,
      /**
       * 选中项列表
       * @type {SelectedPath[]}
       */
      selected: Array,
    },
    data (){
      return {
        prefixCls  : prefixCls,
        query      : '',
        inputLength: 20,
      };
    },
    computed: {
      singleDisplayClasses (){
        const { filterable, multiple, showPlaceholder } = this.config;
        return [ {
          [ prefixCls + '-placeholder' ]   : showPlaceholder && !filterable,
          [ prefixCls + '-selected-value' ]: !showPlaceholder && !multiple && !filterable,
        } ];
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
        return !this.showPlaceholder && this.clearable;
      },
      inputStyle (){
        let style = {};

        if (this.multiple) {
          if (this.showPlaceholder) {
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
      query (){
        this.$emit('query', this.query);
      },
    }
  };
</script>
