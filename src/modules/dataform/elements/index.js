export const elementList = [
    {
        element: "Text",
    },
    {
        element: "Select",
    },
    {
        element: "TreeSelect",
    },
    {
        element: "Number",
    },
    {
        element: "Textarea",
    },
    {
        element: "BirthdayPicker",
    },
    {
        element: "Date",
    },
    {
        element: "DateTime",
    },
    {
        element: "Divider",
    },
    {
        element: "Image",
    },
    {
        element: "ImageSubform",
    },
    {
        element: "ImageDrag",
    },

    {
        element: "Checkbox",
    },
    {
        element: "CK",
    },
    {
        element: "ColorPicker",
    },
    {
        element: "DateRange",
    },
    {
        element: "Email",
    },
    {
        element: "File",
    },
    {
        element: "Download",
    },
    {
        element: "Geographic",
    },
    {
        element: "QGis",
    },
    {
        element: "Hidden",
    },
    {
        element: "Map",
    },
    {
        element: "Money",
    },
    {
        element: "NumberGenerate",
    },
    {
        element: "Password",
    },
    {
        element: "PasswordGenerate",
    },
    {
        element: "Radio",
    },
    {
        element: "RadioWithTextInput",
    },
    {
        element: "Register",
    },
    {
        element: "ISelect",
    },
    {
        element: "Search",
    },
    {
        element: "Slider",
    },
    {
        element: "Switch",
    },
    {
        element: "Time",
    },
    {
        element: "TimeMask",
    },
    {
        element: "UniqueGeneration",
    },
    {
        element: "AdminMenu",
    },
];

export const element = (type) => {
    if (type !== null && typeof type !== "undefined") {
        try {
            return require(`./${type}.vue`).default;
        } catch (e) {
            if (window.init.data_form_custom_elements) {
                let custom = window.init.data_form_custom_elements.find(custom_element => custom_element.element == type);
                if (custom) {
                    return require(`dataform_custom/${type}.vue`).default;
                } else
                    throw e;
            } else {
                throw e;
            }
        }
    }
}
