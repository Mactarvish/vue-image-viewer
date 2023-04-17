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

import Clipboard from 'clipboard'

export default {
    name: "ImageList",
    props: {
        rootUrl: String,
        srcDir: String,
        srcImagePaths: Array,
        width: {
            type: Number,
            default: 200
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
    mounted() {
        this.clipboard = new Clipboard(".cb");
        this.clipboard.on('success', () => {
            console.log('复制成功！');
        });
        // 监听复制失败事件
        this.clipboard.on('error', () => {
            alert('草台，复制失败了');
        });
    },
    methods: {
        getWidth() {
            const e = 200 + Math.floor(Math.random() * 100);
            return e
        },
        updateTooltip(e) {
            // console.log(e.target);
            this.tooltipContent = e.target.src;
            this.showTooltip = true;
            this.$refs.tooltip.style.top = `${e.clientY + 10}px`;
            this.$refs.tooltip.style.left = `${e.clientX + 10}px`;
        },
        closeTooltip() {
            this.showTooltip = false;
        },
        copyImagePath(e) {
            // <button data-clipboard-text="这里的文字将被复制1111222" class="copy-btn" >复制图片链接</button>
            e;
            // 触发复制操作
            const b = document.createElement("button");
            b.setAttribute("class", "cb");
            b.setAttribute("data-clipboard-text", "这里的文字将被复制");
            
            this.$refs.root.appendChild(b);
            b.click();
            b.remove();
            e;
            console.log(b);
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