<template>
    <div class="ld-pw-overlay" @mousedown.self="$emit('close')">
        <div class="ld-pw">
            <div class="ld-pw-head">
                <span class="ld-pw-icon" v-html="wordIcon"></span>
                <span class="ld-pw-title">Paste from Word</span>
                <button class="ld-pw-close" type="button" title="Close" @click="$emit('close')">✕</button>
            </div>
            <div class="ld-pw-hint">
                Paste your Word content into the box below (Ctrl/Cmd+V) — formatting is kept.
            </div>
            <div class="ld-pw-area" contenteditable="true" ref="area"
                 @input="hasContent = true" @paste="onPaste"></div>
            <div class="ld-pw-foot">
                <button class="ld-dlg-btn" type="button" @click="$emit('close')">Cancel</button>
                <button class="ld-dlg-btn ld-dlg-btn--primary" type="button"
                        :disabled="!hasContent" @click="insert">Insert</button>
            </div>
        </div>
    </div>
</template>

<script>
import {ICON, svgIcon} from './icons.js';
import {cleanWordHTML} from './word-html.js';

// "Paste from Word" dialog: the paste event's raw clipboard HTML (full Word
// markup, before the browser sanitizes it) is cleaned — mso lists become real
// ul/ol — and shown in the staging area, so the preview matches what the
// Insert button will put into the editor.
export default {
    data() {
        return {
            hasContent: false,
            wordIcon: svgIcon(ICON.word, 18),
        };
    },
    mounted() {
        this.onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                this.$emit('close');
            }
        };
        document.addEventListener('keydown', this.onKey, true);
        this.$nextTick(() => this.$refs.area.focus());
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKey, true);
    },
    methods: {
        onPaste(e) {
            const clipboard = e.clipboardData;
            const html = clipboard && clipboard.getData('text/html');
            if (!html || !html.trim()) return; // plain text: let the default paste run
            e.preventDefault();
            this.$refs.area.innerHTML = cleanWordHTML(html);
            this.hasContent = true;
        },
        insert() {
            const html = this.$refs.area.innerHTML;
            if (!html || !html.trim()) return;
            this.$emit('insert', html);
        },
    },
};
</script>

<style>
.ld-pw-overlay {
    position: fixed;
    inset: 0;
    z-index: 150;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(16, 24, 40, 0.55);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.ld-pw {
    display: flex;
    flex-direction: column;
    width: min(820px, 100%);
    height: min(620px, 100%);
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(16, 24, 40, 0.35);
    overflow: hidden;
}
.ld-pw-head {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding: 14px 16px;
    border-bottom: 1px solid #eaecf0;
}
.ld-pw-icon {
    display: inline-flex;
    color: #2563eb;
}
.ld-pw-title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: #101828;
}
.ld-pw-close {
    width: 30px;
    height: 30px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #667085;
    font-size: 14px;
    cursor: pointer;
}
.ld-pw-close:hover {
    background: #f2f4f7;
}
.ld-pw-hint {
    flex-shrink: 0;
    padding: 10px 16px;
    color: #667085;
    font-size: 12.5px;
}
.ld-pw-area {
    flex: 1;
    min-height: 0;
    overflow: auto;
    margin: 0 16px;
    padding: 12px 14px;
    border: 1.5px solid #d0d5dd;
    border-radius: 8px;
    outline: none;
    font-size: 14px;
    color: #101828;
}
.ld-pw-area:focus {
    border-color: #2563eb;
}
.ld-pw-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
    padding: 14px 16px;
}
</style>
