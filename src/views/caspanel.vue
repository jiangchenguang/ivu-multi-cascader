<template>
  <span>
    <ul v-if="data && data.length" :class="[prefixCls + '-menu']">
      <Casitem
          v-for="item in data"
          v-if="!item.selected"
          :key="getKey()"
          :prefix-cls="prefixCls"
          :data="item"
          :tmp-item="tmpItem"
          @click.native.stop="handleClickItem(item)"
          @mouseenter.native.stop="handleHoverItem(item)"
      ></Casitem>
    </ul>
    <Caspanel v-if="sublistShow"
              :data="sublist"
              :pathDeep="pathDeep + 1"
              :prefix-cls="prefixCls"
              :disabled="disabled"
              :onlyLeaf="onlyLeaf"
    ></Caspanel>
  </span>
</template>
<script>
  import Casitem from './casitem.vue';
  import Emitter from '@/mixins/emitter';
  import { findComponentUpward, findComponentDownward } from '@/utils/assist';

  let key = 1;

  export default {
    name: 'Caspanel',
    mixins: [ Emitter ],
    components: { Casitem },
    props: {
      data: {
        type: Array,
        default() {
          return [];
        }
      },
      onlyLeaf: {
        type: Boolean,
        default: false,
      },
      // 当前panel的路径深度
      pathDeep: {
        type: Number,
        required: true,
      },
      disabled: Boolean,
      prefixCls: String
    },
    data() {
      return {
        // 临时保存当前选中项
        tmpItem: {},
        // 当panel级联层次太多，用于组装并向上抛消息
        result: [],
        // 子选项
        sublist: [],
        sublistShow: false,
      };
    },
    watch: {
      data() {
        this.sublist = [];
      }
    },
    methods: {
      // 点击表示选中一个选项
      handleClickItem(item) {
        if (this.onlyLeaf && item.children && item.children.length > 0) return;

        this.handleTriggerItem(item, false, true);
      },
      // hover展示子选项
      handleHoverItem(item) {
        this.dispatch('Cascader', 'on-hover', {
          pathDeep: this.pathDeep,
          item,
        })

        this.sublist = item.children && item.children.length ? item.children : [];
        this.sublistShow = item.children && item.children.length;
      },
      // 用户选中选项
      handleTriggerItem(item, fromInit = false, fromUser = false) {
        if (item.disabled) return;

        this.dispatch('Cascader', 'on-selected', item);
      },
      getKey() {
        return key++;
      }
    },
    mounted() {
      this.$on('on-find-selected', (params) => {
        const val = params.value;
        let value = [ ...val ];
        for (let i = 0; i < value.length; i++) {
          for (let j = 0; j < this.data.length; j++) {
            if (value[ i ] === this.data[ j ].value) {
              this.handleTriggerItem(this.data[ j ], true);
              value.splice(0, 1);
              this.$nextTick(() => {
                this.broadcast('Caspanel', 'on-find-selected', {
                  value: value
                });
              });
              return false;
            }
          }
        }
      });
      // deep for #1553
      this.$on('on-clear', (deep = false) => {
        this.sublist = [];
        this.tmpItem = {};
        if (deep) {
          const Caspanel = findComponentDownward(this, 'Caspanel');
          if (Caspanel) {
            Caspanel.$emit('on-clear', true);
          }
        }
      });
    },
  };
</script>
