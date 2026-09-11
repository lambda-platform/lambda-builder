<template>
    <section class="page h5p-page">
        <div class="h5p-page-header">
            <div class="h5p-page-title">
                {{ lang.title }}
                <span v-if="mode === 'edit'" class="h5p-page-mode">/ {{ currentId ? lang.edit : lang.new_content }}</span>
                <span v-if="mode === 'view'" class="h5p-page-mode">/ {{ lang.view }}</span>
            </div>
            <div class="h5p-page-actions">
                <button v-if="mode !== 'list'" class="h5p-btn" @click="showList">← {{ lang.back }}</button>
                <button v-if="mode === 'view'" class="h5p-btn" @click="edit(currentId)">{{ lang.edit }}</button>
                <button v-if="mode === 'list'" class="h5p-btn primary" @click="edit(null)">+ {{ lang.new_content }}</button>
            </div>
        </div>

        <div class="h5p-page-body">
            <h5p-contents v-if="mode === 'list'" :base-url="baseUrl" @edit="edit" @view="view"/>
            <h5p-editor v-if="mode === 'edit'" :content-id="currentId" :base-url="baseUrl" @view="view" @saved="onSaved"/>
            <h5p-viewer v-if="mode === 'view'" :content-id="currentId" :base-url="baseUrl"/>
        </div>
    </section>
</template>

<script>
import { makeLang } from "./utils/lang";

export default {
    name: "H5p",
    props: {
        /** Lambda H5P модулийн backend endpoint-уудын суурь зам */
        baseUrl: { type: String, default: "/lambda/h5p" },
    },
    data() {
        return {
            mode: "list",
            currentId: null,
        };
    },
    computed: {
        lang() {
            return makeLang(this, {
                title: "H5P контент",
                new_content: "Шинэ контент",
                back: "Буцах",
                view: "Үзэх",
                edit: "Засах",
            });
        },
    },
    methods: {
        showList() {
            this.mode = "list";
            this.currentId = null;
        },
        edit(id) {
            this.currentId = id;
            this.mode = "edit";
        },
        view(id) {
            this.currentId = id;
            this.mode = "view";
        },
        onSaved(id) {
            if (id) this.currentId = id;
        },
    },
};
</script>

<style>
/* ===== H5P module shared UI (глобал — бүх h5p компонент ашиглана) ===== */
.h5p-page {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #374151;
}
.h5p-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}
.h5p-page-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #1f2937;
}
.h5p-page-title .h5p-page-mode {
    font-weight: 400;
    color: #9ca3af;
}
.h5p-page-actions {
    display: flex;
    gap: 8px;
}

/* Товчнууд */
.h5p-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    color: #374151;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;
}
.h5p-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
}
.h5p-btn:active {
    transform: translateY(1px);
}
.h5p-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.18);
}
.h5p-btn.primary {
    background: #2f80ed;
    border-color: #2f80ed;
    color: #fff;
}
.h5p-btn.primary:hover {
    background: #1d6fe0;
    border-color: #1d6fe0;
}
.h5p-btn.ghost {
    padding: 5px 12px;
    font-size: 13px;
    border-color: transparent;
    box-shadow: none;
    background: transparent;
    color: #2f80ed;
}
.h5p-btn.ghost:hover {
    background: rgba(47, 128, 237, 0.08);
}
.h5p-btn:disabled {
    opacity: 0.55;
    cursor: default;
    transform: none;
}

/* Карт гадаргуу */
.h5p-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06);
    overflow: hidden;
}

/* Ачаалалтын spinner */
.h5p-spinner {
    width: 22px;
    height: 22px;
    border: 2.5px solid #e5e7eb;
    border-top-color: #2f80ed;
    border-radius: 50%;
    animation: h5p-spin 0.7s linear infinite;
    margin: 0 auto 10px;
}
@keyframes h5p-spin {
    to { transform: rotate(360deg); }
}
</style>
