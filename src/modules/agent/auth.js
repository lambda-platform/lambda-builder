import Vue from "vue";
import {i18n} from '../../locale/index';
import axios from "axios";
import router from "./router";

window.Vue = Vue;
window.axios = axios;

window.axios.defaults.headers.common = {
    "X-Requested-With": "XMLHttpRequest",
    "X-CSRF-TOKEN": document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content"),
};
Vue.config.productionTip = false;

// import(/* webpackChunkName: "auth-[request]" */ `./views/theme/${window.lambda.theme}/index`).then(theme => {
new Vue({
    router,
    i18n,
    // render: h => h(theme.default),
    render: h => h(require(`./views/theme/${window.lambda.theme}/index`).default)
}).$mount('#app');
// });



