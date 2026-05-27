<template>
    <ul class="navbar-nav h-100 nav-tree" id="navbar-nav">
        <NavTreeItem
            v-for="(item, index) in menu"
            :key="index"
            v-if="can(item)"
            :item="item"
            :index="index"
            :has-tooltip="hasTooltip"
        />
    </ul>
</template>

<script>
import NavTreeItem from "./NavTreeItem.vue";
import { checkLinkAccess } from "../../utils/index.js";

export default {
    props: ["hasTooltip"],
    components: {
        NavTreeItem,
    },
    data() {
        return {
            menu: window.init.menu,
            permissions: window.init.permissions.permissions,
            extra: window.init.permissions.extra,
        };
    },
    mounted() {
        checkLinkAccess(this.$route, this.$router, this.menu);
    },
    methods: {
        can(menu) {
            if (this.permissions[menu.id]) {
                return !!this.permissions[menu.id].show;
            }
            return false;
        },
    },
};
</script>
