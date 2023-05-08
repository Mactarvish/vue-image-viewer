<template>
    <div ref="root" class="folder">
        <div ref="tooltip" class="tooltip" v-show="showTooltip">{{ tooltipContent }}</div>
        <!-- 注意这里，务必要在src上加上一个时间戳，否则不会在dom刷新后重新发起图片请求 -->
        <h3>{{ srcDir }}</h3>
        <div>
            <h6 style="margin: 0;"> {{ srcImagePaths[curImageIndex - 1] }}</h6>
            <img :src="rootUrl + srcImagePaths[curImageIndex - 1] + `?timestamp=${timestamp}`" :width="width" :alt="srcImagePaths[curImageIndex - 1]"
            @click="copyImagePath" @mousemove="updateTooltip" @mouseleave="closeTooltip">
        </div>
        <div class="label-bar">
            <span>当前是第 </span>
            <el-input-number size="mini" v-model="curImageIndex" :min="1" :max="srcImagePaths.length" @change="changeImage($event)"></el-input-number>
            <span> 张，共计 {{  srcImagePaths.length }} 张 </span>
        </div>
    </div>
</template>


<script>
export default {
    name: "ImageFlipper",
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
            curImageIndex: 1
        };
    },
    methods: {
        updateTooltip(e) {
            document.getElementsByClassName("el-input-number__decrease")[0].click();
            console.log("x");
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
            console.log(oriHeight, oriWidth, visHeight, visWidth, cursorX, cursorY, x, y)

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
        },
        changeImage(val) {
            console.log(val);
        }
    }
}
</script>
    
<style scoped>
.folder {
    border: solid 2px cornflowerblue;
    padding: 0 0.5rem;
    margin: 1rem;
}

.label-bar {
    /* inherits: label-bar; */
    padding-bottom: 0.5rem;
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