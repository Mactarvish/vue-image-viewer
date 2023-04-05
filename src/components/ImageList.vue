<template>
    <div class="show">
        <div class="folder">
            <h3>11111</h3>
            <div class="img-table">
                <img :src="testPath" width="200" alt="312213">
                <img :src="testPath" width="200" alt="312213">
            </div>
        </div>
        <div class="folder">
            <h3>11111</h3>
            <div class="img-table">
                <img :src="testPath" width="200" alt="312213">
                <img :src="testPath" width="200" alt="312213">
            </div>
        </div>
    </div>
</template>


<script>
export default {
    name: "ImageList",
    props: {

    },
    data() {
        return {
            testPath: require("@/assets/bee.png")
        };
    }

}
</script>
    
<style>
div.show {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
}

.img-table {
}

.folder {
    border: solid 2px cornflowerblue;
    padding: 0.5rem;
    margin: 1rem;
}

h3 {
    margin: 4px 0;
}
</style>