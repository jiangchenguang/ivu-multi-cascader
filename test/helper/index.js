import { OptionNode, SelectedPath } from '@/clazz';

// 生成选项列表
export function genOptionList (optionList){
  return optionList.map(option => genOptionNode(option))
}

// 生成选中项列表
export function genSelected (selectedPathList){
  return selectedPathList.map(genOneSelected);
}

// 生成一个选中项
export function genOneSelected (path){
  return new SelectedPath(path.map(i => genOptionNode(i)))
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
