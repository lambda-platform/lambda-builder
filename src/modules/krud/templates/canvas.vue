<template>
    <section class="offcanvas-template">
        <div class="crud-page">
            <krud-header-bs v-if="$theme == 'bs'"
                            :open-form="openPanel"
                            :title="title"
                            :permissions="permissions"
                            :search="search"
                            :refresh="refresh"
                            :exportExcel="exportExcel"
                            :print="print"
                            :save="save"
                            :isPrint="isPrint"
                            :isExcel="isExcel"
                            :isRefresh="isRefresh"
                            :isSave="isSave"
                            :isSearch="isSearch">
                <template slot="tooloptions">
                    <slot name="tooloptions"></slot>
                </template>

                <template slot="header-left">
                    <slot name="left"></slot>
                </template>

                <template slot="right">
                    <slot name="right"></slot>
                </template>
            </krud-header-bs>

            <krud-header v-else :open-form="openPanel"
                         :title="title"
                         :permissions="permissions"
                         :search="search"
                         :refresh="refresh"
                         :exportExcel="exportExcel"
                         :print="print"
                         :save="save"
                         :isPrint="isPrint"
                         :isExcel="isExcel"
                         :isRefresh="isRefresh"
                         :isSave="isSave"
                         :isSearch="isSearch">
                <template slot="tooloptions">
                    <slot name="tooloptions"></slot>
                </template>
                <template slot="right">
                    <slot name="right"></slot>
                </template>
            </krud-header>


            <div class="crud-page-body">
                <div class="v-nav" v-if="hasVNavSlot">
                    <slot name="v-nav"></slot>
                </div>

                <div class="dg-flex">
                    <datagrid v-if="permissions ? permissions.r : true" ref="grid"
                              :schemaID="grid"
                              :paginate="50"
                              :fnClone="clone"
                              :fnEdit="edit"
                              :fnQuickEdit="quickEdit"
                              :fnView="view"
                              :hideInfo="$props.hideInfo ? $props.hideInfo : false"
                              :actions="$props.actions"
                              :dblClick="$props.dbClickAction"
                              :onRowSelect="onRowSelectedEvent"
                              :hasSelection="hasSelection"
                              :permissions="permissions"
                              :on-filter-change="onFilterChange"
                              :page_id="page_id"
                              :custom_condition="$props.custom_condition? $props.custom_condition :null"
                              :user_condition="user_condition ? user_condition.gridCondition : null">

                        <template slot="dg-footer-start">
                            <slot name="dg-footer-start"></slot>
                        </template>

                        <template slot="dg-footer-mid">
                            <slot name="dg-footer-mid"></slot>
                        </template>

                        <template slot="dg-footer-end">
                            <slot name="dg-footer-end"></slot>
                        </template>
                    </datagrid>
                </div>
            </div>

            <slide-panel v-model="openSlidePanel" :widths="[form_width ? form_width :'1024px']"
                         @close="closePanel" :closeByBtn="true" :withCrudLog="withCrudLog">
                <div :class="withCrudLog && editMode ? 'with-crud-log' : ''" style="height: 100%">
                    <dataform ref="form"
                              :schemaID="form"
                              :title="title"
                              :url="url"
                              :editMode="editMode"
                              mode="refresh"
                              :onSuccess="onSuccess"
                              :onReady="onReady"
                              :do_render="openSlidePanel"
                              :permissions="permissions"
                              :page_id="page_id"
                              :user_condition="user_condition ? user_condition.formCondition : null"
                              :onError="onError"
                              :close="closePanel"
                    />
                    <crud-log v-if="withCrudLog && editMode" :form="form" :rowId="rowId" :grid="grid"/>
                </div>
            </slide-panel>
        </div>
    </section>
</template>

<script>
import slidePanel from "../components/slidePanel";
import krudHeader from "../components/krud-header.vue";
import krudHeaderBs from "../components/krud-header-bs.vue";
import crudLog from "../components/crudLog";
import mixins from "./mixins";

export default {
    mixins: [mixins],
    data() {
        return {
            form_width: '800px',
            openSlidePanel: false,
            exportLoading: false
        };
    },
    created() {
        console.log("on FILTER", this.onFilter);
    },
    components: {
        "slide-panel": slidePanel,
        "crud-log": crudLog,
        "krud-header": krudHeader,
        "krud-header-bs": krudHeaderBs
    },
    computed: {
        lang() {
            const labels = [
                '_add',
                'Information_viewing_history', 'excelUpload'
            ];
            return labels.reduce((obj, key, i) => {
                obj[key] = this.$t('crud.' + labels[i]);
                return obj;
            }, {});
        },

    },
    methods: {
        templateEdit() {
            this.openSlidePanel = true;
        },

        templateOnSuccess() {
            this.openSlidePanel = false;
        },

        templateOnError() {
            // this.openSlidePanel = false;
        },

        onReady(formOption) {
            if (formOption.width.includes("%")) {
                this.form_width = formOption.width;
            } else {
                if (!formOption.width.includes("px")) {
                    this.form_width = formOption.width + 'px';
                }
            }
        },

        openPanel() {
            this.openSlidePanel = true;
            this.editMode = false;
        },

        closePanel() {
            this.openSlidePanel = false;
            this.rowId = null;
        }
    },
};
</script>
