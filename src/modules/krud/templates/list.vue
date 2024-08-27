<template>
    <section class="list-template">
        <div :class="`crud-page ${hideHeader ? 'no-header' : '' }`">
            <!--            <div class="crud-page-header">-->
            <!--                <div v-if="hasNavSlot" class="krud-left">-->
            <!--                    <div class="crud-page-header-left">-->
            <!--                        <slot name="nav"></slot>-->
            <!--                    </div>-->
            <!--                </div>-->

            <!--                <div v-else class="crud-page-header-left">-->
            <!--                    <i v-if="$props.icon" :class="icon"></i>-->
            <!--                    <h3 v-if="$props.title">{{ $props.title.replace(/-/g, ' ') }}</h3>-->
            <!--                    <slot name="nav"></slot>-->
            <!--                </div>-->

            <!--                <div class="crud-page-header-right">-->
            <!--                    <div class="tool-options">-->
            <!--                        <slot name="tooloptions"></slot>-->
            <!--                    </div>-->
            <!--                    <krudtools :search="search"-->
            <!--                               :refresh="refresh"-->
            <!--                               :exportExcel="exportExcel"-->
            <!--                               :print="print"-->
            <!--                               :save="save"-->
            <!--                               :isPrint="isPrint"-->
            <!--                               :isExcel="isExcel"-->
            <!--                               :isRefresh="isRefresh"-->
            <!--                               :isSave="isSave"-->
            <!--                               :isSearch="isSearch"-->
            <!--                    />-->
            <!--                    <slot name="right"></slot>-->
            <!--                </div>-->
            <!--            </div>-->

            <krud-header-bs v-if="$theme == 'bs'"
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
                <template v-slot="right">
                    <slot name="right"></slot>
                </template>
            </krud-header-bs>

            <krud-header v-else
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
<!--                <slot name="right"></slot>-->
            </krud-header>

            <div class="crud-page-body">
                <div class="v-nav" v-if="hasVNavSlot">
                    <slot name="v-nav"></slot>
                </div>
                <div class="dg-flex">
                    <datagrid ref="grid"
                              :schemaID="grid"
                              :paginate="50"
                              :fnEdit="edit"
                              :fnQuickEdit="quickEdit"
                              :fnView="view"
                              :hideInfo="$props.hideInfo ? $props.hideInfo : false"
                              :hasSelection="typeof $props.hasSelection === undefined ? false : $props.hasSelection"
                              :onRowSelect="$props.onRowSelect"
                              :actions="$props.actions"
                              :permissions="$props.permissions"
                              :user_condition="$props.user_condition? $props.user_condition :null"
                              :custom_condition="$props.custom_condition? $props.custom_condition :null"
                              :dblClick="$props.dbClickAction"
                              :liveData="$props.liveData">
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
        </div>
    </section>
</template>

<script>
import mixins from "./mixins";
import krudHeader from "../components/krud-header.vue";
import krudHeaderBs from "../components/krud-header-bs.vue";

export default {
    components: {
        "krud-header": krudHeader,
        "krud-header-bs": krudHeaderBs
    },
    mixins: [mixins],
};
</script>
