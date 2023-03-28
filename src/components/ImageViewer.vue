<template>
  <div class="page">
    <nav>
      <div class="config">
      </div>

      <!-- <h1>{{ srcDir }}</h1> -->
      <div>
        <div>展示以下目录的图片：</div>
        <input class="input-dir" type="text" v-model="srcDir">
      </div>

      <div>
        <div>参与遍历的后缀名：</div>
        <div class="postfixes">
          <label v-for="(item, index) in filenamePostfixes" :key="item.id">
            <input type="checkbox" v-model="postfixesChecked[index]" checked>{{ item }}
          </label>
        </div>
      </div>

      <div>
        <!-- 这个label可以把按钮的文字和按钮绑定到一块，点文字也有响应了 -->
        <label for="browseMode0">
          <input type="radio" id="browseMode0" value=0 v-model="singleBrowseMode" checked>列表展示全部图片
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
      <div v-if="singleBrowseMode == 0">
        <div id="path_and_image" v-for="item in srcImagePaths" :key="item.id">
          {{ item }}
          <AnnoImage :src=item :width="512"></AnnoImage>
        </div>
      </div>
      <div v-else class="show-single">
        <button class="change-image-button" @click="changeImage('last')">上一张</button>
        <div class="single-image-widget">
          <h3>
            {{ srcImagePaths[curImageIndex] }}
          </h3>
          <AnnoImage :src="srcImagePaths[curImageIndex]" :width="512"></AnnoImage> 
          alt="图像加载失败，请确认后端服务已开启： python utils/server.py -d /">
        </div>
        <button class="change-image-button" @click="changeImage('next')">下一张</button>
      </div>

      <!-- <div v-for="item in srcImagePaths" :key="item.id"> {{ item }}</div> -->


      <div>
        {{ errInfo }}
      </div>

    </main>
  </div>
</template>

<script>

import $ from 'jquery'
import AnnoImage from './AnnoImage.vue'

export default {
  name: 'ImageViewer',
  components: {
    AnnoImage
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
  flex: 1;
}

.input-dir {
  width: 100%;
  box-sizing: border-box;
}

.postfixes {
  display: grid;
  grid-template-columns: auto auto;
  border: #42b983;
  border-radius: 5px;
  border-style: dotted;
}

nav {
  text-align: left;
  display: flex;
  flex-direction: column;
  background-color: antiquewhite;
  width: 20rem;
  // left: 0;
  // top: 0;
  // position: fixed;
  padding: 1rem;

  > * {
    margin: 0.5rem 0;
  }
}

.change-image-button {
  height: 5rem;
  width: 5rem;
  align-items: center;
}

main {
  flex: 1;
  display: flex;
  position: relative;
  background-color: aqua;
}

a {
  color: #42b983;
}

div#path_and_image {
  border-top: 3px solid #ff0000;
  margin-bottom: 10px;
}

.show-single {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 1rem;
  justify-content: space-evenly;
  flex: 1;
}

.single-image-widget {
  align-items: center;
  margin: 0 1rem;
  > h3 {
    overflow-wrap: break-word;
    width: 30rem;
  }
}

</style>
