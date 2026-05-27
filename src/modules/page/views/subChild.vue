<template>
    <div :class="{ 'tabbed-page': showTabs }">
        <krud
            v-if="pageType == 'crud'"
            :template="property.template"
            :property="property"
            class="material"
        >
            <template slot="nav">
                <slot name="nav"></slot>
            </template>

            <template slot="v-nav">
                <slot name="v-nav"></slot>
            </template>

            <template slot="tabs" v-if="showTabs">
                <nav class="lbd-tabs" ref="tabsBar">
                    <ul class="lbd-tabs__list" ref="tabsList">
                        <li
                            v-for="tab in tabs"
                            :key="tab.id"
                            class="lbd-tabs__item"
                            :class="{
                                'is-active': String(tab.id) === activeTabId,
                            }"
                            @click="onTabClick(String(tab.id))"
                        >
                            <i
                                v-if="tab.icon"
                                :class="['lbd-tabs__icon', tab.icon]"
                            ></i>
                            <span class="lbd-tabs__label">{{
                                getTitle(tab)
                            }}</span>
                        </li>
                    </ul>
                    <div
                        v-show="hasOverflow"
                        class="lbd-tabs__more"
                    >
                        <a
                            href="javascript:void(0)"
                            class="lbd-tabs__more-btn"
                            @click.stop="toggleMore"
                        >
                            <Icon type="ios-more" size="20" />
                        </a>
                        <ul
                            v-show="moreOpen"
                            class="lbd-tabs__more-menu"
                            @click.stop
                        >
                            <li
                                v-for="tab in hiddenTabs"
                                :key="'m-' + tab.id"
                                class="lbd-tabs__more-item"
                                :class="{
                                    'is-active': String(tab.id) === activeTabId,
                                }"
                                @click="onMoreItemClick(String(tab.id))"
                            >
                                <i
                                    v-if="tab.icon"
                                    :class="['lbd-tabs__icon', tab.icon]"
                                ></i>
                                {{ getTitle(tab) }}
                            </li>
                        </ul>
                    </div>
                </nav>
            </template>

            <user-control slot="right"></user-control>
        </krud>

        <div class="material" v-if="pageType == 'iframe'">
            <section class="offcanvas-template">
                <div class="crud-page">
                    <div class="crud-page-header">
                        <h3></h3>
                    </div>
                    <div class="crud-page-body">
                        <div class="v-nav">
                            <slot name="v-nav"></slot>
                        </div>
                        <div class="dg-flex">
                            <div class="iframe-page">
                                <iframe
                                    v-if="pageType == 'iframe'"
                                    :src="iframeUrl"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            pageType: "",
            menu: window.init.menu,
            cruds: window.init.cruds,
            permissions: window.init.permissions.permissions,
            property: {
                withCrudLog: window.init.withCrudLog,
                withoutHeader:
                    window.init.withoutHeader === true ? true : false,
                page_id: null,
                template: "canvas",
                mode: window.init.crud_mode ? window.init.crud_mode : undefined,
                title: "",
                grid: null,
                form: null,
                projects_id: null,
                form_width: null,
                view_url: null,
                actions: [],
                user_condition: null,
                permissions: {
                    c: false,
                    r: false,
                    u: false,
                    d: false,
                    gridDeleteConditionJS: "",
                    gridEditConditionJS: "",
                },
            },
            iframeUrl: "",
            tabs: [],
            activeTabId: "",
            hasOverflow: false,
            moreOpen: false,
            hiddenTabIds: [],
            lambda: window.lambda,
        };
    },
    computed: {
        useNavTree() {
            return !!(window.lambda && window.lambda.hasNavTree);
        },
        showTabs() {
            return this.useNavTree && this.tabs.length > 1;
        },
        hiddenTabs() {
            if (!this.hiddenTabIds.length) return [];
            let ids = this.hiddenTabIds;
            return this.tabs.filter((t) => ids.indexOf(String(t.id)) !== -1);
        },
    },
    methods: {
        toggleMore() {
            this.moreOpen = !this.moreOpen;
        },

        onMoreItemClick(id) {
            this.moreOpen = false;
            this.onTabClick(id);
        },

        onDocumentClick() {
            this.moreOpen = false;
        },

        checkOverflow() {
            let measure = () => {
                let list = this.$refs.tabsList;
                if (!list || !list.children || list.children.length === 0) {
                    return null;
                }
                let listRect = list.getBoundingClientRect();
                let hidden = [];
                for (let i = 0; i < list.children.length; i++) {
                    let rect = list.children[i].getBoundingClientRect();
                    if (rect.right > listRect.right + 1) {
                        hidden.push(String(this.tabs[i].id));
                    }
                }
                return hidden;
            };
            this.$nextTick(() => {
                let attempts = 0;
                let run = () => {
                    let result = measure();
                    if (result === null) {
                        if (attempts++ < 5) {
                            setTimeout(run, 100);
                        }
                        return;
                    }
                    this.hiddenTabIds = result;
                    this.hasOverflow = result.length > 0;
                };
                run();
            });
        },

        loadTabs() {
            let parentIndex = this.menu.findIndex(
                (menu) => menu.id == this.$route.params.menu_id
            );
            if (parentIndex < 0) return;
            let subIndex = this.menu[parentIndex].children.findIndex(
                (menu) => menu.id == this.$route.params.sub_menu_id
            );
            if (subIndex < 0) return;
            let siblings =
                this.menu[parentIndex].children[subIndex].children || [];
            this.tabs = siblings.filter(
                (child) => this.can(child) && child.link_to != "divider"
            );
            this.activeTabId = String(
                this.$route.params.sub_child_menu_id || ""
            );
        },

        onTabClick(name) {
            if (String(name) === this.activeTabId) return;
            this.$router.push(
                `/p/${this.$route.params.menu_id}/${this.$route.params.sub_menu_id}/${name}`
            );
        },

        can(item) {
            if (this.permissions[item.id]) {
                return !!this.permissions[item.id].show;
            }
            return false;
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
                }
                return "";
            }
            if (this.lambda.has_language) {
                return item.key ? this.$t(item.key) : item.title;
            }
            return item.key ? item.key : item.title;
        },

        getPage() {
            let parentIndex = this.menu.findIndex(
                (menu) => menu.id == this.$route.params.menu_id
            );

            if (parentIndex >= 0) {
                let subPageIndex = this.menu[parentIndex].children.findIndex(
                    (menu) => menu.id == this.$route.params.sub_menu_id
                );

                if (subPageIndex >= 0) {
                    let pageIndex = this.menu[parentIndex].children[
                        subPageIndex
                    ].children.findIndex(
                        (menu) =>
                            menu.id == this.$route.params.sub_child_menu_id
                    );

                    if (pageIndex >= 0) {
                        let page =
                            this.menu[parentIndex].children[subPageIndex]
                                .children[pageIndex];

                        this.pageType = page.link_to;
                        if (this.pageType == "crud") {
                            let crudIndex = this.cruds.findIndex(
                                (crud) => crud.id == page.url
                            );

                            if (crudIndex >= 0) {
                                // this.property. = 'canvas'
                                // this.property.withoutHeader = this.withoutHeader;
                                this.property.page_id = page.id;
                                this.property.title =
                                    this.cruds[crudIndex].title;
                                this.property.grid = this.cruds[crudIndex].grid;
                                this.property.form = this.cruds[crudIndex].form;
                                this.property.projects_id =
                                    this.cruds[crudIndex].projects_id;
                                this.property.edit_id =
                                    this.cruds[crudIndex].edit_id;
                                this.property.template =
                                    this.cruds[crudIndex].template;
                                if (this.cruds[crudIndex].actions) {
                                    this.property.actions = JSON.parse(
                                        this.cruds[crudIndex].actions
                                    );
                                }
                                this.property.main_tab_title =
                                    this.cruds[crudIndex].main_tab_title;

                                this.property.form_width = this.cruds[crudIndex]
                                    .form_width
                                    ? this.cruds[crudIndex].form_width
                                    : null;
                                this.property.view_url =
                                    this.cruds[crudIndex].view_url;
                                this.property.permissions.c =
                                    this.permissions[page.id].c;
                                this.property.permissions.r =
                                    this.permissions[page.id].r;
                                this.property.permissions.u =
                                    this.permissions[page.id].u;
                                this.property.permissions.d =
                                    this.permissions[page.id].d;
                                this.property.permissions.gridDeleteConditionJS =
                                    this.permissions[
                                        page.id
                                    ].gridDeleteConditionJS;
                                this.property.permissions.gridEditConditionJS =
                                    this.permissions[
                                        page.id
                                    ].gridEditConditionJS;

                                let user_condition = {};

                                if (this.permissions[page.id].formCondition) {
                                    user_condition.formCondition =
                                        this.permissions[page.id].formCondition;
                                }
                                if (this.permissions[page.id].gridCondition) {
                                    user_condition.gridCondition =
                                        this.permissions[page.id].gridCondition;
                                }

                                if (user_condition) {
                                    this.property.user_condition =
                                        user_condition;
                                }
                            }
                        } else if (this.pageType == "iframe") {
                            this.iframeUrl = page.url;
                        }
                    }
                }
            }
        },
    },
    mounted() {
        this.loadTabs();
        this.getPage();
        this.checkOverflow();
        this._onResize = () => this.checkOverflow();
        window.addEventListener("resize", this._onResize);
        document.addEventListener("click", this.onDocumentClick);
    },
    beforeDestroy() {
        if (this._onResize) {
            window.removeEventListener("resize", this._onResize);
            this._onResize = null;
        }
        document.removeEventListener("click", this.onDocumentClick);
    },
    watch: {
        $route() {
            this.loadTabs();
            this.getPage();
            this.checkOverflow();
        },
        tabs() {
            this.checkOverflow();
        },
    },
};
</script>
