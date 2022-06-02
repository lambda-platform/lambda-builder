<template>
    <FormItem :label=label :prop=rule>
        <DatePicker v-if="model.form[model.component] === null && meta.disabled" :value="now"
                    type="datetime" v-model="now"
                    placement="bottom-end" :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label"
                    :disabled="meta && meta.disabled ? meta.disabled : false"
                    format="yyyy-MM-dd HH:mm"
        ></DatePicker>
        <DatePicker v-else :value="model.form[model.component] ? model.form[model.component] : undefined"
                    type="datetime" v-model="model.form[model.component]" @on-change="getDateValue"
                    placement="bottom-end" :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label"
                    :disabled="meta && meta.disabled ? meta.disabled : false"
        ></DatePicker>

    </FormItem>
</template>

<script>
import { toDateTime, now } from "../utils/date";
export default {
    props: ["model", "rule", "label", "meta", "do_render"],
    data(){
        return {
            now: now()
        }
    },
    watch:{
        do_render(value, oldValue) {
            if(!oldValue && value){
                return this.now = now();
            }
        }
    },
    methods: {
        getDateValue(value) {
            this.clearValue(value);
            if (!(typeof value === "string" || value instanceof String)) {
                this.model.form[this.model.component] = toDateTime(
                    this.model.form[this.model.component]
                );
            }else {
                this.model.form[this.model.component] = value
            }
        },
        clearValue(value){
            if(value=='') {
                this.model.form[this.model.component] = null;
            }
        },
    },
    mounted() {
        this.clearValue(this.model.form[this.model.component]);
    }
};
</script>
