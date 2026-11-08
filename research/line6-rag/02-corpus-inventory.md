# RAG 語料清單（Corpus Inventory）

> 配合 `01-pre-plan.md` 第三節。量級以 2026-11-08 掃描為準；「估」為推算。授權／合規欄只是我的初步判讀，不是法律意見。

| 來源 | 格式 | 量 | 更新頻率 | 授權／合規注意 | 主鍵 | 建議分塊 / 檢索方式 |
|---|---|---|---|---|---|---|
| Fiske 影片 metadata（`video.schema.json`；yt-dlp `.info.json`） | JSON | 679 支（652 有時長，798 小時；播放清單：寶可夢對戰 167、官方比賽解說 85、會員專屬 75、Champions 52、週末盃 38、全解析 37、新手入門 14…） | 每日掃新片 | 公開 metadata；YouTube 條款限制自動化存取，量大時考慮官方 Data API | `video_id` | 不切；SQL filter（規則組、播放清單、分類、日期、章節） |
| Fiske 人工字幕（`*.zh-TW.json3`） | json3（逐句＋毫秒時間戳） | 估 12–20M 字 ≈ 15–25M tokens；對戰子集 ≈ 13M tokens；每分鐘 260–410 字 | 隨新片 | **只供本機研究與摘要**；不重發布全文；網站只給引述＋時間戳＋連結 | `video_id + chunk_idx`（含 `start_ms/end_ms`、`chapter`） | 兩層：章節 → 60–90 秒窗（300–500 字）；塊前綴影片名｜規則組｜章節｜時間；FTS5 trigram + 向量 |
| YouTube 自動字幕（`tr-zh-TW`、`zh-Hant-zh-TW` 等） | json3 | 幾乎每支都有 | 隨新片 | 同上；品質低於人工字幕 | 同上 | **僅在無人工字幕時**作備援；標 `source=auto` 降權 |
| 影片章節（`chapters`，如「隊伍介紹／QOTD／實戰 N」） | JSON | 對戰片多數有 | 隨新片 | 公開 | `video_id + chapter_idx` | 當字幕的第一層切點與過濾欄位；章節標題本身入 FTS |
| 隊伍與成員（`team.schema.json`、`team_member.schema.json`） | JSON（未來 SQL 表） | 目標：每支對戰片 1 隊，估 300–450 隊 | 隨新片 | 自家整理資料；標 `confidence`、`review_status` | `team_id`；成員 `team_id + slot` | **不進向量庫**；SQL／filter；只把 `notes`、`role_note` 自由文字入索引 |
| 參照表（`regulation_sets.json`、`tags.json`） | JSON | 規則組數個、tag 約 30 | 換 Regulation 時 | 自家整理，附來源 | `id` / `slug` | 不切；作查詢正規化與 filter；`aliases_zh` 擴充成譯名別名表 |
| `research/*.md`（line1–6、product-ideation） | Markdown | 約 1.4 萬字（估 ≈ 2 萬多 tokens） | 每日 | 自家文件 | `path + heading_path` | 按 H2/H3 切；**量小可整包進上下文**，RAG 非必要 |
| `ditto/reflections/*.md` | Markdown | 每日一篇 | 每日 | 自家 | `date + heading` | 按日期；僅供 Ditto 自查 |
| Limitless VGC 賽事（API） | JSON（REST + webhook） | 依賽季 | 事件觸發／每週 | 多數端點免金鑰；金鑰只給公開專案；有 rate limit | `tournament_id`、`player/placing` | 不索引；即時查詢或快取 JSON，SQL |
| Smogon usage（smogon.com/stats、data.pkmn.cc） | JSON／txt | 每月每格式一份；chaos JSON 較大 | 每月（data.pkmn.cc 每日刷） | 公開資料，標註來源 | `format + month + species` | 不索引；轉成表格 SQL |
| pokepast.es 隊伍貼文 | 純文字（Showdown 格式） | 影片描述或 Notion 內連結數量級幾十到幾百 | 隨影片／筆記 | 站方程式為 BSD-3；貼文內容屬作者，只存連結＋解析結果 | `paste_id` | 解析為成員結構化欄位，走 SQL；不向量化 |
| Pikalytics | 網頁 | — | — | **未找到公開 API**；不爬取，用 Smogon／Limitless 替代 | — | 不納入 |
| 第一擁有者 Notion（隊伍 DB、Pokémon SV 筆記） | Notion API（page／database → blocks） | 待統計 | 手動編輯後增量（`last_edited_time`） | 私人資料，只在本機／私有庫；網站需另外授權 | `notion_page_id + block_id` | DB 欄位走 SQL；頁面段落按 block 切；向量＋FTS（待查證匯出細節） |
| GameLog 產出（app） | JSON | 隨使用 | 隨使用 | 自家 | `game_id + turn` | 結構化，SQL；回合摘要可入 FTS |

## 備註

- **主鍵設計原則**：所有塊都回得去原文（影片→秒數；文件→標題路徑；Notion→block id），這是「有憑有據」的前提。
- **增量更新**：以來源檔 hash 或 `last_edited_time` 判斷是否重算；切 Regulation 時舊塊標 `archived`，不刪。
- **語言**：語料以繁中為主，公開資料為英文；寶可夢名透過 `name_en`（@pkmn/dex）對齊，查詢時用別名表擴充。
- 來源 URL 見 `01-pre-plan.md` 末節。
