<template>
    <div>
        <list-view src="/lambda/puzzle/schema/form" :title="lang._form" type="form"></list-view>
    </div>
</template>

<script>
import listView from "../../../components/listview.vue";

export default {
    components: {
        "list-view": listView
    },
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        lang() {
            const labels = ['_form',];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('puzzle.' + labels[i]);
                return obj;
            }, {});
        },
    }
};
</script>
