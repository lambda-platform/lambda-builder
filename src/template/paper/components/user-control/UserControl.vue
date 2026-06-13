<template>
    <div class="user-control">
        <ul>
            <li class="paper-notification">
                <notif-widget :user="$user.id"/>
            </li>

            <li class="avatar-item">
                <Poptip placement="bottom-end" popper-class="no-animation">
                    <a href="javascript:void(0)" class="avatar">
                        <img src="/assets/lambda/images/avatar.png" alt="avatar">
                        <div class="avatar-name">
                            <span>{{lang.welcome}} </span>
                            <b>{{ $user.first_name ? $user.first_name : $user.login }} {{ $user.org_id ? '/' : '' }} {{ $user.org_id ? $user.org_id : '' }}</b>
                        </div>
                    </a>
                    <div class="header-profile" slot="content">
                        <div class="header-profile-info">
                            <h3>{{ $user.login }} </h3>
                            <small>{{ $user.org_id ? $user.org_id : lang.loggedIn }}</small>
                        </div>
                        <ul>
                            <li>
                                <router-link to="/module/profile">
                                    <Icon type="ios-contact-outline"/>
                                    <span>{{lang.personalInfo}}</span>
                                </router-link>
                            </li>
                            <li>
                                <router-link to="/module/password">
                                    <Icon type="ios-key-outline"/>
                                    <span>{{lang.changePass}}</span>
                                </router-link>
                            </li>

                            <slot name="actions"></slot>

                            <li v-if="$user.role==1 || $user.role==29">
                                <a href="/lambda/puzzle" target="_blank">
                                    <Icon type="ios-settings-outline"/>
                                    <span>{{lang.superAdminManagement}}</span>
                                </a>
                            </li>
                            <li>
                                <a @click="logoutModal = true">
                                    <Icon type="ios-log-out"/>
                                    <span >{{lang.logout}}</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </Poptip>
            </li>
<!--            <li class="org-switcher">-->
<!--                <Poptip placement="bottom-end" popper-class="no-animation">-->
<!--                    <a href="javascript:void(0)" class="org-logo">-->
<!--                        <img src="/assets/lms/images/lms.jpeg" alt="avatar">-->
<!--                    </a>-->

<!--                    <div slot="content">-->
<!--                        <ul>-->
<!--                            &lt;!&ndash;                                <li v-for="item in lmsOrgs" :key="item.org_id">&ndash;&gt;-->
<!--                            <li>-->
<!--                                &lt;!&ndash;                                    <a class="org-switch-item" :class="org.id === item.org_id ? 'active': ''" :href="item.default_url">&ndash;&gt;-->
<!--                                <a class="org-switch-item">-->
<!--                                    <img src="/assets/lms/images/lms.jpeg" alt="lms-icon">-->
<!--                                    <div class="org-switch-item-info">-->
<!--                                        &lt;!&ndash;                                            <span>{{ item.org_name }}</span>&ndash;&gt;-->
<!--                                        <span>org_name</span>-->
<!--                                        &lt;!&ndash;                                            <small>{{ item.role_name }}</small>&ndash;&gt;-->
<!--                                        <small>name</small>-->
<!--                                    </div>-->
<!--                                </a>-->
<!--                            </li>-->
<!--                        </ul>-->
<!--                    </div>-->
<!--                </Poptip>-->
<!--            </li>-->
            <slot name="right">
            </slot>
        </ul>

        <Modal v-model="logoutModal" :closable="false" width="380" class="logout-modal">
            <p slot="header" style="display:none;"></p>
            <div class="logout-modal-body">
                <div class="logout-icon">
                    <Icon type="md-power"/>
                </div>
                <h3 class="logout-title">{{ lang.logout }} уу?</h3>
                <p class="logout-desc">Та одоо системээс гарах гэж байна.<br>Үргэлжлүүлэх үү?</p>
                <div class="logout-actions">
                    <button class="logout-btn cancel" @click="cancel()">{{ common._cancel }}</button>
                    <button class="logout-btn confirm" @click="logout()">
                        <Icon type="md-power"/>
                        {{ common._logout }}
                    </button>
                </div>
            </div>
            <div slot="footer" style="display:none;">
                <form action="/auth/logout"></form>
            </div>
        </Modal>
    </div>
</template>

<script>

import {mapGetters} from "vuex";

export default {
    name: "UserControl",
    computed: {
        ...mapGetters({
            // user: "user",
            org: "org",
            // lmsOrgs: "lmsOrgs",
        }),
        lang() {
            const labels = ['welcome', 'loggedIn', 'personalInfo', 'changePass', 'superAdminManagement', 'logout'];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('role.' + labels[i]);
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
    data() {
        return {
            logoutModal: false,
            poptipOption: {
                animation: 'none',
                modifiers: {
                    computeStyle: {
                        gpuAcceleration: false,
                    },
                    preventOverflow: {
                        boundariesElement: 'window'
                    }
                }
            },
            scrollOptions: {
                height: '100%',
                size: 7,
                alwaysVisible: true,
                wheelStep: 5,
                color: '#2C3A47'
            },

        };
    },
    created() {
        console.log(this);
        console.log('user');
        console.log(this.$user);
        console.log('org');
        console.log(this.org);
        console.log(this.$org);

    },
    methods: {
        logout() {
            axios.post("/auth/logout", {}).then(o => {
                window.location = "/auth/login";
            });
        },
        cancel() {
            this.$data.logoutModal = false;
        },
    }
}
</script>

<style lang="scss">
@import "./UserControl";
</style>
