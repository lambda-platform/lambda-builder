import Vue from "vue";
import VueI18n from 'vue-i18n'
import mn_MN from "./mn_MN";
import en_US from "./en_US";
import ko_KR from "./ko_KR";
import kz_KZ from "./kz_KZ";
import ru_RU from "./ru_RU";

const messages = {
    mn_MN,
    en_US,
    ko_KR,
    kz_KZ,
    ru_RU
}
Vue.use(VueI18n)

export const i18n = new VueI18n({
    locale: 'mn_MN',
    fallbackLocale: 'mn_MN',
    messages
})

const loadedLanguages = ['mn_MN', 'en_US', 'ko_KR', 'kz_KZ', 'ru_RU'];

export const setI18nLanguage = (lang) => {
    i18n.locale = lang

    return lang
}

export const loadLanguageAsync = (lang) => {
    localStorage.setItem("lang", lang);

    // If the same language
    if (i18n.locale === lang) {
        return Promise.resolve(setI18nLanguage(lang))
    }

    // If the language was already loaded
    if (loadedLanguages.includes(lang)) {
        return Promise.resolve(setI18nLanguage(lang))
    }

    if (window.lambda && window.lambda.static_words && window.lambda.static_words[lang]) {
        i18n.setLocaleMessage(lang, {auth: window.lambda.static_words[lang]});
        loadedLanguages.push(lang)
        return setI18nLanguage(lang)
    } else {
        return import(/* webpackChunkName: "[request]" */ `./${lang}`).then(
            messages => {
                i18n.setLocaleMessage(lang, messages.default)
                loadedLanguages.push(lang)
                return setI18nLanguage(lang)
            }
        )
    }


}
