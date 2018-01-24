import MultiCascader from './views/components/cascader';

function install (Vue) {
  Vue.component('MultiCascader', MultiCascader);
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export { MultiCascader } ;