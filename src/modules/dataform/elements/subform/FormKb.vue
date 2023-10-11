<template>
    <Tabs value="tab_mn" class="kb-tabbed-form">
        <Tab-pane label="Монгол" name="tab_mn">
            <div class="kb-form-with-language">
                <dataform ref="kbmnform" :schemaID="form.formId"
                          :editMode="editIndexMn == 1 ? true : false"
                          :onSuccess="onSuccess"
                          :onReady="formReady"
                          :onError="onError"></dataform>
            </div>
        </Tab-pane>
        <Tab-pane label="Англи" name="tab_en">
            <div class="kb-form-with-language">
                <dataform ref="kbenform" :schemaID="form.formId"
                          :editMode="editIndexEn == 1 ? true : false"
                          :onSuccess="onSuccessEn"
                          :onReady="formReadyEn"
                          :onError="onErrorEn"></dataform>
            </div>
        </Tab-pane>
<!--        <Tab-pane label="Мэдээлэл зассан түүх" name="tab_rev" v-if="model.form.id">-->
<!--            <div>-->
<!--                <Alert show-icon>Бүтээгдэхүүн Мэдээлэл зассан түүх харах бол <a-->
<!--                    :href="`/kb/#/revision/history/${model.form.id}`" target="_blank">ЭНД</a> дарна-->
<!--                    уу-->
<!--                </Alert>-->
<!--            </div>-->
<!--        </Tab-pane>-->
    </Tabs>
</template>

<script>
const DataForm = () => import('../../Dataform');
export default {
    name: "FormKb",
    props: ["form", "model", "editMode", "relations", "formula", "url", "slug"],
    components: {
        "dataform": DataForm
    },
    mounted() {
        console.log("this.model:", this.slug);
        console.log(this.model);
        console.log(this.form);
    },
    data() {
        return {
            activeTab: 'tab_mn',
            editIndexMn: 0,
            editIndexEn: 0,
        }
    },
    methods: {
        editBySlug(slug) {
            this.$refs.kbmnform.editModelBySlug(slug, 2).then(result => {
                if (result === 1) {
                    this.editIndexMn = 1;
                }
                else{
                    this.editIndexMn = 0;
                    this.$refs.kbmnform.handleResetKb();
                }
                console.log('MN EDIT:', this.editIndexMn);
            });

            setTimeout(() => {
                this.$refs.kbenform.editModelBySlug(slug, 1)
                    .then(result => {
                        if (result === 1) {
                            this.editIndexEn = 1;
                        }
                        else{
                            this.editIndexMn = 0;
                            this.$refs.kbenform.handleResetKb();
                        }
                        console.log('EN EDIT:', this.editIndexEn);
                    });
            }, 1000);
        },
        formReady(formData, subSchema) {
        },
        onError() {
        },
        onSuccess(data) {
        },
        formReadyEn(formData, subSchema) {
        },
        onErrorEn() {
        },
        onSuccessEn(data) {
        },
    }
}
</script>

<style scoped>

</style>
