<template>
  <div class="page">
    <nav>
      <div class="config">
      </div>

      <div class="src-dir">
        <!-- <h1>{{ srcDir }}</h1> -->
        <input class="input-dir" type="text" v-model="srcDir">
        <div class="postfixes">
          <div v-for="(item, index) in filenamePostfixes" :key="item.id">
            <input type="checkbox" v-model="postfixesChecked[index]" checked>{{ item }}
          </div>
        </div>
      </div>

      <div>
        <!-- 这个label可以把按钮的文字和按钮绑定到一块，点文字也有响应了 -->
        <label for="browseMode0">
          <input type="radio" id="browseMode0" value=0 v-model="singleBrowseMode" checked>展示全部图片
        </label>
        <label for="browseMode1">
          <input type="radio" id="browseMode1" value=1 v-model="singleBrowseMode">单图切换浏览
        </label>
      </div>

      <!-- 竖向flex中的dom会自动横向撑满 -->
      <button @click="browseDir">预览</button>
      <div>
        {{ srcDir }}
      </div>
    </nav>

    <main class="main">
      <div v-if="singleBrowseMode == 0 ? true : false">
        <div id="path_and_image" v-for="item in srcImagePaths" :key="item.id">
          {{ item }}
          <!-- <img :src=item width="512" alt="图像加载失败，请确认后端服务已开启： python utils/server.py -d /"> -->
          <AnnoCanvas :src=item :canvasWidth=400></AnnoCanvas>
        </div>
      </div>
      <div class="show-single" v-else>
        <button @click="changeImage('last')">上一张</button>
        <AnnoCanvas :src="srcImagePaths[curImageIndex]" :canvasWidth=400></AnnoCanvas>
        <button @click="changeImage('next')">下一张</button>

      </div>

      <div id="side-menu">
        <div v-for="item in srcImagePaths" :key="item.id"> {{ item }}</div>

      </div>


      <div>
        {{ errInfo }}
      </div>

    </main>
  </div>
</template>

<script>

import $ from 'jquery'
import AnnoCanvas from './AnnoCanvas.vue'

export default {
  name: 'ImageViewer',
  components: {
    AnnoCanvas
  },
  props: {
    // srcDir: String
  },
  data() {
    return {
      srcImagePaths: [
      ],
      srcDir: "/Users/mactarvish/Desktop/hangji",
      errInfo: "",
      rootUrl: "http://localhost:8000",
      filenamePostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP"],
      postfixesChecked: [true, true, true, true, true, true, true],
      singleBrowseMode: 1,
      curImageIndex: 0,
    };
  },
  watch: {
    singleBrowseMode: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
    }
  },
  methods: {
    browseDir() {
      console.log("bbb");
      let formData = new FormData();
      let srcDirUrl = this.rootUrl + this.srcDir + '/'; // ? 请求url必须以/结尾，否则会请求出错？
      // 请求目录下的全部文件名
      this.$axios.get(srcDirUrl, formData).then(res => {
        var el = $(res.data);
        console.log($('a', el)); // All the anchor elements
        let filenames = $("a", el).map((i, e) => { return e.text });

        this.srcImagePaths = [];
        let i = 0;
        console.log(this.postfixesChecked);
        for (const filename of filenames) {
          let isValidPostfix = false;
          for (let i = 0; i < this.postfixesChecked.length; i++) {
            if (this.postfixesChecked[i] && filename.endsWith(this.filenamePostfixes[i])) {
              isValidPostfix = true;
              break;
            }
          }
          if (isValidPostfix) {
            let e = srcDirUrl + filename;
            this.srcImagePaths.push(e);
            i++;
          }
          if (i == 10) {
            // break;
          }
        }
        // this.$message.success(`上传成功！ ${this.uuid}`);
        this.errInfo = "";
      }).catch(reason => {
        console.log(reason);
        this.errInfo = "错误信息：" + reason + "\n" + "请检查目录是否存在";
      });
    },
    changeImage(d) {
      console.log(d);
      if (d === "next") {
        this.curImageIndex = Math.min(this.srcImagePaths.length - 1, this.curImageIndex + 1);
      }
      else if (d === "last") {
        this.curImageIndex = Math.max(0, this.curImageIndex - 1);
      }
      else {
        console.log("未定义切换图片行为");
      }
      console.log(this.curImageIndex);
    },
  }
}
</script>

<style lang="less" >

.page {
  display: flex;
  flex-direction: row;
}

.src-dir {
  display: flex;
  flex-direction: column;
}

.postfixes {
  /* display: inline-block; */
  border: #42b983;
  border-radius: 5px;
  border-style: dotted;
  div {
    display: inline;
  }

}

nav {
  text-align: left;
  display: flex;
  flex-direction: column;
  background-color: antiquewhite;
  width: 30rem;
  left: 0;
  top: 0;
  padding: 1rem;
  margin-right: 1rem;
}

main {
  flex: 1;
}

a {
  color: #42b983;
}

div#path_and_image {
  border-top: 3px solid #ff0000;
  margin-bottom: 10px;
}

.show-single {
  display: grid;
  grid-template-columns: 5rem 1fr 5rem;
}

</style>
