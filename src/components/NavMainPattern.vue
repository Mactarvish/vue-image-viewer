<template>
    <whole>
        <nav>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </nav>
        <main>
            <h1>练习flex规则</h1>
            <p>
                box-sizing 属性允许您以特定的方式定义匹配某个区域的特定元素，默认值是content-box，设置或检索对象的盒模型组成模式，对应的脚本特性为boxSizing。
                <br>box-sizing是CSS3的box属性之一。一说到CSS的盒模型（Box model）我想很多人都会比较烦，特别是对于新手，然而这个Box model又是我们CSS运用中比较重要的一个属性。
            </p>
            <div class="create-time">创建时间：2023.02.05</div>
        </main>
    </whole>
</template>


<script>


export default {
    name: "NavMainPattern",
    components: {
    },
    props: {
        aaa: String
    },
    data() {

    },
};
</script>

<style scoped>
    whole { 
        /* display: flex; */
        /* flex-direction: row; */
        height: 100vh;
        position: relative;
    }
    /* main {
        text-align: left;
        display: flex;
        flex-direction: column;
        padding: 2rem;
    }

    h1 {
        padding-bottom: 1rem;
    }
    .create-time {
        border-top: auto;
    } */
</style>