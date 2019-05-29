import Vue from "vue";
import { optionMixin } from "@/mixins";

// 生成对应的实例
function genVm (propsData){
  const Ctor = Vue.extend({
    created (){
      this.initOptions();
    },
    mixins: [ optionMixin ]
  });
  return new Ctor({ propsData: propsData }).$mount();
}

// 用选项中的一些属性生成字符串
function strProp (list, propName){
  return list.map(i => i[ propName ]).join();
}

// 判断disabled属性
function assertDisableProp (list, correctList){
  let disList = list.map(i => i.disabled);
  let len     = disList.length;
  while (len--) {
    expect(disList[ len ]).toBe(correctList[ len ]);
  }
}

// 检查children的长度
function assertChildrenLen (list, correctList){
  let lenList = list.map(i => i.children.length);
  let len     = lenList.length;
  while (len--) {
    expect(lenList[ len ]).toBe(correctList[ len ]);
  }
}

describe("construction", function (){
  it("typically", function (){
    let vm = genVm({
      options: [
        {
          label    : "111",
          value    : "222",
          disabled : false,
        },
        {
          label    : "333",
          value    : "444",
          disabled : true,
        },
      ]
    })
    expect(strProp(vm.inner_option_list, 'label')).toBe("111,333");
    expect(strProp(vm.inner_option_list, 'value')).toBe("222,444");
    assertDisableProp(vm.inner_option_list, [ false, true ]);
  })

  it("children", function (){
    let vm = genVm({
      options: [
        {
          label   : "666",
          value   : "777",
          children: [
            {
              label    : "111",
              value    : "222",
              disabled : false,
            },
            {
              label    : "333",
              value    : "444",
              disabled : false,
            },
          ],
        },
      ]
    })
    assertChildrenLen(vm.inner_option_list, [ 2 ]);
    expect(strProp(vm.inner_option_list[ 0 ].children, 'label')).toBe("111,333");
    expect(strProp(vm.inner_option_list[ 0 ].children, 'value')).toBe("222,444");
    assertDisableProp(vm.inner_option_list[ 0 ].children, [ false, false ]);
  })

  it("empty label, value", function (){
    let vm = genVm({
      options: [
        {
          label: "",
          value: "222",
        },
        {
          label: "333",
          value: "",
        },
      ]
    })
    expect(vm.inner_option_list.length).toBe(0);
  })
})

describe('fn:getOptionPathByValueList', () => {
  let vm = genVm({
    options: [
      {
        label   : "111",
        value   : "111",
        children: [
          {
            label: "222",
            value: "222",
          },
          {
            label   : "333",
            value   : "333",
            children: [
              {
                label: "444",
                value: "444",
              },
            ]
          },
        ],
      },
    ]
  })

  it('should found', () => {
    let path = vm.getOptionPathByValueList([ '111', '333', '444' ]);
    expect(strProp(path, 'value')).toBe('111,333,444');
  })

  it('should not found', () => {
    let path = vm.getOptionPathByValueList([ '000' ]);
    expect(path).toBe(null);

    path = vm.getOptionPathByValueList([ '111', '222', '444' ]);
    expect(path).toBe(null);
  });
})
