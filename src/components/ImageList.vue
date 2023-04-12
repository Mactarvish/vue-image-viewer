<template>
    <div class="folder">
        <div ref="tooltip" class="tooltip" v-show="showTooltip">{{ tooltipContent }}</div>
        <!-- 注意这里，务必要在src上加上一个时间戳，否则不会在dom刷新后重新发起图片请求 -->
        <h3>{{srcDir}}</h3>
        <img v-for="srcImagePath in srcImagePaths" 
        :key="srcImagePath" 
        :src="rootUrl + srcImagePath + `?timestamp=${timestamp}`" 
        :width="width" :alt="srcImagePath"
        @mousemove="updateTooltip"
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
    directives: {
        tooltip: {
            bind(el, binding, vnode) {
                binding.src;
                el.addEventListener("mousemove", (e) => {
                    vnode.context.showTooltip = true;
                    // this.$refs.tooltip.textContent = "111";
                    e.clientX;
                    e.clientY;
                    this.tooltipContent = vnode.context.tooltipContent;
                    console.log(e.clientX, e.clientY);
                    console.log(el.src);
                    
                });
                el.addEventListener("mouseleave", (e) => {
                    e;
                    vnode.context.showTooltip = false;
                });
            },
        }

    },
    data() {
        return {
            showTooltip: false,
            tooltipContent: "",
            timestamp: new Date().getTime(),
        };
    },
    updated() {
    },
    methods: {
        getWidth() {
            const e = 200 + Math.floor(Math.random() * 100);
            return e
        },
        updateTooltip(e) {
            console.log(e.target);
        }
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