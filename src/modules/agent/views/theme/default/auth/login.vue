<template>
    <div class="form-wrap">
        <div class="form-content">
            <h2>{{ lang.loginTitle }}</h2>
            <a-form
                class="mx-auto"
                :model="credentials"
                layout="vertical"
                autocomplete="off">
                <div class="space-y-6">
                    <div class="loginInput">
                        <a-form-item name="login" :rules="[{ required: true, message: 'Нэвтрэх нэрээ оруулна уу!' }]">
                            <div class="pb-2 text-slate-700">Хэрэглэгчийн нэр</div>
                            <a-input type="text" :placeholder="lang.username" v-model:value="credentials.login">
                                <template #prefix>
                                    <font-awesome-icon icon="fa-solid fa-user" />
                                </template>
                            </a-input>
                        </a-form-item>
                        <a-form-item name="password" :rules="[{ required: true, message: 'Нууц үгээ оруулна уу!' }]">
                            <div class="pb-2 text-slate-700">Нууц үг</div>
                            <a-input-password :placeholder="lang.password" v-model:value="credentials.password">
                                <template #prefix>
                                    <font-awesome-icon icon="fa-solid fa-lock" />
                                </template>
                            </a-input-password>
                        </a-form-item>

                        <div class="flex flex-row justify-between space-x-4">
                            <a-checkbox v-model:checked="checkbox"><span class=" text-slate-700">Намайг сануулах</span></a-checkbox>
                            <router-link to="/auth/forgot"><span class="">{{ lang.forgot }}</span></router-link>
                        </div>
                    </div>
                    <div class="">
                        <a-button type="primary" class="w-full" :loading="loading" style="border-radius: 8px; height: 38px" @click="onSubmit" html-type="submit">{{ lang.login }}</a-button>
                        <p>
                            <router-link class="forgot" to="/auth/forgot">{{ lang.forgot }}</router-link>
                        </p>

                    </div>

                    <div id="msg">
                        <span v-if="isSuccess" class="success">{{ lang.loginSuccess }}</span>
                        <span v-if="isError" class="error">{{ lang.loginError }}</span>
                    </div>


                </div>
            </a-form>
        </div>

        <slot name="copyright"></slot>
    </div>
</template>

<script>
export default {
    props: ['selectedLang'],
    name: "login",
    data() {
        return {
            loading: false,
            isSuccess: false,
            isError: false,
            credentials: {
                login: null,
                password: null
            },
        }
    },
    computed: {
        lang() {
            const labels = ['loginTitle', 'username', 'password', 'remember', 'login', 'forgot', 'loginSuccess', 'loginError'];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('user.' + labels[i]);
                return obj;
            }, {});
        }
    },
    methods: {
        onSubmit() {
            this.isSuccess = false;
            this.isError = false;
            if (!this.loading) {
                this.loading = true;
                axios.post('/auth/login', this.credentials).then(({data}) => {
                    console.log('auth', data);

                    setTimeout(() => {
                        this.loading = false;
                        if (data.status) {
                            console.log('here');
                            this.isSuccess = true;
                            setTimeout(() => {
                                window.location = data.path;
                            }, 600)
                        } else {
                            this.isError = true;
                        }
                    }, 1000);
                }).catch(e => {
                    setTimeout(() => {
                        this.loading = false;
                        this.isError = true;
                    }, 1000);
                })
            }
        },

    }
}
</script>
