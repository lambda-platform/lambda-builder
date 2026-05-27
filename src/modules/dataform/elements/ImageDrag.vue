<template>
    <FormItem :prop=rule>
        <Upload type="drag"
                :action="`${(cdn && cdn.remote) ? cdn.host : ''}/lambda/krud/upload${(cdn && cdn.user_dir) ? `?org=${cdn.org}&user=${cdn.user}` : ''}`"
                :on-success="success">
            <div class="upload-wrapper">
                <div class="preview" v-if="`${(cdn && cdn.remote) ? cdn.host : ''}${this.model.form[this.model.component] != null}`">
                    <img :src="this.model.form[this.model.component]" alt="">
                    <div class="upload-handler">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>{{lang.clickHereSelectPhoto}}</p>
                    </div>
                </div>
                <div v-else class="upload-handler">
                    <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                    <p>{{lang.clickHereSelectPhoto}}</p>
                </div>
            </div>
        </Upload>
    </FormItem>
</template>

<script>

export default {
    props: ["model", "label", "rule", "meta", "url", "cdn"],
    computed: {
        lang() {
            const labels = ['clickHereSelectPhoto', ''
            ];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('dataForm.' + labels[i]);
                return obj;
            }, {});
        },
    },
    methods: {
        success(val) {
            this.model.form[this.model.component] = val;
        }
    }
};
</script>


