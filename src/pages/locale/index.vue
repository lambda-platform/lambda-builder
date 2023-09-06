<template>
    <section class="page page-locale">
        <div class="page-locale-nav">
            <div class="page-locale-nav-inner">
                <h3>Хэлний тохиргоо</h3>
                <ul>
                    <li>
                        <router-link to="/locale/language">Хэл</router-link>
                    </li>
                    <li>
                        <router-link to="/locale/group">Орчуулгын бүлэг</router-link>
                    </li>
                    <li>
                        <router-link to="/locale/translation">Орчуулга</router-link>
                    </li>
                </ul>
            </div>
        </div>
        <router-view/>
    </section>
</template>

<script>
export default {
    name: "index",
    data() {
        return {
            loading: true,
        }
    }
}
</script>

<style scoped>

</style>
