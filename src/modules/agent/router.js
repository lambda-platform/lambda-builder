import Router from 'vue-router'
import Vue from 'vue'

Vue.use(Router)

function load(component) {
    let agentApp = require('agent/' + component).default;
    if (typeof window.lambda.local_agent === undefined || window.lambda.local_agent === null || window.lambda.local_agent === '') {
        agentApp = require(`./views/theme/${window.lambda.theme}/${component}`).default
    }

    return agentApp;
}

let routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', component: load("auth/login.vue")},
    {path: '/forgot', component: load("auth/password/forgot.vue")},
    {path: '/password-reset', component: load("auth/password/password_reset.vue")},
];


export default new Router({
    mode: 'history', //hash,
    base: '/auth/',
    routes,
})
