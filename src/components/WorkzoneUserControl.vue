<template>
<!--            <template slot="actions">-->
<!--                <li>-->
<!--                    <a href="javascript:void(0)" @click="$modal.show('lang-modal')">-->
<!--                        <Icon type="ios-globe-outline"/>-->
<!--                        {{ $t('nav.select_language') }}-->
<!--                    </a>-->
<!--                </li>-->
<!--            </template>-->

<!--                <li class="org-switcher" v-if="lmsOrgs.length > 0">-->
        <li class="org-switcher">
            <Poptip placement="bottom-end" popper-class="no-animation">
                <a href="javascript:void(0)" class="org-logo">
                    <img src="/assets/lms/images/lms.jpeg" alt="avatar">
                </a>

                <div slot="content">
                    <ul>
<!--                                <li v-for="item in lmsOrgs" :key="item.org_id">-->
                        <li>
<!--                                    <a class="org-switch-item" :class="org.id === item.org_id ? 'active': ''" :href="item.default_url">-->
                            <a class="org-switch-item">
                                <img src="/assets/lms/images/lms.jpeg" alt="lms-icon">
                                <div class="org-switch-item-info">
<!--                                            <span>{{ item.org_name }}</span>-->
                                    <span>org_name</span>
<!--                                            <small>{{ item.role_name }}</small>-->
                                    <small>name</small>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </Poptip>
        </li>

<!--        <paper-modal name="lang-modal" class="uni-modal" width="300px" height="350px">-->
<!--            <div class="lang-modal">-->
<!--                <a class="modal-close" href="javascript:void(0)" @click="$modal.hide('lang-modal')">-->
<!--                    <i class="ti-close"></i>-->
<!--                </a>-->

<!--                <h3>{{ $t('nav.select_language') }}</h3>-->
<!--                <div class="lang-choices">-->
<!--                    <a v-for="item in languages" :key="item.index"-->
<!--                       :class="selectedLang == item.code ? 'active' : ''" href="javascript:void(0)"-->
<!--                       @click="switchLanguage(item.code)">-->
<!--                        <img :src="`/images/flags/${item.code}.png`" alt="flag">-->
<!--                        <span>{{ item.label }}</span>-->
<!--                    </a>-->
<!--                </div>-->
<!--            </div>-->
<!--        </paper-modal>-->
</template>

<script>
// import {loadLanguageAsync} from "../locale";

export default {
    name: "WorkzoneUserControl",
    data() {
        return {
            // selectedLang: (localStorage.getItem("lang") == null || localStorage.getItem("lang") == undefined) ? window.lambda.default_language : localStorage.getItem("lang"),
            // langModal: false,
            // languages: window.lambda.languages,
            // org: window.init.org,
            // lmsOrgs: window.init.orgs,
            // erpOrgs: [],
            // user:window.init.user,
        };
    },

    // beforeMount() {
    //     if (this.selectedLang === "mn_MN" || this.selectedLang === "en_US" || this.selectedLang === 'ru_RU' || this.selectedLang === 'kz_KZ') {
    //         loadLanguageAsync(this.selectedLang);
    //     } else {
    //         loadLanguageAsync("mn_MN");
    //     }
    // },

    methods: {
        switchLanguage(val) {
            // this.selectedLang = val;
            // loadLanguageAsync(val);
        },
    }
}
</script>

<style scoped>

</style>
