<template>
  <Drop ref="drop"
        :class="classes"
        :data-transfer="transfer"
        v-transfer-dom
  >
    <div>
      <CascadePanel v-show="!config.filterable || (config.filterable && query === '')"
                    :option-list="inner_option_list"
                    :pathDeep="0"
                    :config="config"
      ></CascadePanel>
    </div>
  </Drop>
</template>

<script>
  import CascadePanel from './cascade-panel';
  import Drop from './dropdown.vue';
  import { selPrefix, casPrefix } from "@/share";

  export default {
    name      : 'dropdownPanel',
    components: {
      CascadePanel,
      Drop,
    },
    props     : [ 'config', 'query', 'inner_option_list' ],
    data (){
      return {
        hoverPath   : [],
      };
    },
    computed  : {
      classes (){
        return this.config.transfer ? `${casPrefix}-transfer` : '';
      }
    },
    created (){
      this.$on('select-hover-option', this.onSelectHoverOption);

      this.$on('hover-option', this.onHoverOption);
    },
    methods   : {

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
          this.$emit('select', this.hoverPath.slice());
        }
      },
    }
  }
</script>

<style scoped>

</style>
