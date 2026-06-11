# 02 — 影格擷取與關鍵影格過濾

本文件涵蓋：如何從 MediaStream 或影片檔抓出影格、效能與建議間隔、暫存策略，以及如何「便宜地」過濾出有用的關鍵影格。

## A. 影格擷取（Frame Extraction）

### A1. 從 MediaStream / `<video>` 用 canvas 抓圖（即時來源主用）

最通用的方法：把 stream 接到隱藏 `<video>`，定時把當前畫面用 `CanvasRenderingContext2D.drawImage(video, ...)` 畫到 canvas，再 `toBlob()` / `getImageData()`。

兩種觸發節奏：
- **`setInterval`（建議用於本專案）**：每 N 毫秒抓一張（例如每 1000ms）。簡單、可控、符合「定時截圖」需求。
- **`requestVideoFrameCallback()`**：在每個新影格送到 compositor 時觸發，是做「逐影格」處理最有效率的方式，已在 Chrome/Edge/Safari 出貨多時。([MDN rVFC](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)、[web.dev rVFC](https://web.dev/articles/requestvideoframecallback-rvfc))
  - 觸發頻率取「影片幀率」與「瀏覽器繪製頻率」中較低者，比 `requestAnimationFrame`（約 60fps）更貼合影片本身。([MDN rVFC](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback))
  - 缺點：不保證每一影格都被處理；`drawImage`/`grabFrame` 需在 main thread 執行（取得 video 元素）。([webrtcHacks](https://webrtchacks.com/real-time-video-processing-with-webcodecs-and-streams-processing-pipelines-part-1/))

**本專案建議**：用 `setInterval` 每秒抓 1～2 張作為「採樣」，因為我們不需要每一影格、只需要每秒掃描是否有變化。rVFC 留作未來需要更精細時序時的選項。

### A2. 從影片檔抓圖：canvas seek 法 vs ffmpeg.wasm

**做法 1（建議優先）：`<video>` + 程式化 seek + canvas**
- 程式設定 `video.currentTime = t`，等 `seeked` 事件後 `drawImage` 截圖，再跳下一個 t。
- 優點：用瀏覽器原生解碼（含硬體加速），記憶體壓力小，免載 ~30MB wasm。
- 適合「每秒抽 1 張」這種稀疏採樣。

**做法 2：ffmpeg.wasm**
- 可用 `-ss`（seek）與 `-vframes`（張數）抽 PNG/JPEG。([Transloadit: ffmpeg.wasm thumbnails](https://transloadit.com/devtips/extract-thumbnails-from-videos-in-browsers-with-ffmpeg-wasm/))
- **效能警告**：WASM 約比原生慢 5～20 倍；瓶頸常在虛擬檔案系統 I/O——有案例顯示「從 3.3MB / 10 秒影片抽 100 張，frame extraction 只花約 300ms，但檔案寫入花了約 25 秒」。([ffmpeg.wasm issue #298](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/298))
- 需要 `SharedArrayBuffer` + Cross-Origin Isolation（伺服器須回 `COOP`/`COEP` headers）才能多執行緒；iOS Safari（截至 iOS 17）Web Worker 不支援 SharedArrayBuffer，是相容性雷。([Dayverse](https://dayverse.id/en/articles/why-ffmpeg-wasm-fails-leverage-gpu-acceleration/))

**結論**：稀疏採樣（每秒 1 張）用 canvas seek 法即可，**MVP 不需要 ffmpeg.wasm**。只有未來需要逐影格高密度抽取或容器格式怪異時才考慮 ffmpeg.wasm。

### A3. 效能與執行緒

- canvas 截圖每秒 1～2 張對 CPU 幾乎無感。
- `drawImage` 需在 main thread；但**之後的影像分析（hash、diff、OCR 前處理）應丟到 Web Worker**，避免卡 UI。可用 `OffscreenCanvas` + `createImageBitmap` 把像素資料搬到 Worker。

## B. 暫存策略（Storage of Frames）

- **不要把每張原圖都長期留著**——一場對戰幾分鐘、每秒 1 張可達數百張。
- 流程設計為「擷取 → 立即做關鍵影格判斷 → 只保留關鍵影格」。
- 關鍵影格縮圖建議存 **IndexedDB**（可存 Blob，容量遠大於 localStorage）。
- 原始全解析度影格只在「送 OCR」當下短暫持有，OCR 完即可釋放，只留縮圖 + 辨識出的文字事件。
- 記憶體控管：用環狀緩衝（ring buffer）只保留最近 N 張原圖供 diff 比較。

## C. 關鍵影格過濾（Useful-Frame Filtering）

目標：把「每秒一張的大量截圖」濃縮成「有事情發生的那幾張」。分兩層：**便宜的變化偵測** + **針對寶可夢 UI 的規則**。

### C1. 便宜的變化偵測

1. **感知雜湊（perceptual hash, pHash）**：把畫面縮到 32×32、轉灰階、做 DCT、取左上低頻 8×8、與中位數比較產生 64-bit 指紋；前後影格指紋的 **Hamming distance** 大就代表畫面有顯著變化（場景切換）。([fast_scene_detection](https://github.com/nyavramov/fast_scene_detection)、[phash-js](https://github.com/freearhey/phash-js)、[context.dev pHash](https://www.context.dev/blog/perceptual-hashing-in-node-js-with-sharp-phash-for-developers))
   - 優點：極省算力、可在 Worker 跑、對小雜訊（HP 條輕微動畫）不敏感。
   - 有純 JS / 瀏覽器版（phash-js）。
2. **像素差分（frame diff）**：對縮圖逐像素相減取絕對值總和，超過閾值視為變化。比 pHash 更直觀但對動畫更敏感，適合搭配 ROI 使用。

### C2. 針對寶可夢戰鬥 UI 的「分區（ROI）」啟發式規則

整張畫面比對太粗。應切出固定區域分別判斷（座標需依實際解析度／介面校準）：

| ROI 區域 | 偵測目的 | 方法 |
|---|---|---|
| **底部訊息框** | 出現新文字 = 有事件（出招、特性發動、狀態變化） | 該區 pHash/diff 變化 → 觸發 OCR。**這是最重要的訊號。** |
| **雙方 HP 條** | HP 增減 = 受傷/回復 | 偵測 HP 條長度／顏色（綠→黃→紅）變化 |
| **狀態圖示列** | 中毒/麻痺/灼傷等狀態 icon 出現或消失 | 該區 diff；icon 比對 |
| **指令選單（戰鬥/招式/換人）** | 出現 = 進入「選擇階段」，回合邊界訊號 | 偵測選單 UI 的特徵（固定排版/按鈕） |
| **天氣/場地特效層** | 晴天/雨/電氣場地等 | 整體色調或角落 icon |

實務啟發式：
- 「**底部訊息框內容改變**」是最高優先觸發條件——寶可夢戰鬥幾乎所有事件都會在訊息框打字說明（「○○使用了△△！」「□□的特性◇◇發動了！」），文字是最豐富、最可靠的訊號。
- 為避免「打字動畫中途」截到半行字，採「**偵測到訊息框變化 → 等到該區 pHash 連續 K 張穩定（文字打完）→ 才送 OCR**」的去抖（debounce）策略。
- HP 條變化可作為「傷害事件」的輔助標記，但 HP 條有動畫漸變，需等穩定後讀終值。

### C3. 過濾管線（pipeline）

```
每秒影格
  → 縮圖 (Worker)
  → 各 ROI pHash
  → 與上一張比 Hamming distance
      ├ 無顯著變化 → 丟棄
      └ 訊息框/HP/狀態 有變化
            → debounce 等穩定
            → 標記為「關鍵影格候選」
            → 存縮圖 + 全解析度供 OCR
```

## 建議參數（待打樣調整）

- 採樣間隔：先試 **1 張/秒**；若漏事件再加密到 2～3 張/秒。
- pHash Hamming 閾值：訊息框區先試 5～10（需依實機校準）。
- 去抖：訊息框連續 2～3 張 pHash 穩定才判定文字打完。

> 這些數字**沒有真實對戰素材就只能猜**，列為首要打樣項目（見 07）。

## 資料來源
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback
- https://web.dev/articles/requestvideoframecallback-rvfc
- https://webrtchacks.com/real-time-video-processing-with-webcodecs-and-streams-processing-pipelines-part-1/
- https://transloadit.com/devtips/extract-thumbnails-from-videos-in-browsers-with-ffmpeg-wasm/
- https://github.com/ffmpegwasm/ffmpeg.wasm/issues/298
- https://dayverse.id/en/articles/why-ffmpeg-wasm-fails-leverage-gpu-acceleration/
- https://github.com/nyavramov/fast_scene_detection
- https://github.com/freearhey/phash-js
- https://www.context.dev/blog/perceptual-hashing-in-node-js-with-sharp-phash-for-developers
