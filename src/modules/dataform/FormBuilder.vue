<template>
    <section class="form-builder">
        <Spin size="large" fix v-if="loading"></Spin>
        <div class="fb-sidebar">
            <div class="fb-control">
                <div class="fb-control-item">
                    <label>Формын нэр</label>
                    <Input v-model="formName" placeholder="Формын нэр"/>
                </div>

                <div class="fb-control-item">
                    <label>Формын төрөл</label>
                    <Select v-model="dataform.ui.type" placeholder="Формын төрөл" clearable>
                        <Option value="normal">
                            Энгийн форм
                        </Option>
                        <Option value="wizard">
                            Алхамтай форм
                        </Option>
                    </Select>
                </div>

                <div class="fb-control-item">
                    <label>Өгөгдлийн хүснэгт</label>
                    <Select v-if="!editMode" v-model="dataform.model" placeholder="Хүснэгт сонгох" clearable filterable
                            @on-change="setBuilder">
                        <Option v-for="item in tableList" :value="item" :key="item.index">{{ item }}</Option>
                    </Select>
                    <Input v-model="dataform.model" disabled v-if="editMode"/>
                </div>

                <div class="fb-control-item" v-if="isModelSelected || editMode">
                    <label>ID талбар</label>
                    <Select v-model="dataform.identity" placeholder="ID талбар" clearable>
                        <Option v-for="item in dataform.schema" :value="item.model" :key="item.index">{{ item.model }}
                        </Option>
                    </Select>
                </div>

                <div class="fb-control-item" v-if="isModelSelected || editMode">
                    <Checkbox v-model="dataform.timestamp">
                        <span>Огноо автоматаар үүсэх</span>
                    </Checkbox>
                </div>

                <div class="divider" v-if="isModelSelected || editMode"></div>

                <div class="fb-control-item" v-if="isModelSelected || editMode">
                    <label>Лабелын байршил</label>
                    <RadioGroup v-model="dataform.labelPosition" @on-change="setLabelWidth">
                        <Radio label="top"></Radio>
                        <Radio label="left"></Radio>
                    </RadioGroup>
                    <InputNumber v-if="dataform.labelPosition == 'left'" v-model="dataform.labelWidth"></InputNumber>
                </div>

                <div class="fb-control-item" v-if="isModelSelected || editMode">
                    <label>Формын өргөн /px/</label>
                    <Input v-model="dataform.width" placeholder="Формын өргөн"/>
                </div>
                <div class="fb-control-item" v-if="isModelSelected || editMode">
                    <label>Хадгалах товчний үг</label>
                    <Input v-model="dataform.save_btn_text" placeholder="Хадгалах товчны үг"/>
                </div>

                <div class="fb-control-item" v-if="isModelSelected || editMode">
                    <label>Padding - зай авалт /px/</label>
                    <InputNumber v-model="dataform.padding"></InputNumber>
                </div>
            </div>

            <div class="fb-submit">
                <Button type="success" long @click="saveForm">
                    {{ `${$static_words ? $static_words.save : 'Хадгалах'}` }}
                </Button>
            </div>
        </div>

        <div class="fb-workspace">
            <Tabs type="card" :animated="false">
                <TabPane label="Үндсэн тохиргоо" :key="`main-tab`" icon="md-code-working">
                    <div class="crud-config">
                        <div class="crud-table">
                            <Row class="crud-table-header">
                                <Col span="5"> Модел</Col>
                                <Col span="5"> Харагдах нэр</Col>
                                <Col span="4"> Формын төрөл</Col>
                                <Col span="2" class="center"> Нуух</Col>
                                <Col span="2" class="center"> Идэвхигүй</Col>
                                <Col span="2" class="center"> Орчуулга</Col>
                                <Col span="3" class="center">
                                    <span>...</span>
                                </Col>
                            </Row>
                            <div class="crud-table-body">
                                <form-item v-for="item in dataform.schema" v-if="item.formType !== 'SubForm' "
                                           :key="item.index" :schema="dataform.schema" :item="item" :edit="editMode"
                                           :sub="false" :disabled="isDisabled(item)"></form-item>
                            </div>
                        </div>
                    </div>
                </TabPane>
                <!-- Formula confiration -->
                <TabPane label="Томъёо" icon="md-calculator">
                    <div class="form-builder">
                        <div class="formula-wrapper">
                            <Row type="flex">
                                <Col span="10">
                                    <div class="formula-form-wrapper">
                                        <Form ref="formula" label-position="top" :model="formulaForm"
                                              :rules="formulaRule">
                                            <FormItem prop="form" label="Форм ">
                                                <Select v-model="formulaForm.form">
                                                    <Option value="main">
                                                        Үндсэн форм
                                                    </Option>
                                                    <Option v-for="f in dataform.schema" v-if="f.formType == 'SubForm'"
                                                            :key="f.index"
                                                            :value="f.model">{{
                                                            f.model
                                                        }}
                                                    </Option>
                                                </Select>
                                            </FormItem>
                                            <FormItem prop="template" label="Томъёо, Нөхцөл ">
                                                <Input type="text" v-model="formulaForm.template"
                                                       placeholder="Томъёо, Нөхцөл"/>
                                                <p class="formula-helper">
                                                    Томъёо: {a}+{b} | Нөхцөл: {a}>={b}, '{a}' == 'test' ...
                                                </p>
                                            </FormItem>

                                            <FormItem v-for="(target, index) in formulaForm.targets" :key="index"
                                                      :label="'Талбар: '+ (index+1)">
                                                <Row :gutter="8" :label="80">
                                                    <Col span="10">
                                                        <Select v-model="target.field"
                                                                placeholder="Талбар" v-if="formulaForm.form == 'main'">
                                                            <Option v-for="(ss, index_) in dataform.schema"
                                                                    :value="ss.model" :key="index_">{{
                                                                    ss.model
                                                                }}
                                                            </Option>


                                                        </Select>
                                                        <Select v-model="target.field"
                                                                placeholder="Талбар"
                                                                v-for="(f, f_index) in dataform.schema" :key="f_index"
                                                                v-if="f.formType == 'SubForm' && f.model == formulaForm.form && formulaForm.form != 'main'">
                                                            <Option v-for="(f_, f__index) in f.schema"
                                                                    :value="f_.model" :key="f__index">{{
                                                                    f_.model
                                                                }}
                                                            </Option>
                                                        </Select>
                                                    </Col>

                                                    <Col span="10">
                                                        <AutoComplete v-model="target.prop" placeholder="Prop"
                                                                      :data="formulaProps"></AutoComplete>
                                                    </Col>

                                                    <Col span="4">
                                                        <Button @click="deleteFormulaTarget(index)"
                                                                icon="ios-trash"></Button>
                                                    </Col>
                                                </Row>
                                            </FormItem>

                                            <FormItem>
                                                <Button type="dashed" long @click="addFormulaTarget" icon="md-add">
                                                    Талбар нэмэх
                                                </Button>
                                            </FormItem>

                                            <FormItem>
                                                <Button type="primary" @click="addFormula">
                                                    {{ `${$static_words ? $static_words.add : 'Нэмэх'}` }}
                                                </Button>
                                            </FormItem>
                                        </Form>
                                    </div>
                                </Col>
                                <Col span="14">
                                    <Table border size="small" :columns="formulaColumns" :data="dataform.formula"
                                           height="400"></Table>
                                </Col>
                            </Row>


                        </div>
                    </div>
                </TabPane>

                <TabPane label="Триггер" icon="md-link">
                    <div class="trigger-wrapper">
                        <table>
                            <tr>
                                <td>
                                    <label>Controller namespace</label>
                                </td>
                                <td>
                                    <Input v-model="dataform.triggers.namespace" placeholder="Namespace"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Нэмэхийн өмнө</label>
                                </td>
                                <td>
                                    <Input v-model="dataform.triggers.insert.before" placeholder="Before insert"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Нэмсний дараа</label>
                                </td>
                                <td>
                                    <Input v-model="dataform.triggers.insert.after" placeholder="After insert"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Шинэчлэхийн өмнө</label>
                                </td>
                                <td>
                                    <Input v-model="dataform.triggers.update.before" placeholder="Before update"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label>Шинэчилсний дараа</label>
                                </td>
                                <td>
                                    <Input v-model="dataform.triggers.update.after" placeholder="After update"/>
                                </td>
                            </tr>
                        </table>
                    </div>
                </TabPane>

                <TabPane label="Харагдах байдал" icon="md-apps">
                    <form-moqup :mode="mode" :schema="dataform.schema" :ui="dataform.ui" :schemaID="schemaID" :meta="{
                            labelPosition: dataform.labelPosition,
                            labelWidth: dataform.labelWidth
                        }" :isDisabled="isDisabled">
                    </form-moqup>
                </TabPane>

                <TabPane v-for="(f, index) in dataform.schema" v-if="f.formType == 'SubForm'" :key="index"
                         :label="tabLabel(f.model, f.name)">
                    <sub-form :f="f" :edit="editMode" :otherForms="otherForms"></sub-form>
                </TabPane>

                <div slot="extra">
                    <Button @click="addSubForm" :disabled="!isModelSelected && !editMode" size="small"
                            icon="md-add"> Дэд форм
                    </Button>
                </div>
            </Tabs>
        </div>
    </section>
</template>

<script>
import draggable from "vuedraggable";
import formItem from "./FormItem";
import subForm from "./SubForm";
import FormMoqup from "./FormMoqup";
import {idGenerator} from "./utils/methods";
import {getTableMeta} from "./utils/helpers";

export default {
    props: ["src", "schemaID", "editMode", "onCreate", "onUpdate"],
    components: {
        draggable,
        "form-item": formItem,
        "sub-form": subForm,
        "form-moqup": FormMoqup,
    },

    data() {
        return {
            otherForms: [],
            loadConfig: true,
            loading: false,
            //Form part
            tableList: window.init.dbSchema.tableList,
            isModelSelected: false,
            formName: null,
            dataform: {
                model: null,
                identity: null,
                timestamp: false,
                labelPosition: "top",
                labelWidth: null,
                width: "600px",
                save_btn_text: "Хадгалах",
                padding: 8,
                schema: [],
                ui: {
                    type: "normal",
                    schema: []
                },
                triggers: {
                    namespace: '',
                    insert: {
                        before: null,
                        after: null
                    },
                    update: {
                        before: null,
                        after: null
                    }
                }
            },

            //Formula data
            formula: [],
            formulaForm: {
                form: 'main',
                targets: [],
                template: "",

            },
            formulaProps: ['value', 'hidden', 'disabled'],

            formulaRule: {

                template: [
                    {
                        required: true,
                        message: "Томъёогоо оруулна уу",
                        trigger: "blur"
                    }
                ]
            },

            formulaColumns: [
                {
                    title: "Форм",
                    key: "form",
                    minWidth: 150
                },
                {
                    title: "Томъёо, Нөхцөл",
                    key: "template",
                    minWidth: 150
                },
                {
                    title: "Талбар",
                    key: "targets",
                    minWidth: 200
                },
                {
                    title: "Устгах",
                    key: "action",
                    width: 100,
                    align: "center",
                    render: (h, params) => {
                        return h("div", [
                            h(
                                "Button",
                                {
                                    props: {
                                        type: "error",
                                        size: "small"
                                    },
                                    on: {
                                        click: () => {
                                            this.removeFormula(params.index);
                                        }
                                    }
                                },
                                "Устгах"
                            )
                        ]);
                    }
                }
            ],

        };
    },

    created() {
        this.init();
    },

    methods: {
        idGenerator: idGenerator,
        //Formula functions
        addFormula() {
            this.$refs["formula"].validate(valid => {
                if (valid) {
                    //for old old version. it will use when edit
                    if (this.dataform.formula === undefined) {
                        this.dataform = {
                            ...this.dataform,
                            formula: []
                        };
                    }

                    this.dataform.formula.push({
                        targets: this.formulaForm.targets,
                        template: this.formulaForm.template,
                        form: this.formulaForm.form
                    });
                    this.formulaForm = {
                        targets: [],
                        template: "",
                        form: "main",
                    };
                }
            });
        },

        removeFormula(index) {
            this.dataform.formula.splice(index, 1);
        },

        addFormulaTarget() {

            this.formulaForm.targets.push({
                field: '',
                prop: ''
            });
        },
        deleteFormulaTarget(index) {
            this.formulaForm.targets.splice(index, 1);
        },

        async callOtherForms() {
            window.otherFormsRequestCalled = true
            if (window.otherForms) {
                this.otherForms = window.otherForms;
            } else {
                let res = await axios.get('/lambda/puzzle/schema/form');
                window.otherForms = res.data.data;
                this.otherForms = res.data.data;
            }
        },
        //Form functions
        async init() {
            if (this.$props.editMode == true) {
                this.loading = true;
                let res = await axios.get(this.$props.src + "/builder");

                try {
                    console.log(res.data);

                    this.formName = res.data.data.hasOwnProperty('name') ? res.data.data.name : res.data.data.model;
                    this.dataform = JSON.parse(res.data.data.schema);
                    await this.callOtherForms();
                    await this.updateSyncForm();

                    this.loading = false;

                } catch (e) {
                    console.log(e);
                }


            } else {
                await this.callOtherForms();
                this.loading = false;
            }
        },

        async updateSyncForm() {
            //DB field sync
            let dbSchema = getTableMeta(this.dataform.model);
            //Remove DB deleted field from schema
            let preSchema = [];
            await Promise.all(this.dataform.schema.map(async (item) => {

                let deletedField = _.find(dbSchema, {
                    model: item.model
                });

                if (typeof deletedField !== "undefined") {
                    preSchema.push({
                        ...item,
                        extra: deletedField.extra,
                        dbType: deletedField.dbType,
                        key: deletedField.key
                    })
                }

                if (item.formType == "SubForm") {
                    //DB field sync
                    let dbSchema_sub = getTableMeta(item.model);

                    //Remove DB deleted field from schema of sub
                    item.schema = item.schema.map(item_sub => {
                        let deletedField = _.find(dbSchema_sub, {
                            model: item_sub.model
                        });

                        if (typeof deletedField !== "undefined") {
                            return {
                                ...item_sub,
                                extra: deletedField.extra,
                                dbType: deletedField.dbType,
                                key: deletedField.key
                            };
                        }
                    }).filter(item => typeof item !== "undefined");
                    //Sync added DB field
                    dbSchema_sub.forEach(item_sub => {
                        let newField_sub = _.find(item.schema, {
                            model: item_sub.model
                        });
                        if (typeof newField_sub === "undefined") {
                            item.schema.push(this.setSchemaItem(item_sub));
                        }
                    });
                    preSchema.push(item);
                }
            }));


            this.dataform.schema = preSchema;

            //Sync added DB field
            dbSchema.forEach(item => {
                let newField = _.find(this.dataform.schema, {
                    model: item.model
                });
                if (typeof newField === "undefined") {
                    this.dataform.schema.push(this.setSchemaItem(item));
                }
            });

            //Checking has ui field temporary
            if (typeof this.dataform.ui == "undefined") {
                Vue.set(this.dataform, "ui", {});
                Vue.set(this.dataform.ui, "schema", []);
            }
            //Check section has visible object and visibleUserRoles
            // this.dataform.ui.schema.map(sch => {
            //     sch.children.map((c) => {
            //         if (c.type == "section" && !('visibleModelValue' in c)) {
            //             c.visibleModelValue={model:null,eq:null,value:null};
            //         }
            //         if(c.type == "section" && !('visibleUserRoles' in c))
            //         {
            //             c.visibleUserRoles= [];
            //         }
            //     });
            // });

            if (typeof this.dataform.triggers == "undefined") {
                let triggers = {
                    insert: {
                        before: null,
                        after: null
                    },
                    update: {
                        before: null,
                        after: null
                    }
                };

                Vue.set(this.dataform, "triggers", triggers);
            }

            this.dataform.schema.forEach(item => {
                this.updateSyncItem(item);
            });
        },

        updateSyncItem(item) {
            if (item)
                if (item.formType == 'Image' || item.formType == 'File') {
                    let fileProps = {
                        isMultiple: false,
                        count: 3,
                        maxSize: 2048,
                        type: 'normal'
                    };
                    if (typeof item.file == "undefined") {
                        Vue.set(item, "file", fileProps);
                    }
                }
        },

        setBuilder(table) {
            this.loading = true;
            let TableMeta = getTableMeta(table)
            this.dataform.schema = TableMeta;
            this.isModelSelected = true;
            if (this.formName == null) {
                this.formName = table;
            }

            this.dataform = {
                ...this.dataform,
                identity: null,
                sortField: null,
                sordOrder: "desc",
                timestamp: false
            };

            //Setting config schema
            this.$data.dataform.schema = this.dataform.schema.map(item => {
                return this.setSchemaItem(item);
            });

            this.loading = false;
        },

        setSchemaItem(item) {
            //Default identity field
            if (item.extra == "auto_increment" || item.key == "PRI") {
                this.dataform.identity = item.model;
                this.dataform.sortField = item.model;
            }

            //Has default value on DB
            if (item.model == "created_at" || item.model == "updated_at") {
                this.dataform.timestamp = true;
            }

            //Customized schema item
            return {
                ...item,
                id: this.idGenerator("form-item"),
                type: "form",
                formType: null,
                label: "",
                placeHolder: "",
                hidden: false,
                disabled: false,
                default: null,
                prefix: '',
                ifshowhide: "",
                rules: [],
                hasTranslation: false,
                hasUserId: false,
                hasEquation: false,
                equations: '',
                isGridSearch: false,
                gridSearch: {
                    grid: null,
                    key: null,
                    labels: null,
                    multiple: false
                },
                isFkey: false,
                relation: {
                    table: null,
                    key: null,
                    fields: [],
                    sortField: null,
                    sortOrder: "asc",
                    multiple: false,
                    filter: "",
                    parentFieldOfForm: "",
                    parentFieldOfTable: ""
                },
                span: {
                    xs: 24,
                    sm: 24,
                    md: 24,
                    lg: 24
                },
                trigger: '',
                triggerTimeout: 0,
                file: {
                    isMultiple: false,
                    count: 3,
                    maxSize: 2048,
                    type: 'normal'
                }
            };
        },

        isDisabled(item) {
            if (
                item.model == this.dataform.identity ||
                (item.model == "created_at" && this.dataform.timestamp == true) ||
                (item.model == "updated_at" && this.dataform.timestamp == true)
            ) {
                return true;
            }
            return false;
        },

        setLabelWidth(val) {
            this.dataform.labelWidth = val == "top" ? 0 : 80;
        },

        //Sub Form
        addSubForm() {
            let subForm = {
                id: idGenerator("subform"),
                identity: null,
                name: "Дэд форм",
                min_height: null,
                formType: "SubForm",
                subtype: "Grid",
                formId: null,
                parent: null,
                model: null,
                data: null,
                rule: null,
                timestamp: false,
                disableDelete: false,
                disableCreate: false,
                showRowNumber: false,
                useTableType: false,
                tableTypeColumn: "",
                tableTypeValue: "",
                span: {
                    xs: 24,
                    sm: 24,
                    md: 24,
                    lg: 24
                },
                schema: []
            };

            this.dataform.schema.push(subForm);
        },

        tabLabel(model, label) {
            return h => {
                return h("span", [
                    h("span", label.length > 18 ?
                        label.substring(0, 18 - 3) + "..." :
                        label),
                    h("Icon", {
                        props: {
                            type: "ios-close"
                        },
                        on: {
                            click: () => {
                                this.removeConfirmation(model);
                            }
                        }
                    })
                ]);
            };
        },

        removeConfirmation(model) {
            this.$Modal.confirm({
                title: "",
                content: "<p>Дэд формыг устгах уу?</p>",
                okText: "Тийм",
                cancelText: "Үгүй",
                onOk: () => {
                    this.removeSubForm(model);
                },
                onCancel: () => {
                }
            });
        },

        removeSubForm(model) {
            this.dataform.schema = this.dataform.schema.filter(
                item => item.model !== model
            );
            this.dataform.ui.schema = this.removeSubFromUI(this.dataform.ui.schema, model);
        },

        removeSubFromUI(schema, model) {
            return schema.filter(
                item => item.model !== model
            ).map(item => {
                if (item.children) {
                    item.children = this.removeSubFromUI(item.children, model)
                }
                return item
            });
        },

        optimizeForm() {
            return new Promise((resolve, reject) => {
                this.dataform = this.dataform.map(item => {
                });
                resolve(phone);
            });
        },

        //For submitting
        findAndReplace(findItem, items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].id == findItem.id) {
                    items[i] = findItem;
                } else if (_.isArray(items[i].children)) {
                    this.findAndReplace(findItem, items[i].children);
                }
            }
        },

        syncSchema() {
            this.dataform.schema.forEach(item => {
                this.findAndReplace(item, this.dataform.ui.schema);
                return item;
            });
        },

        saveForm() {
            this.syncSchema();
            let data = {
                name: this.formName,
                schema: JSON.stringify(this.dataform)
            };

            let submitUrl = this.$props.editMode
                ? this.$props.src
                : `/lambda/puzzle/schema/form`;

            axios.post(submitUrl, data).then(({data}) => {
                if (data.status) {
                    if (this.editMode) {
                        this.$Notice.success({
                            title: 'Амжилттай хадгалагдлаа',
                            desc: `"${this.formName}" формын мэдээлэл амжилттай засагдлаа.`
                        });
                    } else {
                        this.$Notice.success({
                            title: 'Амжилттай хадгалагдлаа',
                            desc: `"${this.formName}" формын мэдээлэл амжилттай хадгалагдлаа.`
                        });
                        window.history.back();
                    }
                } else {
                    this.$Notice.error({
                        title: 'Хадгалах үед алдаа гарлаа!',
                    });
                }
            });
        }
    }
};
</script>
