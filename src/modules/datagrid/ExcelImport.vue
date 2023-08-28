<template>
    <section class="excel-import-container">
        <div class="excel-import-tools">
            <div class="excel-import-tools-left">
                <label>{{ lang.excelImportModalTitle }}</label>
            </div>

            <div class="excel-import-tools-right" style="display: flex">
                <a v-if="options.excelUploadSample" class="ivu-btn ivu-btn-default" :href="options.excelUploadSample"
                   download="Жишээ файл">Жишээ файл татах</a>
            </div>
        </div>

        <div class="excel-import-body">
            <div class="excel-import-btns">
                <Upload action="/lambda/krud/upload"
                        v-model="excelForm.excelFile"
                        :on-success="success"
                        class="ivu-btn ivu-btn-default"
                        style="width: 200px"
                        size="small">
                    <div class="file-upload-handler">
                        <span>Файл оруулах</span>
                    </div>
                </Upload>
                &nbsp;
                <Button icon="i-icon ti-upload" type="success" ghost
                        @click="excelImport">Илгээх
                </Button>
            </div>

            <div class="excel_upload_loading notif" v-if="isLoading" style="padding:20px">
                Ачаалж байна түр хүлээнэ үү ...
            </div>
            <div v-else>
                <div v-if="summary==null" class="notif" style="height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    padding:20px;
    text-align: center;
    color: #ababab;">
                    Эксел файлаа оруулаад өгөгдөл хадгалах товчийг дарна уу <br/>
                    /Дэмжих өргөтгөл .xlxs, .odt, .csv/
                </div>
                <div v-else-if="summary==1" class="notif" style="height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    color: #149755;">
                    <div>
                        Амжилттай хадгалагдлаа, Хүснэгтээ дахин ачаалж мэдээллээ шалгана уу
                    </div>
                    <br />
                    <div v-if="msg != null">{{ msg }}</div>
                </div>
                <div v-else style="padding: 20px">
                    <div>
                        <h3> Эксел файл оруулах үеийн лог </h3></div>
                    <div>Доорх алдааг засаж дахин оруулна уу, алдаа гараагүй өгөгдлүүд баазад орсон</div>
                    <div style="border-top:1px dotted #eee; padding: 20px; overflow-y: auto">
                        <ul>
                            <li v-for="sum in summary" :key="sum">
                                {{ sum.row }}-р мөр: {{ sum.error }}
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    </section>
</template>

<script>


export default {
    props: ["schemaID", "schema", "options"],
    data() {
        return {
            isLoading: false,
            excelForm: {
                excelFile: null,
                schemaID: this.schemaID
            },
            summary: null,
            msg: null
        }
    },

    computed: {
        lang() {
            const labels = ['excelImportModalTitle', 'excelImportModalSaveBtn'];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('dataGrid.' + labels[i]);
                return obj;
            }, {});
        },
    },
    methods: {
        excelImport() {
            this.isLoading = true;
            axios.post('/lambda/krud/import-excel', this.excelForm).then(res => {
                if (res.data.status) {
                    this.summary = 1;
                    this.msg = res.data.data;
                } else {
                    this.summary = res.data.data;
                }
                this.isLoading = false;
            }).catch(e => {
                this.isLoading = false;
                console.log(e.message);
            });

        },
        success(val) {
            this.excelForm.excelFile = val;
        },
    }
};
</script>

<style lang="scss">

@import "scss/print.scss";

</style>
