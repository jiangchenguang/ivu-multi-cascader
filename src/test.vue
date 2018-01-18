<template>
  <div>
    <Cascader :data="cascadeOption"
              :value="cascaderModel"
              filterable
              multiple
              @input="onChange"
    ></Cascader>
  </div>
</template>

<script>
  import Cascader from './views/components/cascader';

  export default {
    data() {
      return {
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
    methods: {
      onChange(val) {
        console.log('test change:', val);
      }
    },
    components: {
      Cascader,
    }
  }
</script>
