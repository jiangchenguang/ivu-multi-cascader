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
            :class="[prefixSelCls + '-input']"
            :style="inputStyle"
            :placeholder="filterable && !multiSelected.length ? placeholder : ''"
            autocomplete="off"
            spellcheck="false"
            @keydown="resetInputState"
        >
      </div>
      <div v-else>
        <i-input
            ref="input"
            :element-id="elementId"
            :readonly="!filterable"
            :disabled="disabled"
            :value="displayInputRender"
            @on-change="handleInput"
            :size="size"
            :placeholder="filterable && !singleSelected.length ? placeholder : ''"
        ></i-input>
        <div
            :class="[prefixCls + '-label']"
            v-show="filterable && query === ''"
            @click="handleFocus">{{ singleDisplayRender }}
        </div>
      </div>

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
              :change-on-select="changeOnSelect"
          ></Caspanel>
          <div :class="[prefixCls + '-dropdown']" v-show="filterable && query !== '' && querySelections.length">
            <ul :class="[selectPrefixCls + '-dropdown-list']">
              <li
                  :class="[selectPrefixCls + '-item', {
                                    [selectPrefixCls + '-item-disabled']: item.disabled
                                }]"
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
  const prefixSelCls = 'ivu-select';

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
      name: {
        type: String
      },
      elementId: {
        type: String
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
        prefixSelCls: prefixSelCls,
        visible: false,
        // 【单选】选中项 字符串数组
        singleSelected: this.value,
        // 【多选】选中项 数组的数组
        multiSelected: [],
        query: '',
        validDataStr: '',
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
            [ `${prefixSelCls}-multiple` ]: this.multiple,
          }
        ];
      },
      selectionCls() {
        return {
          [ `${prefixSelCls}-selection` ]: this.multiple,
        }
      },
      // 什么时候显示清空按钮
      showCloseIcon() {
        return this.singleSelected && this.singleSelected.length && this.clearable && !this.disabled;
      },
      // 【单选】选中项可视化
      singleDisplayRender() {
        let label = [];
        this.singleSelected.forEach(item => {
          label.push(item.label);
        });

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
        });

        return r;
      },
      // 输入框显示
      displayInputRender() {
        return this.filterable ? '' : this.singleDisplayRender;
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

      inputStyle() {
        let style = {};

        if (this.multiple) {
          if (this.multiSelected.length === 0) {
            style.width = '100%';
          } else {
            style.width = `${this.inputLength}px`;
          }
        }

        return style;
      },

    },
    methods: {
      /**
       * 单选清空
       * @returns {boolean}
       */
      clearSelect() {
        if (this.disabled) return false;

        const oldVal = JSON.stringify(this.singleSelected);
        this.singleSelected.splice(0, this.singleSelected.length);
        this.handleClose();
        this.emitValue(this.singleSelected, oldVal);

        // this.broadcast('Caspanel', 'on-clear');  // todo: 选中项高亮
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
        if (!this.singleSelected.length) {

          // this.broadcast('Caspanel', 'on-clear');  // todo: 选中项高亮
        }
      },

      /**
       * 通知panel高亮选中项
       * @param init
       */
      updateSelected(init = false) {
        // todo: 选中项高亮
        // if (!this.changeOnSelect || init) {
        //   this.broadcast('Caspanel', 'on-find-selected', {
        //     value: this.singleSelected
        //   });
        // }
      },
      /**
       * emit消息
       * @param val
       * @param oldVal
       */
      emitValue(val, oldVal) {
        if (JSON.stringify(val) === oldVal) return;

        this.$emit('on-change', this.multiple ? this.multiSelected : this.singleSelected);
      },
      handleInput(event) {
        this.query = event.target.value;
      },
      // 选中一个过滤项
      handleSelectItem(index) {
        const item = this.querySelections[ index ];
        console.log('select one item:', item);
        if (item.item.disabled) return false;

        // 清空输入
        this.query = '';
        this.$refs.input.currentValue = '';

        const oldVal = JSON.stringify(this.multiple ? this.multiSelected : this.singleSelected);

        this.multiple ? this.setMultiSelected(item.item) : this.setSingleSelected(item.item);

        // todo: 复选的通知外面
        this.emitValue(this.singleSelected, oldVal);

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
      /**
       * 移除一个多选
       * @param index
       * @returns {boolean}
       */
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
      /**
       * 【单选】设置选中项
       * @param item
       */
      setSingleSelected(item) {
        this.singleSelected = treeRes2cascaderRes(this.casPanelOpts, item.value, 'value');
      },
      /**
       * 【多选】设置选中项
       * @param item
       */
      setMultiSelected(item) {
        let treePath = [];
        {
          // 找到item对应的tree路径path
          treePath = treeRes2cascaderRes(this.casPanelOpts, item.value, 'value');
          if (!treePath.length) return;
        }
        {
          // todo：去除multiSelected中如果是item的子项
        }
        {
          // 添加path
          this.multiSelected.push(treePath);
        }
      },

      resetInputState() {
        this.inputLength = this.$refs.input.value.length * 12 + 20;
      },
    },
    created() {
      this.validDataStr = JSON.stringify(this.getValidData(this.data));
      this.$on('on-selected', item => {
        console.log('on-selected:', item, this.multiple);

        this.multiple ? this.setMultiSelected(item) : this.setSingleSelected(item);

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
            if (this.singleSelected.length) {
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
        this.singleSelected = val;
        if (!val.length) this.singleSelected = [];
      },
      singleSelected() {
        this.$emit('input', this.singleSelected);

        this.updateSelected(true); // todo: 如果是prop修改，则通知子组件（两种情况：prop和用户选择）
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
