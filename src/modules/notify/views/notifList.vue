<template>
    <div>
        <div class="header-notification-info">
            <h3>{{ lang.notice }}</h3>
        </div>
        <ul v-if="notifications.length > 0" v-slimscroll="scrollOptions">
            <li v-for="(notif, index) in notifications">
                <a class="notif-item" href="javascript:void(0)">
                    <h4 class="notif-title">{{ notif.title }}</h4>
                    <div class="notif-content">
                        <span>{{ notif.first_name != null ? notif.first_name : notif.login }}</span>
                        <span><timeago :datetime="notif.created_at"></timeago></span>
                    </div>
                </a>
            </li>
        </ul>
        <div v-else class="no-notifs">
            {{ lang.no_notice }}
        </div>
    </div>
</template>

<script>
    import {loadLanguageAsync} from "../../../locale";

    export default {
        props: ['user'],
        created() {
            this.getUnseenNotification();
        },
        data() {
            return {
                notifications: [],
                count: 0
            }
        },
        computed: {
            lang() {
                const labels = ['notice','no_notice'];
                return labels.reduce((obj, key, i) => {
                    obj[key] = this.$t('notify.' + labels[i]);
                    return obj;
                }, {});
            },
        },
        methods: {
            getUnseenNotification() {
                axios.get('/lambda/notify/all/' + this.$props.user).then(o => {
                    this.count = o.data.count;
                    this.notifications = o.data.notifications;
                });
            },
            beforeMount() {
                if (this.selectedLang != "mn") {
                    loadLanguageAsync(this.selectedLang);
                }
            },
            switchLanguage(val) {
                this.selectedLang = val;
                loadLanguageAsync(val);
            },
        }
    }
</script>
