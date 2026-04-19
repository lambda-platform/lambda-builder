<template>
    <div class="subform-image-wrapper">
        <Upload
            ref="upload"
            :with-credentials="true"
            v-model="model.form[model.component]"
            :action="`${url ? url : ''}/lambda/krud/upload`"
            :show-upload-list="false"
            class="subform-image"
            :class="{ 'has-value': hasValue, 'is-disabled': isDisabled }"
            :disabled="isDisabled"
            :on-success="success">
            <div class="subform-image-trigger" :title="label">
                <img
                    v-if="hasValue"
                    class="subform-img-preview"
                    :src="previewSrc"
                    :alt="label">
                <div v-else class="subform-image-placeholder">
                    <i class="ti ti-camera" aria-hidden="true"></i>
                </div>
                <button
                    v-if="hasValue && !isDisabled"
                    type="button"
                    class="subform-image-clear"
                    :aria-label="lang._delete || 'Remove'"
                    @click.stop="clear">
                    <i class="ti-close" aria-hidden="true"></i>
                </button>
            </div>
        </Upload>
    </div>
</template>

<script>
export default {
    props: ["model", "label", "rule", "meta", "do_render", "url"],

    computed: {
        lang() {
            const labels = ['_delete'];
            return labels.reduce((obj, key) => {
                obj[key] = this.$t('dataForm.' + key);
                return obj;
            }, {});
        },
        value() {
            return this.model && this.model.form ? this.model.form[this.model.component] : null;
        },
        hasValue() {
            return this.value != null && this.value !== '';
        },
        isDisabled() {
            return !!(this.meta && this.meta.disabled);
        },
        previewSrc() {
            if (!this.hasValue) return '';
            const base = this.url || '';
            const v = String(this.value);
            if (/^(https?:)?\/\//i.test(v) || v.startsWith('data:')) return v;
            return `${base}${v}`;
        },
    },

    methods: {
        success(val) {
            this.model.form[this.model.component] = val;
        },

        clear() {
            this.model.form[this.model.component] = null;
            if (this.$refs.upload) {
                this.$refs.upload.fileList = [];
            }
        },
    },
};
</script>
