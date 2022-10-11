<template>
    <mSelect label="label"
             v-model="selected"
             :options="options"
             :placeholder="lang.choosevalue"
             :allow-empty="false"
             @input="valueChanged">
    </mSelect>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import mSelect from "vue-multiselect";
import {element} from "../elements/index";
import {getRelation} from "../utils/userFilter";

export default Vue.extend({
    components: {
        mSelect
    },
    computed: {
        lang() {
            const labels = ['choosevalue',
            ];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('dataGrid.' + labels[i]);
                return obj;
            }, {});
        },
    },
    data() {
        return {
            loading: true,
            options: [{'value': null, 'label': 'Бүгд'}],
            selected: {'value': null, 'label': 'Бүгд'},
            currentValue: null
        }
    },
    created() {
        console.log("filter model: ", this.params.filterModel);
        console.log("model: ", this.params.column.model);


        let dataUrl = `/lambda/krud/${this.params.schemaID}/options`;
        //get user condition
        this.params.column.filter.relation = getRelation(this.params.column.filter.relation);

        //get cascading options
        if (this.params.column.filter.relation.parentFieldOfForm != null && this.params.column.filter.relation.parentFieldOfTable != null) {
            this.$watch(this.params.filterData, {
                // this.$watch('params.filterModel.`${this.params.column.filter.relation.parentFieldOfTable}`', {
                handler: (value, oldValue) => {
                    let temp_relation = JSON.parse(JSON.stringify(this.params.column.filter.relation));
                    if (temp_relation.parentFieldOfForm != null && temp_relation.parentFieldOfTable != null) {

                        let condition = `${temp_relation.parentFieldOfTable}=${this.params.filterModel[temp_relation.parentFieldOfForm]}`;
                        if (temp_relation.filter == "" || typeof temp_relation.filter === "undefined") {
                            temp_relation.filter = condition;
                        } else {
                            temp_relation.filter = temp_relation.filter + " AND " + condition
                        }
                        axios.post(dataUrl, temp_relation).then(({data}) => {
                            this.options = [{'value': null, 'label': 'Бүгд'}];
                            this.options = this.options.concat(data);
                            this.loading = false;
                        });
                    }
                },
                deep: true
            });
        } else {
            //zaaval ajillana
            axios.post(dataUrl, this.params.column.filter.relation).then(({data}) => {
                this.options = [{'value': null, 'label': 'Бүгд'}];
                this.options = this.options.concat(data);
                this.loading = false;
            });
        }

    },

    methods: {
        element: element,
        setMeta(item) {
            item.schemaID = this.params.schemaID;
            return item;
        },

        valueChanged(v) {
            let val = 'value' in v ? v.value : v[0];
            this.params.filterData(this.params.column.model, val);
        },

        onParentModelChanged(parentModel) {
            console.log("parentModel");
            console.log(parentModel);
            this.currentValue = !parentModel ? null : parentModel.filter
        },
    }
});
</script>
