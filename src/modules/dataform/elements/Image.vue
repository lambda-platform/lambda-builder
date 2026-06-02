<template>
    <FormItem :label="label" :prop=rule>
        <div class="multi-upload" v-if="meta.file && meta.file.isMultiple == true">
            <div class="multi-upload-list">
                <div class="upload-list" v-for="item in uploadList" :key="item.index">
                    <template v-if="item.status == 'finished'">
                        <img v-if="item.response" :src="`${url ? url : ''}${item.response}`" @click="handleView(item.response)">
                        <div class="upload-control" @click="handleRemove(item)"
                             v-show="meta && meta.disabled ? false : true">{{ lang._delete }}
                        </div>
                    </template>

                    <template v-else>
                        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                    </template>
                </div>

                <Upload
                    ref="upload"
                    multiple
                    :with-credentials="true"
                    :action="`${url ? url : ''}/lambda/krud/upload`"
                    :show-upload-list="false"
                    :default-file-list="defaultList"
                    :on-success="success"
                    :before-upload="beforeUpload"
                    :disabled="meta && meta.disabled ? meta.disabled : false"
                >
                    <div class="upload-handler">
                        <i class="ti ti-camera"></i>
                    </div>
                </Upload>
            </div>
        </div>

        <div v-else class="single-upload">
            <div class="single-upload-card">
                <div class="single-upload-preview">
                    <Upload
                        ref="upload"
                        :with-credentials="true"
                        v-model="model.form[model.component]"
                        :action="`${url ? url : ''}/lambda/krud/upload`"
                        :on-success="success"
                        :disabled="meta && meta.disabled ? meta.disabled : false">
                        <Button type="dashed">
                            <img class="preview-img" v-if="this.model.form[this.model.component] != null"
                                 :src="`${url ? url : ''}${model.form[model.component]}`"
                                 alt="image">
                            <div>
                                <i class="ti ti-camera"></i>
                                {{ label }}
                            </div>
                        </Button>
                    </Upload>
                    <div v-if="model.form[model.component]"
                         class="single-upload-remove"
                         @click="handleSingleRemove"
                         v-show="meta && meta.disabled ? false : true"
                         :title="lang._delete">
                         <Icon type="close"></Icon>
                    </div>
                </div>

                <div class="single-upload-hint">
                    <div class="single-upload-title">Зураг оруулах</div>
                    <div class="single-upload-subtitle">
                        Файл байршуулах эсвэл доор URL хаягийг оруулна уу.
                    </div>
                </div>

                <div class="single-upload-url-row">
                    <Input v-model="urlInput"
                           placeholder="/uploaded/... or https://..."
                           :disabled="meta && meta.disabled ? meta.disabled : false"
                           @on-enter="addUrl"/>
                    <Button type="primary"
                            class="single-upload-add"
                            :disabled="meta && meta.disabled ? meta.disabled : false"
                            @click="addUrl">
                        <i class="ti ti-plus"></i>&nbsp;Add
                    </Button>
                </div>
            </div>
        </div>

        <Modal :title="lang.viewPhotos" v-model="showImage" width="1000px">
            <img

                 :src="`${url ? url : ''}${showImageUrl}`"
                 v-if="showImage" style="width: 100%">
        </Modal>
    </FormItem>
</template>

<script>

export default {
    props: ["model", "label", "rule", "meta", "do_render", "url"],
    computed: {
        lang() {
            const labels = ['viewPhotos', '_delete'
            ];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('dataForm.' + labels[i]);
                return obj;
            }, {});
        },
    },
    mounted() {
        this.uploadList = typeof this.$refs.upload.fileList != 'undefined' ? this.$refs.upload.fileList : [];
        this.urlInput = this.model.form[this.model.component] || '';
        this.$watch(
            () => this.model.form[this.model.component],
            (val) => {
                this.urlInput = val || '';
            }
        );
    },
    data() {
        return {
            defaultList: [],
            uploadList: [],
            showImage: false,
            showImageUrl: '',
            urlInput: ''
        }
    },

    watch: {
        'model.form'(val) {

            let itemModel = val[this.model.component];
            if (typeof this.meta.file.isMultiple !== 'undefined' && this.meta.file.isMultiple) {
                if (typeof itemModel == 'string' && typeof itemModel != 'undefined' && itemModel != null) {

                    let list = JSON.parse(this.model.form[this.model.component]);

                    if (Array.isArray(list)) {
                        this.defaultList = list.map(item => {
                            return {
                                status: 'finished',
                                response: item.response,
                                name: item.name
                            }
                        });

                        this.$nextTick(() => {
                            this.uploadList = this.$refs.upload.fileList;
                        })
                    }
                } else {
                    this.$refs.upload.fileList = [];
                    this.uploadList = [];
                    this.model.form[this.model.component] = null;
                }
            }
        },
        do_render(value) {
            if (!value) {

                this.$refs.upload.fileList = [];
            }
        }

    },

    methods: {

        handleView(imageUrl) {
            this.showImage = true;
            this.showImageUrl = imageUrl;
        },

        success(val) {

            if (this.meta.file.isMultiple) {
                this.uploadList = this.$refs.upload.fileList;
                this.model.form[this.model.component] = JSON.stringify(this.uploadList.map(item => {
                    return {
                        name: item.name,
                        response: item.response
                    }
                }));
            } else {
                this.model.form[this.model.component] = val;
            }
        },

        handleSingleRemove() {
            this.model.form[this.model.component] = null;
            this.urlInput = '';
            if (this.$refs.upload) {
                this.$refs.upload.fileList = [];
            }
        },

        addUrl() {
            const value = (this.urlInput || '').trim();
            if (!value) return;
            this.model.form[this.model.component] = value;
        },

        handleRemove(file) {
            const fileList = this.$refs.upload.fileList;
            this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
            this.uploadList = this.$refs.upload.fileList;
            this.model.form[this.model.component] = this.uploadList.map(item => {
                return {
                    name: item.name,
                    response: item.response
                }
            })
        },

        beforeUpload() {
            // const check = this.uploadList.length < 5;
            // if (!check) {
            //     this.$Notice.warning({
            //         title: 'Up to five pictures can be uploaded.'
            //     });
            // }
            // return check;
        }
    }
};
</script>

<style scoped>
.single-upload {
    display: block;
    max-width: 100%;
}

.single-upload-card {
    border: 1px solid #e5e7eb;
    border-radius: 5px;
    padding: 24px 20px 20px;
    background: #fff;
    text-align: center;
    max-width: 380px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.single-upload-preview {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
}

.single-upload-remove {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ed4014;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    font-size: 13px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: transform 0.15s ease, background 0.15s ease;
}

.single-upload-remove:hover {
    background: #c92a17;
    transform: scale(1.1);
}

.single-upload-hint {
    margin-bottom: 14px;
}

.single-upload-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
}

.single-upload-subtitle {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
}

.single-upload-url-row {
    display: flex;
    gap: 8px;
    align-items: stretch;
}

.single-upload-url-row >>> .ivu-input-wrapper {
    flex: 1;
}

.single-upload-add {
    flex-shrink: 0;
}
</style>
