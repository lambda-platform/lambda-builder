/**
 * H5P asset loader — editor/viewer компонентуудын хамтарсан хэрэгсэл.
 * H5P нь window түвшний global-уудтай (H5P, H5PEditor, H5PIntegration) тул
 * asset бүрийг апп-ийн амьдралын мөчлөгт НЭГ л удаа ачаална.
 */

const loadedAssets = new Set();

function loadCss(href) {
    if (loadedAssets.has(href)) return;
    loadedAssets.add(href);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
}

function loadJs(src) {
    if (loadedAssets.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            loadedAssets.add(src);
            resolve();
        };
        script.onerror = () => reject(new Error("H5P asset load failed: " + src));
        document.head.appendChild(script);
    });
}

/** css-ийг зэрэг, js-ийг ДАРААЛЛААР нь ачаална (H5P-д дараалал чухал) */
export async function loadH5PAssets({ css = [], js = [] }) {
    css.forEach(loadCss);
    for (const src of js) {
        await loadJs(src);
    }
}

/**
 * window.H5PIntegration-ийг шинэ settings-ээр шинэчилнэ.
 * contents-ийг нь нийлүүлдэг тул нэг хуудсан дээр олон контент үзэж болно.
 */
export function mergeH5PIntegration(settings) {
    const prev = window.H5PIntegration || {};
    window.H5PIntegration = Object.assign({}, prev, settings, {
        contents: Object.assign({}, prev.contents || {}, settings.contents || {}),
    });
}
