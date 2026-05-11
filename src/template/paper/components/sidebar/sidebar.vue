<template>
    <aside
        id="paper-side-bar"
        class="sidebar"
        :class="{ 'is-collapsed': collapsed }"
    >
        <div class="sidebar-header">
            <slot name="brand"></slot>

            <a
                v-if="collapsible"
                href="javascript:void(0)"
                class="collapse-toggle"
                @click="toggleCollapse"
            >
                <i class="ti-angle-left"></i>
            </a>

            <a
                v-if="template == 'off-canvas'"
                href="javascript:void(0)"
                class="nav-toggle"
                @click="toggleNav"
            >
                <i class="ti-align-right"></i>
            </a>
        </div>

        <nav>
            <slot></slot>
        </nav>

        <div class="sibebar-tools">
            <slot name="sibebar-tools"></slot>
        </div>

        <div class="aside-bottom">
            <slot name="aside-bottom"></slot>
        </div>

        <div class="sidebar-profile" v-if="$slots.profile">
            <slot name="profile"></slot>
        </div>
    </aside>
</template>

<script>
    import "./sidebar.scss";

    export default {
        name: 'sidebar',
        props: {
            template: {
                type: String,
                default: null
            },
            collapsible: {
                type: Boolean,
                default: false
            },
            storageKey: {
                type: String,
                default: 'sidebar-collapsed'
            }
        },
        data() {
            return {
                collapsed: this.readStoredCollapsed()
            };
        },
        methods: {
            readStoredCollapsed() {
                if (!this.collapsible) return false;
                try {
                    return window.localStorage.getItem(this.storageKey) === 'true';
                } catch (e) {
                    return false;
                }
            },
            toggleCollapse() {
                this.collapsed = !this.collapsed;
                try {
                    window.localStorage.setItem(this.storageKey, String(this.collapsed));
                } catch (e) {
                    /* localStorage unavailable (private mode) — keep in-memory state */
                }
            },
            toggleNav() {
                let element = document.getElementById("paper-side-bar");
                element.classList.add("is-collapsed");

                let elementhide = document.getElementById("paper-side-bar-open-btn");
                elementhide.classList.remove("hidden");
            }
        }
    };
</script>
