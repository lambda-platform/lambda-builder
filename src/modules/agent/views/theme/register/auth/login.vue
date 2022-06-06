<template>
    <div style="width: 100%" class="form-content">
        <div class="title">
            <h2 style="max-width: 700px;">{{ lambda.subTitle }}</h2>
        </div>
        <Tabs value="name1" v-model="tab">
            <TabPane label="Нэвтрэх" name="login">
                <form v-on:submit.prevent="onSubmit" id="#" method="post" class="login-form" ref="login"
                      v-if="tab == 'login'">
                    <div class="form-element input">
                        <input type="text" v-model="credentials.login" :disabled="loading"
                               :placeholder="lang.username">
                        <span class="icon user"></span>
                    </div>
                    <div class="form-element input">
                        <input type="password" v-model="credentials.password" :disabled="loading"
                               :placeholder="lang.password">
                        <span class="icon pass"></span>
                    </div>
                    <div class="form-element">
                        <input type="checkbox" class="checkbox" id="remember_me">
                        <label for="remember_me">{{ lang.remember }}</label>
                    </div>
                    <div class="form-element action">
                        <button id="submit" class="button" :disabled="loading">
                            <span id="submitTxt">{{ lang.login }}</span>
                            <span class="loader">
                                <div class="sk-fading-circle" v-if="loading">
                                    <div class="sk-circle1 sk-circle"></div>
                                    <div class="sk-circle2 sk-circle"></div>
                                    <div class="sk-circle3 sk-circle"></div>
                                    <div class="sk-circle4 sk-circle"></div>
                                    <div class="sk-circle5 sk-circle"></div>
                                    <div class="sk-circle6 sk-circle"></div>
                                    <div class="sk-circle7 sk-circle"></div>
                                    <div class="sk-circle8 sk-circle"></div>
                                    <div class="sk-circle9 sk-circle"></div>
                                    <div class="sk-circle10 sk-circle"></div>
                                    <div class="sk-circle11 sk-circle"></div>
                                    <div class="sk-circle12 sk-circle"></div>
                                </div>
                            </span>
                        </button>
                        <p>
                            <router-link class="forgot" to="/forgot">{{ lang.forgot }}</router-link>
                        </p>
                    </div>
                </form>

                <!--                <div>-->
                <!--                    <span class="if">Эсвэл</span>-->
                <!--                </div>-->

                <!--                <Button class="loginButtom" type="">-->
                <!--                    <img src="/assets/lambda/images/dan.svg">-->
                <!--                    <span class="logText">ДАН систем-ээр нэвтрэх</span>-->
                <!--                </Button>-->
                <!--                <Button class="loginButtom" type="">-->
                <!--                    <img src="/assets/lambda/images/google.svg">-->
                <!--                    <span class="logText">Google-ээр нэвтрэх</span>-->
                <!--                </Button>-->
                <!--                <Button class="loginButtom" type="primary">-->
                <!--                    <img src="/assets/lambda/images/fb.svg">-->
                <!--                    <span class="logText">Facebook-ээр нэвтрэх</span>-->
                <!--                </Button>-->
            </TabPane>
            <TabPane label="Бүртгүүлэх" name="register">
                <Tabs id="rightToRegister" value="name" v-model="tabs" v-if="tab == 'register'">
                    <TabPane icon="md-person" label="Хувь хүн" name="individual">
                        <div v-if="tabs == 'individual'">
                            <div>
                                <dataform :public="true" schemaID="858" :onSuccess="onSuccess" :onError="onError"/>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane icon="ios-briefcase" label="Байгууллага" name="organization">
                        <div v-if="tabs == 'organization'">
                            <div>
                                <dataform :public="true" schemaID="920" :onSuccess="onSuccess" :do_render="true" :onError="onError"/>
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </TabPane>
        </Tabs>
        <div id="msg">
            <span v-if="isSuccess" class="success">{{ lang.loginSuccess }}</span>
            <span v-if="isError" class="error">{{ lang.loginError }}</span>
        </div>
        <div class="registerHelp">
            <a class="zaavar"
               href="/zaavar.html"
               target="BurtguulehZaavar">
                <Icon size="20" type="ios-alert" />
                <span>Бүртгүүлэх заавар</span>
            </a>
        </div>
    </div>
</template>

<script>

const Dataform = () => import(/* webpackChunkName: "Dataform-el" */'../../../../../dataform/Dataform.vue')

export default {
    props: ['selectedLang'],
    name: "aside-login",
    components: {
        "dataform": Dataform,
    },
    data() {
        return {
            tab: 'login',
            tabs: 'individual',
            loading: false,
            isSuccess: false,
            isError: false,
            credentials: {
                login: null,
                password: null
            },
            lambda: window.lambda,
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
    mounted() {
        window.init = {
            showID: undefined,
            data_form_custom_elements: [{"element": "registrationNumberCreator"}]
        }
    },
    methods: {
        onError() {
            this.$Notice.error({
                title: "Алдаа гарлаа",
                desc: "Алдаа гарлаа"
            });
        },
        onSuccess() {
            this.tab = 'login';
            this.$Notice.success({
                title: "Амжилттай",
                desc: "Амжилттай"
            });
        },
        onSubmit() {
            this.isSuccess = false;
            this.isError = false;
            if (!this.loading) {
                this.loading = true;
                axios.post('/auth/login', this.credentials).then(({data}) => {
                    setTimeout(() => {
                        this.loading = false;
                        if (data.status) {
                            this.isSuccess = true;

                            // document.cookie="token="+data.token;

                            console.log(data.token)
                            localStorage.setItem('user_token', data.token);

                            setTimeout(() => {
                                window.location = "/";
                            }, 600);


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
