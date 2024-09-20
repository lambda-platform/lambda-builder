<template>
    <h1>report list</h1>
<!--    <list-view src="/lambda/puzzle/schema/report" :title="lang._report" type="report" :data="listData" ></list-view>-->
</template>

<script>
import listView from "../../../components/listview.vue";

export default {
    components: {
        "list-view": listView
    },
    methods: {

    },
    computed: {
        lang() {
            const labels = ['_report',];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('puzzle.' + labels[i]);
                return obj;
            }, {});
        },
    }
};
</script>
