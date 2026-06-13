// 從本地影片檔抽出影格。
// 作法：用一個 <video> 元素 seek 到指定時間點，再 drawImage 到 canvas。
// 這是研究（02-frame-extraction）建議的做法——比 ffmpeg.wasm 快且穩定。

export interface Frame {
  /** 影片中的時間（秒） */
  t: number;
  /** 該影格的縮圖（dataURL，給時間軸顯示用） */
  thumb: string;
  /** 全解析度灰階用的小尺寸 ImageData（給 pHash / OCR ROI 取用） */
  canvas: HTMLCanvasElement;
}

/** 要保留的時間段（秒）。整段擷取只發生在這些範圍內。 */
export interface Segment {
  start: number;
  end: number;
}

export interface ExtractOptions {
  /** 每隔幾秒抽一張，預設 1 秒 */
  intervalSec?: number;
  /** 縮圖寬度（等比縮放），預設 240 */
  thumbWidth?: number;
  /** 只擷取這些時間段內的影格；省略或空陣列代表整支影片 */
  segments?: Segment[];
  /** 進度回呼 0~1 */
  onProgress?: (p: number) => void;
}

/** 判斷時間 t 是否落在任一保留段內 */
function inSegments(t: number, segments?: Segment[]): boolean {
  if (!segments || segments.length === 0) return true;
  return segments.some((s) => t >= s.start && t <= s.end);
}

/** 載入影片檔成可 seek 的 <video> 元素 */
export function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error("無法載入影片，格式可能不被瀏覽器支援。"));
  });
}

function seek(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = Math.min(t, Math.max(0, video.duration - 0.05));
  });
}

/** 依固定間隔抽出所有影格 */
export async function extractFrames(
  video: HTMLVideoElement,
  opts: ExtractOptions = {}
): Promise<Frame[]> {
  const interval = opts.intervalSec ?? 1;
  const thumbW = opts.thumbWidth ?? 240;
  const duration = video.duration;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = thumbW / vw;
  const thumbH = Math.round(vh * scale);

  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = vw;
  fullCanvas.height = vh;
  const fullCtx = fullCanvas.getContext("2d", { willReadFrequently: true })!;

  const frames: Frame[] = [];
  const times: number[] = [];
  for (let t = 0; t < duration; t += interval) {
    if (inSegments(t, opts.segments)) times.push(t);
  }

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    await seek(video, t);
    fullCtx.drawImage(video, 0, 0, vw, vh);

    // 縮圖
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = thumbW;
    thumbCanvas.height = thumbH;
    thumbCanvas.getContext("2d")!.drawImage(fullCanvas, 0, 0, thumbW, thumbH);

    // 保留一份全解析度 canvas 的拷貝（給後續 ROI / OCR）
    const keep = document.createElement("canvas");
    keep.width = vw;
    keep.height = vh;
    keep.getContext("2d")!.drawImage(fullCanvas, 0, 0);

    frames.push({ t, thumb: thumbCanvas.toDataURL("image/jpeg", 0.7), canvas: keep });
    opts.onProgress?.((i + 1) / times.length);
  }

  return frames;
}

/** 把上傳的截圖們轉成 Frame[]（給 OCR 打樣 / 圖片來源用）。t 用索引代替時間。 */
export function framesFromImages(files: File[], thumbWidth = 240): Promise<Frame[]> {
  return Promise.all(
    files.map(
      (file, i) =>
        new Promise<Frame>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const full = document.createElement("canvas");
            full.width = img.naturalWidth;
            full.height = img.naturalHeight;
            full.getContext("2d")!.drawImage(img, 0, 0);
            const scale = thumbWidth / img.naturalWidth;
            const thumb = document.createElement("canvas");
            thumb.width = thumbWidth;
            thumb.height = Math.round(img.naturalHeight * scale);
            thumb.getContext("2d")!.drawImage(full, 0, 0, thumb.width, thumb.height);
            URL.revokeObjectURL(img.src);
            resolve({ t: i, thumb: thumb.toDataURL("image/jpeg", 0.7), canvas: full });
          };
          img.onerror = () => reject(new Error("無法載入圖片：" + file.name));
          img.src = URL.createObjectURL(file);
        })
    )
  );
}

/** 從已載入的影片抓單一時間點的全解析度影格（給 ROI crop 介面取一張參考圖用）。 */
export async function captureFrame(video: HTMLVideoElement, t: number): Promise<HTMLCanvasElement> {
  await seek(video, t);
  const c = document.createElement("canvas");
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext("2d")!.drawImage(video, 0, 0);
  return c;
}
