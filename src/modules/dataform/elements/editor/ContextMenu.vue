<template>
    <div class="ld-ctx" v-if="visible" :style="{left: x + 'px', top: y + 'px'}"
         @mousedown.stop @contextmenu.prevent @click.stop>
        <template v-if="image">
            <div class="ld-ctx__title">Image</div>
            <div class="ld-ctx__chips">
                <button v-for="p in [25, 50, 75, 100]" :key="p" type="button" class="ld-ctx__chip"
                        :class="{active: imageWidth === p + '%'}" @click="resize(p + '%')">{{ p }}%</button>
            </div>
            <button class="ld-menuitem" type="button" @click="customSize">Custom size…</button>
            <button class="ld-menuitem" type="button" @click="resize(null)">Original size</button>
            <button class="ld-menuitem" type="button" @click="editAlt">Alt text…</button>
            <button class="ld-menuitem ld-ctx__danger" type="button" @click="removeImage">Remove image</button>
        </template>
        <div class="ld-divider" v-if="image && table"></div>
        <template v-if="table">
            <div class="ld-ctx__title">Table</div>
            <button class="ld-menuitem" type="button" @click="run(tableAddRowBefore)">Insert row above</button>
            <button class="ld-menuitem" type="button" @click="run(tableAddRowAfter)">Insert row below</button>
            <button class="ld-menuitem" type="button" @click="run(tableAddColumnBefore)">Insert column left</button>
            <button class="ld-menuitem" type="button" @click="run(tableAddColumnAfter)">Insert column right</button>
            <div class="ld-divider"></div>
            <button class="ld-menuitem" type="button" :disabled="!can.mergeRight"
                    @click="run(tableMergeRight)">Merge right</button>
            <button class="ld-menuitem" type="button" :disabled="!can.mergeDown"
                    @click="run(tableMergeDown)">Merge down</button>
            <button class="ld-menuitem" type="button" :disabled="!can.split"
                    @click="run(tableSplitCell)">Split cell</button>
            <div class="ld-divider"></div>
            <button class="ld-menuitem" type="button" @click="run(tableDeleteRow)">Delete row</button>
            <button class="ld-menuitem" type="button" @click="run(tableDeleteColumn)">Delete column</button>
            <button class="ld-menuitem ld-ctx__danger" type="button" @click="run(tableDeleteTable)">Delete table</button>
        </template>
    </div>
</template>

<script>
import {
    TextSelection,
    isInTable,
    tableAddRowBefore,
    tableAddRowAfter,
    tableAddColumnBefore,
    tableAddColumnAfter,
    tableDeleteRow,
    tableDeleteColumn,
    tableDeleteTable,
    tableMergeRight,
    tableMergeDown,
    tableSplitCell,
} from './core/index.js';
import {ldPrompt} from './dialog.js';

// Right-click menu for the editor: image sizing/alt/remove when the click hits
// an image, table row/column operations when the caret lands inside a table.
// Anywhere else the native browser menu is left alone.
export default {
    inject: ['getView'],
    data() {
        return {
            visible: false,
            x: 0,
            y: 0,
            image: null, // {from, to, attrs} of the right-clicked image node
            table: false,
            can: {mergeRight: false, mergeDown: false, split: false},
        };
    },
    computed: {
        imageWidth() {
            return this.image ? this.image.attrs.width : null;
        },
    },
    created() {
        this.tableAddRowBefore = tableAddRowBefore;
        this.tableAddRowAfter = tableAddRowAfter;
        this.tableAddColumnBefore = tableAddColumnBefore;
        this.tableAddColumnAfter = tableAddColumnAfter;
        this.tableDeleteRow = tableDeleteRow;
        this.tableDeleteColumn = tableDeleteColumn;
        this.tableDeleteTable = tableDeleteTable;
        this.tableMergeRight = tableMergeRight;
        this.tableMergeDown = tableMergeDown;
        this.tableSplitCell = tableSplitCell;
    },
    mounted() {
        this.onCtx = (e) => this.openMenu(e);
        this.onDown = () => this.close();
        this.onKey = (e) => {
            if (e.key === 'Escape') this.close();
        };
        const view = this.getView();
        if (view) view.dom.addEventListener('contextmenu', this.onCtx);
        document.addEventListener('mousedown', this.onDown);
        document.addEventListener('keydown', this.onKey);
    },
    beforeDestroy() {
        const view = this.getView();
        if (view && view.dom) view.dom.removeEventListener('contextmenu', this.onCtx);
        document.removeEventListener('mousedown', this.onDown);
        document.removeEventListener('keydown', this.onKey);
    },
    methods: {
        openMenu(e) {
            const view = this.getView();
            if (!view) return;

            let image = null;
            if (e.target.tagName === 'IMG') {
                const desc = view.domToDesc.get(e.target);
                if (desc) {
                    image = {
                        from: desc.from,
                        to: desc.to,
                        attrs: {
                            src: e.target.getAttribute('src') || '',
                            alt: e.target.getAttribute('alt') || '',
                            title: e.target.getAttribute('title'),
                            width: (e.target.style && e.target.style.width) || null,
                        },
                    };
                }
            }

            // Put the caret where the user clicked so table commands know the cell.
            const pos = image ? image.from : this.posAtPoint(view, e);
            if (pos != null) {
                view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, pos)));
            }

            const table = pos != null && isInTable(view.state);
            if (!image && !table) return; // let the browser menu through

            this.can = {
                mergeRight: table && tableMergeRight(view.state, null),
                mergeDown: table && tableMergeDown(view.state, null),
                split: table && tableSplitCell(view.state, null),
            };

            e.preventDefault();
            this.image = image;
            this.table = table;
            this.x = e.clientX;
            this.y = e.clientY;
            this.visible = true;
            this.$nextTick(() => this.clampToViewport());
        },
        posAtPoint(view, e) {
            let node = null;
            let offset = 0;
            if (document.caretRangeFromPoint) {
                const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                if (range) {
                    node = range.startContainer;
                    offset = range.startOffset;
                }
            } else if (document.caretPositionFromPoint) {
                const p = document.caretPositionFromPoint(e.clientX, e.clientY);
                if (p) {
                    node = p.offsetNode;
                    offset = p.offset;
                }
            }
            if (!node || !view.dom.contains(node)) {
                node = e.target;
                offset = 0;
            }
            return view.domToModel(node, offset);
        },
        clampToViewport() {
            const el = this.$el;
            if (!el || !el.getBoundingClientRect) return;
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth) this.x = Math.max(8, window.innerWidth - r.width - 8);
            if (r.bottom > window.innerHeight) this.y = Math.max(8, window.innerHeight - r.height - 8);
        },
        close() {
            this.visible = false;
            this.image = null;
            this.table = false;
        },
        run(command) {
            const view = this.getView();
            if (view) {
                command(view.state, view.dispatch);
                view.focus();
            }
            this.close();
        },
        applyImage(image, attrs) {
            const view = this.getView();
            if (!view || !image) return;
            const node = view.state.schema.nodes.image.create({...image.attrs, ...attrs});
            const tr = view.state.tr;
            tr.setSelection(TextSelection.create(view.state.doc, image.from, image.to));
            tr.replaceSelectionWith([node]);
            view.dispatch(tr);
            view.focus();
        },
        resize(width) {
            const image = this.image;
            this.close();
            this.applyImage(image, {width});
        },
        editorEl() {
            const view = this.getView();
            return view && view.dom.closest ? view.dom.closest('.lambda-editor') : null;
        },
        async customSize() {
            const image = this.image;
            this.close();
            if (!image) return;
            const value = await ldPrompt({
                title: 'Image size',
                label: 'Width (e.g. 320px or 50%)',
                value: image.attrs.width || '',
                icon: 'image',
                confirmText: 'Apply',
                container: this.editorEl(),
            });
            if (value === null || value === '') return;
            this.applyImage(image, {width: /^\d+(\.\d+)?$/.test(value) ? value + 'px' : value});
        },
        async editAlt() {
            const image = this.image;
            this.close();
            if (!image) return;
            const value = await ldPrompt({
                title: 'Alt text',
                label: 'Alt text',
                value: image.attrs.alt || '',
                icon: 'image',
                allowEmpty: true,
                container: this.editorEl(),
            });
            if (value === null) return;
            this.applyImage(image, {alt: value});
        },
        removeImage() {
            const view = this.getView();
            if (!view || !this.image) return;
            view.dispatch(view.state.tr.delete(this.image.from, this.image.to));
            view.focus();
            this.close();
        },
    },
};
</script>

<style>
.ld-ctx {
    position: fixed;
    z-index: 120;
    min-width: 190px;
    padding: 6px;
    border: 1px solid #eaecf0;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 12px 32px rgba(16, 24, 40, 0.16);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.ld-ctx__title {
    padding: 4px 10px 2px;
    color: #98a2b3;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.ld-ctx__chips {
    display: flex;
    gap: 4px;
    padding: 4px 10px 6px;
}
.ld-ctx__chip {
    flex: 1;
    padding: 4px 0;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    background: #fff;
    color: #344054;
    font-size: 12px;
    cursor: pointer;
}
.ld-ctx__chip:hover {
    background: #f2f4f7;
}
.ld-ctx__chip.active {
    border-color: #6366f1;
    background: #e0e7ff;
    color: #3538cd;
}
.ld-ctx .ld-menuitem:disabled {
    opacity: 0.45;
    cursor: default;
}
.ld-ctx .ld-menuitem:disabled:hover {
    background: transparent;
}
.ld-ctx__danger {
    color: #b42318;
}
.ld-ctx__danger:hover {
    background: #fef3f2;
}
</style>
