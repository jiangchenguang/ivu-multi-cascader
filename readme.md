# 可复选级联组件
## 概述
增强的下拉选择组件
* 支持单选/多选
* 支持选项级联
* 支持单行/多行模式显示
## 注意
* 非 template/render 模式下（例如使用 CDN 引用），需先引入vue库，iview样式，iview组件库。
* 非 template/render 模式下（例如使用 CDN 引用），必须分割组件名/属性，如multi-cascader，only-leaf等。
## 使用指南
### 基本用法
``` vue
  <template>
    <MultiCascader :options="cascadeOption"
                  v-model="cascaderModel"
                  filterable
                  onlyLeaf
                  multiple
                  singleLineMode
                  separator="-"
    ></MultiCascader>
  </template>
  
  <script>
    export defalut {
      data() {
        return {
          cascadeOption: [
            {
              value: 'beijing',
              label: '北京',
              icon: 'person-stalker',
              children: [
                {
                  value: 'gugong',
                  label: '故宫',
                  icon: 'person',
                },
                {
                  value: 'tiantan',
                  label: '天坛',
                  icon: 'person',
                },
                {
                  value: 'wangfujing',
                  label: '王府井',
                  icon: 'person',
                }
              ]
            }, {
              value: 'jiangsu',
              label: '江苏',
              icon: 'person-stalker',
              children: [
                {
                  value: 'nanjing',
                  label: '南京',
                  icon: 'person-stalker',
                  children: [
                    {
                      value: 'fuzimiao',
                      label: '夫子庙',
                      icon: 'person',
                    }
                  ]
                },
                {
                  value: 'suzhou',
                  label: '苏州',
                  icon: 'person-stalker',
                  children: [
                    {
                      value: 'zhuozhengyuan',
                      label: '拙政园',
                      icon: 'person',
                    },
                    {
                      value: 'shizilin',
                      label: '狮子林',
                      icon: 'person',
                    }
                  ]
                }
              ],
            }
          ],
          cascaderModel: [
            [
              {
                value: 'jiangsu',
                label: '江苏',
              },
              {
                value: 'nanjing',
                label: '南京'
              },
              {
                value: 'fuzimiao',
                label: '夫子庙'
              }
            ]
          ],
        }
      }
    }
  </script>
```
### props
|属性|说明|类型|默认值|
| ---| --- | --- |--- |
|options|下拉选项列表，每个元素的属性参考“options选项属性”|Array|[]|
|value|默认选中项。单选使用一维数组；多选使用二维数组|Array|[]|
|disable|是否禁用|Boolean|false|
|clearable|是否可清空选项|Boolean|true|
|separator|自定义展示选中项时使用的分割符|String|' / '|
|renderFormat|选择后展示的函数，用于自定义显示格式|Function|label => label.join(${separator})|
|filterable|是否可搜索|Boolean|false|
|placeholder|占位符|String|'请选择'|
|notFoundText|当搜索列表为空时显示的内容|String|'无匹配内容'|
|multiple|是否启用多选|Boolean|false|
|singleLineMode|是否启用单行显示|Boolean|false|
|onlyLeaf|是否只能选择叶子节点|Boolean|false|
|transfer|是否将弹层放置于 body 内，在 Tabs、带有 fixed 的 Table 列内使用时，建议添加此属性，它将不受父级样式影响，从而达到更好的效果|Boolean|false|
#### options选项属性
|属性|说明|类型|默认值|
| ---| --- | --- |--- |
|value|选项对应唯一值|String|-|
|label|选项显示的内容，用于搜索过滤|String|-|
|icon|图标（使用iview的icon的type值）|String|-|
|children|子选项|Array|-|
