import Vue from 'vue'
import PortalVue from 'portal-vue'
import VModal from 'vue-js-modal'
import 'vue-js-modal/dist/styles.css'

Vue.use(PortalVue)
Vue.prototype.$bus = new Vue({})
window.Vue = Vue;
Vue.config.productionTip = false;

Vue.use(VModal)
