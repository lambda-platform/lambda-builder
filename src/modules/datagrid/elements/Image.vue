<template>
    <div>
        <div v-if="multiImage" class="multi-images">
            <img v-for="item in images" :key="item.name" :src="`${baseUrl}${item.response}`" class="ag-grid-image-multi"/>
            <span class="image-plus" v-if="plusCount > 1">+{{ plusCount }}</span>
        </div>
        <div v-else>
            <img v-if="params.value == null" :src="`${baseUrl}/assets/lambda/images/no-image.png`" class="ag-grid-image"/>
            <img v-else :src="`${baseUrl}${params.value}`" class="ag-grid-image"/>
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
            plusCount: 0
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
                    } else {
                        this.multiImage = false;
                    }
                } catch (e) {
                    this.multiImage = false;
                }
                return this.params.baseUrl ? this.params.baseUrl : ""
            }
        }
    }
);
</script>
