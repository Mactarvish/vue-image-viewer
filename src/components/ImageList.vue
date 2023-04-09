<template>
    <div class="folder">
        <!-- 注意这里，务必要在src上加上一个时间戳，否则不会在dom刷新后重新发起图片请求 -->
        <h3>{{srcDir}}</h3>
        <img v-for="srcImagePath in srcImagePaths" 
        :key="srcImagePath" 
        :src="rootUrl + srcImagePath + `?timestamp=${new Date().getTime()}`" 
        :width="width" :alt="srcImagePath"
        v-tooltip="srcImagePath"
        :popper-options="{ modifiers: { offset: { offset: ({ width, height }) => [0, -height / 2] } } }" 
        >
    </div>
</template>


<script>
export default {
    name: "ImageList",
    props: {
        rootUrl: String,
        srcDir: String,
        srcImagePaths: Array,
        width: {
            type: Number,
            default:200
        }
    },
    data() {
        return {
        };
    },
    updated() {
    },
    methods: {
        getWidth() {
            const e = 200 + Math.floor(Math.random() * 100);
            return e
        },
    }
}
</script>
    
<style>
.folder {
    border: solid 2px cornflowerblue;
    padding: 0 0.5rem;
    margin: 1rem;
}

img {
    margin-right: 5px;
}

h3 {
    margin: 4px 0;
}
</style>