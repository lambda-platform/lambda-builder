<template>
    <div class="lambda-editor__toolbar" :class="{'is-source': sourceMode}">
        <div class="lambda-editor__group">
            <button type="button" title="Undo (Ctrl/Cmd+Z)" @mousedown.prevent @click="exec(commands.undo)"
                    v-html="icon('undo')"></button>
            <button type="button" title="Redo (Ctrl/Cmd+Y)" @mousedown.prevent @click="exec(commands.redo)"
                    v-html="icon('redo')"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <div class="ld-dd" :class="{open: openDd === 'block'}">
                <button type="button" class="ld-dd__trigger wide" title="Block format"
                        @mousedown.prevent @click.stop="toggleDd('block')">
                    <span class="ld-dd__label">{{ blockLabel }}</span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === 'block'" @click.stop>
                    <button v-for="o in blockOptions" :key="o.key" type="button" class="ld-menuitem"
                            :class="{'is-active': o.key === blockValue}" :style="o.style"
                            @mousedown.prevent @click="pickBlock(o)">{{ o.label }}
                    </button>
                </div>
            </div>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <div class="ld-dd" v-for="dd in markDropdowns" :key="dd.key" :class="{open: openDd === dd.key}">
                <button type="button" class="ld-dd__trigger" :title="dd.title"
                        @mousedown.prevent @click.stop="toggleDd(dd.key)">
                    <span class="ld-dd__label">{{ dd.label }}</span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === dd.key" @click.stop>
                    <button v-for="(o, i) in dd.options" :key="i" type="button" class="ld-menuitem" :style="o.style"
                            @mousedown.prevent @click="pickMarkOption(dd, o)">{{ o.label }}
                    </button>
                </div>
            </div>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <button v-for="b in markButtons" :key="b.mark" type="button" :title="b.title"
                    :class="{'is-active': isMark(b.mark)}"
                    @mousedown.prevent @click="exec(commands.toggleMark(M[b.mark]))" v-html="b.label"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <div class="ld-dd" v-for="dd in colorDropdowns" :key="dd.key" :class="{open: openDd === dd.key}">
                <button type="button" class="ld-dd__trigger" :title="dd.title"
                        @mousedown.prevent @click.stop="toggleDd(dd.key)">
                    <span class="ld-dd__label" v-html="dd.label"></span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === dd.key" @click.stop>
                    <div class="ld-swatches">
                        <button v-for="c in palette" :key="c" type="button" class="ld-swatch"
                                :style="{background: c}" :title="c"
                                @mousedown.prevent @click="pickColor(dd, c)"></button>
                    </div>
                    <div class="ld-color-foot">
                        <label @mousedown.stop>
                            <input type="color" v-model="customColors[dd.key]"
                                   @input="applyColor(dd, customColors[dd.key])"/>
                            Custom
                        </label>
                        <button type="button" class="ld-menuitem" style="padding:4px 8px"
                                @mousedown.prevent @click="removeColor(dd)">Remove
                        </button>
                    </div>
                </div>
            </div>
            <button type="button" title="Clear formatting" @mousedown.prevent @click="exec(commands.clearFormatting)"
                    v-html="icon('eraser')"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <button v-for="b in scriptButtons" :key="b.mark" type="button" :title="b.title"
                    :class="{'is-active': isMark(b.mark)}"
                    @mousedown.prevent @click="exec(commands.toggleMark(M[b.mark]))" v-html="b.label"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <button type="button" title="Insert link" @mousedown.prevent @click="insertLink"
                    v-html="icon('link')"></button>
            <div class="ld-dd" :class="{open: openDd === 'image'}">
                <button type="button" class="ld-dd__trigger" title="Insert image"
                        @mousedown.prevent @click.stop="toggleDd('image')">
                    <span class="ld-dd__label" v-html="icon('image')"></span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === 'image'" @click.stop>
                    <button type="button" class="ld-menuitem" @mousedown.prevent @click="closeThen(uploadFromComputer)"
                            v-html="icon('upload') + ' Upload from computer'"></button>
                    <button type="button" class="ld-menuitem" @mousedown.prevent @click="closeThen(openFileManager)"
                            v-html="icon('folder') + ' Insert with file manager'"></button>
                    <button type="button" class="ld-menuitem" @mousedown.prevent @click="closeThen(insertImageURL)"
                            v-html="icon('globe') + ' Insert via URL'"></button>
                </div>
            </div>
            <button type="button" title="Open file manager" @mousedown.prevent @click="openFileManager"
                    v-html="icon('folderPlus', 19)"></button>
            <button type="button" title="Blockquote" :class="{'is-active': isQuote}"
                    @mousedown.prevent @click="exec(commands.toggleBlockquote)" v-html="icon('quote')"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <div class="ld-dd" :class="{open: openDd === 'align'}">
                <button type="button" class="ld-dd__trigger" title="Text alignment"
                        @mousedown.prevent @click.stop="toggleDd('align')">
                    <span class="ld-dd__label" v-html="alignIcon"></span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === 'align'" @click.stop>
                    <button v-for="o in alignOptions" :key="o.v" type="button" class="ld-menuitem"
                            :class="{'is-active': o.v === alignValue}"
                            @mousedown.prevent @click="pickAlign(o.v)"
                            v-html="icon(o.icon) + ' ' + o.label"></button>
                </div>
            </div>
            <div class="ld-dd" :class="{open: openDd === 'lineheight'}">
                <button type="button" class="ld-dd__trigger" title="Line height"
                        @mousedown.prevent @click.stop="toggleDd('lineheight')">
                    <span class="ld-dd__label" v-html="icon('lineHeight')"></span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === 'lineheight'" @click.stop>
                    <button v-for="o in lineHeightOptions" :key="String(o.v)" type="button" class="ld-menuitem"
                            :class="{'is-active': o.v === lineHeightValue}"
                            @mousedown.prevent @click="pickLineHeight(o.v)">{{ o.label }}</button>
                </div>
            </div>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <button type="button" title="Bulleted list" :class="{'is-active': isList('bullet_list')}"
                    @mousedown.prevent @click="exec(commands.toggleList(N.bullet_list, N.list_item))"
                    v-html="icon('bulletList')"></button>
            <button type="button" title="Numbered list" :class="{'is-active': isList('ordered_list')}"
                    @mousedown.prevent @click="exec(commands.toggleList(N.ordered_list, N.list_item))"
                    v-html="icon('orderedList')"></button>
            <button type="button" title="Increase indent (Tab)" @mousedown.prevent
                    @click="exec(commands.indentListItem)" v-html="icon('indent')"></button>
            <button type="button" title="Decrease indent (Shift+Tab)" @mousedown.prevent
                    @click="exec(commands.outdentListItem)" v-html="icon('outdent')"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group">
            <button type="button" title="Horizontal rule" @mousedown.prevent
                    @click="exec(commands.insertHorizontalRule)" v-html="icon('hr')"></button>
            <div class="ld-dd" :class="{open: openDd === 'table'}">
                <button type="button" class="ld-dd__trigger" title="Table"
                        @mousedown.prevent @click.stop="toggleDd('table')">
                    <span class="ld-dd__label" v-html="icon('table')"></span><span class="ld-caret" v-html="caretIcon"></span>
                </button>
                <div class="ld-dd__panel" v-show="openDd === 'table'" @click.stop>
                    <template v-if="inTable">
                        <template v-for="(t, i) in tableActions">
                            <button v-if="t.label" :key="i" type="button" class="ld-menuitem"
                                    @mousedown.prevent @click="runTable(t.command)">{{ t.label }}
                            </button>
                            <div v-else :key="i" class="ld-divider"></div>
                        </template>
                    </template>
                    <template v-else>
                        <div class="ld-grid">
                            <div v-for="cell in gridCells" :key="cell.r + '-' + cell.c" class="ld-grid-cell"
                                 :class="{on: cell.r <= gridR && cell.c <= gridC}"
                                 @mouseenter="gridR = cell.r; gridC = cell.c"
                                 @mousedown.prevent @click="pickGrid(cell.r, cell.c)"></div>
                        </div>
                        <div class="ld-grid-label">{{ gridR >= 0 ? `${gridR + 1} × ${gridC + 1}` : 'Insert table' }}</div>
                    </template>
                </div>
            </div>
            <button type="button" title="Paste from Word" @mousedown.prevent @click="pwOpen = true"
                    v-html="icon('word')"></button>
            <button type="button" title="Insert embed" @mousedown.prevent @click="embedOpen = true"
                    v-html="icon('embed')"></button>
        </div>
        <span class="sep"></span>

        <div class="lambda-editor__group lambda-editor__group--source">
            <button type="button" title="Source code" :class="{'is-active': sourceMode}"
                    @mousedown.prevent @click="$emit('toggle-source')" v-html="icon('source')"></button>
        </div>

        <file-manager v-if="fmOpen" @close="fmOpen = false" @pick="pickAsset"/>
        <paste-word v-if="pwOpen" @close="pwOpen = false" @insert="pasteWordInsert"/>
        <embed-dialog v-if="embedOpen" @close="embedOpen = false" @insert="embedInsert"/>
    </div>
</template>

<script>
import {
    basicSchema,
    parseHTML,
    TextSelection,
    undo,
    redo,
    toggleMark,
    setBlockType,
    setAlign,
    setLineHeight,
    applyMark,
    removeMarkType,
    clearFormatting,
    insertImage,
    setLink,
    toggleList,
    indentListItem,
    outdentListItem,
    isInList,
    toggleBlockquote,
    isInBlockquote,
    insertHorizontalRule,
    insertEmbed,
    insertTable,
    isInTable,
    tableAddColumnBefore,
    tableAddColumnAfter,
    tableAddRowBefore,
    tableAddRowAfter,
    tableDeleteColumn,
    tableDeleteRow,
    tableDeleteTable,
    tableMergeRight,
    tableMergeDown,
    tableSplitCell,
    isMarkActive,
    currentBlock,
} from './core/index.js';
import {pasteBlocks} from './core/transform/index.js';
import {ICON, svgIcon, pickImageFile} from './icons.js';
import {ldPrompt, ldAlert} from './dialog.js';
import FileManager from './FileManager.vue';
import PasteWord from './PasteWord.vue';
import EmbedDialog from './EmbedDialog.vue';

const M = basicSchema.marks;
const N = basicSchema.nodes;

const BLOCK_OPTIONS = [
    {key: 'p', label: 'Paragraph', style: null, make: () => setBlockType(N.paragraph)},
    ...[1, 2, 3, 4, 5, 6].map((l) => ({
        key: `h${l}`,
        label: `Heading ${l}`,
        style: `font-size:${1 + (7 - l) * 0.06}em;font-weight:600`,
        make: () => setBlockType(N.heading, {level: l}),
    })),
];

export default {
    props: ["tick", "sourceMode"],
    inject: ["getView"],
    components: {
        "file-manager": FileManager,
        "paste-word": PasteWord,
        "embed-dialog": EmbedDialog,
    },
    data() {
        return {
            M,
            N,
            openDd: null,
            fmOpen: false,
            pwOpen: false,
            embedOpen: false,
            caretIcon: '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
            gridR: -1,
            gridC: -1,
            customColors: {textColor: '#111827', backgroundColor: '#111827'},
            commands: {
                undo,
                redo,
                toggleMark,
                clearFormatting,
                toggleBlockquote,
                toggleList,
                indentListItem,
                outdentListItem,
                insertHorizontalRule,
            },
            blockOptions: BLOCK_OPTIONS,
            markDropdowns: [
                {
                    key: 'font', label: 'Font', title: 'Font family', mark: M.fontFamily, attr: 'family',
                    options: [
                        {value: null, label: 'Default'},
                        {value: 'Arial, sans-serif', label: 'Arial', style: 'font-family:Arial,sans-serif'},
                        {value: 'Georgia, serif', label: 'Georgia', style: 'font-family:Georgia,serif'},
                        {value: "'Times New Roman', serif", label: 'Times', style: "font-family:'Times New Roman',serif"},
                        {value: "'Courier New', monospace", label: 'Courier', style: "font-family:'Courier New',monospace"},
                        {value: 'Verdana, sans-serif', label: 'Verdana', style: 'font-family:Verdana,sans-serif'},
                    ],
                },
                {
                    key: 'size', label: 'Size', title: 'Font size', mark: M.fontSize, attr: 'size',
                    options: [
                        {value: null, label: 'Default'},
                        ...['12px', '14px', '16px', '18px', '20px', '24px', '30px'].map((s) => ({value: s, label: s})),
                    ],
                },
            ],
            markButtons: [
                {mark: 'strong', title: 'Bold (Ctrl/Cmd+B)', label: '<b>B</b>'},
                {mark: 'em', title: 'Italic (Ctrl/Cmd+I)', label: '<i>I</i>'},
                {mark: 'underline', title: 'Underline (Ctrl/Cmd+U)', label: '<u>U</u>'},
                {mark: 'strikethrough', title: 'Strikethrough', label: '<s>S</s>'},
            ],
            scriptButtons: [
                {mark: 'superscript', title: 'Superscript', label: 'x<sup>2</sup>'},
                {mark: 'subscript', title: 'Subscript', label: 'x<sub>2</sub>'},
                {mark: 'code', title: 'Inline code (Ctrl/Cmd+E)', label: svgIcon(ICON.code)},
            ],
            colorDropdowns: [
                {key: 'textColor', title: 'Text color', mark: M.textColor, label: '<b>A</b>'},
                {key: 'backgroundColor', title: 'Highlight color', mark: M.backgroundColor, label: svgIcon(ICON.highlight)},
            ],
            palette: [
                '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#d9d9d9', '#efefef', '#ffffff',
                '#e11d48', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
            ],
            alignOptions: [
                {v: 'left', icon: 'alignLeft', label: 'Left'},
                {v: 'center', icon: 'alignCenter', label: 'Center'},
                {v: 'right', icon: 'alignRight', label: 'Right'},
                {v: 'justify', icon: 'alignJustify', label: 'Justify'},
            ],
            tableActions: [
                {label: 'Insert row above', command: tableAddRowBefore},
                {label: 'Insert row below', command: tableAddRowAfter},
                {label: 'Insert column left', command: tableAddColumnBefore},
                {label: 'Insert column right', command: tableAddColumnAfter},
                {label: null},
                {label: 'Merge right', command: tableMergeRight},
                {label: 'Merge down', command: tableMergeDown},
                {label: 'Split cell', command: tableSplitCell},
                {label: null},
                {label: 'Delete row', command: tableDeleteRow},
                {label: 'Delete column', command: tableDeleteColumn},
                {label: 'Delete table', command: tableDeleteTable},
            ],
            lineHeightOptions: [
                {v: null, label: 'Default'},
                ...['1', '1.15', '1.35', '1.5', '1.75', '2', '2.5', '3'].map((s) => ({v: s, label: s})),
            ],
            gridCells: Array.from({length: 8 * 10}, (_, i) => ({r: Math.floor(i / 10), c: i % 10})),
        };
    },
    computed: {
        blockValue() {
            this.tick;
            const view = this.getView();
            if (!view) return 'p';
            const block = currentBlock(view.state);
            if (block && block.type.name === 'heading') return 'h' + block.attrs.level;
            return 'p';
        },
        blockLabel() {
            const found = BLOCK_OPTIONS.find((o) => o.key === this.blockValue);
            return found ? found.label : 'Paragraph';
        },
        alignValue() {
            this.tick;
            const view = this.getView();
            const block = view ? currentBlock(view.state) : null;
            return (block && block.attrs.align) || 'left';
        },
        alignIcon() {
            const found = this.alignOptions.find((o) => o.v === this.alignValue);
            return svgIcon(ICON[found ? found.icon : 'alignLeft']);
        },
        lineHeightValue() {
            this.tick;
            const view = this.getView();
            const block = view ? currentBlock(view.state) : null;
            return (block && block.attrs.lineHeight) || null;
        },
        inTable() {
            this.tick;
            const view = this.getView();
            return view ? isInTable(view.state) : false;
        },
        isQuote() {
            this.tick;
            const view = this.getView();
            return view ? isInBlockquote(view.state) : false;
        },
    },
    mounted() {
        document.addEventListener('click', this.closeDd);
    },
    beforeDestroy() {
        document.removeEventListener('click', this.closeDd);
    },
    methods: {
        icon(name, size) {
            return svgIcon(ICON[name], size);
        },
        exec(command) {
            const view = this.getView();
            if (!view) return;
            command(view.state, view.dispatch, view);
            view.focus();
        },
        isMark(name) {
            this.tick;
            const view = this.getView();
            return view ? isMarkActive(view.state, M[name]) : false;
        },
        isList(name) {
            this.tick;
            const view = this.getView();
            return view ? isInList(view.state, N[name]) : false;
        },
        toggleDd(name) {
            if (this.openDd === name) {
                this.openDd = null;
                return;
            }
            this.openDd = name;
            if (name === 'table') {
                this.gridR = -1;
                this.gridC = -1;
            }
        },
        closeDd() {
            this.openDd = null;
        },
        closeThen(fn) {
            this.closeDd();
            fn();
        },
        pickBlock(option) {
            this.exec(option.make());
            this.closeDd();
        },
        pickMarkOption(dd, option) {
            this.exec(option.value == null ? removeMarkType(dd.mark) : applyMark(dd.mark, {[dd.attr]: option.value}));
            this.closeDd();
        },
        pickColor(dd, color) {
            this.exec(applyMark(dd.mark, {color}));
            this.closeDd();
        },
        applyColor(dd, color) {
            this.exec(applyMark(dd.mark, {color}));
        },
        removeColor(dd) {
            this.exec(removeMarkType(dd.mark));
            this.closeDd();
        },
        pickAlign(value) {
            this.exec(setAlign(value));
            this.closeDd();
        },
        pickLineHeight(value) {
            this.exec(setLineHeight(value));
            this.closeDd();
        },
        editorEl() {
            const view = this.getView();
            return view && view.dom.closest ? view.dom.closest('.lambda-editor') : null;
        },
        async insertLink() {
            const view = this.getView();
            if (!view) return;
            if (view.state.selection.empty) {
                await ldAlert({
                    title: 'Insert link', message: 'Select text first to add a link.', icon: 'link',
                    container: this.editorEl(),
                });
                return;
            }
            const href = await ldPrompt({
                title: 'Insert link',
                label: 'Link URL',
                value: 'https://',
                icon: 'link',
                confirmText: 'Insert',
                container: this.editorEl(),
            });
            if (href != null) this.exec(setLink(href || null));
        },
        async insertImageURL() {
            const src = await ldPrompt({
                title: 'Insert image',
                label: 'Image URL',
                value: 'https://',
                icon: 'image',
                confirmText: 'Insert',
                container: this.editorEl(),
            });
            if (!src) return;
            const alt = await ldPrompt({
                title: 'Insert image',
                label: 'Alt text',
                icon: 'image',
                confirmText: 'Insert',
                allowEmpty: true,
                container: this.editorEl(),
            });
            this.exec(insertImage({src, alt: alt || ''}));
        },
        uploadFromComputer() {
            pickImageFile((src, name) => this.exec(insertImage({src, alt: name})));
        },
        pasteWordInsert(html) {
            this.pwOpen = false;
            const view = this.getView();
            if (!view || !html || !html.trim()) return;
            const parsed = parseHTML(view.state.schema, html);
            const result = pasteBlocks(
                view.state.doc,
                view.state.selection.from,
                view.state.selection.to,
                parsed.content.content
            );
            if (result) {
                view.dispatch(view.state.tr.setDoc(result.doc, TextSelection.create(result.doc, result.caret)));
                view.focus();
            }
        },
        openFileManager() {
            this.closeDd();
            this.fmOpen = true;
        },
        embedInsert(attrs) {
            this.embedOpen = false;
            this.exec(insertEmbed(attrs));
        },
        pickAsset(asset) {
            if (asset.isImage === false) {
                // Non-image files are inserted as a link with the file name as text.
                this.exec((state, dispatch) => {
                    const linkType = state.schema.marks.link;
                    if (!linkType) return false;
                    if (dispatch) {
                        const text = state.schema.text(asset.name, [linkType.create({href: asset.src})]);
                        dispatch(state.tr.replaceSelectionWith([text]));
                    }
                    return true;
                });
            } else {
                this.exec(insertImage({src: asset.src, alt: asset.name}));
            }
            this.fmOpen = false;
        },
        pickGrid(r, c) {
            this.exec(insertTable(r + 1, c + 1));
            this.closeDd();
        },
        runTable(command) {
            this.exec(command);
            this.closeDd();
        },
    },
};
</script>
