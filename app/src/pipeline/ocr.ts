// OCR：用 tesseract.js 辨識訊息框 / 特性 / HP 等 ROI 的文字。
// 研究（_research-ocr-and-backend）結論的可立即採用做法：
//  - 把 ROI 放大到足夠字高（字低於 ~20px 準確度崩潰）
//  - 灰階 → Otsu 二值化 →（背景偏暗時）反相 → 補白邊
//  - Tesseract：LSTM、關閉內建英文字典（會把寶可夢/招式名修壞）、分區設 PSM、
//    HP 區用數字白名單
// 純前端，語言可選（eng / chi_tra / jpn）。語言資料由 tesseract.js 自 CDN 下載。

import { createWorker, PSM, OEM, type Worker } from "tesseract.js";

let workerPromise: Promise<Worker> | null = null;
let currentLang = "";

async function getWorker(lang: string): Promise<Worker> {
  if (workerPromise && currentLang === lang) return workerPromise;
  if (workerPromise) {
    const w = await workerPromise;
    await w.terminate();
    workerPromise = null;
  }
  currentLang = lang;
  workerPromise = (async () => {
    const worker = await createWorker(lang, OEM.LSTM_ONLY);
    // 關閉內建字典：對寶可夢/招式等「非英文單字」反而會被字典修壞。
    await worker.setParameters({
      load_system_dawg: "0",
      load_freq_dawg: "0",
    });
    return worker;
  })();
  return workerPromise;
}

// ---- 影像前處理 ----

function otsuThreshold(gray: Uint8ClampedArray): number {
  const hist = new Array(256).fill(0);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0, wB = 0, maxVar = -1, threshold = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      threshold = t;
    }
  }
  return threshold;
}

export interface CropOptions {
  /** 補白邊像素，預設 12 */
  border?: number;
  /** 目標最小字高（影響放大倍率），預設讓輸出高度至少 ~180px */
  targetHeight?: number;
  /** 關閉二值化（只灰階放大），給預覽用 */
  noBinarize?: boolean;
}

/**
 * 從 canvas 裁出 ROI（相對比例 0~1），做前處理後回傳新 canvas：
 * 動態放大 → 灰階 → Otsu 二值化 →（背景偏暗時）反相 → 補白邊。
 */
export function cropROI(
  src: HTMLCanvasElement,
  roi: { x: number; y: number; w: number; h: number },
  opts: CropOptions = {}
): HTMLCanvasElement {
  const border = opts.border ?? 12;
  const targetH = opts.targetHeight ?? 180;

  const sx = Math.floor(roi.x * src.width);
  const sy = Math.floor(roi.y * src.height);
  const sw = Math.max(1, Math.floor(roi.w * src.width));
  const sh = Math.max(1, Math.floor(roi.h * src.height));

  // 動態放大倍率：小 ROI 放大更多，上限 4x。
  const factor = Math.min(4, Math.max(2, Math.ceil(targetH / sh)));
  const w = sw * factor;
  const h = sh * factor;

  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext("2d", { willReadFrequently: true })!;
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = "high";
  tctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h);

  const img = tctx.getImageData(0, 0, w, h);
  const d = img.data;
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    gray[p] = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) | 0;
  }

  if (!opts.noBinarize) {
    const th = otsuThreshold(gray);
    // 前景（少數類）若比背景亮 → 文字白於暗底，需反相成「暗字白底」。
    let whiteCount = 0;
    for (let p = 0; p < gray.length; p++) if (gray[p] >= th) whiteCount++;
    const invert = whiteCount < gray.length / 2; // 白像素為少數＝背景暗 → 反相
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      let v = gray[p] >= th ? 255 : 0;
      if (invert) v = 255 - v;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    tctx.putImageData(img, 0, 0);
  } else {
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      d[i] = d[i + 1] = d[i + 2] = gray[p];
    }
    tctx.putImageData(img, 0, 0);
  }

  // 補白邊（Tesseract 對貼邊文字較不友善）
  const out = document.createElement("canvas");
  out.width = w + border * 2;
  out.height = h + border * 2;
  const octx = out.getContext("2d")!;
  octx.fillStyle = "#fff";
  octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(tmp, border, border);
  return out;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

export interface OcrOptions {
  /** 只辨識數字（HP 區）：用數字白名單 + 單行 PSM */
  numeric?: boolean;
}

/** 對一個 canvas 做 OCR（可指定數字模式） */
export async function ocrCanvas(
  canvas: HTMLCanvasElement,
  lang = "eng",
  opts: OcrOptions = {}
): Promise<OcrResult> {
  const worker = await getWorker(lang);
  await worker.setParameters({
    tessedit_pageseg_mode: opts.numeric ? PSM.SINGLE_LINE : PSM.SINGLE_BLOCK,
    tessedit_char_whitelist: opts.numeric ? "0123456789/%" : "",
  });
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
