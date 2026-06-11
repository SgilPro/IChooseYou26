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

export interface ExtractOptions {
  /** 每隔幾秒抽一張，預設 1 秒 */
  intervalSec?: number;
  /** 縮圖寬度（等比縮放），預設 240 */
  thumbWidth?: number;
  /** 進度回呼 0~1 */
  onProgress?: (p: number) => void;
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
  for (let t = 0; t < duration; t += interval) times.push(t);

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
