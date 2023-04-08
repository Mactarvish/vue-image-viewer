<template>
    <div class="folder">
        <h3>{{srcDir}}</h3>
        <img v-for="srcImagePath in srcImagePaths" 
        :key="srcImagePath" :src="rootUrl + srcImagePath" :width="width" :alt="srcImagePath">
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
            testPath: require("@/assets/bee.png")
        };
    }

}
</script>
    
<style>
.folder {
    border: solid 2px cornflowerblue;
    padding: 0.5rem;
    margin: 1rem;
}

img {
    margin-right: 5px;
}

h3 {
    margin: 4px 0;
}
</style>