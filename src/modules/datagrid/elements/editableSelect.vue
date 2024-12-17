<template>
    <Select v-model="value" :placeholder="lang.select" clearable filterable>
<!--    <Select v-model="value" :placeholder="placeholder" clearable filterable>-->
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
                placeholder: ''
            }
        },
        computed: {
            lang() {
                const labels = ['select',
                ];
                return labels.reduce((obj, key, i) => {
                    obj[key] = this.$t('dataSource.' + labels[i]);
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
            this.placeholder = this.params.column.label;
            console.log(this.params);
            console.log('re');
            console.log(this.params.column.filter.relation);
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
