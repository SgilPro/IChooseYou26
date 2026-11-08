# RAG 線 Pre-Plan：讓 Ditto 用自家語料回答雙打問題

> 狀態：Pre-Plan & Research（第一擁有者指示先不實作）。日期 2026-11-08。所有數字與事實附來源；標「估」的是我的推算，標「待查證」的尚未確認。

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

| # | 類別 | 範例問題 | 預期主要來源 |
|---|---|---|---|
| 1 | 規則／機制 | Champions 的 Regulation M-C 能帶幾隻限制級傳說？開放哪些機制？ | `data/ref/regulation_sets.json` |
| 2 | 規則／機制 | Mega 進化在 Champions 一場限幾次？Mega 後速度何時生效？ | 字幕（教學）＋ research/line2 課綱 |
| 3 | 規則／機制 | 戲法空間下，誰先動：速度 50 還是 100？持續幾回合？ | research/line2 課綱 |
| 4 | 規則／機制 | 威嚇對特性「精神力」的寶可夢有效嗎？ | 字幕（實戰解說）＋課綱 |
| 5 | 規則／機制 | 順風與戲法空間同時存在時怎麼算？ | 課綱 |
| 6 | 隊伍構築 | Fiske 用過哪些「雨天 + Mega」隊？各自核心是誰？ | 隊伍 JSON（SQL） |
| 7 | 隊伍構築 | 胖甜妮搭 Mega 水晶燈火靈的隊，六隻與道具是什麼？ | 隊伍 JSON＋字幕「隊伍介紹」章節 |
| 8 | 隊伍構築 | Fiske 怎麼解釋阿勃梭魯的努力值配法？ | 字幕（team_intro_range） |
| 9 | 隊伍構築 | 有哪些隊同時帶「看我嘛」引導手與強化手？ | 隊伍 JSON＋tags |
| 10 | 隊伍構築 | 新手入門系列建議的第一支隊伍是什麼？ | 字幕（播放清單「對戰新手入門」） |
| 11 | meta 查詢 | M-C 目前使用率前十是誰？ | Smogon usage（data.pkmn.cc） |
| 12 | meta 查詢 | 最近一場官方賽事冠軍隊是什麼？ | Limitless API |
| 13 | meta 查詢 | 某隻寶可夢最常見的道具與招式組合？ | Smogon chaos JSON |
| 14 | meta 查詢 | M-B → M-C 新增了哪些寶可夢？ | regulation_sets.json |
| 15 | meta 查詢 | 這隻在 Fiske 影片中出現的頻率，與公開使用率差多少？ | 隊伍 JSON × usage（跨源） |
| 16 | 影片內容查找 | Fiske 哪一集講過「騙守住」的判斷？給時間點。 | 字幕（章節標題 + 全文） |
| 17 | 影片內容查找 | 官方比賽解說中，主播怎麼分析某場決賽的選人？ | 字幕（官方解說播放清單） |
| 18 | 影片內容查找 | 哪些影片的 QOTD 問到速度線？ | 章節「QOTD」字幕 |
| 19 | 影片內容查找 | 找出「對手開雨天但我方先手」的實戰片段。 | 字幕（實戰章節） |
| 20 | 影片內容查找 | Fiske 對「擊掌奇襲」在開局的看法有沒有改變？（跨影片、跨時間） | 多影片字幕＋發布日期 |
| 21 | 個人筆記 | 我在 Notion 記的某隊努力值跟 Fiske 的版本差在哪？ | Notion × 隊伍 JSON |
| 22 | 個人筆記 | 我上次對某隊的復盤結論是什麼？ | Notion／GameLog |
| 23 | 綜合 | 用三句話總結 Fiske 對「高速指導隊」的打法，附出處。 | 字幕多段 |
| 24 | 綜合 | 面對順風隊，Fiske 影片與 Wolfey 的建議有何不同？ | 字幕＋research/line2 |
| 25 | 拒答測試 | 某隻**不在**語料中的寶可夢，Fiske 怎麼用？（應答「語料中沒有」） | — |

## 三、語料盤點與分塊策略（完整表見 `02-corpus-inventory.md`）

實測（`channel-index.json`，2026-11-08）：679 支、有時長者 652 支、合計 797.9 小時、平均 73.4 分鐘；抽樣三支人工 zh-TW 字幕密度：對戰片約 260–270 字/分、教學片約 380–410 字/分。

分塊原則只有三條：
- **結構化資料不進向量庫**：影片 metadata、隊伍／成員、規則組、使用率、賽果一律 SQL／filter；只把 `notes`、`role_note` 等自由文字入索引。
- **字幕兩層切**：先按 `chapters`（隊伍介紹／QOTD／實戰 N）切，再切 60–90 秒窗（約 300–500 字），不跨章節；每塊前綴「影片標題｜規則組｜章節｜起訖秒」當 context（Anthropic contextual retrieval 作法，見第六節）。
- **研究文件按 H2/H3 切，但全量僅約 1.4 萬字（估 ≈ 2 萬多 tokens）**，直接整包進上下文即可，RAG 非必要。Notion 按 block 切，DB 欄位走 SQL。

## 四、架構候選比較

| 候選 | 適合誰 | 優點 | 缺點／風險 | 結論 |
|---|---|---|---|---|
| **(A) 純靜態前端**：預算 embeddings JSON + 瀏覽器端向量搜尋（transformers.js 跑 multilingual-e5-small 等） | 網站訪客 | 0 伺服器成本，GitHub Pages 可放 | 瀏覽器端要載模型與索引（1–2 萬塊 × 384 維即十幾 MB，估）；小模型繁中品質未知；查詢向量與索引向量必須同模型 | 之後給網站「只讀」場景備用；不當主線 |
| **(B) Supabase pgvector** | 網站 + Ditto | Postgres 同時管隊伍表與向量；Free 方案 500 MB／專案、一週沒活動會暫停、Pro $25/月起含 8 GB | 需雲端；免費方案暫停會讓 cron 失敗 | **M3 階段**同步目標，對齊 line 5 後端 |
| **(C) 本機**：SQLite + FTS5 + sqlite-vec（或 LanceDB／Chroma） | Ditto routine | 單檔、可版控、零成本、跟 `data/` JSON 同倉庫；sqlite-vec 純 C 無依賴、可跑瀏覽器 WASM（但官方標示 pre-v1，會有破壞性變更）；LanceDB 內建全文＋向量＋SQL filter | sqlite-vec 不成熟；Chroma 無全文檢索 | **M1–M2 主線**；若 sqlite-vec 不穩就換 LanceDB |
| **(D) 不做 RAG，直接長上下文** | 所有人 | 最簡單；Claude 4.6+ 的 1M 上下文**標準計價、無長上下文加價**（Haiku 5.5 例外，超過 10 萬 tokens 漲價） | 全頻道 15–25M tokens 塞不進 1M；每問都重送大量 tokens 貴（Opus 5.5 $4/M 輸入；50 萬 tokens 一問 ≈ $2，快取命中 $0.20/M 後 ≈ $0.10） | **對 `research/` 文件與「篩到 3–5 支影片後」的回答，直接用 (D)**；它是基線的一部分 |

**我的選擇：(C) 為核心，(D) 為回答層，(B) 為網站同步，(A) 保留。** 關鍵洞察：我們的語料「結構化欄位很強」（寶可夢、規則組、章節、播放清單），先用它們篩選，多數問題已縮到幾支影片，長上下文直接讀即可——向量只處理「找不到關鍵字的語意問題」。

## 五、成本試算

**字幕量（估）**：以 679 × 60 分鐘（擁有者假設）× 310 字/分 ≈ 12.6M 字；以實測 798 小時 ≈ 14.8M 字（範圍 12–20M）。繁中 1 字約 1–1.3 token（依 tokenizer 不同，估），全頻道 ≈ 15–25M tokens，對戰相關子集（70%）≈ 13M tokens。

**一次性 embedding 費用（以 19M tokens 計，估）**

| 模型 | 單價（/1M tokens） | 全頻道 | 備註 |
|---|---|---|---|
| OpenAI text-embedding-3-small | $0.02（Batch 再半價） | ≈ $0.4 | 1536 維 |
| OpenAI text-embedding-3-large | $0.13 | ≈ $2.5 | |
| Voyage voyage-4-lite / voyage-4 / voyage-4-large | $0.02 / $0.06 / $0.12，各含 2 億 token 免費額度 | ≈ $0（免費額度內） | 2026-01 發布，多語，支援 2048/1024/512/256 維 |
| Gemini gemini-embedding-001 / -2 | $0.15 / $0.20（Batch 半價；免費層 $0） | ≈ $3–4 | -2 仍為 preview |
| bge-m3 / multilingual-e5 / Qwen3-Embedding（本機） | $0 | 本機 CPU/GPU 時間 | 見第七節 |
| Contextual retrieval 前綴生成（Haiku 5.5 $0.10/M 輸入） | Anthropic 原文估每百萬文件 tokens ≈ $1.02（2024 年 Sonnet 價） | ≈ $20 上限；用 Haiku 5.5 應遠低於此（估） | 章節標題已是天然 context，可先不生成 |

**查詢期費用（Claude 回答）**：每支影片字幕約 3 萬 tokens（估）。篩到 3–5 支後整段餵入 ≈ 10–15 萬 tokens；Opus 5.5 一問 ≈ $0.4–0.6，Haiku 5.5（≤10 萬 tokens 時 $0.10/M）≈ $0.01–0.02。結論：**成本瓶頸在回答層的輸入 tokens，不在 embedding**；篩選越準越省。

## 六、混合檢索設計

1. **結構化 filter 先行**：由問題抽出寶可夢名（經 `data/ref` 譯名／別名表正規化）、規則組、播放清單、日期 → SQL 篩影片／隊伍。
2. **BM25 全文**：SQLite FTS5 用 `trigram` tokenizer 處理中文無空格問題（SQLite 官方文件載明 trigram tokenizer）；同時索引章節標題。
3. **向量**：只對字幕塊與 Notion 段落；bge-m3 可同時輸出 dense 與 sparse（類 BM25）向量，一個模型涵蓋兩路。
4. **融合**：Reciprocal Rank Fusion 合併三路，取 top-20 塊，依影片聚合後把「整個章節」送回答層（Anthropic 實驗：contextual embeddings + contextual BM25 讓 top-20 檢索失敗率降 49%，再加 rerank 降 67%；top-20 比 5／10 好）。
5. **回答層**：Claude 以引用模式回答，必附影片 id＋秒數；語料無答案時明說。

## 七、繁中 embedding 模型選擇

| 模型 | 現況（2026-11 查證） | 價格 | 繁中表現來源 |
|---|---|---|---|
| **BAAI/bge-m3** | 開源 MIT；100+ 語；8192 tokens；一模型出 dense/sparse/multi-vector | $0 | 模型卡列 MIRACL/MKQA（多語），**無繁中專屬數據**；社群常用於中文 RAG |
| Qwen3-Embedding 0.6B/8B | Apache-2.0；8B 於 2025-06 MTEB 多語榜第一（70.58）；0.6B 的 CMTEB-R 71.02 | $0 | 官方部落格（簡中為主的 CMTEB） |
| intfloat/multilingual-e5-small/large | 開源；small 有 Transformers.js ONNX 版可跑瀏覽器 | $0 | 無繁中專屬數據 |
| Voyage voyage-4 系列 | 多語通用；MongoDB 旗下 | $0.02–0.12/M | 官方未公布繁中數據 |
| OpenAI text-embedding-3 | 穩定、便宜 | $0.02–0.13/M | 無繁中專屬數據 |
| Gemini embedding-2 | preview；多模態 | $0.20/M | 無繁中專屬數據 |

**判斷**：我找不到任何可信的「繁體中文＋口語字幕」公開基準（C-MTEB 以簡中為主，Zilliz 2026 綜評也提醒 MTEB 不覆蓋跨語言檢索）。所以**不能憑榜單選模型**，要用第二節的評估集跑 bge-m3 vs voyage-4-lite vs text-embedding-3-small 三選一；bge-m3 因免費＋dense/sparse 雙出而為預設。

## 八、評估方法

- **檢索層**：Hit rate@3／@5、MRR（以黃金影片＋時間窗為正解；時間窗容差 ±60 秒）。另記「結構化 filter 單獨命中率」以判斷向量是否必要。
- **生成層**：Faithfulness（答案每句可否對應到檢索出的字幕塊）、Context precision／recall、拒答正確率（第 25 題類）。可用 Ragas 既有指標或 Claude 當評審；每次改動都重跑同一套 25 題。
- **與 line 2 KPI 串接**：RAG 答案用於「選人預測」題型時，預測準確率是否提升。

## 九、與 Ditto routine 的整合

每日 routine（`scripts/daily-routine.md`）新增一步：`yt-dlp` 掃新影片 → 寫 video/team JSON → **增量**切塊、算 embedding、upsert 進 SQLite（以 `video_id + chunk_idx` 當主鍵，字幕檔 hash 變了才重算）→ 索引檔 commit。切 Regulation 時，舊塊標 `archived` 不刪（沿用 line 2 知識卡片淘汰機制）。Notion 以 page `last_edited_time` 做增量。

## 十、風險

| 風險 | 說明 | 對策 |
|---|---|---|
| 字幕聽寫錯誤 | Fiske 多為人工字幕，但仍有同音錯字；官方解說字幕品質待抽查 | 譯名別名表做查詢擴充；回答附時間戳讓人可回看 |
| 譯名多版本 | 同一隻寶可夢有舊譯、簡中、口語簡稱、英文 | `data/ref` 擴充 alias → 檢索前正規化；向量模型本身對同義有一定容忍 |
| meta 過期 | 舊 Regulation 的結論被當成現在 | 每塊帶 `regulation_set_id`，查詢預設只看現行，需明示才看歷史 |
| 會員影片缺字幕 | 75 支會員片未登入抓不到 | 先索引公開版；`is_members_only` 標記待補 |
| **合規** | YouTube 服務條款禁止未經書面許可以自動化工具存取，以及重製／下載內容 | 字幕僅本機研究、不入網站、不重發布；網站只給引述＋時間戳＋連結；量大時改用官方 API 或徵得頻道同意（待第一擁有者決定） |
| 技術不成熟 | sqlite-vec pre-v1 | 抽象一層 repository，可換 LanceDB／pgvector |

## 十一、分階段里程碑與 go/no-go

| 階段 | 內容 | 成本 | go/no-go |
|---|---|---|---|
| M0（本文） | Pre-plan 完成 | 0 | 第一擁有者同意方向 |
| M1 評估集＋無向量基線 | 25 題黃金答案；SQL filter + FTS5 + 長上下文回答 | ≈ 0；約 1 週 routine | Hit@3 ≥ 80% → 可跳過向量直接 M3；否則進 M2 |
| M2 本機混合索引 | bge-m3 切塊入 sqlite-vec，三路融合；增量更新進 routine | 本機算力；API 備選 < $1 | Hit@5 ≥ 85%、Faithfulness ≥ 0.9、單問 < $0.5 |
| M3 雲端同步＋Notion | 同步到 Supabase pgvector；Notion 匯入 | Free 方案 $0 | 與 line 5 後端 schema 對齊 |
| M4 網站問答 | 唯讀問答 UI，引用＋時間戳 | 視流量 | 合規審查過關 |

## 十二、不做清單

不微調模型；不自建 ASR；不索引隊伍結構化欄位進向量庫；不爬 Pikalytics（未找到公開 API，且有 Smogon／Limitless 可替代）；不重發布字幕；不繞會員牆；M2 前不上 reranker／graph RAG；不為 (A) 靜態前端提前量身優化。

## 來源

- Fiske Pokémon 頻道：https://www.youtube.com/@fiskepokemon ；本倉庫 `data/channels/fiskepokemon/raw/channel-index.json`、`*.zh-TW.json3`（實測字數）
- Anthropic, Contextual Retrieval：https://www.anthropic.com/news/contextual-retrieval
- Claude 定價（1M 上下文標準計價、Haiku 5.5 長提示加價、Batch 五折、快取）：https://platform.claude.com/docs/en/about-claude/pricing
- OpenAI text-embedding-3-small：https://developers.openai.com/api/docs/models/text-embedding-3-small ；價格彙整 https://www.costbench.com/software/embedding-apis/openai-embeddings/
- Voyage 定價：https://docs.voyageai.com/docs/pricing ；voyage-4 說明 https://openrouter.ai/voyageai/voyage-4
- Gemini embedding 定價：https://aistudio.google.com/docs/pricing
- bge-m3：https://huggingface.co/BAAI/bge-m3 ；Qwen3-Embedding：https://qwenlm.github.io/blog/qwen3-embedding ；C-MTEB：https://pypi.org/project/C-MTEB/ ；Zilliz 2026 綜評：https://zilliz.com/learn/choose-embedding-model-rag-2026
- multilingual-e5-small（Transformers.js）：https://huggingface.co/Xenova/multilingual-e5-small ；https://github.com/huggingface/transformers.js
- sqlite-vec：https://github.com/asg017/sqlite-vec ；LanceDB vs Chroma：https://zilliz.com/comparison/chroma-vs-lancedb ；SQLite FTS5（trigram）：https://www.sqlite.org/fts5.html
- Supabase 定價：https://supabase.com/pricing
- Ragas 指標：https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/
- YouTube 服務條款：https://www.youtube.com/t/terms
- Limitless 開發者文件：https://docs.limitlesstcg.com/developer.html ；Smogon usage：https://www.smogon.com/stats/ 、https://data.pkmn.cc/ ；PokePaste 原始碼（BSD-3）：https://github.com/felixphew/pokepaste ；Pikalytics：https://www.pikalytics.com/
