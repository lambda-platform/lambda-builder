export const elementList = [
    {
        element: "Text",
        component:()=> import(/* webpackChunkName: "form-field-text" */'./Text.vue'),
    },
    {
        element: "Select",
        component:()=> import(/* webpackChunkName: "form-field-Select" */'./Select.vue'),
    },
    {
        element: "TreeSelect",
        component:()=> import(/* webpackChunkName: "form-field-TreeSelect" */'./TreeSelect.vue'),
    },
    {
        element: "Number",
        component:()=> import(/* webpackChunkName: "form-field-Number" */'./Number.vue'),
    },
    {
        element: "Textarea",
        component:()=> import(/* webpackChunkName: "form-field-Textarea" */'./Textarea.vue'),
    },
    {
        element: "Date",
        component:()=> import(/* webpackChunkName: "form-field-Date" */'./Date.vue'),
    },
    {
        element: "DateTime",
        component:()=> import(/* webpackChunkName: "form-field-DateTime" */'./DateTime.vue'),
    },
    {
        element: "Divider",
        component:()=> import(/* webpackChunkName: "form-field-Divider" */'./Divider.vue'),
    },
    {
        element: "Image",
        component:()=> import(/* webpackChunkName: "form-field-Image" */'./Image.vue'),
    },
    {
        element: "HTML",
        component:()=> import(/* webpackChunkName: "form-field-HTML" */'./HTML.vue'),
    },
    {
        element: "ImageSubform",
        component:()=> import(/* webpackChunkName: "form-field-ImageSubform" */'./ImageSubform.vue'),
    },
    {
        element: "ImageDrag",
        component:()=> import(/* webpackChunkName: "form-field-ImageDrag" */'./ImageDrag.vue'),
    },

    {
        element: "Checkbox",
        component:()=> import(/* webpackChunkName: "form-field-Checkbox" */'./Checkbox.vue'),
    },
    {
        element: "CK",
        component:()=> import(/* webpackChunkName: "form-field-CK" */'./CK.vue'),
    },
    {
        element: "CkOld",
        component:()=> import(/* webpackChunkName: "form-field-CK" */'./CK-old.vue'),
    },
    {
        element: "ColorPicker",
        component:()=> import(/* webpackChunkName: "form-field-ColorPicker" */'./ColorPicker.vue'),
    },
    // {
    //     element: "DateRange",
    //     component:()=> import(/* webpackChunkName: "form-field-DateRange" */'./DateRange.vue'),
    // },
    {
        element: "Email",
        component:()=> import(/* webpackChunkName: "form-field-Email" */'./Email.vue'),
    },
    {
        element: "File",
        component:()=> import(/* webpackChunkName: "form-field-File" */'./File.vue'),
    },
    {
        element: "Download",
        component:()=> import(/* webpackChunkName: "form-field-Download" */'./Download.vue'),
    },
    {
        element: "Geographic",
        component:()=> import(/* webpackChunkName: "form-field-Geographic" */'./Geographic.vue'),
    },
    {
        element: "Hidden",
        component:()=> import(/* webpackChunkName: "form-field-Hidden" */'./Hidden.vue'),
    },
    {
        element: "Map",
        component:()=> import(/* webpackChunkName: "form-field-Map" */'./Map.vue'),
    },
    {
        element: "Money",
        component:()=> import(/* webpackChunkName: "form-field-Money" */'./Money.vue'),
    },
    {
        element: "MoneyWithoutCurrency",
        component:()=> import(/* webpackChunkName: "form-field-Money" */'./MoneyWithoutCurrency.vue'),
    },
    {
        element: "NumberGenerate",
        component:()=> import(/* webpackChunkName: "form-field-NumberGenerate" */'./NumberGenerate.vue'),
    },
    {
        element: "Password",
        component:()=> import(/* webpackChunkName: "form-field-Password" */'./Password.vue'),
    },
    {
        element: "PasswordGenerate",
        component:()=> import(/* webpackChunkName: "form-field-PasswordGenerate" */'./PasswordGenerate.vue'),
    },
    {
        element: "Radio",
        component:()=> import(/* webpackChunkName: "form-field-Radio" */'./Radio.vue'),
    },
    {
        element: "RadioWithThumb",
        component:()=> import(/* webpackChunkName: "form-field-Radio" */'./RadioWithThumb.vue'),
    },
    {
        element: "FooterButton",
        component:()=> import(/* webpackChunkName: "form-field-FooterButton" */'./FooterButton.vue'),
    },
    {
        element: "RadioWithTextInput",
        component:()=> import(/* webpackChunkName: "form-field-RadioWithTextInput" */'./RadioWithTextInput.vue'),
    },
    {
        element: "Register",
        component:()=> import(/* webpackChunkName: "form-field-Register" */'./Register.vue'),
    },
    {
        element: "ISelect",
        component:()=> import(/* webpackChunkName: "form-field-ISelect" */'./ISelect.vue'),
    },
    {
        element: "Search",
        component:()=> import(/* webpackChunkName: "form-field-Search" */'./Search.vue'),
    },
    // {
    //     element: "Slider",
    //     component:()=> import(/* webpackChunkName: "form-field-Slider" */'./Slider.vue'),
    // },
    {
        element: "Switch",
        component:()=> import(/* webpackChunkName: "form-field-Switch" */'./Switch.vue'),
    },
    {
        element: "Time",
        component:()=> import(/* webpackChunkName: "form-field-Time" */'./Time.vue'),
    },
    {
        element: "QGis",
        component:()=> import(/* webpackChunkName: "form-field-QGis" */'./QGis.vue'),
    },
    // {
    //     element: "UniqueGeneration",
    //     component:()=> import(/* webpackChunkName: "form-field-UniqueGeneration" */'./UniqueGeneration.vue'),
    // },
    {
        element: "JsonEditor",
        component:()=> import(/* webpackChunkName: "form-field-AdminMenu" */'./JsonEditor.vue'),
    },
    {
        element: "AdminMenu",
        component:()=> import(/* webpackChunkName: "form-field-AdminMenu" */'./AdminMenu.vue'),
    },
    {
        element: "GridSelector",
        component:()=> import(/* webpackChunkName: "form-field-GridSelector" */'./GridSelector.vue'),
    },
    {
        element: "subform/Grid",
        component:()=> import(/* webpackChunkName: "form-field-sub-form-grid" */'./subform/Grid.vue'),
    },
    {
        element: "subform/Form",
        component:()=> import(/* webpackChunkName: "form-field-sub-form" */'./subform/Form.vue'),
    },
];

const Notfount = ()=> import(/* webpackChunkName: "form-field-not-fount" */'./NotFound.vue');
const CustomElement = ()=> import(/* webpackChunkName: "form-field-CustomElement" */'./CustomElement.vue');

const requireCustomElement = (type)=>{

    if(window.init.data_form_custom_elements){
        let custom = window.init.data_form_custom_elements.find(custom_element=>custom_element.element == type);
        if (custom) {

            try {
                return require(`dataform_custom/${type}.vue`).default;
            }
            catch (exception_var) {
                console.log(exception_var);
                return CustomElement;
            }
        }else {
            // throw `${type} element not fount`
            return Notfount;
        }

    } else {
        return Notfount;
    }
}

export const element = (type) => {
    if (type !== null && typeof type !== "undefined") {
        const elIndex = elementList.findIndex(el=>el.element == type);

        if(elIndex >= 0){
            return elementList[elIndex].component;
        }
    }

    return requireCustomElement(type);
}
