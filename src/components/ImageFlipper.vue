<template>
    <div ref="root" class="folder">
        <div ref="tooltip" class="tooltip" v-show="showTooltip">{{ tooltipContent }}</div>
        <h3>{{ srcDir }}</h3>
        <div v-if="srcImagePaths.length">
            <h6 style="margin: 0;">{{ srcImagePaths[curImageIndex - 1] }}</h6>
            <img :src="rootUrl + srcImagePaths[curImageIndex - 1] + `?timestamp=${timestamp}`"
                :width="width" :alt="srcImagePaths[curImageIndex - 1]"
                @click="copyImagePath" @dblclick="zoomImage" @mousemove="updateTooltip" @mouseleave="closeTooltip">
        </div>
        <div class="label-bar">
            <span>当前是第 </span>
            <el-input-number size="mini" v-model="curImageIndex" :min="1" :max="Math.max(srcImagePaths.length, 1)"></el-input-number>
            <span> 张，共计 {{ srcImagePaths.length }} 张 </span>
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
    watch: {
        srcImagePaths() {
            this.curImageIndex = 1;
        }
    },
    methods: {
        pathFromEvent(e) {
            return e.target.alt || "";
        },
        updateTooltip(e) {
            const path = this.pathFromEvent(e);
            let oriWidth = e.target.naturalWidth;
            let oriHeight = e.target.naturalHeight;
            let visWidth = e.target.offsetWidth;
            let visHeight = e.target.offsetHeight;
            let imageRect = e.target.getBoundingClientRect();
            let cursorX = e.clientX - imageRect.x;
            let cursorY = e.clientY - imageRect.y;
            let x = Math.round(cursorX / visWidth * oriWidth);
            let y = Math.round(cursorY / visHeight * oriHeight);
            this.tooltipContent = `${path}\n坐标: (${x}, ${y}) | 比例: (${(x / oriWidth * 100).toFixed(1)}%, ${(y / oriHeight * 100).toFixed(1)}%) | 尺寸: ${oriWidth} × ${oriHeight}`;
            this.showTooltip = true;
            this.$refs.tooltip.style.top = `${e.clientY + 10}px`;
            this.$refs.tooltip.style.left = `${e.clientX + 10}px`;
        },
        closeTooltip() {
            this.showTooltip = false;
        },
        copyImagePath(e) {
            const oriImagePath = this.pathFromEvent(e);
            const b = document.createElement("button");
            b.setAttribute("class", "cb");
            b.setAttribute("data-clipboard-text", oriImagePath);
            document.body.appendChild(b);
            b.click();
            b.remove();
            this.$emit('path-copied', oriImagePath);
            this.$axios.get(this.rootUrl + '/clickImagePath', {
                params: { clickedImagePath: e.target.src }
            }).catch(() => {});
        },
        zoomImage(e) {
            this.$emit('zoom', this.pathFromEvent(e));
        },
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
    padding-bottom: 0.5rem;
}

.tooltip {
    position: fixed;
    pointer-events: none;
    border-style: solid;
    font-size: small;
    background-color: cornsilk;
    z-index: 100;
    max-width: 60vw;
    white-space: pre-wrap;
    word-break: break-all;
    padding: 4px 6px;
}

img {
    margin-right: 5px;
}

h3 {
    margin: 4px 0;
}
</style>
