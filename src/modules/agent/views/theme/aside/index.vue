<template>
    <div class="login aside-theme" :style="{ backgroundImage: 'url(' + lambda.bg + ')' }">
        <div class="content">
            <div class="content-layer"></div>
            <div class="title">
                <h2 style="max-width: 600px;">{{ lang.title }}</h2>
                <p>{{ lang.subtitle }}</p>
            </div>
        </div>
        <div class="auth">
            <div class="lang-switcher" v-if="lambda.has_language && languages.length >= 2">
                <a v-for="item in languages" :key="item.index"
                   :class="selectedLang == item.code ? 'active' : ''" href="javascript:void(0)"
                   @click="switchLanguage(item.code)">
                    {{ item.label }}
                </a>
            </div>
            <div class="form-wrap">
                <router-view :selectedLang="selectedLang"></router-view>
                <div class="copyright" style="width:70%; text-align:center;" v-html="copyright"></div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    data() {
        return {
            loading: false,
            isSuccess: false,
            isError: false,
            credentials: {
                login: null,
                password: null
            },
            selectedLang: localStorage.getItem("lang") == null ? window.lambda.default_language : localStorage.getItem("lang"),
            languages: window.lambda.languages,
            copyright: window.lambda.copyright,
            lambda: window.lambda,
            styleObj: {
                backgroundImage: window.lambda.bg + ' !important'
            },
            // utgaawax: {},
        }
    },

    computed: {
        lang() {
            const labels = ['title', 'subtitle'];
            // const labels1 = ['forgot', 'backToLogin', 'forgotDescription', 'email', 'forgotDescription2', 'sendPasswordResetCode', 'emailSendError'];
            // this.utgaawax = labels1.reduce((obj, key, i) => {
            //     obj[key] = this.$t('user.' + labels1[i]);
            //     return obj;
            // }, {});
            //
            // console.log("this.data().utgaawax >>> ");
            // console.log(this.utgaawax);
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('user.' + labels[i]);
                return obj;
            }, {});
        }
    },

}
</script>

<style lang="scss">
@import "../../../scss/theme/aside/style";
</style>

