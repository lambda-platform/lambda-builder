<template>
    <li v-if="item.link_to == 'divider'" class="menu-title">
        <span data-key="t-menu">{{ item.key }}</span>
    </li>
    <li v-else class="nav-item">
        <!-- CRUD -->
        <router-link class="nav-link" :to="`/p/${item.id}`"
                     v-if="item.link_to != 'link' && item.link_to != 'router-link' && item.link_to != 'noAction'">
            <i v-if="item.icon" :class="item.icon"></i>
            <span v-html="getTitle(item)"></span>
        </router-link>

        <!-- SPA URL -->
        <router-link :to="item.url" v-if="item.link_to == 'router-link'">
            <i v-if="item.icon" :class="item.icon"></i>
            <span v-html="getTitle(item)"></span>
        </router-link>

        <!-- Anchor link -->
        <a href="item.url" v-if="item.link_to == 'link'" class="nav-link" target="_blank">
            <i v-if="item.icon" :class="item.icon"></i>
            <span v-html="getTitle(item)"></span>
        </a>

        <!-- No action -->
        <BLink v-if="item.link_to == 'noAction'" class="nav-link menu-link" :href="`#${item.id}`" data-bs-toggle="collapse" role="button"
               aria-expanded="false" aria-controls="sidebarDashboards">
            <i v-if="item.icon" :class="item.icon"></i>
            <span data-key="t-dashboards"> {{ item.key }} </span>
        </BLink>

        <!-- Children -->
        <div v-if="item.children && item.children.length > 0" class="collapse menu-dropdown" :id="item.id">
            <ul class="nav nav-sm flex-column">
                <li v-for="subItem in item.children" :key="subItem.id" class="nav-item">
                    <!-- CRUD -->
                    <router-link class="nav-link" :to="`/p/${item.id}/${subItem.id}`"
                                 v-if="subItem.link_to != 'link' && subItem.link_to != 'router-link' && subItem.link_to != 'noAction'">
                        <i v-if="subItem.icon" :class="subItem.icon"></i>
                        <span v-html="getTitle(subItem)"></span>
                    </router-link>

                    <!-- SPA URL -->
                    <router-link class="nav-link" :to="subItem.url" v-if="subItem.link_to == 'router-link'">
                        <i v-if="subItem.icon" :class="subItem.icon"></i>
                        <span v-html="getTitle(subItem)"></span>
                    </router-link>

                    <!-- Anchor link -->
                    <a href="subItem.url" v-if="subItem.link_to == 'link'" class="nav-link" target="_blank">
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
    props: ['item', 'index', 'hasTooltip'],
    data() {
        return {
            cruds: window.init.cruds,
            lambda: window.lambda
        };
    },
    created() {
        console.log('NAV ITEM:', this.item);
    },
    methods: {
        getTitle(item) {
            if (item.link_to === 'crud') {
                let crudIndex = this.cruds.findIndex(crud => crud.id === item.url);
                if (crudIndex >= 0) {
                    if (this.lambda.has_language) {
                        return item.key ? this.$t(item.key) : this.cruds[crudIndex].title;
                    }
                    return this.cruds[crudIndex].title;
                } else {
                    return ''
                }
            } else {
                if (this.lambda.has_language) {
                    return item.key ? this.$t(item.key) : item.title
                }
                return item.key ? item.key : item.title
            }
        },
    }
}
</script>
<style scoped>

</style>
