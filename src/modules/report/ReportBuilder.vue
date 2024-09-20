<template>
    <section class="report-builder">
        <div class="rb-workspace">
            <div id="designer-builder"></div>
        </div>
    </section>
</template>

<script>
export default {
    name: "Lambda report designer",
    mounted() {
        let designer = new MESCIUS.ActiveReportsJS.ReportDesigner.Designer("#designer-builder");
        // designer.setReport({id: "blank.rdlx-json", displayName: "my report"});

        designer.setActionHandlers({
            onCreate: function () {
                const reportId = `NewReport${++this.counter}`;
                return Promise.resolve({
                    definition: CPLReport,
                    id: reportId,
                    displayName: reportId,
                });
            },
            onOpen: function () {
                const ret = new Promise(function (resolve) {
                    resolveFunc = resolve;
                    fillReportList();
                    $("#dlgOpen").modal("show");
                    $("#dlgOpen").on("hide.bs.modal", function () {
                        $(this).off("hide.bs.modal");
                        resolveFunc = null;
                        resolve(null);
                    });
                });
                return ret;
            },
            onSave: function (info) {
                const reportId = info.id || `NewReport${++this.counter}`;
                reportStorage.set(reportId, info.definition);
                return Promise.resolve({ displayName: reportId });
            },
            onSaveAs: function (info) {
                const reportId = `NewReport${++this.counter}`;
                reportStorage.set(reportId, info.definition);
                return Promise.resolve({ id: reportId, displayName: reportId });
            },
        });
        function onSelectReport(reportId) {
            if (resolveFunc) {
                resolveFunc({
                    definition: reportStorage.get(reportId),
                    id: reportId,
                    displayName: reportId,
                });
                $("#dlgOpen").modal("hide");
                resolveFunc = null;
            }
        }
    },

    data() {
        return {}
    },

    methods: {}
};
</script>

<style>
#designer-host {
    width: 100%;
    height: 100vh;
}
</style>
