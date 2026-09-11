<template>
    <div class="h5p-contents-component">
        <div v-if="loading" class="h5p-loading h5p-card">
            <div class="h5p-spinner"></div>
            {{ lang.loading }}
        </div>
        <div v-else-if="error" class="h5p-error h5p-card">{{ error }}</div>
        <div v-else-if="contents.length" class="h5p-card">
            <table class="h5p-table">
                <thead>
                    <tr>
                        <th class="h5p-col-id">ID</th>
                        <th>{{ lang.content_title }}</th>
                        <th>{{ lang.library }}</th>
                        <th>{{ lang.updated }}</th>
                        <th class="h5p-col-actions"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in contents" :key="c.id" @click="$emit('view', c.id)">
                        <td class="h5p-col-id">{{ c.id }}</td>
                        <td class="h5p-col-title">{{ c.title }}</td>
                        <td class="h5p-col-library"><span class="h5p-lib-badge">{{ shortLib(c.library) }}</span></td>
                        <td class="h5p-col-updated">{{ c.updated_at }}</td>
                        <td class="h5p-col-actions" @click.stop>
                            <button class="h5p-btn ghost" @click="$emit('view', c.id)">{{ lang.view }}</button>
                            <button class="h5p-btn ghost" @click="$emit('edit', c.id)">{{ lang.edit }}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="h5p-empty h5p-card">{{ lang.empty }}</div>
    </div>
</template>

<script>
import { makeLang } from "../utils/lang";

export default {
    name: "H5pContents",
    props: {
        /** Lambda H5P модулийн backend endpoint-уудын суурь зам */
        baseUrl: { type: String, default: "/lambda/h5p" },
    },
    data() {
        return {
            loading: true,
            error: null,
            contents: [],
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
                load_error: "H5P контентын жагсаалт ачаалж чадсангүй",
                content_title: "Гарчиг",
                library: "Төрөл",
                updated: "Шинэчлэгдсэн",
                view: "Үзэх",
                edit: "Засах",
                empty: "Одоогоор контент алга.",
            });
        },
    },
    mounted() {
        this.load();
    },
    methods: {
        /** "H5P.InteractiveVideo" → "Interactive Video" */
        shortLib(name) {
            if (!name) return "";
            return String(name)
                .replace(/^H5P\./, "")
                .replace(/([a-z])([A-Z])/g, "$1 $2");
        },
        async load() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await this.http.get(this.baseUrl + "/contents");
                this.contents = data || [];
                this.loading = false;
            } catch (e) {
                this.loading = false;
                this.error = this.lang.load_error + ": " + (e.message || e);
            }
        },
    },
};
</script>

<style scoped>
.h5p-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}
.h5p-table th,
.h5p-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f5f9;
    text-align: left;
}
.h5p-table thead th {
    background: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
}
.h5p-table tbody tr {
    cursor: pointer;
    transition: background 0.12s ease;
}
.h5p-table tbody tr:hover {
    background: #f8fafc;
}
.h5p-table tbody tr:last-child td {
    border-bottom: none;
}
.h5p-col-id {
    width: 56px;
    color: #9ca3af;
    font-variant-numeric: tabular-nums;
}
.h5p-col-title {
    font-weight: 500;
    color: #1f2937;
}
.h5p-lib-badge {
    display: inline-block;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #3b5bdb;
    background: #eef2ff;
    border-radius: 999px;
    white-space: nowrap;
}
.h5p-col-updated {
    color: #9ca3af;
    font-size: 13px;
    white-space: nowrap;
}
.h5p-col-actions {
    width: 140px;
    text-align: right;
    white-space: nowrap;
    cursor: default;
}
.h5p-loading,
.h5p-error,
.h5p-empty {
    padding: 48px 32px;
    text-align: center;
    font-size: 14px;
    color: #6b7280;
}
.h5p-error {
    color: #b91c1c;
}
</style>
