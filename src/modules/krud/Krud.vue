<template>
    <component ref="krud"
               :is="renderTemplate(property.template)"
               :schema="property.form"
               :id="property.edit_id"
               v-bind="properties">

        <template slot="left">
            <slot name="left"></slot>
        </template>

        <template slot="nav">
            <slot name="nav"></slot>
        </template>

        <template slot="v-nav">
            <slot name="v-nav"></slot>
        </template>

        <template slot="tooloptions">
            <slot name="toolbuttons"></slot>
        </template>

        <div class="krud-header-right" slot="right">
            <slot name="right">
                <user-control></user-control>
            </slot>
        </div>
        <div slot="dg-slot-body">
            <slot name="dg-slot-body"></slot>
        </div>

        <template slot="dg-footer-start">
            <slot name="dg-footer-start"></slot>
        </template>

        <template slot="dg-footer-mid">
            <slot name="dg-footer-mid"></slot>
        </template>

        <template slot="dg-footer-end">
            <slot name="dg-footer-end"></slot>
        </template>
    </component>
</template>

<script>
const templates = {
    canvas: () => import('./templates/canvas.vue'),
    "canvas-aside": () => import(/* webpackChunkName: "krud-canvas-aside" */'./templates/canvas-aside.vue'),
    drawer: () => import(/* webpackChunkName: "krud-drawer" */'./templates/drawer.vue'),
    create: () => import(/* webpackChunkName: "krud-create" */'./templates/create.vue'),
    edit: () => import(/* webpackChunkName: "krud-edit" */'./templates/edit.vue'),
    list: () => import(/* webpackChunkName: "krud-list" */'./templates/list.vue'),
    empty: () => import(/* webpackChunkName: "krud-empty" */'./templates/empty.vue'),
    emptyWithSideMenu: () => import(/* webpackChunkName: "krud-sidemenu-empty" */'./templates/empty-with-sidemenu.vue'),
    default: () => import(/* webpackChunkName: "krud-default" */'./templates/default.vue'),
    spa: () => import(/* webpackChunkName: "krud-spa" */'./templates/spa.vue'),
    modal: () => import(/* webpackChunkName: "krud-modal" */'./templates/krud-modal.vue'),
    window: () => import(/* webpackChunkName: "krud-window" */'./templates/window.vue'),
    withSubCruds: () => import(/* webpackChunkName: "krud-withSubCruds" */'./templates/withSubCruds.vue'),
    progressList: () => import(/* webpackChunkName: "krud-progress-list" */'./templates/progress-list.vue'),
}

export default {
    props: ["property"],

    data() {
        return {
            properties: this.property,
            lambda: window.lambda
        }
    },
    created() {
        if (this.lambda.has_language) {
            this.properties.title = this.property.trKey ? this.$t(this.property.trKey) : this.property.title
        }
    },

    methods: {
        renderTemplate(template) {
            if (templates.hasOwnProperty(template)) {
                return templates[template]
            } else {
                return templates["canvas"];
            }
        },

        callWindowForm() {
            this.renderTemplate('windowForm')
        }
    }
};
</script>
