<template>
    <div style="display: flex;justify-content: center;margin: 20px">
        <canvas ref="canvas" id="myCanvas" style="border:20px solid #d3ffd3;" @mousedown="handleMousedown" @mouseup="handleMouseup" />
    </div>
</template>

<script>

export default {
    name: 'AnnoCanvas',
    components: {},
    props: {
        src: String,
        canvasWidth: Number
    },
    data() {
        return {
            down: ''
        }
    },
    mounted() {
        this.initCanvas();
        // 通过ref获取自身的dom元素
        // console.log("AnnoCanvas mounted");
        // let canvas = this.$refs['canvas'];
        // let img = new Image();
        // img.src = this.src;
        // img.onload = () => {
        //     let ratio = this.canvasWidth / img.width;
        //     let canvasHeight = img.height * ratio;

        //     canvas.width = this.canvasWidth;
        //     canvas.height = canvasHeight;
        //     canvas.getContext('2d').drawImage(img, 0, 0, this.canvasWidth, canvasHeight);
        // }
    },
    watch: {
        src: {
            handler(newVal, oldVal) {
                console.log("快给也掉");
                this.initCanvas();
                console.log(newVal, oldVal);
            }
        }
    },
    methods: {
        // 把初始化逻辑专门放到一个函数里，方便src变化时调用
        initCanvas() {
            // 通过ref获取自身的dom元素
            console.log("AnnoCanvas mounted");
            let canvas = this.$refs['canvas'];
            let img = new Image();
            img.src = this.src;
            img.onload = () => {
                let ratio = this.canvasWidth / img.width;
                let canvasHeight = img.height * ratio;

                canvas.width = this.canvasWidth;
                canvas.height = canvasHeight;
                canvas.getContext('2d').drawImage(img, 0, 0, this.canvasWidth, canvasHeight);
            }
        },
        handleMousedown(e) {
            if (e.button === 0) {
                this.down = e;
            }
        },
        handleMouseup(e) {
            if (e.button === 0) {
                // console.log('松开', e)
                let canvas = this.$refs['canvas'];
                // var c = canvas
                var ctx = canvas.getContext('2d')
                ctx.strokeStyle = '#EB3324'
                // 绘制矩形
                var { offsetX, offsetY } = this.down
                var width = offsetX - e.offsetX
                var height = offsetY - e.offsetY
                if (width < 0) {
                    width *= -1
                }
                if (height < 0) {
                    height *= -1
                }
                ctx.strokeRect(offsetX > e.offsetX ? e.offsetX : offsetX, offsetY > e.offsetY ? e.offsetY : offsetY, width, height)
            }
        }
    }
}
</script>

<style scoped>

</style>

