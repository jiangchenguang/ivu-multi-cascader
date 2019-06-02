// import MultiCascader from './views';
import MultiCascader from './components';

function install (Vue){
  Vue.component('MultiCascader', MultiCascader);
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

const multiCascader = {
  MultiCascader
};
export default Object.assign(multiCascader, { install });
