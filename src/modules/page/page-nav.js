import Nav from './Nav.vue'
import CompactNav from './CompactNav.vue'

const components = {
    "page-nav": Nav,
    "page-nav-compact": CompactNav,
}

const install = function (Vue, options) {
    if (install.installed) return;
    Object.keys(components).forEach(key => Vue.component(key, components[key]));
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default install
