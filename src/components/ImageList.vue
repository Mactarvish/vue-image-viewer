<template>
    <div ref="root" class="folder">
        <div ref="tooltip" class="tooltip" v-show="showTooltip">{{ tooltipContent }}</div>
        <!-- 注意这里，务必要在src上加上一个时间戳，否则不会在dom刷新后重新发起图片请求 -->
        <h3>{{ srcDir }}</h3>
        <img v-for="srcImagePath in srcImagePaths" :key="srcImagePath"
            :src="rootUrl + srcImagePath + `?timestamp=${timestamp}`" :width="width" :alt="srcImagePath"
            @click="copyImagePath" @mousemove="updateTooltip" @mouseleave="closeTooltip">
    </div>
</template>


<script>
export default {
    name: "ImageList",
    props: {
        rootUrl: String,
        srcDir: String,
        srcImagePaths: Array,
        timestamp: String,
        width: {
            type: Number,
            default: 200
        }
    },
    data() {
        return {
            showTooltip: false,
            tooltipContent: "",
        };
    },
    methods: {
        updateTooltip(e) {
            let oriImagePath = e.target.src.match("(\\d{4})(.*?)(\\?)")[2];
            let oriWidth = e.target.naturalWidth;
            let oriHeight = e.target.naturalHeight;
            let visWidth = e.target.offsetWidth;
            let visHeight = e.target.offsetHeight;
            let imageRect = e.target.getBoundingClientRect();
            let cursorX = e.clientX - imageRect.x;
            let cursorY = e.clientY - imageRect.y;
            let x = parseInt(Math.round(cursorX / visWidth * oriWidth).toString());
            let y = parseInt(Math.round(cursorY / visHeight * oriHeight).toString());

            this.tooltipContent = oriImagePath + ` (${x} , ${y})`
            this.showTooltip = true;
            this.$refs.tooltip.style.top = `${e.clientY + 10}px`;
            this.$refs.tooltip.style.left = `${e.clientX + 10}px`;
        },
        closeTooltip() {
            this.showTooltip = false;
        },
        copyImagePath(e) {
            // 触发复制操作
            const b = document.createElement("button");
            b.setAttribute("class", "cb");
            let oriImagePath = e.target.src.match("(\\d{4})(.*?)(\\?)")[2];
            b.setAttribute("data-clipboard-text", oriImagePath);
            document.body.appendChild(b);
            b.click();
            b.remove();
            // 向服务器发送点击事件
            // 请求目录下的全部文件名
            let formData = new FormData();
            formData.append("clickedImagePath", e.target.src);
            let srcDirUrl = this.rootUrl + '/clickImagePath';

            this.$axios.get(srcDirUrl, {params:{ // 这里必须是params，不能是别的
                clickedImagePath: e.target.src,
            }}).then(res => {
                res;
                console.log(res.data);
                this.dirFilePathsMap = res.data;
            }).catch(reason => {
                console.log(reason);
                this.errInfo = "错误信息：" + reason + "\n" + "请检查目录是否存在";
            });
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

.tooltip {
    position: fixed;
    pointer-events: none;
    border-style: solid;
    font-size: small;
    /* max-width: 200px; */
    background-color: cornsilk;
}

img {
    margin-right: 5px;
}

h3 {
    margin: 4px 0;
}
</style>