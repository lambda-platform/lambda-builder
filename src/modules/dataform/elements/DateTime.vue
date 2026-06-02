<template>
    <FormItem :prop="rule" :label="label">
        <DatePicker
            type="datetime"
            :value="dateTimeValue"
            format="yyyy-MM-dd HH:mm"
            :placeholder="
                meta && meta.placeHolder !== null ? meta.placeHolder : label
            "
            :disabled="meta && meta.disabled ? meta.disabled : false"
            style="width: 100%;"
            @on-change="onChange"
        />
    </FormItem>
</template>

<script>
export default {
    props: ["model", "rule", "label", "meta"],
    computed: {
        dateTimeValue() {
            const value = this.model.form[this.model.component];
            if (!value) return null;
            let str = value;
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                str = str + "T01:01";
            }
            const d = new Date(str.replace("T", " ").replace(/-/g, "/"));
            return isNaN(d.getTime()) ? null : d;
        },
    },
    methods: {
        onChange(formatted) {
            if (!formatted) {
                this.model.form[this.model.component] = "";
                return;
            }
            this.model.form[this.model.component] = formatted.replace(" ", "T");
        },
    },
};
</script>
