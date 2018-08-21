<template>
  <li :class="[prefixCls + '-wrap']">
    <div :class="[prefixCls + '-title']">{{ label }}</div>
    <ul>
      <li :class="[prefixCls]">
        <slot></slot>
      </li>
    </ul>
  </li>
</template>

<script>
  const prefixCls = 'ivu-select-group';

  export default {
    name: 'OptionGroup',
    props: {
      label: {
        type: String,
        default: ''
      }
    },
    data (){
      return {
        prefixCls: prefixCls,
      };
    },
    methods: {},
    mounted (){
    }
  };
</script>

