<template>
    <li v-if="item.link_to == 'divider'" class="menu-title">
        <span data-key="t-menu">{{ item.key }}</span>
    </li>
    <li v-else class="nav-item" :class="{ 'has-children': hasChildren, 'is-open': isOpen }">
        <div class="nav-row">
            <!-- CRUD -->
            <router-link
                class="nav-link"
                :to="`/p/${item.id}`"
                v-if="
                    item.link_to != 'link' &&
                    item.link_to != 'router-link' &&
                    item.link_to != 'noAction'
                "
            >
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
            </router-link>

            <!-- SPA URL -->
            <router-link
                :to="item.url"
                v-if="item.link_to == 'router-link'"
                class="nav-link menu-link"
            >
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
            </router-link>

            <!-- Anchor link -->
            <a
                href="item.url"
                v-if="item.link_to == 'link'"
                class="nav-link menu-link"
                target="_blank"
            >
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
            </a>

            <!-- No action -->
            <a
                v-if="item.link_to == 'noAction'"
                class="nav-link menu-link collapse-toggle"
                href="#"
                role="button"
                :aria-expanded="isOpen ? 'true' : 'false'"
                @click.prevent="toggle"
            >
                <i v-if="item.icon" :class="item.icon"></i>
                <span> {{ getTitle(item) }} </span>
            </a>

            <!-- Caret toggle for any item with children -->
            <button
                v-if="hasChildren"
                type="button"
                class="collapse-caret-btn"
                :aria-expanded="isOpen ? 'true' : 'false'"
                @click.stop.prevent="toggle"
            >
                <i class="collapse-caret" :class="isOpen ? 'caret-open' : 'caret-closed'"></i>
            </button>
        </div>

        <!-- Collapse -->
        <div
            v-if="item.children && item.children.length > 0"
            class="collapse"
            :class="{ show: isOpen }"
            v-show="isOpen"
            :id="item.id"
        >
            <ul class="collapse-ul">
                <li
                    v-for="subItem in visibleChildren"
                    :key="subItem.id"
                    class="collapse-li"
                >
                    <!-- CRUD / noAction (parent with children) -->
                    <router-link
                        class="nav-link"
                        :to="`/p/${item.id}/${subItem.id}`"
                        v-if="
                            subItem.link_to != 'link' &&
                            subItem.link_to != 'router-link'
                        "
                    >
                        <i v-if="subItem.icon" :class="subItem.icon"></i>
                        <span v-html="getTitle(subItem)"></span>
                    </router-link>

                    <!-- SPA URL -->
                    <router-link
                        class="nav-link"
                        :to="subItem.url"
                        v-if="subItem.link_to == 'router-link'"
                    >
                        <i v-if="subItem.icon" :class="subItem.icon"></i>
                        <span v-html="getTitle(subItem)"></span>
                    </router-link>

                    <!-- Anchor link -->
                    <a
                        href="subItem.url"
                        v-if="subItem.link_to == 'link'"
                        class="nav-link"
                        target="_blank"
                    >
                        <i v-if="subItem.icon" :class="subItem.icon"></i>
                        <span v-html="getTitle(subItem)"></span>
                    </a>
                </li>
            </ul>
        </div>
    </li>
</template>

<script>
export default {
    props: ["item", "index", "hasTooltip", "searchQuery"],
    data() {
        return {
            cruds: window.init.cruds,
            lambda: window.lambda,
            permissions: window.init.permissions.permissions,
            isOpen: false,
        };
    },
    computed: {
        isSearching() {
            return !!(this.searchQuery && this.searchQuery.length > 0);
        },
        // Энэ цэсний нэр өөрөө хайлттай таарч байгаа эсэх
        selfMatches() {
            if (!this.isSearching) return false;
            return (this.getTitle(this.item) || "")
                .toString()
                .toLowerCase()
                .indexOf(this.searchQuery) !== -1;
        },
        hasChildren() {
            return !!(this.item && this.item.children && this.visibleChildren.length > 0);
        },
        visibleChildren() {
            if (!this.item || !this.item.children || this.item.children.length === 0) return [];
            let children = this.item.children.filter(c => c.link_to != 'divider' && this.can(c));
            // Хайлт идэвхтэй бөгөөд эцэг цэсийн нэр таараагүй бол зөвхөн таарсан дэд цэсүүд
            if (this.isSearching && !this.selfMatches) {
                const q = this.searchQuery;
                children = children.filter(
                    c => (this.getTitle(c) || "").toString().toLowerCase().indexOf(q) !== -1
                );
            }
            return children;
        }
    },
    created() {
        this.isOpen = this.hasActiveChild(this.item);
    },
    watch: {
        '$route'() {
            if (this.hasActiveChild(this.item)) {
                this.isOpen = true;
            }
        },
        searchQuery() {
            if (this.isSearching) {
                // Таарсан дэд цэстэй бол автоматаар нээнэ
                if (this.visibleChildren.length > 0) this.isOpen = true;
            } else {
                this.isOpen = this.hasActiveChild(this.item);
            }
        }
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        },

        can(menu) {
            if (this.permissions[menu.id]) {
                return !!this.permissions[menu.id].show;
            }
            return false;
        },

        hasActiveChild(item) {
            if (!item.children || item.children.length === 0) return false;
            let currentPath = this.$route.path;
            return item.children.some(sub => {
                let subPath = sub.link_to === 'router-link' ? sub.url : `/p/${item.id}/${sub.id}`;
                return currentPath === subPath || currentPath.startsWith(subPath + '/');
            });
        },

        getTitle(item) {
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
                } else {
                    return "";
                }
            } else {
                if (this.lambda.has_language) {
                    return item.key ? this.$t(item.key) : item.title;
                }
                return item.key ? item.key : item.title;
            }
        },
    },
};
</script>
