<template>
    <FormItem :prop=rule>
        <Upload type="drag" action="/lambda/krud/upload/" :on-success="success">
            <div class="upload-wrapper">
                <div class="preview" v-if="this.model.form[this.model.component] != null">
                    <img :src="this.model.form[this.model.component]" alt="">
                    <div class="upload-handler">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>Энд дарж зургаа сонгоно уу!</p>
                    </div>
                </div>
                <div v-else class="upload-handler">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>Энд дарж зургаа сонгоно уу!</p>
                </div>
            </div>
        </Upload>
    </FormItem>
</template>

<script>
export default {
    props: ["model", "label", "rule", "meta"],
    methods: {
        success(val) {
            this.model.form[this.model.component] = val;
        }
    }
};
</script>


