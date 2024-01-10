<template>
        <FormItem class="select-item" :label=label :prop=rule>
            <div class="multi-checkbox">
                <div class="checkbox-header">
                    <Checkbox
                        :disabled="meta && meta.disabled ? meta.disabled : false"
                        :indeterminate="indeterminate"
                        :value="checkAll"
                        @click.prevent.native="handleCheckAll">{{ lang.all }} /{{ checkedItemsCount }}/</Checkbox>
                </div>
                <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
                    <Checkbox v-for="item in options" :label="item.label" :key=item.index :disabled="meta && meta.disabled ? meta.disabled : false"></Checkbox>
                </CheckboxGroup>
            </div>

        </FormItem>
</template>

<script>

import {isValid} from "../utils/methods"

export default {
    props: ["model", "rule", "label", "meta", "disabled", "relation_data", "do_render"],
    computed: {
        lang() {
            const labels = ['dataNotFound', 'all',];

            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('dataForm.' + labels[i]);
                return obj;
            }, {});
        },

        options() {
            this.checkedItemsCount = 0;
            if (isValid(this.meta) && isValid(this.meta.options) && this.meta.options.length >= 1) {
                if (this.searchval)
                    return this.filterOption(this.meta.options).filter(entry => entry.label.toLowerCase().includes(this.searchval.toLowerCase()));
                return this.filterOption(this.meta.options)
            } else {
                if (this.searchval)
                    return this.filterOption(this.relation_data).filter(entry => entry.label.toLowerCase().includes(this.searchval.toLowerCase()));
                return this.filterOption(this.relation_data);
            }
        },
    },
    data() {
        return {
            value: null,
            addAble: false,
            searchval: null,
            indeterminate: true,
            checkAll: false,
            checkAllGroup: null,
            checkedItemsCount: 0,
        }
    },

    watch: {
        do_render(value) {
            if (value == null) {
                this.value = null;
                Vue.set(this.model.form, this.model.component, this.meta.default ? this.meta.default : undefined);
            } else {
                if (this.model.form[this.model.component] != null && this.model.form[this.model.component] != undefined) {
                    let value = this.model.form[this.model.component];
                    //If multiple
                    if (this.meta.relation.multiple == true) {
                        let selectedData = value.toString().split(',');
                        this.value = this.options.filter(item => selectedData.includes(item.value.toString()));
                    } else {
                        let filtered = this.options.filter(item => item.value == value);
                        this.value = filtered.length >= 1 ? filtered[0] : null;
                    }
                }
            }
        },

        value(val) {
            if (val) {
                Vue.set(this.model.form, this.model.component, val.map(vv => vv['value']).join(','));
                let labels = [];
                val.forEach(item => {
                    let label = item.label;
                    labels.push(label);
                });
                this.checkAllGroup = labels;
                this.checkedItemsCount = labels.length;
            }
        },
    },

    created() {
        if (this.meta.relation.addAble && this.meta.relation.addFrom) {
            this.addAble = true;
        }
    },

    methods: {
        isValid: isValid,

        filterOption(options) {
            if (options) {
                // if (this.$props.meta.relation.parentFieldOfForm) {
                    if (this.$props.meta.relation.parentFieldOfForm || this.$props.model.form[this.$props.meta.relation.parentFieldOfForm] != null) {
                        let filteredOptions = options.filter(option => option.parent_value == this.$props.model.form[this.$props.meta.relation.parentFieldOfForm]);
                        this.initialValue(filteredOptions);
                        return filteredOptions;
                    } else {
                        return options ? options : [];
                    }
                // } else {
                //     this.initialValue(options);
                //     return options ? options : [];
                // }
            }
            return [];
        },

        initialValue(options) {
            if (this.model.form[this.model.component] != null || this.model.form[this.model.component] != "" || this.model.form[this.model.component] != undefined) {
                if (this.meta.relation.multiple == true && this.model.form[this.model.component] != null) {
                    let selectedData = this.model.form[this.model.component].toString().split(',');
                    let filtered = options.filter(item => selectedData.includes(item.value.toString()));
                    if (filtered.length >= 1)
                        this.value = filtered
                } else {
                    let filtered = options.filter(item => item.value == this.model.form[this.model.component]);
                    this.value = filtered.length >= 1 ? filtered[0] : null;
                }
            } else {
                this.value = null;
            }
        },

        onSuccess(val) {
            let setData = [];
            val.forEach(item => {
                let selectedOptions = this.options.filter(option => option.label === item);
                setData.push(selectedOptions[0].value);
            });
            let getData = setData.join(',');
            this.model.form[this.model.component] = getData;
        },

        handleCheckAll () {
            if (this.indeterminate) {
                this.checkAll = false;
            } else {
                this.checkAll = !this.checkAll;
            }
            this.indeterminate = false;

            if (this.checkAll) {
                let values = [];
                this.options.forEach(item => {
                    let value = item.label;
                    values.push(value);
                });
                this.checkAllGroup = values;
            } else {
                this.checkAllGroup = [];
            }
            this.checkedItemsCount = this.checkAllGroup.length;
            this.onSuccess(this.checkAllGroup);
        },
        checkAllGroupChange (data) {
            this.checkedItemsCount = 0;
            this.checkedItemsCount = data.length;
            if (data.length === this.options.length) {
                this.indeterminate = false;
                this.checkAll = true;
            } else if (data.length > 0) {
                this.indeterminate = true;
                this.checkAll = false;
            } else {
                this.indeterminate = false;
                this.checkAll = false;
            }
            this.onSuccess(data);
        }

    }
};
</script>
