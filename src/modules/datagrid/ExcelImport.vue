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

        <div class="print-body">
            <div style="display: flex;
    padding: 20px;
    border-bottom: 1px dashed #eee;   justify-content: end;
    flex-direction: row;">
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
                <Button icon="i-icon ti-printer" type="default"
                        @click="excelImport">{{ lang.excelImportModalSaveBtn }}
                </Button>
            </div>

            <div v-if="summary==null" class="notif" style="height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    color: #ccc;">
                Эксел файлаа оруулаад өгөгдөл хадгалах товчийг дарна уу
            </div>
            <div v-else-if="summary==1" class="notif" style="height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    color: #149755;">
                Амжилттай хадгалагдлаа, Хүснэгтээ дахин ачаалж мэдээллээ шалгана уу

            </div>
            <div v-else style="padding: 20px">
                <div>
                <h3> Эксел файл оруулах үеийн лог </h3></div>
                <div>Доорх алдааг засаж дахин оруулна уу, алдаа гараагүй өгөгдлүүд баазад орсон</div>
                <div style="border-top:1px dotted #eee; padding: 20px; overflow-y: auto" >
                    <ul>
                        <li v-for="sum in summary" :key="sum">
                        {{sum.row}} - {{sum.error}}</li>
                    </ul>
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
            isLoading: true,
            excelForm: {
                excelFile: null,
                schemaID: this.schemaID
            },
            summary: null
        }
    },

    created() {
        console.log("schema:");
        console.log(this.schema);
        console.log(this.options);
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
            axios.post('/lambda/krud/import-excel', this.excelForm).then(res => {
                console.log("excelImport:");
                console.log(res.data);
                if (res.data.status) {
                    this.summary = 1;
                } else {
                    this.summary = res.data.data;
                }
            }).catch(e => {
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
