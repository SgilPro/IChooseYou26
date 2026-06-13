# 研究筆記：OCR 準確度、後端部署、ROI UX

> 階段：IDEATION（研究具體優化方向，非定案）。
> 三個主題：(1) 提升低解析度遊戲 UI 文字的 OCR 準確度（最高優先）；(2) 若真的需要 hosted backend 該如何部署；(3) ROI 選取 UX 與持久化。
> 與既有研究的關係：本文件聚焦「**可立即實作的具體技術**」，補充 `research/line1-tech-feasibility/03-recognition-ocr.md` 與 `08-youtube-url-ingestion.md` 的策略結論，不重述其論證。誠實標示不確定處。

---

## Topic 1 — 提升低解析度遊戲 UI 文字的 OCR 準確度（最高優先）

### 1.1 Tesseract.js 前處理：哪些「真的」有幫助

官方 ImproveQuality 文件給出最硬的數字與順序，以下都是可量化、可實作的：

- **目標解析度 / 字高**：Tesseract 對 **DPI ≥ 300** 的影像表現最好；更關鍵的經驗法則是**大寫字母的像素高度應達到 ~30–33px**（低於約 20px 準確度明顯掉）。遊戲訊息框文字在 720p 影片裡常只有 12–18px 高，**這就是 Tesseract.js 在我們場景表現差的主因**。對策：先 **upscale 裁切後的 ROI**（不是整張畫面）。([Tesseract ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html)、[DeepWiki tessdoc](https://deepwiki.com/tesseract-ocr/tessdoc/6-improving-ocr-quality))
- **放大演算法**：放大時用 **bicubic / linear 內插**（瀏覽器端可用 canvas `drawImage` 放大，或 `imageSmoothingQuality='high'`），避免引入額外模糊。建議放大倍率 **2–4x**，讓字高拉到 ~30px 區間。([Bomberbot preprocessing](https://www.bomberbot.com/ocr/how-to-use-image-preprocessing-to-improve-the-accuracy-of-tesseract-ocr/)、[freeCodeCamp / TDS Tesseract part II](https://www.freecodecamp.org/news/getting-started-with-tesseract-part-ii-f7f9a0899b3f/))
- **灰階 + 二值化（binarization）**：實測中**二值化常是「全錯 ↔ 全對」的關鍵**——它大幅拉開文字與背景對比。先轉灰階，再做門檻化。([Medium: binarization as preprocessing](https://medium.com/@maxshouman/efficiency-of-image-binarization-as-a-preprocessing-technique-for-tesseract-ocr-637ee8e6609f))
- **Otsu 門檻**：Otsu 自動選門檻，適合很多情況，但**沒有單一門檻法適用所有影像**；遊戲框常見半透明底＋漸層，可能需要 adaptive threshold（Tesseract 5 內建 Adaptive Otsu / Sauvola，但 Tesseract.js 內部不一定暴露，所以**前處理階段自己做**較可靠）。([Tesseract ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html))
- **描邊 / 反相處理**：寶可夢訊息框常是「深色字＋淺底」或「白字＋深描邊」。Tesseract 預設假設**深字淺底**。若是淺字深底，**前處理要反相（invert）**。
- **去雜訊與形態學**：二值化後殘留的雜點要清掉；字太粗（ink bleeding）可用 erosion 收細。([Tesseract ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html))
- **加白邊**：若 ROI 裁太緊貼字，補 ~**10px 白邊**可避免邊緣字被吞或誤判空白頁。([Tesseract ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html))

> 不確定性誠實話：上述每一步在「印刷文件」上效益明確；在「遊戲字體」上**效益方向正確、幅度未知**，必須用真實對戰截圖做 A/B 量測（見 1.7）。一般文獻給的「前處理可提升約 15%」是噪音環境下的概估，不能直接套到遊戲字體。([sparkco advanced tips](https://sparkco.ai/blog/boost-tesseract-ocr-accuracy-advanced-tips-techniques))

### 1.2 Tesseract 參數：PSM、char whitelist、字典、LSTM

- **PSM（Page Segmentation Mode）**：我們是**已裁好的單一文字區**，不該用預設 PSM 3（全頁自動分割，會在小區誤判）。具體建議：
  - 訊息框（單行或單塊敘述句）：**PSM 7（單行）** 或 **PSM 6（單一文字塊）**。
  - HP 等孤立數字小區：**PSM 8（單字）**，極端情況單字元用 **PSM 10**。
  - ([PyImageSearch PSM 解說](https://pyimagesearch.com/2021/11/15/tesseract-page-segmentation-modes-psms-explained-how-to-improve-your-ocr-accuracy/)、[Tesseract ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html))
- **`tessedit_char_whitelist`**：讀 HP / 數字時設 `0123456789`（含 `/` 若是 `123/200` 格式）。**注意已知雷點**：在某些 PSM 下 whitelist 會被忽略，要搭配 LSTM engine（Tesseract 4+）才穩定生效。([py4u digits-only 排錯](https://www.py4u.org/blog/python-tesseract-ocr-get-digits-only/))
- **關閉字典（重要且反直覺）**：寶可夢名/招式名**不是英文字典詞**，Tesseract 內建字典會把 OCR 結果「硬拗成像英文單字」反而錯更多。設 `load_system_dawg=false`、`load_freq_dawg=false`。([Tesseract ImproveQuality](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html)、[DeepWiki tessdoc](https://deepwiki.com/tesseract-ocr/tessdoc/6-improving-ocr-quality))
- **LSTM vs Legacy**：用 **LSTM（OEM 1）**，準確度與 whitelist 行為都比 legacy 好；Tesseract.js 基於 Tesseract 5，預設即 LSTM。([py4u](https://www.py4u.org/blog/python-tesseract-ocr-get-digits-only/))
- **語言模型 `eng` vs `chi_tra`/`jpn`**：依使用者遊戲語言載對應 traineddata（已在 03 文件定調）。誠實話：**Tesseract 對 CJK 準確度普遍低於拉丁字母**，繁中/日文場景更該考慮雲端 OCR（見 1.4）。

### 1.3 字典模糊比對校正（OCR 後處理）— CP 值最高的一步

OCR 輸出**不要直信**，而是 snap 到最近的合法寶可夢領域詞條。這層讓「OCR 小錯」仍能正確分類，是準確度的關鍵保險。

- **演算法/函式庫**：
  - **Levenshtein / 編輯距離**：最常用，專治 OCR 的字元級小錯（少字、多字、替換）。([Klippa fuzzy matching](https://www.klippa.com/en/blog/information/fuzzy-matching/)、[Tilores algorithms](https://tilores.io/fuzzy-matching-algorithms))
  - **Fuse.js**：輕量（~1.6KB gzip）、用 Bitap（Levenshtein 變體），支援物件多欄位搜尋；前端整合最快。([Fuse.js / JS 模糊搜尋指南](https://www.htmlgoodies.com/javascript/a-guide-to-javascript-fuzzy-search-libraries/)、[Codementor fuzzy search](https://www.codementor.io/@anwarulislam/how-to-implement-fuzzy-search-in-javascript-2742dqz1p9))
  - **實務作法**：先做**精確/正規化比對**（去空白、全形半形統一、小寫化），命中就用；未命中才走 fuzzy，並設**距離門檻**（例如名字長度的 20–30% 以內才接受，否則標為「需人工確認」）。
- **詞典來源（已在 02 文件對齊，這裡給最務實選擇）**：
  - **`@pkmn/dex`（Pokémon Showdown 資料層）**：含 species / moves / abilities，**壓縮後約 344KB（不含 learnsets）**，純前端可直接打包，免後端、免 API call、可離線。**這是首選**——比 PokéAPI（需逐項 HTTP）更適合「一次載入、本機 fuzzy match」。([@pkmn/dex npm](https://www.npmjs.com/package/@pkmn/dex)、[@pkmn/data npm](https://www.npmjs.com/package/@pkmn/data))
  - 多語名稱：Showdown 資料以英文 ID 為主，繁中/日文顯示名需另備對照表（可由 PokéAPI 的 `pokemon-species` / `move` 多語 `names` 欄位一次匯出成靜態 JSON 內建）。([PokeAPI fuzzy match issue 參考](https://github.com/PokeAPI/pokeapi/issues/18))

### 1.4 雲端 OCR 比較（作為 fallback 值不值得）

| 服務 | 純文字 OCR 價格 | 免費額度 | 備註 |
|---|---|---|---|
| **Google Cloud Vision (TEXT_DETECTION)** | **$1.50 / 1,000 次**，>500萬次降 $1.00 | **每月前 1,000 次免費（不過期）**＋新戶 $300 額度 | 字元級辨識業界最強之一；CJK 表現明顯優於 Tesseract | ([Cloud Vision Pricing](https://cloud.google.com/vision/pricing)、[buildmvpfast Google Vision](https://www.buildmvpfast.com/alternatives/google-vision)) |
| **Azure AI Vision / Document Intelligence** | 基礎文字抽取約 **$1.50 / 1,000 頁**，量大降 $0.60 | 有免費層 | 三家中常被評為「略便宜一點」；深綁 Microsoft 生態時佳 | ([MarkTechPost OCR 比較](https://www.marktechpost.com/2025/11/02/comparing-the-top-6-ocr-optical-character-recognition-models-systems-in-2025/)、[sparkco OCR APIs](https://sparkco.ai/blog/comparing-ocr-apis-abbyy-tesseract-google-azure)) |
| **AWS Textract** | 約 **$1.50 / 1,000 頁**（純文字），結構化（表格/表單）會跳到 $10–50/1,000 | 有免費層 | 強在凌亂/手寫文件；我們只需純文字行，不需貴的結構化功能 | ([MarkTechPost OCR 比較](https://www.marktechpost.com/2025/11/02/comparing-the-top-6-ocr-optical-character-recognition-models-systems-in-2025/)) |

**值不值得**：對「訊息框單行 + CJK」的場景，**值得當 fallback**。成本估算（沿用 03 文件）：每場關鍵影格約 50–150 張，**一場約 $0.08–$0.23 美元**；只送**裁切後小區 + 只送關鍵影格**可把量壓到最低，加上每月 1,000 次免費，個人/小規模使用幾乎免費。三家準確度同級、價格同級，**Google Vision 因免費額度＋字元級口碑＋最易接，建議作為 v1 雲端 fallback 首選**。注意金鑰不能放前端 → 需要一個薄後端 proxy（接到 Topic 2）。

### 1.5 先驅技術（prior art）— 直接可借鏡

- **`chfoo/tppocr` 系列（tppocr / tppocr2 / tppocr3）**：TwitchPlaysPokemon 用 Tesseract 對**串流影片的對話框文字**做 OCR。核心做法兩點對我們極有參考價值：
  1. **自行訓練遊戲字體的 traineddata**（`pkmngb_en` / `pkmngba_en`），證明「**domain-specific 訓練模型**」是遊戲字體準確度的最大槓桿——比任何前處理技巧都有效，但工程量大（非 MVP）。
  2. 對**裁切後的固定 ROI** 跑 OCR、用 FFmpeg + Pillow 做前處理、Redis queue 串接——架構思路與我們一致。
  - ([chfoo/tppocr](https://github.com/chfoo/tppocr)、[tppocr2](https://github.com/chfoo/tppocr2)、[tppocr3](https://github.com/chfoo/tppocr3))
- **`tl40data/OCR` / `TrainerDex/PogoOCR`**：用 **Google Cloud Vision** OCR 寶可夢（Pokémon GO）截圖，佐證「雲端 Vision 跑寶可夢 UI 文字」是被驗證過的路線。([tl40data/OCR](https://github.com/tl40data/OCR)、[TrainerDex/PogoOCR](https://github.com/TrainerDex/PogoOCR))
- **`MDFowler/Showdown-Parser` / `kagd/pokemon-tcg-battle-replay`**：把 battle log 解析成結構化資料的**樣板/regex 思路**，可借用於我們的「文字 → 事件」層。([Showdown-Parser](https://github.com/MDFowler/Showdown-Parser)、[pokemon-tcg-battle-replay](https://github.com/kagd/pokemon-tcg-battle-replay))

### 1.6 不確定性 / 風險（誠實版）

- Tesseract.js 對遊戲字體準確度**仍是未量測的核心風險**；前處理能改善但幅度未知。
- 自訓 traineddata 是最強解但成本最高，**MVP 不做**，列為「若 Tesseract.js + 前處理 + 字典校正仍不足」的 v2 選項。
- CJK（繁中/日文）很可能逼我們在 v1 就走雲端 OCR fallback。

### 1.7 可立即採用的具體做法 ✅（Topic 1）

- [ ] **只裁訊息框 ROI 後再 upscale 2–4x**（canvas bicubic / `imageSmoothingQuality='high'`），讓字高拉到 ~30px。
- [ ] 前處理管線：**灰階 → 二值化（先試 Otsu，半透明框試 adaptive）→ 視需要反相 → 去雜訊 → 補 10px 白邊**。
- [ ] Tesseract.js 設定：訊息框用 **PSM 7/6**；數字區用 **PSM 8 + `tessedit_char_whitelist=0123456789`**；**全程 `load_system_dawg=false` / `load_freq_dawg=false`**；用 **LSTM（OEM 1）**。
- [ ] 接 **`@pkmn/dex`** 當本機詞典 + **Fuse.js** 做模糊比對校正，設距離門檻，未達門檻標「需確認」。
- [ ] 建一個**真實截圖 A/B 測試集**：同一批 ROI 同時跑「Tesseract 前處理前/後」與「Google Vision」，量字元正確率，再決定是否上雲端 fallback。
- [ ] 繁中/日文路線**預設規劃雲端 Vision fallback**（前 1,000 次/月免費，先用免費額度量測）。

---

## Topic 2 — 若真的需要 hosted backend，該如何部署

> 前提提醒：既有 `08-youtube-url-ingestion.md` 已定調——**純前端抓 YouTube 不可行**（CORS + 簽名短效網址 + `n` 參數節流三重夾擊），唯一務實路是用 `yt-dlp`（CLI）。本節只討論「**如果**要把它 host 起來」的部署選項與取捨。

### 2.1 各部署選項比較（小型 Node 服務 + yt-dlp + ffmpeg）

關鍵限制：**yt-dlp 和 ffmpeg 是原生 binary，需要一個「真的 OS」環境**。這直接淘汰部分平台。

| 選項 | 約略成本 | 冷啟動 | binary 支援（yt-dlp/ffmpeg） | 頻寬 | 結論 |
|---|---|---|---|---|---|
| **Railway** | 約 $5/月起，用量計費、可 scale-to-zero；egress $0.05/GB | 中 | ✅ 用 Docker/Nixpacks 可裝 yt-dlp + ffmpeg | 用量計費 | 低流量/變動負載最划算；有現成 ffmpeg REST 範本 |
| **Render** | Starter web service 約 $7/月，**固定價**（非用量） | 免費層會休眠→冷啟動久 | ✅ Docker 可裝 binary | 含一定額度 | 可預測帳單；免費層冷啟動體驗差 |
| **Fly.io** | 單機 dev 約 $2/月起；**支援 scale-to-zero** | **idle 後首次請求約 5 秒冷啟動** | ✅ Docker（完整 Linux）裝 binary OK | 含額度 | 個人用 + scale-to-zero 省錢，但要接受冷啟動 |
| **便宜 VPS（Hetzner / DO）** | **Hetzner 最低約 €3.49/月（CX23）**；含 **20TB 流量** | 無（常開） | ✅ 完整 OS，最自由 | 超充足 | **跑 yt-dlp+ffmpeg 性價比最高**；要自己維運 |
| **Cloudflare Workers** | 便宜 | 極快 | ❌ **跑不了 yt-dlp/ffmpeg**（V8 isolate，無完整 OS、無任意 binary、CPU/時間受限） | — | **不適用**，直接排除 |
| **AWS Lambda（+ffmpeg layer）** | 用量計費 | 冷啟動隨 layer 變大而變慢 | ⚠️ ffmpeg 可放 layer，但**解壓後 code+layers 硬上限 250MB**；長影片下載受 **15 分鐘執行上限**與暫存空間限制 | egress 較貴 | 短任務勉強可行，但下載長影片不適合，工程麻煩 |

來源：([dev.to Railway/Render/Fly 比較](https://dev.to/whoffagents/deploying-nodejs-apps-comparing-railway-render-and-flyio-4cfj)、[Railway ffmpeg REST 範本](https://railway.com/deploy/ffmpeg-rest-api)、[Railway 站內 yt-dlp+ffmpeg 問答](https://station.railway.com/questions/how-do-i-deploy-ffmpeg-and-yt-dlp-on-rai-4a97fca3)、[Fly.io pricing](https://fly.io/docs/about/pricing/)、[Fly autoscale-to-zero](https://www.jacobparis.com/content/fly-autoscale-to-zero)、[Hetzner cost-optimized](https://www.hetzner.com/cloud/cost-optimized)、[AWS Lambda 限制](https://blog.thundra.io/aws-lambda-limits-to-keep-in-mind-when-developing-a-serverless-application)、[Serverless ffmpeg layer](https://www.serverless.com/blog/publish-aws-lambda-layers-serverless-framework))

### 2.2 法律 / 營運現實（直白講）

- **YouTube ToS**：用自動化工具下載內容、且**對外提供服務**，明確違反條款。yt-dlp **工具本身在美/歐多數法域合法**（無法院判它違法），但**「公開 host 一個代下載服務」的法律暴露遠高於個人本機使用**。([yt-dlp safe-legal](https://yt-dlpc.github.io/safe-legal.html)、[EFF youtube-dl takedown](https://www.eff.org/deeplinks/2020/11/github-youtube-dl-takedown-isnt-just-problem-american-law))
- **DMCA**：主要風險來自 DMCA §1201（規避技術保護措施）。2020 RIAA 曾對 youtube-dl 發 takedown，後經 EFF 介入由 GitHub 恢復——顯示**公開散布工具≠安全，公開營運服務風險更高**。([XDA RIAA DMCA](https://www.xda-developers.com/youtube-dl-riaa-dmca/)、[EFF 恢復 youtube-dl](https://www.eff.org/deeplinks/2020/11/github-reinstates-youtube-dl-after-riaas-abuse-dmca))
- **IP 封鎖 / 風控**：機房 IP 大量抓取會很快被 YouTube 擋（403 / 要求登入），需 cookies、代理輪替——維運成本與灰色程度雙升。
- **頻寬/磁碟**：影片下載很吃流量；公開服務規模化成本高。

### 2.3 對「本專案」的建議

**沿用既有結論：local-only 為主。**

- **首選（v1）**：使用者**在自己機器跑本機 Node/Express + yt-dlp**（已有 prototype）；前端偵測到 `http://localhost:PORT` 在線才顯示「貼 YouTube URL」選項。法律姿態最乾淨、零頻寬成本、零風控問題。
- **若需要雲端 OCR fallback**（Topic 1.4 的 Google Vision）：那是**另一種、低風險的後端需求**——它**不下載 YouTube**，只是「收一張裁切小圖、轉呼叫 Vision API、回 JSON」的薄 proxy（為了藏金鑰）。這個 proxy **可以**安心放雲端（**Railway scale-to-zero 或 Hetzner 最小 VPS**），因為它不碰 YouTube ToS、流量極小。
- **明確不做**：公開的 YouTube 代下載服務（法律/風控/頻寬三輸）。
- 若哪天真要「私人、僅自己用」的雲端 yt-dlp：選 **Hetzner 最小 VPS（~€3.49/月、20TB 流量、常開無冷啟動）**，鎖在自己帳號後面、不對公眾開放。

### 2.4 可立即採用的具體做法 ✅（Topic 2）

- [ ] YouTube 抓取**維持 local-only 本機後端**，前端條件式顯示入口（偵測 localhost）。
- [ ] 若上雲端 OCR：只部署一個**藏金鑰的薄 OCR proxy**（收裁切圖→呼叫 Google Vision→回 JSON），放 **Railway（scale-to-zero）** 或 **Hetzner 最小 VPS**。
- [ ] 排除 **Cloudflare Workers**（跑不了 yt-dlp/ffmpeg）與**用 Lambda 抓長影片**（250MB / 15 分鐘限制）。
- [ ] **不**對外公開 YouTube 代下載服務；任何雲端 yt-dlp 僅限私人、鎖權限。

---

## Topic 3 — ROI 選取 UX + 持久化（簡述）

### 3.1 同類工具如何讓使用者定義/持久化區域

- 影像標註/裁切工具（含 tppocr 類）的通則：**在影像上疊一層可拖曳/縮放的矩形**，使用者畫框定義 ROI；座標以**相對比例（0–1）**而非絕對 px 儲存，才能在不同影片解析度/視窗尺寸間還原。([Variance Digital 互動矩形選取](https://medium.com/variance-digital/interactive-rectangular-selection-on-a-responsive-image-761ebe24280c))

### 3.2 localStorage vs IndexedDB（存 ROI preset / 具名 profile）

- **localStorage**：同步、上限約 5–10MB、只能存字串（要 `JSON.stringify`）。**ROI preset 就是一小包座標 JSON**，完全夠用、最簡單。([dev.to IndexedDB vs localStorage](https://dev.to/oghenetega_adiri/indexeddb-vs-localstorage-when-to-use-which-2blf)、[GeeksforGeeks 比較](https://www.geeksforgeeks.org/javascript/difference-between-localstorage-and-indexeddb-in-javascript/))
- **IndexedDB**：非同步、容量大、可存結構化資料/Blob。**只有當要存大量 profile、或順便快取截圖/影格 Blob 時才需要**；可用 **Dexie.js / localForage** 包裝簡化 API。([shiftasia 比較](https://shiftasia.com/community/localstorage-vs-indexeddb-choosing-the-right-solution-for-your-web-application/)、[openreplay 比較](https://blog.openreplay.com/indexeddb-localstorage-sessionstorage/))
- **本專案判斷**：ROI preset / 具名 profile 體積小 → **用 localStorage 即可**；若未來要快取影格 Blob 再升級 IndexedDB（localForage 可同 API 平滑遷移）。

### 3.3 匯出/匯入 JSON

- preset 以**單純 JSON schema**（含 schema 版本號、相對座標、語言、profile 名稱）存放，提供「匯出成 `.json` 檔 / 匯入」按鈕，方便使用者跨機器分享同一遊戲版面的 ROI 設定。建議帶 `version` 欄位以利日後 migration。

### 3.4 resize-handle UX 樣板

- **直接用現成庫**：**`react-rnd`**（同時可拖曳 + 縮放，可自訂 8 個方向 handle 的 `resizeHandleStyles` / class，可設 drag handle selector）是最省事的選擇；需要旋轉再看 `react-resizable-rotatable-draggable`。([react-rnd GitHub](https://github.com/bokuweb/react-rnd)、[react-rnd npm](https://www.npmjs.com/package/react-rnd)、[react-resizable-rotatable-draggable](https://github.com/mockingbot/react-resizable-rotatable-draggable))
- **自幹**：在影像上疊透明 canvas / div，畫矩形 + 8 個角/邊 handle；互動可用 **interact.js**。座標一律存相對比例。([Variance Digital](https://medium.com/variance-digital/interactive-rectangular-selection-on-a-responsive-image-761ebe24280c))
- UX 細節：**角 handle 等比/自由縮放、邊 handle 單軸縮放**、min size 限制、座標即時顯示、可鍵盤微調（方向鍵 1px）、ROI 命名（如「訊息框」「HP1」「HP2」）。

### 3.5 可立即採用的具體做法 ✅（Topic 3）

- [ ] ROI 座標一律存**相對比例（0–1）**，跨解析度可還原。
- [ ] preset / profile 用 **localStorage + JSON**（帶 `version` 欄位）；大量資料或快取影格再上 IndexedDB（localForage）。
- [ ] 提供 **匯出/匯入 `.json`** 按鈕分享版面設定。
- [ ] 矩形編輯器用 **`react-rnd`**（或 interact.js 自幹），8 向 handle、min size、鍵盤微調、ROI 命名。

---

## 附錄：完整來源清單

OCR / 前處理 / Tesseract：
- https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html
- https://deepwiki.com/tesseract-ocr/tessdoc/6-improving-ocr-quality
- https://pyimagesearch.com/2021/11/15/tesseract-page-segmentation-modes-psms-explained-how-to-improve-your-ocr-accuracy/
- https://www.py4u.org/blog/python-tesseract-ocr-get-digits-only/
- https://medium.com/@maxshouman/efficiency-of-image-binarization-as-a-preprocessing-technique-for-tesseract-ocr-637ee8e6609f
- https://www.bomberbot.com/ocr/how-to-use-image-preprocessing-to-improve-the-accuracy-of-tesseract-ocr/
- https://www.freecodecamp.org/news/getting-started-with-tesseract-part-ii-f7f9a0899b3f/
- https://sparkco.ai/blog/boost-tesseract-ocr-accuracy-advanced-tips-techniques

字典模糊比對：
- https://www.npmjs.com/package/@pkmn/dex
- https://www.npmjs.com/package/@pkmn/data
- https://www.htmlgoodies.com/javascript/a-guide-to-javascript-fuzzy-search-libraries/
- https://www.codementor.io/@anwarulislam/how-to-implement-fuzzy-search-in-javascript-2742dqz1p9
- https://www.klippa.com/en/blog/information/fuzzy-matching/
- https://tilores.io/fuzzy-matching-algorithms
- https://github.com/PokeAPI/pokeapi/issues/18

雲端 OCR 比較：
- https://cloud.google.com/vision/pricing
- https://www.buildmvpfast.com/alternatives/google-vision
- https://www.marktechpost.com/2025/11/02/comparing-the-top-6-ocr-optical-character-recognition-models-systems-in-2025/
- https://sparkco.ai/blog/comparing-ocr-apis-abbyy-tesseract-google-azure

先驅技術（Pokémon OCR）：
- https://github.com/chfoo/tppocr
- https://github.com/chfoo/tppocr2
- https://github.com/chfoo/tppocr3
- https://github.com/tl40data/OCR
- https://github.com/TrainerDex/PogoOCR
- https://github.com/MDFowler/Showdown-Parser
- https://github.com/kagd/pokemon-tcg-battle-replay

後端部署：
- https://dev.to/whoffagents/deploying-nodejs-apps-comparing-railway-render-and-flyio-4cfj
- https://railway.com/deploy/ffmpeg-rest-api
- https://station.railway.com/questions/how-do-i-deploy-ffmpeg-and-yt-dlp-on-rai-4a97fca3
- https://fly.io/docs/about/pricing/
- https://www.jacobparis.com/content/fly-autoscale-to-zero
- https://www.hetzner.com/cloud/cost-optimized
- https://blog.thundra.io/aws-lambda-limits-to-keep-in-mind-when-developing-a-serverless-application
- https://www.serverless.com/blog/publish-aws-lambda-layers-serverless-framework

法律 / ToS：
- https://yt-dlpc.github.io/safe-legal.html
- https://www.eff.org/deeplinks/2020/11/github-youtube-dl-takedown-isnt-just-problem-american-law
- https://www.eff.org/deeplinks/2020/11/github-reinstates-youtube-dl-after-riaas-abuse-dmca
- https://www.xda-developers.com/youtube-dl-riaa-dmca/

ROI / 持久化 / UX：
- https://dev.to/oghenetega_adiri/indexeddb-vs-localstorage-when-to-use-which-2blf
- https://www.geeksforgeeks.org/javascript/difference-between-localstorage-and-indexeddb-in-javascript/
- https://shiftasia.com/community/localstorage-vs-indexeddb-choosing-the-right-solution-for-your-web-application/
- https://blog.openreplay.com/indexeddb-localstorage-sessionstorage/
- https://github.com/bokuweb/react-rnd
- https://www.npmjs.com/package/react-rnd
- https://github.com/mockingbot/react-resizable-rotatable-draggable
- https://medium.com/variance-digital/interactive-rectangular-selection-on-a-responsive-image-761ebe24280c
