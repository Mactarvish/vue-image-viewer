<template>
    <div ref="root" class="folder" :class="{ 'anno-mode': clickMode === 'anno' }">
        <div ref="tooltip" class="tooltip" v-show="showTooltip">{{ tooltipContent }}</div>
        <h3>{{ srcDir }}</h3>
        <div v-if="srcImagePaths.length">
            <h6 style="margin: 0;">{{ srcImagePaths[curImageIndex - 1] }}</h6>
            <span class="img-wrap"
                  :class="{ 'has-pending': annoPending && annoPending.imagePath === srcImagePaths[curImageIndex - 1] }">
                <img :src="rootUrl + srcImagePaths[curImageIndex - 1] + `?timestamp=${timestamp}`"
                    :width="width" :alt="srcImagePaths[curImageIndex - 1]"
                    @click="onImageClick" @dblclick="onImageDblclick"
                    @mousemove="updateTooltip" @mouseleave="closeTooltip">
                <i
                    v-if="annoPending && annoPending.imagePath === srcImagePaths[curImageIndex - 1]"
                    class="anno-pt"
                    :style="{ left: annoPending.displayX + 'px', top: annoPending.displayY + 'px' }">
                </i>
            </span>
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
        clickMode: {
            type: String,
            default: "copy"
        },
        annoPending: {
            type: Object,
            default: null
        },
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
        coordsFromEvent(e) {
            const img = e.target;
            const oriWidth = img.naturalWidth;
            const oriHeight = img.naturalHeight;
            const visWidth = img.offsetWidth;
            const visHeight = img.offsetHeight;
            const imageRect = img.getBoundingClientRect();
            const cursorX = e.clientX - imageRect.x;
            const cursorY = e.clientY - imageRect.y;
            const x = Math.round(cursorX / visWidth * oriWidth);
            const y = Math.round(cursorY / visHeight * oriHeight);
            return {
                imagePath: this.pathFromEvent(e),
                x: Math.max(0, Math.min(oriWidth - 1, x)),
                y: Math.max(0, Math.min(oriHeight - 1, y)),
                displayX: cursorX,
                displayY: cursorY,
                naturalWidth: oriWidth,
                naturalHeight: oriHeight,
            };
        },
        updateTooltip(e) {
            if (e.target.tagName !== 'IMG') return;
            const path = this.pathFromEvent(e);
            let oriWidth = e.target.naturalWidth;
            let oriHeight = e.target.naturalHeight;
            if (!oriWidth) return;
            let visWidth = e.target.offsetWidth;
            let visHeight = e.target.offsetHeight;
            let imageRect = e.target.getBoundingClientRect();
            let cursorX = e.clientX - imageRect.x;
            let cursorY = e.clientY - imageRect.y;
            let x = Math.round(cursorX / visWidth * oriWidth);
            let y = Math.round(cursorY / visHeight * oriHeight);
            let tip = `${path}\n坐标: (${x}, ${y}) | 比例: (${(x / oriWidth * 100).toFixed(1)}%, ${(y / oriHeight * 100).toFixed(1)}%) | 尺寸: ${oriWidth} × ${oriHeight}`;
            if (this.clickMode === 'anno') {
                tip += this.annoPending ? '\n[标注] 再点对角完成框' : '\n[标注] 点击选第一对角点';
            }
            this.tooltipContent = tip;
            this.showTooltip = true;
            this.$refs.tooltip.style.top = `${e.clientY + 10}px`;
            this.$refs.tooltip.style.left = `${e.clientX + 10}px`;
        },
        closeTooltip() {
            this.showTooltip = false;
        },
        onImageClick(e) {
            if (this.clickMode === 'anno') {
                this.$emit('annotate-click', this.coordsFromEvent(e));
                return;
            }
            this.copyImagePath(e);
        },
        onImageDblclick(e) {
            if (this.clickMode === 'anno') {
                e.preventDefault();
                return;
            }
            this.zoomImage(e);
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

.folder.anno-mode img {
    cursor: crosshair;
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

.img-wrap {
    position: relative;
    display: inline-block;
}

.anno-pt {
    position: absolute;
    width: 10px;
    height: 10px;
    margin-left: -5px;
    margin-top: -5px;
    border-radius: 50%;
    background: #e53935;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #e53935;
    pointer-events: none;
    z-index: 2;
}

img {
    margin-right: 5px;
    display: block;
}

h3 {
    margin: 4px 0;
}
</style>
