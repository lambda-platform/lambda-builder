<template>

    <FormItem :label=label :prop=rule>
        <Input type="text" v-model="model.form[model.component]"
               :placeholder="meta && meta.placeHolder !== null ? meta.placeHolder : label">
            <Tooltip slot="append" content="Нууц үг үүсгэх" placement="left">
                <Button @click="generatePass()" icon="ios-key-outline"></Button>
            </Tooltip>
        </Input>
    </FormItem>

</template>

<script>
    export default {
        props: ["model", "label", "rule", "meta"],
        methods: {
            generatePass() {
                this.model.form[this.model.component] = Math.floor(
                    100000 + Math.random() * 900000
                );
            }
        }
    };
</script>
