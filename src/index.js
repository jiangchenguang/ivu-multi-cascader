import MultiCascader from './views';

function install (Vue) {
  Vue.component('MultiCascader', MultiCascader);
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export { MultiCascader };