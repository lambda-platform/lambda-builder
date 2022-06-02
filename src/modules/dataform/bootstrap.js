// import Vue from "vue"
import VueCkeditor from 'vue-ckeditor2';
import Multiselect from 'vue-multiselect'
import axios from 'axios';
import lodash from 'lodash';
import iView from 'iview';

import locale from 'iview/dist/locale/mn-MN';
import CircularCountDownTimer from "vue-circular-count-down-timer";
Vue.component('multiselect', Multiselect)
// window.Vue = Vue;
Vue.config.productionTip = false;
Vue.use(VueCkeditor);
// Vue.component('v-select', vSelect);
window._ = lodash;
window.axios = axios;
Vue.config.silent = true;
Vue.use(iView, {locale});
Vue.use(CircularCountDownTimer);


axios.interceptors.request.use(function (config) {
    config.headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return config;
});
