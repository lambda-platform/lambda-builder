<template>
    <div class="ld-dv">
        <div class="ld-dv__top">
            <div class="ld-dv__title">{{ file.name }}</div>
            <div class="ld-dv__actions">
                <button type="button" title="Download" @click="download" v-html="icons.download"></button>
                <button type="button" title="Close (Esc)" @click="$emit('close')">✕</button>
            </div>
        </div>

        <div class="ld-dv__body">
            <iframe v-if="kind === 'pdf'" class="ld-dv__pdf" :src="file.src"></iframe>

            <div v-else-if="kind === 'docx' && html" class="ld-dv__scroll">
                <div class="ld-dv__page" v-html="html"></div>
            </div>

            <div v-else-if="kind === 'sheet' && html" class="ld-dv__sheetwrap">
                <div class="ld-dv__tabs" v-if="sheets.length > 1">
                    <button v-for="(s, i) in sheets" :key="s" type="button"
                            :class="{'is-active': i === sheetIndex}" @click="showSheet(i)">{{ s }}</button>
                </div>
                <div class="ld-dv__scroll ld-dv__sheet" v-html="html"></div>
            </div>

            <div v-else-if="kind === 'text' && html !== null" class="ld-dv__scroll">
                <pre class="ld-dv__text">{{ html }}</pre>
            </div>

            <video v-else-if="kind === 'video'" class="ld-dv__media" :src="file.src" controls></video>
            <audio v-else-if="kind === 'audio'" class="ld-dv__audio" :src="file.src" controls></audio>

            <div v-else-if="loading" class="ld-dv__msg">Loading preview…</div>
            <div v-else class="ld-dv__msg">
                <p>{{ error || `Preview is not available for .${ext} files.` }}</p>
                <button type="button" class="ld-dv__dl" @click="download">
                    <span v-html="icons.download"></span> Download
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import {ICON, svgIcon} from './icons.js';

// Document preview for the file manager. PDFs, video, audio and plain text
// render natively; .docx goes through mammoth and .xlsx/.xls/.csv through
// SheetJS — both loaded lazily so they cost nothing until first use.
const KIND = {
    pdf: 'pdf',
    docx: 'docx',
    xlsx: 'sheet', xls: 'sheet', csv: 'sheet',
    txt: 'text',
    mp4: 'video', m4v: 'video', webm: 'video',
    mp3: 'audio', wav: 'audio',
};

export default {
    props: {
        file: {type: Object, required: true}, // {name, path, src, ...}
    },
    data() {
        return {
            loading: false,
            error: null,
            html: null,     // docx html / sheet html / text content
            sheets: [],
            sheetIndex: 0,
            icons: {
                download: svgIcon(ICON.download, 16),
            },
        };
    },
    computed: {
        ext() {
            const m = /\.([^.]+)$/.exec(this.file.name);
            return m ? m[1].toLowerCase() : '';
        },
        kind() {
            return this.error ? 'error' : (KIND[this.ext] || 'none');
        },
    },
    mounted() {
        this.onKey = (e) => {
            if (e.key === 'Escape') {
                this.$emit('close');
                e.preventDefault();
                e.stopPropagation();
            }
        };
        document.addEventListener('keydown', this.onKey, true);
        this.loadContent();
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKey, true);
    },
    methods: {
        async loadContent() {
            const kind = KIND[this.ext];
            if (kind === 'docx') await this.run(() => this.loadDocx());
            else if (kind === 'sheet') await this.run(() => this.loadSheet());
            else if (kind === 'text') await this.run(() => this.loadText());
        },
        async run(task) {
            this.loading = true;
            try {
                await task();
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('[doc-viewer]', e);
                const detail = e && e.message ? ` (${e.message})` : '';
                this.error = 'Could not load this file for preview.' + detail;
            }
            this.loading = false;
        },
        async fetchBuffer() {
            const {data} = await axios.get(this.file.src, {responseType: 'arraybuffer'});
            return data;
        },
        async loadDocx() {
            // The prebuilt browser bundle avoids mammoth's Node-only deps.
            const [mod, buffer] = await Promise.all([
                import(/* webpackChunkName: "doc-preview" */ 'mammoth/mammoth.browser.js'),
                this.fetchBuffer(),
            ]);
            const mammoth = mod.default || mod;
            const result = await mammoth.convertToHtml({arrayBuffer: buffer});
            this.html = result.value || '<p style="color:#98a2b3">Empty document</p>';
        },
        async loadSheet() {
            const [mod, buffer] = await Promise.all([
                import(/* webpackChunkName: "sheet-preview" */ 'xlsx'),
                this.fetchBuffer(),
            ]);
            this.XLSX = mod.default || mod;
            this.workbook = this.XLSX.read(new Uint8Array(buffer), {type: 'array'});
            this.sheets = this.workbook.SheetNames;
            this.showSheet(0);
        },
        showSheet(i) {
            this.sheetIndex = i;
            const sheet = this.workbook.Sheets[this.sheets[i]];
            this.html = this.XLSX.utils.sheet_to_html(sheet, {header: '', footer: ''});
        },
        async loadText() {
            const {data} = await axios.get(this.file.src, {responseType: 'text', transformResponse: [(d) => d]});
            this.html = String(data);
        },
        download() {
            const a = document.createElement('a');
            a.href = this.file.src;
            a.download = this.file.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
    },
};
</script>

<style>
.ld-dv {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 140;
    display: flex;
    flex-direction: column;
    background: rgba(9, 12, 20, 0.94);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.ld-dv__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 10px 14px;
    color: #e5e9f0;
}
.ld-dv__title {
    font-size: 13.5px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.ld-dv__actions {
    display: flex;
    gap: 4px;
}
.ld-dv .ld-dv__actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}
.ld-dv .ld-dv__actions button:hover {
    background: #2563eb;
    color: #fff;
}
.ld-dv__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 24px 20px;
}
.ld-dv__pdf {
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 8px;
    background: #fff;
}
.ld-dv__scroll {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.ld-dv__page {
    width: min(860px, 100%);
    margin: 4px 0 24px;
    padding: 56px 64px;
    border-radius: 8px;
    background: #fff;
    color: #1d2939;
    font-size: 15px;
    line-height: 1.65;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}
.ld-dv__page img { max-width: 100%; }
.ld-dv__page table { border-collapse: collapse; margin: 0.6em 0; }
.ld-dv__page td, .ld-dv__page th { border: 1px solid #d0d5dd; padding: 4px 10px; }
.ld-dv__sheetwrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
}
.ld-dv__tabs {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    flex-shrink: 0;
    padding-bottom: 8px;
}
.ld-dv__tabs button {
    height: 28px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.08);
    color: #cbd2dc;
    font-size: 12.5px;
    cursor: pointer;
}
.ld-dv__tabs button.is-active {
    background: #2563eb;
    color: #fff;
}
.ld-dv__sheet {
    display: block;
    border-radius: 8px;
    background: #fff;
    padding: 12px;
}
.ld-dv__sheet table {
    border-collapse: collapse;
    font-size: 13px;
    color: #1d2939;
}
.ld-dv__sheet td {
    border: 1px solid #e4e7ec;
    padding: 4px 10px;
    white-space: nowrap;
}
.ld-dv__text {
    width: 100%;
    margin: 0;
    padding: 20px 24px;
    border-radius: 8px;
    background: #fff;
    color: #1d2939;
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    box-sizing: border-box;
}
.ld-dv__media {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    outline: none;
}
.ld-dv__audio {
    width: min(520px, 100%);
}
.ld-dv__msg {
    color: #98a2b3;
    font-size: 14px;
    text-align: center;
}
.ld-dv__dl {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    height: 36px;
    padding: 0 16px;
    border: 0;
    border-radius: 8px;
    background: #2563eb;
    color: #fff;
    font-size: 13.5px;
    cursor: pointer;
}
.ld-dv__dl:hover {
    background: #1d4ed8;
}
</style>
