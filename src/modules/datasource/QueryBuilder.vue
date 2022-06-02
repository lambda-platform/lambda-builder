<template>
    <div></div>
</template>


<script>
// import { getFields, getQuery } from "./utils/queryGenerator.js";
//
// import sqlFormatter from "sql-formatter";
import "./scss/_query_builder.scss";

window.jQuery = require("jquery");
require("dot");
require("jQuery-QueryBuilder");
window.SQLParser = require('sql-parser/browser/sql-parser');
require("./utils/queryBuilder.i18.mn.js");

export default {
    props: ["fields", "query"],
    mounted() {
        this.doFilter();
    },
    watch: {
        fields() {
            this.doFilter();
        }
    },
    methods: {

        getFilterType(type) {
            // console.log(type, type.toString().indexOf('date'))

            if (type.indexOf("int") >= 0) {
                return "integer";
            }
            if (type.indexOf("float") >= 0 || type.indexOf("doable") >= 0) {
                return "double";
            }
            if (type.indexOf("date") >= 0) {
                return "date";
            }
            if (type.indexOf("datetime") >= 0) {
                return "datetime";
            }
            if (type.indexOf("time") >= 0) {
                return "time";
            }
            return "string";
        },

        doFilter() {
            console.log("===============")
            let filters = this.$props.fields.map(field => {
                return {
                    id: field.model,
                    label: field.model,
                    type: this.getFilterType(field.dbType)
                };
            });

            if (filters.length >= 1) {
                jQuery(this.$el).queryBuilder({
                    filters: filters,
                    icons: {
                        add_rule: "ivu-icon ivu-icon-plus",
                        add_group: "ivu-icon ivu-icon-plus-circled",
                        remove_group: "ivu-icon ivu-icon-trash-b",
                        remove_rule: "ivu-icon ivu-icon-trash-b",
                        error: "ivu-icon ivu-icon-trash-b"
                    }
                });

                if (this.$props.query) {
                    let rules = jQuery(this.$el).queryBuilder(
                        "getRulesFromSQL",
                        this.$props.query
                    );
                    if (rules != null) {
                        jQuery(this.$el).queryBuilder("setRules", rules);
                    }
                }

                jQuery(this.$el).on("rulesChanged.queryBuilder", e => {
                    this.$emit(
                        "change",
                        jQuery(this.$el).queryBuilder("getSQL", false)
                    );
                });
            }
        }
    },
    data() {
        return {};
    },
    computed: {}
};
</script>
