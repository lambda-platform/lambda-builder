<template>
    <span>
    {{ Number(params.value).toLocaleString('mn-MN') + ' ₮' }}
    </span>
</template>

<script>
import Vue from "vue";

export default Vue.extend();
</script>
