<template>
    <FormItem :prop="rule" :label="label">
        <div
            class="lambda-editor"
            :class="{ 'lambda-editor--disabled': editorDisabled }"
        >
            <editor-toolbar v-if="ready && !editorDisabled" :tick="tick" />
            <div ref="mount" class="lambda-editor__mount"></div>
            <editor-context-menu v-if="ready && !editorDisabled" />
            <editor-image-resizer v-if="ready && !editorDisabled" :tick="tick" />
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

export default {
    props: ["label", "model", "rule", "meta"],
    components: {
        "editor-toolbar": Toolbar,
        "editor-context-menu": ContextMenu,
        "editor-image-resizer": ImageResizer,
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
            if (this.syncing || !this.view) return;
            const html = newValue || "";
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
</style>
