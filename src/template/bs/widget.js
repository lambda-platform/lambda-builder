/**
 * Created by n0m4dz on 2/6/17.
 */
import BsHeader from './widgets/bs-header.vue'

const components = {
    'bs-header': BsHeader,
}

const install = function (Vue, options) {
    if (install.installed) return;
    Object.keys(components).forEach(key => Vue.component(key, components[key]));
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default install
