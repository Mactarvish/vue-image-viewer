<template>
  <div>
    <div class="background"></div>
    <main class="main">
      <div v-if="singleBrowseMode == 0">
        <div id="path-and-image" v-for="(value, key) in dirFilePathMap" :key="key">
          <ImageList :rootUrl="rootUrl" :srcDir="key" :srcImagePaths="value"></ImageList>
        </div>
      </div>
      <div v-else class="show-single">
        <button class="change-image-button" @click="changeImage('last')">上一张</button>
        <div class="single-image-widget">
          <h3>
            {{ srcImagePaths[curImageIndex] }}
          </h3>
          <AnnoImage :src="srcImagePaths[curImageIndex]" :width="512"></AnnoImage>
        </div>
        <button class="change-image-button" @click="changeImage('next')">下一张</button>
      </div>

      <div>
        {{ errInfo }}
      </div>
    </main>

    <nav>
      <div class="config">
      </div>

      <div>
        <div>展示以下目录的图片：</div>
        <input class="input-dir" type="text" v-model="srcDir">
      </div>

      <div>参与遍历的后缀名：</div>
      <div class="postfixes">
        <el-checkbox-group v-model="checkedPostfixes">
          <!-- 必须有label，否则没法绑定到checkedPostfixes里头 -->
          <el-checkbox v-for="(item, index) in filenamePostfixes" :label="item" :key="index">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </div>

      <el-radio-group v-model="singleBrowseMode">
        <el-radio label='0'>列表展示全部图片</el-radio>
        <el-radio label='1'>单图切换浏览</el-radio>
      </el-radio-group>

      <!-- 竖向flex中的dom会自动横向撑满 -->
      <el-button @click="browseDir">预览</el-button>
      <div>
        {{ srcDir }}
      </div>
    </nav>
  </div>
</template>

<script>
import ImageList from './ImageList.vue'
import Clipboard from 'clipboard'
export default {
  name: 'ImageViewer',
  components: {
    ImageList,
  },
  props: {
  },
  data() {
    return {
      srcImagePaths: [
      ],
      dirFilePathMap: {},
      srcDir: "/Users/mactarvish/Desktop/vue-test",
      errInfo: "",
      rootUrl: "http://localhost:8003",
      filenamePostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP", ".jpeg"],
      checkedPostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP", ".jpeg"],
      singleBrowseMode: '0',
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
  mounted() {
    this.clipboard = new Clipboard(".cb");
    this.clipboard.on('success', (e) => {
      this.$message(`复制成功： ${e.text}`);
    });
    // 监听复制失败事件
    this.clipboard.on('error', () => {
      this.$alert('草台，复制失败了');
    });
  },
  methods: {
    browseDir() {
      let formData = new FormData();
      formData.append("recursive", true);
      formData.append("srcDir", this.srcDir);
      formData.append("postfixes", this.checkedPostfixes);
      let srcDirUrl = this.rootUrl + '/';
      // 请求目录下的全部文件名
      this.$axios.post(srcDirUrl, formData).then(res => {
        res;
        this.dirFilePathMap = res.data;
        // this.$set(this.dirFilePathMap, Object.keys(res.data)[0], Object.values(res.data)[0])

        this.srcImagePaths = [];
        this.errInfo = "";
      }).catch(reason => {
        console.log(reason);
        this.errInfo = "错误信息：" + reason + "\n" + "请检查目录是否存在";
        console.log("草台");
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
.background {
  position: fixed;
  ;
  height: 100%;
  width: 100%;
  background-color: #C7EDCC;
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
  left: 0;
  top: 0;
  bottom: 0;
  position: fixed;
  padding: 1rem;

  >* {
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
  padding: 0 0 0 20rem
}

a {
  color: #42b983;
}

div#path-and-image {
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

  >h3 {
    overflow-wrap: break-word;
    width: 30rem;
  }
}
</style>
