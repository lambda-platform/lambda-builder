/**
 * Хостын i18n-д h5p namespace байхгүй (хуучин build) үед fallback
 * утгыг ашиглана — түлхүүр нүцгэнээрээ харагдахаас сэргийлнэ.
 */
export function makeLang(vm, fallbacks) {
    return Object.keys(fallbacks).reduce((obj, key) => {
        obj[key] = vm.$te && vm.$te("h5p." + key)
            ? vm.$t("h5p." + key)
            : fallbacks[key];
        return obj;
    }, {});
}
