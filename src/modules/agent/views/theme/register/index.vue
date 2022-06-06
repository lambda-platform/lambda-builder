<template>
    <div class="login register-theme" >
        <div class="content">
            <div class="title">
                <h2 style="max-width: 700px;">{{ lambda.subTitle }}</h2>
                <p>{{ lambda.copyright }}</p>
            </div>
        </div>
        <div class="auth">
            <div class="img"></div>
            <div class="form-wrap">
                <router-view :selectedLang="selectedLang"></router-view>
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
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('user.' + labels[i]);
                return obj;
            }, {});
        }
    },

}
</script>

<style lang="scss">
@import "../../../scss/theme/register/style";
</style>

