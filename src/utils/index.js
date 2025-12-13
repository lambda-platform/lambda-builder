export const getTableView = (tableOrView) => {

    let list = tableOrView === "table" ? window.init.dbSchema.tableList : window.init.dbSchema.viewList;
    if (window.init.project && window.init.microservices) {
        if (window.init.microservices.length >= 1) {
            let microIndex = window.init.microservices.findIndex(micro => micro.microservice_id === window.init.project.id);
            if (microIndex >= 0) {
                return tableOrView === "table" ? window.init.microservices[microIndex].tableList : window.init.microservices[microIndex].viewList;
            }
        }
    }

    return list;
}

export const checkLinkAccess = (route, router, menu) => {
    let hasAccess = false;
    menu.forEach((item) => {
        if (item.link_to == 'crud' && route.path == `/p/${item.id}`) {
            hasAccess = true;
        }

        if (item.link_to == 'noAction' && item.children.length > 0) {
            item.children.forEach((subItem) => {
                if (subItem.link_to == 'crud' && route.path == `/p/${item.id}/${subItem.id}`) {
                    hasAccess = true;
                }
            });
        }
    });

    // setTimeout(() => {
    //     if (hasAccess == false) {
    //         return router.push('/');
    //     }
    // }, 1000)
}
