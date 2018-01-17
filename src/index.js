import 'babel-polyfill';
import Vue from 'vue';
import test from './test';
import iView from 'iview';
import 'iview/dist/styles/iview.css';

Vue.use(iView);

new Vue({
  el: '#app',
  render: h => h(test),
})