<template>
  <div :class="classes" v-clickoutside="handleClose">
    <div class="ivu-tag ivu-tag-checked" v-for="(item, index) in multiDisplayRender">
      <span class="ivu-tag-text">{{ item }}</span>
      <Icon type="ios-close-empty" @click.native.stop="removeTag(index)"></Icon>
    </div>
    <div :class="[prefixCls + '-rel']" @click="toggleOpen" ref="reference">
      <input type="hidden" :name="name" :value="currentValue">
      <template>
        <i-input
            :element-id="elementId"
            ref="input"
            :readonly="!filterable"
            :disabled="disabled"
            :value="displayInputRender"
            @on-change="handleInput"
            :size="size"
            :placeholder="inputPlaceholder"
        ></i-input>

        <div
            :class="[prefixCls + '-label']"
            v-show="filterable && query === ''"
            @click="handleFocus">{{ singleDisplayRender }}
        </div>
        <Icon type="ios-close"
              :class="[prefixCls + '-arrow']"
              v-show="showCloseIcon"
              @click.native.stop="clearSelect"
        ></Icon>
        <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
      </template>
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
              :change-on-select="changeOnSelect"
          ></Caspanel>
          <div :class="[prefixCls + '-dropdown']" v-show="filterable && query !== '' && querySelections.length">
            <ul :class="[selectPrefixCls + '-dropdown-list']">
              <li
                  :class="[selectPrefixCls + '-item', {
                                    [selectPrefixCls + '-item-disabled']: item.disabled
                                }]"
                  v-for="(item, index) in querySelections"
                  @click="handleSelectItem(index)" v-html="item.display"></li>
            </ul>
          </div>
          <ul v-show="filterable && query !== '' && !querySelections.length" :class="[prefixCls + '-not-found-tip']">
            <li>{{ localeNotFoundText }}</li>
          </ul>
        </div>
      </Drop>
    </transition>
  </div>
</template>
<script>
  import Drop from '../select/dropdown.vue';
  import Caspanel from './caspanel.vue';
  import clickoutside from '../../../directives/clickoutside';
  import TransferDom from '../../../directives/transfer-dom';
  import { oneOf, deepCopy, treeRes2cascaderRes, treeRemoveItem } from '../../../utils/assist';
  import Emitter from '../../../mixins/emitter';
  import Locale from '../../../mixins/locale';

  const prefixCls = 'ivu-cascader';
  const selectPrefixCls = 'ivu-select';

  const prefixSelCls = 'ivu-select';

  export default {
    name: 'Cascader',
    mixins: [ Emitter, Locale ],
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
      placeholder: {
        type: String
      },
      size: {
        validator(value) {
          return oneOf(value, [ 'small', 'large' ]);
        }
      },
      changeOnSelect: {
        type: Boolean,
        default: false
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
      notFoundText: {
        type: String
      },
      transfer: {
        type: Boolean,
        default: false
      },
      name: {
        type: String
      },
      elementId: {
        type: String
      },

      // ------------------------

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
        // 【单选】选中项 一维数组
        singleSelected: [],
        // 【多选】选中项 二维数组
        multiSelected: [],
        updatingValue: false,    // to fix set value in changeOnSelect type
        // 当前选中项
        currentValue: this.value,
        query: '',
        validDataStr: '',

        // --------------------

        prefixSelCls: prefixSelCls,
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
            [ `${prefixCls}-not-found` ]: this.filterable && this.query !== '' && !this.querySelections.length
          }
        ];
      },
      // 什么时候显示清空按钮
      showCloseIcon() {
        return this.currentValue && this.currentValue.length && this.clearable && !this.disabled;
      },
      // 【单选】选中项可视化
      singleDisplayRender() {
        let label = [];
        for (let i = 0; i < this.singleSelected.length; i++) {
          label.push(this.singleSelected[ i ].label);
        }

        return this.renderFormat(label, this.singleSelected);
      },
      // 【多选】选中项可视化
      multiDisplayRender() {
        let r = [];
        this.multiSelected.forEach(item => {
          let label = [];
          for (let path of item) {
            label.push(path.label);
          }
          r.push(this.renderFormat(label));
        })

        return r;
      },
      // 输入框显示
      displayInputRender() {
        return this.filterable ? '' : this.singleDisplayRender;
      },
      localePlaceholder() {
        if (this.placeholder === undefined) {
          return this.t('i.select.placeholder');
        } else {
          return this.placeholder;
        }
      },
      inputPlaceholder() {
        return this.filterable && this.currentValue.length ? null : this.localePlaceholder;
      },
      localeNotFoundText() {
        if (this.notFoundText === undefined) {
          return this.t('i.select.noMatch');
        } else {
          return this.notFoundText;
        }
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

        getSelections(this.data);
        selections = selections.filter(item => item.label.indexOf(this.query) > -1).map(item => {
          item.display = item.display.replace(new RegExp(this.query, 'g'), `<span>${this.query}</span>`);
          return item;
        });
        return selections;
      },

      // -------------------------------

      /**
       * 提供给表单的选项
       * 【单选】单选时直接使用data
       * 【多选】复选时会去除选中的选项
       */
      casPanelOpts() {
        if (!this.multiple) return this.data;

        let duplicate = deepCopy(this.data);

        this.multiSelected.forEach(item => {
          let len = item.length;
          if (len > 0 && item[ len - 1 ].value) {
            duplicate = treeRemoveItem(duplicate, item[ len - 1 ].value, 'value');
          }
        })

        return duplicate;
      },


    },
    methods: {
      /**
       * 单选清空
       * @returns {boolean}
       */
      clearSelect() {
        if (this.disabled) return false;
        const oldVal = JSON.stringify(this.currentValue);
        this.currentValue = this.singleSelected = [];
        this.handleClose();
        this.emitValue(this.currentValue, oldVal);
        this.broadcast('Caspanel', 'on-clear');
      },
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
        if (!this.currentValue.length) {
          this.broadcast('Caspanel', 'on-clear');
        }
      },
      // 选中项变化，通知子组件
      updateSelected(init = false) {
        if (!this.changeOnSelect || init) {
          this.broadcast('Caspanel', 'on-find-selected', {
            value: this.currentValue
          });
        }
      },
      // 通知外面
      emitValue(val, oldVal) {
        if (JSON.stringify(val) !== oldVal) {
          this.$emit('on-change', this.currentValue, JSON.parse(JSON.stringify(this.singleSelected)));
          this.$nextTick(() => {
            this.dispatch('FormItem', 'on-form-change', {
              value: this.currentValue,
              selected: JSON.parse(JSON.stringify(this.singleSelected))
            });
          });
        }
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
        const oldVal = JSON.stringify(this.currentValue);
        this.currentValue = item.value.split(',');
        this.emitValue(this.currentValue, oldVal);
        this.handleClose();
      },
      handleFocus() {
        this.$refs.input.focus();
      },
      // 排除 loading 后的 data，避免重复触发 updateSelect
      getValidData(data) {
        function deleteData(item) {
          const new_item = Object.assign({}, item);
          if ('loading' in new_item) {
            delete new_item.loading;
          }
          if ('__value' in new_item) {
            delete new_item.__value;
          }
          if ('__label' in new_item) {
            delete new_item.__label;
          }
          if ('children' in new_item && new_item.children.length) {
            new_item.children = new_item.children.map(i => deleteData(i));
          }
          return new_item;
        }

        return data.map(item => deleteData(item));
      },

      //-------------------------

      removeTag(index) {
        if (this.disabled) {
          return false;
        }

        this.multiSelected.splice(index, 1);

        if (this.filterable && this.visible) {
          this.$refs.input.focus();
        }

        this.broadcast('Drop', 'on-update-popper');
      },
    },
    created() {
      this.validDataStr = JSON.stringify(this.getValidData(this.data));
      this.$on('on-selected', item => {
        console.log('on-selected:', item, this.multiple);
        if (!this.multiple) {
          this.singleSelected = treeRes2cascaderRes(this.data, item.value, 'value');
        } else {
          let treePath = [];
          {
            // 找到item对应的tree路径path
            treePath = treeRes2cascaderRes(this.data, item.value, 'value');
            if (!treePath.length) return;
          }
          {
            // todo：现在的选中项，如果是item的子项，是否需要去除
          }
          {
            // 添加path
            this.multiSelected.push(treePath);
          }
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
          if (this.currentValue.length) {
            this.updateSelected();
          }
          if (this.transfer) {
            this.$refs.drop.update();
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
        this.$emit('on-visible-change', val);
      },
      value(val) {
        this.currentValue = val;
        if (!val.length) this.singleSelected = [];
      },
      currentValue() {
        this.$emit('input', this.currentValue);
        if (this.updatingValue) {
          this.updatingValue = false;
          return;
        }
        // 修改选中项，通知子组件
        this.updateSelected(true);
      },
      data: {
        deep: true,
        handler() {
          const validDataStr = JSON.stringify(this.getValidData(this.data));
          // 如果不同说明选项更改
          if (validDataStr !== this.validDataStr) {
            this.validDataStr = validDataStr;
            this.$nextTick(() => this.updateSelected());
          }
        }
      }
    }
  };
</script>
