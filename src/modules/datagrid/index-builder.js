/**
 * Created by n0m4dz on 2/6/17.
 */
import "./bootstrap"
import GridBuilder from './GridBuilder.vue'

const components = {
    'grid-builder': GridBuilder
}

const install = function (Vue, options) {
    if (install.installed) return;
    Object.keys(components).forEach(key => Vue.component(key, components[key]));
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default install
