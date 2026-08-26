<template>
    <div ref="root" class="folder" :class="{ 'is-loading': pageLoading, 'anno-mode': clickMode === 'anno' }">
        <div v-if="pageLoading" class="loading-banner">加载中...</div>
        <div ref="tooltip" class="tooltip" v-show="showTooltip">{{ tooltipContent }}</div>
        <h3>{{ srcDir }} <span class="count">(本页 {{ srcImagePaths.length }} 张)</span></h3>
        <span
            v-for="srcImagePath in srcImagePaths"
            :key="srcImagePath"
            class="img-wrap"
            :class="{ 'has-pending': annoPending && annoPending.imagePath === srcImagePath }">
            <img
                :src="rootUrl + srcImagePath + `?timestamp=${timestamp}`"
                :width="width"
                :alt="srcImagePath"
                @load="onImgSettled"
                @error="onImgSettled"
                @click="onImageClick"
                @dblclick="onImageDblclick"
                @mousemove="updateTooltip"
                @mouseleave="closeTooltip">
            <i
                v-if="annoPending && annoPending.imagePath === srcImagePath"
                class="anno-pt"
                :style="{ left: annoPending.displayX + 'px', top: annoPending.displayY + 'px' }">
            </i>
        </span>
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
            pageLoading: false,
            expectedCount: 0,
            loadGen: 0,
            loadTimer: null,
        };
    },
    watch: {
        srcImagePaths: {
            handler() { this.beginPageLoad(); },
            deep: true,
        },
        timestamp() { this.beginPageLoad(); },
    },
    mounted() {
        this.beginPageLoad();
    },
    beforeDestroy() {
        this.clearLoadTimer();
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
        clearLoadTimer() {
            if (this.loadTimer) {
                clearTimeout(this.loadTimer);
                this.loadTimer = null;
            }
        },
        beginPageLoad() {
            this.clearLoadTimer();
            const gen = ++this.loadGen;
            this.expectedCount = (this.srcImagePaths || []).length;
            if (this.expectedCount === 0) {
                this.pageLoading = false;
                return;
            }
            this.pageLoading = true;
            this.loadTimer = setTimeout(() => {
                if (gen !== this.loadGen) return;
                this.pageLoading = false;
                this.loadTimer = null;
            }, 4000);
            this.$nextTick(() => {
                if (gen !== this.loadGen) return;
                this.checkAllSettled(gen);
            });
        },
        checkAllSettled(gen) {
            if (gen != null && gen !== this.loadGen) return;
            if (!this.pageLoading) return;
            const root = this.$refs.root;
            if (!root) return;
            const imgs = root.querySelectorAll("img");
            let settled = 0;
            imgs.forEach(img => {
                if (img.complete) settled += 1;
            });
            if (settled >= this.expectedCount) {
                this.pageLoading = false;
                this.clearLoadTimer();
            }
        },
        onImgSettled() {
            this.checkAllSettled();
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

<style>
.folder {
    border: solid 2px cornflowerblue;
    padding: 0 0.5rem;
    margin: 1rem;
    position: relative;
    min-height: 4rem;
}

.folder.is-loading img {
    opacity: 0.2;
}

.folder.anno-mode img {
    cursor: crosshair;
}

.loading-banner {
    position: sticky;
    top: 3rem;
    z-index: 5;
    margin: 0.5rem 0;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #90b4e0;
    color: #1a4a8a;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
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
    margin-right: 5px;
    vertical-align: top;
}

.img-wrap img {
    margin-right: 0;
    display: block;
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

h3 {
    margin: 4px 0;
}

.count {
    font-weight: normal;
    font-size: 14px;
    color: #666;
}
</style>
