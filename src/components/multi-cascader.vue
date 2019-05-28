<template>
  <div :class="classes" v-clickOutside="onComponentBlur">
    <div ref="reference" :class="selectionCls" @click.stop="onClick">
      <SelectHead :config="config"
                  :selected="selected"
                  @remove="onRemove"
      ></SelectHead>
    </div>

    <transition name="slide-up">
      <DropdownPanel v-show="casPanelShow"
                     :config="config"
                     :inner_option_list="inner_option_list"
                     :query="query"
                     @select="onSelect"
      >
      </DropdownPanel>
    </transition>
  </div>
</template>

<script>
  import { Config, Selected } from '@/clazz';
  import SelectHead from './select-head';
  import DropdownPanel from './dropdown-panel';
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
      DropdownPanel,
      SelectHead
    },
    created (){
      this.initOptions();
      console.log('option selected', this.inner_option_list, this.selected);
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
       * 当选择一个选项时
       * @param optionPath
       */
      onSelect (optionPath){
        this.selectedAdd(new Selected(optionPath));
      },

      onRemove (idxList){
        this.selectedDelete(idxList);
      },
    }
  }
</script>

<style scoped>

</style>
