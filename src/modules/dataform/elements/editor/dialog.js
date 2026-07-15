import Vue from 'vue';
import LdDialog from './LdDialog.vue';
import {ICON, svgIcon} from './icons.js';

// Promise-based dialogs replacing window.prompt/confirm/alert. Pass
// `container` to float the dialog over that element (e.g. the editor body or
// the file manager modal) instead of the whole window.

function open(props, container) {
    return new Promise((resolve) => {
        const host = container || document.body;
        const mountEl = document.createElement('div');
        host.appendChild(mountEl);
        const vm = new Vue({
            render: (h) =>
                h(LdDialog, {
                    props: {...props, attached: !!container},
                    on: {
                        done(result) {
                            resolve(result);
                            vm.$destroy();
                            if (vm.$el && vm.$el.parentNode) vm.$el.parentNode.removeChild(vm.$el);
                        },
                    },
                }),
        }).$mount(mountEl);
    });
}

function iconSvg(icon) {
    return icon && ICON[icon] ? svgIcon(ICON[icon], 18) : null;
}

// Resolves with the trimmed string, or null when cancelled.
export function ldPrompt({title, label, value = '', icon = null, confirmText = 'Save', allowEmpty = false, container = null}) {
    return open({mode: 'prompt', title, label, value, confirmText, allowEmpty, iconSvg: iconSvg(icon)}, container);
}

// Resolves with true/false.
export function ldConfirm({title, message, icon = 'trash', confirmText = 'Delete', danger = true, container = null}) {
    return open({mode: 'confirm', title, message, confirmText, danger, iconSvg: iconSvg(icon)}, container);
}

// Resolves when dismissed.
export function ldAlert({title, message, icon = null, container = null}) {
    return open({mode: 'alert', title, message, confirmText: 'OK', iconSvg: iconSvg(icon)}, container);
}
