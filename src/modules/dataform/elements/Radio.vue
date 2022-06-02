<template>
    <FormItem :label=label :prop=rule>
        <RadioGroup v-model="selected" @on-change="radioChanged">
            <Radio :label="`${item.value}-selected`" v-for="item in options" :key=item.index
                   :disabled="meta && meta.disabled ? meta.disabled : false">
                <span>{{ item.label }}</span>
            </Radio>
        </RadioGroup>
    </FormItem>
</template>

<script>
export default {
    props: ["model", "label", "rule", "meta"],
    data() {
        return {
            selected: null
        }
    },
    watch: {
        model: function (newVal, oldVal) { // watch it
            this.selected = newVal.form[newVal.component] != null ? newVal.form[newVal.component].toString() + '-selected' : null
        }
    },
    computed: {
        options() {
            if (this.meta.options.length >= 1) {
                return this.meta.options;
            } else if (this.relations) {
                if (this.relations[this.meta.relation.table]) {
                    if (this.relations[this.meta.relation.table]['data']) {
                        return this.relations[this.meta.relation.table]['data']
                    } else
                        return [];
                } else
                    return [];
            }
        }
    },
    methods: {
        radioChanged(val){
            if(val) {
                let localVal = val.split('-');
                this.model.form[this.model.component] = localVal[0];
            }
        }
    }
};
</script>
