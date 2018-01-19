<template>
  <div :class="classes" v-clickoutside="handleClose">
    <div :class="[prefixCls + '-rel']" @click="toggleOpen" ref="reference">
      <div v-if="multiple" :class="selectionCls">
        <div class="ivu-tag ivu-tag-checked" v-for="(item, index) in multiDisplayRender">
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
            @click="handleFocus">{{ singleDisplayRender }}
        </div>
      </template>

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
          ></Caspanel>
          <div :class="[prefixCls + '-dropdown']" v-show="filterable && query !== '' && querySelections.length">
            <ul :class="[selectPrefixCls + '-dropdown-list']">
              <li
                  :class="[
                    selectPrefixCls + '-item',
                    {[selectPrefixCls + '-item-disabled']: item.disabled}
                  ]"
                  v-for="(item, index) in querySelections"
                  @click="handleSelectItem(index)" v-html="item.display"
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
  import clickoutside from '../../../directives/clickoutside';
  import TransferDom from '../../../directives/transfer-dom';
  import { oneOf, deepCopy, treeRes2cascaderRes, treeRemoveItem } from '../../../utils/assist';
  import Emitter from '../../../mixins/emitter';

  const prefixCls = 'ivu-cascader';
  const selectPrefixCls = 'ivu-select';

  export default {
    name: 'Cascader',
    mixins: [ Emitter ],
    components: { Drop, Caspanel },
    directives: { clickoutside, TransferDom },
    props: {
      data: {
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
          return oneOf(value, [ 'small', 'large' ]);
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
        selected: this.value,
        query: '',
        // data的stringify
        stringifyData: '',
        inputLength: 20
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

        return this.selected.map(item => {
          let labels = [];
          for (let path of item) {
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
        if (!this.multiple) return this.data;

        let duplicate = deepCopy(this.data);
        this.selected.forEach(item => {
          let len = item.length;
          if (len > 0 && item[ len - 1 ].value) {
            duplicate = treeRemoveItem(duplicate, item[ len - 1 ].value, 'value');
          }
        })

        return duplicate;
      },
      // 过滤后的选项
      querySelections() {
        let selections = [];

        function getSelections(arr, label, value) {
          for (let i = 0; i < arr.length; i++) {
            let item = arr[ i ];

            item.__label = label ? label + ' / ' + item.label : item.label;
            item.__value = value ? value + ',' + item.value : item.value;

            if (item.children && item.children.length) {
              selections.push({
                label: item.__label,
                value: item.__value,
                display: item.__label,
                item: item,
                disabled: !!item.disabled
              });
              getSelections(item.children, item.__label, item.__value);
              delete item.__label;
              delete item.__value;
            } else {
              selections.push({
                label: item.__label,
                value: item.__value,
                display: item.__label,
                item: item,
                disabled: !!item.disabled
              });
            }
          }
        }

        getSelections(this.casPanelOpts);
        selections = selections.filter(item => item.label.indexOf(this.query) > -1).map(item => {
          item.display = item.display.replace(new RegExp(this.query, 'g'), `<span>${this.query}</span>`);
          return item;
        });
        return selections;
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

        this.$emit('on-change', this.selected);
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
      },
      /**
       * 【单选】设置选中项
       * @param item
       */
      setSingleSelected(item) {
        this.selected.splice(0, this.selected.length, ...treeRes2cascaderRes(this.casPanelOpts, item.value, 'value'));
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
        let treePath = [];
        {
          // 找到item对应的tree路径path
          treePath = treeRes2cascaderRes(this.casPanelOpts, item.value, 'value');
          if (!treePath.length) return;
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
          this.selected.push(treePath);
        }
        {
          // item的兄弟节点全部选中，则合并
          let combine = (newItemPath) => {
            // 根节点不合并
            if (newItemPath.length === 1) return;

            // 父节点的所有子节点（即item同一级的所有节点）
            let parentChildren = treePath[ treePath.length - 2 ].children;
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
              this.setMultiSelected(treePath[ treePath.length - 2 ]);
            }
          }

          combine(treePath);
        }
      },
      resetInputState() {
        this.inputLength = this.$refs.input.value.length * 12 + 20;
      },
    },
    created() {
      this.stringifyData = JSON.stringify(this.data);
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
      visible(val) {
        if (val) {
          if (this.multiple) {
            this.$refs.input.focus();
          } else {
            if (this.selected.length) {
              this.updateSelected();
            }
            if (this.transfer) {
              this.$refs.drop.update();
            }
          }
        } else {
          if (this.filterable) {
            this.query = '';
            this.$refs.input.currentValue = '';
          }
          if (this.transfer) {
            this.$refs.drop.destroy();
          }
        }
      },
      value(val) {
        this.selected = val;
        if (!val.length) this.selected = [];
      },
      selected() {
        this.$emit('input', this.selected);

        this.updateSelected(true); // todo: 如果是prop修改，则通知子组件（两种情况：prop和用户选择）
      },
      data: {
        deep: true,
        handler() {
          const stringifyData = JSON.stringify(this.data);
          if (stringifyData !== this.stringifyData) {
            this.stringifyData = stringifyData;
            this.$nextTick(() => this.updateSelected());
          }
        }
      }
    }
  };
</script>
