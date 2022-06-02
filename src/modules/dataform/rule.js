let ruleModel = null;
let identityColumn = null;
let identity = null;

const isValid = (val) => {
    if (typeof val !== undefined && val != null && val != "") {
        return true;
    }
    return false;
}

export const setModel = (model) => {
    ruleModel = model;
}

export const setIdentity = (column, value) => {
    identity = value;
    identityColumn = column;
}

export const rules = [{
    type: 'required',
    msg: 'Талбарыг бөглөнө үү!'
},
    {
        type: 'email',
        msg: 'Имэйл хаягаа зөв оруулна уу!'
    },
    {
        type: 'number',
        msg: 'Тоон утга оруулна уу!'
    },
    {
        type: 'unique',
        msg: 'Давхацсан утга оруулсан байна!'
    }
];

const unique = (rule, value, callback) => {
    axios.post(`/lambda/krud/unique`, {
        table: ruleModel,
        identityColumn: identityColumn,
        identity: identity,
        field: rule.field,
        val: value
    }).then(o => {
        if (o.data.status) {
            callback();
        } else {
            callback(new Error(o.data.msg));
        }
    })
};
const check_current_password = (rule, value, callback) => {
    axios.post(`/lambda/krud/check_current_password`, {
        password: value
    }).then(o => {
        if (o.data.status) {
            callback();
        } else {

            callback(new Error(o.data.msg));
        }
    })
};


export const getRule = (rule) => {
    switch (rule.type) {
        case 'required':
            return {
                required: true,
                message: rule.msg
            }
        case 'min':
            return {
                type: 'string',
                min: parseInt(rule.val, 10),
                message: rule.msg
            }
        case 'max':
            return {
                type: 'string',
                min: parseInt(rule.val, 10),
                message: rule.msg
            }
        case 'email':
            return {
                type: 'email',
                message: rule.msg
            }
        case 'number':
            return {
                type: 'number',
                message: rule.msg
            }
        case 'unique':
            return {
                validator: unique,
                trigger: 'blur',
                // message: rule.msg
            }
        case 'check_current_password':
            return {
                validator: check_current_password,
                trigger: 'blur',
                // message: rule.msg
            }
        default:
            return null;

    }
}
