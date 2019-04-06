import { OptionNode, SelectedPath } from "@/clazz";

/**
 * 新建选项列表
 * @param len
 * @param selected
 * @return {OptionNode[]}
 */
function genOptionList (len, selected = false){
  let list = [];
  for (let i = 0; i < len; i++) {
    list.push(genOptionNode(`label-${i}`, `value-${i}`, [], selected));
  }
  return list;
}

/**
 * 新建一个选项节点
 * @param label
 * @param value
 * @param children
 * @param selected
 * @return {OptionNode}
 */
function genOptionNode (label, value, children = [], selected = false){
  let node      = new OptionNode(label, value, "", "", "", false, children);
  node.selected = selected;
  return node;
}

function genSelectedPath (len, valueList = []){
  let list = [];
  for (let i = 0; i < len; i++) {
    list.push(genOptionNode(`label-${i}`, `${valueList[ i ] ? valueList[ i ] : `value-${i}`}`));
  }

  return new SelectedPath(list);
}

describe("fn:isSamePath", function (){
  it("same", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(3);
    expect(path1.isSamePath(path2)).toBe(true);
  })

  it("diff len", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(2);
    expect(path1.isSamePath(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(3, [ "value-1" ]);
    expect(path1.isSamePath(path2)).toBe(false);
  })
})

describe("fn:isDescendantOf", function (){
  it("descendant", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(2);
    expect(path1.isDescendantOf(path2)).toBe(true);
  })

  it("same len", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(3);
    expect(path1.isDescendantOf(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(2, [ "value-1" ]);
    expect(path1.isDescendantOf(path2)).toBe(false);
  })
})

describe("fn:isAncestorOf", function (){
  it("descendant", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(2);
    expect(path2.isAncestorOf(path1)).toBe(true);
  })

  it("same len", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(3);
    expect(path1.isAncestorOf(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genSelectedPath(3);
    let path2 = genSelectedPath(2, [ "value-1" ]);
    expect(path2.isAncestorOf(path1)).toBe(false);
  })
})

describe("fn:isLeaf", function (){
  it("has no child", function (){
    let path1 = genSelectedPath(2);
    expect(path1.isLeaf()).toBe(true);
  })

  it("has child", function (){
    let path1 = genSelectedPath(2);
    path1.path[ 1 ].children.push(genOptionNode("child", "child"));
    expect(path1.isLeaf()).toBe(false);
  })
})

describe("fn:selectUpstream", function (){
  it("first class should not upstream", function (){
    let options      = genOptionList(1);
    let selectedPath = new SelectedPath([ options[ 0 ] ]);
    let path         = selectedPath.selectUpstream();
    expect(path.length).toBe(1);
  })

  it("should upstream when sibling all selected", function (){
    let options                         = genOptionList(1);
    options[ 0 ].children               = genOptionList(3);
    options[ 0 ].children[ 0 ].selected = true;

    let selectedPath = new SelectedPath([
      options[ 0 ],
      options[ 0 ].children[ 1 ]
    ])
    let path         = selectedPath.selectUpstream();
    expect(path.length).toBe(2);
    expect(path[ 0 ].value).toBe("value-0");
    expect(path[ 1 ].value).toBe("value-1");

    selectedPath = new SelectedPath([
      options[ 0 ],
      options[ 0 ].children[ 2 ]
    ])
    path         = selectedPath.selectUpstream();
    expect(path.length).toBe(1);
    expect(path[ 0 ].value).toBe("value-0");
  })
})

describe("fn:unselectUpstream", function (){
  it("first class unselected", function (){
    let options           = genOptionList(1);
    options[ 0 ].selected = true;
    let selectedPath      = new SelectedPath([ options[ 0 ] ]);
    selectedPath.unselectUpstream();
    expect(options[ 0 ].selected).toBe(false);
  })

  it("should upstream when sibling all selected", function (){
    let options                         = genOptionList(1, true);
    options[ 0 ].children               = genOptionList(1, true);
    options[ 0 ].children[ 0 ].children = genOptionList(3, true);

    let selectedPath = new SelectedPath([
      options[ 0 ],
      options[ 0 ].children[ 0 ],
      options[ 0 ].children[ 0 ].children[ 0 ]
    ])

    selectedPath.unselectUpstream();
    expect(selectedPath.path[ 0 ].children[ 0 ].selected).toBe(false);
    expect(selectedPath.path[ 0 ].selected).toBe(false);

    let path = selectedPath.selectUpstream();
    expect(selectedPath.path[ 0 ].children[ 0 ].selected).toBe(true);
    expect(selectedPath.path[ 0 ].selected).toBe(true);
    expect(path.length).toBe(1);
    expect(path[ 0 ].value).toBe("value-0");
  })
})
