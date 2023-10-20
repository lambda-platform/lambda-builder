<template>
    <FormItem class="select-item" :label=label :prop=rule>
<!--        <Select v-if="!meta.relation.multiple" :disabled="meta && meta.disabled ? meta.disabled : false"-->
<!--                v-model="model.form[model.component]"-->
<!--                :placeholder="meta && meta.placeHolder ? meta.placeHolder : label"-->
<!--                @on-clear="onClear">-->
<!--            <Option v-for="item in options" :key=item.index :value="item.value" v-if="isShow(item)">-->
<!--                {{ item.label }}-->
<!--            </Option>-->
<!--        </Select>-->

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
// import {isValid} from "../utils/methods";

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
            console.log('run');
            // console.log(isValid(this.meta));
            // console.log(isValid(this.meta.options));
            console.log(this.meta.options);
            // if (isValid(this.meta) && isValid(this.meta.options) && this.meta.options.length >= 1) {
            //     if (this.searchval)
            //         return this.filterOption(this.meta.options).filter(entry => entry.label.toLowerCase().includes(this.searchval.toLowerCase()));
            //     return this.filterOption(this.meta.options)
            // } else {
            //     if (this.searchval)
            //         return this.filterOption(this.relation_data).filter(entry => entry.label.toLowerCase().includes(this.searchval.toLowerCase()));
            //     return this.filterOption(this.relation_data);
            // }
        },
        // options() {
        //     if (typeof this.meta.options !== "undefined" && this.meta.options.length >= 1) {
        //         console.log('options');
        //         console.log(this.meta.options);
        //         return this.meta.options;
        //     } else {
        //         return this.relation_data;
        //         console.log('rel options');
        //         console.log(this.relation_data);
        //     }
        // },
    },
    data () {
        return {
            indeterminate: true,
            checkAll: false,
            checkAllGroup: ['Сурагч4', 'Сурагч5'],
            checkedItemsCount: 0,
        }
    },

    watch: {
        do_render(value) {
            console.log(this.meta.options);
            console.log('in this world1');
            console.log(value);
            console.log(this.model.form[this.model.component]);
            console.log(this.model.component);
        },

        value(val) {
            // Vue.set(this.model.form, this.model.component, val.map(vv => vv['value']).join(','));
            console.log('in this world');
            console.log(val);
            console.log(this.model.form[this.model.component]);
        },
    },

    created() {
        console.log('parentFieldOfForm');
        console.log(this.$props.model.form[this.$props.model.component]);
        if (this.meta.relation.addAble && this.meta.relation.addFrom) {
            this.addAble = true;
        } else {
            this.checkedItemsCount = this.checkAllGroup.length;
        }
    },
    methods: {
        // isValid: isValid,
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
        },
        checkAllGroupChange (data) {
            this.checkedItemsCount = data.length;
            if (data.length === 3) {
                this.indeterminate = false;
                this.checkAll = true;
            } else if (data.length > 0) {
                this.indeterminate = true;
                this.checkAll = false;
            } else {
                this.indeterminate = false;
                this.checkAll = false;
            }
            console.log(this.options)
            console.log(this.checkAllGroup)
        }
    }
};
</script>
