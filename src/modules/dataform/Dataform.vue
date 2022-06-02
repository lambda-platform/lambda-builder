<template>
    <div :class="viewMode ? 'dataform view-mode' : 'dataform'">
        <Form :ref="meta.model +'-'+ schemaID" :model="model" :rules="rule" :label-position=meta.option.labelPosition
              :label-width=meta.option.labelWidth>
            <div class="dataform-header">
                <h3>{{ title }} </h3>
            </div>
            <div class="dataform-body">
                <Spin v-if="loadConfig" fix></Spin>
                <Row v-else v-for="row in ui.schema" :key="row.index">
                    <!-- Section -->
                    <Col v-for="col in row.children" v-if="isVisibleSection(col) &&(col.visibleModelValue==null || (model && visibleSectionByModel(col.visibleModelValue)))" :key="col.index" :xs="col.span.xs"
                         :sm="col.span.sm" :md="col.span.md" :lg="col.span.lg">
                        <div class="fieldset">
                            <legend>{{ col.name }}</legend>
                            <Row v-for="srow in col.children" :key="srow.index">
                                <Col v-for="scol in srow.children" :id="scol.id" :key="scol.index" :xs="24"
                                     :sm="24" :md="scol.span.md" :lg="scol.span.lg">
                                    <Divider v-if="scol.name" orientation="left" class="form-divider">{{ scol.name }}
                                    </Divider>
                                    <span v-for="item in scol.children" :key="item.index">
                                            <component :ref="'sf'+item.model"
                                                       v-if="item.formType == 'SubForm' && item.subtype"
                                                       :is="element(`subform/${item.subtype}`)"
                                                       :model="{form: model, component: item.model}"
                                                       :form="setMeta(item, true)"
                                                       :formula="formula"
                                                       :relations="relations"
                                                       :editMode="editMode"></component>
                                                <component
                                                    v-if="isShow(item.model) && item.formType != 'SubForm'"
                                                    :do_render="do_render"
                                                    :editMode="editMode"
                                                    :is="element(item.formType)"
                                                    :model="{form: model, component: item.model}"
                                                    :disabled="item.disabled ? item.disabled : false"
                                                    :label="item.label ? item.label : `[${item.model}]`"
                                                    :rule="item.model"
                                                    :meta="setMeta(item)"
                                                    :identity="identity"
                                                    :getSchemaByModel="getSchemaByModel"
                                                    :setSchemaByModel="setSchemaByModel"
                                                    :relation_data="getRelationData(item)">

                                                </component>
                                        </span>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <!-- Standart column -->
                    <Col v-for="col in row.children" v-if="col.type == 'col'" :key="col.index" :xs="col.span.xs"
                         :sm="col.span.sm" :md="col.span.md" :lg="col.span.lg">
                        <Divider v-if="col.name" orientation="left" class="form-divider">{{ col.name }}</Divider>
                        <span v-for="item in col.children" :key="item.index">
                                <component :ref="'sf'+item.model" v-if="item.formType == 'SubForm' && item.subtype"
                                           :is="element(`subform/${item.subtype}`)"
                                           :label="item.label ? item.label : `[${item.model}]`"
                                           :model="{form: model, component: item.model}"
                                           :form="setMeta(item, true)"
                                           :relations="relations"
                                           :formula="formula"
                                           :schemaID="schemaID"
                                           :editMode="editMode"></component>

                                    <component
                                        v-if="isShow(item.model) && item.formType != 'SubForm'"
                                        :do_render="do_render"
                                        :editMode="editMode"
                                        :is="element(item.formType)"
                                        :disabled="item.disabled ? item.disabled : false"
                                        :model="{form: model, component: item.model}"
                                        :label="item.label ? item.label : `[${item.model}]`" :rule="item.model"
                                        :meta="setMeta(item)"
                                        :identity="identity"
                                        :getSchemaByModel="getSchemaByModel"
                                        :setSchemaByModel="setSchemaByModel"
                                        :relation_data="getRelationData(item)"
                                    ></component>
                            </span>
                    </Col>
                </Row>
            </div>

            <div class="dataform-footer" v-if="!viewMode">
                <Button type="info" :loading="asyncMode" @click="handleSubmit(meta.model +'-'+ schemaID)">
                    <span v-if="!asyncMode">{{
                            $static_words ? $static_words.save : save_btn_text && save_btn_text != '' ? save_btn_text : 'Хадгалах'
                        }}</span>
                    <span
                        v-else>{{ `${$static_words ? $static_words.pleaseWaitLoading : 'Түр хүлээнэ үү...'}` }}}</span>
                </Button>
                <Button @click="handleReset(meta.model +'-'+ schemaID)" v-if="!editMode"
                        style="margin-left: 8px">
                    {{ `${$static_words ? $static_words.reset : 'Шинээр бөглөх'}` }}
                </Button>
            </div>
        </Form>
        <Drawer
            class="info-modal"
            v-model="showInfo"
            :title="infoTitle"
            width="860px"
        >
            <iframe :src="infoUrl" frameborder="0"></iframe>
            <div slot="footer">
                <Button type="primary" size="large" @click="showInfo = false">
                    {{ `${$static_words ? $static_words.close : 'Хаах'}` }}
                </Button>
            </div>
        </Drawer>
    </div>
</template>

<script>
import {element} from "./elements";
import {getRule, setModel, setIdentity} from "./rule";
import {doFormula, doTrigger} from "./utils/formula_and_trigger.js";
import {evalstr, isValid} from "./utils/methods.js";

export default {
    props: [
        "schemaID",
        "editMode",
        "onReady",
        "onSuccess",
        "onError",
        "permissions",
        "user_condition",
        "do_render",
        "isSubForm",
        "url",
        "page_id",
        "public"
    ],
    data() {
        return {
            loadConfig: true,
            viewMode: false,
            asyncMode: false,
            save_btn_text: "",
            title: "",
            meta: {
                model: "",
                option: {}
            },
            model: {},
            schema: [],
            ui: {},
            formula: [],
            rule: {},
            identity: null,
            dataID: null,
            relations: {},
            showInfo: false,
            infoUrl: "",
            infoTitle: "",
        };
    },

    computed: {
        submitUrl() {
            return this.editMode
                ? this.page_id ? `/lambda/krud/${this.$props.schemaID}/update/${this.dataID}?page_id=${this.page_id}` : `/lambda/krud/${this.$props.schemaID}/update/${this.dataID}`
                : this.page_id ? `/lambda/krud/${this.$props.schemaID}/store?page_id=${this.page_id}` : `/lambda/krud${this.Url}/${this.$props.schemaID}/store`;
        },
        Url() {
            if (this.public === true) {
                return "-public"
            } else {
                return ""
            }
        },
    },

    created() {
        window.showInformationModal = this.showInformationModal;
        if (this.schemaID) {
            this.initForm();
        }
    },

    watch: {
        src(val, oldValue) {
            this.initForm();
        },

        editMode(val) {
            if (!val) {
                this.handleReset(this.meta.model + "-" + this.schemaID);
            }
        },

        do_render(val) {
            if (!val) {
                this.viewMode = false;
                this.handleReset(this.meta.model + "-" + this.schemaID);
            }
        },

        schemaID(val) {
            if (val) {
                this.initForm();
            }
        },

        ui(val) {
            if (val && this.dataID) {
                this.editModel(this.dataID);
            }
        }
    },

    methods: {
        visibleSectionByModel(str) {
            if (typeof str == "undefined" || str == null || str == "") {
                return true;
            }
            return eval(str.toString());
        },

        isVisibleSection(col) {
            if (col.type == 'section') {
                if (col.visibleUserRoles) {
                    if (Array.isArray(col.visibleUserRoles)) {
                        if (col.visibleUserRoles.length >= 1 && window.init.user) {
                            if (col.visibleUserRoles.findIndex(role => role == window.init.user.role) >= 0) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return false;
            }
        },
        element: element,
        evalstr: evalstr,
        isValid: isValid,
        getRelationData(item) {
            if (item.relation.filter == '' || typeof item.relation.filter === "undefined") {
                if (this.relations[item.relation.table])
                    return this.relations[item.relation.table]['data']
                else
                    return []
            } else {
                if (this.relations[item.model])
                    return this.relations[item.model]['data']
                else
                    return []
            }
        },

        isShow(model) {
            let index = this.schema.findIndex(item => item.model == model);
            if (index >= 0) {
                if (this.schema[index].hidden) {
                    return false
                } else
                    return true
            }
            return true
        },

        afterChange(model, val, oldValue) {
            doTrigger(model, val, this.model, this.schema, this.$refs, this.$Notice, this.editMode);
            if (this.do_render) {

                if (val != oldValue) {
                    doFormula(this.formula, model, this.model, this.schema, this.rule, false);
                }

            }
        },

        clearConfig() {
            this.model = {};
            this.schema = [];
            this.ui = {};
            this.formula = [];
            this.rule = {};
            this.dataID = null;
        },
        initForm() {
            // this.clearConfig();
            let userCondition = [];

            if (this.user_condition) {
                userCondition = JSON.stringify(this.user_condition);
            }
            let baseUrl = this.$props.url ? this.$props.url : '';

            let configUrl = baseUrl + `/lambda/puzzle/schema${this.Url}/form/${this.$props.schemaID}`;
            configUrl += userCondition.length == 0 ? '' : `/${userCondition}`;

            axios.get(configUrl).then(({data}) => {
                let formData = JSON.parse(data.data.schema);

                this.identity = formData.identity;
                this.schema = formData.schema;
                this.ui = formData.ui;
                this.save_btn_text = formData.save_btn_text;

                if (formData.formula) {
                    this.formula = formData.formula;
                }

                this.title = data.data.name;

                this.meta = {
                    model: formData.model,
                    option: {
                        labelPosition: formData.labelPosition,
                        labelWidth: formData.labelWidth
                    }
                };

                this.getOptionsData(formData.schema);
                this.setUiSchemaFormItem(formData.ui.schema);
                this.setHiddenItemModel(formData.schema);
                if (this.$props.onReady) {
                    this.$props.onReady(formData, this.schema);
                }
                setModel(formData.model);
                this.loadConfig = false;


            });
        },
        setHiddenItemModel(schema) {
            schema.forEach(item => {
                    if (item.hidden || item.disabled) {
                        if (this.isValid(item.default)) {
                            this.setModel(item.model, item.default, item.formType);
                        }
                        if (this.isValid(item.param)) {
                            if (item.param in this.$route.params) {
                                let param = this.$route.params[item.param];
                                if (param != 'null') {
                                    Vue.set(this.$data.model, item.model, param);
                                }
                            }
                        }
                    }
                    item.source_hidden = item.hidden;
                    item.source_disabled = item.disabled;
                }
            )

        },
        validatePassCheck(model, rule, value, callback) {

            let value_ = value ? value : '';
            let password_value = this.model[model] ? this.model[model] : '';

            if (value === '' && !this.editMode) {
                callback(new Error('Нууц үгээ дахин оруулна уу'));
            } else if (value_ !== password_value) {
                callback(new Error('Нууц үг баталгаажуулалт таарсангүй!'));
            } else {
                callback();
            }
        },

        setUiSchemaFormItem(items) {
            items.forEach(item => {
                if (item.type == "form") {
                    this.setModel(item.model, item.default, item.formType);
                    this.$watch("model." + item.model, {
                        handler: (value, oldValue) => {
                            this.afterChange(item.model, value, oldValue);
                        },
                        deep: true
                    });

                    if (item.rules) {
                        this.setRule(item.model, item.rules);
                    }
                    if (item.formType == 'Password') {
                        if (item.passwordOption) {
                            if (item.passwordOption.confirm) {
                                this.setModel('password_confirm', '', 'password');
                                this.$data.rule['password_confirm'] = [{
                                    validator: (rule, value, callback) => this.validatePassCheck(item.model, rule, value, callback),
                                    trigger: 'blur'
                                }];

                            }
                            if (item.passwordOption.edit_with_old_password) {
                                this.setModel('current_password', '', 'password');
                                let rules_for_current_password = [];
                                let rules_current_password = [{
                                    type: 'required',
                                    msg: 'Одоо хэрэглэж байгаа нууц үг ээ оруулна уу'
                                }, {type: 'check_current_password', msg: null}];
                                rules_current_password.forEach(rule => {
                                    let r = getRule(rule);
                                    rules_for_current_password.push(r);
                                });
                                this.$data.rule['current_password'] = rules_for_current_password;
                            }
                        }
                    }

                } else if (_.isArray(item.children)) {
                    this.setUiSchemaFormItem(item.children);
                }
            });
        },

        setModel(name, value, type) {
            switch (type) {
                case "Switch":
                    let val = false;
                    if (value == "true" || value == 1) {
                        val = true;
                    }
                    Vue.set(this.$data.model, name, val);
                    break;
                case "Checkbox":
                    let val_ = 0;
                    if (value == "true" || value == 1) {
                        val_ = 1;
                    }
                    Vue.set(this.$data.model, name, val_);
                    break;
                case "CK":
                    let ck_value = "";
                    if (value != "" && value !== null) {
                        ck_value = value;
                    }
                    Vue.set(this.$data.model, name, ck_value);
                    break;
                case "SubForm":
                    Vue.set(this.$data.model, name, []);
                    break;
                case "Select":
                    Vue.set(this.$data.model, name, value);
                    break;
                case "Number":
                    Vue.set(this.$data.model, name, value * 1);
                    break;
                case "ISelect":
                    Vue.set(this.$data.model, name, value);
                case "TreeSelect":
                    Vue.set(this.$data.model, name, value);
                    break;
                default:
                    Vue.set(this.$data.model, name, value);
            }
        },

        setRule(name, rules) {
            this.$data.rule[name] = [];
            rules.forEach(item => {
                let r = getRule(item);
                this.$data.rule[name].push(r);
            });
        },

        setMeta(item, subForm) {
            let s_index = this.schema.findIndex(schema => schema.model == item.model);
            let i = s_index >= 0 ? this.schema[s_index] : item;
            if (!subForm) {
                delete i["table"];
                delete i["extra"];
                i.schemaID = this.$props.schemaID;
            }
            return i;
        },

        getSchemaByModel(model) {
            let index = this.schema.findIndex(item => item.model == model);
            if (index >= 0)
                return this.schema[index]
            else
                return null
        },

        setSchemaByModel(model, prop, value) {
            if (prop == "value") {
                Vue.set(this.$data.model, model, value);
            } else if (prop == "sub-value") {
                Vue.set(this.$data.model, model, value);
                this.subFormFillData(model)
            } else {
                let index = this.schema.findIndex(item => item.model == model);
                if (index >= 0)
                    Vue.set(this.schema[index], prop, value)
            }

        },

        getSubFormData(key) {
            let subFormData = [];
            this.model[key].forEach(item => {
                subFormData.push(item.data);
            });
        },

        handleSubmit(name) {
            this.setIdentityManual();
            if (_.isEmpty(this.$data.rule)) {
                this.postData();
            } else {
                this.$refs[name].validate(valid => {
                    if (valid) {
                        this.postData();
                    } else {
                        //auh дээр хэрэглэгдэж байгаа шүү
                        this.$Notice.error({
                            title: this.$static_words ? this.$static_words.formIncomplete : 'Мэдээлэл дутуу бөглөсөн байна',
                            desc: this.$static_words ? this.$static_words.pleaseFillRequiredFields : 'Мэдээлэл бөглөх явцад заавал бөглөх хэсгүүд байна. Формыг хараад улаан хүрээтэй заавал бөглөгдөх хэсгүүдийг гүйцээж бөглөнө үү '
                            , duration: 0
                        });
                        console.log(this.$data.model);
                        console.log("not passed validation");
                    }
                });
            }
        },

        postData() {
            console.log("formdata: ", this.$data.model);

            if (this.isSubForm) {
                this.$props.onSuccess(this.$data.model);
            } else {
                this.asyncMode = true;
                axios.post(this.submitUrl, this.$data.model)
                    .then(({data}) => {
                        //console.log(data);
                        if (data.status) {
                            this.$Notice.success({
                                title: this.$static_words ? this.$static_words.savedSuccessfully : "Амжилттай хадгалагдлаа!"
                            });

                            if (!this.editMode) {
                                this.$data.model[this.identity] = data[this.identity];
                                if (this.$props.onSuccess) {
                                    this.$props.onSuccess(data.data);
                                }
                                this.handleReset(this.meta.model + "-" + this.schemaID);
                            } else {
                                if (this.$props.onSuccess) {
                                    this.$props.onSuccess(data.data);
                                }
                            }
                        } else {
                            this.$Notice.error({
                                title: this.$static_words ? this.$static_words.savedFailed : "Хадгалах үед алдаа гарлаа!"
                            });
                            if (this.$props.onError) {
                                this.$props.onError();
                            }
                        }
                        this.asyncMode = false;
                    })
                    .catch(e => {
                        let errorDesc = "";
                        if (e.response.data.hasOwnProperty("error")) {
                            if (typeof e.response.data.error === 'string' || e.response.data.error instanceof String) {
                                errorDesc = e.response.data.error;
                            } else {
                                if (e.response.data.error instanceof Object) {
                                    Object.keys(e.response.data.error).forEach(error => {
                                        let desc = error + ": " + e.response.data.error[error].map(ed => ed + " ")
                                        if (errorDesc != "") {
                                            errorDesc = errorDesc + "<br/>" + desc;
                                        } else {
                                            errorDesc = desc;
                                        }
                                    })
                                }
                            }

                        }
                        this.$Notice.error({
                            title: this.$static_words ? this.$static_words.savedFailed : "Хадгалах үед алдаа гарлаа!",
                            duration: 3,
                            desc: errorDesc
                        });
                        this.asyncMode = false;
                        if (this.$props.onError) {
                            this.$props.onError();
                        }
                    });
            }
        },

        handleReset(name) {
            this.model = {};
            this.$refs[name].resetFields();
            setIdentity(this.identity, null);
            this.schema.forEach(item => {
                if (item.formType == "SubForm" && typeof this.$refs[`sf${item.model}`] != "undefined") {
                    this.$refs[`sf${item.model}`][0].reset();
                }
                //if (item.default != null && !this.editMode) {
                this.setModel(item.model, item.default, item.formType);
                //}

                item.hidden = item.source_hidden;
                item.disabled = item.source_disabled;
            });
            this.setHiddenItemModel(this.schema);
        },
        setIdentityManual() {
            setIdentity(this.identity, this.model[this.identity]);
        },

        setUserConditionValues() {

            //SET DEFAULT VALUE Disabled item on edit mode
            if (this.user_condition) {
                this.user_condition.forEach(user_condition => {

                    let schemaItem = this.getSchemaByModel(user_condition["form_field"]);

                    if (schemaItem.default != "" && schemaItem.default !== null && schemaItem.default != 0) {
                        if (this.model[schemaItem.model] == "" || this.model[schemaItem.model] === null || this.model[schemaItem.model] == 0) {

                            this.model[schemaItem.model] = schemaItem.default;
                        }
                    }

                });
            }

        },

        editModel(id, editData) {
            if (editData) {
                this.model = {...this.model, ...editData};
                if (this.ui && this.ui.hasOwnProperty("schema")) {
                    this.setEditModel(this.ui.schema);
                    this.setUserConditionValues();
                }

            } else {
                this.dataID = id;
                setIdentity(this.identity, id);
                axios.post(this.page_id ? `/lambda/krud/${this.$props.schemaID}/edit/${id}?page_id=${this.page_id}` : `/lambda/krud/${this.$props.schemaID}/edit/${id}`)
                    .then(({data}) => {
                        if (data.status) {
                            this.model = {...this.model, ...data.data};
                            if (this.ui && this.ui.hasOwnProperty("schema")) {
                                this.setEditModel(this.ui.schema);
                            }
                            this.setUserConditionValues();
                        }
                    });
            }
        },

        setHiddenValues(values) {
            values.map(item => {
                this.model[item["key"]] = item["val"];
            });
        },

        subFormFillData(subModel) {
            if (this.$refs[`sf${subModel}`]) {
                this.$refs[`sf${subModel}`][0].fillData();
            } else {
                setTimeout(() => {
                    this.subFormFillData(subModel)
                }, 100)
            }
        },

        setEditModel(items) {
            items.forEach(item => {
                if (item.type == "form" || item.type == "Form" || item.formType == "SubForm") {

                    switch (item.formType) {
                        case "SubForm":
                            this.subFormFillData(item.model);
                            break;
                        case "Switch":
                            if (this.model[item.model] == 1 || this.model[item.model] == "true") {
                                this.model[item.model] = true;
                            } else {
                                this.model[item.model] = false;
                            }
                            break;
                        // case "Checkbox":
                        //     if (this.model[item.model] == 1 || this.model[item.model] == "true") {
                        //         this.model[item.model] = true;
                        //     } else {
                        //         this.model[item.model] = false;
                        //     }
                        //     break;
                        case "Password":
                            this.model[item.model] = '';
                            delete this.$data.rule[item.model];
                            break;
                        case "PasswordGenerate":
                            this.model[item.model] = '';
                            delete this.$data.rule[item.model];
                            break;
                        default:
                            break;
                    }
                } else if (_.isArray(item.children)) {
                    this.setEditModel(item.children);
                }
            });
        },
        cloneModel(id) {
            axios.post(`/lambda/krud/${this.$props.schemaID}/edit/${id}`)
                .then(({data}) => {
                    if (data.status) {
                        this.model = {...this.model, ...data.data};
                        delete this.model[this.identity];
                        this.setEditModel(this.ui.schema);
                        this.setUserConditionValues();
                    }
                });
        },

        getOptionsData(schema) {
            this.relations = this.getSelects(schema);

            if (Object.keys(this.relations).length >= 1) {
                axios.post(`/lambda/puzzle/get_options${this.Url}`, {relations: this.relations})
                    .then(({data}) => {
                        Object.keys(data).map(relation => {
                            let r = {...this.relations[relation], data: data[relation]}
                            Vue.set(this.$data.relations, relation, r);
                        });


                    });
            }
        },
        getSelects(schema) {
            let selects = {};

            schema.map(item => {
                if (item.formType == 'Select' || item.formType == 'ISelect' || item.formType == 'TreeSelect') {
                    if (item.relation.table) {
                        if (typeof selects[item.relation.table] === "undefined") {

                            if (item.relation.filter == "" || typeof item.relation.filter === "undefined") {
                                selects[item.relation.table] = item.relation;
                            } else {

                                selects[item.model] = item.relation;
                            }
                        }
                    }
                }

                if (item.formType == 'AdminMenu') {
                    if (item.relation.table)
                        selects[item.relation.table] = item.relation;
                }

                if (item.formType == 'SubForm') {

                    if (item.schema) {
                        let pre_selects = this.getSelects(item.schema);
                        if (pre_selects) {
                            selects = {...selects, ...pre_selects}
                        }
                    }

                }
            });
            return selects;
        },

        /* countShowableChildren(children){
             let visible_item_found = false;
             children.forEach(child=>{
                 if(child.children){
                     child.children.forEach(sub_child=>{
                         if(sub_child.children){
                             sub_child.children.forEach(form_field=>{

                                 if(!form_field.hidden && form_field.type == 'form'){
                                     visible_item_found = true;
                                     console.log(form_field)

                                 }

                             })
                         }
                     })
                 }
             })
             return visible_item_found;
         }*/
        showInformationModal(url, title) {

            console.log(title, url)
            this.infoTitle = title;
            this.infoUrl = url;
            this.showInfo = true;

        }
    },
};
</script>

