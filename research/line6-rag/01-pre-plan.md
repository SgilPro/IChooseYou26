# RAG 線 Pre-Plan：讓 Ditto 用自家語料回答雙打問題

> 狀態：Pre-Plan & Research（第一擁有者指示先不實作）。日期 2026-11-08，2026-11-08 晚間經紅隊審查修訂。**本文沒有任何程式碼，也沒有啟動任何索引工作**；M1 以後都要等第一擁有者點頭。所有數字與事實附來源；標「估」的是我的推算，標「待查證」的尚未確認。

## 一、目標與非目標

**目標**
- Ditto 回答 VGC 雙打問題時能引用自家語料（Fiske 影片字幕與隊伍、`research/` 文件、公開賽事／使用率資料、Notion 筆記），並附「影片＋時間戳」或「文件＋段落」等出處。
- 每日 routine 吸收新影片後，索引能**增量**更新，不必重建。
- 同一套檢索層未來能被網站（line 5 的後端）重用。

**非目標**
- 不訓練或微調模型；不做自家語音辨識（Fiske 已有人工字幕）。
- 不重發布字幕全文；不繞過會員影片／Patreon 付費牆。
- 不先做 reranker、graph RAG、多跳 agent 檢索——要等基線量測後再決定。

## 二、使用情境與評估集（25 題）

每題需標註「黃金出處」（影片 id＋時間範圍，或檔案＋段落）才能量測。先列題目，黃金答案在 M1 補。

**「M1 可測？」欄是審查時加的**：✅ 表示 M1 開始時語料已在倉庫裡；⚠ 表示要先等 line 4 產出（隊伍 JSON、全頻道字幕）；❌ 表示資料源目前根本不在倉庫（Notion、Smogon、Limitless、GameLog）。目前狀況（2026-11-08 實測 `videos.json`）：字幕只抓了 **36／679** 支、`chapters` 只有 **7** 支、`regulation_code` 只有 **14** 支、隊伍 JSON **0** 筆。換句話說，「先用結構化欄位篩選」這條路，**今天還沒有東西可以篩**。

| # | 類別 | 範例問題 | 預期主要來源 | M1 可測？ |
|---|---|---|---|---|
| 1 | 規則／機制 | Champions 的 Regulation M-C 能帶幾隻限制級傳說？開放哪些機制？ | `data/ref/regulation_sets.json` | ✅ |
| 2 | 規則／機制 | Mega 進化在 Champions 一場限幾次？Mega 後速度何時生效？ | 字幕（教學）＋ research/line2 課綱 | ✅ |
| 3 | 規則／機制 | 戲法空間下，誰先動：速度 50 還是 100？持續幾回合？ | research/line2 課綱 | ✅ |
| 4 | 規則／機制 | 威嚇對特性「精神力」的寶可夢有效嗎？ | 字幕（實戰解說）＋課綱 | ✅ |
| 5 | 規則／機制 | 順風與戲法空間同時存在時怎麼算？ | 課綱 | ✅ |
| 6 | 隊伍構築 | Fiske 用過哪些「雨天 + Mega」隊？各自核心是誰？ | 隊伍 JSON（SQL） | ⚠ 隊伍 JSON 0 筆 |
| 7 | 隊伍構築 | 胖甜妮搭 Mega 水晶燈火靈的隊，六隻與道具是什麼？ | 隊伍 JSON＋字幕「隊伍介紹」章節 | ⚠ |
| 8 | 隊伍構築 | Fiske 怎麼解釋阿勃梭魯的努力值配法？ | 字幕（team_intro_range） | ⚠ 36 支字幕中 11 支提到阿勃梭魯 |
| 9 | 隊伍構築 | 有哪些隊同時帶「看我嘛」引導手與強化手？ | 隊伍 JSON＋tags | ⚠ |
| 10 | 隊伍構築 | 新手入門系列建議的第一支隊伍是什麼？ | 字幕（播放清單「對戰新手入門」） | ⚠ 該清單字幕尚未抓 |
| 11 | meta 查詢 | M-C 目前使用率前十是誰？ | Smogon usage（data.pkmn.cc） | ❌ 不在倉庫 |
| 12 | meta 查詢 | 最近一場官方賽事冠軍隊是什麼？ | Limitless API（VGC 覆蓋待查證，見第七節） | ❌ |
| 13 | meta 查詢 | 某隻寶可夢最常見的道具與招式組合？ | Smogon chaos JSON | ❌ |
| 14 | meta 查詢 | M-B → M-C 新增了哪些寶可夢？ | regulation_sets.json（`pokemon_pool_note` 目前只有文字備註） | ✅／部分 |
| 15 | meta 查詢 | 這隻在 Fiske 影片中出現的頻率，與公開使用率差多少？ | 隊伍 JSON × usage（跨源） | ❌ |
| 16 | 影片內容查找 | Fiske 哪一集講過「騙守住」的判斷？給時間點。 | 字幕（章節標題 + 全文） | ⚠ 「騙守」在 36 支字幕全文 0 命中，但章節標題有「實戰 6 騙…」→ 正是關鍵字檢索會漏的題型 |
| 17 | 影片內容查找 | 官方比賽解說中，主播怎麼分析某場決賽的選人？ | 字幕（官方解說播放清單） | ⚠ |
| 18 | 影片內容查找 | 哪些影片的 QOTD 問到速度線？ | 章節「QOTD」字幕 | ⚠ QOTD 章節目前只有 5 支 |
| 19 | 影片內容查找 | 找出「對手開雨天但我方先手」的實戰片段。 | 字幕（實戰章節） | ⚠ |
| 20 | 影片內容查找 | Fiske 對「擊掌奇襲」在開局的看法有沒有改變？（跨影片、跨時間） | 多影片字幕＋發布日期 | ⚠ 36 支中 5 支提到 |
| 21 | 個人筆記 | 我在 Notion 記的某隊努力值跟 Fiske 的版本差在哪？ | Notion × 隊伍 JSON | ❌ |
| 22 | 個人筆記 | 我上次對某隊的復盤結論是什麼？ | Notion／GameLog | ❌ |
| 23 | 綜合 | 用三句話總結 Fiske 對「高速指導隊」的打法，附出處。 | 字幕多段 | ⚠ 「高速指導」在 36 支字幕 0 命中 |
| 24 | 綜合 | 面對順風隊，Fiske 影片與 Wolfey 的建議有何不同？ | 字幕＋research/line2 | ⚠（順風：30 支命中） |
| 25 | 拒答測試 | 某隻**不在**語料中的寶可夢，Fiske 怎麼用？（應答「語料中沒有」） | — | ✅ |

**評估集本身的弱點（審查補）**
- 25 題裡 M1 當天可測的只有 7 題（✅），另 12 題要等 line 4 把字幕與隊伍 JSON 補齊，6 題的資料源根本不在倉庫。**M1 的 go/no-go 門檻（Hit@3 ≥ 80%）要改成只對可測題計算**，否則數字沒有意義。
- 25 題一題佔 4%，80% 門檻與 85% 門檻只差一題；這個樣本量只能看趨勢，不能當統計結論。建議 M1 把題數擴到 40–50 題，且每類至少 8 題。
- 第 11–15、21–22 題測的是「SQL／API 查表 + 跨源比對」，不是檢索；它們應該另立一組「結構化查詢」測試，不要混進檢索命中率。
- 黃金答案要由人（第一擁有者）或至少兩次獨立抽查確認，不能由 Ditto 自己出題自己對。

## 三、語料盤點與分塊策略（完整表見 `02-corpus-inventory.md`）

實測（`channel-index.json`，2026-11-08）：679 支、有時長者 652 支、合計 797.9 小時、平均 73.4 分鐘。**已下載的 36 支人工 zh-TW 字幕**密度：最低 199、中位 259、最高 360 字/分（對戰長片多在 220–290，教學短片多在 330–360）。原稿寫的「260–410」是三支抽樣的印象值，已以 36 支實測修正。

對戰相關比例：以播放清單歸類，對戰相關 377 支（56%）、467 小時（59%）；但有 **163 支不在任何播放清單**（含 99 支直播、23 支 shorts），其中多少是對戰內容尚未分類。原稿「約 70%」沒有依據，實際介於 56%（已確認）到約 80%（若未分類者全是對戰）之間。

分塊原則只有三條：
- **結構化資料不進向量庫**：影片 metadata、隊伍／成員、規則組、使用率、賽果一律 SQL／filter；只把 `notes`、`role_note` 等自由文字入索引。
- **字幕兩層切**：先按 `chapters`（隊伍介紹／QOTD／實戰 N）切，再切 60–90 秒窗（以中位密度約 260–390 字），不跨章節；每塊前綴「影片標題｜規則組｜章節｜起訖秒」當 context（Anthropic contextual retrieval 作法，見第六節）。**前提是 chapters 要先補齊**（目前 7／679）；沒有章節的影片退回固定 90 秒窗。
- **研究文件按 H2/H3 切。** 全量實測 38 個 `.md`、約 17.6 萬字元（其中中文約 4.5 萬字，其餘是英文、URL 與 Markdown），估 ≈ 8–10 萬 tokens（估，中英混排 tokenizer 差異大）。原稿寫「約 1.4 萬字 ≈ 2 萬多 tokens」低估了約四倍，但結論不變：仍能整包放進 1M 上下文；只是「整包餵」一問在 Opus 5.5 約 $0.35–0.40（$4/M），命中快取後約 $0.02（$0.20/M），**不是免費**，常問的話還是該切。Notion 按 block 切，DB 欄位走 SQL。

## 四、架構候選比較

| 候選 | 適合誰 | 優點 | 缺點／風險 | 結論 |
|---|---|---|---|---|
| **(A) 純靜態前端**：預算 embeddings JSON + 瀏覽器端向量搜尋（transformers.js 跑 multilingual-e5-small 等） | 網站訪客 | 0 伺服器成本，GitHub Pages 可放 | 瀏覽器端要載模型與索引（1–2 萬塊 × 384 維即十幾 MB，估）；小模型繁中品質未知；查詢向量與索引向量必須同模型 | 之後給網站「只讀」場景備用；不當主線 |
| **(B) Supabase pgvector** | 網站 + Ditto | Postgres 同時管隊伍表與向量；Free 方案每專案 500 MB、最多 2 個活躍專案、一週沒活動會暫停；Pro $25/月起含 8 GB（定價頁 2026-11-08 查證） | 需雲端；免費方案暫停會讓 cron 失敗 | **M3 階段**同步目標，對齊 line 5 後端 |
| **(C) 本機**：SQLite + FTS5 + sqlite-vec（或 LanceDB／Chroma） | Ditto routine | 單檔、可版控、零成本、跟 `data/` JSON 同倉庫；sqlite-vec 純 C 無依賴、可跑瀏覽器 WASM（README 明寫「pre-v1，expect breaking changes」）；LanceDB 內建全文＋向量＋SQL filter | sqlite-vec 不成熟；Chroma 無全文檢索；FTS5 trigram 對 2 字詞無效（見第六節） | **M1–M2 主線**；若 sqlite-vec 不穩就換 LanceDB |
| **(D) 不做 RAG，直接長上下文** | 所有人 | 最簡單；Claude 4.6+ 的 1M 上下文**標準計價、無長上下文加價**（Haiku 5.5 例外：提示超過 10 萬 tokens 整個請求改用高價） | 全頻道 12–20M tokens 塞不進 1M；每問都重送大量 tokens 貴（Opus 5.5 $4/M 輸入；50 萬 tokens 一問 ≈ $2，快取命中 $0.20/M 後 ≈ $0.10） | **對 `research/` 文件與「篩到 3–5 支影片後」的回答，直接用 (D)**；它是基線的一部分 |

**我的選擇：(C) 為核心，(D) 為回答層，(B) 為網站同步，(A) 保留。** 關鍵洞察：我們的語料「結構化欄位很強」（寶可夢、規則組、章節、播放清單），先用它們篩選，多數問題應能縮到幾支影片，長上下文直接讀即可——向量只處理「找不到關鍵字的語意問題」。**但這個洞察今天還是假設**：結構化欄位要等 line 4 填滿才存在，第六節的失敗模式也說明關鍵字檢索在繁中口語字幕上會漏什麼。

## 五、成本試算

**字幕量（估）**：797.9 小時 ＝ 47,874 分鐘；以 36 支實測中位 259 字/分 ≈ 12.4M 字，用最低／最高密度推 ≈ 9.5–17M 字。繁中 1 字約 1–1.3 token（依 tokenizer 不同，估），全頻道 ≈ 12–20M tokens，**下文一律以中位估 15M tokens 計**。對戰相關子集（56–80%）≈ 9–12M tokens。扣掉 75 支會員片（未登入抓不到字幕），實際可索引量再少一點。

**一次性 embedding 費用（以 15M tokens 計，估）**

| 模型 | 單價（/1M tokens） | 全頻道 | 備註 |
|---|---|---|---|
| OpenAI text-embedding-3-small | $0.02（定價頁 2026-11-08）；Batch 是否對 embeddings 半價**待查證**（定價頁 Batch 表只列 chat／image／transcription） | ≈ $0.3 | 1536 維 |
| OpenAI text-embedding-3-large | $0.13 | ≈ $2 | |
| Voyage voyage-4-lite / voyage-4 / voyage-4-large | $0.02 / $0.06 / $0.12，每個模型含 2 億 token 免費額度（定價頁 2026-11-08） | ≈ $0（免費額度內） | 多語；發布日期與維度選項**待查證**（原稿「2026-01 發布、2048/1024/512/256 維」未在定價頁確認） |
| Gemini gemini-embedding-001 / -2 | $0.15 / $0.20（Batch 半價；免費層 $0，定價頁 2026-11-08） | ≈ $2–3 | 定價頁**未**標 -2 為 preview，原稿「仍為 preview」待查證 |
| bge-m3 / multilingual-e5 / Qwen3-Embedding（本機） | $0 | 本機 CPU/GPU 時間 | 見第七節 |
| Contextual retrieval 前綴生成 | Anthropic 原文：每百萬文件 tokens ≈ $1.02（2024 年，用 **Claude 3 Haiku** 生成，含快取） | ≈ $15 上限；改用 Haiku 5.5（$0.10/M 輸入，≤10 萬 tokens）應更低（估） | 章節標題已是天然 context，可先不生成 |

**查詢期費用（Claude 回答）**：每支影片字幕以 73 分鐘 × 259 字/分 ≈ 1.9 萬字 ≈ 2–3 萬 tokens（估）。篩到 3–5 支後整段餵入 ≈ 6–15 萬 tokens；Opus 5.5（$4/M）一問 ≈ $0.25–0.6。Haiku 5.5 要看長度：≤10 萬 tokens 時 $0.10/M → ≈ $0.01；**一旦提示超過 10 萬 tokens，整個請求改按 $0.50/M**（定價頁「Long context pricing」），15 萬 tokens ≈ $0.075——原稿把 10–15 萬 tokens 一律算 $0.10/M 是錯的。結論不變：**成本瓶頸在回答層的輸入 tokens，不在 embedding**；篩選越準越省，而且用 Haiku 時要把輸入壓在 10 萬以下才划算。

## 六、混合檢索設計

1. **結構化 filter 先行**：由問題抽出寶可夢名（經 `data/ref/tags.json` 的 `aliases_zh` 與未來的譯名別名表正規化）、規則組、播放清單、日期 → SQL 篩影片／隊伍。
2. **BM25 全文**：SQLite FTS5 用 `trigram` tokenizer 處理中文無空格問題（SQLite 官方文件載明；但官方同時載明**「少於 3 個 unicode 字元的子字串在全文查詢中不會命中任何列」**）。雙打口語裡大量關鍵詞是兩個字——「守住」「順風」「威嚇」「雨天」「空間」「換手」——trigram 直接查不到。對策：(a) 兩字詞走 `LIKE`（FTS5 trigram 表可加速 LIKE）或先用別名表擴成三字以上的片語；(b) 或改用 `unicode61` tokenizer + 事前以 jieba 等斷詞（多一個依賴）。這點在 M1 一定要測。同時索引章節標題。
3. **向量**：只對字幕塊與 Notion 段落；bge-m3 可同時輸出 dense 與 sparse（類 BM25）向量，一個模型涵蓋兩路。
4. **融合**：Reciprocal Rank Fusion 合併三路，取 top-20 塊，依影片聚合後把「整個章節」送回答層（Anthropic 實驗：contextual embeddings + contextual BM25 讓 top-20 檢索失敗率降 49%（5.7%→2.9%），再加 rerank 降 67%（→1.9%）；他們試過 5／10／20 塊，20 最好）。
5. **回答層**：Claude 以引用模式回答，必附影片 id＋秒數；語料無答案時明說。

### 無向量基線會在哪裡失敗（誠實版）

我建議「先不做向量」，但要把它可能輸在哪裡寫清楚，否則 M1 量出來的數字不知道怎麼解讀：

| 失敗模式 | 為什麼關鍵字會漏 | 實例（來自 36 支字幕） | 向量能救多少 |
|---|---|---|---|
| 口語改寫 | 字幕說「他這邊是在賭對面不會守」，問題問「騙守住」 | 「騙守」全文 0 命中，但章節標題有「實戰 6 騙…」 | 中等；需實測 |
| 兩字詞 | FTS5 trigram 對 <3 字查詢無效 | 「順風」「守住」「威嚇」皆兩字 | 不相干——這是工程問題，別名表／LIKE 解 |
| 同音錯字 | 人工字幕仍有同音錯字與簡稱 | 待抽查 | 部分 |
| 概念型問題 | 「高速指導隊」是戰術概念，字幕裡講的是具體寶可夢與招式 | 「高速指導」0 命中 | 高——這類最需要向量或人工 tag |
| 跨影片／跨時間 | 第 20 題這種「看法有沒有變」需要先找齊再比對 | 「擊掌奇襲」5 支命中，可行 | 低；關鍵在回答層 |
| 跨語言 | 第 24 題要把 Wolfey 英文與 Fiske 繁中對上 | — | 高（多語 embedding 的主場） |
| 結構化欄位不存在 | 篩選靠 chapters／regulation_code／隊伍 JSON，目前覆蓋 1–2% | 7 支有 chapters | 不相干——是 line 4 的進度問題 |

所以「無向量基線及格」的真正意思是：**在結構化欄位補齊、別名表做好之後**，關鍵字仍能命中八成。如果 M1 量出來不及格，先分辨是「欄位沒填」「別名沒擴」還是「真的要語意」，別直接跳向量。

## 七、繁中 embedding 模型選擇

| 模型 | 現況（2026-11-08 查證） | 價格 | 繁中表現來源 |
|---|---|---|---|
| **BAAI/bge-m3** | 開源 MIT；100+ 語；8192 tokens；一模型出 dense/sparse/multi-vector（模型卡確認） | $0 | 模型卡列 MIRACL/MKQA/MLDR（多語），**無繁中專屬數據**；社群常用於中文 RAG |
| Qwen3-Embedding 0.6B/8B | Apache-2.0；8B 於 2025-06-05 MTEB 多語榜第一（70.58，官方自述）。原稿寫的「0.6B 的 CMTEB-R 71.02」是官方部落格 **reranker** 表的數字，不是 embedding 模型的，已刪；0.6B 的中文檢索數據**待查證** | $0 | 官方部落格（簡中為主的 CMTEB） |
| intfloat/multilingual-e5-small/large | 開源；small 有 Transformers.js ONNX 版可跑瀏覽器 | $0 | 無繁中專屬數據 |
| Voyage voyage-4 系列 | 多語通用；MongoDB 旗下 | $0.02–0.12/M | 官方未公布繁中數據 |
| OpenAI text-embedding-3 | 穩定、便宜 | $0.02–0.13/M | 無繁中專屬數據 |
| Gemini embedding-2 | 多模態；是否 preview 待查證 | $0.20/M | 無繁中專屬數據 |

**判斷**：我找不到任何可信的「繁體中文＋口語字幕」公開基準（C-MTEB 以簡中為主，Zilliz 2026 綜評也提醒 MTEB 不覆蓋跨語言檢索）。所以**不能憑榜單選模型**，要用第二節的評估集跑 bge-m3 vs voyage-4-lite vs text-embedding-3-small 三選一；bge-m3 因免費＋dense/sparse 雙出而為預設。

**Limitless API 補充（審查發現）**：開發者文件確認多數端點免金鑰、有 rate limit、金鑰只發給公開專案；但文件通篇只舉 TCG 範例，**是否涵蓋 VGC 賽事資料未寫明，待查證**（line 2 文件也引用了它，應一併確認）。

## 八、評估方法

- **檢索層**：Hit rate@3／@5、MRR（以黃金影片＋時間窗為正解；時間窗容差 ±60 秒）。另記「結構化 filter 單獨命中率」以判斷向量是否必要。**只對第二節標 ✅／⚠ 且語料已到位的題計算**，並把分母寫進報告。
- **生成層**：Faithfulness（答案每句可否對應到檢索出的字幕塊）、Context precision／recall、拒答正確率（第 25 題類）。可用 Ragas 既有指標或 Claude 當評審；每次改動都重跑同一套題。用 Claude 當評審時，評審模型不得與回答模型同一個提示詞來源，且抽 10% 人工覆核。
- **與 line 2 KPI 串接**：RAG 答案用於「選人預測」題型時，預測準確率是否提升（line 2 的 KPI 定義見 `research/line2-domain-learning/self-dialogue.md`）。

## 九、與 Ditto routine 的整合（規劃，尚未改動 routine）

`scripts/daily-routine.md` 目前**沒有**任何抓影片／字幕的步驟（它只做研究推進、反思、live docs）。若 M1 核准，要新增一步：`yt-dlp` 掃新影片 → 寫 video/team JSON → **增量**切塊、算 embedding、upsert 進 SQLite（以 `video_id + chunk_idx` 當主鍵，字幕檔 hash 變了才重算）→ 索引檔 commit。切 Regulation 時，舊塊標 `archived` 不刪（沿用 line 2「標 Regulation 以便過期淘汰」的做法）。Notion 以 page `last_edited_time` 做增量。

注意：把剩下 643 支字幕一次抓完，就是第十節講的「量大自動化存取」情境；要先決定是分批慢抓、用官方 Data API（Data API 不提供字幕下載，待查證替代方案），還是徵得頻道同意。

## 十、風險

| 風險 | 說明 | 對策 |
|---|---|---|
| **資料前置依賴（審查新增）** | 本計畫的基線靠結構化欄位與全頻道字幕，但今天 chapters 7／679、regulation_code 14／679、隊伍 JSON 0、字幕 36／679 | M1 的第一週其實是 line 4 的工作；里程碑表已改成「M1 前置」 |
| **評估集太小（審查新增）** | 25 題、其中 7 題當天可測；一題 4% | 擴到 40–50 題；分母寫明；黃金答案由人確認 |
| 字幕聽寫錯誤 | Fiske 多為人工字幕，但仍有同音錯字；官方解說字幕品質待抽查 | 譯名別名表做查詢擴充；回答附時間戳讓人可回看 |
| 譯名多版本／兩字詞 | 同一隻寶可夢有舊譯、簡中、口語簡稱、英文；FTS5 trigram 對 <3 字無效 | `data/ref` 擴充 alias → 檢索前正規化；兩字詞走 LIKE 或擴片語 |
| meta 過期 | 舊 Regulation 的結論被當成現在 | 每塊帶 `regulation_set_id`，查詢預設只看現行，需明示才看歷史 |
| 會員影片缺字幕 | 75 支會員片未登入抓不到（`errors.log` 目前 40 筆） | 先索引公開版；`is_members_only` 已在 schema，值待補 |
| **合規** | YouTube 服務條款禁止未經書面許可以自動化工具存取，以及重製／下載內容 | 字幕僅本機研究、不入網站、不重發布；網站只給引述＋時間戳＋連結；量大時改用官方 API 或徵得頻道同意（待第一擁有者決定） |
| 技術不成熟 | sqlite-vec README 自述 pre-v1 | 抽象一層 repository，可換 LanceDB／pgvector |

## 十一、分階段里程碑與 go/no-go

| 階段 | 內容 | 成本 | go/no-go |
|---|---|---|---|
| M0（本文） | Pre-plan 完成，**不實作** | 0 | 第一擁有者同意方向；在此之前不花 token |
| M1 前置（＝line 4 工作） | 全頻道字幕抓齊（含抓取節奏的合規決定）、chapters／regulation_code 填滿、隊伍 JSON 至少 50 隊、別名表 | 0 元；時間依 line 4 | 沒有這步，M1 的數字沒意義 |
| M1 評估集＋無向量基線 | 40–50 題黃金答案（人確認）；SQL filter + FTS5（含兩字詞對策）+ 長上下文回答 | ≈ 0；約 1 週 routine | 可測題 Hit@3 ≥ 80% → 可跳過向量直接 M3；否則先分辨是欄位／別名／語意問題，再進 M2 |
| M2 本機混合索引 | bge-m3 切塊入 sqlite-vec，三路融合；增量更新進 routine | 本機算力；API 備選 < $1 | Hit@5 ≥ 85%、Faithfulness ≥ 0.9、單問 < $0.5 |
| M3 雲端同步＋Notion | 同步到 Supabase pgvector；Notion 匯入 | Free 方案 $0 | 與 line 5 後端 schema 對齊 |
| M4 網站問答 | 唯讀問答 UI，引用＋時間戳 | 視流量 | 合規審查過關 |

## 十二、不做清單

不微調模型；不自建 ASR；不索引隊伍結構化欄位進向量庫；不爬 Pikalytics（未找到公開 API，且有 Smogon／Limitless 可替代）；不重發布字幕；不繞會員牆；M2 前不上 reranker／graph RAG；不為 (A) 靜態前端提前量身優化；M0 階段不寫任何索引程式。

## 來源

- Fiske Pokémon 頻道：https://www.youtube.com/@fiskepokemon ；本倉庫 `data/channels/fiskepokemon/raw/channel-index.json`（679 支／797.9 h）、`raw/*.zh-TW.json3`（36 支，字數實測）、`videos.json`（chapters／regulation_code 覆蓋率）
- Anthropic, Contextual Retrieval（49%／67%／$1.02 per M tokens／top-20；Claude 3 Haiku 生成 context）：https://www.anthropic.com/news/contextual-retrieval
- Claude 定價（Opus 5.5 $4/M 輸入、快取命中 $0.20/M；Haiku 5.5 ≤10 萬 tokens $0.10/M、超過整個請求 $0.50/M；1M 上下文標準計價；Batch 五折）：https://platform.claude.com/docs/en/about-claude/pricing
- OpenAI embeddings 定價（3-small $0.02、3-large $0.13）：https://developers.openai.com/api/docs/pricing ；模型頁 https://developers.openai.com/api/docs/models/text-embedding-3-small
- Voyage 定價（voyage-4-lite/4/4-large $0.02/$0.06/$0.12，各 2 億免費 tokens）：https://docs.voyageai.com/docs/pricing
- Gemini embedding 定價（001 $0.15、-2 $0.20、Batch 半價、免費層）：https://aistudio.google.com/docs/pricing
- bge-m3 模型卡（MIT、8192、dense/sparse/multi-vector）：https://huggingface.co/BAAI/bge-m3 ；Qwen3-Embedding（Apache-2.0、8B MTEB 多語 70.58）：https://qwenlm.github.io/blog/qwen3-embedding/ ；C-MTEB：https://pypi.org/project/C-MTEB/ ；Zilliz 2026 綜評：https://zilliz.com/learn/choose-embedding-model-rag-2026
- multilingual-e5-small（Transformers.js）：https://huggingface.co/Xenova/multilingual-e5-small ；https://github.com/huggingface/transformers.js
- sqlite-vec（README：pre-v1、純 C、WASM）：https://github.com/asg017/sqlite-vec ；LanceDB vs Chroma：https://zilliz.com/comparison/chroma-vs-lancedb ；SQLite FTS5（trigram tokenizer；<3 字不命中）：https://www.sqlite.org/fts5.html
- Supabase 定價（Free 500 MB／2 個活躍專案／1 週暫停；Pro $25 起含 8 GB）：https://supabase.com/pricing
- Ragas 指標：https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/
- YouTube 服務條款（繁中版「權限和限制」第 1、3 條；生效日期兩次抓取結果不一致，待查證）：https://www.youtube.com/t/terms
- Limitless 開發者文件（免金鑰、rate limit、金鑰只給公開專案；VGC 覆蓋未寫明）：https://docs.limitlesstcg.com/developer.html ；Smogon usage：https://www.smogon.com/stats/ 、https://data.pkmn.cc/ ；PokePaste 原始碼（BSD-3，待查證）：https://github.com/felixphew/pokepaste ；Pikalytics：https://www.pikalytics.com/
