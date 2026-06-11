# 03 — 截圖轉文字（辨識 / OCR）

> **這是整個專案技術風險最高、最需要打樣的環節。** 以下分析力求誠實標示不確定處。

## 1. 為什麼以「訊息框文字」為主訊號

寶可夢對戰幾乎每個關鍵事件都會在底部訊息框以自然語言描述：
- 出招：「胡帕 使用了 暗影球！」
- 特性：「胡帕 的 威嚇 發動了！」「肯泰羅 的 不服輸！」
- 換人：「○○，就決定是你了！」「○○ 縮回了寶可夢球！」
- 狀態：「○○ 中毒了！」「○○ 因中毒受到了傷害！」
- 結算：「天氣很晴朗。」等

因此**主要策略 = OCR 訊息框 → 文字比對到事件字典**，而非從 sprite 影像辨識。文字訊號最豐富、最確定。

## 2. OCR 引擎選項

### 2A. Tesseract.js（純瀏覽器端）

- 純 JS / WebAssembly port of Tesseract 5，整個跑在瀏覽器分頁，免後端、免上傳、隱私佳。([naptha/tesseract.js](https://github.com/naptha/tesseract.js/)、[tesseract.projectnaptha.com](https://tesseract.projectnaptha.com/))
- 支援日文 `jpn`（含直書 `jpn_vert`）、簡中 `chi_sim`、繁中 `chi_tra`、英文等 100+ 語言，可同時載多語。([naptha/tesseract.js](https://github.com/naptha/tesseract.js/))
- **成本**：免費、無 API 費用、無網路往返。
- **限制 / 風險**：
  - 對低解析度、模糊影像表現差。([Transloadit Tesseract.js](https://transloadit.com/devtips/integrating-ocr-in-the-browser-with-tesseract-js/))
  - 瀏覽器內資源受限，速度與準確度可能不如原生 Tesseract。([Tarkarn blog](https://tarkarn.com/blog/tesseractjs-browser-ocr-guide))
  - 模型檔大：WASM core 約 2MB，每個語言 traineddata 約 5～15MB，首次載入需下載。([Transloadit Tesseract.js](https://transloadit.com/devtips/integrating-ocr-in-the-browser-with-tesseract-js/))
  - **遊戲字體不是標準印刷體**，且常有描邊、漸層底、半透明框——Tesseract 對這種「非文件」場景的準確度**未知，必須實測**。

### 2B. 雲端 OCR（Google Cloud Vision / Azure / AWS Textract）

- Google Cloud Vision：對「個別字元辨識」是最強的開箱即用工具之一。([Programming Historian](https://programminghistorian.org/en/lessons/ocr-with-google-vision-and-tesseract))
- 定價：**$1.50 / 1,000 次** 影像標註請求，每月每功能前 1,000 次免費；超過 500 萬次降為 $1.00/1,000。([buildmvpfast Google Vision pricing](https://www.buildmvpfast.com/api-costs/ocr)、[sparkco.ai](https://sparkco.ai/blog/comparing-ocr-apis-abbyy-tesseract-google-azure))
- 準確度明顯高於 Tesseract（尤其字元層級）。([Medium: Tesseract vs Google Vision](https://medium.com/ixor/comparing-tesseract-ocr-with-google-vision-ocr-for-text-recognition-in-invoices-bddf98f3f3bd))
- **代價**：需後端代理（金鑰不能放前端）、需網路、每張圖花錢、有隱私考量。
- 成本估算：若每場關鍵影格約 50～150 張，一場約 $0.08～$0.23 美元；要看使用量是否可接受。

### 2C. 建議策略

採「**漸進增強 / 可切換後端**」：
1. **MVP 先用 Tesseract.js** 試準確度（零成本、純前端）。
2. 同步做 A/B 打樣：同一批截圖也送 Google Vision 比準確度。
3. 若 Tesseract.js 對遊戲字體準確度不足（很可能），v1 改為「**前端送關鍵影格的訊息框裁切區到後端 → 雲端 OCR**」。只送裁切後的小區、且只送關鍵影格，可大幅壓低成本與流量。
4. 進階：自行用遊戲字體微調 OCR 模型，但工程量大，非 MVP。

## 3. 提升 OCR 準確度的前處理（重要）

不論用哪個引擎，前處理對遊戲畫面很關鍵：
- **只裁訊息框 ROI** 送 OCR，不要送整張畫面（更快更準）。
- 放大（upscale）、轉灰階、提高對比、二值化（thresholding）。
- 若字是淺色描邊深色底，做反相。
- 固定遊戲解析度時，ROI 座標可寫死或提供校準步驟。

## 4. 文字 → 結構化事件：字典比對而非純辨識

OCR 出來的字串不直接信，而是**比對寶可夢領域字典**做容錯校正：
- 維護字典：寶可夢名、招式名、特性名、狀態名（多語系）。資料可來自 PokéAPI 等公開資料。
- 用模糊比對（Levenshtein / 編輯距離）把 OCR 結果對到最近的合法詞條，修正小錯字。
- 用句型樣板（templates / regex）抽出事件結構，例如：
  - `(?<pokemon>.+) 使用了 (?<move>.+)！` → `{type: "move", pokemon, move}`
  - `(?<pokemon>.+) 的 (?<ability>.+) 發動了` → `{type: "ability", pokemon, ability}`
  - 換人、狀態、傷害各有樣板。
- 這層讓「OCR 有點小錯」仍能正確分類事件，是準確度的關鍵保險。

## 5. 從 sprite / 影像辨識寶可夢、招式、HP（輔助，非主力）

- **寶可夢辨識**：理論上可比對 sprite 圖庫或訓練分類器，但角度/動畫/Z 招特效變化大，難度高、準確度不穩。MVP **不做**；先靠訊息框文字得知是哪隻寶可夢。
- **HP 條**：用顏色（綠/黃/紅）與長度估算百分比相對可行，可作輔助標記傷害量，但精準數值（VGC 不顯示確切 HP 數字）讀不到，只能估比例。列為 v2。
- **狀態圖示**：固定 icon 用模板比對（template matching）可行，作為訊息框文字的交叉驗證。

## 6. 多語系考量

- 遊戲語言由使用者設定決定（日/繁中/簡中/英…）。
- 訊息框句型與字典需對應該語言；建議**讓使用者在開始前選遊戲語言**，載入對應 OCR 模型 + 字典 + 句型樣板。
- 日文有漢字+假名混排、可能直書；繁中字形複雜——Tesseract 對 CJK 準確度普遍低於拉丁字母，**雲端 OCR 在 CJK 上優勢更明顯**，這會推動 v1 走雲端 OCR。

## 7. 可行性與準確度預期（誠實版）

| 項目 | 預期 | 信心 |
|---|---|---|
| 訊息框英文 OCR（雲端） | 高準確 | 中高 |
| 訊息框 CJK OCR（雲端） | 中高準確 | 中 |
| 訊息框 OCR（Tesseract.js, 遊戲字體） | **未知，可能偏低** | 低（必測） |
| 字典比對校正後事件分類 | 顯著提升正確率 | 中高 |
| sprite 辨識寶可夢 | 不穩 | 低（MVP 不做） |
| HP 條比例估算 | 約略可行 | 中（v2） |

**核心不確定性**：沒有真實對戰截圖實測前，無法保證 OCR 準確度。**第一個原型就該做 OCR 準確度測試（見 07）。**

## 資料來源
- https://github.com/naptha/tesseract.js/
- https://tesseract.projectnaptha.com/
- https://transloadit.com/devtips/integrating-ocr-in-the-browser-with-tesseract-js/
- https://tarkarn.com/blog/tesseractjs-browser-ocr-guide
- https://www.buildmvpfast.com/api-costs/ocr
- https://sparkco.ai/blog/comparing-ocr-apis-abbyy-tesseract-google-azure
- https://medium.com/ixor/comparing-tesseract-ocr-with-google-vision-ocr-for-text-recognition-in-invoices-bddf98f3f3bd
- https://programminghistorian.org/en/lessons/ocr-with-google-vision-and-tesseract
