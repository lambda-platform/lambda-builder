<template>
    <div class="settings-module">
        <div v-for="m in menu" :key="m.id" class="module">
            <h2>{{ m.title }}</h2>

            <div class="sub-module">
                <div v-for="sm in m.children" class="sub-module-item">
                    <a href="javascript:void(0)" v-if="sm.link_to == 'crud'" @click="getCrud(sm.url)">
                        <i :class="sm.icon"></i>
                        <span>{{ sm.title }}</span>
                    </a>

                    <a v-else href="#">
                        <i :class="sm.icon"></i>
                        <span>{{ sm.title }}</span>
                    </a>
                </div>
            </div>
        </div>

        <paper-modal
            name="crud-modal"
            class="page-modal"
            :min-width="200"
            :min-height="200"
            :pivot-y="0.5"
            :adaptive="true"
            :reset="true"
            :resizable="true"
            width="95%"
            height="95%">
            <krud class="material" :template="property.template" :property="property"/>
        </paper-modal>
    </div>
</template>

<script>
export default {
    name: "settings.vue",
    props: ['menuId'],
    data() {
        return {
            title: "",
            menu: [],
            property: {
                template: "canvas",
                title: "Ачааны бүртгэл",
                grid: 158,
                form: ""
            },
        }
    },

    created() {
        this.getMenu();
    },

    methods: {
        getMenu() {
            axios.get(`/lambda/krud/menu_form/edit/${this.menuId}`).then(({data}) => {
                this.menu = JSON.parse(data.data.schema);
                this.title = data.data.name;
            })
        },

        getCrud(id){
            console.log("Working here");

            axios.get(`/api/krud/${id}`).then(({data}) => {
                this.property.grid = data.grid;
                this.property.form = data.form;
                this.$modal.show('crud-modal');
            })
        },

        showCrud() {
            this.$modal.show('crud-modal');
        }
    }
}
</script>
