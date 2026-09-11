<template>
    <section :class="`page ${$theme === 'bs' ? 'page-bs' : ''}`">
        <agent v-if="$route.params.module == 'agent'">
            <user-control slot="user-control"></user-control>
        </agent>
        <agent-form v-if="$route.params.module == 'profile'" type="profile" :withoutHeader="withoutHeader">
            <user-control slot="user-control"></user-control>
        </agent-form>

        <agent-form v-if="$route.params.module == 'password'" type="password" :withoutHeader="withoutHeader">
            <user-control slot="user-control"></user-control>
        </agent-form>

        <notif-list v-if="$route.params.module == 'notify'"/>

        <logger v-if="$route.params.module == 'logger'"/>

        <h5p v-if="$route.params.module == 'h5p'"/>

        <h5p-editor v-if="$route.params.module == 'h5p-editor'"
                    :content-id="$route.query.id"
                    @view="id => $router.push(`/module/h5p-viewer?id=${id}`)"/>

        <h5p-viewer v-if="$route.params.module == 'h5p-viewer'" :content-id="$route.query.id"/>

        <settings v-if="$route.params.module == 'settings'" :menu-id="$route.query.id"/>
    </section>
</template>

<script>
import Settings from "./settings"

export default {
    components: {Settings},
    computed: {
        withoutHeader() {
            return window.init.withoutHeader === true ? true : false;
        },
    },
};
</script>
