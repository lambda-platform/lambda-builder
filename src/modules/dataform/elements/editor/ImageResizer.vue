<template>
    <div class="ld-imgrs" v-show="active" :style="boxStyle">
        <span v-for="h in handles" :key="h" :class="['ld-imgrs__handle', 'ld-imgrs__handle--' + h]"
              @mousedown.prevent="startDrag(h, $event)"></span>
        <span class="ld-imgrs__size" v-if="dragging">{{ Math.round(width) }}px</span>
    </div>
</template>

<script>
import {TextSelection} from './core/index.js';

// Click an image to get a selection box with corner handles; dragging a handle
// resizes the image live (width only, height follows the aspect ratio) and
// commits the width to the image node on mouseup.
export default {
    inject: ['getView'],
    props: ['tick'],
    data() {
        return {
            active: false,
            dragging: false,
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            handles: ['nw', 'ne', 'sw', 'se'],
        };
    },
    computed: {
        boxStyle() {
            return {
                left: this.left + 'px',
                top: this.top + 'px',
                width: this.width + 'px',
                height: this.height + 'px',
            };
        },
    },
    watch: {
        tick() {
            if (this.dragging) return;
            this.$nextTick(() => this.refresh());
        },
    },
    mounted() {
        this.img = null;
        this.from = null;
        this.onClick = (e) => {
            if (e.target.tagName === 'IMG') this.select(e.target);
            else if (!this.dragging) this.deselect();
        };
        // Right-click opens the context menu; activate the drag handles too.
        this.onCtx = (e) => {
            if (e.target.tagName === 'IMG') this.select(e.target);
        };
        this.onKey = (e) => {
            if (e.key === 'Escape') this.deselect();
        };
        const view = this.getView();
        if (view) {
            view.dom.addEventListener('click', this.onClick);
            view.dom.addEventListener('contextmenu', this.onCtx);
        }
        document.addEventListener('keydown', this.onKey);
    },
    beforeDestroy() {
        const view = this.getView();
        if (view && view.dom) {
            view.dom.removeEventListener('click', this.onClick);
            view.dom.removeEventListener('contextmenu', this.onCtx);
        }
        document.removeEventListener('keydown', this.onKey);
        this.stopListeners();
    },
    methods: {
        select(img) {
            const view = this.getView();
            const desc = view && view.domToDesc.get(img);
            this.img = img;
            this.from = desc ? desc.from : null;
            this.active = true;
            this.position();
        },
        deselect() {
            this.img = null;
            this.from = null;
            this.active = false;
        },
        position() {
            if (!this.img || !this.img.isConnected) return this.deselect();
            const r = this.img.getBoundingClientRect();
            const parent = this.$el.offsetParent;
            const p = parent ? parent.getBoundingClientRect() : {left: 0, top: 0};
            this.left = r.left - p.left;
            this.top = r.top - p.top;
            this.width = r.width;
            this.height = r.height;
        },
        refresh() {
            if (!this.active) return;
            if (this.img && this.img.isConnected) return this.position();
            const img = this.from != null ? this.findImgAt(this.from) : null;
            if (img) {
                this.img = img;
                this.position();
            } else {
                this.deselect();
            }
        },
        findImgAt(from) {
            const view = this.getView();
            if (!view) return null;
            for (const d of view.descs) {
                if (d.leaf && d.from === from && d.dom.tagName === 'IMG') return d.dom;
            }
            return null;
        },
        startDrag(handle, e) {
            if (!this.img) return;
            this.dragging = true;
            const startX = e.clientX;
            const startWidth = this.img.getBoundingClientRect().width;
            const dir = handle === 'ne' || handle === 'se' ? 1 : -1;
            this.onMove = (ev) => {
                ev.preventDefault();
                const view = this.getView();
                const max = view ? view.dom.clientWidth : 2000;
                const next = Math.min(max, Math.max(40, startWidth + dir * (ev.clientX - startX)));
                this.img.style.width = next + 'px';
                this.position();
            };
            this.onUp = () => {
                this.stopListeners();
                this.commit();
            };
            document.addEventListener('mousemove', this.onMove);
            document.addEventListener('mouseup', this.onUp);
        },
        stopListeners() {
            if (this.onMove) document.removeEventListener('mousemove', this.onMove);
            if (this.onUp) document.removeEventListener('mouseup', this.onUp);
            this.onMove = this.onUp = null;
        },
        commit() {
            this.dragging = false;
            const view = this.getView();
            const desc = view && this.img ? view.domToDesc.get(this.img) : null;
            if (!desc) return this.deselect();
            this.from = desc.from;
            const node = view.state.schema.nodes.image.create({
                src: this.img.getAttribute('src') || '',
                alt: this.img.getAttribute('alt') || '',
                title: this.img.getAttribute('title'),
                width: Math.round(this.img.getBoundingClientRect().width) + 'px',
            });
            const tr = view.state.tr;
            tr.setSelection(TextSelection.create(view.state.doc, desc.from, desc.to));
            tr.replaceSelectionWith([node]);
            view.dispatch(tr);
            this.$nextTick(() => this.refresh());
        },
    },
};
</script>

<style>
.lambda-editor {
    position: relative;
}
.ld-imgrs {
    position: absolute;
    z-index: 40;
    box-sizing: border-box;
    border: 1.5px solid #6366f1;
    pointer-events: none;
}
.ld-imgrs__handle {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1.5px solid #6366f1;
    border-radius: 2px;
    background: #fff;
    pointer-events: auto;
}
.ld-imgrs__handle--nw { left: -5px; top: -5px; cursor: nwse-resize; }
.ld-imgrs__handle--ne { right: -5px; top: -5px; cursor: nesw-resize; }
.ld-imgrs__handle--sw { left: -5px; bottom: -5px; cursor: nesw-resize; }
.ld-imgrs__handle--se { right: -5px; bottom: -5px; cursor: nwse-resize; }
.ld-imgrs__size {
    position: absolute;
    right: 0;
    bottom: -24px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #101828;
    color: #fff;
    font-size: 11px;
    pointer-events: none;
}
</style>
