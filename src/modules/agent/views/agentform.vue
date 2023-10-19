<template>
    <section class="canvas-aside">
        <div class="crud-page">
            <div class="crud-page-body" style="padding: 10px 10px 10px 10px !important">
                <div class="dg-flex">
                    <paper-header class="mini" style="box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px !important;
    border-radius: 10px !important; margin-bottom: 20px !important;" v-if="!withoutHeader">
                        <div slot="right">
                            <slot name="user-control"></slot>
                        </div>

                        <div slot="nav">
                            <ul>
                                <li v-if="type == 'profile'">
                                    <router-link to="">
                                        <i class="tu-user"></i>
                                        <span>{{ lang.personalInformation }}</span>
                                    </router-link>
                                </li>
                                <li v-if="type == 'password'">
                                    <router-link to="">
                                        <span>{{ lang.changePassword }}</span>
                                    </router-link>
                                </li>
                            </ul>
                        </div>
                        <div slot="tool">
                        </div>
                    </paper-header>
                    <section class="page-agent-form" style="height: calc(100vh - 100px) !important;
            width: 100%!important;
    border-radius: 10px !important; padding:0!important;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px !important;
    overflow: hidden;">
                        <dataform v-if="type == 'profile'" :url="baseUrl ? baseUrl : ''" ref="agentForm"
                                  style="max-width: 100%; width: 100%!important; display: block!important; padding: 20px;"
                                  schemaID="user_profile" :editMode="editMode" :do_render="editMode" :onReady="editUser"
                                  :onSuccess="onSuccess"/>
                        <dataform v-if="type == 'password'" :url="baseUrl ? baseUrl : ''" ref="agentForm"
                                  style="max-width: 100%; width: 100%!important; display: block!important; padding: 20px;"
                                  schemaID="user_password" :editMode="editMode" :do_render="editMode" a
                                  :onReady="editUser"
                                  :onSuccess="onSuccess"/>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import pagination from "./pagination";

export default {
    props: ['type', 'withoutHeader', 'baseUrl'],
    components: {
        'dv-pagination': pagination
    },
    computed: {
        lang() {
            const labels = ['db', 'changePassword', 'personalInformation'
            ];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('user.' + labels[i]);
                return obj;
            }, {});
        },
    },
    data() {
        return {
            editMode: true,
        }
    },


    methods: {
        onSuccess(data) {
        },
        editUser() {
            this.$nextTick(() => {
                this.$refs.agentForm.editModel(this.$user.id);
            });

        },

        showDefaultAvatar(e) {
            e.target.src = "/assets/lambda/images/avatar.png";
        },

    }
}
</script>
