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
  import { Config } from '@/clazz';
  import SelectHead from './select-head';
  import CascadePanel from './cascade-panel';
  import Drop from './dropdown.vue';
  import { selPrefix, casPrefix } from "@/share";
  import { genSelected, genOptionNode } from "@/../test/helper";

  export default {
    components: {
      CascadePanel,
      Drop,
      SelectHead
    },
    data (){
      let options = [];
      options.push(genOptionNode({
        label   : 'label-0',
        value   : 'value-0',
        children: [
          { label: 'label-01', value: 'value-01' },
          { label: 'label-02', value: 'value-02' }
        ]
      }));
      options.push(genOptionNode({ label: 'label-1', value: 'value-1' }));
      console.log('options:', options);

      let selected = genSelected([
          [
            { label: 'label-0', value: 'label-0', },
            { label: 'label-1', value: 'label-1', }
          ]
        ]
      );

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
    }
  }
</script>

<style scoped>

</style>
