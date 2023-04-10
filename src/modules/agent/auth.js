import Vue from "vue";
import {i18n} from '../../locale/index';
import axios from "axios";
import router from "./router";
import agent from "agent/index";

window.Vue = Vue;
window.axios = axios;

window.axios.defaults.headers.common = {
    "X-Requested-With": "XMLHttpRequest",
    "X-CSRF-TOKEN": document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content"),
};
Vue.config.productionTip = false;

let agentApp = agent;
if (typeof window.lambda.local_agent === undefined || window.lambda.local_agent === null || window.lambda.local_agent === '') {
    agentApp = require(`./views/theme/${window.lambda.theme}/index`).default;
}

new Vue({
    router,
    i18n,
    render: h => h(agentApp)
}).$mount('#app');


