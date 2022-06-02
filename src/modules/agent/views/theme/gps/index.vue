<template>
    <div class="login">
        <div class="content" :style="{ backgroundImage: 'url(' + lambda.bg + ')' }">
            <div class="title">
                <h2>{{ lang.title }}</h2>
                <p>{{ lang.subtitle }}</p>
            </div>
        </div>
        <div class="auth">
            <div class="form-wrap">
                <router-view :selectedLang="selectedLang"></router-view>
                <div class="mobile-app" v-if="lambda.has_mobile_apps">
                    <div class="mobile-app-title">{{lang.downloadMobileApp}}</div>
                    <div class="mobile-app-link">
                        <a :href="lambda.has_mobile_android_link" target="_blank">
                            <img :src="lambda.has_mobile_android_img" alt="">
                        </a>
                        <a :href="lambda.has_mobile_ios_link" target="_blank">
                            <img :src="lambda.has_mobile_ios_img" alt="">
                        </a>
                    </div>
                </div>
                <div class="lang-switcher" v-if="lambda.has_language">
                    <a v-for="item in languages" :key="item.index"
                       :class="selectedLang == item.code ? 'active' : ''" href="javascript:void(0)"
                       @click="switchLanguage(item.code)">
                        {{ item.label }}
                    </a>
                </div>
                <div class="copyright" v-html="copyright"></div>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "gps",
        data() {
            return {
                loading: false,
                isSuccess: false,
                isError: false,
                credentials: {
                    login: null,
                    password: null
                },
                selectedLang: localStorage.getItem("lang") == null ? 'mn' : localStorage.getItem("lang"),
                languages:window.lambda.languages,
                copyright:window.lambda.copyright,
                lambda:window.lambda,
                styleObj: {
                    backgroundImage: window.lambda.bg + ' !important'
                }
            }
        },

        computed: {
            lang() {
                const labels = ['title', 'subtitle', ];
                return labels.reduce((obj, key, i) => {
                    obj[key] = this.$t('user.' + labels[i]);
                    return obj;
                }, {});
            },
        },
        methods: {


        }
    }
</script>

<style lang="scss">
    @import "../../../scss/theme/gps/style";
</style>

