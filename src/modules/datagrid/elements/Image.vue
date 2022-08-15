<template>
    <img :src="`${baseUrl}${params.value}`" class="ag-grid-image"/>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
        computed: {
            baseUrl() {
                return this.params.baseUrl ? this.params.baseUrl : ""
            }
        }
    }
);
</script>
