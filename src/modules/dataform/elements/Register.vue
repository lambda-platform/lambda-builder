<template>
    <FormItem :label=label :prop=rule>
        <div class="ivu-input-wrapper ivu-input-type form-item-register">
            <multiselect
                v-model="registerChar1"
                :disabled="meta && meta.disabled ? meta.disabled : false"
                :options="options"
                @input="registerChanged"
                track-by="value"
                :searchable="true"
                :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label ? label : ''"
                label="label"
                class="select-char first-char">
            </multiselect>
            <multiselect
                v-model="registerChar2"
                :disabled="meta && meta.disabled ? meta.disabled : false"
                :options="options"
                @input="registerChanged"
                track-by="value"
                :searchable="true"
                :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label ? label : ''"
                label="label"
                class="select-char second-char">
            </multiselect>

            <input class="ivu-input"
                   :disabled="meta && meta.disabled ? meta.disabled : false"
                   @change="registerChanged"
                   type="number"
                   v-model="registerNumber"/>
        </div>
        <div :id="`register_${model.component}`" class="ivu-form-item-error-tip"></div>
    </FormItem>
</template>

<script>
    export default {
        props: ["model", "label", "rule", "meta"],
        data() {
            return {
                registerNumber: null,
                registerChar1: {value: 'А', label: 'А'},
                registerChar2: {value: 'А', label: 'А'},
                options: [
                    {value: 'А', label: 'А'},
                    {value: 'Б', label: 'Б'},
                    {value: 'В', label: 'В'},
                    {value: 'Г', label: 'Г'},
                    {value: 'Д', label: 'Д'},
                    {value: 'Е', label: 'Е'},
                    {value: 'Ё', label: 'Ё'},
                    {value: 'Ж', label: 'Ж'},
                    {value: 'З', label: 'З'},
                    {value: 'И', label: 'И'},
                    {value: 'Й', label: 'Й'},
                    {value: 'К', label: 'К'},
                    {value: 'Л', label: 'Л'},
                    {value: 'М', label: 'М'},
                    {value: 'Н', label: 'Н'},
                    {value: 'О', label: 'О'},
                    {value: 'Ө', label: 'Ө'},
                    {value: 'П', label: 'П'},
                    {value: 'Р', label: 'Р'},
                    {value: 'С', label: 'С'},
                    {value: 'Т', label: 'Т'},
                    {value: 'У', label: 'У'},
                    {value: 'Ү', label: 'Ү'},
                    {value: 'Ф', label: 'Ф'},
                    {value: 'Х', label: 'Х'},
                    {value: 'Ц', label: 'Ц'},
                    {value: 'Ч', label: 'Ч'},
                    {value: 'Ш', label: 'Ш'},
                    {value: 'Щ', label: 'Щ'},
                    {value: 'Ъ', label: 'Ъ'},
                    {value: 'Ы', label: 'Ы'},
                    {value: 'Ь', label: 'Ь'},
                    {value: 'Э', label: 'Э'},
                    {value: 'Ю', label: 'Ю'},
                    {value: 'Я', label: 'Я'}
                ]
            };
        },
        computed: {
            registerLocal() {
                return this.model.form[this.model.component];
            }
        },
        watch: {
            registerLocal(value, oldValue) {
                if (value) {
                    let firstchar = value.charAt(0);
                    this.registerChar1 = {value: firstchar, label: firstchar};
                    let secondchar = value.charAt(1);
                    this.registerChar2 = {value: secondchar, label: secondchar};
                    this.registerNumber = value.substring(2, 10);
                }
                else{
                    this.registerNumber= null;
                    this.registerChar1= {value: 'А', label: 'А'};
                    this.registerChar2= {value: 'А', label: 'А'};
                }
            }
        },
        methods: {
            registerChanged() {
                this.model.form[this.model.component] = this.registerChar1.value + this.registerChar2.value;
                if(this.registerNumber)
                {
                    this.model.form[this.model.component]+=this.registerNumber;
                }
            }
        }
    };
</script>
