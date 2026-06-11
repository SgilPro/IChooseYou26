# 01 — 瀏覽器影像來源擷取（Video Ingestion）

本文件討論「如何在瀏覽器中拿到對戰畫面」的所有可行途徑、權限模型與限制。

## 1. 候選途徑總覽

| 途徑 | API | 適用情境 | 可行性 |
|---|---|---|---|
| OBS 虛擬攝影機 | `getUserMedia` | OBS + 擷取卡接 Switch，即時 | 🟢 **最推薦** |
| 螢幕／視窗／分頁分享 | `getDisplayMedia` | 使用者邊看直播邊擷取 | 🟢 可行 |
| 一般 webcam / 擷取卡裝置 | `getUserMedia` | 擷取卡直接被當 webcam | 🟢 可行 |
| 本機影片檔 | `<input type=file>` + `<video>` | 事後復盤錄影 | 🟢 **MVP 首選** |
| 第三方串流網址（YouTube/Twitch） | `<video>` + canvas | 看別人直播 | 🔴 **基本走不通**（CORS） |

## 2. OBS 虛擬攝影機（最推薦的即時來源）

OBS Studio 內建「Virtual Camera」功能，會把 OBS 場景輸出成一個系統層級的攝影機裝置，任何能讀 webcam 的應用程式（Zoom、Discord、瀏覽器）都能讀到它。([OBS Virtual Camera Guide](https://obsproject.com/kb/virtual-camera-guide))

流程：
1. 使用者把 Switch 經擷取卡的畫面拉進 OBS。
2. OBS 開「Start Virtual Camera」。
3. 我們的網頁用 `navigator.mediaDevices.getUserMedia({ video: { deviceId } })` 讀取，並用 `enumerateDevices()` 列出所有 `kind === 'videoinput'` 的裝置讓使用者選「OBS Virtual Camera」。([MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia))

注意事項：
- `enumerateDevices()` 在使用者尚未授權前，回傳的裝置 `label` 會是空字串，必須先取得攝影機權限才看得到「OBS Virtual Camera」這個名字，因此 UI 流程要「先授權 → 再列裝置選擇」。
- 瀏覽器可能因使用者偏好覆寫我們指定的 `deviceId`，需提供讓使用者重選的入口。([MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia))
- 優點：畫面乾淨（只有遊戲，沒有桌面其他東西）、解析度可控、CORS 不是問題（同源 MediaStream，canvas 不會被 taint）。

## 3. 螢幕擷取 API（getDisplayMedia）

`navigator.mediaDevices.getDisplayMedia()` 會跳出系統選單讓使用者選擇要分享的「整個螢幕 / 某個視窗 / 某個瀏覽器分頁」，回傳一個含 video track（audio 為選配）的 MediaStream。Chrome、Edge、Firefox 皆支援。([MDN getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)、[MDN Using Screen Capture](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture))

特性與限制：
- `video` 省略或設 `true` 時必含 video track；若顯式設 `false` 會丟 `TypeError`（此 API 強制要有畫面）。([MDN getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia))
- audio 永遠是「盡力而為」，不保證拿得到。
- **每次呼叫都會跳系統權限提示**，無法靜默背景擷取；使用者選了哪個來源由使用者決定，不能程式指定。
- 適合「使用者用瀏覽器分頁看直播 / 用某播放器播影片」時，分享那個視窗或分頁。
- 缺點：畫面可能含播放器邊框、聊天室等雜訊，需靠 ROI 裁切（見 02）。

## 4. 擷取卡當 webcam

很多 USB 擷取卡（如 Elgato）會直接以 UVC webcam 形式出現在系統，瀏覽器可用 `getUserMedia` 直接讀，省去 OBS。流程與第 2 節相同，差別只是裝置名稱不同。對使用者最少步驟，但畫面是整張 Switch 輸出（含上下黑邊等），需 ROI 處理。

## 5. 本機影片檔（MVP 首選）

使用者用 `<input type="file" accept="video/*">` 選一段錄好的對戰影片，建 `URL.createObjectURL(file)` 餵給 `<video>`。
- 同源 blob URL，canvas 不會被 taint，可自由截圖。
- 可離線、可重複處理、可任意 seek，是**驗證 OCR 與規則最理想的素材**，因此列為 MVP 首選輸入。
- 大檔可搭配 ffmpeg.wasm 做影格抽取（見 02），但要注意效能與 SharedArrayBuffer 需求。

## 6. 第三方串流網址（YouTube / Twitch）— 不建議

技術上若把外站影片 URL 塞進 `<video>` 再 canvas 截圖，**會觸發「tainted canvas」**：瀏覽器為防跨域偷資料，一旦畫到跨域內容，`getImageData / toDataURL / toBlob` 全被封鎖。([Tainted Canvas — corsfix](https://corsfix.com/blog/tainted-canvas))

- 解法理論上是 `crossOrigin="anonymous"` + 對方伺服器回 `Access-Control-Allow-Origin`，但 **YouTube / Twitch 不會為你開 CORS**。([overengineer: CORS for video screenshots](http://overengineer.net/enabling-cors-for-html5-video-element-screenshots))
- YouTube 官方 iframe 嵌入播放器也會產生 CORS 錯誤且無法存取像素。([Google Issue Tracker 240387105](https://issuetracker.google.com/issues/240387105))
- 唯一繞法是後端代理拉串流再轉送（法律/條款風險高、工程量大），或寫瀏覽器擴充功能（content script 在 youtube.com 上直接抓 native video 可避開 taint，([DEV: Chrome extension YouTube screenshots](https://dev.to/akshit_suthar/i-built-a-chrome-extension-that-captures-youtube-screenshots-at-custom-intervals-even-10-hour-2gjp))），但那已不是單純 web app。

**結論：MVP 與 v1 不支援第三方串流網址直接擷取。** 若使用者想處理 YouTube 直播，引導他用 getDisplayMedia 分享播放分頁（截的是顯示出來的像素，繞過 taint）。

## 7. WebRTC 角色

WebRTC 在本專案**不是必要**。它解決的是「把 MediaStream 即時傳給遠端對等方」；我們的處理是本地進行，不需要把畫面傳出去。除非未來要做「即時把擷取畫面送到後端伺服器做雲端辨識」，才會用到 WebRTC 或單純的影格上傳。MVP 不需要。

## 8. 權限與授權模型小結

- `getUserMedia` / `getDisplayMedia` 都需要 **secure context（HTTPS 或 localhost）**。
- 都會跳使用者授權提示，無法靜默。
- `getUserMedia` 權限可被記住；`getDisplayMedia` 每次擷取通常都要重新選來源。
- 裝置 `label` 需授權後才可見 → UI 須引導「先授權再選裝置」。

## 建議

| 階段 | 支援來源 |
|---|---|
| MVP | 本機影片檔（驗證辨識/規則最方便） |
| v1 | + OBS 虛擬攝影機 / 擷取卡 webcam（即時擷取） |
| v1.5 | + getDisplayMedia（看直播分頁） |
| 不做 | 直接吃 YouTube/Twitch URL |

## 資料來源
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
- https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://obsproject.com/kb/virtual-camera-guide
- https://corsfix.com/blog/tainted-canvas
- http://overengineer.net/enabling-cors-for-html5-video-element-screenshots
- https://issuetracker.google.com/issues/240387105
- https://dev.to/akshit_suthar/i-built-a-chrome-extension-that-captures-youtube-screenshots-at-custom-intervals-even-10-hour-2gjp
