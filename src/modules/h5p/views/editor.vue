<template>
    <div class="h5p-editor-component">
        <div class="h5p-steps">
            <button
                type="button"
                class="h5p-step"
                :class="{ active: step === 1, done: step === 2 }"
                :disabled="!!currentId"
                @click="goStep1"
            >
                <span class="h5p-step-num">
                    <template v-if="step === 2">✓</template>
                    <template v-else>1</template>
                </span>
                {{ lang.step_type }}
            </button>
            <span class="h5p-step-line" :class="{ done: step === 2 }"></span>
            <button type="button" class="h5p-step" :class="{ active: step === 2 }" disabled>
                <span class="h5p-step-num">2</span>
                {{ lang.step_content }}
            </button>
        </div>

        <div class="h5p-toolbar" v-show="step === 2">
            <input
                v-model="title"
                type="text"
                class="h5p-title-input"
                :placeholder="lang.title_placeholder"
            />
            <a v-if="formTools.tutorial" class="h5p-btn" :href="formTools.tutorial" target="_blank" rel="noopener">
                {{ lang.tutorial }}
            </a>
            <a v-if="formTools.example" class="h5p-btn" :href="formTools.example" target="_blank" rel="noopener">
                {{ lang.example_short }}
            </a>
            <button v-if="formTools.copy" class="h5p-btn" type="button" @click="clickIframeButton('.h5peditor-copy-button')">
                {{ lang.copy }}
            </button>
            <button v-if="formTools.paste" class="h5p-btn" type="button" :disabled="formTools.pasteDisabled"
                @click="clickIframeButton('.h5peditor-paste-button')">
                {{ lang.paste }}
            </button>
            <button v-if="formTools.fullscreen" class="h5p-btn h5p-icon-btn" type="button" :title="lang.fullscreen"
                @click="clickIframeButton('.h5peditor-form-manager-fullscreen')">
                ⛶
            </button>
            <button class="h5p-btn primary h5p-save-btn" :disabled="saving || loading" @click="save">
                <span v-if="saving" class="h5p-btn-spinner"></span>
                {{ saving ? lang.saving : lang.save }}
            </button>
        </div>

        <div v-if="error" class="h5p-status err">{{ error }}</div>

        <!-- Карт хүрээгүй: tab бар нь container-аас гадна харагдаж, панель бүр
             iframe дотроо өөрийн карттай (patch css) -->
        <div ref="editorWrap" class="h5p-editor-holder">
            <div v-if="loading" class="h5p-loading h5p-card">
                <div class="h5p-spinner"></div>
                {{ lang.loading }}
            </div>
        </div>

        <div v-if="status" class="h5p-status ok">
            {{ status }}
            <a v-if="savedId" href="javascript:void(0)" @click="$emit('view', savedId)">{{ lang.view }}</a>
        </div>

        <Modal v-model="infoModal" :width="720" footer-hide class-name="h5p-info-modal">
            <div v-if="infoData" class="h5p-info">
                <div class="h5p-info-head">
                    <img v-if="infoData.icon" :src="infoData.icon" class="h5p-info-icon" alt=""/>
                    <div>
                        <h3 class="h5p-info-title">{{ infoData.title }}</h3>
                        <p v-if="infoData.owner" class="h5p-info-owner">{{ infoData.owner }}</p>
                    </div>
                </div>
                <p v-if="infoData.description" class="h5p-info-desc">{{ infoData.description }}</p>
                <div v-if="infoData.screenshots.length" class="h5p-info-shots">
                    <img v-for="(s, i) in infoData.screenshots" :key="i" :src="s" alt="" @click="shotPreview = s"/>
                </div>
                <a v-if="infoData.example" :href="infoData.example" target="_blank" rel="noopener" class="h5p-info-example">
                    {{ lang.example }} ↗
                </a>

                <div v-if="infoData.canInstall" class="h5p-info-install">
                    <button class="h5p-btn primary" :disabled="installing" @click="installFromModal">
                        <span v-if="installing" class="h5p-btn-spinner"></span>
                        {{ installing ? lang.installing : lang.install }}
                    </button>
                    <span v-if="installError" class="h5p-info-install-err">{{ installError }}</span>
                </div>

                <!-- Modal-ийн stacking context дотор — үндсэн modal-ийн ДЭЭР гарна -->
                <div v-if="shotPreview" class="h5p-shot-preview" @click="shotPreview = null">
                    <img :src="shotPreview" alt=""/>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
import { loadH5PAssets, mergeH5PIntegration } from "../utils/h5p";
import { makeLang } from "../utils/lang";

export default {
    name: "H5pEditor",
    props: {
        /** Засварлах контентын ID (шинэ бол хоосон орхино) */
        contentId: { type: [Number, String], default: null },
        /** Lambda H5P модулийн backend endpoint-уудын суурь зам */
        baseUrl: { type: String, default: "/lambda/h5p" },
        /** brnysn/laravel-h5p багцын контент хадгалах endpoint */
        saveUrl: { type: String, default: "/api/admin/hh5p/content" },
    },
    data() {
        return {
            loading: true,
            saving: false,
            error: null,
            status: null,
            title: "",
            settings: null,
            editor: null,
            currentId: this.contentId,
            savedId: null,
            step: 1,
            stepTimer: null,
            infoModal: false,
            infoData: null,
            shotPreview: null,
            installing: false,
            installError: null,
            formTools: { tutorial: null, example: null, copy: false, paste: false, pasteDisabled: false, fullscreen: false },
        };
    },
    computed: {
        /** Lambda bundle дотор Vue.prototype.$http байдаггүй */
        http() {
            return this.$http || window.axios;
        },
        lang() {
            return makeLang(this, {
                title_placeholder: "Гарчиг",
                save: "Хадгалах",
                saving: "Хадгалж байна…",
                saved: "Амжилттай хадгаллаа.",
                view: "Үзэх",
                loading: "Ачаалж байна…",
                load_error: "H5P editor ачаалж чадсангүй",
                save_error: "Хадгалахад алдаа гарлаа",
                incomplete: "Контент бүрэн бөглөгдөөгүй байна.",
                no_library: "Контентын төрөл сонгогдоогүй байна.",
                step_type: "Төрөл сонгох",
                step_content: "Агуулга бэлдэх",
                step_back_confirm: "Төрөл дахин сонговол одоогийн агуулга устна. Үргэлжлүүлэх үү?",
                example: "Жишээ үзэх",
                install: "Суулгах",
                installing: "Суулгаж байна…",
                install_error: "Суулгахад алдаа гарлаа",
                tutorial: "Заавар",
                example_short: "Жишээ",
                copy: "Хуулах",
                paste: "Буулгаж солих",
                fullscreen: "Бүтэн дэлгэц",
            });
        },
    },
    watch: {
        contentId(val) {
            this.currentId = val;
            this.boot();
        },
    },
    mounted() {
        this._onHubMessage = (e) => {
            const d = e && e.data;
            if (d && d.__h5pHubInfo) {
                this.openInfo(String(d.__h5pHubInfo.title || "").trim(), { install: !!d.__h5pHubInfo.install });
            }
        };
        window.addEventListener("message", this._onHubMessage);
        this.boot();
    },
    beforeDestroy() {
        this.stopStepWatch();
        window.removeEventListener("message", this._onHubMessage);
        if (this._editorLoadedListener && window.H5P && window.H5P.externalDispatcher) {
            window.H5P.externalDispatcher.off("editorloaded", this._editorLoadedListener);
        }
    },
    methods: {
        /** Editor дотор төрөл сонгогдсон эсэхийг ажиглаж wizard-ийн алхмыг шилжүүлнэ */
        startStepWatch() {
            this.stopStepWatch();
            this.stepTimer = setInterval(() => {
                let lib = null;
                try {
                    lib = this.editor && this.editor.getLibrary && this.editor.getLibrary();
                } catch (e) {
                    lib = null;
                }
                this.step = lib ? 2 : 1;
                this.applyStepClass();
                this.syncFormTools();
            }, 400);
        },

        /** Iframe доторх Заавар/Жишээ/Хуулах/Буулгах хэрэгслүүдийн төлвийг уншина */
        syncFormTools() {
            const iframe = this.$refs.editorWrap && this.$refs.editorWrap.querySelector("iframe");
            const doc = iframe && iframe.contentDocument;
            const q = (s) => (doc ? doc.querySelector(s) : null);

            const tut = q(".h5p-tutorial-url");
            const ex = q(".h5p-example-url");
            const copy = q(".h5peditor-copy-button");
            const paste = q(".h5peditor-paste-button");

            this.formTools = {
                tutorial: tut ? tut.href : null,
                example: ex ? ex.href : null,
                copy: !!copy,
                paste: !!paste,
                pasteDisabled: !!(paste && (paste.disabled ||
                    paste.getAttribute("aria-disabled") === "true" ||
                    paste.classList.contains("disabled"))),
                fullscreen: !!q(".h5peditor-form-manager-fullscreen"),
            };
        },

        clickIframeButton(selector) {
            const iframe = this.$refs.editorWrap && this.$refs.editorWrap.querySelector("iframe");
            const doc = iframe && iframe.contentDocument;
            const el = doc && doc.querySelector(selector);
            if (el) el.click();
        },

        /** Hub-ийн info/татах товчноос ирсэн төрлийн мэдээллийг iView Modal-д харуулна */
        async openInfo(title, opts) {
            const wantInstall = !!(opts && opts.install);
            this.installError = null;
            try {
                if (!this._ctCache) {
                    const { data } = await this.http.get("/api/hh5p/content-type-cache");
                    this._ctCache = (data && data.libraries) || [];
                }
                const lib = this._ctCache.find((l) => String(l.title || "").trim() === title) || null;

                let shots = [];
                if (lib && lib.screenshots) {
                    const raw = typeof lib.screenshots === "string"
                        ? JSON.parse(lib.screenshots)
                        : lib.screenshots;
                    shots = (raw || []).map((s) => (s && s.url ? s.url : s)).filter(Boolean);
                }

                this.infoData = {
                    title: (lib && lib.title) || title,
                    icon: (lib && lib.icon) || null,
                    owner: (lib && lib.owner) || null,
                    description: (lib && (lib.description || lib.summary)) || null,
                    example: (lib && lib.example) || null,
                    screenshots: shots,
                    machineName: (lib && (lib.machineName || lib.machine_name)) || null,
                    canInstall: wantInstall && !!(lib && (lib.machineName || lib.machine_name)),
                };
            } catch (e) {
                this.infoData = {
                    title, icon: null, owner: null, description: null, example: null,
                    screenshots: [], machineName: null, canInstall: false,
                };
            }
            this.infoModal = true;
        },

        /** Modal доторх "Суулгах" — суулгаад шууд тухайн төрлөөр агуулга бэлдэх рүү орно */
        async installFromModal() {
            if (!this.infoData || !this.infoData.machineName) return;
            this.installing = true;
            this.installError = null;
            try {
                const token = (this.settings && this.settings.token) || "";
                await this.http.post(
                    "/api/hh5p/library-install?id=" + encodeURIComponent(this.infoData.machineName) +
                        (token ? "&_token=" + encodeURIComponent(token) : ""),
                    {},
                    { headers: { Authorization: "Bearer " + token } }
                );
                this._ctCache = null; // дараагийн нээлтэд шинэ төлөвөөр
                const title = this.infoData.title;
                this.infoModal = false;
                // Iframe доторх hub-д "энэ төрлийг шууд ашигла" гэж дамжуулна
                const iframe = this.$refs.editorWrap && this.$refs.editorWrap.querySelector("iframe");
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ __h5pHubUse: { title } }, "*");
                }
            } catch (e) {
                this.installError = this.lang.install_error + ": " +
                    ((e.response && e.response.data && e.response.data.message) || e.message);
            } finally {
                this.installing = false;
            }
        },
        stopStepWatch() {
            if (this.stepTimer) {
                clearInterval(this.stepTimer);
                this.stepTimer = null;
            }
        },
        /** Алхамын төлвийг editor iframe-ийн root дээр class болгож тавина (same-origin) */
        applyStepClass() {
            const iframe = this.$refs.editorWrap && this.$refs.editorWrap.querySelector("iframe");
            const doc = iframe && iframe.contentDocument;
            if (!doc || !doc.documentElement) return;

            doc.documentElement.classList.toggle("h5p-wizard-step2", this.step === 2);

            // Style-ийг iframe-д шууд inject хийнэ — patch css-ийн кэшээс хамаарахгүй
            if (doc.head && !doc.getElementById("h5p-wizard-style")) {
                const st = doc.createElement("style");
                st.id = "h5p-wizard-style";
                st.textContent = ".h5p-wizard-step2 .h5p-hub{display:none !important;}";
                doc.head.appendChild(st);
            }
        },
        goStep1() {
            if (this.currentId || this.step === 1) return;
            if (!window.confirm(this.lang.step_back_confirm)) return;
            this.step = 1;
            this.boot();
        },
        async boot() {
            this.loading = true;
            this.error = null;
            this.status = null;
            try {
                const url =
                    this.baseUrl + "/editor-settings" +
                    (this.currentId ? "?id=" + this.currentId : "");
                const { data: settings } = await this.http.get(url);
                this.settings = settings;

                mergeH5PIntegration(settings);
                await loadH5PAssets({
                    css: settings.editor.assets.css,
                    js: settings.editor.assets.js,
                });

                const ed = settings.editor;
                const H5PEditor = window.H5PEditor;
                H5PEditor.$ = window.H5P.jQuery;
                H5PEditor.basePath = ed.libraryUrl;
                H5PEditor.fileIcon = ed.fileIcon;
                H5PEditor.ajaxPath = ed.ajaxPath;
                H5PEditor.filesPath = ed.filesPath;
                H5PEditor.apiVersion = ed.apiVersion;
                H5PEditor.copyrightSemantics = ed.copyrightSemantics;
                H5PEditor.metadataSemantics = ed.metadataSemantics;
                H5PEditor.assets = ed.assets;
                H5PEditor.baseUrl = "";
                H5PEditor.contentLanguage = ed.language || "en";
                if (ed.nodeVersionId !== undefined) {
                    H5PEditor.contentId = ed.nodeVersionId;
                }

                // Одоо байгаа контентыг ачаалж байвал library/params-ийг урьдчилж өгнө
                let library = "";
                let params = "";
                const content = this.currentId
                    ? (settings.contents || {})["cid-" + this.currentId]
                    : null;
                if (content) {
                    library = content.library;
                    params = content.jsonContent;
                    try {
                        const meta = JSON.parse(content.jsonContent).metadata || {};
                        this.title = meta.title || content.title || "";
                    } catch (e) {
                        this.title = content.title || "";
                    }
                }

                this.loading = false;
                await this.$nextTick();

                // Editor нь өгсөн element-ийг ОРЛУУЛДАГ тул боот бүрт шинэ
                // холдер үүсгэнэ (дахин боотлоход wrapper-ээ алдахгүй)
                const holder = document.createElement("div");
                this.$refs.editorWrap.innerHTML = "";
                this.$refs.editorWrap.appendChild(holder);
                this.editor = new H5PEditor.Editor(library, params, holder);

                this.step = library ? 2 : 1;
                this.startStepWatch();

                // Төрөл сонгогдож editor ачаалмагц event-ээр шууд 2-р алхам руу
                if (window.H5P && window.H5P.externalDispatcher && !this._editorLoadedListener) {
                    this._editorLoadedListener = () => {
                        this.step = 2;
                        this.applyStepClass();
                    };
                    window.H5P.externalDispatcher.on("editorloaded", this._editorLoadedListener);
                }
            } catch (e) {
                this.loading = false;
                this.error = this.lang.load_error + ": " + (e.message || e);
            }
        },

        save() {
            const params = this.editor && this.editor.getParams();
            if (!params || params.params === undefined) {
                this.error = this.lang.incomplete;
                return;
            }
            const library = this.editor.getLibrary();
            if (!library) {
                this.error = this.lang.no_library;
                return;
            }

            const title =
                this.title.trim() ||
                (params.metadata && params.metadata.title) ||
                "Untitled";

            const url = this.currentId
                ? this.saveUrl + "/" + this.currentId
                : this.saveUrl;

            this.saving = true;
            this.error = null;
            this.status = null;

            this.http
                .post(
                    url,
                    {
                        title: title,
                        library: library,
                        params: JSON.stringify(params),
                        nonce: this.settings.nonce,
                    },
                    {
                        headers: {
                            Authorization: "Bearer " + (this.settings.token || ""),
                        },
                    }
                )
                .then(({ data }) => {
                    const id = data && data.data && data.data.id;
                    if (id) {
                        this.currentId = id;
                        this.savedId = id;
                    }
                    this.status = this.lang.saved;
                    this.$emit("saved", id);
                })
                .catch((e) => {
                    const msg =
                        (e.response && e.response.data && e.response.data.message) ||
                        e.message;
                    this.error = this.lang.save_error + ": " + msg;
                })
                .finally(() => {
                    this.saving = false;
                });
        },
    },
};
</script>

<style scoped>
.h5p-steps {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
}
.h5p-step {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px 7px 8px;
    font-size: 13.5px;
    font-weight: 600;
    color: #9ca3af;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    cursor: default;
    transition: border-color 0.15s ease, color 0.15s ease;
}
.h5p-step:not(:disabled) {
    cursor: pointer;
}
.h5p-step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 12px;
    border-radius: 999px;
    background: #eef1f5;
    color: #9ca3af;
}
.h5p-step.active {
    color: #1f2937;
    border-color: #bfd7f8;
}
.h5p-step.active .h5p-step-num {
    background: #2f80ed;
    color: #fff;
}
.h5p-step.done {
    color: #047857;
    border-color: #a7f3d0;
}
.h5p-step.done .h5p-step-num {
    background: #10b981;
    color: #fff;
}
.h5p-step-line {
    flex: 0 0 28px;
    height: 2px;
    background: #e5e7eb;
    border-radius: 2px;
}
.h5p-step-line.done {
    background: #10b981;
}
.h5p-toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
}
.h5p-title-input {
    flex: 1;
    padding: 9px 14px;
    font-size: 15px;
    color: #1f2937;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.h5p-title-input::placeholder {
    color: #9ca3af;
}
.h5p-title-input:focus {
    outline: none;
    border-color: #2f80ed;
    box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.15);
}
.h5p-save-btn {
    padding: 9px 22px;
    font-size: 14px;
    white-space: nowrap;
}
.h5p-icon-btn {
    width: 38px;
    justify-content: center;
    padding: 8px 0 !important;
    font-size: 16px;
    line-height: 1;
}
.h5p-btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: h5p-spin 0.7s linear infinite;
}
.h5p-editor-holder {
    min-height: 240px;
}
.h5p-loading {
    padding: 48px 32px;
    text-align: center;
    font-size: 14px;
    color: #6b7280;
}
.h5p-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 14px;
    font-size: 13.5px;
    border-radius: 8px;
}
.h5p-status.ok {
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
}
.h5p-status.ok a {
    color: #047857;
    font-weight: 600;
    text-decoration: underline;
}
.h5p-status.err {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
}

/* ===== Info modal (iView Modal-ийн дотор) ===== */
.h5p-info-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
}
.h5p-info-icon {
    width: 56px;
    height: 56px;
    object-fit: contain;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}
.h5p-info-title {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    color: #1f2937;
}
.h5p-info-owner {
    margin: 2px 0 0;
    font-size: 13px;
    color: #9ca3af;
}
.h5p-info-desc {
    font-size: 14px;
    line-height: 1.65;
    color: #4b5563;
    margin-bottom: 14px;
}
.h5p-info-shots {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
    margin-bottom: 14px;
}
.h5p-info-shots img {
    width: 100%;
    height: auto;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    cursor: zoom-in;
    transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.h5p-info-shots img:hover {
    box-shadow: 0 4px 14px rgba(16, 24, 40, 0.14);
    transform: translateY(-1px);
}
.h5p-shot-preview {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
    background: rgba(15, 23, 42, 0.78);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4vh 4vw;
    cursor: zoom-out;
}
.h5p-shot-preview img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 10px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}
.h5p-info-example {
    display: inline-block;
    font-size: 13.5px;
    font-weight: 600;
    color: #2f80ed;
}
.h5p-info-install {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;
}
.h5p-info-install-err {
    font-size: 13px;
    color: #b91c1c;
}
</style>
