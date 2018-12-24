# 可复选级联组件
## 概述
* 使用者提供一维数组作为选项内容，每个数组元素都是一个对象表示树节点，对象可拥有`children`属性表示下级目录的内容，依次级联（对象所有属性说明见下方*options选项属性*）。
* 用户选中一个选项时，组件使用数组对象保存该选项所有的祖先对象，一级祖先在数组的第一个位置，二级祖先在第二个位置，依次放置，选中项则在数组的最后一个位置。
* 所以单选模式下，所有选中项是一维数组；多选模式下，所有选中项是一个二维数组。

## 功能列表
* 可以级联形式展示选项。
* 支持单选、复选。
* 支持选中项单行、多行展示。
* 可通过搜索（label）实现快速过滤。
* 可根据用户所归属的组、角色、用户自定义属性等生成派发树。
* 可根据表单内容规则或其他自定义对象内容生成派发树，如：根据表单中某个业务类型来生成派发树。
* 派发树起始节点、层次可定制。
* 派发树内容可根据用户属性进行过滤，如只展现某个角色的树；只展现厂家人员等。
* 可根据当前用户反向递归该用户所归属组中的所有人员，如：只显示当前操作员部门人员；只显示当前操作员部门经理。

## 注意项
* 非 template/render 模式下（例如使用 CDN 引用），需先引入vue库，iview样式，iview组件库。
* 非 template/render 模式下（例如使用 CDN 引用），必须分割组件名/属性，如multi-cascader，only-leaf等。

## 使用指南
### 依赖引入
* 使用`script`标签引入`vue.js`，`iview.js`。
* 使用`link`标签引入`iview.css`。

### 一个例子
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
### props（配置项）
|属性|说明|类型|默认值|
| ---| --- | --- |--- |
|options|下拉选项列表，每个元素的属性参考“options选项属性”|Array|[]|
|value|选中项（需要默认选中时可把value置为该选项的路径数组即可）。单选使用一维数组；多选使用二维数组|Array|[]|
|disable|是否禁用|Boolean|false|
|clearable|是否可清空选项|Boolean|true|
|separator|自定义展示选中项时使用的分割符|String|' / '|
|renderFormat|选择后展示的函数，用于自定义显示格式|Function|label => label.join(${separator})|
|filterable|是否可搜索|Boolean|false|
|placeholder|占位符|String|'请选择'|
|notFoundText|当搜索列表为空时显示的内容|String|'无匹配内容'|
|multiple|是否启用多选|Boolean|false|
|singleLineMode|是否启用单行显示|Boolean|false|
|allSelectable|是否启用全选（前提：开启`multiple`，关闭`onlyLeaf`）|Boolean|false|
|onlyLeaf|是否只能选择叶子节点|Boolean|false|
|disableMerge2parent|是否禁用自动合并到父节点的功能（前提：开启`onlyLeaf`）|Boolean|false|
|autoSelect|启用当选项是单一路径时，自动选中的功能|Boolean|false|
|transfer|是否将弹层放置于 body 内，在 Tabs、带有 fixed 的 Table 列内使用时，建议添加此属性，它将不受父级样式影响，从而达到更好的效果|Boolean|false|
### options选项属性
|属性|说明|类型|默认值|
| ---| --- | --- |--- |
|value|选项所对应的值|String|-|
|label|选项的显示内容，也用于搜索过滤|String|-|
|icon|图标（使用iview的icon的type值）|String|-|
|iconColor|设定图标的颜色|String|-|
|group|用于选项分组，同一层级的选项如果拥有相同group则会统一显示|String|-|
|children|子选项|Array|-|
### 函数接口
|函数|说明|参数|返回值|
| --- | --- | --- | --- |
|findPathByPath(attrName, attrPathList, attrPathString)|查找一个完整的选项对象路径。需要指定匹配属性名，并传入一个对象数组或一个字符串。|attrName: 指定属性名；attrPathList：对象数组，对象只有attrName这个属性即可；attrPathString：字符串，使用`separator`分割、`attrName`对应的值拼接的字符串|[]|
|findPathByValue(attrName, attrValue)|查找所有符合条件的选项对象路径。需要指定匹配属性名，及对应的属性值。|attrName:指定属性名；attrValue:指定属性值。|[]|
|getItemPath(同`findPathByPath`)旧接口||||

