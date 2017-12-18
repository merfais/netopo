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
            require(['./Network.vue'], resolve);
          },
        },
      ],
    },
    {
      path: '/',
      component(resolve) {
        require(['./HelloWorld.vue'], resolve)
      },
    },
  ]
})
