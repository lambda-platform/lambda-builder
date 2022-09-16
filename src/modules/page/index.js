let routes = [
    {
        path: '/p/:menu_id',
        component: ()=>import(/* webpackChunkName: "page-index" */ './views/index.vue'),
        //component: ()=>import(/* webpackChunkName: "page-index" */ './views/index'),
        children: [{
            path: ':sub_menu_id',
            component: ()=>import(/* webpackChunkName: "page-sub" */ './views/sub.vue'),
            children: [{
                path: ':sub_child_menu_id',
                component: ()=>import(/* webpackChunkName: "page-subChild" */ './views/subChild.vue'),
            }]
        }]
    },
    {
        path: '/module/:module',
        component: ()=>import(/* webpackChunkName: "page-module" */ './views/module.vue'),
    },
    {
        name: 'Error',
        path: '/*',
        component: ()=>import(/* webpackChunkName: "page-404" */ './views/404.vue')
    }
];
const install = (Vue, options) => {
    Vue.mixin({
        mounted() {
            this.$nextTick(() => {
                if (!this.$parent) {
                    this.$router.app.$router.addRoutes(routes);
                   //  this.routes.forEach(route=>{
                   //      this.$router.app.$router.addRoute(route);
                   //  });
                }
            });
        }
    });
};

if (typeof window !== 'undefined' && window.Vue) {
    console.log('page index install started');
    install(window.Vue);
}
