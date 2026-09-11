/**
 * H5P editor AJAX patch.
 *
 * Loaded last in H5PIntegration.editor.assets.js so it runs after
 * h5peditor-init.js in BOTH the parent page and the editor iframe
 * (the iframe re-runs the whole asset list and would otherwise
 * restore the stock getAjaxUrl).
 *
 * - 'files' uploads must go to the signed per-nonce route
 *   (api/hh5p/files/{nonce}) instead of ajaxPath + 'files'.
 * - every other editor AJAX call gets the JWT appended as _token,
 *   which the QueryToken middleware promotes to an Authorization header.
 */
(function () {
    if (!window.H5PEditor) {
        return;
    }

    var stock = window.H5PEditor.getAjaxUrl;

    window.H5PEditor.getAjaxUrl = function (action, parameters) {
        var integration = window.H5PIntegration || {};

        if (action === 'files' && integration.filesAjaxPath) {
            return integration.filesAjaxPath;
        }

        var url;
        if (stock) {
            url = stock(action, parameters);
        } else {
            url = integration.editor.ajaxPath + action;
        }

        if (integration.token) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + '_token=' + integration.token;
        }

        return url;
    };
})();
