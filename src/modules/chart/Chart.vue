<template>
    <div
        :class="type == 'AreaChart' || type == 'LineChart' || type == 'ColumnChart' ? 'chart-element-wide' : type == 'countBox' ? 'count-box' :'chart-element'"
        :style="minH ? `min-height: ${minH}`: ''">
        <Spin size="large" fix v-if="loading"></Spin>
        <component v-else :is="element(type)" v-bind="currentProperties" @changeFilter="changeFilter" :hideTitle="hideTitle"
                   :filters="filters" :hideZoom="hideZoom" :chart_filter="chart_filter" @unFilter="unFilter"
                   :limit="limit"
                   :id="id"></component>
    </div>
</template>

<script>
import {element} from "./elements";
export default {
    props: ["src", "id", "chart_filter", "hideTitle", "filters", "hideZoom", "minH", "limit"],
    data() {
        return {
            currentProperties: null,
            type: "",
            loading: true
        };
    },
    methods: {
        element: element,
        init() {
            this.loading = true;
            axios.get(this.$props.src)
                .then(o => {
                    this.currentProperties = JSON.parse(o.data.data.schema);
                    this.type = this.currentProperties.type;
                    this.loading = false;
                })
                .catch(o => {
                    console.log(o);
                });
        },
        changeFilter(event) {
            this.$emit("changeFilter", event);
        },
        unFilter() {
            this.$emit("unFilter");
        }
    },

    mounted() {
        this.init();
    },


    computed: {
        // currentProperties: function () {
        //     return {
        //         chart_title: this.title,
        //         ...JSON.parse(this.source)
        //     };
        // },
        // type: function () {
        //     let source = JSON.parse(this.source);
        //     return source.type
        // },
    }
};
</script>
