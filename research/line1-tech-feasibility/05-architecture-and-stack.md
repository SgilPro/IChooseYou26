# 05 — 建議架構與技術棧（MVP）

## 1. 核心決策：client-only 還是 client + server？

| 考量 | client-only | client + 輕後端 |
|---|---|---|
| 影像擷取/截圖/過濾 | 必在前端（MediaStream 在瀏覽器） | 同左 |
| Tesseract.js OCR | ✅ 可純前端 | ✅ 可前端 |
| 雲端 OCR（Google Vision） | ❌ 金鑰不能放前端 | ✅ 後端代理 |
| 帳號/雲端儲存/分享 | ❌ | ✅ |
| 隱私 | 最佳（不外傳） | 視設計 |
| 開發成本 | 低 | 中 |

**建議**：**MVP 以 client-only 為主**（影像處理 + Tesseract.js 全在瀏覽器，資料存 IndexedDB），**預留一個可選的輕後端介面**給雲端 OCR 與帳號儲存（v1 啟用）。這樣 MVP 最快、隱私最好，又不堵死升級路。

理由：影像來源（MediaStream）天生只能在瀏覽器拿到；把每張影格傳後端做所有處理既慢又貴又有隱私問題。讓「重而適合本地」的事留前端，只有「需要金鑰或跨裝置」的事才上後端。

## 2. 處理放哪裡（heavy processing）

| 工作 | 位置 | 執行緒 |
|---|---|---|
| 影格擷取（drawImage） | 前端 main thread（API 限制） | main |
| 縮圖 / pHash / diff / ROI | 前端 | **Web Worker（OffscreenCanvas + createImageBitmap）** |
| OCR（Tesseract.js） | 前端 | **Web Worker**（Tesseract.js 本就跑 worker） |
| OCR（雲端，v1） | 後端代理 | serverless |
| 字典模糊比對 / FSM 結構化 | 前端 | main 或 worker（量小） |
| 持久化 | 前端 IndexedDB（MVP）/ 後端 DB（v1） | — |

關鍵原則：**main thread 只做擷取與 UI；所有分析丟 Worker**，避免畫面卡頓。

## 3. 建議技術棧（MVP）

**前端**
- **React + TypeScript**（生態成熟、型別利於複雜資料模型）。
- 建置：**Vite**。
- 狀態管理：Zustand 或 Redux Toolkit（事件流/時間軸狀態）。
- UI：任一元件庫（如 shadcn/ui、MUI）。
- 影像：原生 Canvas / OffscreenCanvas；`createImageBitmap`。
- 雜湊/過濾：`phash-js` 或自寫 DCT pHash（小、可在 worker）。
- OCR：`tesseract.js`（含 jpn / chi_tra / chi_sim / eng traineddata）。
- 影片檔抽格（如需）：`@ffmpeg/ffmpeg`（ffmpeg.wasm，需 COOP/COEP headers）。
- 儲存：**IndexedDB**（建議用 `idb` 或 `Dexie.js` 包裝），存 GameLog + 關鍵影格縮圖 Blob。
- 領域字典：打包 PokéAPI 衍生的寶可夢/招式/特性多語名稱對照表（靜態 JSON）。

**後端（v1 才需要，建議 serverless）**
- Node.js（TypeScript）/ 任一 serverless（Cloudflare Workers、Vercel、AWS Lambda）。
- 職責：① 雲端 OCR 代理（保管金鑰、轉送裁切影像）；② 帳號驗證；③ GameLog 雲端儲存/分享。
- DB：Postgres / SQLite（Turso）/ 文件型皆可，GameLog 為文件結構，文件型也合適。

**部署**
- 需 **HTTPS**（getUserMedia/getDisplayMedia 要 secure context）。
- 若用 ffmpeg.wasm，需設 `Cross-Origin-Opener-Policy: same-origin` 與 `Cross-Origin-Embedder-Policy: require-corp`（啟用 SharedArrayBuffer）。

## 4. 模組架構（前端）

```
┌─────────────────────────────────────────────┐
│ UI (React)                                    │
│  來源選擇 / 擷取控制 / 處理進度 / 復盤時間軸編輯  │
└───────────────┬───────────────────────────────┘
                │
┌───────────────▼───────────────┐
│ Ingestion 模組                  │  getUserMedia / getDisplayMedia / file
│  → MediaStream / <video>        │
└───────────────┬─────────────────┘
                │ 定時 drawImage (main)
┌───────────────▼─────────────────┐
│ Frame Sampler                    │  每秒 1~2 張 → ImageBitmap
└───────────────┬─────────────────┘
                │ postMessage
┌───────────────▼─────────────────┐  Web Worker
│ Filter 模組                      │  pHash / ROI diff / debounce
│  → 關鍵影格候選                   │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐  Web Worker
│ OCR 模組（Tesseract.js / 雲端代理）│  訊息框 ROI → 文字
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│ Parser 模組                      │  字典模糊比對 + 句型樣板 → RawEvent
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│ Structurer 模組（FSM）            │  分回合/分階段 → GameLog
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│ Store（IndexedDB）+ 復盤 UI       │
└──────────────────────────────────┘
```

## 5. 資料模型（GameLog）

見 `04-log-structuring.md` 的 `GameLog / Turn / StructuredEvent` 定義。儲存層：
- IndexedDB store `gameLogs`：GameLog 主結構（JSON）。
- IndexedDB store `frames`：`{frameId, gameLogId, thumbnailBlob}`，與事件以 `frameId` 關聯。
- v1 雲端：同結構鏡像到後端 DB；影格縮圖存物件儲存（S3/R2），事件存 DB。

## 6. 為何不選其他方案

- **不選純後端串流處理**：MediaStream 拿不到、流量/成本/延遲差、隱私差。
- **MVP 不選 WebGPU/自訓模型**：過早優化，先用現成 OCR + 規則驗證價值。
- **不選 Electron 桌面 App（MVP）**：題目是 web app；但若 OBS 整合或本機檔處理體驗不佳，Electron/Tauri 是 v2 可重新評估的退路（可直接讀檔系統、繞過瀏覽器沙箱限制）。

## 資料來源
- HTTPS / secure context 需求：https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- COOP/COEP for SharedArrayBuffer：https://ffmpegwasm.netlify.app/
- tesseract.js：https://github.com/naptha/tesseract.js/
- PokéAPI：https://pokeapi.co/
