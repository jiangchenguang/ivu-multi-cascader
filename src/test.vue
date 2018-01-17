<template>
  <div>
    <Select multiple filterable v-model="selectModel" style="width:200px">
      <SelOption v-for="item in selectOption" :value="item.value" :key="item.value">{{ item.label }}</SelOption>
    </Select>

    <Cascader trigger="hover"
              filterable
              :data="cascadeOption"
              v-model="cascaderModel"
    ></Cascader>
  </div>
</template>

<script>
  import { Select, SelOption } from "./views/components/select";
  import Cascader from './views/components/cascader';

  export default {
    data() {
      return {
        selectOption: [
          {
            value: 'New York',
            label: 'New York'
          },
          {
            value: 'London',
            label: 'London'
          },
          {
            value: 'Sydney',
            label: 'Sydney'
          },
          {
            value: 'Ottawa',
            label: 'Ottawa'
          },
          {
            value: 'Paris',
            label: 'Paris'
          },
          {
            value: 'Canberra',
            label: 'Canberra'
          }
        ],
        selectModel: [],

        cascadeOption: [{
          value: 'beijing',
          label: '北京',
          children: [
            {
              value: 'gugong',
              label: '故宫'
            },
            {
              value: 'tiantan',
              label: '天坛'
            },
            {
              value: 'wangfujing',
              label: '王府井'
            }
          ]
        }, {
          value: 'jiangsu',
          label: '江苏',
          children: [
            {
              value: 'nanjing',
              label: '南京',
              children: [
                {
                  value: 'fuzimiao',
                  label: '夫子庙',
                }
              ]
            },
            {
              value: 'suzhou',
              label: '苏州',
              children: [
                {
                  value: 'zhuozhengyuan',
                  label: '拙政园',
                },
                {
                  value: 'shizilin',
                  label: '狮子林',
                }
              ]
            }
          ],
        }],
        cascaderModel: [],
      }
    },
    mounted() {
    },
    components: {
      Select,
      SelOption,
      Cascader,
    }
  }
</script>
