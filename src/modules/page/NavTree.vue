<template>
    <ul class="navbar-nav h-100 nav-tree" id="navbar-nav">
        <!-- Хайлт (search === true үед цэсний хамгийн дээр) -->
        <li v-if="search" class="nav-search">
            <div class="nav-search-box">
                <Icon type="ios-search" class="nav-search-icon" />
                <input
                    v-model="query"
                    type="text"
                    class="nav-search-input"
                    placeholder="Хайх..."
                />
                <Icon
                    v-if="query"
                    type="ios-close-circle"
                    class="nav-search-clear"
                    @click.native="query = ''"
                />
            </div>
        </li>

        <NavTreeItem
            v-for="(item, index) in filteredMenu"
            :key="index"
            v-if="can(item)"
            :item="item"
            :index="index"
            :has-tooltip="hasTooltip"
            :search-query="searchQuery"
        />

        <!-- Илэрц олдоогүй -->
        <li v-if="isSearching && filteredMenu.length === 0" class="nav-search-empty">
            <Icon type="ios-search" />
            <span>Илэрц олдсонгүй</span>
        </li>
    </ul>
</template>

<script>
import NavTreeItem from "./NavTreeItem.vue";
import { checkLinkAccess } from "../../utils/index.js";

export default {
    props: {
        hasTooltip: {},
        search: { type: Boolean, default: false },
    },
    components: {
        NavTreeItem,
    },
    data() {
        return {
            menu: window.init.menu,
            permissions: window.init.permissions.permissions,
            extra: window.init.permissions.extra,
            cruds: window.init.cruds,
            lambda: window.lambda,
            query: "",
        };
    },
    computed: {
        searchQuery() {
            return this.query ? this.query.trim().toLowerCase() : "";
        },
        isSearching() {
            return this.search && this.searchQuery.length > 0;
        },
        filteredMenu() {
            if (!this.isSearching) return this.menu;
            const q = this.searchQuery;
            return this.menu.filter(
                (item) =>
                    item.link_to !== "divider" &&
                    this.can(item) &&
                    this.matchesQuery(item, q)
            );
        },
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

        // Цэсний нэр эсвэл дэд цэсүүдийн аль нэг нь хайлттай таарч байгаа эсэх
        matchesQuery(item, q) {
            const title = (this.getItemTitle(item) || "").toString().toLowerCase();
            if (title.indexOf(q) !== -1) return true;
            if (item.children && item.children.length) {
                return item.children.some(
                    (c) =>
                        c.link_to != "divider" &&
                        this.can(c) &&
                        this.matchesQuery(c, q)
                );
            }
            return false;
        },

        // NavTreeItem.getTitle-тэй ижил логик (шүүлтэд ашиглана)
        getItemTitle(item) {
            if (item.link_to == "crud") {
                let crudIndex = this.cruds.findIndex(
                    (crud) => crud.id == item.url
                );
                if (crudIndex >= 0) {
                    if (this.lambda.has_language) {
                        return item.key
                            ? this.$t(item.key)
                            : this.cruds[crudIndex].title;
                    }
                    return this.cruds[crudIndex].title;
                }
                return "";
            }
            if (this.lambda.has_language) {
                return item.key ? this.$t(item.key) : item.title;
            }
            return item.key ? item.key : item.title;
        },
    },
};
</script>

<style scoped>
.nav-search {
    list-style: none;
    margin: 0;
    padding: 4px 0 12px !important;
    width: 100% !important;
}
.nav-search-box {
    position: relative;
    display: flex;
    align-items: center;
}
.nav-search-input {
    width: 100%;
    height: 38px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font-size: 13px;
    padding: 0 32px 0 34px;
    outline: none;
    transition: all 0.18s ease;
}
.nav-search-input::placeholder {
    color: rgba(255, 255, 255, 0.45);
}
.nav-search-input:focus {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.35);
}
.nav-search-icon {
    position: absolute;
    left: 11px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    pointer-events: none;
}
.nav-search-clear {
    position: absolute;
    right: 9px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    cursor: pointer;
    transition: color 0.15s ease;
}
.nav-search-clear:hover {
    color: #fff;
}
.nav-search-empty {
    list-style: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 22px 14px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
}
.nav-search-empty i {
    font-size: 22px;
}
</style>
