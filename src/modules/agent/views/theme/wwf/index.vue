<template>
    <div class="login">
        <div class="content">
            <div class="content-layer"></div>
            <!--            <div class="title">-->
            <!--                <h2 style="max-width: 600px;">E-LICENSE</h2>-->
            <!--                <p>Тусгай зөвшөөрлийн цахим систем</p>-->
            <!--            </div>-->

            <div class="header">
                <div class="logo">
                    <img src="/assets/app/images/logo.png" alt="logo" style="height: 55px"/>
                    <div class="logo-txt">
                        <span>Зэрлэг амьтан,</span>
                        <span>ургамлын мониторинг</span>
                    </div>
                </div>

                <ul class="menu">
                    <li>
                        <a href="javascript:void(0)" @click="showInstructModal">
                            {{ lang.instructionsUse }}
                        </a>
                    </li>

                    <li>
                        <a href="/contact" target="_blank">
                            {{ lang.toContaqt }}
                        </a>
                    </li>
                </ul>
            </div>
            <div class="content-body">
                <div class="lottie">
                    <lottie-animation path="assets/app/images/bg.json"/>
                </div>
            </div>

            <div class="footer">
                <h3>Бусад системүүд</h3>
                <hooper :settings="hooperSettings">
                    <slide>
                        <div class="footer-item">
                            <a href="https://eic.mn/database1.php" target="_blank">
                                <inline-svg src="/assets/icons/duotone/General/Bank.svg"/>
                                <span>Газар, түүний хөрс</span>
                            </a>
                        </div>
                    </slide>
                    <slide>
                        <div class="footer-item">
                            <a href="https://eic.mn/database2.php" target="_blank">
                                <inline-svg src="/assets/icons/duotone/Interface/Doughnut.svg"/>
                                <span>Газрын хэвлий, ашигт малтмал</span>
                            </a>
                        </div>
                    </slide>
                    <slide>
                        <div class="footer-item">
                            <a href="https://eic.mn/water/" target="_blank">
                                <inline-svg src="/assets/icons/duotone/Navigation/Route.svg"/>
                                <span>Ус, рашаан</span>
                            </a>
                        </div>
                    </slide>
                    <slide>
                        <div class="footer-item">
                            <a href="https://eic.mn/database4.php" target="_blank">
                                <inline-svg src="/assets/icons/duotone/Electric/Air-conditioning.svg"/>
                                <span>Ой</span>
                            </a>
                        </div>
                    </slide>
                    <slide>
                        <div class="footer-item">
                            <a href="https://eic.mn/flora/" target="_blank">
                                <inline-svg src="/assets/icons/duotone/Electric/Air-conditioning.svg"/>
                                <span>Байгалийн ургамал</span>
                            </a>
                        </div>
                    </slide>

                    <slide>
                        <div class="footer-item">
                            <a href="https://eic.mn/fauna/" target="_blank">
                                <inline-svg src="/assets/icons/duotone/Electric/Air-conditioning.svg"/>
                                <span>Амьтан</span>
                            </a>
                        </div>
                    </slide>

                    <hooper-pagination slot="hooper-addons"></hooper-pagination>
                    <hooper-progress slot="hooper-addons"></hooper-progress>
                </hooper>
            </div>
        </div>

        <div class="auth">
            <div class="form-wrap">
                <router-view></router-view>
                <div class="copyright" v-html="copyright"></div>
            </div>
        </div>

        <v-modal
            name="faq-modal"
            :pivot-y="0.5"
            :adaptive="true"
            :reset="true"
            :draggable="false"
            height="90%"
            width="70%">
            <div class="d-modal">
                <div class="modal-header">
                    <h2 class="title">{{ lang.frequentlyAskedQuestions }}</h2>
                    <a
                        href="javascript:void(0)"
                        @click="$modal.hide('faq-modal')"
                        class="close"
                    >
                        <Icon type="ios-close"/>
                    </a>
                </div>
                <div class="modal-body np">
                    <Spin v-if="isLoading" fix></Spin>
                    <Collapse simple style="text-align: left;">
                        <Panel v-for="item in faqs" :key="item.index" :name="item.index">
                            {{ item.title }}
                            <p slot="content">
                                <span v-html="item.content"></span>
                            </p>
                        </Panel>
                    </Collapse>
                </div>
            </div>
        </v-modal>

        <v-modal
            name="instruct-modal"
            :pivot-y="0.5"
            :adaptive="true"
            :reset="true"
            :draggable="false"
            height="90%"
            width="70%"
        >
            <div class="d-modal">
                <div class="modal-header">
                    <h2 class="title">{{ lang.instructionsUse }}</h2>
                    <a
                        href="javascript:void(0)"
                        @click="$modal.hide('instruct-modal')"
                        class="close"
                    >
                        <Icon type="ios-close"/>
                    </a>
                </div>
                <div class="modal-body np">
                    <p v-if="help" v-html="help.body"></p>
                </div>
            </div>
        </v-modal>
    </div>
</template>

<script>
import Vue from "vue";
import iView from "iview";
import lang from "iview/dist/locale/en-US";
import vModal from "vue-js-modal";
import LottieAnimation from "lottie-vuejs/src/LottieAnimation.vue";
import InlineSvg from 'vue-inline-svg';
import {
    Hooper, Slide, Pagination as HooperPagination,
    Navigation as HooperNavigation
} from 'hooper';

Vue.use(iView);
iView.locale(lang);
Vue.use(vModal, {componentName: "v-modal"});


export default {

    computed: {
        lang() {
            const labels = ['instructionsUse', 'frequentlyAskedQuestions', 'downloadAppHere', 'toContaqt', 'title', 'subtitle',];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('user.' + labels[i]);
                return obj;
            }, {});
        },
    },

    components: {
        LottieAnimation,
        Hooper,
        Slide,
        HooperPagination,
        HooperNavigation,
        InlineSvg
    },

    data() {
        return {
            isLoading: false,
            loading: false,
            isSuccess: false,
            isError: false,
            credentials: {
                login: null,
                password: null,
            },
            copyright: window.lambda.copyright,
            windowsd: window.lambda.windowslink,
            androidd: window.lambda.androidlink,

            lambda: window.lambda,
            faqs: [],
            help: null,
            hooperSettings: {
                itemsToShow: 6,
                breakpoints: {
                    800: {
                        centerMode: false,
                        itemsToShow: 2
                    },
                    1000: {
                        itemsToShow: 3,
                        pagination: 'fraction'
                    },
                    1300: {
                        itemsToShow: 5,
                        pagination: 'fraction'
                    },
                    1600: {
                        itemsToShow: 6,
                        pagination: 'fraction'
                    }
                }
            }
        };
    },

    mounted() {
        // setTimeout(() => {
        //     var options = {
        //         facebook: "416936338507897", // Facebook page ID
        //         call_to_action: "Бидэнтэй холбогдох", // Call to action
        //         position: "right", // Position may be 'right' or 'left'
        //     };
        //     var proto = document.location.protocol,
        //         host = "getbutton.io",
        //         url = proto + "//static." + host;
        //     var s = document.createElement("script");
        //     s.type = "text/javascript";
        //     s.async = true;
        //     s.src = url + "/widget-send-button/js/init.js";
        //     s.onload = function () {
        //         WhWidgetSendButton.init(host, proto, options);
        //     };
        //     var x = document.getElementsByTagName("script")[0];
        //     x.parentNode.insertBefore(s, x);
        // }, 1000);
    },
    created() {
        this.getFaqs();
    },
    methods: {
        getFaqs() {
            this.isLoading = true;
            axios.get("/api/loginContent").then(({data}) => {
                this.faqs = data.faq;
                this.help = data.help;
                setTimeout(() => {
                    this.isLoading = false;
                }, 1000);
            });
        },

        showFaqModal(row) {
            this.isLoading = false;
            if (this.faqs.length == 0) {
                this.getFaqs();
            }
            this.$modal.show("faq-modal");
        },

        showInstructModal(row) {
            if (this.faqs.length == 0) {
                this.getFaqs();
            }
            this.$modal.show("instruct-modal");
        },

        showDetail(item) {
            this.currentNews = item;
            this.isList = false;
        },

        goBack() {
            this.isList = true;
        },
    },
};
</script>

<style lang="scss">
@import "../../../scss/theme/wwf/style";
</style>
