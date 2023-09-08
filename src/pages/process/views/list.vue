<template>
    <div>
        <list-view src="/lambda/process/list" title="Процесс автоматжуулалт" type="process" :data="listData"></list-view>
    </div>
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
            const labels = ['table',];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('puzzle.' + labels[i]);
                return obj;
            }, {});
        },
    }
};
</script>
