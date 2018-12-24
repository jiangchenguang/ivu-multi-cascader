<template>
  <span>
    <ul v-if="groupMergedOptions" :class="[prefixCls + '-menu']">
      <div v-if="allSelectable && multiple && !onlyLeaf"
              @click.stop="onClickSelectAll"
              shape="circle"
              size="small"
              type="info"
              class="all-select-btn"
      >全选</div>
      <template v-for="item in groupMergedOptions">
        <template v-if="!!item.isGroup">
          <option-group :label="item.label">
            <OptionItem v-for="option of item.optionList"
                        v-if="!option.selected"
                        :key="getKey()"
                        :prefix-cls="prefixCls"
                        :data="option"
                        :tmp-item="tmpItem"
                        @click.native.stop="handleClickItem(option)"
                        @mouseenter.native.stop="handleHoverItem(option)"
            >
            </OptionItem>
          </option-group>
        </template>
        <template v-else>
            <OptionItem :key="getKey()"
                        :prefix-cls="prefixCls"
                        :data="item"
                        :tmp-item="tmpItem"
                        @click.native.stop="handleClickItem(item)"
                        @mouseenter.native.stop="handleHoverItem(item)"
            >
            </OptionItem>
        </template>
      </template>
    </ul>
    <OptionPanel v-if="sublistShow"
                 :data="sublist"
                 :pathDeep="pathDeep + 1"
                 :prefix-cls="prefixCls"
                 :disabled="disabled"
                 :multiple="multiple"
                 :onlyLeaf="onlyLeaf"
                 :all-selectable="allSelectable"
    ></OptionPanel>
  </span>
</template>
<script>
  import OptionItem from './option-item.vue';
  import OptionGroup from "./option-group";
  import Emitter from '@/mixins/emitter';
  import {
    isDef,
    isUndef,
    findComponentUpward,
    findComponentDownward
  } from '@/utils/assist';

  let key = 1;

  export default {
    name      : 'OptionPanel',
    mixins    : [ Emitter ],
    components: { OptionItem, OptionGroup },
    props     : {
      /**
       * 选项列表
       */
      data         : {
        type: Array,
        default (){
          return [];
        }
      },
      allSelectable: {
        type   : Boolean,
        default: false
      },
      multiple     : {
        type   : Boolean,
        default: false
      },
      onlyLeaf     : {
        type   : Boolean,
        default: false,
      },
      // 当前panel的路径深度
      pathDeep     : {
        type    : Number,
        required: true,
      },
      disabled     : Boolean,
      prefixCls    : String
    },
    data (){
      return {
        // 临时保存当前选中项
        tmpItem    : {},
        // 当panel级联层次太多，用于组装并向上抛消息
        result     : [],
        // 子选项
        sublist    : [],
        sublistShow: false,
      };
    },
    computed  : {
      /**
       * 合并相同分组后的选项
       * @return {Array}
       */
      groupMergedOptions (){
        let groupMap           = new Map();
        let groupMergedOptions = [];

        {
          // 遍历选项，将相同group的选项进行分组
          for (let option of this.data) {
            if (!!option.selected) {
              continue;
            }
            if (isUndef(option.group) || !option.group.trim().length) {
              // 无group属性，直接放到结果中
              groupMergedOptions.push(option);
            } else {
              // 有group属性，先进行分类
              let optionList = groupMap.get(option.group);
              if (isUndef(optionList)) {
                groupMap.set(option.group, [ option ]);
              } else {
                optionList.push(option);
              }
            }
          }
        }

        {
          // 整体分组的选项
          let groupOptions = [];
          for (let [ key, optionList ] of groupMap.entries()) {
            groupOptions.push({
              isGroup   : true,
              label     : key,
              optionList: optionList
            })
          }
          groupMergedOptions.unshift(...groupOptions);
        }

        return groupMergedOptions;
      }
    },
    watch     : {
      data (){
        this.sublist = [];
      },
    },
    methods   : {
      /**
       * 点击全选
       */
      onClickSelectAll (){
        for (let item of this.groupMergedOptions) {
          if (item.isGroup) {
            for (let option of item.optionList) {
              this.handleSelectAll(option);
            }
          } else {
            this.handleSelectAll(item);
          }
        }
      },

      // 点击表示选中一个选项
      handleClickItem (item){
        if (this.onlyLeaf && item.children && item.children.length > 0) return;

        this.handleTriggerItem(item, false, true);
      },
      // hover展示子选项
      handleHoverItem (item){
        this.dispatch('MultiCascader', 'on-hover', {
          pathDeep: this.pathDeep,
          item,
        })

        this.sublist     = item.children && item.children.length ? item.children : [];
        this.sublistShow = item.children && item.children.length;
      },
      // 用户选中选项
      handleTriggerItem (item, fromInit = false, fromUser = false){
        if (item.disabled) return;

        this.dispatch('MultiCascader', 'on-selected', {
          type: 1,
          item
        });
      },
      handleSelectAll (item){
        if (item.disabled) return;

        this.dispatch('MultiCascader', 'on-selected', {
          type    : 2,
          item,
          pathDeep: this.pathDeep
        });
      },
      getKey (){
        return key++;
      }
    },
    mounted (){
      this.$on('on-find-selected', (params) => {
        const val = params.value;
        let value = [ ...val ];
        for (let i = 0; i < value.length; i++) {
          for (let j = 0; j < this.data.length; j++) {
            if (value[ i ] === this.data[ j ].value) {
              this.handleTriggerItem(this.data[ j ], true);
              value.splice(0, 1);
              this.$nextTick(() => {
                this.broadcast('OptionPanel', 'on-find-selected', {
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
          const OptionPanel = findComponentDownward(this, 'OptionPanel');
          if (OptionPanel) {
            OptionPanel.$emit('on-clear', true);
          }
        }
      });
    },
  };
</script>

<style>
  .all-select-btn {
    margin: 0 4px 4px;
    height: 18px;
    width: calc(100% - 8px);
    background-color: #ccc;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
  }
  .all-select-btn:hover {
    background-color: lightblue;
  }
</style>
