# VGC Game Log 原型（web app）

依研究結論（`research/line1-tech-feasibility/`）做出的**半自動 Game Log 原型**。全在瀏覽器執行，影片不上傳。

## Pipeline

```
影片來源 → 時間段過濾 → 定時截圖(canvas) → 多塊 ROI 關鍵影格過濾(aHash+Hamming) → 各 ROI OCR(tesseract.js) → 可編輯事件時間軸 → 匯出 JSON
```

影片來源：本地影片檔，或貼 YouTube 連結（需本機 `server/` 後端，見下）。

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

1. **選影片來源**：上傳本地影片，或（若本機有跑 `server/` 後端）貼 YouTube 連結取得影片，可指定下載區段。
2. **擷取與辨識設定**：截圖間隔、關鍵影格門檻、OCR 語言、最低信心（先濾掉低品質辨識可大幅減雜訊）。
3. **時間段**：可加多段只分析特定區間，去頭去尾、甚至剪掉直播多局之間的畫面。
4. **ROI 多塊裁切**：上傳一張截圖或從影片抓一格，在圖上拖曳畫框定義多塊 ROI（預設 4 塊：對方 HP / 我方 HP / 核心 GameLog / 特性發動），可拖動移動、用表格微調，並設定每塊是否做 OCR / 是否納入關鍵影格判定。
5. **開始分析** → 機器對每張關鍵影格的每塊 ROI 做 OCR，產出標記來源的事件草稿。
6. 在時間軸**校正**分類與文字、刪掉雜訊，最後匯出 JSON。

## YouTube 來源（需本機後端）

純前端無法下載 YouTube（CORS + 簽章 URL + n 節流）。要啟用「貼 URL」來源，請在 `server/` 跑本地 yt-dlp 後端，見 `server/README.md`。僅供本機分析自己的錄影。

## 已知限制 / 待辦

- OCR 準確度尚未用真實對戰素材實測（研究列為最高風險，待打樣）。
- 事件分類目前是粗略關鍵字規則，尚未接寶可夢 / 招式 / 特性字典做模糊校正。
- HP 區 OCR 尚未做數字專用前處理（white-list digits）。
- 尚未實作 OBS 虛擬攝影機即時擷取與自動分回合狀態機。

## 技術棧

React + TypeScript + Vite，tesseract.js 做純前端 OCR。YouTube 來源用本機 Node/Express + yt-dlp 後端（`server/`）。
