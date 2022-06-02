<template>

    <FormItem :label=label :prop=rule>
        <Input type="text" v-model="model.form[model.component]"
               :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label">
            <Tooltip slot="append" content="Дугаар үүсгэх" placement="left">
                <Button @click="generateNumber()" icon="ios-key-outline"></Button>
            </Tooltip>
        </Input>
    </FormItem>

</template>

<script>
    export default {
        props: ["model", "label", "rule", "meta"],
        methods: {
            generateNumber() {
                this.model.form[this.model.component] = Math.floor(
                    1000 + Math.random() * 900000
                );
            }
        }
    };
</script>
