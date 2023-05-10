<template>
  <div>
    <div class="background"></div>
    <main class="main">
      <div v-if="singleBrowseMode == 0">
        <div id="path-and-image" v-for="(value, key) in dirFilePathsMap" :key="key">
          <ImageList :rootUrl="rootUrl" :srcDir="key" :srcImagePaths="value" :width="imageShowWidth"
            :timestamp="timestamp.toString()"></ImageList>
        </div>
      </div>
      <div v-else class="show-single">
        <div id="path-and-image" v-for="(value, key) in dirFilePathsMap" :key="key">
          <h3>
            {{ srcImagePaths[curImageIndex] }}
          </h3>
          <ImageFlipper :rootUrl="rootUrl" :srcDir="key" :srcImagePaths="value" :width="imageShowWidth"
            :timestamp="timestamp.toString()"></ImageFlipper>
        </div>
      </div>

      <div>
        {{ errInfo }}
      </div>
    </main>

    <nav>
      <div>
        <el-input v-model="srcDir" @keyup.enter.native="browseDir()" placeholder="展示该目录的图片" clearable></el-input>
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

      <div class="label-bar">
        <div class="label">图片显示宽度</div>
        <el-slider class="bar" v-model="imageShowWidth" :step="10" :max="1000" :min="10">
        </el-slider>
      </div>
      <el-button ref="preview" @click="browseDir">预览</el-button>

      <div class="history">
        <el-tag v-for="dir in historyDirs" :key="dir" closable @close="RemoveHistoryItem(dir)">
          <span @click="clickHistory($event)" class="history-dir">{{ dir }}</span>
        </el-tag>
      </div>
      <div class="info-for-clicked-image">
        <div style="pointer-events: none; user-select: none;">点击的图像路径 </div>
        {{ this.clickedImagePath }}
        <div style="pointer-events: none; user-select: none;">点击的图像名称 </div>
        {{ this.clickedImageName }}
      </div>
    </nav>
  </div>
</template>

<script>
import ImageList from './ImageList.vue'
import ImageFlipper from './ImageFlipper.vue'
import Clipboard from 'clipboard'
export default {
  name: 'ImageViewer',
  components: {
    ImageList,
    ImageFlipper,
  },
  props: {
  },
  data() {
    return {
      srcImagePaths: [
      ],
      dirFilePathsMap: {},
      srcDir: "/Users/mactarvish/Desktop/vue-test",
      errInfo: "",
      rootUrl: "", //"http://localhost:8003",
      filenamePostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP", ".jpeg"],
      checkedPostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP", ".jpeg"],
      singleBrowseMode: '0',
      curImageIndex: 0,
      imageShowWidth: 200,
      timestamp: "",
      historyDirs: [],

      clickedImagePath: "",
      clickedImageName: "",
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
    console.log(window.location);
    // 自动查询域名等信息（自动匹配后端端口）
    this.rootUrl = window.location.origin;
    // 开发模式下vue端口号是8081，此时匹配后端flask的调试端口号8003
    if (this.rootUrl.includes("8081"))
    {
      this.rootUrl = "http://localhost:8003";
    }
    // 构造剪切板对象
    this.clipboard = new Clipboard(".cb");
    this.clipboard.on('success', (e) => {
      this.$message(`复制成功： ${e.text}`);
      this.clickedImagePath = e.text;
      this.clickedImageName = e.text.split('/').pop();
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
      let srcDirUrl = this.rootUrl + '/getAllImagePaths';
      // 终止当前所有的图片加载
      this.dirFilePathsMap = {};
      // 请求目录下的全部文件名
      this.$axios.post(srcDirUrl, formData).then(res => {
        this.dirFilePathsMap = res.data;
        const state = this.dirFilePathsMap.state;
        console.log(state);
        delete this.dirFilePathsMap.state;
        if (state == "not exist") {
          this.$message(`目录 ${this.srcDir} 不存在！`);
          return;
        }
        this.timestamp = new Date().getTime();
        this.srcImagePaths = [];
        this.errInfo = "";

        if (!this.historyDirs.includes(this.srcDir)) {
          this.historyDirs.push(this.srcDir);
        }

      }).catch(reason => {
        console.log(reason);
      });
    },
    RemoveHistoryItem(dir) {
      this.historyDirs.splice(this.historyDirs.indexOf(dir), 1);
    },
    clickHistory(e) {
      this.srcDir = e.target.textContent;
      this.browseDir();
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

.history {}

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
  flex-direction: row;
  align-items: center;
  margin: 0 1rem;
  justify-content: space-evenly;
}

.single-image-widget {
  align-items: center;
  margin: 0 1rem;

  >h3 {
    overflow-wrap: break-word;
    width: 30rem;
  }
}

.label-bar {
  display: flex;
  align-items: center;

  .label {
    margin-right: 5px;
  }

  .bar {
    flex: 1;
  }
}

.info-for-clicked-image {
  margin-top: auto;
  word-wrap: break-word;
}

.history-dir:hover {
  text-decoration: underline;
  cursor: pointer;
  color: blue;
}
</style>
