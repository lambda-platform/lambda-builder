<template>
    <tr>
        <td class="row-number" v-if="f.showRowNumber">
            <slot name="rowNumber"></slot>
        </td>
        <td v-for="item in f.schema"
            v-if="typeof item.formType !== 'undefined' && item.formType !== null && item.model && !item.hidden && item.model!=f.identity && item.model!=f.parent && item.model!='updated_at'&& item.model!='created_at'"
            :key="item.index">
            <!--{{item.hidden}}-->
            <!--{{item.model}}-->
            <component :is="element(item.formType)"
                       :model="{form: model, component: item.model}"
                       v-if="model"
                       size="small"
                       :label="item.label ? item.label : `[${item.model}]`"
                       :meta="setMeta(item)"
                       :relation_data="item.relation.filter == '' || typeof item.relation.filter === 'undefined' ? relations[item.relation.table] ? relations[item.relation.table]['data'] : [] :relations[item.model] ? relations[item.model]['data'] : []">
            </component>
        </td>
        <td class="action" >
            <slot name="action"></slot>
        </td>
    </tr>
</template>

<script>
    import {element} from "../index";
    import {getRule} from "../../rule";
    import {doFormula, doTrigger} from "../../utils/formula_and_trigger.js";

    export default {
        props: ["f", "model", "editMode", "relations", "formula"],
        created() {

            this.f.data = {};
            this.f.schema.forEach(item => {

                if (this.f.identity == item.model || item.formType == null) {
                    return;
                }
                if (
                    this.f.timestamp &&
                    (item.model == "created_at" || item.model == "updated_at")
                ) {
                    return;
                }
                if (this.editMode) {
                    this.setModel(item.model, this.model[item.model], item.formType);
                } else {
                    this.setModel(item.model, item.default, item.formType);
                }

                this.$watch("model." + item.model, {
                    handler: (value, oldValue) => {
                        this.afterChange(item.model, value, oldValue);
                    },
                    deep: true
                });
            });
        },

        methods: {
            element: element,
            setModel(name, value, type) {
                switch (type) {
                    case "Switch":
                        let val = false;
                        if (value == "true" || value == 1) {
                            val = true;
                        }
                        this.model[name] = val_;
                        this.f.data[name] = val_;
                        break;
                    case "Checkbox":
                        let val_ = false;
                        if (value == "true" || value == 1) {
                            val_ = true;
                        }
                        this.model[name] = val_;
                        this.f.data[name] = val_;
                        break;
                    default:
                        this.f.data[name] = value;
                }
            },

            setMeta(item) {
                delete item["table"];
                delete item["rules"];
                delete item["label"];
                delete item["span"];
                delete item["default"];
                // item.schemaId = this.$route.params.id;
                // if (this.$route.params.form) {
                //     console.log(this.$route.params.form)
                //     item.schemaID = this.$route.params.form;
                // }
                // else {
                //     console.log(this.$route.params.id)
                //     item.schemaID = this.$route.params.id;
                // }
                return item;
            },

            getSchemaIndex(model) {
                return this.f.schema.findIndex(item => item.model == model);
            },

            afterChange(model, val, oldValue) {
                doTrigger(model, val, this.model, this.f.schema, this.$refs, this.$Notice);
                doFormula(this.formula, model, this.model, this.f.schema, this.f.rule, this.f.model);
            }
        }
    };
</script>

