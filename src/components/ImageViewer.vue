<template>
  <div>
    <!-- 放大图像模态框 -->
    <div v-if="showZoomModal" class="zoom-modal" @click.self="closeZoomModal">
      <div class="zoom-modal-content" @click.stop>
        <div class="zoom-modal-header">
          <h3>{{ zoomedImagePath }}</h3>
          <span class="zoom-hint">滚轮缩放 · 拖拽平移 · ←→切图 · 空格复制 · Esc关闭 · {{ zoomIndex + 1 }}/{{ processedPaths.length }}</span>
          <el-button class="close-btn" @click="closeZoomModal" icon="el-icon-close" circle></el-button>
        </div>
        <div class="zoom-modal-body" ref="zoomBody"
             @wheel.prevent="onZoomWheel"
             @mousedown="onZoomPanStart"
             @mousemove="onZoomPanMove"
             @mouseup="onZoomPanEnd"
             @mouseleave="onZoomPanEnd">
          <img :src="rootUrl + zoomedImagePath + `?timestamp=${timestamp}`"
               :alt="zoomedImagePath"
               class="zoomed-image"
               :style="zoomImageStyle"
               draggable="false"
               @mousemove="updateZoomTooltip"
               @mouseleave="closeZoomTooltip">
          <div ref="zoomTooltip" class="zoom-tooltip" v-show="showZoomTooltip">{{ zoomTooltipContent }}</div>
        </div>
        <div class="zoom-modal-footer">
          <el-button @click="zoomPrev" :disabled="zoomIndex <= 0">上一张</el-button>
          <el-button @click="zoomNext" :disabled="zoomIndex >= processedPaths.length - 1">下一张</el-button>
          <el-button @click="resetZoom">重置缩放</el-button>
          <el-button @click="closeZoomModal">关闭</el-button>
          <el-button @click="copyZoomedImagePath" type="primary">复制路径</el-button>
        </div>
      </div>
    </div>

    <main class="main">
      <router-view></router-view>
      <div v-if="singleBrowseMode == 0">
        <div class="page-bar" v-if="processedPaths.length">
          <span>共 {{ processedPaths.length }} 张</span>
          <el-pagination
            layout="sizes, prev, pager, next, jumper"
            :total="processedPaths.length"
            :page-size="pageSize"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100, 200]"
            @size-change="onPageSizeChange"
            @current-change="onPageChange">
          </el-pagination>
        </div>
        <div v-if="dirLoading" class="list-loading-banner">加载中...</div>
        <ImageList
          v-if="pagePaths.length"
          :rootUrl="rootUrl"
          :srcDir="srcDir"
          :srcImagePaths="pagePaths"
          :width="imageShowWidth"
          :timestamp="timestamp.toString()"
          @zoom="zoomImage"
          @path-copied="onPathCopied">
        </ImageList>
      </div>
      <div v-else class="show-single">
        <ImageFlipper
          v-if="processedPaths.length"
          :rootUrl="rootUrl"
          :srcDir="srcDir"
          :srcImagePaths="processedPaths"
          :width="imageShowWidth"
          :timestamp="timestamp.toString()"
          @zoom="zoomImage"
          @path-copied="onPathCopied">
        </ImageFlipper>
      </div>

      <div>{{ errInfo }}</div>
    </main>

    <nav>
      <div>
        <el-input v-model="srcDir" @keyup.enter.native="browseDir()" placeholder="展示该目录的图片" clearable></el-input>
      </div>

      <div>参与遍历的后缀名：</div>
      <div class="postfixes">
        <el-checkbox-group v-model="checkedPostfixes">
          <el-checkbox v-for="(item, index) in filenamePostfixes" :label="item" :key="index">{{ item }}</el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="filter-options">
        <div class="label">文件名筛选</div>
        <el-input v-model="nameInclude" placeholder="包含（子串）" clearable size="small"
                  @input="onFilterChange"></el-input>
        <el-input v-model="nameExclude" placeholder="排除（子串）" clearable size="small"
                  style="margin-top: 4px;" @input="onFilterChange"></el-input>
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
          <el-radio label="path">自然序</el-radio>
          <el-radio label="random">随机乱序</el-radio>
        </el-radio-group>
      </div>

      <el-button ref="preview" @click="browseDir" type="primary">预览</el-button>

      <div class="history">
        <el-tag style="height: initial; white-space: initial;" v-for="dir in historyDirs" :key="dir" closable @close="RemoveHistoryItem(dir)">
          <span @click="clickHistory($event)" class="history-dir">{{ dir }}</span>
        </el-tag>
      </div>
      <div class="info-for-clicked-image">
        <div style="pointer-events: none; user-select: none;">点击的图像路径 </div>
        {{ clickedImagePath }}
        <div style="pointer-events: none; user-select: none;">点击的图像名称 </div>
        {{ clickedImageName }}
      </div>
    </nav>
  </div>
</template>

<script>
import ImageList from './ImageList.vue'
import ImageFlipper from './ImageFlipper.vue'
import Clipboard from 'clipboard'

function basename(p) {
  const parts = p.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || p;
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export default {
  name: 'ImageViewer',
  components: {
    ImageList,
    ImageFlipper,
  },
  data() {
    return {
      rawDirFilePathsMap: {},
      processedPaths: [],
      srcDir: "",
      errInfo: "",
      rootUrl: "",
      filenamePostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP", ".jpeg"],
      checkedPostfixes: [".jpg", ".png", ".PNG", ".gif", ".JPG", ".bmp", ".BMP", ".jpeg"],
      singleBrowseMode: '0',
      imageShowWidth: 200,
      timestamp: "",
      historyDirs: [],
      sortMode: 'path',
      nameInclude: "",
      nameExclude: "",
      pageSize: 50,
      currentPage: 1,
      dirLoading: false,

      clickedImagePath: "",
      clickedImageName: "",

      showZoomModal: false,
      zoomedImagePath: "",
      zoomIndex: 0,
      zoomScale: 1,
      zoomOffsetX: 0,
      zoomOffsetY: 0,
      zoomPanning: false,
      zoomPanLastX: 0,
      zoomPanLastY: 0,
      showZoomTooltip: false,
      zoomTooltipContent: "",
    };
  },
  computed: {
    pagePaths() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.processedPaths.slice(start, start + this.pageSize);
    },
    zoomImageStyle() {
      return {
        transform: `translate(${this.zoomOffsetX}px, ${this.zoomOffsetY}px) scale(${this.zoomScale})`,
        cursor: this.zoomPanning ? 'grabbing' : 'grab',
      };
    },
  },
  watch: {
    sortMode() {
      if (Object.keys(this.rawDirFilePathsMap).length > 0) {
        this.rebuildProcessedPaths();
        this.timestamp = new Date().getTime();
      }
    },
  },
  mounted() {
    this.rootUrl = window.location.href;
    if (this.rootUrl.includes("8081") || this.rootUrl.includes("8080")) {
      this.rootUrl = "http://localhost:8003";
    }
    // strip trailing path for production under flask
    try {
      const u = new URL(this.rootUrl);
      if (u.port === '8003' || !u.port) {
        this.rootUrl = u.origin;
      }
    } catch (e) { /* keep as-is */ }

    this.clipboard = new Clipboard(".cb");
    this.clipboard.on('success', (e) => {
      this.$message(`复制成功： ${e.text}`);
      this.clickedImagePath = e.text;
      this.clickedImageName = e.text.split('/').pop();
    });
    this.clipboard.on('error', () => {
      this.$alert('草台，复制失败了');
    });

    window.addEventListener('keydown', this.onGlobalKeydown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onGlobalKeydown);
    if (this.clipboard) this.clipboard.destroy();
  },
  methods: {
    browseDir() {
      let formData = new FormData();
      formData.append("recursive", true);
      formData.append("srcDir", this.srcDir);
      formData.append("postfixes", this.checkedPostfixes);
      let srcDirUrl = this.rootUrl + '/getAllImagePaths';
      this.rawDirFilePathsMap = {};
      this.processedPaths = [];
      this.dirLoading = true;
      this.$axios.post(srcDirUrl, formData).then(res => {
        const data = res.data;
        const state = data.state;
        delete data.state;
        if (state == "not exist") {
          this.$message(`目录 ${this.srcDir} 不存在！`);
          return;
        }
        this.rawDirFilePathsMap = data;
        this.rebuildProcessedPaths();
        this.timestamp = new Date().getTime();
        this.errInfo = "";
        if (!this.historyDirs.includes(this.srcDir)) {
          this.historyDirs.push(this.srcDir);
        }
      }).catch(reason => {
        console.log(reason);
        this.errInfo = "错误信息：" + reason;
      }).finally(() => {
        this.dirLoading = false;
      });
    },
    onFilterChange() {
      if (Object.keys(this.rawDirFilePathsMap).length > 0) {
        this.rebuildProcessedPaths();
      }
    },
    onPageSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
    },
    onPageChange(page) {
      this.currentPage = page;
    },
    rebuildProcessedPaths() {
      let paths = [];
      for (const dir of Object.keys(this.rawDirFilePathsMap)) {
        paths = paths.concat(this.rawDirFilePathsMap[dir]);
      }
      const include = (this.nameInclude || "").trim();
      const exclude = (this.nameExclude || "").trim();
      if (include || exclude) {
        paths = paths.filter(p => {
          const name = basename(p);
          if (include && !name.includes(include)) return false;
          if (exclude && name.includes(exclude)) return false;
          return true;
        });
      }
      if (this.sortMode === 'random') {
        this.shuffleArray(paths);
      } else {
        paths.sort(naturalCompare);
      }
      this.processedPaths = paths;
      this.currentPage = 1;
    },
    RemoveHistoryItem(dir) {
      this.historyDirs.splice(this.historyDirs.indexOf(dir), 1);
    },
    clickHistory(e) {
      this.srcDir = e.target.textContent;
      this.browseDir();
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    onPathCopied(path) {
      this.clickedImagePath = path;
      this.clickedImageName = basename(path);
    },

    zoomImage(imagePath) {
      const idx = this.processedPaths.indexOf(imagePath);
      this.zoomIndex = idx >= 0 ? idx : 0;
      this.zoomedImagePath = imagePath;
      this.resetZoom();
      this.showZoomModal = true;
    },
    closeZoomModal() {
      this.showZoomModal = false;
      this.zoomedImagePath = "";
      this.showZoomTooltip = false;
      this.zoomPanning = false;
    },
    resetZoom() {
      this.zoomScale = 1;
      this.zoomOffsetX = 0;
      this.zoomOffsetY = 0;
    },
    zoomPrev() {
      if (this.zoomIndex <= 0) return;
      this.zoomIndex -= 1;
      this.zoomedImagePath = this.processedPaths[this.zoomIndex];
      this.resetZoom();
    },
    zoomNext() {
      if (this.zoomIndex >= this.processedPaths.length - 1) return;
      this.zoomIndex += 1;
      this.zoomedImagePath = this.processedPaths[this.zoomIndex];
      this.resetZoom();
    },
    copyZoomedImagePath() {
      const b = document.createElement("button");
      b.setAttribute("class", "cb");
      b.setAttribute("data-clipboard-text", this.zoomedImagePath);
      document.body.appendChild(b);
      b.click();
      b.remove();
    },
    onZoomWheel(e) {
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const next = Math.min(20, Math.max(0.1, this.zoomScale * factor));
      this.zoomScale = next;
    },
    onZoomPanStart(e) {
      if (e.button !== 0) return;
      this.zoomPanning = true;
      this.zoomPanLastX = e.clientX;
      this.zoomPanLastY = e.clientY;
    },
    onZoomPanMove(e) {
      if (!this.zoomPanning) return;
      this.zoomOffsetX += e.clientX - this.zoomPanLastX;
      this.zoomOffsetY += e.clientY - this.zoomPanLastY;
      this.zoomPanLastX = e.clientX;
      this.zoomPanLastY = e.clientY;
    },
    onZoomPanEnd() {
      this.zoomPanning = false;
    },
    onGlobalKeydown(e) {
      if (!this.showZoomModal) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape') {
        this.closeZoomModal();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.zoomPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.zoomNext();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.copyZoomedImagePath();
      }
    },
    updateZoomTooltip(e) {
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
      this.zoomTooltipContent = `${this.zoomedImagePath}\n坐标: (${x}, ${y}) | 尺寸: ${oriWidth} × ${oriHeight} | 缩放: ${this.zoomScale.toFixed(2)}x`;
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

<style lang="less">
html, body, #app {
  background-color: #C7EDCC;
  min-height: 100%;
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
  z-index: 2;
  padding: 1rem;
  overflow-y: auto;

  >* {
    margin: 0.5rem 0;
  }
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  padding: 0 0 0 20rem;
}

a {
  color: #42b983;
}

.show-single {
  flex-direction: row;
  align-items: center;
  margin: 0 1rem;
  justify-content: space-evenly;
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

.sort-options,
.filter-options {
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

.page-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  position: sticky;
  top: 0;
  z-index: 10;
}

.list-loading-banner {
  margin: 1rem;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #90b4e0;
  color: #1a4a8a;
  font-size: 15px;
  font-weight: bold;
  text-align: center;
}

.zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.zoom-modal-content {
  background-color: #1a1a1a;
  border-radius: 8px;
  width: 95vw;
  height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  color: #eee;
}

.zoom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #333;
  gap: 12px;
}

.zoom-modal-header h3 {
  margin: 0;
  font-size: 14px;
  color: #eee;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.zoom-hint {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.close-btn {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #fff;
}

.zoom-modal-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  user-select: none;
}

.zoomed-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transform-origin: center center;
  transition: none;
}

.zoom-modal-footer {
  padding: 10px 16px;
  border-top: 1px solid #333;
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
  color: #333;
  padding: 5px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-width: 60vw;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
