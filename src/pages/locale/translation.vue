<template>
    <div class="page-locale-sub">
        <div class="translation-page">
            <div class="translation-page-header">
                <div class="translation-page-header-left">
                    <h3>Орчуулга </h3>
                    <div class="search-wrap">
                        <Input type="search" placeholder="Түлхүүр үгээр хайх..." suffix="ios-search"
                               @input="searchLocale"/>
                    </div>
                </div>
                <div class="translation-action">
                    <Button type="primary" :loading="loadingGenerate" @click="generateLocale">
                        <i class="ti-exchange-vertical" v-if="!loadingGenerate"></i>
                        <span>Орчуулгын файл шинээр үүсгэх</span>
                    </Button>
                </div>
            </div>

            <div class="translation-page-body">
                <div class="c-group" v-for="c in translation" :key="c.id">
                    <div class="c-group-header">
                        <h3>{{ c.title }}</h3>
                    </div>
                    <div class="c-group-body">
                        <table class="t-table">
                            <tbody>
                            <tr v-for="t in c.translation" :key="t.id">
                                <td>
                                    <Input size="small" v-model="t.key" placeholder="Түлхүүр"
                                           @on-blur="updateTranslation(t)"/>
                                </td>
                                <td v-for="l in locales" :key="l.id">
                                    <Input size="small" v-model="t[l.code]" :placeholder="l.code"
                                           @on-blur="updateTranslation(t)"/>
                                </td>
                                <td>
                                    <div class="t-action">
                                        <Poptip
                                            confirm
                                            placement="left"
                                            title="Орчуулгыг устгах уу"
                                            ok-text="Тийм"
                                            @on-ok="deleteTranslation(c, t.id)">
                                            <a href="javascript:void(0)" class="delete-tr">
                                                <i class="ti-trash"></i>
                                                <span>Устгах</span>
                                            </a>
                                        </Poptip>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="c-group-footer">
                        <a href="javascript:void(0)" @click="addTranslation(c)">
                            <i class="ti-plus"></i>
                            <span>Орчуулга нэмэх</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';

export default {
    name: "translation",
    data() {
        return {
            loadingGenerate: false,
            locales: [],
            translation: [],
            searchTranslation: [],
        }
    },

    created() {
        this.getLocales();
        this.getTranslation();
    },

    methods: {
        getLocales() {
            axios.get('/lambda/locale/languages').then(({data}) => {
                this.locales = data;
            })
        },

        getTranslation() {
            axios.get('/lambda/locale/translation').then(({data}) => {
                this.translation = data;
                this.searchTranslation = _.cloneDeep(data);
            })
        },

        generateLocale() {
            this.loadingGenerate = true;
            axios.get('/lambda/locale/generate').then(({data}) => {
                if (data.status) {
                    this.$Message.success(data.msg);
                } else {
                    this.$Message.error(data.msg);
                }
                this.loadingGenerate = false;
            })
        },

        searchLocale(q) {
            this.translation = _.cloneDeep(this.searchTranslation);
            this.translation.forEach(c => {
                c.translation = c.translation.filter(t => t.key.toLowerCase().startsWith(q.toLowerCase()));
            });
        },

        addTranslation(c) {
            let trItem = {
                'component_id': c.id,
                'key': '',
            }
            axios.post('/lambda/locale/add', trItem).then(({data}) => {
                if (data.status) {
                    c.translation.push(data.tr);
                }
            })
        },

        updateTranslation(t) {
            axios.post('/lambda/locale/update', t).then(({data}) => {

            })
        },

        deleteTranslation(c, id) {
            axios.get(`/lambda/locale/delete/${id}`).then(({data}) => {
                if (data.status) {
                    c.translation = c.translation.filter(item => item.id !== id);
                    c.searchTranslation = c.searchTranslation.filter(item => item.id !== id);

                    this.$Message.success(data.msg);
                } else {
                    this.$Message.error(data.msg);
                }
            })
        }
    }
}
</script>

<style scoped>

</style>
