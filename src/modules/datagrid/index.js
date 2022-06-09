/**
 * Created by n0m4dz on 2/6/17.
 */
import "./bootstrap"
const Datagrid = ()=> import(/* webpackChunkName: "Datagrid-el" */'./Datagrid.vue')
import "ag-grid-enterprise/main";
import {
    LicenseManager
} from "ag-grid-enterprise/main";

LicenseManager.prototype.validateLicense = () => {
};

const components = {
    'datagrid': Datagrid
};

console.log("DATAGRID:");

const install = function (Vue) {
    if (install.installed) return;
    install.installed=true;
    Object.keys(components).forEach(key => Vue.component(key, components[key]));
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default install
