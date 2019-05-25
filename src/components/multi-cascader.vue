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
    <transition name="slide-up">
      <Drop
          v-show="visible"
          :class="dropCls"
          ref="drop"
          :data-transfer="transfer"
          v-transfer-dom>
        <div>
          <CascadePanel
              v-show="!config.filterable || (config.filterable && query === '')"
              :option-list="options"
              :pathDeep="0"
              :config="config"
          ></CascadePanel>
        </div>
      </Drop>
    </transition>
  </div>
</template>

<script>
  import { Config, OptionNode, SelectedPath } from '@/clazz';
  import SelectHead from './select-head';
  import CascadePanel from './cascade-panel';
  import Drop from './dropdown.vue';
  import { selPrefix, casPrefix } from "@/share";

  export default {
    components: {
      CascadePanel,
      Drop,
      SelectHead
    },
    data (){
      let options = [];
      options.push(this.genOptionNode('label-0', 'value-0', [
        this.genOptionNode('label-01', 'value-01', [], true),
        this.genOptionNode('label-02', 'value-02', [], true)
      ], true));
      options.push(this.genOptionNode('label-1', 'value-1', []));
      console.log('options:', options);

      let selected = [];
      selected.push(this.genSelectedPath(2));

      return {
        visible: true,
        query  : '',
        config : new Config(true, false, false, false, false, label => label.join(this.separator), '/',),
        selected,
        options,
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
