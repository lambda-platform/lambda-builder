<template>
    <div class="ld-dlg-overlay" :class="{'ld-dlg-overlay--attached': attached}" @mousedown.self="cancel">
        <div class="ld-dlg">
            <div class="ld-dlg-head">
                <span class="ld-dlg-icon" v-if="iconSvg" v-html="iconSvg"></span>
                <span class="ld-dlg-title">{{ title }}</span>
                <button class="ld-dlg-close" type="button" title="Close" @click="cancel">✕</button>
            </div>
            <div class="ld-dlg-body">
                <p class="ld-dlg-message" v-if="message">{{ message }}</p>
                <div class="ld-dlg-field" v-if="mode === 'prompt'">
                    <span class="ld-dlg-label">{{ label }}</span>
                    <input ref="input" type="text" v-model="val" @keyup.enter="confirm"/>
                </div>
            </div>
            <div class="ld-dlg-foot">
                <button v-if="mode !== 'alert'" class="ld-dlg-btn" type="button" @click="cancel">Cancel</button>
                <button class="ld-dlg-btn ld-dlg-btn--primary" :class="{'ld-dlg-btn--danger': danger}"
                        type="button" :disabled="confirmDisabled" @click="confirm">{{ confirmText }}</button>
            </div>
        </div>
    </div>
</template>

<script>
// In-app replacement for window.prompt/confirm/alert, styled after CKBox
// dialogs. Mounted programmatically by dialog.js; emits `done` with the
// result (prompt: string|null, confirm: boolean, alert: undefined).
export default {
    props: {
        mode: {type: String, default: 'prompt'}, // 'prompt' | 'confirm' | 'alert'
        title: {type: String, default: ''},
        message: {type: String, default: ''},
        label: {type: String, default: ''},
        value: {type: String, default: ''},
        confirmText: {type: String, default: 'Save'},
        danger: {type: Boolean, default: false},
        allowEmpty: {type: Boolean, default: false},
        iconSvg: {type: String, default: null},
        attached: {type: Boolean, default: false},
    },
    data() {
        return {val: this.value};
    },
    computed: {
        confirmDisabled() {
            return this.mode === 'prompt' && !this.allowEmpty && !this.val.trim();
        },
    },
    mounted() {
        this.onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                this.cancel();
            }
        };
        document.addEventListener('keydown', this.onKey, true);
        if (this.mode === 'prompt') {
            this.$nextTick(() => {
                this.$refs.input.focus();
                this.$refs.input.select();
            });
        }
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKey, true);
    },
    methods: {
        confirm() {
            if (this.confirmDisabled) return;
            if (this.mode === 'prompt') this.$emit('done', this.val.trim());
            else if (this.mode === 'confirm') this.$emit('done', true);
            else this.$emit('done', undefined);
        },
        cancel() {
            if (this.mode === 'prompt') this.$emit('done', null);
            else if (this.mode === 'confirm') this.$emit('done', false);
            else this.$emit('done', undefined);
        },
    },
};
</script>

<style>
.ld-dlg-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    align-items: safe center;
    justify-content: center;
    padding: 16px;
    overflow: auto;
    background: rgba(16, 24, 40, 0.45);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
/* Attached mode: floats over the host element (editor / file manager body)
   without dimming the whole window. */
.ld-dlg-overlay--attached {
    position: absolute;
    background: transparent;
}
.ld-dlg {
    width: 400px;
    max-width: 100%;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(16, 24, 40, 0.3);
    overflow: hidden;
}
.ld-dlg-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid #eaecf0;
}
.ld-dlg-icon {
    display: inline-flex;
    color: #475467;
}
.ld-dlg-title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    color: #101828;
}
.ld-dlg-close {
    width: 30px;
    height: 30px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #667085;
    font-size: 14px;
    cursor: pointer;
}
.ld-dlg-close:hover {
    background: #f2f4f7;
}
.ld-dlg-body {
    padding: 20px 16px;
}
.ld-dlg-message {
    margin: 0;
    color: #475467;
    font-size: 13.5px;
    line-height: 1.5;
}
.ld-dlg-message + .ld-dlg-field {
    margin-top: 16px;
}
.ld-dlg-field {
    position: relative;
    border: 1.5px solid #2563eb;
    border-radius: 6px;
}
.ld-dlg-label {
    position: absolute;
    top: -8px;
    left: 10px;
    z-index: 1;
    padding: 0 4px;
    background: #fff;
    color: #475467;
    font-size: 11.5px;
    line-height: 1.3;
}
/* Hard reset: host apps (iview/admin css) style bare inputs and buttons with
   high-specificity rules, so pin down everything that affects layout. */
.ld-dlg-overlay .ld-dlg-field input {
    display: block !important;
    width: 100% !important;
    height: 42px !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 10px 12px !important;
    border: 0 !important;
    border-radius: 6px !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    color: #101828 !important;
    font-size: 14px !important;
    line-height: 22px !important;
    font-family: inherit !important;
}
.ld-dlg-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 16px 16px;
}
.ld-dlg-overlay .ld-dlg-btn {
    display: inline-flex !important;
    align-items: center !important;
    height: 36px !important;
    margin: 0 !important;
    padding: 0 16px !important;
    border: 1px solid #d0d5dd !important;
    border-radius: 8px !important;
    background: #fff !important;
    color: #344054 !important;
    font-size: 13.5px !important;
    font-family: inherit !important;
    line-height: 1 !important;
    cursor: pointer;
}
.ld-dlg-overlay .ld-dlg-btn:hover {
    background: #f9fafb !important;
}
.ld-dlg-overlay .ld-dlg-btn--primary {
    border: 0 !important;
    background: #2563eb !important;
    color: #fff !important;
}
.ld-dlg-overlay .ld-dlg-btn--primary:hover {
    background: #1d4ed8 !important;
}
.ld-dlg-overlay .ld-dlg-btn--primary:disabled {
    background: #93c5fd !important;
    cursor: default;
}
.ld-dlg-overlay .ld-dlg-btn--danger {
    background: #dc2626 !important;
}
.ld-dlg-overlay .ld-dlg-btn--danger:hover {
    background: #b91c1c !important;
}
</style>
