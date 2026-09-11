<template>
    <div class="h5p-viewer-component">
        <div v-if="loading" class="h5p-loading">
            <div class="h5p-spinner"></div>
            {{ lang.loading }}
        </div>
        <div v-else-if="error" class="h5p-error">{{ error }}</div>
        <div v-else class="h5p-holder">
            <div v-if="isIframeEmbed" class="h5p-iframe-wrapper">
                <iframe
                    :id="'h5p-iframe-' + contentId"
                    class="h5p-iframe"
                    :data-content-id="contentId"
                    style="height: 1px"
                    src="about:blank"
                    frameborder="0"
                    scrolling="no"
                    :title="title"
                ></iframe>
            </div>
            <div v-else class="h5p-content" :data-content-id="contentId"></div>
        </div>
    </div>
</template>

<script>
import { loadH5PAssets, mergeH5PIntegration } from "../utils/h5p";
import { makeLang } from "../utils/lang";

export default {
    name: "H5pViewer",
    props: {
        contentId: { type: [Number, String], required: true },
        /** Lambda H5P модулийн backend endpoint-уудын суурь зам */
        baseUrl: { type: String, default: "/lambda/h5p" },
    },
    data() {
        return {
            loading: true,
            error: null,
            settings: null,
        };
    },
    computed: {
        /** Lambda bundle дотор Vue.prototype.$http байдаггүй */
        http() {
            return this.$http || window.axios;
        },
        lang() {
            return makeLang(this, {
                loading: "Ачаалж байна…",
                load_error: "H5P контент ачаалж чадсангүй",
            });
        },
        cid() {
            return "cid-" + this.contentId;
        },
        content() {
            return (this.settings && this.settings.contents
                ? this.settings.contents[this.cid]
                : null);
        },
        isIframeEmbed() {
            return !!(this.content && this.content.scripts && this.content.scripts.length);
        },
        title() {
            return (this.content && this.content.title) || "H5P";
        },
    },
    watch: {
        contentId() {
            this.load();
        },
    },
    mounted() {
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            this.error = null;
            try {
                const { data: settings } = await this.http.get(
                    this.baseUrl + "/content-settings/" + this.contentId
                );
                this.settings = settings;

                mergeH5PIntegration(settings);
                await loadH5PAssets({
                    css: [
                        ...settings.core.styles,
                        ...(settings.loadedCss || []),
                    ],
                    js: [
                        ...settings.core.scripts,
                        ...(settings.loadedJs || []),
                    ],
                });

                this.loading = false;
                await this.$nextTick();

                // h5p.js-ийн автомат init аль хэдийн ажилласан байж болзошгүй
                // тул өөрийн element дээр гараар дуудна (idempotent)
                if (window.H5P && window.H5P.init) {
                    window.H5P.init(this.$el);
                }
            } catch (e) {
                this.loading = false;
                this.error = this.lang.load_error + ": " + (e.message || e);
            }
        },
    },
};
</script>

<style scoped>
.h5p-holder {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06);
    overflow: hidden;
}
.h5p-iframe-wrapper >>> .h5p-iframe,
.h5p-iframe-wrapper .h5p-iframe {
    width: 100%;
    border: none;
    display: block;
}
.h5p-loading,
.h5p-error {
    padding: 48px 32px;
    text-align: center;
    font-size: 14px;
    color: #6b7280;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
}
.h5p-error {
    color: #b91c1c;
}
</style>
