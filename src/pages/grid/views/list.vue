<template>
    <div>
        <list-view v-if="$project" :src="`/lambda/puzzle/project/${$project.id}/grid`" :title="lang.table" type="grid" :data="listData"></list-view>
        <list-view v-else src="/lambda/puzzle/schema/grid" :title="lang.table" type="grid" :data="listData"></list-view>
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
