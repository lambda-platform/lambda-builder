import "./bootstrap";

import H5p from "./H5p.vue";
import contents from "./views/contents.vue";
import editor from "./views/editor.vue";
import viewer from "./views/viewer.vue";

const components = {
    'h5p': H5p,
    'h5p-contents': contents,
    'h5p-editor': editor,
    'h5p-viewer': viewer
};

const install = function (Vue, options) {
    if (install.installed) return;
    Object.keys(components).forEach(key => Vue.component(key, components[key]));
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default install
