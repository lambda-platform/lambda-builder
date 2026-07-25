<template>
    <div class="ld-pw-overlay" @mousedown.self="$emit('close')">
        <div class="ld-pw ld-em">
            <div class="ld-pw-head">
                <span class="ld-pw-icon" v-html="embedIcon"></span>
                <span class="ld-pw-title">Insert embed</span>
                <button class="ld-pw-close" type="button" title="Close" @click="$emit('close')">✕</button>
            </div>
            <div class="ld-pw-hint">
                Paste an embed code (&lt;iframe ...&gt;) or a URL — YouTube and Vimeo links are converted automatically.
            </div>
            <div class="ld-em-body">
                <textarea class="ld-em-code" ref="code" v-model="code" spellcheck="false"
                          placeholder='<iframe src="https://www.youtube.com/embed/..." ...></iframe>'
                          @input="parse"></textarea>
                <div class="ld-em-size">
                    <label>Width
                        <input type="text" v-model.trim="width" placeholder="100%"/>
                    </label>
                    <label>Height
                        <input type="text" v-model.trim="height" placeholder="400"/>
                    </label>
                    <span class="ld-em-size-hint">px or % — e.g. 560, 100%</span>
                </div>
                <div class="ld-em-preview" v-if="src">
                    <iframe :src="src" :style="previewStyle" frameborder="0" allowfullscreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                </div>
                <div class="ld-em-preview ld-em-preview--empty" v-else>Preview</div>
            </div>
            <div class="ld-pw-foot">
                <button class="ld-dlg-btn" type="button" @click="$emit('close')">Cancel</button>
                <button class="ld-dlg-btn ld-dlg-btn--primary" type="button"
                        :disabled="!src" @click="insert">Insert</button>
            </div>
        </div>
    </div>
</template>

<script>
import {ICON, svgIcon} from './icons.js';

// Turn a plain media URL into an embeddable one; anything else http(s) is used as-is.
function toEmbedURL(url) {
    let m = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{6,})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = url.match(/vimeo\.com\/(\d+)/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    return /^https?:\/\//.test(url) ? url : null;
}

export default {
    data() {
        return {
            code: '',
            src: null,
            width: '100%',
            height: '400',
            sizeFromCode: false,
            embedIcon: svgIcon(ICON.embed, 18),
        };
    },
    computed: {
        previewStyle() {
            const css = (v, fallback) => {
                if (!v) return fallback;
                return /^\d+(\.\d+)?$/.test(v) ? v + 'px' : v;
            };
            return {
                width: css(this.width, '100%'),
                height: css(this.height, '400px'),
                maxWidth: '100%',
                border: 0,
            };
        },
    },
    mounted() {
        this.onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                this.$emit('close');
            }
        };
        document.addEventListener('keydown', this.onKey, true);
        this.$nextTick(() => this.$refs.code.focus());
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKey, true);
    },
    methods: {
        parse() {
            const input = this.code.trim();
            this.src = null;
            if (!input) return;
            if (input.charAt(0) === '<') {
                // Parsed detached, so scripts inside embed codes never run.
                const div = document.createElement('div');
                div.innerHTML = input;
                const frame = div.querySelector('iframe[src]');
                if (!frame) return;
                this.src = frame.getAttribute('src');
                const w = (frame.style && frame.style.width) || frame.getAttribute('width');
                const h = (frame.style && frame.style.height) || frame.getAttribute('height');
                // Only overwrite the size fields with values coming from the code
                // itself, never a user's manual edit.
                if (w || h) {
                    if (w) this.width = w;
                    if (h) this.height = h;
                    this.sizeFromCode = true;
                } else if (this.sizeFromCode) {
                    this.width = '100%';
                    this.height = '400';
                    this.sizeFromCode = false;
                }
            } else {
                this.src = toEmbedURL(input);
            }
        },
        insert() {
            if (!this.src) return;
            this.$emit('insert', {
                src: this.src,
                width: this.width || '100%',
                height: this.height || '400',
            });
        },
    },
};
</script>

<style>
.ld-em {
    height: auto;
    max-height: 100%;
}
.ld-em-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: auto;
    margin: 0 16px;
}
.ld-em-code {
    flex-shrink: 0;
    height: 92px;
    padding: 10px 12px;
    border: 1.5px solid #d0d5dd;
    border-radius: 8px;
    outline: none;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
    color: #101828;
}
.ld-em-code:focus {
    border-color: #2563eb;
}
.ld-em-size {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
}
.ld-em-size label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #344054;
}
.ld-em-size input {
    width: 84px;
    padding: 6px 8px;
    border: 1.5px solid #d0d5dd;
    border-radius: 6px;
    outline: none;
    font-size: 13px;
    color: #101828;
}
.ld-em-size input:focus {
    border-color: #2563eb;
}
.ld-em-size-hint {
    font-size: 12px;
    color: #98a2b3;
}
.ld-em-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    max-height: 320px;
    overflow: auto;
    border: 1.5px dashed #d0d5dd;
    border-radius: 8px;
    background: #f9fafb;
    padding: 8px;
}
.ld-em-preview--empty {
    color: #98a2b3;
    font-size: 13px;
}
</style>
