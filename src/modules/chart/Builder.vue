<template>
    <div id="chart-builder">
        <TableList :loading="loading" v-if="!loading" />
        <div class="table-list ve-column" v-if="loading"></div>
        <ElementControl v-if="!loading" />
        <ElementPreview @saveSchema="saveSchema" v-if="!loading" />
    </div>
</template>

<script>
import draggable from "vuedraggable";


const TableList = ()=> import(/* webpackChunkName: "chart-table-list" */'./tableList/TableList.vue');
const ElementControl = ()=> import(/* webpackChunkName: "chart-element-control" */'./controls/ElementControl.vue');
const ElementPreview = ()=> import(/* webpackChunkName: "chart-element-preview" */'./elements/ElementPreview.vue');
import store from "./store/store";

import { mapGetters } from "vuex";

export default {
    props: ["onCreate", "onUpdate", "src", "editMode", "projectID"],
    methods: {

        saveSchema(name, schema) {
            schema.fields = this.fields;
            schema.filters = this.other.filters;

            let data = {
                name: name,
                schema: JSON.stringify(schema)
            };


            let defualtURL = `/lambda/puzzle/schema/chart`;
            if(this.projectID){
                defualtURL = `/lambda/puzzle/project/${this.projectID}/chart`
            }
            let submitUrl = this.$props.editMode
                ? this.$props.src
                : defualtURL;


            axios.post(submitUrl, data).then(o => {
                if (o.data.status) {
                    this.$Message.info("Амжилттай хадгаллаа");
                    this.$props.onCreate();
                } else {
                    this.$Message.info("Хадгалах үед алдаа гарлаа!");
                }
            });
        },
        init() {
            if (this.$props.editMode == true) {
                axios
                    .get(this.$props.src)
                    .then(o => {
                        this.$store.commit("setTitle", o.data.data.name);

                        let schema = JSON.parse(o.data.data.schema);

                        this.$store.commit("setSource", schema);



                        this.loading = false;
                    })
                    .catch(o => {
                        console.log(o);
                    });
            } else {
                // this.$store.replaceState(newState);
                this.$store.commit("reset", null);
                this.loading = false;
            }
        }
    },
    created() {
        this.init();
    },
    mounted() {},
    data() {
        return {
            loading: true
        };
    },
    components: {
        draggable,
        TableList,
        ElementControl,
        ElementPreview
    },
    computed: {
        ...mapGetters({
            fields: "fields",
            other: "other"
        })
    },
    store
};
</script>
