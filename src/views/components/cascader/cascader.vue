<template>
  <div :class="classes" v-clickoutside="handleClose">
    <div :class="[prefixCls + '-rel']" @click="toggleOpen" ref="reference">
      <div v-if="multiple" :class="selectionCls" ref="wrapper" style="overflow: hidden;">
        <div :style="selectWrapperStyle">
          <div class="ivu-tag ivu-tag-checked" v-for="(item, index) in multiDisplayRender" ref="selected">
            <span class="ivu-tag-text">{{ item }}</span>
            <Icon type="ios-close-empty" @click.native.stop="removeTag(index)"></Icon>
          </div>
          <input
              ref="input"
              type="text"
              v-model="query"
              :readonly="!filterable"
              :disabled="disabled"
              :class="[selectPrefixCls + '-input']"
              :style="inputStyle"
              :placeholder="filterable && !selected.length ? placeholder : ''"
              autocomplete="off"
              spellcheck="false"
              @keydown="resetInputState"
          >
        </div>
      </div>
      <template v-else>
        <i-input
            ref="input"
            :readonly="!filterable"
            :disabled="disabled"
            :value="this.filterable ? '' : this.singleDisplayRender"
            @on-change="handleInput"
            :size="size"
            :placeholder="filterable && !selected.length ? placeholder : ''"
        ></i-input>
        <div
            :class="[prefixCls + '-label']"
            v-show="filterable && query === ''"
            @click="handleFocus"
        >
          {{ singleDisplayRender }}
        </div>
      </template>

      <div class="mask"></div>
      <Icon type="ios-close"
            :class="[prefixCls + '-arrow']"
            v-show="showCloseIcon"
            @click.native.stop="clearSelect"
      ></Icon>
      <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
    </div>

    <transition name="slide-up">
      <Drop
          v-show="visible"
          :class="{ [prefixCls + '-transfer']: transfer }"
          ref="drop"
          :data-transfer="transfer"
          v-transfer-dom>
        <div>
          <Caspanel
              v-show="!filterable || (filterable && query === '')"
              ref="caspanel"
              :prefix-cls="prefixCls"
              :data="casPanelOpts"
              :disabled="disabled"
              :onlyLeaf="onlyLeaf"
          ></Caspanel>
          <div :class="[prefixCls + '-dropdown']" v-show="filterable && query !== '' && querySelections.length">
            <ul :class="[selectPrefixCls + '-dropdown-list']">
              <li
                  :class="[
                    selectPrefixCls + '-item',
                    {[selectPrefixCls + '-item-disabled']: item.disabled}
                  ]"
                  v-for="(item, index) in querySelections"
                  @click="handleSelectItem(index)" v-html="item.label"
              ></li>
            </ul>
          </div>
          <ul v-show="filterable && query !== '' && !querySelections.length" :class="[prefixCls + '-not-found-tip']">
            <li>{{ notFoundText }}</li>
          </ul>
        </div>
      </Drop>
    </transition>
  </div>
</template>

<script>
  import Drop from './dropdown.vue';
  import Caspanel from './caspanel.vue';
  import clickoutside from '@/directives/clickoutside';
  import TransferDom from '@/directives/transfer-dom';
  import { dom, assist } from '@/utils';
  import Emitter from '@/mixins/emitter';

  const prefixCls = 'ivu-cascader';
  const selectPrefixCls = 'ivu-select';

  export default {
    name: 'Cascader',
    mixins: [ Emitter ],
    components: { Drop, Caspanel },
    directives: { clickoutside, TransferDom },
    props: {
      options: {
        type: Array,
        default() {
          return [];
        }
      },
      value: {
        type: Array,
        default() {
          return [];
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      clearable: {
        type: Boolean,
        default: true
      },
      size: {
        validator(value) {
          return assist.oneOf(value, [ 'small', 'large' ]);
        }
      },
      renderFormat: {
        type: Function,
        default(label) {
          return label.join(' / ');
        }
      },
      filterable: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: '请选择',
      },
      notFoundText: {
        type: String,
        default: '无匹配内容',
      },
      transfer: {
        type: Boolean,
        default: false
      },
      multiple: {
        type: Boolean,
        default: false
      },
      onlyLeaf: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        prefixCls: prefixCls,
        selectPrefixCls: selectPrefixCls,
        visible: false,
        /**
         * 选中项
         * 【单选】路径上item的集合
         * 【多选】每个元素都是对应单选的一个结果
         */
        selected: [],
        // 选项总长度
        selectTotalLen: 0,
        // 多选时选项左移
        selectScroll: 0,
        query: '',
        // data的stringify
        stringifyData: '',
        inputLength: 20,
      };
    },
    computed: {
      classes() {
        return [
          `${prefixCls}`,
          {
            [ `${prefixCls}-show-clear` ]: this.showCloseIcon,
            [ `${prefixCls}-size-${this.size}` ]: !!this.size,
            [ `${prefixCls}-visible` ]: this.visible,
            [ `${prefixCls}-disabled` ]: this.disabled,
            [ `${prefixCls}-not-found` ]: this.filterable && this.query !== '' && !this.querySelections.length,
            [ `${selectPrefixCls}-multiple` ]: this.multiple,
          }
        ];
      },
      selectionCls() {
        return {
          [ `${selectPrefixCls}-selection` ]: this.multiple,
        }
      },
      selectWrapperStyle() {
        return {
          position: 'relative',
          width: `${this.selectTotalLen + 500}px`,
        }
      },
      // 显示清空按钮
      showCloseIcon() {
        return this.clearable
          && !this.disabled
          && this.selected
          && this.selected.length
      },
      // 【单选】选中项可视化
      singleDisplayRender() {
        if (this.multiple) return '';

        return this.renderFormat(this.selected.map(i => i.label));
      },
      // 【多选】选中项可视化
      multiDisplayRender() {
        if (!this.multiple) return [];

        return this.selected.map(itemPath => {
          let labels = [];
          for (let path of itemPath) {
            labels.push(path.label);
          }
          return this.renderFormat(labels);
        })
      },
      /**
       * 动态选项
       * 【单选】直接使用data
       * 【多选】排除已选
       */
      casPanelOpts() {
        if (!this.multiple) return this.options;

        let duplicate = assist.deepCopy(this.options);
        this.selected.forEach(item => {
          let len = item.length;
          if (len > 0 && item[ len - 1 ].value) {
            assist.treeRemoveItem(duplicate, item[ len - 1 ].value, 'value');
          }

          if (this.onlyLeaf) {
            // 【只能选择叶子节点】子节点都被选择的话，就移除父节点
            let currNode = len - 1;
            while (currNode > 0) {
              if (!item[ currNode - 1 ].children || item[ currNode - 1 ].children.length !== 1) break;

              assist.treeRemoveItem(duplicate, item[ currNode - 1 ].value, 'value');
              currNode--;
            }
          }
        })

        return duplicate;
      },
      // 过滤后的选项
      querySelections() {
        let selections = [];

        function getSelections(onlyLeaf, arr, label, value) {
          for (let i = 0; i < arr.length; i++) {
            let item = arr[ i ];

            item.__label = label ? label + ' / ' + item.label : item.label;
            item.__value = value ? value + ',' + item.value : item.value;

            if (item.children && item.children.length) {
              if (!onlyLeaf) {
                selections.push({
                  label: item.__label,
                  value: item.__value,
                  item: item,
                  disabled: !!item.disabled
                });
              }
              getSelections(onlyLeaf, item.children, item.__label, item.__value);
            } else {
              selections.push({
                label: item.__label,
                value: item.__value,
                item: item,
                disabled: !!item.disabled
              });
            }
          }
        }

        getSelections(this.onlyLeaf, assist.deepCopy(this.casPanelOpts));

        selections = selections.filter(item => {
          return item.label.indexOf(this.query) > -1
            || item.value.indexOf(this.query) > -1;
        });

        return selections.map(item => {
          item.label = item.label.replace(new RegExp(this.query, 'g'), `<span>${this.query}</span>`);
          return item;
        });
      },
      inputStyle() {
        let style = {};

        if (this.multiple) {
          if (this.selected.length === 0) {
            style.width = '100%';
          } else {
            style.width = `${this.inputLength}px`;
          }
        }

        return style;
      },
    },
    methods: {
      handleClose() {
        this.visible = false;
      },
      toggleOpen() {
        if (this.disabled) return false;

        if (this.visible) {
          if (!this.filterable) this.handleClose();
        } else {
          this.onFocus();
        }
      },
      onFocus() {
        this.visible = true;
        if (!this.selected.length) {
          // this.broadcast('Caspanel', 'on-clear');  // todo: 选中项高亮
        }
      },
      /**
       * 通知panel高亮选中项
       * @param init
       */
      updateSelected(init = false) {
        // todo: 选中项高亮
        // if (init) {
        //   this.broadcast('Caspanel', 'on-find-selected', {
        //     value: this.selected
        //   });
        // }
      },
      /**
       * emit消息
       * @param stringifyOldSelected
       */
      emitValue(stringifyOldSelected) {
        if (JSON.stringify(this.selected) === stringifyOldSelected) return;

        this.$emit('input', this.selected);
      },
      handleInput(event) {
        this.query = event.target.value;
      },
      // 选中一个过滤项
      handleSelectItem(index) {
        const item = this.querySelections[ index ];
        if (item.item.disabled) return false;

        // 清空输入
        this.query = '';
        this.$refs.input.currentValue = '';

        this.setSelected(item.item);

        this.handleClose();
      },
      handleFocus() {
        this.$refs.input.focus();
      },
      /**
       * 清空选择
       */
      clearSelect() {
        if (this.disabled) return;

        this.removeSelected({ all: true });

        this.handleClose();
        // this.broadcast('Caspanel', 'on-clear');  // todo: 选中项高亮
      },
      /**
       * 移除一个多选
       * @param index
       * @returns {boolean}
       */
      removeTag(index) {
        if (this.disabled) return false;

        this.removeSelected({ index });

        if (this.filterable && this.visible) {
          this.$refs.input.focus();
        }

        this.broadcast('Drop', 'on-update-popper');
      },
      /**
       * 添加一个选中项
       * @param item
       */
      setSelected(item) {
        const oldVal = JSON.stringify(this.selected);

        this.multiple ? this.setMultiSelected(item) : this.setSingleSelected(item);

        this.emitValue(oldVal);

        this.keepLastSelectedVisible();
      },
      /**
       * 移除一个或全部选中项
       * @param index
       * @param all
       */
      removeSelected({ index = -1, all = false }) {
        const oldSelected = JSON.stringify(this.selected);

        if (this.multiple && index !== -1) {
          this.selected.splice(index, 1);
        } else if (all) {
          this.selected.splice(0, this.selected.length);
        }

        this.emitValue(oldSelected);

        this.keepLastSelectedVisible();
      },
      /**
       * 保证最后一个可见
       */
      keepLastSelectedVisible() {
        // 单选不滚动
        if (!this.multiple) return;

        this.$nextTick(() => {
          let wrapperWidth = dom.getContentWidth(this.$refs.wrapper);
          let len = this.$refs.selected.length;
          let last, lastRight, mr;

          if (len > 0
            && (last = this.$refs.selected[ len - 1 ])
            && (mr = parseInt(dom.getStyle(last, 'margin-right')))
            && (lastRight = last.offsetLeft + last.offsetWidth + mr)
            && lastRight >= wrapperWidth) {

            // 最后一个选项的右边已经超出了wrapper的宽度
            for (let item of this.$refs.selected) {
              // 一个选项为滚动单位
              let move = item.offsetLeft + item.offsetWidth + mr;
              if (lastRight - move < wrapperWidth) {
                this.selectScroll = move;
                break;
              }
            }
          } else {

            // 没有选择或选项没有超过wrapper的内容宽度
            this.selectScroll = 0;
          }
        })
      },
      /**
       * 【单选】设置选中项
       * @param item
       */
      setSingleSelected(item) {
        this.selected.splice(0, this.selected.length, ...assist.treeRes2cascaderRes(this.casPanelOpts, item.value, 'value'));
      },
      /**
       * 【多选】设置选中项
       * @param item
       */
      setMultiSelected(item) {
        {
          // 简单判断是否重复
          for (let it of this.selected) {
            if (it[ it.length - 1 ].value === item.value) {
              console.error('invalid item:', this.selected, item);
              return;
            }
          }
        }
        let itemPath = [];
        {
          // 找到item对应的tree路径path
          itemPath = assist.treeRes2cascaderRes(this.casPanelOpts, item.value, 'value');
          if (!itemPath.length) return;
        }
        {
          // selected中如果有item的子项，去除
          let len = this.selected.length;
          while (len > 0) {
            let idx = this.selected[ len - 1 ].findIndex(path => path.value === item.value);
            if (idx !== -1) {
              this.removeSelected({ index: len - 1 })
            }

            len--;
          }
        }
        {
          // 添加item
          this.selected.push(itemPath);
        }
        {
          // item的兄弟节点全部选中，则合并
          let combine = (newItemPath) => {
            // 根节点不合并
            if (newItemPath.length === 1) return;

            // 父节点的所有子节点（即item同一级的所有节点）
            let parentChildren = itemPath[ itemPath.length - 2 ].children;
            let allSelected = true;
            let allSelectedList = [];
            for (let child of parentChildren) {
              let idx = this.selected.findIndex(path => path[ path.length - 1 ].value === child.value);
              if (idx === -1) {
                allSelected = false;
                break;
              }
              allSelectedList.push(idx);
            }

            if (allSelected) {
              // 移除所有兄弟节点
              allSelectedList.map(index => {
                this.removeSelected({ index });
              })
              // 添加父节点
              this.setMultiSelected(itemPath[ itemPath.length - 2 ]);
            }
          }

          if (!this.onlyLeaf) combine(itemPath);
        }
      },
      /**
       * 设置输入框的长度
       */
      resetInputState() {
        this.inputLength = this.$refs.input.value.length * 12 + 20;
      },
      /**
       * 设置选中项的总长度
       */
      resetSelectTotalLen() {
        if (!this.multiple) return;

        this.$nextTick(() => {
          this.selectTotalLen = 0;

          for (let item of this.$refs.selected) {
            this.selectTotalLen += dom.getTotalWidth(item);
          }
        })
      },
    },
    created() {
      // 将prop传入的选中项 在options中找到并保存（防止传入的选项少属性）
      if (this.multiple) {
        for (let item of this.value) {
          if (item.length > 0) {
            this.setSelected(item[ item.length - 1 ]);
          }
        }
      } else {
        if (this.value.length > 0) {
          this.setSelected(this.value[ this.value.length - 1 ])
        }
      }

      this.stringifyData = JSON.stringify(this.options);
      this.$on('on-selected', item => {

        this.setSelected(item);

        if (this.filterable) {
          this.$refs.input.focus();
        }
      })
    },
    mounted() {
      // 初始化设置选中项
      this.updateSelected(true);
    },
    watch: {
      visible() {
        if (this.visible) {
          if (this.multiple) {
            this.$refs.input.focus();
            this.$refs.wrapper.scrollLeft = this.selectScroll;
          }
        } else {
          if (this.multiple) this.$refs.wrapper.scrollLeft = 0;

          if (this.filterable) {
            this.query = '';
            this.$refs.input.currentValue = '';
          }
          if (this.transfer) {
            this.$refs.drop.destroy();
          }
        }
      },
      selectScroll() {
        this.$refs.wrapper.scrollLeft = this.selectScroll;
      },
      value() {
        if (assist.isEqualArray(this.value, this.selected, false)) return;

        this.selected.splice(0, this.selected.length);

        if (this.multiple) {
          for (let item of this.value) {
            if (item.length > 0) {
              this.setSelected(item[ item.length - 1 ]);
            }
          }
        } else {
          if (this.value.length > 0) {
            this.setSelected(this.value[ this.value.length - 1 ])
          }
        }

        // todo: 如果是prop修改，则通知子组件（两种情况：prop和用户选择）
        this.updateSelected(true);
      },
      selected() {
        this.resetSelectTotalLen();
      },
      data: {
        deep: true,
        handler() {
          const stringifyData = JSON.stringify(this.options);
          if (stringifyData !== this.stringifyData) {
            this.stringifyData = stringifyData;
            this.$nextTick(() => this.updateSelected());
          }
        }
      }
    }
  };
</script>

<style>
  .mask {
    border-radius: 4px;
    position: absolute;
    right: 1px;
    top: 1px;
    height: calc(100% - 2px);
    width: 22px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 1));
  }
</style>