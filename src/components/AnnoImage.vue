<template>
    <div >
        <img ref="img" :src="src" :width="width" @click="showImageInfo">
    </div>
</template>

<script>

export default {
    name: 'AnnoImage',
    components: {},
    props: {
        src: String,
        width: Number
    },
    data() {
        return {
        }
    },
    methods: {
        showImageInfo(e) {
            e;
            console.log(e);
            let srcImagePath = this.$refs["img"].src;
            alert(srcImagePath);
        },
    }
}
</script>

<style scoped>
    div {
        justify-content: center;
        margin: 20px;
    }
</style>

