import Vue from 'vue';
import DropdownPanel from '@/components/dropdown-panel';
import { genConfig, genOptionList, genOneSelectedByOptionList } from "test/helper";

function genVm (propsData){
  const Ctor = Vue.extend({
    components: { DropdownPanel },
    template  : `<DropdownPanel ref="comp"
                                :config="config"
                                :query="query"
                                :inner_option_list="options"
                 ></DropdownPanel>
                `,
    props     : [ 'config', 'options' ],
    data (){
      return {
        query: ''
      }
    },
    methods   : {
      comp (){
        return this.$refs.comp;
      },
    }
  });
  return new Ctor({ propsData: propsData }).$mount();
}

describe("setDescendantSelect", function (){
  it("if parent selected, then all child is selected", function (){
    let config  = genConfig();
    let options = genOptionList([
      {
        label: 'label-0', value: 'value-0', disabled: false, children: [
          { label: 'label-00', value: 'value-00', disabled: false, children: [] },
          { label: 'label-01', value: 'value-01', disabled: false, children: [] },
          { label: 'label-02', value: 'value-02', disabled: false, children: [] },
        ]
      }
    ]);

    let vm     = genVm({ config, options });
    let comp   = vm.comp();
    let parent = genOneSelectedByOptionList([ options[ 0 ] ]);
    expect(options[ 0 ].children[ 0 ].selected).toBe(false);
    expect(options[ 0 ].children[ 1 ].selected).toBe(false);
    expect(options[ 0 ].children[ 2 ].selected).toBe(false);
    comp.setDescendantSelect(parent, true);

    expect(options[ 0 ].children[ 0 ].selected).toBe(true);
    expect(options[ 0 ].children[ 1 ].selected).toBe(true);
    expect(options[ 0 ].children[ 2 ].selected).toBe(true);
  })
})

describe("trySetAncestorSelect", function (){
  it("if all child selected, then set parent selected", function (){
    let config  = genConfig();
    let options = genOptionList([
      {
        label: 'label-0', value: 'value-0', disabled: false, children: [
          { label: 'label-00', value: 'value-00', disabled: false, children: [] },
          { label: 'label-01', value: 'value-01', disabled: false, children: [] },
          { label: 'label-02', value: 'value-02', disabled: false, children: [] },
        ]
      }
    ]);

    let vm   = genVm({ config, options });
    let comp = vm.comp();

    // selected value-00
    options[ 0 ].children[ 0 ].selected = true;

    // select value-01
    options[ 0 ].children[ 1 ].selected = true;
    let parent                          = genOneSelectedByOptionList([ options[ 0 ], options[ 0 ].children[ 1 ] ]);
    comp.trySetAncestorSelect(parent, true);
    expect(options[ 0 ].selected).toBe(false);

    // select value-02
    options[ 0 ].children[ 2 ].selected = true;
    parent                              = genOneSelectedByOptionList([ options[ 0 ], options[ 0 ].children[ 2 ] ]);
    comp.trySetAncestorSelect(parent, true);
    expect(options[ 0 ].selected).toBe(true);
  })
})

