<template>
    <header id="page-topbar">
        <div class="layout-width">
            <div class="navbar-header">
                <div class="d-flex">
                    <!-- LOGO -->
                    <BButton variant="white"
                             @click="toggleMenu"
                             class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                             id="topnav-hamburger-icon">
                        <span class="hamburger-icon">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                    </BButton>

                    <h3 v-if="$props.title != null">{{ $props.title.replace('-', ' ') }}</h3>

                    <div class="crud-page-header-left">
                        <span v-if="permissions ? permissions.c : true" class="divider"></span>
                    </div>

                    <div class="app-search d-none d-md-block">
                        <div class="position-relative">
                            <input type="text" class="form-control" placeholder="Search..." autocomplete="off"
                                   id="search-options"
                                   value=""/>
                            <span class="mdi mdi-magnify search-widget-icon"></span>
                        </div>
                    </div>
                </div>


                <div class="crud-page-header-right">
                    <Button v-if="permissions ? permissions.c : true"
                            @click="openForm" type="success" shape="circle" size="small"
                            icon="md-add">
                        {{ lang._add }}
                    </Button>

                    <div class="tooloptions">
                        <slot name="tooloptions"></slot>
                    </div>

                    <div class="crud-page-header-right-inside">
                        <!--        <Tooltip content="Устсан мэдээлэл харах">-->
                        <!--            <Button ghost class="crud-tool" icon="eye-disabled" @click="refreshGrid"></Button>-->
                        <!--        </Tooltip>-->
                        <!--        -->

                        <Tooltip :content="lang._save">
                            <a @click="$props.save" class="btnLine" v-if="isSave">
                                <i class="ti-save"></i>
                            </a>
                        </Tooltip>

                        <Tooltip :content="lang.re_call">
                            <a @click="$props.refresh" class="btnLine" v-if="isRefresh">
                                <i class="ti-reload"></i>
                            </a>
                        </Tooltip>

                        <Tooltip :content="lang._print" v-if="isPrint">
                            <a @click="$props.print" class="btnLine">
                                <i class="ti-printer"></i>
                            </a>
                        </Tooltip>

                        <Tooltip :content="lang.excelUpload" v-if="isExcelUpload">
                            <a v-if="$props.excelUploadCustomUrl" :href="$props.excelUploadCustomUrl"
                               class="btnLine">
                                <i class="ti-layers"></i>
                            </a>
                            <a v-else @click="$props.excelUploadMethod" class="btnLine">
                                <i class="ti-layers"></i>
                            </a>
                        </Tooltip>

                        <Tooltip :content="lang.download_file" v-if="isExcel">
                            <a class="btnLine" href="javascript:void(0)" v-if="$props.exportLoading">
                                <Spin>
                                    <Icon type="ios-loading" size=18 class="spin-icon-load"></Icon>
                                </Spin>
                            </a>
                            <a @click="$props.exportExcel" v-else class="btnLine">
                                <i class="ti-download"></i>
                            </a>
                        </Tooltip>

                        <form v-if="isSearch" @submit="searchGrid">
                            <div class="right-search">
                                <input v-model="searchModel"
                                       :placeholder="$static_words ? $static_words.search : 'Хайх...'"
                                       class="right-search-input"/>
                                <i class="ti-search"></i>
                            </div>
                        </form>
                    </div>

                    <!--            <Button v-if="exportSelectedRows" @click="exportByPath" :disabled="selectedData.length < 1" type="success"-->
                    <!--                    shape="circle" size="small">-->
                    <!--                {{ exportLabel }}-->
                    <!--            </Button>-->
                    <slot name="right"></slot>
                    <user-control />
                </div>
            </div>
        </div>
    </header>
</template>

<script>

export default {
    name: "krud-header",
    props: [
        'openForm',
        "title",
        "refresh",
        "exportExcel",
        "print",
        "search",
        "save",
        "options",
        "isExcel",
        "isExcelUpload",
        "excelUploadCustomUrl",
        "excelUploadMethod",
        "isPrint",
        "isRefresh",
        "isSave",
        "isSearch",
        "exportLoading"
    ],
    components: {},
    data() {
        return {
            isMenuCondensed: false,
            searchModel: null
        }
    },
    computed: {
        lang() {
            const labels = ['_add', 'Information_viewing_history', 'excelUpload'];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('crud.' + labels[i]);
                return obj;
            }, {});
        },
    },
    methods: {
        searchGrid(e) {
            e.preventDefault();
            this.$props.search(this.searchModel);
        },

        toggleMenu() {
            document.body.classList.toggle("sidebar-enable");
            if (window.screen.width >= 992) {
                // eslint-disable-next-line no-unused-vars
                this.$router.afterEach((routeTo, routeFrom) => {
                    document.body.classList.remove("sidebar-enable");
                    document.body.classList.remove("vertical-collpsed");
                });
                document.body.classList.toggle("vertical-collpsed");
            } else {
                // eslint-disable-next-line no-unused-vars
                this.$router.afterEach((routeTo, routeFrom) => {
                    document.body.classList.remove("sidebar-enable");
                });
                document.body.classList.remove("vertical-collpsed");
            }
            this.isMenuCondensed = !this.isMenuCondensed;
        },
    }
}
</script>
