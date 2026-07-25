<template>
    <div class="ld-src">
        <div class="ld-src__box">
            <div ref="gutter" class="ld-src__gutter">
                <div v-for="n in lineCount" :key="n"
                     class="ld-src__ln" :class="{'is-error': errorLines[n]}">{{ n }}</div>
                <div class="ld-src__ln">&nbsp;</div>
            </div>
            <div class="ld-src__body">
                <pre ref="hl" class="ld-src__hl" aria-hidden="true" v-html="highlighted"></pre>
                <textarea
                    ref="ta"
                    class="ld-src__ta"
                    :value="value"
                    spellcheck="false"
                    autocomplete="off"
                    autocapitalize="off"
                    wrap="off"
                    @input="onInput"
                    @scroll="syncScroll"
                    @keydown.tab.prevent="onTab"
                ></textarea>
            </div>
        </div>
        <div class="ld-src__status" :class="{'has-errors': errors.length}">
            <template v-if="errors.length">
                <button v-for="(e, i) in errors.slice(0, 3)" :key="i" type="button"
                        class="ld-src__err" @click="jumpTo(e.line)">
                    Line {{ e.line }}: {{ e.message }}
                </button>
                <span v-if="errors.length > 3" class="ld-src__more">+{{ errors.length - 3 }} more</span>
            </template>
            <span v-else class="ld-src__ok">✓ No problems found</span>
        </div>
    </div>
</template>

<script>
import {highlightHTML, lintHTML} from './source-lang.js';

// Lightweight HTML code editor: a native textarea (typing, selection and undo
// stay native) rendered transparent over a <pre> that carries the syntax
// colors, plus a line-number gutter and a tag-balance lint bar.
export default {
    props: ['value'],
    data() {
        return {
            errors: [],
        };
    },
    computed: {
        highlighted() {
            // Trailing newline keeps the last (possibly empty) line visible.
            return highlightHTML(this.value || '') + '\n';
        },
        lineCount() {
            return (this.value || '').split('\n').length;
        },
        errorLines() {
            const lines = {};
            for (const e of this.errors) lines[e.line] = true;
            return lines;
        },
    },
    watch: {
        value() {
            this.lint();
            this.$nextTick(this.syncScroll);
        },
    },
    mounted() {
        this.lint();
    },
    methods: {
        focus() {
            if (this.$refs.ta) this.$refs.ta.focus();
        },
        lint() {
            this.errors = lintHTML(this.value || '');
        },
        onInput(e) {
            this.$emit('input', e.target.value);
        },
        syncScroll() {
            const ta = this.$refs.ta;
            if (!ta) return;
            if (this.$refs.hl) {
                this.$refs.hl.scrollTop = ta.scrollTop;
                this.$refs.hl.scrollLeft = ta.scrollLeft;
            }
            if (this.$refs.gutter) this.$refs.gutter.scrollTop = ta.scrollTop;
        },
        onTab(e) {
            // execCommand keeps the native undo stack intact.
            if (e.shiftKey) return;
            document.execCommand('insertText', false, '    ');
        },
        jumpTo(line) {
            const ta = this.$refs.ta;
            if (!ta) return;
            const lines = (this.value || '').split('\n');
            let pos = 0;
            for (let i = 0; i < line - 1 && i < lines.length; i++) pos += lines[i].length + 1;
            ta.focus();
            ta.setSelectionRange(pos, pos + (lines[line - 1] || '').length);
            const lineHeight = 20;
            ta.scrollTop = Math.max(0, (line - 3) * lineHeight);
            this.syncScroll();
        },
    },
};
</script>

<style>
.ld-src {
    display: flex;
    flex-direction: column;
    background: #1d2433;
}
.ld-src__box {
    display: flex;
    height: 280px;
    min-height: 120px;
    resize: vertical;
    overflow: hidden;
}
.ld-src__gutter {
    flex: none;
    min-width: 44px;
    padding: 12px 0;
    overflow: hidden;
    background: #171d2b;
    border-right: 1px solid #262f42;
    color: #4d5876;
    text-align: right;
    user-select: none;
}
.ld-src__ln {
    padding: 0 10px 0 6px;
    font-family: "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
    font-size: 13px;
    line-height: 20px;
}
.ld-src__ln.is-error {
    color: #f87171;
    background: rgba(248, 113, 113, 0.12);
}
.ld-src__body {
    position: relative;
    flex: 1;
    overflow: hidden;
}
.ld-src__hl,
.ld-src__ta {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    padding: 12px 14px;
    border: none;
    font-family: "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
    font-size: 13px;
    line-height: 20px;
    tab-size: 4;
    white-space: pre;
    overflow-wrap: normal;
    box-sizing: border-box;
}
.ld-src__hl {
    overflow: hidden;
    pointer-events: none;
    color: #d7dce5;
}
.ld-src__ta {
    overflow: auto;
    resize: none;
    outline: none;
    background: transparent;
    color: transparent;
    caret-color: #e5e9f0;
}
.ld-src__ta::selection {
    background: rgba(99, 102, 241, 0.35);
    color: transparent;
}
/* token colors */
.ld-src--tag { color: #7dd3fc; }
.ld-src--atn { color: #c4b5fd; }
.ld-src--str { color: #86efac; }
.ld-src--pun { color: #64748b; }
.ld-src--cmt { color: #6b7280; font-style: italic; }
/* status bar */
.ld-src__status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 14px;
    padding: 5px 12px;
    border-top: 1px solid #262f42;
    background: #161b26;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
}
.ld-src__ok {
    color: #4ade80;
}
.ld-src__err {
    padding: 0;
    border: none;
    background: none;
    color: #f87171;
    font-size: 12px;
    cursor: pointer;
    text-align: left;
}
.ld-src__err:hover {
    text-decoration: underline;
}
.ld-src__more {
    color: #9ca3af;
}
</style>
