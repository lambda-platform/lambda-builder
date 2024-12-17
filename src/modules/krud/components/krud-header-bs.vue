<template>
    <header id="page-topbar">
        <div class="layout-width">
            <div class="navbar-header">
                <div class="d-flex align-items-center">
                    <!-- LOGO -->
                    <BButton variant="white"
                             class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                             id="topnav-hamburger-icon">
                        <span class="hamburger-icon">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                    </BButton>

                    <!--                    <h3 v-if="$props.title != null">{{ $props.title.replace('-', ' ') }}</h3>-->
                    <form v-if="isSearch" @submit="searchGrid" class="app-search d-none d-md-block">
                        <div class="position-relative">
                            <input type="text" class="form-control"
                                   v-model="searchModel"
                                   :placeholder="$static_words ? $static_words.search : 'Хайх...'"
                                   autocomplete="off"/>
                            <span class="mdi mdi-magnify search-widget-icon"></span>
                        </div>
                    </form>

                    <slot name="header-left"></slot>
                </div>

                <div class="d-flex align-items-center">
                    <div class="tooloptions">
                        <slot name="tooloptions"></slot>
                    </div>

                    <b-button v-if="permissions ? permissions.c : true" variant="success"
                              class="btn-label waves-effect waves-light rounded-pill" @click="openForm">
                        <i class="ri-add-line label-icon align-middle fs-16 me-2 rounded-pill"></i>
                        <span>{{ lang._add }}</span>
                    </b-button>


                    <b-button v-if="isSave" @click="$props.save" variant="success"
                              class="btn-label waves-effect waves-light rounded-pill">
                        <i class="ri-save-2-fill label-icon align-middle fs-16 me-2 rounded-pill"></i>
                        <span>Хадгалах</span>
                    </b-button>

                    <!--                    <div class="ms-1 header-item d-none d-sm-flex" v-if="isSave">-->
                    <!--                        <Tooltip :content="lang._save">-->
                    <!--                           -->
                    <!--                        </Tooltip>-->
                    <!--                    </div>-->

                    <div class="ms-1 header-item d-none d-sm-flex" v-if="isRefresh">
                        <Tooltip :content="lang.re_call">
                            <BButton type="button" @click="$props.refresh" variant="ghost-secondary"
                                     class="btn-icon btn-topbar rounded-circle">
                                <i class="bx bx-refresh fs-24"></i>
                            </BButton>
                        </Tooltip>
                    </div>

                    <div class="ms-1 header-item d-none d-sm-flex" v-if="isPrint">
                        <Tooltip :content="lang._print">
                            <BButton type="button" @click="$props.print" variant="ghost-secondary"
                                     class="btn-icon btn-topbar rounded-circle">
                                <i class="bx bx-printer fs-22"></i>
                            </BButton>
                        </Tooltip>
                    </div>

                    <div class="ms-1 header-item d-none d-sm-flex" v-if="isExcel">
                        <Tooltip :content="lang.download_file">
                            <BButton variant="ghost-secondary" class="btn-icon btn-topbar rounded-circle"
                                     v-if="$props.exportLoading">
                                <Spin>
                                    <Icon type="ios-loading" size=18 class="spin-icon-load"></Icon>
                                </Spin>
                            </BButton>
                            <BButton @click="$props.exportExcel" v-else variant="ghost-secondary"
                                     class="btn-icon btn-topbar rounded-circle">
                                <i class="bx bx-download fs-22"></i>
                            </BButton>
                        </Tooltip>
                    </div>

                    <div class="ms-1 header-item d-none d-sm-flex" v-if="isExcelUpload">
                        <Tooltip :content="lang.excelUpload">
                            <BButton v-if="$props.excelUploadCustomUrl" :href="$props.excelUploadCustomUrl"
                                     variant="ghost-secondary" class="btn-icon btn-topbar rounded-circle">
                                <i class="bx bx-upload fs-22"></i>
                            </BButton>
                            <BButton v-else @click="$props.excelUploadMethod" variant="ghost-secondary"
                                     class="btn-icon btn-topbar rounded-circle">
                                <i class="bx bx-upload fs-22"></i>
                            </BButton>
                        </Tooltip>
                    </div>

                    <!--                    <BDropdown class="dropdown" variant="ghost-secondary" dropstart-->
                    <!--                               :offset="{ alignmentAxis: 57, crossAxis: 0, mainAxis: -42 }"-->
                    <!--                               toggle-class="btn-icon btn-topbar rounded-circle mode-layout ms-1 arrow-none"-->
                    <!--                               menu-class="p-0 dropdown-menu-end">-->
                    <!--                        <template #button-content>-->
                    <!--                            <i class="bx bx-category-alt fs-22"></i>-->
                    <!--                        </template>-->
                    <!--                        <div-->
                    <!--                            class="p-3 border-top-0 dropdown-head border-start-0 border-end-0 border-dashed border dropdown-menu-lg">-->
                    <!--                            <BRow class="align-items-center">-->
                    <!--                                <BCol>-->
                    <!--                                    <h6 class="m-0 fw-semibold fs-15">Web Apps</h6>-->
                    <!--                                </BCol>-->
                    <!--                                <BCol cols="auto">-->
                    <!--                                    <BLink href="#!" class="btn btn-sm btn-soft-info">-->
                    <!--                                        View All Apps-->
                    <!--                                        <i class="ri-arrow-right-s-line align-middle"></i>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                            </BRow>-->
                    <!--                        </div>-->

                    <!--                        <div class="p-2">-->
                    <!--                            <BRow class="g-0">-->
                    <!--                                <BCol>-->
                    <!--                                    <BLink class="dropdown-icon-item" href="#!">-->
                    <!--                                        <img src="/assets/app/images/brands/github.png" alt="Github"/>-->
                    <!--                                        <span>GitHub</span>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                                <BCol>-->
                    <!--                                    <BLink class="dropdown-icon-item" href="#!">-->
                    <!--                                        <img src="/assets/app/images/brands/bitbucket.png" alt="bitbucket"/>-->
                    <!--                                        <span>Bitbucket</span>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                                <BCol>-->
                    <!--                                    <BLink class="dropdown-icon-item" href="#!">-->
                    <!--                                        <img src="/assets/app/images/brands/dribbble.png" alt="dribbble"/>-->
                    <!--                                        <span>Dribbble</span>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                            </BRow>-->

                    <!--                            <BRow class="g-0">-->
                    <!--                                <BCol>-->
                    <!--                                    <BLink class="dropdown-icon-item" href="#!">-->
                    <!--                                        <img src="/assets/app/images/brands/dropbox.png" alt="dropbox"/>-->
                    <!--                                        <span>Dropbox</span>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                                <BCol>-->
                    <!--                                    <BLink class="dropdown-icon-item" href="#!">-->
                    <!--                                        <img src="/assets/app/images/brands/mail_chimp.png" alt="mail_chimp"/>-->
                    <!--                                        <span>Mail Chimp</span>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                                <BCol>-->
                    <!--                                    <BLink class="dropdown-icon-item" href="#!">-->
                    <!--                                        <img src="/assets/app/images/brands/slack.png" alt="slack"/>-->
                    <!--                                        <span>Slack</span>-->
                    <!--                                    </BLink>-->
                    <!--                                </BCol>-->
                    <!--                            </BRow>-->
                    <!--                        </div>-->
                    <!--                    </BDropdown>-->

                    <div class="ms-1 header-item d-none d-sm-flex">
                        <BButton type="button" variant="ghost-secondary" class="btn-icon btn-topbar rounded-circle"
                                 data-toggle="fullscreen" @click="initFullScreen">
                            <i class="bx bx-fullscreen fs-22"></i>
                        </BButton>
                    </div>

                    <div class="ms-1 header-item d-none d-sm-flex">
                        <BButton type="button" variant="ghost-secondary"
                                 class="btn-icon btn-topbar rounded-circle light-dark-mode"
                                 @click="toggleDarkMode">
                            <i class="bx bx-moon fs-22"></i>
                        </BButton>
                    </div>

                    <BDropdown variant="ghost-dark" dropstart class="ms-1 dropdown"
                               toggle-class="btn-icon btn-topbar rounded-circle arrow-none"
                               id="page-header-notifications-dropdown"
                               menu-class="dropdown-menu-lg dropdown-menu-end p-0" auto-close="outside">
                        <template #button-content>
                            <i class='bx bx-bell fs-22'></i>
                            <span
                                class="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger"><span
                                class="notification-badge">3</span><span class="visually-hidden">
                                unread messages
                            </span>
                          </span>
                        </template>

                        <div class="dropdown-head bg-primary bg-pattern rounded-top dropdown-menu-lg">
                            <div class="p-3">
                                <BRow class="align-items-center">
                                    <BCol>
                                        <h6 class="m-0 fs-16 fw-semibold text-white">
                                            Мэдэгдлүүд
                                        </h6>
                                    </BCol>
                                    <BCol cols="auto" class="dropdown-tabs">
                                        <BBadge variant="light-subtle" class="bg-light-subtle text-body fs-13"> 1 New
                                        </BBadge>
                                    </BCol>
                                </BRow>
                            </div>
                        </div>
                        <simplebar data-simplebar style="max-height: 300px" class="pe-2">
                            <div class="text-reset notification-item d-block dropdown-item position-relative">
                                <div class="d-flex">
                                    <img src="/assets/app/images/users/avatar-8.jpg"
                                         class="me-3 rounded-circle avatar-xs flex-shrink-0"
                                         alt="user-pic"/>
                                    <div class="flex-grow-1">
                                        <BLink href="#!" class="stretched-link">
                                            <h6 class="mt-0 mb-1 fs-13 fw-semibold">
                                                Maureen Gibson
                                            </h6>
                                        </BLink>
                                        <div class="fs-13 text-muted">
                                            <p class="mb-1">
                                                We talked about a project on linkedin.
                                            </p>
                                        </div>
                                        <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                              <span>
                                                  <i class="mdi mdi-clock-outline"></i> 4 hrs ago
                                              </span>
                                        </p>
                                    </div>
                                    <div class="px-2 fs-15">
                                        <input class="form-check-input" type="checkbox"/>
                                    </div>
                                </div>
                            </div>

                            <div class="my-3 text-center">
                                <BButton type="button" variant="soft-success">
                                    Бүх мэдэгдлийг харах
                                    <i class="ri-arrow-right-line align-middle"></i>
                                </BButton>
                            </div>
                        </simplebar>
                    </BDropdown>

                    <!--                    <BDropdown class="dropdown" variant="ghost-secondary" dropstart-->
                    <!--                               toggle-class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle arrow-none"-->
                    <!--                               menu-class="dropdown-menu-end">-->
                    <!--                        <template #button-content><img id="header-lang-img" src="/assets/app/images/flags/us.svg"-->
                    <!--                                                       alt="Header Language"-->
                    <!--                                                       height="20" class="rounded">-->
                    <!--                        </template>-->
                    <!--                        <BLink href="javascript:void(0);" class="dropdown-item notify-item language py-2"-->
                    <!--                               v-for="(entry, key) in languages" :data-lang="entry.language" :title="entry.title"-->
                    <!--                               @click="setLanguage(entry.language, entry.title, entry.flag)" :key="key">-->
                    <!--                            <img :src="entry.flag" alt="user-image" class="me-2 rounded" height="18">-->
                    <!--                            <span class="align-middle">{{ entry.title }}</span>-->
                    <!--                        </BLink>-->
                    <!--                    </BDropdown>-->

                    <BDropdown variant="link"
                               class="ms-sm-3 header-item topbar-user"
                               toggle-class="rounded-circle arrow-none"
                               menu-class="dropdown-menu-end">
                        <template #button-content>
                          <span class="d-flex align-items-center">
                            <img class="rounded-circle header-profile-user"
                                 src="/assets/app/images/users/avatar-teacher.png"
                                 alt="Header Avatar">
                            <span class="text-start ms-xl-2">
                              <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                                  {{ $user.first_name ? $user.first_name : $user.login }}
                                  {{ $user.org_id ? '/' : '' }} {{ $user.org_id ? $user.org_id : '' }}
                              </span>
                              <span class="d-none d-xl-block ms-1 fs-12 user-name-sub-text">Founder</span>
                            </span>
                          </span>
                        </template>

                        <h6 class="dropdown-header">
                            Тавтай морил {{ $user.first_name ? $user.first_name : $user.login }}
                            {{ $user.org_id ? '/' : '' }} {{ $user.org_id ? $user.org_id : '' }}!
                        </h6>

                        <router-link class="dropdown-item" to="/pages/profile"><i
                            class="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                            <span class="align-middle"> Хувийн мэдээлэл</span>
                        </router-link>
                        <router-link class="dropdown-item" to="/module/password">
                            <i class=" mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>
                            <span class="align-middle"> Нууц үг солих</span>
                        </router-link>
                        <router-link class="dropdown-item" to="/pages/faqs"><i
                            class="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i>
                            <span class="align-middle"> Тусламж</span>
                        </router-link>
                        <div class="dropdown-divider"></div>
                        <a href="javascript:void(0)" class="dropdown-item" @click="logoutModal = true"><i
                            class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                            <span class="align-middle" data-key="t-logout"> Системээс гарах</span>
                        </a>
                    </BDropdown>
                </div>

                <!--                <div class="crud-page-header-right">-->
                <!--                    <div class="tooloptions">-->
                <!--                        <slot name="tooloptions"></slot>-->
                <!--                    </div>-->

                <!--                                    <div class="crud-page-header-right-inside">-->
                <!--                                        &lt;!&ndash;        <Tooltip content="Устсан мэдээлэл харах">&ndash;&gt;-->
                <!--                                        &lt;!&ndash;            <Button ghost class="crud-tool" icon="eye-disabled" @click="refreshGrid"></Button>&ndash;&gt;-->
                <!--                                        &lt;!&ndash;        </Tooltip>&ndash;&gt;-->
                <!--                                        &lt;!&ndash;        &ndash;&gt;-->


                <!--                                                                        <Tooltip :content="lang.excelUpload" v-if="isExcelUpload">-->
                <!--                                                                            <a v-if="$props.excelUploadCustomUrl" :href="$props.excelUploadCustomUrl"-->
                <!--                                                                               class="btnLine">-->
                <!--                                                                                <i class="ti-layers"></i>-->
                <!--                                                                            </a>-->
                <!--                                                                            <a v-else @click="$props.excelUploadMethod" class="btnLine">-->
                <!--                                                                                <i class="ti-layers"></i>-->
                <!--                                                                            </a>-->
                <!--                                                                        </Tooltip>-->


                <!--                    </div>-->
                <!--                    <slot name="right"></slot>-->
                <!--                    <user-control />-->
                <!--                </div>-->
            </div>

            <Modal v-model="logoutModal" :closable="false" width="252" class="logout-modal">
                <p slot="header" style="display:none;"></p>
                <div style="text-align:center">
                    <a @click="logout()">
                        <Icon type="md-log-out"/>
                        <span>{{ common._logout }}</span>
                    </a>
                    <a @click="cancel()">
                        <Icon type="md-refresh"/>
                        <span>{{ common._cancel }}</span>
                    </a>
                </div>
                <div slot="footer" style="display:none;">
                    <form action="/auth/logout"></form>
                </div>
            </Modal>
        </div>
    </header>
</template>

<script>

export default {
    name: "krud-header",
    props: [
        'openForm',
        "title",
        "permissions",
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
        "isCreate",
        "exportLoading"
    ],
    components: {},
    data() {
        return {
            isMenuCondensed: false,
            searchModel: null,
            logoutModal: false,

            languages: [
                // {
                //     flag: require("/assets/app/images/flags/us.svg"),
                //     language: "en",
                //     title: "English",
                // },
                // {
                //     flag: require("/assets/app/images/flags/spain.svg"),
                //     language: "sp",
                //     title: "Española",
                // },
                // {
                //     flag: require("/assets/app/images/flags/germany.svg"),
                //     language: "gr",
                //     title: "Deutsche",
                // },
                // {
                //     flag: require("/assets/app/images/flags/italy.svg"),
                //     language: "it",
                //     title: "italiana",
                // },
                // {
                //     flag: require("/assets/app/images/flags/russia.svg"),
                //     language: "ru",
                //     title: "русский",
                // },
                // {
                //     flag: require("/assets/app/images/flags/china.svg"),
                //     language: "ch",
                //     title: "中國人",
                // },
                // {
                //     flag: require("/assets/app/images/flags/french.svg"),
                //     language: "fr",
                //     title: "Français",
                // },
                // {
                //     flag: require("/assets/app/images/flags/ae.svg"),
                //     language: "ar",
                //     title: "Arabic",
                // },
            ],
            // lan: i18n.locale,
            text: null,
            flag: null,
            value: null,
            myVar: 1,
        }
    },
    computed: {
        lang() {
            const labels = ['_add', 'Information_viewing_history', 'excelUpload', 're_call', '_save', '_print', 'download_file', 'logout'];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('crud.' + labels[i]);
                return obj;
            }, {});
        },

        common() {
            const labels = ['_logout', '_cancel'];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('user.' + labels[i]);
                return obj;
            }, {});
        }
    },

    mounted() {
        if (process.env.VUE_APP_I18N_LOCALE) {
            this.flag = process.env.VUE_APP_I18N_LOCALE;
            this.languages.forEach((item) => {
                if (item.language == this.flag) {
                    document.getElementById("header-lang-img").setAttribute("src", item.flag);
                }
            });
        }

        document.addEventListener("scroll", function () {
            var pageTopbar = document.getElementById("page-topbar");
            if (pageTopbar) {
                document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50 ? pageTopbar.classList.add(
                    "topbar-shadow") : pageTopbar.classList.remove("topbar-shadow");
            }
        });
        if (document.getElementById("topnav-hamburger-icon"))
            document
                .getElementById("topnav-hamburger-icon")
                .addEventListener("click", this.toggleHamburgerMenu);

        // this.isCustomDropdown();
    },

    methods: {
        searchGrid(e) {
            e.preventDefault();
            this.$props.search(this.searchModel);
        },

        logout() {
            axios.post("/auth/logout", {}).then(o => {
                window.location = "/auth/login";
            });
        },
        cancel() {
            this.$data.logoutModal = false;
        },

        isCustomDropdown() {
            //Search bar
            // var searchOptions = document.getElementById("search-close-options");
            // var dropdown = document.getElementById("search-dropdown");
            // var searchInput = document.getElementById("search-options");

            // searchInput.addEventListener("focus", () => {
            //     var inputLength = searchInput.value.length;
            //     if (inputLength > 0) {
            //         dropdown.classList.add("show");
            //         searchOptions.classList.remove("d-none");
            //     } else {
            //         dropdown.classList.remove("show");
            //         searchOptions.classList.add("d-none");
            //     }
            // });
            //
            // searchInput.addEventListener("keyup", () => {
            //     var inputLength = searchInput.value.length;
            //     if (inputLength > 0) {
            //         dropdown.classList.add("show");
            //         searchOptions.classList.remove("d-none");
            //     } else {
            //         dropdown.classList.remove("show");
            //         searchOptions.classList.add("d-none");
            //     }
            // });

            // searchOptions.addEventListener("click", () => {
            //     searchInput.value = "";
            //     dropdown.classList.remove("show");
            //     searchOptions.classList.add("d-none");
            // });
            //
            // document.body.addEventListener("click", (e) => {
            //     if (e.target.getAttribute("id") !== "search-options") {
            //         dropdown.classList.remove("show");
            //         searchOptions.classList.add("d-none");
            //     }
            // });
        },

        toggleHamburgerMenu() {
            var windowSize = document.documentElement.clientWidth;
            let layoutType = document.documentElement.getAttribute("data-layout");

            document.documentElement.setAttribute("data-sidebar-visibility", "show");
            let visiblilityType = document.documentElement.getAttribute("data-sidebar-visibility");

            if (windowSize > 767)
                document.querySelector(".hamburger-icon").classList.toggle("open");

            //For collapse horizontal menu
            if (
                document.documentElement.getAttribute("data-layout") === "horizontal"
            ) {
                document.body.classList.contains("menu") ?
                    document.body.classList.remove("menu") :
                    document.body.classList.add("menu");
            }

            //For collapse vertical menu

            if (visiblilityType === "show" && (layoutType === "vertical" || layoutType === "semibox")) {
                if (windowSize < 1025 && windowSize > 767) {
                    document.body.classList.remove("vertical-sidebar-enable");
                    document.documentElement.getAttribute("data-sidebar-size") == "sm" ?
                        document.documentElement.setAttribute("data-sidebar-size", "") :
                        document.documentElement.setAttribute("data-sidebar-size", "sm");
                } else if (windowSize > 1025) {
                    document.body.classList.remove("vertical-sidebar-enable");
                    document.documentElement.getAttribute("data-sidebar-size") == "lg" ?
                        document.documentElement.setAttribute("data-sidebar-size", "sm") :
                        document.documentElement.setAttribute("data-sidebar-size", "lg");
                } else if (windowSize <= 767) {
                    document.body.classList.add("vertical-sidebar-enable");
                    document.documentElement.setAttribute("data-sidebar-size", "lg");
                }
            }

            //Two column menu
            if (document.documentElement.getAttribute("data-layout") == "twocolumn") {
                document.body.classList.contains("twocolumn-panel") ?
                    document.body.classList.remove("twocolumn-panel") :
                    document.body.classList.add("twocolumn-panel");
            }
        },

        toggleMenu() {
            this.$parent.toggleMenu();
        },

        initFullScreen() {
            document.body.classList.toggle("fullscreen-enable");
            if (
                !document.fullscreenElement &&
                /* alternative standard method */
                !document.mozFullScreenElement &&
                !document.webkitFullscreenElement
            ) {
                // current working methods
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(
                        Element.ALLOW_KEYBOARD_INPUT
                    );
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        },

        setLanguage(locale, country, flag) {
            this.lan = locale;
            this.text = country;
            this.flag = flag;
            document.getElementById("header-lang-img").setAttribute("src", flag);
            i18n.global.locale = locale;
        },

        toggleDarkMode() {
            if (document.documentElement.getAttribute("data-bs-theme") == "dark") {
                document.documentElement.setAttribute("data-bs-theme", "light");
            } else {
                document.documentElement.setAttribute("data-bs-theme", "dark");
            }

            const mode = document.documentElement.getAttribute("data-bs-theme")
            this.changeMode({
                mode: mode,
            });
        },

        removeItem(cartItem) {
            this.cartItems = this.cartItems.filter(item => item.id !== cartItem.id)
            this.$emit("cart-item-price", this.cartItems.length);
        },
    }
}
</script>
