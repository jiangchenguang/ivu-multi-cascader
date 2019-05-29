<template>
  <div :class="classes" v-clickOutside="onComponentBlur">
    <div ref="reference" :class="selectionCls" @click.stop="onClick">
      <SelectHead :config="config"
                  :selected="selected"
                  @remove="onRemove"
      ></SelectHead>
    </div>

    <transition name="slide-up">
      <DropdownPanel ref="dropdown"
                     v-show="casPanelShow"
                     :config="config"
                     :inner_option_list="inner_option_list"
                     :query="query"
                     @user-select="onUserSelect"
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
       * 当用户点击一个选项时
       * @param {OptionNode[]} optionPath
       */
      onUserSelect (optionPath){
        // 1. 判断是否添加
        if (!this.selectedCouldAdd(optionPath)) return;

        // 2. 添加选中项
        let selected = new Selected(optionPath);
        this.selectedAdd(selected);

        // 3. 设置选项的selected标记
        let ancestorPath = this.$refs.dropdown.setSelectStatus(selected, true);

        // 4. 如果返回的路径比selectedPath短，说明合并过了，根据配置决定是否向上合并
        if (!this.config.disableMerge2parent && ancestorPath.length < selected.path.length) {
          this.selectedAdd(new Selected(ancestorPath));
        }
      },

      onRemove (idxList){
        let selectedList = this.selectedDelete(idxList);
        selectedList.forEach(i => this.$refs.dropdown.setSelectStatus(i, false));
      },
    }
  }
</script>

<style scoped>

</style>
