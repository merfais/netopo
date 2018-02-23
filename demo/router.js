import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/chart',
      redirect: '/chart/network',
      component(resolve) {
        require(['./Test'], resolve);
      },
      children: [
        {
          path: 'network',
          component(resolve) {
            require(['./GraphDemo.vue'], resolve);
          },
        },
        {
          path: 'network2',
          component(resolve) {
            require(['./TopoGraphDemo.vue'], resolve);
          },
        },
      ],
    },
  ]
})
