<template>
    <FormItem :label=label :prop=rule>
        <Select v-if="!meta.relation.multiple" :disabled="meta.disabled" v-model="model.form[model.component]"
                :placeholder="meta && meta.placeHolder ? meta.placeHolder : label" filterable>
            <Option v-for="item in options" :key=item.index :value="item.value" v-if="isShow(item)">{{ item.label }}
            </Option>
        </Select>

        <Select v-else v-model="model.form[model.component]" :disabled="meta.disabled"
                :placeholder="meta && meta.placeHolder ? meta.placeHolder : label" filterable multiple>
            <Option v-for="item in options" :key=item.index :value="item.value" v-if="isShow(item)">{{ item.label }}
            </Option>
        </Select>
    </FormItem>
</template>

<script>
    import Button from "iview/src/components/button/button";

    export default {
        components: {Button},
        props: ["model", "rule", "label", "meta", "disabled", "relations"],
        methods: {
            isShow(item) {
                if (item.value && item.label) {
                    if (this.$props.meta.relation.parentFieldOfForm) {
                        if (this.$props.model.form[this.$props.meta.relation.parentFieldOfForm] == item.parent_value) {
                            return true;
                        }
                        else return false;
                    } else return true;
                } else return false;
            }
        },

        computed: {
            options() {
                if (typeof this.meta.options !== "undefined" && this.meta.options.length >= 1) {
                    return this.meta.options;
                } else if (this.relations) {
                    if (this.meta.relation.filter == "") {
                        if (this.relations[this.meta.relation.table]) {
                            if (this.relations[this.meta.relation.table]['data']) {
                                return this.relations[this.meta.relation.table]['data']
                            } else
                                return [];
                        } else
                            return [];
                    } else {
                        if (this.relations[this.meta.model]) {
                            if (this.relations[this.meta.model]['data']) {
                                return this.relations[this.meta.model]['data']
                            } else
                                return [];
                        } else
                            return [];
                    }
                }
            }
        }
    };
</script>
