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

function loadApp() {
    if (window.lambda.local_agent != undefined && window.lambda.local_agent == true) {
        try {
            return require(`agent/index`).default
        } catch (err) {
            console.log('not local');
        }
    } else {
        return require(`./views/theme/default/index`).default;
    }

    return require(`./views/theme/${window.lambda.theme}/index`).default;
}

new Vue({
    router,
    i18n,
    render: h => h(loadApp())
}).$mount('#app');

