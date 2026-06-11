# VGC Game Log 原型（web app）

依研究結論（`research/line1-tech-feasibility/`）做出的**半自動 Game Log 原型**。全在瀏覽器執行，影片不上傳。

## Pipeline

```
本地影片檔 → 定時截圖(canvas) → 關鍵影格過濾(aHash+Hamming) → 訊息框 ROI 裁切 → OCR(tesseract.js) → 可編輯事件時間軸 → 匯出 JSON
```

對應研究：
- 截圖：`02-frame-extraction-and-filtering`（用 video seek + canvas，非 ffmpeg.wasm）
- 過濾：感知雜湊比對前後影格差異
- OCR：`03-recognition-ocr`（底部訊息框是最濃訊號）
- 事件分類：`04-log-structuring`（原型版規則式，之後接字典 + 狀態機）

## 開發

```bash
npm install
npm run dev       # 開發伺服器
npm run build     # 型別檢查 + 打包到 dist/
npm run preview   # 預覽打包結果
```

## 使用

1. 選一段本地對戰影片。
2. 設定截圖間隔、關鍵影格門檻、OCR 語言。
3. 用「預覽 ROI 裁切」確認訊息框框得準（預設抓畫面底部橫帶）。
4. 「開始分析」→ 機器產出事件草稿。
5. 在時間軸校正分類與文字、刪掉雜訊，最後匯出 JSON。

## 已知限制 / 待辦

- OCR 準確度尚未用真實對戰素材實測（研究列為最高風險，待打樣）。
- 事件分類目前是粗略關鍵字規則，尚未接寶可夢 / 招式 / 特性字典做模糊校正。
- 尚未實作 OBS 虛擬攝影機即時擷取（v1）與自動分回合狀態機。
- 第三方串流網址（YouTube/Twitch）因 CORS 無法直接處理，需用螢幕分享或本地檔。

## 技術棧

React + TypeScript + Vite，tesseract.js 做純前端 OCR。
