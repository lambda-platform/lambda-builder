<template>
    <div class="ld-iv">
        <div class="ld-iv__top" @mousedown.stop>
            <div class="ld-iv__title">
                {{ current.name }}
                <span class="ld-iv__count" v-if="images.length > 1">{{ index + 1 }} / {{ images.length }}</span>
            </div>
            <button class="ld-iv__btn" type="button" title="Close (Esc)" @click="$emit('close')">✕</button>
        </div>

        <button v-if="images.length > 1" class="ld-iv__nav ld-iv__nav--prev" type="button"
                title="Previous (←)" @mousedown.stop @click="step(-1)" v-html="icons.prev"></button>
        <button v-if="images.length > 1" class="ld-iv__nav ld-iv__nav--next" type="button"
                title="Next (→)" @mousedown.stop @click="step(1)" v-html="icons.next"></button>

        <div class="ld-iv__stage" ref="stage" @mousedown="stageDown" @dblclick="toggleZoom">
            <img ref="img"
                 class="ld-iv__img"
                 :class="{'is-panning': panning}"
                 :src="current.src"
                 :alt="current.name"
                 :style="imgStyle"
                 draggable="false"
                 @load="onLoad"/>
        </div>

        <div class="ld-iv__bar" @mousedown.stop @dblclick.stop>
            <button type="button" title="Zoom out (−)" @click="zoomBy(1 / 1.25)" v-html="icons.zoomOut"></button>
            <button type="button" class="ld-iv__zoom" title="Fit to screen (0)" @click="setFit">
                {{ Math.round(scale * 100) }}%
            </button>
            <button type="button" title="Zoom in (+)" @click="zoomBy(1.25)" v-html="icons.zoomIn"></button>
            <button type="button" class="ld-iv__actual" title="Actual size (1)" @click="setActual">1:1</button>
            <span class="ld-iv__sep"></span>
            <button type="button" title="Rotate left" @click="rotate(-90)" v-html="icons.rotateLeft"></button>
            <button type="button" title="Rotate right (R)" @click="rotate(90)" v-html="icons.rotateRight"></button>
            <span class="ld-iv__sep"></span>
            <button v-if="currentEditable" type="button" title="Edit image"
                    @click="$emit('edit', current)" v-html="icons.edit"></button>
            <button type="button" title="Download" @click="download" v-html="icons.download"></button>
        </div>
    </div>
</template>

<script>
import {ICON, svgIcon} from './icons.js';

// Fullscreen image viewer for the file manager: zoom (buttons, wheel,
// double-click), pan by dragging, 90° rotation and prev/next navigation.
// Rotation is view-only — the stored file is never modified.
export default {
    props: {
        images: {type: Array, required: true}, // [{src, name, ...}]
        start: {type: Number, default: 0},
    },
    data() {
        return {
            index: Math.min(Math.max(this.start, 0), this.images.length - 1),
            scale: 1,
            fitScale: 1,
            rotation: 0,
            tx: 0,
            ty: 0,
            natural: {w: 0, h: 0},
            panning: false,
            icons: {
                prev: svgIcon(ICON.chevronLeft, 26),
                next: svgIcon(ICON.chevronRight, 26),
                zoomIn: svgIcon(ICON.zoomIn, 17),
                zoomOut: svgIcon(ICON.zoomOut, 17),
                rotateLeft: svgIcon(ICON.rotateLeft, 16),
                rotateRight: svgIcon(ICON.rotateRight, 16),
                edit: svgIcon(ICON.crop, 16),
                download: svgIcon(ICON.download, 17),
            },
        };
    },
    computed: {
        current() {
            return this.images[this.index] || {src: '', name: ''};
        },
        currentEditable() {
            return /\.(jpe?g|png|webp|bmp)$/i.test(this.current.name || '');
        },
        imgStyle() {
            return {
                transform: `translate(${this.tx}px, ${this.ty}px) scale(${this.scale}) rotate(${this.rotation}deg)`,
                transition: this.panning ? 'none' : 'transform 0.15s ease',
            };
        },
    },
    mounted() {
        this.onKey = (e) => {
            if (e.key === 'Escape') this.$emit('close');
            else if (e.key === 'ArrowLeft') this.step(-1);
            else if (e.key === 'ArrowRight') this.step(1);
            else if (e.key === '+' || e.key === '=') this.zoomBy(1.25);
            else if (e.key === '-') this.zoomBy(1 / 1.25);
            else if (e.key === '0') this.setFit();
            else if (e.key === '1') this.setActual();
            else if (e.key === 'r' || e.key === 'R') this.rotate(90);
            else return;
            e.preventDefault();
            e.stopPropagation();
        };
        this.onWheel = (e) => {
            e.preventDefault();
            this.zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15);
        };
        document.addEventListener('keydown', this.onKey, true);
        this.$el.addEventListener('wheel', this.onWheel, {passive: false});
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKey, true);
        this.$el.removeEventListener('wheel', this.onWheel);
        this.stopPan();
    },
    methods: {
        onLoad() {
            const img = this.$refs.img;
            this.natural = {w: img.naturalWidth || 1, h: img.naturalHeight || 1};
            this.rotation = 0;
            this.setFit();
        },
        computeFit() {
            const stage = this.$refs.stage;
            if (!stage) return 1;
            const pad = 48;
            const sw = Math.max(1, stage.clientWidth - pad);
            const sh = Math.max(1, stage.clientHeight - pad);
            const quarter = ((this.rotation % 360) + 360) % 180 === 90;
            const w = quarter ? this.natural.h : this.natural.w;
            const h = quarter ? this.natural.w : this.natural.h;
            return Math.min(sw / w, sh / h, 1);
        },
        setFit() {
            this.fitScale = this.computeFit();
            this.scale = this.fitScale;
            this.tx = 0;
            this.ty = 0;
        },
        setActual() {
            this.scale = 1;
            this.tx = 0;
            this.ty = 0;
        },
        zoomBy(factor) {
            this.scale = Math.min(8, Math.max(0.05, this.scale * factor));
        },
        toggleZoom() {
            if (this.scale < 1) this.setActual();
            else this.setFit();
        },
        rotate(deg) {
            const wasFit = Math.abs(this.scale - this.fitScale) < 0.001;
            this.rotation += deg;
            this.fitScale = this.computeFit();
            if (wasFit) {
                this.scale = this.fitScale;
                this.tx = 0;
                this.ty = 0;
            }
        },
        step(dir) {
            if (this.images.length < 2) return;
            this.index = (this.index + dir + this.images.length) % this.images.length;
            // transform resets in onLoad when the new image arrives
        },
        stageDown(e) {
            if (e.target !== this.$refs.img) {
                this.$emit('close');
                return;
            }
            e.preventDefault();
            this.panning = true;
            const sx = e.clientX - this.tx;
            const sy = e.clientY - this.ty;
            this.onMove = (ev) => {
                this.tx = ev.clientX - sx;
                this.ty = ev.clientY - sy;
            };
            this.onUp = () => this.stopPan();
            document.addEventListener('mousemove', this.onMove);
            document.addEventListener('mouseup', this.onUp);
        },
        stopPan() {
            this.panning = false;
            if (this.onMove) document.removeEventListener('mousemove', this.onMove);
            if (this.onUp) document.removeEventListener('mouseup', this.onUp);
            this.onMove = this.onUp = null;
        },
        download() {
            const a = document.createElement('a');
            a.href = this.current.src;
            a.download = this.current.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
    },
};
</script>

<style>
.ld-iv {
    position: fixed;
    inset: 0;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 140;
    display: flex;
    flex-direction: column;
    background: rgba(9, 12, 20, 0.92);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    user-select: none;
}
.ld-iv__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding: 10px 14px;
    color: #e5e9f0;
}
.ld-iv__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.ld-iv__count {
    color: #98a2b3;
    font-size: 12px;
}
.ld-iv .ld-iv__btn {
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 15px;
    cursor: pointer;
}
.ld-iv .ld-iv__btn:hover {
    background: #2563eb;
    color: #fff;
}
.ld-iv__stage {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.ld-iv__img {
    max-width: none;
    max-height: none;
    cursor: grab;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}
.ld-iv__img.is-panning {
    cursor: grabbing;
}
.ld-iv__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.ld-iv__nav:hover {
    background: #2563eb;
    color: #fff;
}
.ld-iv__nav--prev { left: 18px; }
.ld-iv__nav--next { right: 18px; }
.ld-iv__bar {
    display: flex;
    align-items: center;
    gap: 4px;
    align-self: center;
    flex-shrink: 0;
    margin: 0 0 18px;
    padding: 7px 9px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: #141a28;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.55);
}
.ld-iv .ld-iv__bar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 34px;
    padding: 0 9px;
    border: 0;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}
.ld-iv .ld-iv__bar button:hover {
    background: #2563eb;
    color: #fff;
}
.ld-iv__zoom {
    min-width: 52px;
    font-variant-numeric: tabular-nums;
}
.ld-iv__actual {
    font-weight: 600;
    letter-spacing: 0.02em;
}
.ld-iv__sep {
    width: 1px;
    height: 20px;
    margin: 0 4px;
    background: rgba(255, 255, 255, 0.14);
}
</style>
