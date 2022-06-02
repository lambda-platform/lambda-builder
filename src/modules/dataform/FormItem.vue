<template>
    <Row :class="`crud-table-row ${ expanded ? 'active' : ''}`" v-on:dblclick="expanded = !expanded">
        <Col span="5">
            <strong>{{ item.model }}
                <small class="key">{{ item.key != "" ? `[${item.key}]` : '' }}</small>
            </strong>
        </Col>
        <Col span="5">
            <Input v-model="item.label" :placeholder="item.model" :disabled="disabled"/>
        </Col>
        <Col span="4">
            <Select v-model="item.formType" placeholder="Төрөл" clearable filterable :disabled="disabled"
                    @on-change="changeItemType">
                <Option v-for="item in elementList" :value="item.element" :key="item.index">{{ item.element }}
                </Option>
            </Select>
        </Col>
        <Col span="2" class="center">
            <i-switch v-model="item.hidden" size="small" :disabled="disabled" @on-change="setHiddenProp"></i-switch>
        </Col>
        <Col span="2" class="center">
            <i-switch v-model="item.disabled" size="small" :disabled="disabled"></i-switch>
        </Col>
        <Col span="2" class="center">
            <i-switch v-model="item.hasTranslation" size="small" :disabled="disabled"></i-switch>
        </Col>
        <Col span="3" class="center">
            <a href="javascript:void(0)"
               :class="`expand-toggle ${ expanded ? 'active' : ''} ${ disabled ? 'disabled' : '' }`"
               @click="expanded = !expanded" :disabled="disabled">
                <Icon type="ios-arrow-down"></Icon>
            </a>
        </Col>
        <Col span="24" :class="`item-more-options ${ expanded ? 'active' : '' }`">
            <expand-option :item="item" :edit="edit" :sub="sub" :schema="schema"></expand-option>
        </Col>
    </Row>
</template>

<script>
import expandOption from "./ExpandOption";
import {elementList} from "./elements";
import {rules} from "./rule";

export default {
    props: ["item", "edit", "sub", "disabled", "schema"],
    components: {
        "expand-option": expandOption
    },
    data() {
        let elements = window.init.data_form_custom_elements ? [...elementList, ...window.init.data_form_custom_elements.map(element => {
            return element
        })] : elementList;
        return {
            loadConfig: true,
            elementList: elements,
            expanded: false
        };
    },
    created() {
        if (this.item.formType == null) {
            this.item.formType = 'Text';
        }
    },
    methods: {
        setHiddenProp(val) {
            if (val) {
                this.item.rules = [];
            }
        },

        changeItemType() {
            if (this.item.formType == 'Geographic') {
                if (!this.item.GeographicOption) {
                    this.item.GeographicOption = {
                        attributes: "",
                        allowMultiGeometryTypes: true,
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
                        searchFieldPlaceHolder: ''

                    }
                }
            } else {
                this.item.GeographicOption = undefined;
            }
            if (this.item.formType == 'Image') {
                if (this.item.file.isMultiple == undefined) {
                    this.item.file.isMultiple = false
                }
            } else {
                if (this.item.file) {
                    this.item.file.isMultiple = undefined;
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
            } else {
                this.item.passwordOption = undefined;
            }
        }
    }
};
</script>


