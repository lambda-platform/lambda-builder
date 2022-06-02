<template>
    <section class="page">
        <krud class="material" :template="property.template" :property="property" >
            <template slot="nav">
                <slot name="nav"></slot>
            </template>
            <user-control slot="right"></user-control>
        </krud>
    </section>
</template>

<script>

export default {
    name: "crud",
    data() {
        return {
            word: {},
            // property: {
            //     template: "canvas",
            //     title: 'Зорилтод мэдэгдэл',
            //     //title: this._title,
            //     grid: 'notification_target_grid',
            //     form: 'notification_target_form',
            //     actions: ''
            // },
        };
    },
    methods: {

    },
    computed: {
        lang() {
            const labels = ['target_statement',];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('project.' + labels[i]);
                return obj;
            }, {});
        },
        property() {
            return{
                template: "canvas",
                title: this.lang.target_statement,
                //title: this._title,
                grid: 'notification_target_grid',
                form: 'notification_target_form',
                actions: ''
            }
        },
    },

};
</script>


