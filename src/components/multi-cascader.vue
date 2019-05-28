<template>
  <div :class="classes" v-clickOutside="onComponentBlur">
    <div ref="reference" :class="selectionCls" @click.stop="onClick">
      <SelectHead :config="config"
                  :selected="selected"
                  @remove="onRemove"
      ></SelectHead>
    </div>

    <transition name="slide-up">
      <Drop v-show="casPanelShow"
            :class="dropCls"
            ref="drop"
            :data-transfer="transfer"
            v-transfer-dom>
        <div>
          <CascadePanel v-show="!config.filterable || (config.filterable && query === '')"
                        :option-list="inner_option_list"
                        :pathDeep="0"
                        :config="config"
          ></CascadePanel>
        </div>
      </Drop>
    </transition>
  </div>
</template>

<script>
  import { Config, Selected } from '@/clazz';
  import SelectHead from './select-head';
  import CascadePanel from './cascade-panel';
  import Drop from './dropdown.vue';
  import { clickOutside, transferDom } from '@/directives';
  import { configMixin, optionMixin, selectedMixin } from '@/mixins';
  import { selPrefix, casPrefix } from "@/share";

  export default {
    name      : 'MultiCascader',
    directives: {
      clickOutside,
      transferDom
    },
    mixins    : [
      // configMixin,
      optionMixin,
      selectedMixin
    ],
    components: {
      CascadePanel,
      Drop,
      SelectHead
    },
    created (){
      this.initOptions();
      console.log('option selected', this.inner_option_list, this.selected);

      this.$on('select-hover-option', this.onSelectHoverOption);

      this.$on('hover-option', this.onHoverOption);
    },
    props     : {},
    data (){
      return {
        /**
         * 是否显示下拉框
         */
        casPanelShow: false,
        query       : '',
        hoverPath   : [],
        config      : new Config(true, false, false, false, false, label => label.join(this.separator), '/',),
      }
    },
    computed  : {
      classes (){
        return [
          `${casPrefix}`,
          {
            [ `${selPrefix}-disabled` ]  : this.disabled,
            [ `${selPrefix}-multiple` ]  : this.multiple,
            [ `${selPrefix}-single` ]    : !this.multiple,
            [ `${selPrefix}-show-clear` ]: this.showCloseIcon,
          }
        ];
      },

      selectionCls (){
        return {
          [ `${selPrefix}-selection` ]        : !this.autoComplete,
          [ `${selPrefix}-selection-focused` ]: this.isFocused
        };
      },

      dropCls (){
        return this.config.transfer ? `${casPrefix}-transfer` : '';
      }
    },
    methods   : {
      /**
       * 当点击选中框
       */
      onClick (){
        if (this.config.disabled) return false;

        if (!this.casPanelShow) {
          this.casPanelShow = true;
        }
      },

      /**
       * 当组件失去焦点
       */
      onComponentBlur (){
        this.casPanelShow = false;
      },

      /**
       * 当鼠标hover选项的处理函数
       * 保存当前hover选项的完整路径，如果点击的话就直接保存
       * @param payload
       */
      onHoverOption (payload){
        let { pathDeep, optionNode } = payload;
        this.hoverPath.splice(pathDeep, this.hoverPath.length - pathDeep, optionNode);
      },

      /**
       * 当点击hover的选项
       */
      onSelectHoverOption (){
        if (this.hoverPath) {
          this.selectedAdd(new Selected(this.hoverPath.slice()));
        }
      },

      onRemove (idxList){
        this.selectedDelete(idxList);
      },
    }
  }
</script>

<style scoped>

</style>
