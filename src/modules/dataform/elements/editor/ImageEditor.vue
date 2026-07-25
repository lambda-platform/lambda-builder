<template>
    <div class="ld-ie">
        <div class="ld-ie__top">
            <div class="ld-ie__title">
                {{ file.name }}
                <span class="ld-ie__dims">{{ imgW }} × {{ imgH }}</span>
                <span class="ld-ie__dirty" v-if="dirty">●</span>
            </div>
            <button class="ld-ie__x" type="button" title="Close (Esc)" @click="close">✕</button>
        </div>

        <div class="ld-ie__stage" ref="stage">
            <div class="ld-ie__frame" ref="frame">
                <canvas ref="canvas" class="ld-ie__canvas"></canvas>
                <div v-if="cropMode" class="ld-ie__crop" :style="cropStyle" @mousedown.prevent="dragCrop($event, 'move')">
                    <div class="ld-ie__thirds"></div>
                    <span v-for="h in cropHandles" :key="h" :class="['ld-ie__handle', 'ld-ie__handle--' + h]"
                          @mousedown.prevent.stop="dragCrop($event, h)"></span>
                </div>
            </div>
        </div>

        <div class="ld-ie__bar">
            <template v-if="cropMode">
                <button v-for="a in aspects" :key="a.label" type="button" class="ld-ie__chip"
                        :class="{'is-active': aspect === a.v}" @click="setAspect(a.v)">{{ a.label }}</button>
                <span class="ld-ie__gap"></span>
                <button type="button" class="ld-ie__chip ld-ie__chip--ok" @click="applyCrop">
                    <span v-html="icons.check"></span> Apply
                </button>
                <button type="button" class="ld-ie__chip" @click="cropMode = false">Cancel</button>
            </template>
            <template v-else>
                <button type="button" title="Crop" @click="startCrop" v-html="icons.crop"></button>
                <button type="button" title="Rotate left" @click="rotate(-90)" v-html="icons.rotateLeft"></button>
                <button type="button" title="Rotate right" @click="rotate(90)" v-html="icons.rotateRight"></button>
                <button type="button" title="Flip horizontal" @click="flip(true)" v-html="icons.flipH"></button>
                <button type="button" title="Flip vertical" @click="flip(false)" v-html="icons.flipV"></button>
                <span class="ld-ie__sep"></span>
                <span class="ld-ie__resize">
                    <input type="number" min="1" v-model.number="resizeW" @input="syncResize('w')"/>
                    ×
                    <input type="number" min="1" v-model.number="resizeH" @input="syncResize('h')"/>
                    <button type="button" class="ld-ie__chip" :disabled="!canResize" @click="applyResize">Resize</button>
                </span>
                <span class="ld-ie__sep"></span>
                <button type="button" title="Undo" :disabled="!undoStack.length" @click="undo" v-html="icons.undo"></button>
                <button type="button" class="ld-ie__chip" :disabled="!dirty" @click="reset">Reset</button>
                <span class="ld-ie__gap"></span>
                <button type="button" class="ld-ie__chip" :disabled="!dirty || saving" @click="save(true)">
                    Save as copy
                </button>
                <button type="button" class="ld-ie__chip ld-ie__chip--ok" :disabled="!dirty || saving" @click="save(false)">
                    <span v-html="icons.check"></span> {{ saving ? 'Saving…' : 'Save' }}
                </button>
            </template>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import {ICON, svgIcon} from './icons.js';
import {ldAlert} from './dialog.js';

const API = '/lambda/filemanager';
const MIME = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'};

// Canvas-based image editor: crop (with aspect presets), rotate, flip and
// resize, with undo/reset. "Save" overwrites the file through the backend's
// save endpoint (thumbnail regenerated); "Save as copy" goes through upload.
export default {
    props: {
        file: {type: Object, required: true}, // {name, path, src, ...}
    },
    data() {
        return {
            imgW: 0,
            imgH: 0,
            cropMode: false,
            crop: {x: 0, y: 0, w: 0, h: 0}, // display-space px, relative to frame
            aspect: null,
            aspects: [
                {label: 'Free', v: null},
                {label: '1:1', v: 1},
                {label: '4:3', v: 4 / 3},
                {label: '16:9', v: 16 / 9},
                {label: '3:4', v: 3 / 4},
            ],
            cropHandles: ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'],
            undoStack: [],
            dirty: false,
            saving: false,
            resizeW: 0,
            resizeH: 0,
            icons: {
                crop: svgIcon(ICON.crop, 16),
                rotateLeft: svgIcon(ICON.rotateLeft, 16),
                rotateRight: svgIcon(ICON.rotateRight, 16),
                flipH: svgIcon(ICON.flipH, 16),
                flipV: svgIcon(ICON.flipV, 16),
                undo: svgIcon(ICON.undo, 16),
                check: svgIcon(ICON.check, 13),
            },
        };
    },
    computed: {
        cropStyle() {
            return {
                left: this.crop.x + 'px',
                top: this.crop.y + 'px',
                width: this.crop.w + 'px',
                height: this.crop.h + 'px',
            };
        },
        canResize() {
            return this.resizeW >= 1 && this.resizeH >= 1 &&
                (Math.round(this.resizeW) !== this.imgW || Math.round(this.resizeH) !== this.imgH);
        },
    },
    mounted() {
        this.onKey = (e) => {
            if (e.key === 'Escape') {
                if (this.cropMode) this.cropMode = false;
                else this.close();
                e.preventDefault();
                e.stopPropagation();
            }
        };
        document.addEventListener('keydown', this.onKey, true);
        this.loadOriginal();
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKey, true);
        this.stopDrag();
    },
    methods: {
        loadOriginal() {
            const img = new Image();
            img.onload = () => {
                this.original = img;
                this.setCanvas(img.naturalWidth, img.naturalHeight, (ctx) => ctx.drawImage(img, 0, 0));
                this.undoStack = [];
                this.dirty = false;
            };
            img.onerror = async () => {
                await ldAlert({title: 'Image editor', message: 'Could not load this image.'});
                this.$emit('close');
            };
            img.src = this.file.src;
        },
        setCanvas(w, h, draw) {
            const canvas = this.$refs.canvas;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingQuality = 'high';
            draw(ctx);
            this.imgW = w;
            this.imgH = h;
            this.resizeW = w;
            this.resizeH = h;
        },
        snapshot() {
            const canvas = this.$refs.canvas;
            const copy = document.createElement('canvas');
            copy.width = canvas.width;
            copy.height = canvas.height;
            copy.getContext('2d').drawImage(canvas, 0, 0);
            this.undoStack.push(copy);
            if (this.undoStack.length > 15) this.undoStack.shift();
            this.dirty = true;
        },
        undo() {
            const prev = this.undoStack.pop();
            if (!prev) return;
            this.setCanvas(prev.width, prev.height, (ctx) => ctx.drawImage(prev, 0, 0));
            if (!this.undoStack.length) this.dirty = false;
            this.cropMode = false;
        },
        reset() {
            this.cropMode = false;
            this.loadOriginal();
        },
        rotate(deg) {
            this.cropMode = false;
            this.snapshot();
            const src = this.undoStack[this.undoStack.length - 1];
            this.setCanvas(src.height, src.width, (ctx) => {
                ctx.translate(src.height / 2, src.width / 2);
                ctx.rotate((deg * Math.PI) / 180);
                ctx.drawImage(src, -src.width / 2, -src.height / 2);
            });
        },
        flip(horizontal) {
            this.cropMode = false;
            this.snapshot();
            const src = this.undoStack[this.undoStack.length - 1];
            this.setCanvas(src.width, src.height, (ctx) => {
                ctx.translate(horizontal ? src.width : 0, horizontal ? 0 : src.height);
                ctx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
                ctx.drawImage(src, 0, 0);
            });
        },
        syncResize(changed) {
            const ratio = this.imgW / this.imgH;
            if (changed === 'w' && this.resizeW >= 1) this.resizeH = Math.max(1, Math.round(this.resizeW / ratio));
            if (changed === 'h' && this.resizeH >= 1) this.resizeW = Math.max(1, Math.round(this.resizeH * ratio));
        },
        applyResize() {
            if (!this.canResize) return;
            const w = Math.round(this.resizeW);
            const h = Math.round(this.resizeH);
            this.snapshot();
            const src = this.undoStack[this.undoStack.length - 1];
            this.setCanvas(w, h, (ctx) => ctx.drawImage(src, 0, 0, w, h));
        },
        // ---- crop ----
        displayRect() {
            return this.$refs.canvas.getBoundingClientRect();
        },
        startCrop() {
            this.aspect = null;
            const r = this.displayRect();
            const frame = this.$refs.frame.getBoundingClientRect();
            const w = r.width * 0.8;
            const h = r.height * 0.8;
            this.crop = {
                x: r.left - frame.left + (r.width - w) / 2,
                y: r.top - frame.top + (r.height - h) / 2,
                w,
                h,
            };
            this.cropMode = true;
        },
        setAspect(v) {
            this.aspect = v;
            if (v == null) return;
            const r = this.displayRect();
            const frame = this.$refs.frame.getBoundingClientRect();
            const bx = r.left - frame.left;
            const by = r.top - frame.top;
            let w = this.crop.w;
            let h = w / v;
            if (h > r.height) {
                h = r.height;
                w = h * v;
            }
            this.crop.w = w;
            this.crop.h = h;
            this.crop.x = Math.min(Math.max(this.crop.x, bx), bx + r.width - w);
            this.crop.y = Math.min(Math.max(this.crop.y, by), by + r.height - h);
        },
        dragCrop(e, mode) {
            const start = {...this.crop};
            const sx = e.clientX;
            const sy = e.clientY;
            const r = this.displayRect();
            const frame = this.$refs.frame.getBoundingClientRect();
            const bounds = {x: r.left - frame.left, y: r.top - frame.top, w: r.width, h: r.height};
            const MIN = 24;
            const aspect = this.aspect;

            this.onMove = (ev) => {
                const dx = ev.clientX - sx;
                const dy = ev.clientY - sy;
                let {x, y, w, h} = start;

                if (mode === 'move') {
                    x = Math.min(Math.max(start.x + dx, bounds.x), bounds.x + bounds.w - w);
                    y = Math.min(Math.max(start.y + dy, bounds.y), bounds.y + bounds.h - h);
                } else {
                    if (mode.includes('e')) w = start.w + dx;
                    if (mode.includes('s')) h = start.h + dy;
                    if (mode.includes('w')) {
                        w = start.w - dx;
                        x = start.x + dx;
                    }
                    if (mode.includes('n')) {
                        h = start.h - dy;
                        y = start.y + dy;
                    }
                    if (aspect) {
                        if (mode === 'n' || mode === 's') w = h * aspect;
                        else h = w / aspect;
                        if (mode.includes('w')) x = start.x + start.w - w;
                        if (mode.includes('n')) y = start.y + start.h - h;
                    }
                    // clamp to the image and the minimum size
                    if (w < MIN) { if (mode.includes('w')) x -= MIN - w; w = MIN; }
                    if (h < MIN) { if (mode.includes('n')) y -= MIN - h; h = MIN; }
                    if (x < bounds.x) { w -= bounds.x - x; x = bounds.x; }
                    if (y < bounds.y) { h -= bounds.y - y; y = bounds.y; }
                    if (x + w > bounds.x + bounds.w) w = bounds.x + bounds.w - x;
                    if (y + h > bounds.y + bounds.h) h = bounds.y + bounds.h - y;
                }
                this.crop = {x, y, w, h};
            };
            this.onUp = () => this.stopDrag();
            document.addEventListener('mousemove', this.onMove);
            document.addEventListener('mouseup', this.onUp);
        },
        stopDrag() {
            if (this.onMove) document.removeEventListener('mousemove', this.onMove);
            if (this.onUp) document.removeEventListener('mouseup', this.onUp);
            this.onMove = this.onUp = null;
        },
        applyCrop() {
            const r = this.displayRect();
            const frame = this.$refs.frame.getBoundingClientRect();
            const factor = this.$refs.canvas.width / r.width;
            const sx = Math.max(0, Math.round((this.crop.x - (r.left - frame.left)) * factor));
            const sy = Math.max(0, Math.round((this.crop.y - (r.top - frame.top)) * factor));
            const sw = Math.min(this.$refs.canvas.width - sx, Math.round(this.crop.w * factor));
            const sh = Math.min(this.$refs.canvas.height - sy, Math.round(this.crop.h * factor));
            if (sw < 1 || sh < 1) return;
            this.cropMode = false;
            this.snapshot();
            const src = this.undoStack[this.undoStack.length - 1];
            this.setCanvas(sw, sh, (ctx) => ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh));
        },
        // ---- save ----
        blobFor(cb) {
            const ext = (/\.([^.]+)$/.exec(this.file.name) || [])[1];
            const mime = MIME[(ext || '').toLowerCase()] || 'image/png';
            this.$refs.canvas.toBlob(cb, mime, 0.92);
        },
        save(asCopy) {
            if (this.saving) return;
            this.saving = true;
            this.blobFor(async (blob) => {
                try {
                    const form = new FormData();
                    if (asCopy) {
                        const name = this.file.name.replace(/(\.[^.]+)$/, '-edited$1');
                        form.append('file', blob, name);
                        const parent = this.file.path.split('/').slice(0, -1).join('/');
                        form.append('path', parent);
                        await axios.post(`${API}/upload`, form);
                    } else {
                        form.append('file', blob, this.file.name);
                        form.append('path', this.file.path);
                        await axios.post(`${API}/save`, form);
                    }
                    this.$emit('saved');
                } catch (e) {
                    const message = e.response && e.response.data && e.response.data.message;
                    await ldAlert({title: 'Save failed', message: message || 'Could not save the image.'});
                }
                this.saving = false;
            });
        },
        close() {
            this.$emit('close');
        },
    },
};
</script>

<style>
.ld-ie {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 150;
    display: flex;
    flex-direction: column;
    background: rgba(9, 12, 20, 0.95);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    user-select: none;
}
.ld-ie__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 10px 14px;
    color: #e5e9f0;
}
.ld-ie__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.ld-ie__dims {
    color: #98a2b3;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
}
.ld-ie__dirty {
    color: #fbbf24;
    font-size: 10px;
}
.ld-ie .ld-ie__x {
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 15px;
    cursor: pointer;
}
.ld-ie .ld-ie__x:hover {
    background: #2563eb;
    color: #fff;
}
.ld-ie__stage {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    overflow: hidden;
}
.ld-ie__frame {
    position: relative;
    max-width: 100%;
    max-height: 100%;
    display: flex;
}
.ld-ie__canvas {
    max-width: 100%;
    max-height: calc(100vh - 160px);
    object-fit: contain;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}
.ld-ie__crop {
    position: absolute;
    border: 1.5px solid #fff;
    box-shadow: 0 0 0 9999px rgba(9, 12, 20, 0.55);
    cursor: move;
}
.ld-ie__thirds {
    position: absolute;
    left: 33.33%;
    top: 33.33%;
    width: 33.34%;
    height: 33.34%;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-width: 0 1px;
    box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.35) inset, 0 1px 0 rgba(255, 255, 255, 0.35);
    pointer-events: none;
}
.ld-ie__handle {
    position: absolute;
    width: 11px;
    height: 11px;
    border: 1.5px solid #6366f1;
    border-radius: 2px;
    background: #fff;
}
.ld-ie__handle--nw { left: -6px; top: -6px; cursor: nwse-resize; }
.ld-ie__handle--n  { left: calc(50% - 5px); top: -6px; cursor: ns-resize; }
.ld-ie__handle--ne { right: -6px; top: -6px; cursor: nesw-resize; }
.ld-ie__handle--e  { right: -6px; top: calc(50% - 5px); cursor: ew-resize; }
.ld-ie__handle--se { right: -6px; bottom: -6px; cursor: nwse-resize; }
.ld-ie__handle--s  { left: calc(50% - 5px); bottom: -6px; cursor: ns-resize; }
.ld-ie__handle--sw { left: -6px; bottom: -6px; cursor: nesw-resize; }
.ld-ie__handle--w  { left: -6px; top: calc(50% - 5px); cursor: ew-resize; }
.ld-ie__bar {
    display: flex;
    align-items: center;
    gap: 4px;
    align-self: center;
    flex-shrink: 0;
    max-width: calc(100% - 32px);
    flex-wrap: wrap;
    margin: 0 0 18px;
    padding: 7px 9px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: #141a28;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55);
}
.ld-ie .ld-ie__bar > button,
.ld-ie .ld-ie__resize .ld-ie__chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 36px;
    height: 34px;
    padding: 0 10px;
    border: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}
.ld-ie .ld-ie__bar > button:hover:not(:disabled),
.ld-ie .ld-ie__resize .ld-ie__chip:hover:not(:disabled) {
    background: #2563eb;
    color: #fff;
}
.ld-ie__bar button:disabled {
    opacity: 0.4;
    cursor: default;
}
.ld-ie__chip.is-active {
    background: rgba(99, 102, 241, 0.35);
    color: #fff;
}
.ld-ie__chip--ok {
    background: #2563eb !important;
    color: #fff !important;
}
.ld-ie__chip--ok:hover:not(:disabled) {
    background: #1d4ed8 !important;
}
.ld-ie__sep {
    width: 1px;
    height: 20px;
    margin: 0 5px;
    background: rgba(255, 255, 255, 0.14);
}
.ld-ie__gap {
    width: 14px;
}
.ld-ie__resize {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #98a2b3;
    font-size: 12.5px;
}
.ld-ie__resize input {
    width: 62px;
    height: 30px;
    padding: 0 8px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.06);
    color: #e5e9f0;
    font-size: 12.5px;
    outline: none;
    -moz-appearance: textfield;
}
.ld-ie__resize input::-webkit-outer-spin-button,
.ld-ie__resize input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}
.ld-ie__resize input:focus {
    border-color: #6366f1;
}
</style>
