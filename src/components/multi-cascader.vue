<template>
  <div
      :class="classes"
  >
    <div ref="reference"
         :class="selectionCls"
    >
      <SelectHead :config="config"
                  :selected="selected"
                  @remove="onRemove"
      ></SelectHead>
    </div>
  </div>
</template>

<script>
  import { Config, OptionNode, SelectedPath } from '@/clazz';
  import SelectHead from './select-head';

  const prefixCls = 'ivu-select';

  export default {
    components: {
      SelectHead
    },
    data (){
      let selected = [];
      selected.push(this.genSelectedPath(2));

      return {
        prefixCls: prefixCls,
        config   : new Config(true, false, false, false, false, label => label.join(this.separator), '/',),
        selected
      }
    },
    computed  : {
      classes (){
        return [
          `${prefixCls}`,
          {
            [ `${prefixCls}-visible` ]     : this.visible,
            [ `${prefixCls}-disabled` ]    : this.disabled,
            [ `${prefixCls}-multiple` ]    : this.multiple,
            [ `${prefixCls}-single` ]      : !this.multiple,
            [ `${prefixCls}-show-clear` ]  : this.showCloseIcon,
            [ `${prefixCls}-${this.size}` ]: !!this.size
          }
        ];
      },
      selectionCls (){
        return {
          [ `${prefixCls}-selection` ]        : !this.autoComplete,
          [ `${prefixCls}-selection-focused` ]: this.isFocused
        };
      },
    },
    methods   : {
      onRemove (idxList){
        console.log('remove:', idxList);
        idxList.sort((a, b) => b - a);
        idxList.forEach(idx => {
          this.selected.splice(idx, 1);
        })
      },

      genOptionNode (label, value, children = [], selected = false){
        let node      = new OptionNode(label, value, "", "", "", false, children);
        node.selected = selected;
        return node;
      },

      genSelectedPath (len, valueList = []){
        let list = [];
        for (let i = 0; i < len; i++) {
          list.push(this.genOptionNode(`label-${i}`, `${valueList[ i ] ? valueList[ i ] : `value-${i}`}`));
        }

        return new SelectedPath(list);
      },
    }
  }
</script>

<style scoped>

</style>
