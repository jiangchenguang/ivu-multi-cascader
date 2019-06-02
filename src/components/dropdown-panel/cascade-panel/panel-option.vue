<template>
  <li :class="classes">
    {{ option.label }}
    <i v-if="showArrow" class="ivu-icon ivu-icon-ios-arrow-right"></i>
  </li>
</template>

<script>
  import { OptionNode } from '@/clazz';
  import { casPrefix } from "@/share";

  export default {
    name    : 'PanelOption',
    props   : {
      option: OptionNode,
    },
    data (){
      return {}
    },
    computed: {
      classes (){
        return [
          `${casPrefix}-menu-item`,
          {
            [ `${casPrefix}-menu-item-active` ]  : this.option.selected,
            [ `${casPrefix}-menu-item-disabled` ]: this.option.disabled
          }
        ];
      },
      showArrow (){
        return this.option.children.length;
      },
    }
  };
</script>
