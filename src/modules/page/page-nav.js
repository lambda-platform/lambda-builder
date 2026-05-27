import Nav from './Nav.vue'
import NavBs from './NavBs.vue'
import NavTree from './NavTree.vue'

const components = {
    "page-nav": Nav,
    "page-nav-bs": NavBs,
    "page-nav-tree": NavTree,
}

const install = function (Vue, options) {
    if (install.installed) return;
    Object.keys(components).forEach(key => Vue.component(key, components[key]));
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default install
