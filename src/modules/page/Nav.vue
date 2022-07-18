<template>
    <ul>
        <li v-for="(item, index) in menu_to_display" :key="index" v-if="item.link_to == 'wrap' || can(item)">
            <router-link :to="`/p/${item.id}`" v-if="item.link_to != 'wrap' && item.link_to != 'link' && item.link_to != 'router-link'">
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

            <a :href="item.url" v-if="item.link_to == 'wrap'" class="lambda-nav-more">
                <i v-if="item.icon" :class="item.icon"></i>
                <span v-html="getTitle(item)"></span>
                <ul>
                    <li v-for="(item, index) in menu_to_more" :key="index" v-if="can(item)">
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
            menu_to_display:[],
            menu_to_more:[]
        };
    },
    created(){
        this.menu=this.menu.filter((f)=>{
            return this.can(f);
        });
        this.menu_to_display=[];
        this.menu_to_more=[];
        if(this.menu.length>8)
        {
            for(let i=0;i<8;i++)
            {
                this.menu_to_display.push(this.menu[i]);
            }
            for(let i=8;i<this.menu.length;i++)
            {
                this.menu_to_more.push(this.menu[i]);
            }

            let wrap_menu={
                link_to:'wrap',
                icon:'ti-more',
                title:'Бусад цэс',
                url:''
            };
            this.menu_to_display.push(wrap_menu);

        }
        else{
            this.menu_to_display=this.menu;
        }
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
