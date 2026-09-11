/**
 * Must load FIRST in H5PIntegration.editor.assets.js (before the merged
 * editor bundle). CKEditor normally autodetects its base path from its own
 * <script src="...ckeditor.js"> tag, but the package merges ckeditor.js into
 * one hashed bundle, so detection fails and plugin assets resolve relative
 * to the page URL (/h5p/plugins/... → 404). Works in the parent page (reads
 * own H5PIntegration) and in the editor iframe (reads parent's).
 */
(function () {
    try {
        var integration = window.H5PIntegration
            || (window.parent && window.parent.H5PIntegration);
        if (integration && integration.editor && integration.editor.libraryUrl) {
            window.CKEDITOR_BASEPATH = integration.editor.libraryUrl + 'ckeditor/';
        }
    } catch (e) {
        // cross-origin parent — leave CKEditor to its own detection
    }
})();
