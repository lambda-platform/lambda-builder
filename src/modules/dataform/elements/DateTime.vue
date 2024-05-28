<template>
    <FormItem :label=label :prop=rule>
        <DatePicker
            type="datetime" v-model="dateData"
            @on-change="getDateValue"
            :key="model.form[model.component]"
            placement="bottom-end"
            :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label"
            :disabled="meta && meta.disabled ? meta.disabled : false"
            format="yyyy-MM-dd HH:mm"/>
    </FormItem>
</template>

<script>
import {toDateTime, now} from "../utils/date";

export default {
    props: ["model", "rule", "label", "meta", "do_render"],
    data() {
        return {
            now: now(),
            dateData: this.model.form[this.model.component]
        }
    },

    mounted() {
        this.clearValue(this.model.form[this.model.component]);
    },

    watch: {
        do_render(value, oldValue) {
            if (!oldValue && value) {
                return this.now = now();
            }
        },
    },

    methods: {
        getDateValue(value) {
            this.clearValue(value);
            if (!(typeof value === "string" || value instanceof String)) {
                this.model.form[this.model.component] = toDateTime(this.model.form[this.model.component]);
            } else {
                this.model.form[this.model.component] = value;
            }
            this.dateData = this.model.form[this.model.component];
        },
        clearValue(value) {
            if (value === '') {
                this.model.form[this.model.component] = null;
                this.dateData = null;
            }
        },
    },
};
</script>
