<template>
    <FormItem :prop="rule" :label="label">
        <div
            class="lambda-editor"
            :class="{ 'lambda-editor--disabled': editorDisabled }"
        >
            <editor-toolbar
                v-if="ready && !editorDisabled"
                :tick="tick"
                :source-mode="sourceMode"
                @toggle-source="toggleSource"
            />
            <div v-show="!sourceMode" ref="mount" class="lambda-editor__mount"></div>
            <editor-source
                v-if="sourceMode"
                ref="source"
                :value="sourceHtml"
                @input="onSourceInput"
            />
            <editor-context-menu v-if="ready && !editorDisabled && !sourceMode" />
            <editor-image-resizer v-if="ready && !editorDisabled && !sourceMode" :tick="tick" />
        </div>
    </FormItem>
</template>

<script>
import {
    EditorState,
    EditorView,
    basicSchema,
    parseHTML,
    keymap,
    history,
    baseKeymap,
    toggleMark,
    inputRules,
    markdownInputRules,
    trailingBlock,
    ensureTrailingBlock,
} from "./core/index.js";
import Toolbar from "./Toolbar.vue";
import ContextMenu from "./ContextMenu.vue";
import ImageResizer from "./ImageResizer.vue";
import SourceEditor from "./SourceEditor.vue";
import { formatHTML } from "./source-format.js";

export default {
    props: ["label", "model", "rule", "meta"],
    components: {
        "editor-toolbar": Toolbar,
        "editor-context-menu": ContextMenu,
        "editor-image-resizer": ImageResizer,
        "editor-source": SourceEditor,
    },
    provide() {
        return {
            getView: () => this.view,
        };
    },
    data() {
        return {
            tick: 0,
            ready: false,
            sourceMode: false,
            sourceHtml: "",
            editorDisabled:
                this.meta && this.meta.disabled ? this.meta.disabled : false,
        };
    },
    computed: {
        value() {
            return this.model && this.model.form
                ? this.model.form[this.model.component]
                : "";
        },
    },
    watch: {
        value(newValue) {
            // Vue flushes watchers on nextTick, so the `syncing` flag set
            // around $set() is already cleared by the time this runs — echoes
            // of our own writes must be detected by comparing values instead.
            if (this.syncing || !this.view) return;
            const html = newValue || "";
            if (this.sourceMode) {
                // Echo of the user typing in the source editor: the model was
                // just set to exactly sourceHtml — leave the textarea alone,
                // otherwise the caret jumps and half-typed HTML gets mangled.
                if (html === this.sourceHtml) return;
                this.view.setHTML(html.trim() !== "" ? html : "<p></p>");
                this.sourceHtml = formatHTML(this.view.getHTML());
                return;
            }
            const current = this.view.getHTML();
            if (
                html !== (current === "<p></p>" ? "" : current) &&
                html !== current
            ) {
                this.view.setHTML(html.trim() !== "" ? html : "<p></p>");
            }
        },
        "meta.disabled"(disabled) {
            this.editorDisabled = !!disabled;
            if (disabled && this.sourceMode) this.toggleSource();
            if (this.view)
                this.view.dom.contentEditable = disabled ? "false" : "true";
        },
    },
    mounted() {
        const schema = basicSchema;
        const M = schema.marks;
        const value = this.value;
        const doc = ensureTrailingBlock(
            schema,
            parseHTML(schema, value && value.trim() !== "" ? value : "<p></p>")
        );

        const state = EditorState.create({
            schema,
            doc,
            plugins: [
                history(),
                trailingBlock(),
                inputRules(markdownInputRules(schema)),
                keymap({
                    "Mod-b": toggleMark(M.strong),
                    "Mod-i": toggleMark(M.em),
                    "Mod-u": toggleMark(M.underline),
                    "Mod-e": toggleMark(M.code),
                }),
                keymap(baseKeymap),
            ],
        });

        this.syncing = false;
        this.view = new EditorView(this.$refs.mount, {
            state,
            onUpdate: (view) => {
                this.tick++;
                const html = view.getHTML();
                const out = html === "<p></p>" ? "" : html;
                if (out !== this.value) {
                    this.syncing = true;
                    this.$set(this.model.form, this.model.component, out);
                    this.syncing = false;
                }
            },
        });

        if (this.editorDisabled) this.view.dom.contentEditable = "false";
        this.ready = true;
    },
    methods: {
        toggleSource() {
            if (!this.view) return;
            if (!this.sourceMode) {
                this.sourceHtml = formatHTML(this.view.getHTML());
                this.sourceMode = true;
                this.$nextTick(() => {
                    if (this.$refs.source) this.$refs.source.focus();
                });
            } else {
                const html = this.sourceHtml;
                this.view.setHTML(html.trim() !== "" ? html : "<p></p>");
                this.sourceMode = false;
                this.$nextTick(() => this.view && this.view.focus());
            }
        },
        onSourceInput(value) {
            // Keep the form model in sync while typing raw HTML, so saving
            // the form in source mode captures the edits.
            this.sourceHtml = value;
            if (!this.model || !this.model.form) return;
            this.syncing = true;
            this.$set(this.model.form, this.model.component, value);
            this.syncing = false;
        },
    },
    beforeDestroy() {
        if (this.view) {
            this.view.destroy();
            this.view = null;
        }
    },
};
</script>

<style>
@import "./core/style.css";

.lambda-editor__mount {
    display: block;
}

.lambda-editor__toolbar .ld-caret {
    display: inline-flex;
    align-items: center;
    color: #667085;
}

.lambda-editor__toolbar .ld-caret svg {
    display: block;
}

.lambda-editor--disabled .lambda-editor__content {
    background: #f9fafb;
    color: #98a2b3;
    cursor: not-allowed;
}

/* While viewing source, everything except the source toggle is inert */
.lambda-editor__toolbar.is-source .lambda-editor__group:not(.lambda-editor__group--source),
.lambda-editor__toolbar.is-source .sep {
    pointer-events: none;
    opacity: 0.35;
}
</style>
