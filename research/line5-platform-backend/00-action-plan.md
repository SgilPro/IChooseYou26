# 第五線 Action Plan：IChooseYou 從靜態站到有後端的隊伍資料站

> 2026-11-08 · Ditto · 狀態：規劃完成，待第一擁有者拍板後才動工。
> 原始需求：goal/261108_1 第 2 項。

## 一、需求理解

### 1.1 第一擁有者說的（復述）
- 延續現有網站（GitHub Pages 上的 docs-site + Game Log app），改成**有後端**的版本。
- 費用最低：前端留在 GitHub Pages，後端接 Firebase / Supabase / 其他免費方案。
- 第一個目標：**接第一線的內容**（Fiske Pokemon 頻道影片 → 隊伍），以及**第一擁有者的 Notion 記錄**。
- 參考 victorpoke-champions.com 的隊伍頁，與 Pikalytics 這類使用率站。
- 先不實作，先做到 Action Plan。

### 1.2 我補上的假設（錯了請改）
- A1. 「接內容」= 網站上能**瀏覽、搜尋、篩選**這些隊伍，並能看到每隻的配置（道具、特性、性格、努力值、招式）。
- A2. 第一擁有者是**第一位也是最重要的使用者**：先服務「我自己查我記過的隊伍」，再談給別人用。
- A3. Notion 不會立刻停用；短期內資料來源是「第一線 JSON + Notion 匯出」兩路並進，日後才收斂成一個資料庫。
- A4. 第一線的 JSON schema（`data/schema/*.json`）就是資料契約；網站與資料庫都要能吃這份格式，不另起爐灶。
- A5. 「使用率」第一階段指**我們自己資料集內**的使用率（Fiske 的隊伍裡誰最常出現），不是去爬 Pikalytics。

## 二、目標使用者與情境

| 使用者 | 情境 | 必要功能 |
|---|---|---|
| 第一擁有者（現在） | 「上次看 Fiske 那隊雨天 Mega 具甲武者的配置是什麼？」「M-C 有哪些戲法空間隊？」 | 依規則組 / 標籤 / 寶可夢篩選、隊伍頁、影片連結跳回原片 |
| 第一擁有者（校對） | 看到抽取錯的招式想當場改 | 登入後在網頁編輯 → Phase 2 |
| Ditto（自動化） | 第一線每天產出新隊伍，要自動上線 | build 時讀 JSON / 或排程 upsert 進 DB |
| 繁中 VGC 玩家（未來） | 想找某隻寶可夢在 Champions 常見怎麼配、常跟誰一隊 | 寶可夢頁：使用率、常見隊友、常見道具/招式 → Phase 1 做我們資料集版，Phase 3 接外部來源 |
| 投稿者（未來） | 想分享自己的隊伍拿分享碼 | 登入、建隊、分享碼、匯入 Showdown 文字 → Phase 3 |

## 三、現況

- 前端：`app/`（React 18 + TypeScript + Vite 5，用 `@pkmn/dex` 做名稱對齊），由 `.github/workflows/deploy-docs.yml` build 後與 `docs-site/` 一起推上 GitHub Pages。**沒有後端、沒有登入、沒有資料庫。**
- 資料（2026-11-08 傍晚核對 repo 工作目錄）：第一線主表 `data/channels/fiskepokemon/videos.json` **已落地**：679 支；`is_members_only` 78 支（line4 記的「會員專屬對戰影片」播放清單是 75 支，差 3 支，待第一線對帳）；`game` 判定為 champions 60 支、sv 357 支、未判定 218 支。隊伍表的實際流程是每支影片一檔 `teams/<videoId>.json`（目前 1 檔）→ `tools/yt/merge-teams.mjs` 合併成 `teams.json` / `teams.csv`；**合併檔尚未產出**。參照表 `data/ref/regulation_sets.json`（13 個規則組）、`tags.json`（32 個標籤）；schema 在 `data/schema/`。
- 範圍限制：第一擁有者已拍板「深度抽取只做 Champions 時代對戰影片」（`goal/_progress.md`），所以 Phase 1 能上線的隊伍池上限約 60 支影片，不是 679；SV 時代的隊伍要靠 Notion 搬入。
- Notion：隊伍 DB（名稱、規則組 relation、tags、影片網址、作者、成員 relation → 寶可夢實體 DB：努力值/性格/特性/道具/招式 → 圖鑑 relation）。我尚未讀到實際內容，欄位對照在 `03-notion-migration.md`。
- `server/`：本機 yt-dlp 小後端，自用，不部署。

## 四、分階段 Action Plan

### Phase 1 — 靜態資料站（不加後端）
**目標**：網站能瀏覽第一線 + Notion 的隊伍，全部在 build 時打包成靜態 JSON。
**前置**：第一線已跑過 `merge-teams.mjs` 產出 `teams.json`，且至少有約 30 支隊伍。全部是機器抽的（`review_status: auto`）也可以，網頁會把信心分數與審核狀態一起顯示。以 Champions 對戰影片約 60 支估，30 支是可達成的門檻。

| # | 任務 | 估時 | 依賴 |
|---|---|---|---|
| 1.1 | `scripts/build-data.ts`：讀 `data/**/*.json` → 驗證 schema（用 ajv，一個照 JSON Schema 檢查資料格式的套件）→ 輸出 `app/public/data/{teams,videos,regulation_sets,tags,species}.json` + 衍生統計 `usage.json`（每規則組每物種出現率、常見隊友前五、常見道具/招式） | 1 天 | teams.json 存在 |
| 1.2 | Notion 一次性匯出腳本 → 同 schema 的 `data/notion/teams.json`（`source_kind: notion`） | 1 天 | Notion 連接器可讀（見 03） |
| 1.3 | 前端路由：`/teams`（列表＋篩選：規則組 / 標籤 / 含某隻 / 作者；排序：最新）、`/teams/:id`（六隻卡片＋影片 embed＋標籤＋筆記）、`/pokemon/:species`（在我們資料集的使用率、常見隊友、常見配置）、`/regulations`。注意 GitHub Pages 沒有伺服器端轉址，`/teams/xxx` 這種深連結直接打開會 404，要用 hash 路由（`/#/teams/xxx`）或 `404.html` 轉址的社群做法（見風險表） | 2 天 | 1.1 |
| 1.4 | 匯出為 Showdown 文字（pokepaste 格式），一鍵複製。**注意**：Champions 的能力點是 0–32 點制（schema `evs.scale: champions-points-32`），Showdown / pokepaste 是 0–252 努力值制；Showdown 的 Champions 格式怎麼表示點數**待查證**，可能只能原樣輸出點數並加註 | 0.5 天 | 1.3 |
| 1.5 | CI：deploy workflow 加 `paths: data/**`，資料更新即自動部署 | 0.5 天 | 1.1 |

**Go/No-go 進 Phase 2**：任一成立就 Go —(a) 第一擁有者一週內想在網頁改資料超過 ~10 次、(b) 需要登入才能看的東西（會員限定隊伍）、(c) 第一線資料量 > 數千隊讓單一 JSON 超過 ~5 MB 影響載入。

### Phase 2 — 接 Supabase（登入 + 線上編輯）
| # | 任務 | 估時 | 依賴 |
|---|---|---|---|
| 2.1 | 開 Supabase 專案（Supabase 用 AWS 區域代號：東京 `ap-northeast-1`、新加坡 `ap-southeast-1`，從台灣選東京；<https://supabase.com/docs/guides/platform/regions>），套 `02-schema.md` 的 DDL（建表語法）+ RLS（資料列層級權限） | 0.5 天 | 決策 D1 |
| 2.2 | `scripts/seed-supabase.ts`：從同一份 JSON **冪等 upsert**（以 `team.id`、`video.id` 為鍵），可重跑 | 1 天 | 2.1、1.1 |
| 2.3 | Google 登入（Supabase Auth）；`profiles` 表標記 `role: owner/editor/viewer`。注意 `02-schema.md` 第三節的 RLS 範例目前只認 `owner_user_id`，editor 角色要另寫 policy（02 已補範例） | 0.5 天 | 2.1 |
| 2.4 | 前端讀取層抽象：`DataSource` 介面，兩個實作 `StaticJsonSource` / `SupabaseSource`，用環境變數切換 | 1 天 | 1.3 |
| 2.5 | 編輯 UI：隊伍頁登入後可改成員欄位，寫回 `review_status = reviewed`、`review_notes` | 2 天 | 2.3、2.4 |
| 2.6 | 保活：GitHub Action 每 3 天經 REST API 打一次 `select 1`（Supabase Free 一週無活動會暫停；官方以 API 活動計算，排程查詢是否算數**待查證**，若不算就改成每日 snapshot 本身就會打到 API） | 0.2 天 | 2.1 |
| 2.7 | 每日排程把 DB 公開資料 dump 回 `data/snapshots/`（版本化備份，也讓靜態模式永遠可退回） | 0.5 天 | 2.2 |

**Go/No-go 進 Phase 3**：有第二位以上真實使用者表達要投稿；且 Phase 2 的編輯流程穩定跑過一個規則組週期（約 3 個月）。

### Phase 3 — 社群功能
| # | 任務 | 估時 |
|---|---|---|
| 3.1 | 使用者建隊/編輯（複用 2.5 UI）、`visibility` public/unlisted/private、8 碼 `share_code` | 2 天 |
| 3.2 | 匯入 Showdown 文字 / pokepaste 連結（`/{id}/json` 已於 2026-11-08 實測可用，見 01 第 3 節；仍要處理 32 點制 ↔ 252 制的對應） | 1 天 |
| 3.3 | 熱門排序（views/likes）、檢舉、簡單 rate limit（Postgres 函式） | 2 天 |
| 3.4 | 寶可夢頁加外部連結：Pikalytics 同 slug（`showdown_format` 欄位已對齊）、Limitless | 0.5 天 |
| 3.5 | 多來源使用率對照（我們資料 vs. Showdown usage stats），標明「ladder ≠ 賽事」 | 2 天 |

### 費用表（2026-11 查證）
| 方案 | 免費額度 | 付費起點 | 來源 |
|---|---|---|---|
| GitHub Pages | 站台 1 GB、每月頻寬 100 GB 軟上限、每小時 10 次 build 軟上限（自訂 Actions 不受限）；**條款禁止商業用途**（電商、SaaS），我們非商業但 Phase 3 若要放廣告要再確認 | — | <https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits> |
| **Supabase Free** | Postgres 500 MB、Auth 50K MAU、Storage 1 GB、egress 5 GB（另 5 GB cached egress）、Edge Functions 50 萬次；**閒置一週暫停**、最多 2 個 active 專案 | Pro US$25/月起 | <https://supabase.com/pricing> |
| Firebase Spark | Firestore 1 GiB、50K 讀 / 20K 寫 / 20K 刪 每日、Auth 50K MAU（無手機簡訊登入）、Hosting 10 GB 儲存 + **每日傳輸僅 360 MB** | Blaze 用量計費 | <https://firebase.google.com/pricing> |
| Cloudflare D1 + Workers Free | 5 GB、每日 500 萬 rows read / 10 萬 rows written、最多 10 個資料庫；無內建 Auth | Workers Paid 每月最低 US$5 | <https://developers.cloudflare.com/d1/platform/pricing/>、<https://developers.cloudflare.com/workers/platform/pricing/> |
| PocketBase | 軟體免費，需自備主機 | 約 US$2–6/月（估計，未逐一比價） | <https://pocketbase.io/> |
| 靜態 JSON in repo | 0 | 0 | — |

## 五、技術選型理由（Supabase > Firebase）
1. 資料是關聯式的，Notion relation ↔ 外鍵一比一；使用率、常見隊友用 SQL view 一句話。
2. Postgres 標準，之後搬到任何主機（Neon、自架）都不用改資料模型。
3. RLS 讓「公開可讀、本人可改」在資料庫層就成立，前端不用自己防。
4. 缺點：免費專案會暫停（已排保活）、500 MB 上限（我們的隊伍資料估計 < 50 MB，影片 metadata 不存字幕全文即可）。

## 六、風險與對策
| 風險 | 對策 |
|---|---|
| Supabase Free 閒置暫停 | 2.6 保活 + 2.7 每日 snapshot，暫停也能退回靜態模式 |
| 第一線 JSON 與 DB 欄位漂移 | JSON schema 為唯一契約，CI 用 ajv 驗證；DDL 由 schema 對照表維護 |
| 會員限定內容外流 | `is_members_only` 隊伍預設只顯示公開可得資訊；細節需登入 owner 才可見（待 D3） |
| 寶可夢圖片版權 | 用 PokeAPI sprites 或純文字；不自行轉載 zukan 官方圖（待 D4） |
| Phase 3 垃圾投稿 | 登入必須、rate limit、檢舉；初期白名單 |
| 一人團隊時間 | 每階段都能獨立上線；Phase 1 做完就有價值 |
| GitHub Pages 深連結 404 | 純靜態主機沒有伺服器端轉址；用 hash 路由最穩，或 `404.html` 轉址回 `index.html`（社群做法，官方文件沒有明寫支援，**待實測**） |
| 使用率灌水 | Fiske 的會員影片多是公開影片的延伸、同一支隊伍會出現兩次（`related_video_ids`）；統計前要先去重，否則「常見隊友 / 使用率」會重複計算（02 的 view 已加註） |
| Champions 32 點制 vs. 252 努力值制 | 兩個遊戲的 `evs.scale` 不同，寶可夢頁的「努力值分布」與 Showdown 匯出都要分開處理，不可混算 |
| 會員影片無法嵌入播放 | 隊伍頁的 YouTube embed 對會員限定影片只會顯示「需成為會員」，要改成顯示縮圖＋外連 |
| Notion 連接器尚未實際讀取 | 03 的欄位對照全是推測；D2 與 Phase 1.2 估時都要在讀到真實結構後重估 |

## 七、需要第一擁有者決定的事
- **D1** 後端：Supabase（建議）或 Firebase？
- **D2** Notion 定位：一次性搬家（之後在網站編輯）或長期雙向同步（成本高，不建議）？
- **D3** 會員限定隊伍的公開程度？
- **D4** 圖片來源：PokeAPI sprites / 不放圖 / 其他？
- **D5** Phase 3 是否納入藍圖、何時開放投稿？
- **D6** 網站語言：繁中優先即可，或一開始就做 i18n（victorpoke 有 zh-TW/en/ja）？
- **D7** Game Log 工具與隊伍站是否同一個 SPA（單頁應用；我建議同一個，共用 `@pkmn/dex` 與資料層）？
- **D8** schema 要不要加 `battle_format`（單打 / 雙打）？victorpoke 的隊伍有這個欄位；Champions 也有單打天梯，Fiske 以雙打為主，目前我們的 schema 沒有這欄。

## 附錄 A：查證紀錄（2026-11-08 紅隊複查後更新）
- 已查證（逐一打開來源頁核對）：GitHub Pages 限制、Supabase Free 額度與暫停規則、Supabase 區域代號、Firebase Spark 額度、Cloudflare D1 / Workers 價格、Notion 速率限制與 relation 25 筆上限、Supabase RLS 文件、victorpoke 程式碼包（`/assets/index-CpCFzDKQ.js`，1.12 MB，重新下載核對：Cloud Run `asia-east1`、`X-Api-Key`、Firebase 專案 `poke-champions`、四個 `/api/*` 端點、changelog v1.9.2）、pokepast.es `/{id}/json`（實測 + 原始碼）。
- 本文件原寫「Supabase 區域 asia-northeast1」是 GCP 命名，已改成 Supabase 實際使用的 AWS 代號。
- 未查證：PocketBase 主機價格；Showdown 的 Champions 格式如何表示 32 點制；Supabase 保活是否接受排程查詢；GitHub Pages `404.html` 轉址做法；victorpoke 實際畫面（仍無瀏覽器工具）。
