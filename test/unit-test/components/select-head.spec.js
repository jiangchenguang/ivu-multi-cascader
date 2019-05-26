import Vue from 'vue';
import SelectHead from '@/components/select-head';
import { Config } from "@/clazz";
import { genSelected } from "@/../test/helper";

function genVm (propsData){
  const Ctor = Vue.extend({
    components: { SelectHead },
    template  : `<SelectHead ref="comp"
                             :config="config"
                             :selected="selected"
                             @remove="onRemove"
                 ></SelectHead>
                `,
    props     : [ 'config', 'selected' ],
    data (){
      return {
        list: []
      }
    },
    methods   : {
      comp (){
        return this.$refs.comp;
      },
      onRemove (list){
        this.list.splice(0, this.list.length, ...list);
      }
    }
  });
  return new Ctor({ propsData: propsData }).$mount();
}

describe("displayValue", function (){
  it("singleDisplayValue", function (){
    let config   = new Config(false, false, false, false, false, label => label.join(this.separator), '/',);
    let selected = genSelected([
      [
        { label: 'label-0', value: 'label-0', },
        { label: 'label-1', value: 'label-1', }
      ]
    ]);
    let vm       = genVm({ config, selected });
    let comp     = vm.comp();
    expect(comp.singleDisplayValue).toBe('label-0,label-1');
    expect(comp.multiDisplayValue.length).toBe(0);
  })

  it("multiDisplayValue", function (){
    let config   = new Config(true, false, false, false, false, label => label.join(this.separator), '/',);
    let selected = genSelected([
      [
        { label: 'label-0', value: 'label-0', },
        { label: 'label-1', value: 'label-1', }
      ]
    ]);
    let vm       = genVm({ config, selected });
    let comp     = vm.comp();
    expect(comp.singleDisplayValue).toBe('');
    expect(comp.multiDisplayValue[ 0 ]).toBe('label-0,label-1');
  })
})

describe("remove", function (){
  it("remove-one", function (){
    let config = new Config(true, false, false, false, false, label => label.join(this.separator), '/',);
    let vm     = genVm({ config, selected: [] });
    let comp   = vm.comp();
    comp.removeTag(2);
    expect(vm.list[ 0 ]).toBe(2);
  })

  it("remove-all", function (){
    let config   = new Config(true, false, false, false, false, label => label.join(this.separator), '/',);
    let selected = genSelected([
      [
        { label: 'label-0', value: 'label-0', },
      ],
      [
        { label: 'label-1', value: 'label-1', }
      ]
    ]);
    let vm       = genVm({ config, selected });
    let comp     = vm.comp();
    comp.onClear();
    expect(vm.list[ 0 ]).toBe(0);
    expect(vm.list[ 1 ]).toBe(1);
  })

  it("disable", function (){
    let config   = new Config(true, false, false, false, false,
      label => label.join(this.separator), '/', false, false, false, true);
    let selected = genSelected([
      [
        { label: 'label-0', value: 'label-0', },
      ],
      [
        { label: 'label-1', value: 'label-1', }
      ]
    ]);
    let vm       = genVm({ config, selected });
    let comp     = vm.comp();
    comp.removeTag(1);
    expect(vm.list.length).toBe(0);
  })
})
