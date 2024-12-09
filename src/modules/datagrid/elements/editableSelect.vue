<template>
    <Select v-model="value" :placeholder="lang.type" clearable filterable>
        <Option v-for="item in options" :value="item.label" :key="item.label">{{ item.label }}
        </Option>
    </Select>
</template>
<script>
import Vue from "vue";
import axios from "axios";
import {getRelation} from "../utils/userFilter";

export default Vue.extend(
    {
        data() {
            return {
                options: [],
                value: '',
            }
        },
        computed: {
            lang() {
                const labels = ['type',
                ];
                return labels.reduce((obj, key, i) => {
                    obj[key] = this.$t('dataGrid.' + labels[i]);
                    return obj;
                }, {});
            },
        },
        created() {
            this.value = this.params.value;
            let dataUrl = `/lambda/krud/${this.params.id}/options`;
            this.params.column.filter.relation = getRelation(this.params.column.filter.relation);
            axios.post(dataUrl, getRelation(this.params.column.filter.relation)).then(({data}) => {
                this.options = data;
            });
        },
        methods: {
            getValue() {
                return this.value;
            },
        },
    })
</script>

<style scoped>

</style>
