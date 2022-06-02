<template>
  <div class="login">
    <div class="content">
      <div class="slider">
        <Carousel v-model="currentSlide" arrow="none">
          <CarouselItem v-for="item in slides" :key="item.index">
            <div
              class="bg-cover"
              :style="{
                backgroundImage:
                  'url(https://school-alert.mn/' + item.image + ')',
              }"
            ></div>
          </CarouselItem>
        </Carousel>
      </div>

      <div class="header">
        <div class="logo">
          <img src="/assets/school/images/sa_logo.png" alt="logo" />
        </div>

        <ul class="menu">
          <li>
            <a href="javascript:void(0)" @click="showFaqModal"
              >Түгээмэл асуулт</a
            >
          </li>

          <li>
            <a href="javascript:void(0)" @click="showInstructModal">
              Ашиглах заавар
            </a>
          </li>

          <li>
            <a href="javascript:void(0)" @click="showNewsModal">
              Мэдээ
            </a>
          </li>

          <li>
            <a href="javascript:void(0)" @click="showContactModal">
              Холбоо барих
            </a>
          </li>
        </ul>
      </div>

      <div class="footer">
        <h3>Гар утасны аппликейшнээ татаарай</h3>
        <div class="box-row app">
          <a
            href="https://play.google.com/store/apps/details?id=com.dowell.iot"
            target="_blank"
          >
            <img src="/assets/school/images/playstore.png" alt="" /> Play
            store
          </a>

          <a
            href="https://apps.apple.com/us/app/school-alert-mn/id1491590538"
            target="_blank"
          >
            <img src="/assets/school/images/appstore.png" alt="" /> Apple
            store
          </a>
        </div>
      </div>
    </div>

    <div class="auth">
      <div class="form-wrap">
        <router-view :selectedLang="selectedLang"></router-view>
        <div class="copyright">
          {{ copyright }}
        </div>
      </div>
    </div>

    <v-modal
      name="faq-modal"
      :pivot-y="0.5"
      :adaptive="true"
      :reset="true"
      :draggable="false"
      height="90%"
      width="70%"
    >
      <div class="d-modal">
        <div class="modal-header">
          <h2 class="title">Түгээмэл асуултууд</h2>
          <a
            href="javascript:void(0)"
            @click="$modal.hide('faq-modal')"
            class="close"
          >
            <Icon type="ios-close" />
          </a>
        </div>
        <div class="modal-body np">
          <Spin v-if="isLoading" fix></Spin>
          <Collapse simple>
            <Panel v-for="item in faqs" :key="item.index" :name="item.index">
              {{ item.title }}
              <p slot="content">
                <span v-html="item.content"></span>
              </p>
            </Panel>
          </Collapse>
        </div>
      </div>
    </v-modal>

    <v-modal
      name="news-modal"
      :pivot-y="0.5"
      :adaptive="true"
      :reset="true"
      :draggable="false"
      height="90%"
      width="70%"
    >
      <div class="d-modal">
        <div class="modal-header">
          <h2 class="title">Мэдээ мэдээлэл</h2>
          <a
            href="javascript:void(0)"
            @click="$modal.hide('news-modal')"
            class="close"
          >
            <Icon type="ios-close" />
          </a>
        </div>
        <div class="modal-body">
          <Spin v-if="isLoading" fix></Spin>
          <ul class="news-list" v-if="isList">
            <li v-for="item in news" :key="item.index">
              <img :src="item.thumb" alt="thumb" />
              <div class="info">
                <h3>{{ item.title }}</h3>
                <div class="info-sub">
                  <Icon type="ios-clock-outline" />
                  <span class="dt">{{ item.pubDate.substr(0, 10) }}</span>
                </div>

                <a href="javascript:void(0)" @click="showDetail(item)"
                  >Дэлгэрэнгүй</a
                >
              </div>
            </li>
          </ul>

          <div v-else class="news-detail">
            <div v-if="currentNews !== null">
              <h2>
                <a href="javascript:void(0)" @click="goBack">
                  <Icon type="ios-arrow-round-back" />
                </a>
                {{ currentNews.title }}
              </h2>
              <img
                v-if="currentNews.thumb != null"
                :src="currentNews.thumb"
                alt="photo"
              />
              <span v-html="currentNews.body"></span>
            </div>
          </div>
        </div>
      </div>
    </v-modal>

    <v-modal
      name="instruct-modal"
      :pivot-y="0.5"
      :adaptive="true"
      :reset="true"
      :draggable="false"
      height="90%"
      width="70%"
    >
      <div class="d-modal">
        <div class="modal-header">
          <h2 class="title">Ашиглах заавар</h2>
          <a
            href="javascript:void(0)"
            @click="$modal.hide('instruct-modal')"
            class="close"
          >
            <Icon type="ios-close" />
          </a>
        </div>
        <div class="modal-body np">
          <iframe
            style="width:100%; height:100%; border-right: solid 1px #dedede;"
            src="https://docs.google.com/document/d/e/2PACX-1vSVfeWzKqor3JfVKVHh-ZL-N1eTb4F_Bd4vYwDQv5Z7kMbtHRECdmFj76-b_ih2lQ/pub?embedded=true"
          ></iframe>
        </div>
      </div>
    </v-modal>

    <v-modal
      name="contact-modal"
      :pivot-y="0.5"
      :adaptive="true"
      :reset="true"
      :draggable="false"
      height="90%"
      width="70%"
    >
      <div class="d-modal">
        <div class="modal-header">
          <h2 class="title">Холбоо барих</h2>
          <a
            href="javascript:void(0)"
            @click="$modal.hide('contact-modal')"
            class="close"
          >
            <Icon type="ios-close" />
          </a>
        </div>
        <div class="modal-body np">
          <div class="mapouter">
            <div class="gmap_canvas">
              <iframe
                width="100%"
                height="300"
                id="gmap_canvas"
                src="https://maps.google.com/maps?q=premium%20palace&t=&z=17&ie=UTF8&iwloc=&output=embed"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
              ></iframe>
            </div>
            <div class="contact-info">
              <ul>
                <li>
                  <Icon type="ios-call-outline" />
                  <span>+976 7555-9100</span>
                </li>

                <li>
                  <Icon type="ios-mail-outline" />
                  <span>info@dazo.mn</span>
                </li>

                <li>
                  <Icon type="ios-map-outline" />
                  <span
                    >Монгол улс, Улаанбаатар хот-15150, Их тойруу, Чингэлтэй
                    дүүрэг 5-р хороо, Премиум Палас, 3-р давхар 301 тоот
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </v-modal>
  </div>
</template>

<script>
import Vue from "vue";
import iView from "iview";
import lang from "iview/dist/locale/en-US";
import vModal from "vue-js-modal";

Vue.use(iView);
iView.locale(lang);
Vue.use(vModal, { componentName: "v-modal" });

export default {
  data() {
    return {
      isLoading: false,
      loading: false,
      isSuccess: false,
      isError: false,
      credentials: {
        login: null,
        password: null,
      },
      selectedLang:
        localStorage.getItem("lang") == null
          ? "mn"
          : localStorage.getItem("lang"),
      languages: window.lambda.languages,
      copyright: window.lambda.copyright,
      lambda: window.lambda,
      styleObj: {
        backgroundImage: window.lambda.bg + " !important",
      },
      slides: [],
      faqs: [],
      news: [],
      currentSlide: 0,
      currentNews: null,
      isList: true,
    };
  },

  computed: {
    lang() {
      return window.lambda.static_words[this.selectedLang];
    },
  },

  created() {
    this.getSlides();
  },

  mounted() {
    setTimeout(() => {
      var options = {
        facebook: "146767855512109", // Facebook page ID
        call_to_action: "Санал хүсэлт", // Call to action
        position: "right", // Position may be 'right' or 'left'
      };
      var proto = document.location.protocol,
        host = "getbutton.io",
        url = proto + "//static." + host;
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = url + "/widget-send-button/js/init.js";
      s.onload = function() {
        WhWidgetSendButton.init(host, proto, options);
      };
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
    }, 1000);
  },

  methods: {
    switchLanguage(val) {
      this.selectedLang = val;
      localStorage.setItem("lang", val);
    },

    getSlides() {
      axios.get("https://school-alert.mn/sa/api/slides").then(({ data }) => {
        this.slides = data;
      });
    },

    getFaqs() {
      this.isLoading = true;
      axios.get("https://school-alert.mn/sa/api/faq").then(({ data }) => {
        this.faqs = data;
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      });
    },

    getNews() {
      this.isLoading = true;
      axios.get("https://school-alert.mn/sa/api/news").then(({ data }) => {
        this.news = data;
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      });
    },

    showFaqModal(row) {
      this.isLoading = false;
      if (this.faqs.length == 0) {
        this.getFaqs();
      }
      this.$modal.show("faq-modal");
    },

    showNewsModal(row) {
      this.isList = true;
      this.isLoading = false;
      if (this.news.length == 0) {
        this.getNews();
      }
      this.$modal.show("news-modal");
    },

    showInstructModal(row) {
      if (this.faqs.length == 0) {
        this.getFaqs();
      }
      this.$modal.show("instruct-modal");
    },

    showContactModal(row) {
      if (this.faqs.length == 0) {
        this.getFaqs();
      }
      this.$modal.show("contact-modal");
    },

    showDetail(item) {
      this.currentNews = item;
      this.isList = false;
    },

    goBack() {
      this.isList = true;
    },
  },
};
</script>

<style lang="scss">
@import "../../../scss/theme/upwork/style";
</style>
