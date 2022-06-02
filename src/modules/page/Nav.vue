<template>
    <ul>
        <li v-for="(item, index) in menu" :key="index" v-if="can(item)">
            <router-link :to="`/p/${item.id}`" v-if="item.link_to != 'link' && item.link_to != 'router-link'">
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
            </router-link>

            <router-link :to="item.url" v-if="item.link_to == 'router-link'">
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
            </router-link>

            <a :href="item.url" v-if="item.link_to == 'link'" target="_blank">
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
            </a>
        </li>
    </ul>
</template>

<script>

export default {
    data() {

        return {
            menu: window.init.menu,
            cruds: window.init.cruds,
            permissions: window.init.permissions.permissions,
            extra: window.init.permissions.extra,

        };
    },
    methods: {
        can(menu) {
            if (this.permissions[menu.id]) {
                if (this.permissions[menu.id].show)
                    return true;
                else
                    return false
            } else
                return false;
        },

        getTitle(item) {
            if (item.link_to == 'crud') {
                let crudIndex = this.cruds.findIndex(crud => crud.id == item.url);
                if (crudIndex >= 0)
                    return this.cruds[crudIndex].title
                else
                    return ''
            } else
                return item.title;
        },
    }
};
</script>
