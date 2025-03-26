<template>
    <input class="ag-grid-custom-text-filter" @input="onFilterChange"/>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import {element} from "../elements";
import {getRelation} from "../utils/userFilter";
import debounce from 'lodash.debounce';
export default Vue.extend({
    data() {
        return {
            options: [],
            selected: '',
            currentValue: null
        }
    },

    created() {
        this.onFilterChange = debounce(this.onFilterChange, 300);
    },

    methods: {
        element: element,

        onFilterChange(e) {
            this.valueChanged(e);
        },

        valueChanged(e) {
            if (this.params.isClient) {
                this.params.filterData(this.params.column.model, e.target.value, 'contains');
            } else {
                this.params.filterData(this.params.column.model, e.target.value);
            }
        }
    }
});
</script>
