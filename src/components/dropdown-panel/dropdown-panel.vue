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
        hoverPath: [],
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
          this.$emit('user-select', this.hoverPath.slice());
        }
      },

      /**
       * 设置选中状态
       * @param {Selected} selected
       * @param {boolean} status
       */
      setSelectStatus (selected, status){
        let lastNode = selected.lastNode();
        if (lastNode.selected ^ status) {
          lastNode.setSelected(status);
          this.setDescendantSelect(selected, status);
          return this.trySetAncestorSelect(selected, status);
        }
      },

      /**
       * 设置后代选项的选中状态
       * @param {Selected} selected
       * @param {boolean} status
       */
      setDescendantSelect (selected, status){
        selected.lastNode().children.forEach(i => doSet(i, !!status));

        /**
         * set selected flag
         * @param {OptionNode} optionNode
         * @param {boolean} status
         */
        function doSet (optionNode, status){
          if (optionNode.selected ^ status) {
            optionNode.setSelected(status);
            optionNode.children.forEach(i => doSet(i, status));
          }
        }
      },

      /**
       * 尝试设置祖先的选中状态
       * @param {Selected} selected
       * @param {boolean} status
       * @return {OptionNode[]}
       */
      trySetAncestorSelect (selected, status){
        return doSet(selected.path, !!status);

        // 递归设置父节点的选中标记
        function doSet (path, selected){
          if (path.length > 1) {
            let parentPath = path.slice(0, path.length - 1);
            let parentNode = parentPath[ parentPath.length - 1 ];

            if (
              (selected && !parentNode.selected && parentNode.isAllChildSelected()) // 父节点未选中，且子节点节点全部选中
              || (!selected && parentNode.selected && !parentNode.isAllChildSelected()) // 父节点选中，且子节点未全部选中
            ) {
              parentNode.setSelected(selected);
              return doSet(parentPath, selected);
            }
          }
          return path;
        }
      },
    }
  }
</script>

<style scoped>

</style>
