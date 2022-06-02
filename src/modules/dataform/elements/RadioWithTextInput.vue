<template>
    <FormItem :label=label :prop=rule>
        <RadioGroup v-model="model.form[model.component]">
            <Radio :label="item.value" v-for="item in options" :key=item.index
                   :disabled="meta && meta.disabled ? meta.disabled : false">
                <span>{{item.label}}</span>
            </Radio>
            <Radio :label="other">
                <span>Бусад:
                    <Input type="text" v-model="other"
                           placeholder="бичнэ үү"/>
                </span>
            </Radio>
        </RadioGroup>
    </FormItem>
</template>

<script>
    export default {
        props: ["model", "label", "rule", "meta"],
        data() {
            return {
                other: ''
            }
        },

        computed: {
            options() {
                this.other=this.model.form[this.model.component];

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
        }
    };
</script>
