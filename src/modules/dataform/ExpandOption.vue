<template>
    <div class="expand">
        <Tabs :animated="false" size="small" class="expand-tab">
            <TabPane label="Үндсэн тохиргоо">
                <Row type="flex">
                    <Col :xs="12">
                        <div class="title">
                            <h3>Нэмэлт утгууд</h3>
                        </div>
                        <ul>
                            <li v-if="item.formType == 'Image'">
                                <label>Олон зураг сонгох эсэх</label>
                                <i-switch v-model="item.file.isMultiple" size="small"></i-switch>
                            </li>

                            <li v-if="item.formType == 'CK'">
                                <label>Editor-н төрөл</label>
                                <Select v-model="item.editorType" placeholder="Editor-н төрөл">
                                    <Option v-for="editor in editorTypes" :key="editor.index" :value="editor.type">
                                        {{ editor.label }}
                                    </Option>
                                </Select>
                            </li>
                            <li>
                                <label>Placeholder</label>
                                <Input v-model="item.placeHolder"
                                       :placeholder="item.placeHolder == '' ? item.label : item.placeHolder"/>
                            </li>
                            <li>
                                <label>Анхдагч утга</label>
                                <Input v-model="item.default" placeholder="Анхдагч утга"/>
                            </li>
                            <li>
                                <label>Параметрээс утга авах</label>
                                <Input v-model="item.param" placeholder="Параметрийн нэр"/>
                            </li>
                            <li>
                                <label>Хэрэглэгчийн ID авах эсэх</label>
                                <i-switch v-model="item.hasUserId" size="small"></i-switch>
                            </li>
                        </ul>

                        <div class="title">
                            <h3>Нэгтгэл томьёо</h3>
                        </div>
                        <ul>
                            <li>
                                <label>Нэгтгэж харуулах эсэх</label>
                                <i-switch v-model="item.hasEquation" size="small"></i-switch>
                            </li>

                            <li v-if="item.hasEquation">
                                <label>Томьёо сонгох</label>
                                <Select v-model="item.equations" placeholder="Томьёо төрөл">
                                    <Option v-for="equation in equations" :key="equation.index" :value="equation">
                                        {{ equation }}
                                    </Option>
                                </Select>
                            </li>
                            <li v-if="item.hasEquation">
                                <label>Нэгтгэлийн өмнө үг авах бол /Жнь Нийт:, Тоо: гм/</label>
                                <Input v-model="item.preStaticWord" placeholder="Тэмдэг"/>
                            </li>
                            <li v-if="item.hasEquation">
                                <label>Нэгтгэлийн дараа тэмдэг авах бол /Жнь %, $, ₮ гм/</label>
                                <Input v-model="item.prefix" placeholder="Тэмдэг"/>
                            </li>
                        </ul>
                    </Col>

                    <!-- Rule set -->
                    <Col :xs="12" :sm="12" :md="8" :lg="8">
                        <div class="title">
                            <h3>Шалгах нөхцөлүүд</h3>
                        </div>

                        <div class="rule-control">
                            <Select v-model="item.rules" placeholder="Өгөгдөл шалгах хэлбэр" filterable multiple>
                                <Option v-for="r in validationRules" :value="r" :key="r.index">{{ r.type }}</Option>
                            </Select>
                        </div>

                        <ul class="rule-msg-list">
                            <li v-for="r in item.rules" :key="r.index">
                                <label>[{{ r.type }}]</label>
                                <span><Input v-model="r.msg"/></span>
                            </li>
                        </ul>

                        <div class="title" v-if="item.formType == 'Password'">
                            <h3>Нүүц үгийн тохиргоо</h3>
                        </div>
                        <ul v-if="item.formType == 'Password'">
                            <li>
                                <label>Нууц үг баталгаажуулах</label>
                                <i-switch v-model="item.passwordOption.confirm" size="small"></i-switch>
                            </li>

                            <li>
                                <label>Нууц үг үүсгэх</label>
                                <i-switch v-model="item.passwordOption.generate" size="small"></i-switch>
                            </li>
                            <li>
                                <label>Засварлах үед нууц үг шалгах</label>
                                <i-switch v-model="item.passwordOption.edit_with_old_password" size="small"></i-switch>
                            </li>
                        </ul>

                        <div class="title" v-if="item.formType == 'Number'">
                            <h3>Орны нарийвчлал</h3>
                        </div>
                        <ul class="rule-msg-list" v-if="item.formType == 'Number'">
                            <li>
                                <Input v-model="item.precision" placeholder="Орны нарийвчлал"/>
                            </li>
                        </ul>

                    </Col>
                </Row>
            </TabPane>

            <TabPane label="Өгөгдөл тохируулах"
                     v-if="item.formType == 'Select' || item.formType == 'ISelect' || item.formType == 'TreeSelect' || item.formType == 'Radio' || item.formType == 'AdminMenu'">
                <Row type="flex">
                    <Col span="24">
                        <div class="title">
                            <h3>
                                Баазаас утга авах эсэх:
                                <i-switch v-model="item.isFkey" size="small"></i-switch>
                            </h3>
                            <h3>
                                Олон утга сонгох /multiple/:
                                <i-switch v-model="item.relation.multiple" size="small"></i-switch>

                            </h3>
                        </div>

                        <div v-if="!item.isFkey" class="localSelectOptions">
                            <Form ref="option" :model="optionForm" :rules="optionRule" inline>
                                <FormItem prop="value">
                                    <Input type="text" v-model="optionForm.value" placeholder="Утга"
                                    />
                                </FormItem>
                                <FormItem prop="model">
                                    <FormItem prop="label">
                                        <Input type="text" v-model="optionForm.label" placeholder="Харагдах үг"
                                        />
                                    </FormItem>
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" @click="addOption">
                                        {{ `${$static_words ? $static_words.add : 'Нэмэх'}` }}
                                    </Button>
                                </FormItem>
                            </Form>

                            <Table border size="small" :columns="optionsColumns"
                                   :data="item.options ? item.options : []"
                                   height="250"></Table>
                        </div>

                        <ul v-if="item.isFkey">
                            <li>
                                <label>Хүснэгт</label>
                                <Select v-model="item.relation.table" placeholder="Хүснэгт сонгох" clearable
                                        filterable
                                        :disabled="!item.isFkey" @on-change="relationSchema">
                                    <OptionGroup label="Table list">
                                        <Option v-for="item in tableList" :value="item" :key="item.index">{{
                                                item
                                            }}
                                        </Option>
                                    </OptionGroup>
                                    <OptionGroup label="View list">
                                        <Option v-for="item in viewList" :value="item" :key="item.index">{{
                                                item
                                            }}
                                        </Option>
                                    </OptionGroup>
                                </Select>
                            </li>
                            <li>
                                <label>Холбогдох талбар</label>
                                <Select v-model="item.relation.key" placeholder="Холбогдох талбар" clearable
                                        filterable
                                        :disabled="!item.isFkey">
                                    <Option v-for="item in relSchema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>
                            <li>
                                <label>Харагдах талбарууд </label>
                                <Select v-model="item.relation.fields" placeholder="Талбарууд сонгох" clearable
                                        filterable
                                        multiple :disabled="!item.isFkey">
                                    <Option v-for="item in relSchema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>

                            <li>
                                <label>Эрэмбэлэх талбар</label>
                                <Select v-model="item.relation.sortField" placeholder="Талбарууд сонгох" clearable
                                        filterable
                                        :disabled="!item.isFkey">
                                    <Option v-for="item in relSchema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>
                            <li>
                                <label></label>
                                <RadioGroup v-model="item.relation.sortOrder">
                                    <Radio label="asc" :disabled="!item.isFkey">
                                        <Icon type="arrow-up-c"></Icon>
                                        <span>A-Z</span>
                                    </Radio>
                                    <Radio label="desc" :disabled="!item.isFkey">
                                        <Icon type="arrow-down-c"></Icon>
                                        <span>Z-A</span>
                                    </Radio>
                                </RadioGroup>
                            </li>
                            <li>
                                <label>Эцэг багана (Формд байгаа)</label>
                                <Select v-model="item.relation.parentFieldOfForm" placeholder="Эцэг багана"
                                        clearable filterable
                                        :disabled="!item.isFkey">
                                    <Option v-for="item in schema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>
                            <li>
                                <label>Эцэг багана (Энэ Хүснэгтийн)</label>
                                <Select v-model="item.relation.parentFieldOfTable" placeholder="Эцэг багана"
                                        clearable
                                        filterable :disabled="!item.isFkey">
                                    <Option v-for="item in relSchema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>
                        </ul>

                        <div class="title" v-if="item.isFkey">
                            <h3>Өгөгдөл нэмэх товч харуулах
                                <i-switch v-model="item.relation.addAble" size="small"
                                          @on-change="callForms"></i-switch>
                            </h3>
                        </div>
                        <ul v-if="item.relation.addAble">
                            <li>
                                <label>Өгөгдөл нэмэх Форм</label>
                                <Select v-model="item.relation.addFrom" placeholder="Өгөгдөл нэмэх Форм" clearable
                                        filterable
                                        :disabled="!item.isFkey" @on-change="relationSchema">
                                    <OptionGroup label="Table list">
                                        <Option v-for="item in otherForms" :value="item.id" :key="item.id">{{
                                                item.name
                                            }}
                                        </Option>
                                    </OptionGroup>
                                </Select>
                            </li>
                        </ul>

                        <div class="title" v-if="item.isFkey">
                            <h3>Холбоосийн нөхцөл </h3>
                        </div>
                        <query-builder v-if="item.isFkey && relSchema.length >= 1" @change="changeItemFilter"
                                       :query="item.relation.filter"
                                       :fields="relSchema"/>

                        <div class="title" v-if="item.isFkey  && relSchema.length >= 1">
                            <h3>Холбоосийн нөхцөл (Хэрэглэгчээс авах)</h3>
                        </div>
                        <div>
                            <Row>
                                <Col span="10">
                                    <Select v-model="optionSelectFilterWithUser.userField" filterable
                                            placeholder="Хэрэглэгчийн багана">
                                        <Option v-for="item in user_fields" :value="item" :key="item">{{ item }}
                                        </Option>
                                    </Select>
                                </Col>
                                <Col span="10">
                                    <Select v-model="optionSelectFilterWithUser.tableField" filterable
                                            placeholder="Шүүлт хийх багана">
                                        <Option v-for="item in relSchema" :value="item.model" :key="item.model">
                                            {{ item.model }}
                                        </Option>
                                    </Select>
                                </Col>
                                <Col span="4">
                                    <Button type="primary" shape="circle" icon="md-add"
                                            @click="addSelectUserFilter"></Button>
                                </Col>
                            </Row>

                            <Row v-for="(condition, index) in item.relation.filterWithUser" :key="index">
                                <Col span="10">
                                    {{ condition.userField }}
                                </Col>
                                <Col span="10">
                                    {{ condition.tableField }}
                                </Col>
                                <Col span="4">
                                    <Button type="primary" shape="circle" icon="ios-trash"
                                            @click="deleteSelectUserFilter(index)"></Button>
                                </Col>
                            </Row>

                        </div>
                    </Col>
                </Row>
            </TabPane>

            <TabPane label="Триггер">
                <Row type="flex">
                    <Col span="10">
                        <ul>
                            <div class="title">
                                <h3>Триггер |
                                    <small>Серверээс дуудах</small>
                                </h3>
                            </div>
                            <span>
                                <label>Триггер (өгөгдөл дуудах URL)</label>
                                <Input v-model="item.trigger" placeholder="Гох"/>
                            </span>
                            <span>
                                <label>Триггер дуудах хугацаа </label>
                                <Input v-model="item.triggerTimeout" placeholder="trigger Timeout"/>
                            </span>
                        </ul>
                    </Col>

                    <Col span="14">
                        <h4>Серверээс буцаах өгөдлийн жишээ</h4>
                        <pre class="trigger-example">
                            {
                              "schema": [
                                {
                                  "field": "country",
                                  "value": "Mongolia",
                                  "props": {
                                    "disabled": true
                                  }
                                }
                              ],
                              "message": {
                                "type": "success",
                                "message": "Амжилтай"
                              },
                              "info":[
                                {
                                   "target":"target_id",
                                    "html":"info_by_html"
                                }
                              ]
                            }</pre>
                    </Col>
                </Row>
            </TabPane>

            <TabPane label="Мэдээллийн холбоос">
                <Row type="flex">
                    <Col span="10">
                        <ul>
                            <div class="title">
                                <h3>Мэдээллийн холбоос</h3>
                            </div>
                            <span>
                                <label>Мэдээллийн холбоос дуудах URL (https://host/data/)</label>
                                <Input v-model="item.info_url" placeholder="Мэдээллийн холбоос дуудах URL"/>
                            </span>

                        </ul>
                    </Col>
                </Row>
            </TabPane>

            <TabPane label="Хүснэгтээс утга авах /searchable input/" v-if="item.formType == 'Search'">
                <Row type="flex">
                    <Col span="24">
                        <div class="title">
                            <h3>Хүснэгтээс утга авах</h3>
                            <i-switch v-model="item.isGridSearch" size="small"></i-switch>
                        </div>
                        <ul>
                            <li>
                                <Checkbox v-model="item.gridSearch.multiple" :disabled="!item.isGridSearch">
                                    <span>Олон утга сонгох</span>
                                </Checkbox>
                            </li>
                            <li>
                                <Select v-model="item.gridSearch.grid" placeholder="Утга авах хүснэгт" clearable
                                        filterable
                                        :disabled="!item.isGridSearch" @on-change="searchGridSchema">
                                    <Option v-for="item in this.gridList" :value="item.id" :key="item.index">{{
                                            item.name
                                        }}
                                    </Option>
                                </Select>
                            </li>
                            <li>
                                <label>Утга буцаах талбар</label>
                                <Select v-model="item.gridSearch.key" placeholder="Утга буцаах талбар" clearable
                                        filterable
                                        :disabled="!item.isGridSearch">
                                    <Option v-for="item in searchSchema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>
                            <li>
                                <label>Харагдах талбарууд</label>
                                <Select v-model="item.gridSearch.labels" placeholder="Талбарууд сонгох" clearable
                                        filterable
                                        multiple :disabled="!item.isGridSearch">
                                    <Option v-for="item in searchSchema" :value="item.model" :key="item.index">{{
                                            item.model
                                        }}
                                    </Option>
                                </Select>
                            </li>
                        </ul>
                    </Col>
                </Row>
            </TabPane>

            <TabPane label="GeoGraphic" v-if="item.formType == 'Geographic'">
                <div style="padding: 20px">
                    <h3>
                        Geographic тохиргоо
                    </h3>
                    <hr>
                    <Row :gutter="16">
                        <Col span="8">
                            <div>
                                <h4>Атрибут (шинж чанарууд)</h4>
                                <Input v-model="item.GeographicOption.attributes" type="textarea" :autosize="true"
                                       placeholder="Атрибут (шинж чанарууд)"></Input>

                            </div>
                        </Col>


                        <Col span="8">
                            <div>
                                <h4>Геометрийн төрөл</h4>
                                <RadioGroup v-model="item.GeographicOption.geometryType" class="">
                                    <Radio label="point">

                                        <span>Point</span>
                                    </Radio>
                                    <Radio label="line">

                                        <span>Line</span>
                                    </Radio>
                                    <Radio label="polygon">

                                        <span>Polygon</span>
                                    </Radio>
                                </RadioGroup>
                            </div>
                        </Col>
                    </Row>

                    <Row :gutter="16">
                        <Col span="8">
                            <div>
                                <h4>Төвийн уртраг</h4>
                                <Input v-model="item.GeographicOption.center.lng"></Input>
                                <h4>Төвийн өргөрөг</h4>
                                <Input v-model="item.GeographicOption.center.lat"></Input>
                            </div>
                        </Col>

                        <Col span="8">
                            <div>
                                <h4>Газрын зургийн томруулалт 1-20</h4>
                                <Slider v-model="item.GeographicOption.zoom" :min="1" :max="20"
                                        :tip-format="formatZoom"
                                        style="width: 100%"></Slider>
                            </div>
                        </Col>
                        <Col span="8">
                            <div>
                                <h4>Суур зураг</h4>
                                <RadioGroup v-model="item.GeographicOption.baseMap" class="">
                                    <Radio :label="0">

                                        <span>Google Гудамж</span>
                                    </Radio>
                                    <Radio :label="1">

                                        <span>Google Сансрын</span>
                                    </Radio>
                                    <Radio :label="2">

                                        <span>Open Street Map</span>
                                    </Radio>
                                </RadioGroup>
                            </div>
                        </Col>
                    </Row>

                    <Row :gutter="16">
                        <Col span="4">
                            <div>

                                <h4>Талбайн давхцал шалгах</h4>
                                <Checkbox v-model="item.GeographicOption.checkByArea">Талбайн давхцал шалгах
                                </Checkbox>
                            </div>
                        </Col>

                        <Col span="4">
                            <div v-if="item.GeographicOption.checkByArea">
                                <h4>Feature layer url</h4>
                                <Input v-model="item.GeographicOption.featureLayerUrl"
                                       placeholder="Feature layer url"></Input>
                            </div>
                        </Col>
                        <Col span="16">
                            <div v-if="item.GeographicOption.checkByArea">
                                <h4>Хайлт хийх талбар (GIS)</h4>
                                <Input v-model="item.GeographicOption.searchField"
                                       placeholder="Хайлт хийх талбар"></Input>
                            </div>
                            <div v-if="item.GeographicOption.checkByArea">
                                <h4>Хайлтын утга авах талбар (FORM)</h4>
                                <Input v-model="item.GeographicOption.formValueField"
                                       placeholder="Хайлт хийх талбар"></Input>
                            </div>
                            <div v-if="item.GeographicOption.checkByArea">
                                <h4>Success message</h4>
                                <Input v-model="item.GeographicOption.successMsg"
                                       placeholder="Success message"></Input>
                            </div>

                            <br>
                            <div v-if="item.GeographicOption.checkByArea">
                                <h4>Error message</h4>
                                <Input v-model="item.GeographicOption.errorMsg"
                                       placeholder="Error message"></Input>
                            </div>
                        </Col>
                    </Row>
                </div>
            </TabPane>

            <TabPane label="QGis" v-if="item.formType == 'QGis'">
                <div style="padding: 20px">
                    <Row v-if="item.qgisOptions">
                        <Col span="8">
                            <Input v-model="item.qgisOptions.service" placeholder="Geo Service"/>
                        </Col>
                        <Col span="8">
                            <Input v-model="item.qgisOptions.link" placeholder="Давхаргын холбоос"/>
                        </Col>

                        <Col span="24">
                            <div class="title">
                                <h3>Зургийн баазын мэдээлэл</h3>
                            </div>
                        </Col>

                        <Col span="8">
                            <Input v-model="item.qgisOptions.cTable" placeholder="Зургийн хүснэгт"/>
                        </Col>
                        <Col span="8">
                            <Input v-model="item.qgisOptions.cShapeField" placeholder="Зургийн мэдээлэлтэй талбар"/>
                        </Col>
                        <Col span="8">
                            <Input v-model="item.qgisOptions.cAttr" placeholder="Давхаргын холбогдох attr"/>
                        </Col>

                        <Col span="24">
                            <div class="title">
                                <h3>Давхаргын attribute & баазын холбоос</h3>
                            </div>
                        </Col>
                        <Col span="24">
                            <div class="qgis-attrs">
                                <div class="localSelectOptions">
                                    <Form ref="qgis-option" :model="optionForm" :rules="optionRule" inline>
                                        <FormItem prop="value">
                                            <Input type="text" v-model="optionForm.value"
                                                   placeholder="Layer attribute-н нэр"/>
                                        </FormItem>
                                        <FormItem prop="label">
                                            <Select v-model="optionForm.label" filterable
                                                    clearable
                                                    placeholder="Утга оноох талбар">
                                                <Option v-for="item in schema" :value="item.model"
                                                        :key="item.model">
                                                    {{ item.label ? item.label : item.model }}
                                                </Option>
                                            </Select>
                                        </FormItem>
                                        <FormItem prop="label">
                                            {{ optionForm.label }}
                                        </FormItem>
                                        <FormItem>
                                            <Button type="primary" @click="addQgisOption">
                                                {{ `${$static_words ? $static_words.add : 'Нэмэх'}` }}
                                            </Button>
                                        </FormItem>
                                    </Form>

                                    <Table border size="small" :columns="qgisColumns"
                                           :data="item.qgisOptions.attrList"
                                           height="250"></Table>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
import {elementList} from "./elements";
import {rules} from "./rule";
import {getTableMeta} from "./utils/helpers";

export default {
    props: ["item", "edit", "sub", "schema"],
    components: {},
    data() {
        return {
            expendPart: '1',
            loadConfig: true,
            tableList: window.init.dbSchema.tableList,
            viewList: window.init.dbSchema.viewList,
            elementList: elementList,
            gridList: window.init.gridList,
            relSchema: [],
            searchSchema: [],
            validationRules: _.cloneDeep(rules),
            otherForms: [],
            user_fields: window.init.user_fields,
            editorTypes: [
                {
                    type: "mini",
                    label: "Mini"
                },
                {
                    type: "article",
                    label: "Article"
                },
                {
                    type: "full",
                    label: "Full editor"
                }
            ],
            equations: [
                "SUM",
                "COUNT",
                "MIN",
                "MAX",
                "AVG"
            ],
            optionForm: {
                value: null,
                label: null
            },
            optionRule: {
                value: [
                    {
                        required: true,
                        message: "Утга оруулна уу",
                        trigger: "blur"
                    }
                ],
                label: [
                    {
                        required: true,
                        message: "Харагдах үг оруулна уу",
                        trigger: "blur"
                    }
                ]
            },
            optionsColumns: [
                {
                    title: "Утга",
                    key: "value",

                },
                {
                    title: "Харагдах үг",
                    key: "label",

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
                                            this.removeOption(params.index);
                                        }
                                    }
                                },
                                "Устгах"
                            )
                        ]);
                    }
                }
            ],
            optionSelectFilterWithUser: {
                userField: null,
                tableField: null,
            },

            qgisColumns: [
                {
                    title: "QGis attribute",
                    key: "value",

                },
                {
                    title: "Баазын талбарын нэр",
                    key: "label",
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
                                            this.removeQgisOption(params.index);
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

    async created() {
        if (this.$props.edit) {
            this.updateSyncItem(this.$props.item);
            this.validationRules = this.validationRules.map(v => {
                let r = this.item.rules.find(r => r.type == v.type);
                return r == undefined ? v : r;
            });
        } else {
            if (this.item.rules.length == 0) {
                this.item.rules.push(this.validationRules[0]);
            }
        }

        if (this.$props.item.isFkey && this.$props.item.relation.table !== null) {
            this.relationSchema(this.$props.item.relation.table);
        }

        if (
            this.$props.item.isGridSearch &&
            this.$props.item.gridSearch.grid !== null
        ) {
            this.searchGridSchema(this.$props.item.gridSearch.grid);
        }

        if (!this.item.options) {
            this.item.options = [];
        }

        /*FOR OLD VB SCHEMA*/
        if (this.item.formType == 'Geographic') {
            if (!this.item.GeographicOption) {
                this.item.GeographicOption = {
                    attributes: "",
                    geometryType: 'point',
                    zoom: 8,
                    center: {
                        lat: 47.91876971846709,
                        lng: 106.91736415028574
                    },
                    baseMap: 0,
                    checkByArea: false,
                    featureLayerUrl: '', //feature layer url
                    featureTitles: '', // title,desc,author
                    searchField: '',
                    formValueField: '',
                    successMsg: '',
                    errorMsg: ''
                }
            }
        }

        if (this.item.formType == 'QGis') {
            if (this.item.qgisOptions == undefined) {
                this.item.qgisOptions = {
                    service: "",
                    cTable: "",
                    cShapeField: "",
                    cAttr: "",
                    link: "",
                    attrList: []
                }
            }
        }

        if (this.item.formType == 'Image') {
            if (this.item.file.isMultiple == undefined) {
                this.item.file.isMultiple = false
            }
        }

        if (this.item.formType == 'Number') {
            if (this.item.precision == undefined) {
                this.item.precision = 0;
            }
        }

        if (this.item.formType == 'Password') {
            if (!this.item.passwordOption) {
                this.item.passwordOption = {
                    generate: false,
                    confirm: false,
                    edit_with_old_password: false
                }
            }
        }
        /*FOR OLD VB SCHEMA*/
    },

    methods: {
        addOption() {
            this.$refs["option"].validate(valid => {
                if (valid) {
                    this.optionForm.label = trim(this.optionForm.label);

                    this.item.options.push({...this.optionForm});
                    this.optionForm = {
                        value: null,
                        label: null
                    };
                }
            });
        },

        removeOption(index) {
            this.item.options.splice(index, 1);
        },

        addQgisOption() {
            console.log(this.optionForm);
            this.$refs["qgis-option"].validate(valid => {
                if (valid) {
                    this.item.qgisOptions.attrList.push({...this.optionForm});
                    this.optionForm = {
                        value: null,
                        label: null
                    };
                    console.log(this.item.qgisOptions.attrList);
                }
            });
        },

        removeQgisOption(index) {
            this.item.qgisOptions.attrList.splice(index, 1);
        },

        formatZoom(val) {
            return 'Zoom: ' + val;
        },

        updateSyncItem(item) {
            //Grid search
            if (
                item.formType !== "subform" &&
                typeof item.gridSearch == "undefined"
            ) {
                item.isGridSearch = false;
                item.gridSearch = {
                    grid: null,
                    key: null,
                    labels: null,
                    multiple: false
                };
            }

            //CK editor
            if (
                item.formType == "CK" &&
                typeof item.editorType == "undefined"
            ) {
                item.editorType = this.editorTypes[0].type;
            }

            //Query builder
            if (item.formType == "Select" || item.formType == "!Select") {
                this.relationSchema(item.relation.table);
            }
        },

        //Preparing table meta for relation fields
        relationSchema(table) {
            this.relSchema = getTableMeta(table);
        },

        searchGridSchema(val) {
            let searchGridItem = this.gridList.filter(
                item => item.id === val
            )[0];
            this.searchSchema = JSON.parse(searchGridItem.schema).schema;
        },

        //Filter event
        changeItemFilter(query) {
            if (query) {
                this.$props.item.relation.filter = query.sql;
            } else {
                this.$props.item.relation.filter = undefined;
            }
        },

        callForms() {
            if (window.otherForms) {
                this.otherForms = window.otherForms;
            } else {
                axios.get('/lambda/puzzle/schema/form').then(({data}) => {
                    window.otherForms = data.data;
                    this.otherForms = data.data;
                });
            }
        },

        addSelectUserFilter() {
            if (!this.$props.item.relation.filterWithUser) {
                this.$props.item.relation.filterWithUser = [];
            }
            this.$props.item.relation.filterWithUser.push({
                userField: this.optionSelectFilterWithUser.userField,
                tableField: this.optionSelectFilterWithUser.tableField,
            });

            this.optionSelectFilterWithUser = {
                userField: null,
                tableField: null,
            };
        },
        deleteSelectUserFilter(index) {
            this.$props.item.relation.filterWithUser.splice(index, 1);
        },
    },
};
</script>
