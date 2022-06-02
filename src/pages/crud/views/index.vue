<template>
    <section class="page">
        <krud class="material" :template="property.template" :property="property">
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
            return {};
        },
        computed: {
            lang() {
                const labels = ['form_and_table_consolidation',];
                return labels.reduce((obj, key, i) => {
                    obj[key] = this.$t('project.' + labels[i]);
                    return obj;
                }, {});
            },
            property() {
                if(this.$project){
                    return{
                        template: "canvas",
                        title: this.lang.form_and_table_consolidation,
                        grid: '51',
                        form: '50',
                        custom_condition: `projects_id = ${this.$project.id}`,
                        actions: []
                    }
                } else {
                    return {
                        template: "canvas",
                        title: "Маягт, хүснэгт нэгтгэл",
                        grid: 'crud_grid',
                        form: 'crud_form',
                        actions: []
                    }
                }

            },
        },
    };
</script>


