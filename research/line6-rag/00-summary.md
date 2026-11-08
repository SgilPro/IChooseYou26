# RAG 線：一頁摘要（Pre-Plan & Research 階段）

> 第一擁有者的要求（`goal/261108_1.all_in_one.md` 第 3 點）：「RAG 線先做到 Pre-Plan & Research 就好，先不花 token 往下實作。」本文是結論；細節見 `01-pre-plan.md`、語料清單見 `02-corpus-inventory.md`。

## 我們要做什麼

讓 Ditto（之後是網站）回答雙打問題時，**有憑有據地引用我們自己的語料**：Fiske Pokémon 679 支影片的繁中字幕與抽出的隊伍、`research/` 文件、公開賽事／使用率資料、以及第一擁有者的 Notion 筆記。回答要能說「這段出自哪支影片第幾分鐘」。

## 我查到的關鍵數字

- 頻道共 **679 支影片、約 798 小時**（平均 73 分鐘，`channel-index.json` 實測）；其中約 **70% 與寶可夢對戰相關**。
- Fiske 影片有**人工上傳的 zh-TW 字幕**（不是自動聽寫），實測每分鐘 260–410 字。全頻道約 **12–20M 字 ≈ 15–25M tokens**；對戰子集約 **13M tokens**。
- 把它全部做成向量，用最便宜的 API（OpenAI text-embedding-3-small 或 Voyage voyage-4-lite，皆 $0.02/M tokens）**不到 1 美元**；本機開源 bge-m3 則是 0 元。embedding 不是成本問題。
- `research/` 全部文件只有約 1.4 萬字（≈ 2 萬多 tokens），**直接塞進 Claude 上下文即可，不需要 RAG**。
- 單支影片字幕約 3 萬 tokens；只要先用結構化欄位（寶可夢、規則組、章節）把候選影片篩到 3–5 支，就能整段放進 1M 上下文回答。

## 我的建議（五行）

1. **先不做向量。** 第一階段用「結構化篩選（隊伍 JSON／SQL）→ 關鍵字全文檢索（SQLite FTS5）→ 命中影片的章節字幕整段餵 Claude」的無向量基線，搭配 25 題評估集量化命中率；向量索引只在基線不及格時才加。
2. **語料分層處理。** 隊伍／規則組／使用率是結構化資料，一律走 SQL／filter；字幕按「章節 → 60–90 秒窗」切塊並在每塊前綴影片名、規則組、章節、時間戳（Anthropic「contextual retrieval」做法）；研究文件按標題切。
3. **架構先選 (C) 本機單檔 SQLite**（FTS5 + sqlite-vec），與現有 `data/` JSON 同倉庫、可版控、Ditto 每日 routine 增量更新；網站需要時再同步到 (B) Supabase pgvector（免費方案 500 MB 夠用）。
4. **embedding 模型先用開源 bge-m3**（MIT、8192 tokens、同時出 dense+sparse 向量、多語），API 候選是 voyage-4-lite／text-embedding-3-small；繁中沒有公開的專屬基準，**必須用我們自己的評估集實測後再定案**。
5. **合規紅線：** YouTube 條款禁止未經許可的自動化存取與重製；字幕只供本機研究與摘要，**網站不得重發布字幕全文**，只能給引述、時間戳與原影片連結；會員影片不繞過。

## 里程碑與 go/no-go

M1（評估集 + 無向量基線，約 1 週、幾乎 0 元）→ 命中率@3 < 80% 才進 M2（本機混合索引）→ 命中率@5 ≥ 85% 且忠實度 ≥ 0.9 才進 M3（Supabase 同步 + Notion）→ M4 網站問答。詳見 `01-pre-plan.md` 第十節。
