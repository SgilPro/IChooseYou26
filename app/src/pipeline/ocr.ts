// OCR：用 tesseract.js 辨識訊息框 ROI 的文字。
// 研究（03）結論：底部訊息框文字是最濃、最可靠的訊號。
// 純前端，語言可選（eng / chi_tra / jpn）。語言資料由 tesseract.js 自 CDN 下載。

import { createWorker, type Worker } from "tesseract.js";

let workerPromise: Promise<Worker> | null = null;
let currentLang = "";

async function getWorker(lang: string): Promise<Worker> {
  if (workerPromise && currentLang === lang) return workerPromise;
  if (workerPromise) {
    const w = await workerPromise;
    await w.terminate();
  }
  currentLang = lang;
  workerPromise = createWorker(lang);
  return workerPromise;
}

/** 從 canvas 裁出 ROI（相對比例 0~1），回傳一個新的 canvas，並做簡單前處理（放大 + 灰階）。 */
export function cropROI(
  src: HTMLCanvasElement,
  roi: { x: number; y: number; w: number; h: number },
  upscale = 2
): HTMLCanvasElement {
  const sx = Math.floor(roi.x * src.width);
  const sy = Math.floor(roi.y * src.height);
  const sw = Math.max(1, Math.floor(roi.w * src.width));
  const sh = Math.max(1, Math.floor(roi.h * src.height));

  const out = document.createElement("canvas");
  out.width = sw * upscale;
  out.height = sh * upscale;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);

  // 灰階 + 提高對比，幫助 OCR
  const img = ctx.getImageData(0, 0, out.width, out.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = g > 128 ? Math.min(255, g * 1.2) : Math.max(0, g * 0.8);
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

/** 對一個 canvas 做 OCR */
export async function ocrCanvas(canvas: HTMLCanvasElement, lang = "eng"): Promise<OcrResult> {
  const worker = await getWorker(lang);
  const { data } = await worker.recognize(canvas);
  return { text: data.text.trim(), confidence: data.confidence };
}

export async function disposeOcr() {
  if (workerPromise) {
    const w = await workerPromise;
    await w.terminate();
    workerPromise = null;
    currentLang = "";
  }
}
