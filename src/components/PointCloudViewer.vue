<template>
  <div class="ply-modal" @click.self="$emit('close')">
    <div class="ply-modal-content" @click.stop>
      <div class="ply-modal-header">
        <h3 :title="path">{{ path }}</h3>
        <span class="ply-hint">
          单击选中旋转中心 · 点空白取消 · 拖动自由旋转 · 滚轮缩放 · 右键平移 · Esc关闭
          <template v-if="pointCount != null"> · {{ displayCount }} 点</template>
          <template v-if="downsampled">（已降采样）</template>
          <template v-if="pivotLabel"> · 中心 {{ pivotLabel }}</template>
        </span>
        <el-button class="close-btn" @click="$emit('close')" icon="el-icon-close" circle></el-button>
      </div>
      <div ref="host" class="ply-host">
        <div v-if="loading" class="ply-overlay">加载点云中...</div>
        <div v-if="error" class="ply-overlay error">{{ error }}</div>
      </div>
      <div class="ply-modal-footer">
        <el-button @click="clearPivot" :disabled="!pivotLabel">取消选中</el-button>
        <el-button @click="resetView" :disabled="loading || !!error">重置视角</el-button>
        <el-button @click="$emit('close')">关闭</el-button>
        <el-button type="primary" @click="copyPath">复制路径</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

const MAX_POINTS = 500000;
const CLICK_PX = 5;

function jetColor(t, out, offset) {
  const v = Math.max(0, Math.min(1, t));
  const r = Math.min(1.5 - Math.abs(4 * v - 3), 1);
  const g = Math.min(1.5 - Math.abs(4 * v - 2), 1);
  const b = Math.min(1.5 - Math.abs(4 * v - 1), 1);
  out[offset] = Math.max(0, r);
  out[offset + 1] = Math.max(0, g);
  out[offset + 2] = Math.max(0, b);
}

export default {
  name: 'PointCloudViewer',
  props: {
    url: { type: String, required: true },
    path: { type: String, default: '' },
  },
  data() {
    return {
      loading: true,
      error: '',
      pointCount: null,
      displayCount: null,
      downsampled: false,
      pivotLabel: '',
    };
  },
  mounted() {
    this.initScene();
    this.loadPly();
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    this.disposeAll();
  },
  methods: {
    initScene() {
      const host = this.$refs.host;
      const w = host.clientWidth || 800;
      const h = host.clientHeight || 600;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x111111);

      this.camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 10000);
      this.camera.position.set(1.5, 1.2, 1.5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      host.appendChild(this.renderer.domElement);

      this.controls = new TrackballControls(this.camera, this.renderer.domElement);
      // Trackball：绕 target 自由三轴旋转（含 yaw），不像 Orbit 锁世界 up
      this.controls.rotateSpeed = 3.0;
      this.controls.zoomSpeed = 1.4;
      this.controls.panSpeed = 0.9;
      this.controls.staticMoving = false;
      this.controls.dynamicDampingFactor = 0.12;

      this.raycaster = new THREE.Raycaster();
      this.raycaster.params.Points = { threshold: 0.02 };
      this._pointer = { x: 0, y: 0, down: false };
      this._pickScale = 0.02;

      const canvas = this.renderer.domElement;
      canvas.addEventListener('pointerdown', this.onPointerDown);
      canvas.addEventListener('pointerup', this.onPointerUp);

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      const dir = new THREE.DirectionalLight(0xffffff, 0.45);
      dir.position.set(2, 4, 3);
      this.scene.add(dir);

      const grid = new THREE.GridHelper(2, 20, 0x444444, 0x2a2a2a);
      grid.position.y = 0;
      this.grid = grid;
      this.scene.add(grid);

      this._animating = true;
      const tick = () => {
        if (!this._animating) return;
        this._raf = requestAnimationFrame(tick);
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      };
      tick();
    },
    loadPly() {
      this.loading = true;
      this.error = '';
      const loader = new PLYLoader();
      loader.load(
        this.url,
        (geometry) => {
          try {
            this.mountGeometry(geometry);
            this.loading = false;
          } catch (e) {
            this.error = '解析失败：' + (e && e.message ? e.message : e);
            this.loading = false;
          }
        },
        undefined,
        (err) => {
          this.error = '加载失败：' + (err && err.message ? err.message : String(err));
          this.loading = false;
        }
      );
    },
    mountGeometry(geometry) {
      this.clearPoints();
      this.clearPivotMarker();
      this.pivotLabel = '';

      if (!geometry.attributes.position) {
        throw new Error('PLY 无顶点坐标');
      }

      let geo = geometry;
      const total = geo.attributes.position.count;
      this.pointCount = total;
      this.downsampled = false;

      if (total > MAX_POINTS) {
        geo = this.downsample(geo, MAX_POINTS);
        this.downsampled = true;
        this.displayCount = MAX_POINTS;
      } else {
        this.displayCount = total;
      }

      if (!geo.attributes.color) {
        this.applyHeightColors(geo);
      }

      geo.computeBoundingBox();
      geo.computeBoundingSphere();

      const material = new THREE.PointsMaterial({
        size: 0.012,
        vertexColors: true,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geo, material);
      this.points = points;
      this.scene.add(points);
      this.fitToObject(points);
    },
    downsample(geometry, maxPoints) {
      const pos = geometry.attributes.position;
      const col = geometry.attributes.color;
      const n = pos.count;
      const step = n / maxPoints;
      const outPos = new Float32Array(maxPoints * 3);
      const outCol = col ? new Float32Array(maxPoints * 3) : null;
      let write = 0;
      for (let i = 0; i < maxPoints; i++) {
        const idx = Math.min(n - 1, Math.floor(i * step));
        outPos[write * 3] = pos.getX(idx);
        outPos[write * 3 + 1] = pos.getY(idx);
        outPos[write * 3 + 2] = pos.getZ(idx);
        if (outCol) {
          outCol[write * 3] = col.getX(idx);
          outCol[write * 3 + 1] = col.getY(idx);
          outCol[write * 3 + 2] = col.getZ(idx);
        }
        write += 1;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(outPos, 3));
      if (outCol) g.setAttribute('color', new THREE.BufferAttribute(outCol, 3));
      geometry.dispose();
      return g;
    },
    applyHeightColors(geometry) {
      const pos = geometry.attributes.position;
      const n = pos.count;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < n; i++) {
        const y = pos.getY(i);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const span = maxY - minY || 1;
      const colors = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        jetColor((pos.getY(i) - minY) / span, colors, i * 3);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    },
    fitToObject(obj) {
      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 0.1);
      const dist = maxDim * 1.8;

      this._pickScale = Math.max(maxDim * 0.015, 0.005);
      if (this.raycaster) {
        this.raycaster.params.Points.threshold = this._pickScale;
      }

      this.controls.target.copy(center);
      this.camera.near = Math.max(dist / 1000, 0.001);
      this.camera.far = dist * 100;
      this.camera.position.set(center.x + dist, center.y + dist * 0.7, center.z + dist);
      this.camera.updateProjectionMatrix();
      this.controls.update();

      if (this.grid) {
        this.grid.position.set(center.x, box.min.y, center.z);
        const scale = Math.max(maxDim, 0.5);
        this.grid.scale.set(scale, 1, scale);
      }
    },
    onPointerDown(e) {
      if (e.button !== 0) return;
      this._pointer = { x: e.clientX, y: e.clientY, down: true };
    },
    onPointerUp(e) {
      if (e.button !== 0 || !this._pointer.down) return;
      this._pointer.down = false;
      const dx = e.clientX - this._pointer.x;
      const dy = e.clientY - this._pointer.y;
      if (dx * dx + dy * dy > CLICK_PX * CLICK_PX) return;
      this.pickPivot(e);
    },
    pickPivot(e) {
      if (!this.points || !this.renderer || !this.camera) return;
      const posAttr = this.points.geometry && this.points.geometry.attributes.position;
      if (!posAttr) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      if (w <= 0 || h <= 0) return;

      // 按屏幕像素找最近可见顶点，避免 raycast threshold 点到错误点
      this.points.updateMatrixWorld(true);
      const matrixWorld = this.points.matrixWorld;
      const v = new THREE.Vector3();
      const maxPx = 14;
      const maxPx2 = maxPx * maxPx;
      let bestIdx = -1;
      let bestScore = Infinity;

      for (let i = 0; i < posAttr.count; i++) {
        v.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).applyMatrix4(matrixWorld);
        v.project(this.camera);
        // 裁剪体外跳过（含相机后方）
        if (v.z < -1 || v.z > 1 || v.x < -1.2 || v.x > 1.2 || v.y < -1.2 || v.y > 1.2) continue;
        const sx = (v.x * 0.5 + 0.5) * w;
        const sy = (-v.y * 0.5 + 0.5) * h;
        const dx = sx - mx;
        const dy = sy - my;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxPx2) continue;
        // 同像素距离时优先更靠近相机的点（z 更小）
        const score = d2 + v.z * 1e-4;
        if (score < bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }

      if (bestIdx < 0) {
        this.clearPivot();
        return;
      }

      const world = new THREE.Vector3(
        posAttr.getX(bestIdx),
        posAttr.getY(bestIdx),
        posAttr.getZ(bestIdx)
      ).applyMatrix4(matrixWorld);

      this.controls.target.copy(world);
      this.controls.update();
      this.showPivotMarker(world);
      this.pivotLabel = `(${world.x.toFixed(3)}, ${world.y.toFixed(3)}, ${world.z.toFixed(3)})`;
    },
    showPivotMarker(world) {
      this.clearPivotMarker();
      // 固定屏幕像素大小的小黄点，避免球体随尺度遮挡点云
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute([world.x, world.y, world.z], 3));
      const mat = new THREE.PointsMaterial({
        color: 0xffeb3b,
        size: 8,
        sizeAttenuation: false,
        depthTest: false,
        transparent: true,
        opacity: 0.95,
      });
      const marker = new THREE.Points(geom, mat);
      marker.renderOrder = 999;
      this.pivotMarker = marker;
      this.scene.add(marker);
    },
    clearPivotMarker() {
      if (!this.pivotMarker) return;
      this.scene.remove(this.pivotMarker);
      if (this.pivotMarker.geometry) this.pivotMarker.geometry.dispose();
      if (this.pivotMarker.material) this.pivotMarker.material.dispose();
      this.pivotMarker = null;
    },
    clearPivot() {
      this.clearPivotMarker();
      this.pivotLabel = '';
    },
    resetView() {
      this.clearPivot();
      if (this.points) this.fitToObject(this.points);
    },
    copyPath() {
      const b = document.createElement('button');
      b.setAttribute('class', 'cb');
      b.setAttribute('data-clipboard-text', this.path);
      document.body.appendChild(b);
      b.click();
      b.remove();
    },
    onResize() {
      if (!this.renderer || !this.camera || !this.$refs.host) return;
      const host = this.$refs.host;
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      if (this.controls && this.controls.handleResize) this.controls.handleResize();
    },
    clearPoints() {
      if (!this.points) return;
      this.scene.remove(this.points);
      if (this.points.geometry) this.points.geometry.dispose();
      if (this.points.material) this.points.material.dispose();
      this.points = null;
    },
    disposeAll() {
      this._animating = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this.renderer && this.renderer.domElement) {
        this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
        this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
      }
      this.clearPivotMarker();
      this.clearPoints();
      if (this.grid) {
        this.scene.remove(this.grid);
        if (this.grid.geometry) this.grid.geometry.dispose();
        if (this.grid.material) {
          if (Array.isArray(this.grid.material)) this.grid.material.forEach(m => m.dispose());
          else this.grid.material.dispose();
        }
        this.grid = null;
      }
      if (this.controls) {
        this.controls.dispose();
        this.controls = null;
      }
      if (this.renderer) {
        const el = this.renderer.domElement;
        if (el && el.parentNode) el.parentNode.removeChild(el);
        this.renderer.dispose();
        this.renderer = null;
      }
      this.scene = null;
      this.camera = null;
      this.raycaster = null;
    },
  },
};
</script>

<style scoped>
.ply-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ply-modal-content {
  background: #1a1a1a;
  border-radius: 8px;
  width: 95vw;
  height: 95vh;
  display: flex;
  flex-direction: column;
  color: #eee;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.ply-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #333;
}

.ply-modal-header h3 {
  margin: 0;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ply-hint {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.close-btn {
  border: none;
  background: none;
  color: #999;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #fff;
}

.ply-host {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.ply-host >>> canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.ply-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #ddd;
  font-size: 16px;
  z-index: 2;
  pointer-events: none;
}

.ply-overlay.error {
  color: #ff8a80;
}

.ply-modal-footer {
  padding: 10px 16px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
