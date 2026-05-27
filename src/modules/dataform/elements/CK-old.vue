<template>
    <FormItem :prop=rule :label=label>
        <vue-ckeditor ref="ckeditor" v-model="model.form[model.component]" :config="config" @blur="onBlur($event)"
                      @focus="onFocus($event)"/>
    </FormItem>
</template>

<script>
import VueCkeditor from 'vue-ckeditor2';

export default {
    props: ["label", "model", "rule", "meta", "cdn"],
    components: {VueCkeditor},
    data() {
        return {
            mini: [
                [
                    "Undo",
                    "Redo",
                    "-",
                    "Find",
                    "Replace",
                    "-",
                    "SelectAll",
                    "RemoveFormat"
                ],
                [
                    "Bold",
                    "Italic",
                    "Underline",
                    "Strike",
                    "-",
                    "Subscript",
                    "Superscript"
                ],
                ["NumberedList", "BulletedList", "-", "Outdent", "Indent"],
                ["JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"]
            ],
            article: [
                [
                    "Undo",
                    "Redo",
                    "-",
                    "Find",
                    "Replace",
                    "-",
                    "SelectAll",
                    "RemoveFormat"
                ],
                [
                    "Bold",
                    "Italic",
                    "Underline",
                    "Strike",
                    "-",
                    "Subscript",
                    "Superscript"
                ],
                ["NumberedList", "BulletedList", "-", "Outdent", "Indent"],
                [
                    "JustifyLeft",
                    "JustifyCenter",
                    "JustifyRight",
                    "JustifyBlock"
                ],
                ["Link", "Unlink"],
                ["Image", "Table", "HorizontalRule"],
                ["Styles", "Format", "Font", "FontSize"],
                ["TextColor", "BGColor", "video"]
            ],
            full: []
        };
    },
    computed: {
        config() {
            const params =
                (this.cdn?.remote && this.cdn?.user_dir)
                    ? `&org=${this.cdn.org}&user=${this.cdn.user}`
                    : '';

            // const params = 'user_123';

            switch (this.meta.editorType) {
                case "mini":
                    return {
                        toolbar: this.mini,
                        height: 250,
                        readOnly: this.meta && this.meta.disabled ? this.meta.disabled : false
                    };
                case "article":
                    return {
                        toolbar: this.article,
                        height: 250,
                        filebrowserBrowseUrl: `/vendor/filemanager/dialog.php?type=2&editor=ckeditor&fldr=${params}`,
                        filebrowserUploadUrl: `/vendor/filemanager/dialog.php?type=2&editor=ckeditor&fldr=${params}`,
                        filebrowserImageBrowseUrl: `/vendor/filemanager/dialog.php?type=1&editor=ckeditor&fldr=${params}`,
                        readOnly
                :
                    this.meta && this.meta.disabled ? this.meta.disabled : false,
                        extraPlugins
                :
                    'video'
            }
            ;
        default:
            return {
                height: 350,
                filebrowserBrowseUrl: `/vendor/filemanager/dialog.php?type=2&editor=ckeditor&fldr=${params}`,
                filebrowserUploadUrl: `/vendor/filemanager/dialog.php?type=2&editor=ckeditor&fldr=${params}`,
                filebrowserImageBrowseUrl: `/vendor/filemanager/dialog.php?type=1&editor=ckeditor&fldr=${params}`,
                readOnly: this.meta && this.meta.disabled ? this.meta.disabled : false,
                extraPlugins: 'video,youtube,tweetabletext'
            };
        }
        }
    },
    created() {
        console.log(this.cdn);
    },
    methods: {
        onBlur(editor) {
        },
        onFocus(editor) {
        }
    }
};
</script>
