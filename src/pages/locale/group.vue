<template>
    <div class="page-locale-sub">
        <krud class="material" :template="property.template" :property="property">
            <template slot="nav">
                <slot name="nav"></slot>
            </template>
            <user-control slot="right"></user-control>
        </krud>
    </div>
</template>

<script>
export default {
    name: "translation-group",
    data() {
        return {
            property: {
                template: "canvas",
                title: 'Орчуулгын бүлэг',
                grid: '459',
                form: '460',
                gridSelector: false,
                permissions: {
                    c: true,
                    r: true,
                    u: true,
                    d: true
                },
                actions: [],
            }
        }
    }
}
</script>

<style scoped>

</style>
