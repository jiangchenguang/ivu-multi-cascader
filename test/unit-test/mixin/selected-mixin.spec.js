import Vue from "vue";
import { configMixin, optionMixin, selectedMixin } from '@/mixins';

// 生成对应的实例
function genVm (propsData){
  const Ctor = Vue.extend({
    mixins : [
      configMixin,
      optionMixin,
      selectedMixin
    ],
    props  : {
      multiple           : {
        type   : Boolean,
        default: false
      },
      onlyLeaf           : {
        type   : Boolean,
        default: false
      },
      disableMerge2parent: {
        type   : Boolean,
        default: false
      }
    },
    created (){
      this.init();
    },
    methods: {
      init (){
        this.initOptions();
        // this.initByValue();
      },

      /**
       * 获取第idx个选中项的节点路径value拼接的字符串
       * @param idx
       * @return {*}
       */
      specificSelectedValueStr (idx){
        return strValue(this.selected[ idx ]);
      }
    }
  });
  return new Ctor({ propsData: propsData }).$mount();
}


function strValue (selected){
  return selected.path.map(i => i.value).join();
}

describe("interface:selectedAddByValueList", () => {
  it("multiple selected and only leaf and disable merge2parent", function (){
    let vm = genVm({
      multiple: true,

      onlyLeaf: true,

      disableMerge2parent: true,

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
    });

    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,222');
    vm.selectedAddByValueList([ '111', '333', '444' ]);
    expect(vm.selected.length).toBe(2);
    expect(vm.specificSelectedValueStr(1)).toBe('111,333,444');
  })

  it("multiple selected and not only leaf and disable merge2parent", function (){
    let vm = genVm({
      multiple: true,

      onlyLeaf: false,

      disableMerge2parent: true,

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
    });

    vm.selectedAddByValueList([ '111', '333' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,333');
  })

  it("multiple selected and only leaf and merge2parent", function (){
    let vm = genVm({
      multiple: true,

      onlyLeaf: true,

      disableMerge2parent: false,

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
    });

    vm.selectedAddByValueList([ '111', '333', '444' ]);
    expect(vm.selected.length).toBe(1);
    // 因为onlyLeaf，所以不能向上合并
    expect(vm.specificSelectedValueStr(0)).toBe('111,333,444');
    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(2);
    expect(vm.specificSelectedValueStr(1)).toBe('111,222');
  })

  it("multiple selected and not only leaf and merge2parent", function (){
    let vm = genVm({
      multiple: true,

      onlyLeaf: false,

      disableMerge2parent: false,

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
    });

    vm.selectedAddByValueList([ '111', '333' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,333');
    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111');
  })

  it("single selected and only leaf and disable merge2parent", function (){
    let vm = genVm({
      multiple: false,

      disableMerge2parent: true,

      onlyLeaf: true,

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
    });

    vm.selectedAddByValueList([ '111', '333' ]);
    expect(vm.selected.length).toBe(0);
    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,222');
    vm.selectedAddByValueList([ '111', '333', '444' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,333,444');
  })

  it("single selected and not only leaf and disable merge2parent", function (){
    let vm = genVm({
      multiple: false,

      onlyLeaf: false,

      disableMerge2parent: true,

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
    });

    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,222');
    vm.selectedAddByValueList([ '111', '333' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,333');
  })

  it("single selected and only leaf and merge2parent", function (){
    let vm = genVm({
      multiple: false,

      onlyLeaf: true,

      disableMerge2parent: false,

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
    });

    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,222');
    vm.selectedAddByValueList([ '111', '333', '444' ]);
    expect(vm.selected.length).toBe(1);
    // 因为onlyLeaf，所以不能向上合并
    expect(vm.specificSelectedValueStr(0)).toBe('111,333,444');
  })

  it("single selected and not only leaf and merge2parent", function (){
    let vm = genVm({
      multiple: false,

      onlyLeaf: false,

      disableMerge2parent: false,

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
    });

    vm.selectedAddByValueList([ '111', '333' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,333');
    vm.selectedAddByValueList([ '111', '222' ]);
    expect(vm.selected.length).toBe(1);
    expect(vm.specificSelectedValueStr(0)).toBe('111,222');
  })
})

describe("interface:selectedDelete", () => {
  it("typical", function (){
    let vm = genVm({
      multiple: true,

      onlyLeaf: false,

      disableMerge2parent: true,

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
    });

    vm.selectedAddByValueList([ '111', '222' ]);
    vm.selectedAddByValueList([ '111', '333', '444' ]);
    expect(vm.selected.length).toBe(2);
    let deleted = vm.selectedDelete([ 1, 0 ]);
    expect(vm.selected.length).toBe(0);
    expect(strValue(deleted[ 0 ])).toBe('111,333,444');
    expect(strValue(deleted[ 1 ])).toBe('111,222');
  })
})

describe("interface:selectedDeleteAll", () => {
  it("typical", function (){
    let vm = genVm({
      multiple: true,

      onlyLeaf: false,

      disableMerge2parent: true,

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
    });

    vm.selectedAddByValueList([ '111', '222' ]);
    vm.selectedAddByValueList([ '111', '333', '444' ]);
    expect(vm.selected.length).toBe(2);
    let deleted = vm.selectedDeleteAll();
    expect(vm.selected.length).toBe(0);
    expect(strValue(deleted[ 0 ])).toBe('111,333,444');
    expect(strValue(deleted[ 1 ])).toBe('111,222');
  })
})

