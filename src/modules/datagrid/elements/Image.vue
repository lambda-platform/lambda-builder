<template>
    <div class="image-box">
        <div v-if="multiImage" class="multi-images">
            <img v-for="item in images" :key="item.name" :src="`${baseUrl}${item.response}`" class="ag-grid-image-multi zoom"/>
            <span class="image-plus zoom" v-if="plusCount > 1">+{{ plusCount }}</span>
        </div>
        <div v-else>
            <img :src="`${baseUrl}${this.params.value ? this.params.value : '/assets/lambda/images/no-image.png'}`" class="ag-grid-image zoom"/>
        </div>
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
    data() {
        return {
            images: [],
            multiImage: false,
            plusCount: 0,
            defaultImage: null,
        };
    },
    computed: {
        baseUrl() {
            try {
                let jsonData = JSON.parse(this.params.value);
                if (Array.isArray(jsonData)) {
                    this.multiImage = true;
                    if (jsonData.length <= 4) {
                        this.images = jsonData;
                    } else {
                        this.images = jsonData.slice(0, 3);
                        this.plusCount = jsonData.length - 3;
                    }
                }
            } catch (e) {
            }
            return this.params.baseUrl ? this.params.baseUrl : ""
        }
    }
});
</script>
<style>
.image-box{
    height: 60px;
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.zoom {
    transition: transform .2s;
}

.zoom:hover {
    transform: scale(1.5);
}
</style>
