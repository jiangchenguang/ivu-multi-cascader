<template>
  <span>
    <ul v-if="optionList.length" :class="ulCls">
      <Option v-for="i of optionList"
              :key="i.value"
              :option="i"
              @click.native.stop="onClick(i)"
              @mouseenter.native.stop="onHover(i)"
      >
      </Option>
    </ul>
    <CasPanel v-if="subOptionList.length"
              :option-list="subOptionList"
              :config="config"
              :pathDeep="pathDeep + 1"
    ></CasPanel>
  </span>
</template>

<script>
  import Option from './panel-option.vue';
  import { Config, OptionNode } from '@/clazz';
  import Emitter from '@/mixins/emitter';
  import { casPrefix } from "@/share";

  export default {
    name      : 'CasPanel',
    mixins    : [ Emitter ],
    components: { Option },
    props     : {
      /**
       * 选项列表
       * @type {OptionNode[]}
       */
      optionList: {
        type: Array,
        default (){
          return [];
        }
      },
      // 当前panel的路径深度
      pathDeep  : {
        type    : Number,
        required: true,
      },
      /**
       * 配置
       */
      config    : Config,
    },
    data (){
      return {
        subOptionList: [],
      };
    },
    computed  : {
      ulCls (){
        return `${casPrefix}-menu`;
      }
    },
    watch     : {
      optionList (){
        this.subOptionList = [];
      },
    },
    methods   : {
      /**
       * click选项
       * @param {OptionNode} optionNode
       */
      onClick (optionNode){
        if (
          optionNode.disabled ||
          optionNode.selected ||
          (this.config.onlyLeaf && optionNode.children.length)
        ) return;

        this.dispatch('dropdownPanel', 'select-hover-option');
      },

      /**
       * hover选项
       * @param {OptionNode} optionNode
       */
      onHover (optionNode){
        if (optionNode.disabled) return;

        this.dispatch('dropdownPanel', 'hover-option', {
          pathDeep: this.pathDeep,
          optionNode,
        })

        this.subOptionList = optionNode.children;
      },
    },
  };
</script>

<style>
</style>
