<template>
    <div>
        <div v-if="multiImage" class="multi-images">
            <img v-for="item in images" :key="item.name" :src="`${baseUrl}${item.response}`"
                 class="ag-grid-image-multi"/>
            <span class="image-plus" v-if="plusCount > 1">+{{ plusCount }}</span>
        </div>
        <img v-else :src="`${baseUrl}${this.params.value ? this.params.value : '/assets/lambda/images/no-image.png'}`"
             @click="isZoom = true"
             class="ag-grid-image"/>

        <Modal v-model="isZoom" class="grid-zoom-image-modal">
            <div slot="close">
                <a href="javascript:void(0)" class="grid-image-close-btn" @click="isZoom = false;"><i class="ti-close"></i></a>
            </div>
            <p slot="header"></p>
            <div class="grid-zoom-image">
                <img :src="`${baseUrl}${this.params.value ? this.params.value : '/assets/lambda/images/no-image.png'}`" />
            </div>
            <div slot="footer"></div>
        </Modal>
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
            isZoom: false
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
