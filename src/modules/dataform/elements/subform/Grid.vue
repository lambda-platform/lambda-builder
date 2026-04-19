<template>
    <div class="subform-grid" :style="subStyle">
        <div class="subform-header">
            {{ form.name }}
            <Button shape="circle" type="success" size="small" @click="add" icon="md-add"
                    class="sub-form-add-btn"></Button>
        </div>
        <div class="sub-form-table-wrap">
            <table class="sub-form-grid" border="1">
                <thead>
                <tr>
                    <th class="row-number" scope="col" v-if="form.showRowNumber">ДД</th>
                    <th
                        v-for="item in visibleSchema"
                        :key="item.model"
                        scope="col"
                        :aria-sort="ariaSortFor(item)"
                        @click="sort(item)">
                        <div class="th-title">
                            <span>{{ item.label }}</span>
                            <i class="ti-exchange-vertical" aria-hidden="true"/>
                        </div>
                    </th>
                    <th class="action" scope="col" v-if="!form.disableDelete">...</th>
                </tr>
                </thead>
                <tbody>
                <grid-form v-for="(item, index) in listData"
                           :key="rowKey(item, index)"
                           :f="item.form"
                           :model="item.model"
                           :editMode="editMode"
                           :relations="relations"
                           :schema="form.schema"
                           :formula="formula">
                    <template slot="action" v-if="!form.disableDelete">
                        <button type="button"
                                class="sub-row-action"
                                :aria-label="lang.remove || 'Remove row'"
                                @click="remove(index)">
                            <Icon type="ios-trash" aria-hidden="true"/>
                        </button>
                    </template>
                    <template slot="rowNumber" v-if="form.showRowNumber">
                        <span>{{ index + 1 }}</span>
                    </template>
                </grid-form>
                <tr v-if="listData.length === 0" class="subform-empty-row">
                    <td :colspan="emptyColspan" class="subform-empty-cell">
                        {{ emptyLabel }}
                    </td>
                </tr>
                </tbody>
                <tfoot v-if="hasEq">
                <tr>
                    <td v-if="form.showRowNumber"></td>
                    <td v-for="item in equationData" :key="item.model">
                        <span v-if="item.preStaticWord"> {{ item.preStaticWord }} </span>
                        <span v-if="item.hasEquation">{{ item.data.toLocaleString() }}</span>
                        <span v-if="item.prefix"> {{ item.prefix }}</span>
                    </td>
                    <td v-if="!form.disableDelete"></td>
                </tr>
                </tfoot>
            </table>
        </div>
        <a class="sub-grid-add" href="javascript:void(0)" @click="add" v-if="form.min_height && !form.disableCreate">
            <i class="ti-plus"></i>
            {{ lang.add }}
        </a>

        <paper-modal
            :name="`grid-modal-${form.sourceGridID}`"
            class="form-modal"
            :min-width="200"
            :min-height="100"
            :pivot-y="0.5"
            :adaptive="true"
            :reset="true"
            :draggable="true"
            :resizable="true"
            draggable=".form-tool"
            width="85%"
            height="50%"
        >
            <section class="form-modal source-grid">
                <div class="form-tool ">

                    <h4>{{ form.sourceGridModalTitle }}</h4>
                    <div class="form-tool-actions">
                        <a href="javascript:void(0)" @click="closeSourceModal">
                            <i class="ti-close"></i>
                        </a>
                    </div>
                </div>

                <div class="form-body" v-if="modal_grid_show">

                    <div v-if="form.sourceGridTitle && form.sourceGridDescription" class="source-grid-description">
                        <h3>
                            {{ form.sourceGridTitle }}
                        </h3>
                        <p v-html="form.sourceGridDescription">

                        </p>
                    </div>
                    <datagrid
                        :schemaID="form.sourceGridID"
                        :url="sourceGridUrl()"
                        :onRowSelect="onRowSelect"
                        :paginate="50"
                        :hasSelection="true"
                        :user_condition="user_condition"
                        :custom_condition="custom_condition"
                        :permissions="{
                          c:false,
                          r:true,
                          u:false,
                          d:false,
                      }"
                    />
                    <div class="add-from-pre-source">
                        <Button shape="circle" type="success" size="small" @click="addFromPreSource"
                                :disabled="preSource.length == 0" icon="md-add"
                                class="sub-form-add-btn">Сонгох
                        </Button>
                    </div>
                </div>
            </section>
        </paper-modal>
    </div>
</template>

<script>
import {element} from "../index";
import GridForm from "./GridForm";
import subFormMix from "./subFormMix";

export default {
    props: ["form", "model", "editMode", "relations", "formula"],
    mixins: [subFormMix],
    components: {
        "grid-form": GridForm
    },
    mounted() {
        this.equationRenderer();
    },
    computed: {
        lang() {
            const labels = ['pleaseCompleteFirstLine', 'add', 'remove'];
            return labels.reduce((obj, key) => {
                obj[key] = this.$t('dataForm.' + key);
                return obj;
            }, {});
        },
        emptyLabel() {
            const key = 'dataForm.empty';
            const translated = this.$t(key);
            return translated === key ? 'Хоосон байна' : translated;
        },
        subStyle() {
            return {
                minHeight: (this.form.min_height || 30) + 'px',
                background: '#f3f4f5',
                marginTop:'20px'
            };
        },
        visibleSchema() {
            return (this.form.schema || []).filter(item => item.label !== '' && !item.hidden);
        },
        emptyColspan() {
            let n = this.visibleSchema.length;
            if (this.form.showRowNumber) n += 1;
            if (!this.form.disableDelete) n += 1;
            return n || 1;
        },
    },
    watch: {
        listData: {
            handler: function (curr, old) {
                if (this.hasEq) {
                    this.equationData.map(eq => {
                        if (eq.hasEquation) {
                            eq.data = -1;
                            let count = 0;
                            switch (eq.equation) {
                                case "SUM": {
                                    eq.data = 0;
                                    curr.map(it => {
                                        eq.data += Number(isNaN(parseInt(it.model[eq.model], 10)) ? 0 : it.model[eq.model]);
                                    });
                                    break;
                                }
                                case "COUNT": {
                                    eq.data = 0;
                                    curr.map(it => {
                                        eq.data += Number(1);
                                    });
                                    break;
                                }
                                case "MIN": {
                                    curr.map(it => {
                                        if (eq.data == -1) {
                                            eq.data = it.model[eq.model];
                                        } else {
                                            eq.data = Math.min(eq.data, it.model[eq.model]);
                                        }
                                    });
                                    break;
                                }
                                case "MAX": {
                                    eq.data = 0;
                                    curr.map(it => {
                                        eq.data = Math.max(eq.data, it.model[eq.model]);
                                    });
                                    break;
                                }
                                case "AVG": {
                                    eq.data = 0;
                                    curr.map(it => {
                                        count++;
                                        eq.data += Number(it.model[eq.model]);
                                    });
                                    eq.data = Number(eq.data / count);
                                    break;
                                }
                            }
                        }
                    });
                }
            },
            deep: true
        }
    },
    data() {
        return {
            listData: [],
            equationData: [],
            currentSort: null,
            currentSortDir: 'asc',
            hasEq: false,
            rowLength: 0,
        };
    },
    methods: {

        element: element,

        checkAddable() {
            return new Promise((resolve, reject) => {
                let obj = this.listData[this.listData.length - 1];
                if (obj) {
                    let hasValue = false;
                    let lastModel = obj.model;

                    for (let key in lastModel) {
                        if (
                            typeof lastModel[key] != undefined &&
                            lastModel[key] != null &&
                            lastModel[key] != "" &&
                            lastModel[key] != false
                        ) {
                            hasValue = true;
                        }
                    }
                    if (hasValue) {
                        resolve(true)
                    } else {
                        alert(this.lang.pleaseCompleteFirstLine);
                        reject(false);
                    }
                } else {
                    resolve(true);
                }
            });
        },

        addSubForm() {
            let clonedForm = _.cloneDeep(this.form);
            let clonedFormModel = {};
            clonedForm.schema.forEach(item => {
                if (
                    clonedForm.identity == item.model ||
                    item.formType == null
                ) {
                    return;
                }

                if (
                    clonedForm.timestamp &&
                    (item.model == "created_at" || item.model == "updated_at")
                ) {
                    return;
                }

                Vue.set(clonedFormModel, item.model, item.default);
            });

            let listItem = {
                form: clonedForm,
                model: clonedFormModel
            };


            if (this.model.form[this.model.component] == undefined) {
                this.model.form[this.model.component] = [];
            }
            this.model.form[this.model.component].push(clonedFormModel);

            this.listData.push(listItem);
            this.rowLength = this.model.form[this.model.component].length;
        },

        add() {

            if (this.form.addFromGrid && this.form.sourceGridID) {
                this.showAddSourceModal();
            } else {
                this.checkAddable()
                    .then(o => {
                        setTimeout(() => {
                            this.addSubForm();
                        }, 200);
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }

        },

        fillData() {
            this.listData = [];
            setTimeout(() => {
                this.listData = [];
                this.model.form[this.model.component].forEach(item => {
                    let listItem = {
                        form: _.cloneDeep(this.form),
                        model: item
                    };
                    this.listData.push(listItem);
                });
            }, 100);
        },

        equationRenderer() {
            this.equationData = [];
            this.form.schema.map(item => {
                if (item.label != '' && !item.hidden) {
                    if (item.hasEquation) this.hasEq = true;
                    this.equationData.push({
                        hasEquation: item.hasEquation,
                        equation: item.equations,
                        prefix: item.prefix,
                        model: item.model,
                        preStaticWord: item.preStaticWord,
                        data: 0
                    });
                }
            });
        },

        remove(index) {
            this.model.form[this.form.model].splice(index, 1);
            this.listData.splice(index, 1);
            this.rowLength = this.model.form[this.model.component].length;
        },

        reset() {
            this.model.form[this.form.model] = [];
            this.listData = [];
        },

        sort(item) {
            if (this.currentSort === item.model) {
                this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
            } else {
                this.currentSort = item.model;
                this.currentSortDir = 'asc';
            }
            const dir = this.currentSortDir === 'desc' ? -1 : 1;
            const key = this.currentSort;
            this.listData.sort((a, b) => {
                const av = a.model[key];
                const bv = b.model[key];
                if (av < bv) return -1 * dir;
                if (av > bv) return 1 * dir;
                return 0;
            });
        },

        ariaSortFor(item) {
            if (this.currentSort !== item.model) return 'none';
            return this.currentSortDir === 'desc' ? 'descending' : 'ascending';
        },

        rowKey(item, index) {
            const id = item && item.model && (item.model.id || item.model._uid);
            return id != null ? id : index;
        },
    }
};
</script>
