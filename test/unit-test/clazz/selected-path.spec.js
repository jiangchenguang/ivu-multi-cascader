import { genOneSelected, genOneSelectedByOptionList, genOptionNode, genOptionList } from "test/helper";

describe("fn:isSamePath", function (){
  it("same", function (){
    let nodeA = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let nodeB = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]
    expect(nodeA.isSamePath(nodeB)).toBe(true);
  })

  it("diff len", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ]
    expect(path1.isSamePath(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = [
      { label: 'label-0', value: 'value-1' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]
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
    let path2 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
    ]
    expect(path1.isDescendantOf(path2)).toBe(true);
  })

  it("same len", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]);
    let path2 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]
    expect(path1.isDescendantOf(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = genOneSelected([
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ])
    let path2 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-2' },
    ]
    expect(path1.isDescendantOf(path2)).toBe(false);
  })
})

describe("fn:isAncestorOf", function (){
  it("descendant", function (){
    let path1 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]
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
    let path2 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]
    expect(path1.isAncestorOf(path2)).toBe(false);
  })

  it("diff value", function (){
    let path1 = [
      { label: 'label-0', value: 'value-0' },
      { label: 'label-1', value: 'value-1' },
      { label: 'label-2', value: 'value-2' },
    ]
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

