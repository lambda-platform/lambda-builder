<template>
    <FormItem>
        <div class="multi-upload">
            <label>{{ label }}</label>

            <div class="multi-upload-list">
                <div class="upload-list" v-for="item in uploadList" :key="item.index">
                    <template>
                        <img v-if="item" :src="item">
                        <a class="upload-control" :href="item" download>Татах</a>
                    </template>
                </div>
            </div>
        </div>
    </FormItem>
</template>

<script>
    export default {
        props: ["model", "label", "rule", "meta", "do_render"],
        data(){
            return{
                uploadList:[]
            }
        },
        watch: {
            'model.form'(val) {
                this.uploadList = JSON.parse(this.model.form[this.model.component]);
            }
        },

    };
</script>


