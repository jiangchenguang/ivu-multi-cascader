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
          <OptionPanel
              v-show="!filterable || (filterable && query === '')"
              :data="casPanelOpts"
              :pathDeep="0"
              :prefix-cls="prefixCls"
              :disabled="disabled"
              :onlyLeaf="onlyLeaf"
          ></OptionPanel>
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
  import OptionPanel from './option-panel.vue';
  import clickoutside from '@/directives/clickoutside';
  import TransferDom from '@/directives/transfer-dom';
  import { dom, assist } from '@/utils';
  import Emitter from '@/mixins/emitter';
  import Interface from '@/mixins/interface';

  const prefixCls = 'ivu-cascader';
  const selectPrefixCls = 'ivu-select';

  export default {
    name: 'MultiCascader',
    mixins: [ Emitter, Interface ],
    components: { Drop, OptionPanel },
    directives: { clickoutside, TransferDom },
    props: {
      options: {
        type: Array,
        default (){
          return [];
        }
      },
      value: {
        type: Array,
        default (){
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
        validator (value){
          return assist.oneOf(value, [ 'small', 'large' ]);
        }
      },
      separator: {
        type: String,
        default: ' / ',
      },
      renderFormat: {
        type: Function,
        default (label){
          return label.join(`${this.separator}`);
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
      singleLineMode: {
        type: Boolean,
        default: false,
      },
      /**
       * 只能选中子节点（控制父节点能否被选中）
       */
      onlyLeaf: {
        type: Boolean,
        default: false,
      },
      /**
       * 是否禁用当所有子节点都选中时，自动合并成父节点的功能。
       * 也就是默认情况下，会自动合并。
       * 注：此值只有在onlyLeaf没有启用的情况下可用。
       */
      disableMerge2parent: {
        type: Boolean,
        default: false,
      },
      /**
       * 当选项是单一路径时，是否自动选中
       */
      autoSelect: {
        type: Boolean,
        default: false,
      }
    },
    data (){
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
        // 滚动相关
        // 如启用单行显示 且 选项宽度大于容器内容宽度，则会左移以显示最后一个选项，且是一个一个选项移动
        scroll: {
          // 选项总长度
          selectTotalLen: 0,
          // selected中第index个选项显示在第一个位置
          firstPosIndex: 0,
          // 具体容器滚动的长度（根据scroll）
          scrollLeft: 0,
        },
        query: '',
        // 鼠标悬浮路径
        hoverPath: [],
        // data的stringify
        stringifyOptions: '',
        inputLength: 20,
      };
    },
    computed: {
      classes (){
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
      selectionCls (){
        return {
          [ `${selectPrefixCls}-selection` ]: this.multiple,
        }
      },
      selectWrapperStyle (){
        return {
          position: 'relative',
          width: !this.singleLineMode ? '100%' : `${this.scroll.selectTotalLen + 500}px`,
        }
      },
      // 显示清空按钮
      showCloseIcon (){
        return this.clearable
          && !this.disabled
          && this.selected
          && this.selected.length
      },
      // 【单选】选中项可视化
      singleDisplayRender (){
        if (this.multiple) return '';

        return this.renderFormat(this.selected.map(i => i.label));
      },
      // 【多选】选中项可视化
      multiDisplayRender (){
        if (!this.multiple) return [];

        return this.selected.map(itemPath =>{
          let labels = [];
          for (let path of itemPath) {
            labels.push(path.label);
          }
          return this.renderFormat(labels);
        })
      },
      /**
       * 复制一份options，但根据selected为所有选中项做标记
       */
      casPanelOpts (){
        // 哪个元素选中了就做一个标记
        let makeSelected = (selectedPath, options) =>{
          let currNode = options;
          let len = selectedPath.length;
          for (let [ index, item ] of selectedPath.entries()) {
            currNode = currNode.find(i => i.value === item.value);
            if (!currNode) return;

            if (index < len - 1) currNode = currNode.children;
            else currNode.selected = true;
          }
        };
        // 是否parent所有的子节点都选中了
        let childrenAllSelected = (parentPath, options) =>{
          let currNode = null;
          for (let item of parentPath) {
            currNode = !!currNode
              ? currNode.children ? currNode.children : []
              : options;
            currNode = currNode.find(i => i.value === item.value);
            if (!currNode) return false;
          }

          return currNode.children.every(i => !!i.selected);
        };


        let optionsDup = assist.deepCopy(this.options);
        let selectedDup = assist.deepCopy(this.multiple ? this.selected : [ this.selected ]);

        selectedDup.forEach(item =>{
          makeSelected(item, optionsDup);

          if (this.onlyLeaf) {
            // 【只能选择叶子节点】子节点都被选择的话，就移除父节点
            let currNode = item.length - 1;
            while (currNode > 0) {
              let parentPath = item.slice(0, currNode);
              if (childrenAllSelected(parentPath, optionsDup)) {
                makeSelected(parentPath, optionsDup);
                currNode--;
              } else {
                break;
              }
            }
          }
        })

        return optionsDup;
      },
      // 过滤后的选项
      querySelections (){
        let selections = [];

        let getSelections = (arr, label, value, path = []) =>{
          for (let item of arr) {
            if (!!item.selected) continue;

            item.__label = label ? `${label}${this.separator}${item.label}` : item.label;
            item.__value = value ? value + item.value : item.value;
            item.__path = path.concat([ item ]);

            // todo：如果父节点disabled，则不现实，但需要显示子节点项目（没有disable的话）
            if (item.children && item.children.length) {
              if (!this.onlyLeaf) {
                selections.push({
                  label: item.__label,
                  value: item.__value,
                  path: item.__path,
                  item: item,
                  disabled: !!item.disabled
                });
              }
              getSelections(item.children, item.__label, item.__value, item.__path);
            } else {
              selections.push({
                label: item.__label,
                value: item.__value,
                path: item.__path,
                item: item,
                disabled: !!item.disabled
              });
            }
          }
        }

        getSelections(assist.deepCopy(this.casPanelOpts));

        selections = selections.filter(item =>{
          return item.label.indexOf(this.query) > -1
            || item.value.indexOf(this.query) > -1;
        });

        return selections.map(item =>{
          item.label = item.label.replace(new RegExp(this.query, 'g'), `<span>${this.query}</span>`);
          return item;
        });
      },
      inputStyle (){
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
      handleClose (){
        this.visible = false;
      },
      toggleOpen (){
        if (this.disabled) return false;

        if (!this.visible) {
          this.onFocus();
        } else {
        }
      },
      onFocus (){
        this.visible = true;
        if (!this.selected.length) {
          // this.broadcast('OptionPanel', 'on-clear');  // todo: 选中项高亮
        }
      },
      /**
       * 通知panel高亮选中项
       * @param init
       */
      updateSelected (init = false){
        // todo: 选中项高亮
        // if (init) {
        //   this.broadcast('OptionPanel', 'on-find-selected', {
        //     value: this.selected
        //   });
        // }
      },
      /**
       * emit消息
       * @param stringifyOldSelected
       */
      emitValue (stringifyOldSelected){
        if (JSON.stringify(this.selected) === stringifyOldSelected) return;

        this.$emit('input', assist.deepCopy(this.selected));
        this.$emit('on-change', assist.deepCopy(this.selected));
        this.dispatch('FormItem', 'on-form-change', assist.deepCopy(this.selected));
      },
      handleInput (event){
        this.query = event.target.value;
      },
      // 选中一个过滤项
      handleSelectItem (index){
        const item = this.querySelections[ index ];
        if (item.item.disabled) return false;

        // 清空输入
        this.query = '';
        this.$refs.input.currentValue = '';

        this.setSelected(item.path);

        this.handleClose();
      },
      handleFocus (){
        this.$refs.input.focus();
      },
      /**
       * 清空选择
       */
      clearSelect (){
        if (this.disabled) return;

        this.removeSelected({ all: true });

        this.handleClose();
        // this.broadcast('OptionPanel', 'on-clear');  // todo: 选中项高亮
      },
      /**
       * 移除一个多选
       * @param index
       * @returns {boolean}
       */
      removeTag (index){
        if (this.disabled) return false;

        this.removeSelected({ index });

        if (this.filterable && this.visible) {
          this.$refs.input.focus();
        }
      },
      /**
       * 移除一个或全部选中项
       * @param index
       * @param all
       * @param notifyOutside
       */
      removeSelected ({ index = -1, all = false }, notifyOutside = true){
        const oldSelected = JSON.stringify(this.selected);

        if (this.multiple && index !== -1) {
          this.selected.splice(index, 1);
        } else if (all) {
          this.selected.splice(0, this.selected.length);
        }

        notifyOutside && this.emitValue(oldSelected);
      },
      /**
       * 添加单个选中项
       * @param itemPath
       * @param notifyOutside
       */
      // todo: jcg 整合初始化和后期设置
      setSelected (itemPath, notifyOutside = true){
        const oldVal = JSON.stringify(this.selected);
        /**
         * 不管是prop还是用户点击都要格式化
         * 如果是prop的情况，对象可能缺少属性
         * 如果是用户点击的情况，对象可能有多余的属性
         */
        let select = this.format2OptionObjPath(itemPath);
        if (!select.length) return;

        let duplicate = assist.deepCopy(select);
        this.multiple ? this.setMultiSelected(duplicate) : this.setSingleSelected(duplicate);

        // 如果不是只能选子节点，也没有禁用向上合并时，尝试向上递归合并。
        if (!this.onlyLeaf && !this.disableMerge2parent) this.merge2Parent(duplicate);

        // 如果是单选模式，就自动关闭下拉框
        if (!this.multiple) this.handleClose();

        notifyOutside && this.emitValue(oldVal);
      },
      /**
       * userPath中的对象并非是options中对象（缺少属性或有多余的属性）
       * 根据value取options中的对象组成的对象
       */
      format2OptionObjPath (userPath){
        let selectedPath = [];
        let currNode = this.options;
        let find = true;
        for (let item of userPath) {
          currNode = currNode.find(i => i.value === item.value);
          if (currNode) {
            selectedPath.push(currNode);
            currNode = currNode.children;
          } else {
            find = false;
            break;
          }
        }

        return find ? selectedPath : [];
      },
      /**
       * 【单选】设置选中项
       * @param selectedPath
       */
      setSingleSelected (selectedPath){
        this.selected.splice(0, this.selected.length, ...selectedPath);
      },
      /**
       * 【多选】设置选中项
       * @param selectedPath
       */
      setMultiSelected (selectedPath){
        if (!selectedPath.length) return;
        {
          // todo: jcg判断item是否已经被选择
          // for (let it of this.selected) {
          //   if (it[ it.length - 1 ].value === item.value) {
          //     console.error('invalid item:', this.selected, item);
          //     return;
          //   }
          // }
        }
        {
          // 在能选到父节点的情况下，假设selected存在selectedItem的子项，去除
          if (!this.onlyLeaf) {
            this.removeChildren(selectedPath);
          }
        }
        {
          // 添加选中项
          this.selected.push(selectedPath);
        }

      },
      /**
       * selected中只要是item的后代节点，则移除
       * @param itemPath
       */
      removeChildren (itemPath){
        let isChild = (selectItem) =>{
          for (let [ deep, item ] of itemPath.entries()) {
            if (item.value !== selectItem[ deep ].value) return false;
          }
          return true;
        };

        let isLeaf = (itemPath) =>{
          // 取最后一个节点
          let last = itemPath[ itemPath.length - 1 ];
          return !last.children || !last.children.length;
        };

        // 叶子节点不存在子节点，直接返回。
        if (isLeaf(itemPath)) return;

        // 必须从后向前删除
        if (this.multiple) {
          for (let index = this.selected.length - 1; index >= 0; index--) {
            if (isChild(this.selected[ index ])) {
              this.removeSelected({ index });
            }
          }
        } else {
          if (isChild(this.selected)) {
            this.removeSelected({ index: 0 });
          }
        }
      },
      /**
       * 如果newItem的兄弟全部被选中，则合并成父节点
       */
      merge2Parent (newItemPath){
        // 是否parent所有的子节点都选中了
        let childrenAllSelected = (parentPath) =>{
          let currNode = null;
          for (let item of parentPath) {
            currNode = !!currNode
              ? currNode.children ? currNode.children : []
              : this.casPanelOpts;
            currNode = currNode.find(i => i.value === item.value);
            if (!currNode) return false;
          }

          return currNode.children.every(i => !!i.selected);
        };


        // 根节点不合并
        if (newItemPath.length === 1) return;

        // 父节点的所有子节点（即item同一级的所有节点）
        let parentPath = newItemPath.slice(0, newItemPath.length - 1);
        if (childrenAllSelected(parentPath)) {
          this.removeChildren(parentPath);
          this.setSelected(parentPath);
        }
      },

      /**
       * 判断可选项是否是单一路径，如果是的话，返回值路径，否则返回null
       * 【单一路径】:可选项都只有1个，且子选项也是
       */
      isSinglePath (options){
        let valuePath = [];
        let opt = options;

        while (assist.isDef(opt)) {
          if (opt.length === 0) {
            return valuePath;
          } else if (opt.length === 1 && assist.isDef(opt[ 0 ][ "value" ])) {
            valuePath.push({ value: opt[ 0 ][ "value" ] });
            opt = opt[ 0 ][ "children" ];
          } else {
            return null;
          }
        }
        return valuePath;
      },

      /**
       * 设置输入框的长度
       */
      resetInputState (){
        this.inputLength = this.$refs.input.value.length * 12 + 20;
      },
      /**
       * 设置选中项的总长度
       */
      resetSelectTotalLen (){
        if (!this.multiple || !this.singleLineMode) return;

        this.$nextTick(() =>{
          this.scroll.selectTotalLen = 0;

          for (let item of this.$refs.selected) {
            this.scroll.selectTotalLen += dom.getTotalWidth(item);
          }
        })
      },
      /**
       * 根据选项长度自动确定一个值，使得最后一个选项可见
       */
      selectScrollAuto (){
        // [单选][多行模式]直接返回
        if (!this.multiple || !this.singleLineMode) return;

        this.$nextTick(() =>{
          let wrapperWidth = dom.getContentWidth(this.$refs.wrapper);
          let len, last, lastRight, mr;

          if (this.$refs.selected
            && (len = this.$refs.selected.length)
            && len > 0
            && (last = this.$refs.selected[ len - 1 ])
            && (mr = parseInt(dom.getStyle(last, 'margin-right')))
            && (lastRight = last.offsetLeft + last.offsetWidth + mr)
            && lastRight >= wrapperWidth) {
            /**
             * 若初始value为空，此时$refs没有selected属性，而不是空数组
             * selected不为空
             * 最后一个选项的右边界 超过 包围框内容区
             */
            for (let [ index, item ] of this.$refs.selected.entries()) {
              // 一个选项为滚动单位
              let scrollLeft = item.offsetLeft + item.offsetWidth + mr;
              if (lastRight - scrollLeft < wrapperWidth) {
                this.scroll.firstPosIndex = index + 1;
                break;
              }
            }
          } else {
            // 未超过的情况
            this.scroll.firstPosIndex = 0;
          }
        })
      },
      /**
       * 选项滚动（向左或向右）
       * @param scrollLeft
       */
      selectedScroll (scrollLeft = true){
        if (scrollLeft && this.scroll.firstPosIndex > 0) {
          this.scroll.firstPosIndex--;
        } else if (!scrollLeft && this.scroll.firstPosIndex < this.$refs.selected.length - 1) {
          this.scroll.firstPosIndex++;
        }
      },
      /**
       * 处理按键
       * @param e
       */
      handleKeyDown (e){
        if (this.visible) {
          switch (e.keyCode) {
            case 37:
              // arrow left
              e.preventDefault();
              this.selectedScroll(true);
              break;
            case 39:
              // arrow right
              e.preventDefault();
              this.selectedScroll(false);
              break;
          }
        }
      },
    },
    created (){
      this.stringifyOptions = JSON.stringify(this.options);

      let ifNotice = false;
      /**
       * 启用自动选择，且用户没有设置默认值，尝试自动设置
       */
      if (this.autoSelect && this.value.length === 0) {
        let valuePath = this.isSinglePath(this.options);
        if (assist.isDef(valuePath) && valuePath.length > 0) {
          this.multiple ? this.value.push(valuePath) : this.value.push(...valuePath);
          ifNotice = true;
        }
      }

      // 将prop传入的选中项 在options中找到并保存（防止传入的选项少属性）
      if (this.multiple) {
        for (let item of this.value) {
          if (item.length > 0) {
            this.setSelected(item, ifNotice);
          }
        }
      } else {
        if (this.value.length > 0) {
          this.setSelected(this.value, ifNotice)
        }
      }

      this.$on('on-selected', item =>{
        this.setSelected(this.hoverPath);

        if (this.filterable) {
          this.$refs.input.focus();
        }
      });

      this.$on('on-hover', para =>{
        let { pathDeep, item } = para;
        this.hoverPath.splice(pathDeep, this.hoverPath.length - pathDeep, item);
      })
    },
    mounted (){
      // 初始化设置选中项
      this.updateSelected(true);
      document.addEventListener('keydown', this.handleKeyDown);
    },
    beforeDestroy (){
      document.removeEventListener('keydown', this.handleKeyDown);
    },
    watch: {
      visible (){
        if (this.visible) {
          if (this.multiple) {
            this.$refs.input.focus();

            this.$refs.wrapper.scrollLeft = this.scroll.scrollLeft;
            this.selectScrollAuto(); // 防止用户移动过
          }

          if (this.transfer) {
            this.$refs.drop.update();
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
      'scroll.scrollLeft': function (){
        this.$refs.wrapper.scrollLeft = this.scroll.scrollLeft;
      },
      'scroll.firstPosIndex': function (){
        if (this.scroll.firstPosIndex < 0
          || this.scroll.firstPosIndex > this.$refs.selected.length) return;

        if (this.scroll.firstPosIndex === 0) {
          this.scroll.scrollLeft = 0;
        } else {
          let item = this.$refs.selected[ this.scroll.firstPosIndex - 1 ];
          let mr = parseInt(dom.getStyle(item, 'margin-right'));
          this.scroll.scrollLeft = item.offsetLeft + item.offsetWidth + mr;
        }
      },
      selected (){
        this.selectScrollAuto();
        this.resetSelectTotalLen();
      },
      value (){
        // 根据value判断是相同的数组，直接返回
        if (assist.isEqualArray(this.selected, this.value)) return;
        this.removeSelected({ all: true }, false);

        if (this.multiple) {
          for (let item of this.value) {
            if (item.length > 0) {
              this.setSelected(item, false);
            }
          }
        } else {
          if (this.value.length > 0) {
            this.setSelected(this.value, false)
          }
        }
      },
      //     // todo: jcg 支持value options的动态响应
      // options: {
      //   deep: true,
      //   handler: function () {
      //     const stringifyOptions = JSON.stringify(this.options);
      //     if (stringifyOptions !== this.stringifyOptions) {
      //       this.stringifyOptions = stringifyOptions;
      //       this.$nextTick(() => this.updateSelected());
      //     }
      //   }
      // }
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