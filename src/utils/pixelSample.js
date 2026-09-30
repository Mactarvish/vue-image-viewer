// 悬停读像素 RGB：按 img 缓存 ImageData，避免每次 mousemove 重画

const cache = new WeakMap();

function ensureImageData(img) {
  if (!img || !img.naturalWidth) return null;
  let entry = cache.get(img);
  if (entry && entry.src === img.currentSrc && entry.w === img.naturalWidth && entry.h === img.naturalHeight) {
    return entry;
  }
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0);
    entry = {
      src: img.currentSrc || img.src,
      w: img.naturalWidth,
      h: img.naturalHeight,
      data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    };
  } catch (e) {
    // canvas 被跨域污染时无法读像素
    return null;
  }
  cache.set(img, entry);
  return entry;
}

/** @returns {{r:number,g:number,b:number,a:number}|null} */
export function samplePixel(img, x, y) {
  const entry = ensureImageData(img);
  if (!entry) return null;
  const xi = Math.max(0, Math.min(entry.w - 1, Math.round(x)));
  const yi = Math.max(0, Math.min(entry.h - 1, Math.round(y)));
  const i = (yi * entry.w + xi) * 4;
  return {
    r: entry.data[i],
    g: entry.data[i + 1],
    b: entry.data[i + 2],
    a: entry.data[i + 3],
  };
}

export function formatRgb(pixel) {
  if (!pixel) return '';
  return `RGB: (${pixel.r}, ${pixel.g}, ${pixel.b})`;
}
