import Vue from 'vue';

/**
 * Цэсний мөрийг байгууллагаар харуулах тохиргоо (config lambda.menu_org_visibility).
 * Байгууллагын жагсаалтыг бүх MenuItem нэг л удаа татаж хуваалцана.
 * Тохиргоо идэвхгүй бол null буцаана — талбар гарахгүй.
 */
export function orgVisibilityConfig() {
    const cfg = window.lambda && window.lambda.menu_org_visibility;
    return cfg && cfg.enabled ? cfg : null;
}

export const orgState = Vue.observable({ list: [], loading: false, loaded: false });

export function loadOrgOptions() {
    const cfg = orgVisibilityConfig();
    if (!cfg || orgState.loaded || orgState.loading) return;
    orgState.loading = true;
    axios.post('/lambda/puzzle/get_options', {
        relations: {
            orgs: {
                table: cfg.table || 'organization',
                key: cfg.value || 'id',
                fields: [cfg.label || 'short_name'],
            },
        },
    }).then(({ data }) => {
        orgState.list = (data && data.orgs) || [];
        orgState.loaded = true;
    }).catch(() => {
        orgState.list = [];
    }).finally(() => {
        orgState.loading = false;
    });
}
