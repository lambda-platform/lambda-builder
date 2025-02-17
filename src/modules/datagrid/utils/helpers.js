export const applyDrag = (arr, dragResult) => {
    const { removedIndex, addedIndex, payload } = dragResult
    if (removedIndex === null && addedIndex === null) return arr

    const result = [...arr]
    let itemToAdd = payload

    if (removedIndex !== null) {
        itemToAdd = result.splice(removedIndex, 1)[0]
    }

    if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd)
    }

    return result
}
export const generateItems = (count, creator) => {
    const result = []
    for (let i = 0; i < count; i++) {
        result.push(creator(i))
    }
    return result
}
export const getTableMeta = (table)=>{
    if(table) {
        table = table.split(".").pop();
        if (window.init.dbSchema.tableMeta[table]) {
            return window.init.dbSchema.tableMeta[table]
        }
    }
    return []
    // let res = await axios.get(`/lambda/puzzle/table-schema/${table}`);
    // if(!window.init.dbSchema.tableMeta) {
    //     window.init.dbSchema.tableMeta = {}
    // }
    // window.init.dbSchema.tableMeta[table] = res.data
    // return res.data
}
