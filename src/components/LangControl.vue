<template>
    <a v-if="hasLanguage" @click="$modal.show('lang-modal')" class="lang-control">
        <img :src="`/images/flags/${selectedLang}.png`" id="langSwitcherFlag" alt="flag">
    </a>
</template>

<script>
export default {
    name: "LangControl",
    data() {
        return {
            hasLanguage: window.lambda.has_language,
            selectedLang: (localStorage.getItem("lang") == null || localStorage.getItem("lang") == undefined) ? window.lambda.default_language : localStorage.getItem("lang")
        }
    }
}
</script>

<style scoped>

</style>
