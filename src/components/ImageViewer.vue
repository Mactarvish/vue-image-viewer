<template>
  <div>
    <div class="background"></div>
    <!-- 放大图像模态框 -->
    <div v-if="showZoomModal" class="zoom-modal" @click="closeZoomModal">
      <div class="zoom-modal-content" @click.stop>
        <div class="zoom-modal-header">
          <h3>{{ zoomedImagePath }}</h3>
          <el-button class="close-btn" @click="closeZoomModal" icon="el-icon-close" circle></el-button>
        </div>
        <div class="zoom-modal-body">
          <img :src="rootUrl + zoomedImagePath + `?timestamp=${timestamp}`" :alt="zoomedImagePath" 
               class="zoomed-image" @click="closeZoomModal" @mousemove="updateZoomTooltip" @mouseleave="closeZoomTooltip">
          <div ref="zoomTooltip" class="zoom-tooltip" v-show="showZoomTooltip">{{ zoomTooltipContent }}</div>
        </div>
        <div class="zoom-modal-footer">
          <el-button @click="closeZoomModal">关闭</el-button>
          <el-button @click="copyZoomedImagePath" type="primary">复制路径</el-button>
        </div>
      </div>
    </div>
    
    <main class="main">
      <router-view></router-view>
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
      
      <div>
        <router-link to="/list">列表展示全部图片</router-link> |
        <router-link to="/flipper">单图切换浏览</router-link>
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
      
      <div class="sort-options">
        <div class="label">图像排序方式</div>
        <el-radio-group v-model="sortMode">
          <el-radio label="path">按路径顺序</el-radio>
          <el-radio label="random">随机乱序</el-radio>
        </el-radio-group>
      </div>
      
      <el-button ref="preview" @click="browseDir">预览</el-button>

      <div class="history">
        <el-tag style="height: initial; white-space: initial;" v-for="dir in historyDirs" :key="dir" closable @close="RemoveHistoryItem(dir)">
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
      sortMode: 'path', // 排序模式：path-按路径顺序，random-随机乱序

      clickedImagePath: "",
      clickedImageName: "",
      
      // 放大功能相关数据
      showZoomModal: false,
      zoomedImagePath: "",
      showZoomTooltip: false,
      zoomTooltipContent: "",
    };
  },
  watch: {
    singleBrowseMode: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal);
      },
    },
    sortMode: {
      handler(newVal, oldVal) {
        // 当排序模式改变时，重新排序图像路径
        if (Object.keys(this.dirFilePathsMap).length > 0) {
          this.sortImagePaths();
          this.timestamp = new Date().getTime(); // 强制刷新图像显示
        }
      },
    }
  },
  mounted() {
    // 自动查询域名等信息（自动匹配后端端口）
    this.rootUrl = window.location.href;
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
        
        // 根据排序模式处理图像路径
        this.sortImagePaths();
        
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
    sortImagePaths() {
      // 对每个目录下的图像路径进行排序
      for (const dir in this.dirFilePathsMap) {
        if (this.dirFilePathsMap.hasOwnProperty(dir)) {
          if (this.sortMode === 'random') {
            // 随机乱序
            this.shuffleArray(this.dirFilePathsMap[dir]);
          } else {
            // 按路径顺序（默认排序）
            this.dirFilePathsMap[dir].sort();
          }
        }
      }
    },
    shuffleArray(array) {
      // Fisher-Yates 洗牌算法
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    
    // 放大图像功能
    zoomImage(imagePath) {
      this.zoomedImagePath = imagePath;
      this.showZoomModal = true;
    },
    
    closeZoomModal() {
      this.showZoomModal = false;
      this.zoomedImagePath = "";
      this.showZoomTooltip = false;
    },
    
    copyZoomedImagePath() {
      const b = document.createElement("button");
      b.setAttribute("class", "cb");
      b.setAttribute("data-clipboard-text", this.zoomedImagePath);
      document.body.appendChild(b);
      b.click();
      b.remove();
      this.$message(`复制成功： ${this.zoomedImagePath}`);
    },
    
    // 放大模态框的坐标显示功能
    updateZoomTooltip(e) {
      let oriWidth = e.target.naturalWidth;
      let oriHeight = e.target.naturalHeight;
      let visWidth = e.target.offsetWidth;
      let visHeight = e.target.offsetHeight;
      let imageRect = e.target.getBoundingClientRect();
      let cursorX = e.clientX - imageRect.x;
      let cursorY = e.clientY - imageRect.y;
      let x = parseInt(Math.round(cursorX / visWidth * oriWidth).toString());
      let y = parseInt(Math.round(cursorY / visHeight * oriHeight).toString());

      this.zoomTooltipContent = `坐标: (${x}, ${y}) | 图像尺寸: ${oriWidth} × ${oriHeight}`;
      this.showZoomTooltip = true;
      this.$refs.zoomTooltip.style.top = `${e.clientY + 10}px`;
      this.$refs.zoomTooltip.style.left = `${e.clientX + 10}px`;
    },
    
    closeZoomTooltip() {
      this.showZoomTooltip = false;
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

.sort-options {
  margin: 0.5rem 0;
  
  .label {
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .el-radio-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}

/* 放大模态框样式 */
.zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.zoom-modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.zoom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.zoom-modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.zoom-modal-body {
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.zoomed-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  cursor: pointer;
}

.zoom-modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.zoom-tooltip {
  position: fixed;
  pointer-events: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 5px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-width: 300px;
  white-space: nowrap;
}
</style>
