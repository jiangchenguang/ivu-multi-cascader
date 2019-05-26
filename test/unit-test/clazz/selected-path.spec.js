import { genOneSelected, genOneSelectedByOptionList, genOptionNode, genOptionList } from "@/../test/helper";

describe("fn:isSamePath", function (){
  it("same", function (){
    let nodeA = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let nodeB = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    expect(nodeA.isSamePath(nodeB)).toBe(true);
  })

  it("diff len", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ])
    expect(path1.isSamePath(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-1' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    expect(path1.isSamePath(path2)).toBe(false);
  })
})

describe("fn:isDescendantOf", function (){
  it("descendant", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ])
    expect(path1.isDescendantOf(path2)).toBe(true);
  })

  it("same len", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    expect(path1.isDescendantOf(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-2' },
    ])
    expect(path1.isDescendantOf(path2)).toBe(false);
  })
})

describe("fn:isAncestorOf", function (){
  it("descendant", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ])
    expect(path2.isAncestorOf(path1)).toBe(true);
  })

  it("same len", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    expect(path1.isAncestorOf(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-2' },
    ])
    expect(path2.isAncestorOf(path1)).toBe(false);
  })
})

describe("fn:isLeaf", function (){
  it("has no child", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ])
    expect(path1.isLeaf()).toBe(true);
  })

  it("has child", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ])
    path1.path[ 1 ].children.push(genOptionNode({ label: "child", value: "child" }));
    expect(path1.isLeaf()).toBe(false);
  })
})

describe("fn:selectUpstream", function (){
  it("first level should not upstream", function (){
    let options  = genOptionList([
      { label: 'label-0', value: 'value-0' },
    ]);
    let selected = genOneSelected([ options[ 0 ] ]);
    let path     = selected.selectUpstream();
    expect(path.length).toBe(1);
  })

  it("should upstream when sibling all selected", function (){
    let options = genOptionList([
      {
        label      : 'label-0', value: 'value-0', disabled: false, children: [
          { label: 'label-00', value: 'value-00', disabled: false, children: [], selected: false },
          { label: 'label-01', value: 'value-01', disabled: false, children: [], selected: false },
          { label: 'label-02', value: 'value-02', disabled: false, children: [], selected: false },
        ], selected: false
      }
    ]);

    // select 'value-00'
    options[ 0 ].children[ 0 ].selected = true;

    // select 'value-01'
    let selected = genOneSelectedByOptionList([
      options[ 0 ],
      options[ 0 ].children[ 1 ]
    ])
    let path     = selected.selectUpstream();
    expect(path.length).toBe(2);
    expect(path[ 0 ].value).toBe("value-0");
    expect(path[ 1 ].value).toBe("value-01");

    // select 'value-02'
    selected = genOneSelectedByOptionList([
      options[ 0 ],
      options[ 0 ].children[ 2 ]
    ])
    path     = selected.selectUpstream();
    expect(path.length).toBe(1);
    expect(path[ 0 ].value).toBe("value-0");
  })
})

describe("fn:unselectUpstream", function (){
  it("first class unselected", function (){
    let options           = genOptionList([
      { label: 'label-0', value: 'value-0' },
    ]);
    options[ 0 ].selected = true;
    let selected          = genOneSelectedByOptionList([ options[ 0 ] ]);
    selected.unselectUpstream();
    expect(options[ 0 ].selected).toBe(false);
  })

  it("should upstream when sibling all selected", function (){
    let options = genOptionList([
      {
        label      : 'label-0', value: 'value-0', disabled: false, children: [
          {
            label      : 'label-00', value: 'value-00', disabled: false, children: [
              {
                label: 'label-00', value: 'value-00', disabled: false, children: [], selected: true
              },
              {
                label: 'label-00', value: 'value-00', disabled: false, children: [], selected: true
              },
              {
                label: 'label-00', value: 'value-00', disabled: false, children: [], selected: true
              },
            ], selected: true
          },
        ], selected: true
      }
    ]);

    let selected = genOneSelectedByOptionList([
      options[ 0 ],
      options[ 0 ].children[ 0 ],
      options[ 0 ].children[ 0 ].children[ 0 ]
    ])

    selected.unselectUpstream();
    expect(selected.path[ 0 ].children[ 0 ].selected).toBe(false);
    expect(selected.path[ 0 ].selected).toBe(false);

    let path = selected.selectUpstream();
    expect(selected.path[ 0 ].children[ 0 ].selected).toBe(true);
    expect(selected.path[ 0 ].selected).toBe(true);
    expect(path.length).toBe(1);
    expect(path[ 0 ].value).toBe("value-0");
  })
})
