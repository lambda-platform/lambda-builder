<template>
    <section class="offcanvas-template">
        <div class="crud-page">
            <div class="crud-page-header">

                <div class="crud-page-header-left">
                    <slot name="nav"></slot>
                </div>

                <div class="crud-page-header-right">
                    <slot name="tooloptions"></slot>
                    <slot name="right"></slot>
                </div>
            </div>

            <div class="crud-page-body">
                <div class="v-nav" v-if="hasVNavSlot">
                    <slot name="v-nav"></slot>
                </div>
                <div class="dg-flex">
                    <dataform ref="form" :schemaID="schema" :editMode="true" :onSuccess="onSuccess"
                              :onError="onError"/>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    props: ["schema", "id"],

    mounted() {
        setTimeout(() => {
            this.$refs.form.editModel(this.$props.id);
        }, 500);
    },

    methods: {
        onSuccess(val) {
        },

        onError(val) {
        }
    }
};
</script>


