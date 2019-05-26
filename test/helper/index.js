import { OptionNode, Selected } from '@/clazz';

// 生成选项列表
export function genOptionList (optionList){
  return optionList.map(option => genOptionNode(option))
}

// 生成多个选中项
export function genSelected (selectedList){
  return selectedList.map(genOneSelected);
}

// 生成一个选中项
export function genOneSelected (objPath){
  return genOneSelectedByOptionList(objPath.map(genOptionNode))
}

// 通过选项路径生成一个选中项
export function genOneSelectedByOptionList (optionPath){
  return new Selected(optionPath);
}

export function genOptionNode (obj){
  let node      = new OptionNode(
    obj.label,
    obj.value,
    (obj.children || []).map(genOptionNode),
    !!obj.disabled
  );
  node.selected = !!(obj.selected);
  return node;
}
