# 07 — 風險、未知數與待打樣項目

## 1. 風險登記表（依嚴重度排序）

| # | 風險 | 嚴重度 | 可能性 | 說明 | 緩解 |
|---|---|---|---|---|---|
| R1 | **OCR 對遊戲字體準確度不足** | 高 | 中高 | 遊戲字體含描邊/漸層/半透明，非標準印刷體；Tesseract.js 對 CJK 與非文件場景準確度未知。([Tesseract.js 限制](https://transloadit.com/devtips/integrating-ocr-in-the-browser-with-tesseract-js/)) | 前處理（裁切/放大/二值化）；字典模糊比對校正；備援雲端 OCR（Google Vision 字元辨識強，$1.5/1000）([pricing](https://www.buildmvpfast.com/api-costs/ocr)) |
| R2 | **規則覆蓋率不足**（特性/招式/狀態太多） | 高 | 高 | 寶可夢互動極多且每代新增 | 先覆蓋常見事件，unknown 原文呈現交人工；隨樣本擴充 |
| R3 | **關鍵影格過濾漏抓 / 多抓** | 中高 | 中 | 閾值需依實機調；打字動畫造成半行字或重複 | debounce 去抖、ROI 分區、UI 可手動補/併 |
| R4 | **第三方串流 URL 走不通（CORS taint）** | 中 | 確定 | YouTube/Twitch 不開 CORS，canvas 被 taint。([tainted canvas](https://corsfix.com/blog/tainted-canvas)) | 改走 getDisplayMedia 分享分頁；產品層面排除此輸入 |
| R5 | **OBS 虛擬攝影機相容性 / 解析度** | 中 | 中 | 不同 OS/瀏覽器/擷取卡行為不一；瀏覽器可能覆寫 deviceId。([getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)) | 提供裝置重選、解析度約束、教學 |
| R6 | **ffmpeg.wasm 效能 / I/O 瓶頸 / iOS 不支援** | 中 | 中 | WASM 慢 5–20x；VFS 寫檔極慢；iOS Safari worker 無 SharedArrayBuffer。([ffmpeg #298](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/298)、[Dayverse](https://dayverse.id/en/articles/why-ffmpeg-wasm-fails-leverage-gpu-acceleration/)) | 稀疏採樣改用 `<video>` seek+canvas，避免 ffmpeg.wasm |
| R7 | **即時擷取時主執行緒卡頓** | 中 | 中 | drawImage 須在 main thread；OCR 重 | 採樣稀疏化、分析全進 Web Worker、OffscreenCanvas |
| R8 | **多語系維護成本** | 中 | 中 | 各語言句型樣板 + 字典 + OCR 模型 | MVP 先 1–2 語言；字典自 PokéAPI 衍生 |
| R9 | **雲端 OCR 成本 / 隱私** | 低中 | 中 | 每張花錢、畫面外傳 | 只送裁切訊息框 ROI、只送關鍵影格；提供純前端模式 |
| R10 | **回合邊界誤判（戲法空間等特例）** | 中 | 中 | 速度反轉、同優先度等 | FSM 加特例規則；UI 可手動修正回合切分 |
| R11 | **背景分頁降頻 / 中途關閉遺失** | 低 | 中 | 瀏覽器背景節流 | 提示保持前景；階段性寫 IndexedDB |

## 2. 主要未知數（沒實測就無法承諾）

1. **真實對戰截圖的 OCR 準確率**（最關鍵）——決定整個產品成立與否。
2. **每秒 1 張的採樣率是否會漏關鍵事件**（快速連續敘事）。
3. **pHash / diff 閾值與 ROI 座標**的最佳值。
4. **OBS 虛擬攝影機在目標使用者環境的實際相容性與畫質**。
5. **一場對戰處理時間與資源占用**（即時 vs 影片檔）。

## 3. 建議打樣順序（先驗證高風險）

### 原型 P1 — OCR 準確度測試（最優先，數天）
- 蒐集 50～100 張**真實對戰截圖**（不同語言、不同版型、不同寶可夢）。
- 手工標出底部訊息框 ROI，做前處理（放大/灰階/二值化）。
- 跑三組對照：① Tesseract.js 原圖 ② Tesseract.js 前處理後 ③ Google Vision。
- 量測：字元正確率、事件可解析率（套句型樣板後正確分類比例）。
- **產出決策**：MVP OCR 走純前端還是必須雲端、是否需 ROI 校準。

### 原型 P2 — 擷取 + 過濾管線（數天）
- OBS 虛擬攝影機 → `getUserMedia` → `<video>` → 每秒 canvas 截圖。
- ROI pHash 過濾 + debounce，跑一整場真實對戰。
- 量測：總採樣張數、留下的關鍵影格數、人工核對「漏抓 / 多抓」比例。
- **產出決策**：採樣間隔、閾值、是否需提高採樣率。

### 原型 P3 — 端到端最小整合（P1/P2 後）
- 影片檔 → 截圖 → 過濾 → OCR → 字典比對 → FSM 分回合 → 輸出 JSON 時間軸。
- 對 1～2 場完整對戰，人工比對產出 GameLog 與實際對戰的吻合度。
- **產出決策**：MVP 範圍與準確度承諾、規則優先涵蓋清單。

## 4. 成功門檻建議（給產品決策）

- 訊息框事件「可解析率」（前處理 + 字典校正後）若達 **≥ 85%**，半自動 + 人工校正的產品體驗成立。
- 若 < 60%，需重新評估（強制雲端 OCR、或縮小語言/版型範圍、或改桌面 App 直接讀更高畫質）。

## 5. 法律 / 條款備註（非技術但需留意）

- 擷取第三方直播畫面、轉存內容可能涉及平台條款與著作權；**直接代理拉 YouTube/Twitch 串流風險高**，本研究已建議不做。使用者擷取自己對戰錄影風險最低。

## 資料來源
- https://transloadit.com/devtips/integrating-ocr-in-the-browser-with-tesseract-js/
- https://www.buildmvpfast.com/api-costs/ocr
- https://corsfix.com/blog/tainted-canvas
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://github.com/ffmpegwasm/ffmpeg.wasm/issues/298
- https://dayverse.id/en/articles/why-ffmpeg-wasm-fails-leverage-gpu-acceleration/
