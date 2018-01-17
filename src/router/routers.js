import Vue from 'vue';
import VueRoute from 'vue-router';
// import Main from '@/views/main';
import Main from '@/views/main';
import Iframe from '@/views/iframe';

Vue.use(VueRoute);

const routes = [
  {
    path: '/',
    component: Main,
    children: [
      {path: 'Iframe', component: Iframe}
    ]
  },
]

const router = new VueRoute({ routes });

export default router;
