<template>
    <section class="form-builder">
        <div class="fb-workspace">
            <div class="fb-control fb-control-sub">
                <div class="fb-control-sub-item">
                    <Input v-model="f.name" placeholder="Формын нэр"/>
                </div>

                <div class="fb-control-sub-item">
                    <Select v-model="f.subtype" placeholder="Төрөл сонгох" clearable :disabled="isEdit"
                            @on-change="callForms">
                        <Option v-for="item in subFormType" :value="item.value" :key="item.index">
                            {{ item.label }}
                        </Option>
                    </Select>
                </div>

                <div class="fb-control-sub-item" v-if="f.subtype == 'Form'">
                    <Select v-model="f.formId" placeholder="Дэд Форм" clearable
                            filterable
                            @on-change="setBuilder">
                        <OptionGroup label="Table list">
                            <Option v-for="item in otherForms" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </OptionGroup>
                    </Select>
                </div>

                <div class="fb-control-sub-item" v-if="f.subtype != 'Form'">
                    <Select v-model="f.model" placeholder="Хүснэгт сонгох" clearable @on-change="setBuilder"
                            :disabled="isEdit">
                        <Option v-for="item in tableList" :value="item" :key="item.index">
                            {{ item }}
                        </Option>
                    </Select>
                </div>

                <div class="fb-control-sub-item">
                    <Select v-model="f.identity" placeholder="ID талбар" clearable>
                        <Option v-for="item in f.schema" :value="item.model" :key="item.index">
                            {{ item.model }}
                        </Option>
                    </Select>
                </div>

                <div class="fb-control-sub-item">
                    <Select v-model="f.parent" placeholder="Холбогдох талбар" clearable>
                        <Option v-for="item in f.schema" :key="item.index" :value="item.model">
                            {{ item.model }}
                        </Option>
                    </Select>
                </div>

                <div class="fb-control-sub-item" v-if="f.subtype != 'Form'">
                    <Input v-model="f.min_height" placeholder="min-height"/>
                </div>

                <div class="fb-control-sub-item" v-if="f.subtype != 'Form'">
                    <Checkbox v-model="f.timestamp">
                        <span>Огноо автоматаар үүсэх</span>
                    </Checkbox>

                </div>
                <div class="fb-control-sub-item">
                    <Checkbox v-model="f.disableDelete">
                        <span>Устгах үйлдэл хаах</span>
                    </Checkbox>
                    <br>
                    <Checkbox v-model="f.disableCreate">
                        <span>Нэмэх үйлдэл хаах</span>
                    </Checkbox>

                </div>
                <div class="fb-control-sub-item">
                    <Checkbox v-model="f.showRowNumber">
                        <span>Мөрийн дугаарлалт</span>
                    </Checkbox>
                    <Checkbox v-model="f.useTableType">
                        <span>Table Type хэрэглэх</span>
                    </Checkbox>
                </div>

                <div v-if="f.useTableType">
                    <Select v-model="f.tableTypeColumn" placeholder="Table Type талбар" clearable size="small">
                        <Option v-for="item in f.schema" :key="item.index" :value="item.model">
                            {{ item.model }}
                        </Option>
                    </Select>
                    <br>
                    <Input v-model="f.tableTypeValue" placeholder="Table Type утга" size="small"/>
                </div>
            </div>


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
                <div class="crud-table-body-sub">
                    <Container
                        group-name="sub-form-columns"
                        :drop-placeholder="dropPlaceholderOptions"
                        @drop="onDropSub($event)">
                        <!--form element-->
                        <Draggable v-for="(item, iIndex) in f.schema" :key="iIndex">
                            <form-item
                                :schema="f.schema"
                                :item="item"
                                :edit="edit"
                                :sub="true" :disabled="isDisabled(item)">
                            </form-item>
                        </Draggable>
                    </Container>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import {Container, Draggable} from 'vue-smooth-dnd'
import {applyDrag} from './utils/helpers'
import formItem from "./FormItem";
import {idGenerator} from "./utils/methods";
import {getTableMeta} from "./utils/helpers";

export default {
    props: ["f", "edit", "otherForms"],
    components: {
        Container, Draggable,
        "form-item": formItem
    },

    data() {
        return {
            dropPlaceholderOptions: {
                className: 'drop-preview',
                animationDuration: '150',

            },
            isEdit: false,
            tableList: window.init.dbSchema.tableList,
            isModelSelected: false,
            subFormType: [
                {
                    label: 'Форм',
                    value: 'Form'
                },
                {
                    label: 'Баазын хүснэгт',
                    value: 'Grid'
                }
            ],
            schemaItemDefaults: {
                formType: null,
                label: "",
                placeHolder: "",
                hidden: false,
                disabled: false,
                default: null,
                prefix: '',
                preStaticWord: '',
                rules: [],
                hasTranslation: false,
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
                }
            }
        };
    },

    created() {

        // if(this.f.type == "Form"){
        //   this.callOtherForms();
        // }
        this.isEdit = this.f.schema.length > 0;
        //if there is new object item it check and add
        if (this.isEdit) {
            if (this.f.subtype != 'Form') {
                this.f.schema = this.f.schema.map(item => {
                    return {
                        ...item,
                        ...Object.keys(this.schemaItemDefaults).filter(key => {
                            return !item.hasOwnProperty(key);
                        }).reduce((obj, key) => {
                            obj[key] = this.schemaItemDefaults[key];
                            return obj;
                        }, {})
                    }
                });
            }

        }

    },

    methods: {
        //Form functions
        idGenerator: idGenerator,
        onDropSub(dropResult) {

            this.f.schema = applyDrag(this.f.schema, dropResult);
        },
        callForms(val) {
            this.f.type = val
            // if (this.f.subtype == "Form") {
            //   this.callOtherForms()
            // }
        },

        // callOtherForms() {
        //     window.otherFormsRequestCalled = true
        //     if (window.otherForms) {
        //         this.otherForms = window.otherForms;
        //     } else {
        //         axios.get('/lambda/puzzle/schema/form').then(({data}) => {
        //             window.otherForms = data.data;
        //             this.otherForms = data.data;
        //         });
        //     }
        // },

        async setBuilder(val) {
            if (val) {
                if (this.f.subtype == 'Form') {

                    this.f.formId = val;

                    let res = await axios.get(`/lambda/puzzle/schema/form/${val}/builder`)

                    if (res.data.data) {
                        let formSchema = JSON.parse(res.data.data.schema);
                        this.f.schema = getTableMeta(formSchema.model);
                        this.f.model = formSchema.model;
                    }

                } else {
                    this.f.model = val;
                    this.f.schema = getTableMeta(val);
                    this.isModelSelected = true;
                }
                //Setting config schema
                this.f.schema = this.f.schema.map(item => {
                    //Default identity field
                    if (item.extra == "auto_increment" || item.key == "PRI") {
                        this.f.identity = item.model;
                    }

                    //Has default value on DB
                    if (item.model == "created_at" || item.model == "updated_at") {
                        this.f.timestamp = true;
                    }

                    //Customized schema item
                    return {
                        ...item,
                        id: this.idGenerator("form-item"),
                        ..._.cloneDeep(this.schemaItemDefaults, true)
                    };
                });
            }
        },

        isDisabled(item) {
            if (
                item.model == this.f.parent ||
                item.model == this.f.identity ||
                (item.model == "created_at" && this.f.timestamp == true) ||
                (item.model == "updated_at" && this.f.timestamp == true)
            ) {
                return true;
            }
            return false;
        },


    }
};
</script>


