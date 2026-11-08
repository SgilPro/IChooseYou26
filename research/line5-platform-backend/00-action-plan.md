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
- 資料：第一線正在產出 `data/channels/fiskepokemon/videos.json`（約 679 支影片）與 `teams.json`；參照表 `data/ref/regulation_sets.json`、`tags.json`；schema 在 `data/schema/`。目前 `data/channels/fiskepokemon/` 只有 `raw/`，兩份主表**尚未落地**。
- Notion：隊伍 DB（名稱、規則組 relation、tags、影片網址、作者、成員 relation → 寶可夢實體 DB：努力值/性格/特性/道具/招式 → 圖鑑 relation）。我尚未讀到實際內容，欄位對照在 `03-notion-migration.md`。
- `server/`：本機 yt-dlp 小後端，自用，不部署。

## 四、分階段 Action Plan

### Phase 1 — 靜態資料站（不加後端）
**目標**：網站能瀏覽第一線 + Notion 的隊伍，全部在 build 時打包成靜態 JSON。
**前置**：第一線 `teams.json` 至少有 30 支 `review_status != auto` 以外也可，但要能跑。

| # | 任務 | 估時 | 依賴 |
|---|---|---|---|
| 1.1 | `scripts/build-data.ts`：讀 `data/**/*.json` → 驗證 schema（ajv）→ 輸出 `app/public/data/{teams,videos,regulation_sets,tags,species}.json` + 衍生統計 `usage.json`（每規則組每物種出現率、常見隊友前五、常見道具/招式） | 1 天 | teams.json 存在 |
| 1.2 | Notion 一次性匯出腳本 → 同 schema 的 `data/notion/teams.json`（`source_kind: notion`） | 1 天 | Notion 連接器可讀（見 03） |
| 1.3 | 前端路由：`/teams`（列表＋篩選：規則組 / 標籤 / 含某隻 / 作者；排序：最新）、`/teams/:id`（六隻卡片＋影片 embed＋標籤＋筆記）、`/pokemon/:species`（在我們資料集的使用率、常見隊友、常見配置）、`/regulations` | 2 天 | 1.1 |
| 1.4 | 匯出為 Showdown 文字（pokepast 格式），一鍵複製 | 0.5 天 | 1.3 |
| 1.5 | CI：deploy workflow 加 `paths: data/**`，資料更新即自動部署 | 0.5 天 | 1.1 |

**Go/No-go 進 Phase 2**：任一成立就 Go —(a) 第一擁有者一週內想在網頁改資料超過 ~10 次、(b) 需要登入才能看的東西（會員限定隊伍）、(c) 第一線資料量 > 數千隊讓單一 JSON 超過 ~5 MB 影響載入。

### Phase 2 — 接 Supabase（登入 + 線上編輯）
| # | 任務 | 估時 | 依賴 |
|---|---|---|---|
| 2.1 | 開 Supabase 專案（asia-northeast1 東京或 ap-southeast-1 新加坡；亞洲區選最近的），套 `02-schema.md` 的 DDL + RLS | 0.5 天 | 決策 D1 |
| 2.2 | `scripts/seed-supabase.ts`：從同一份 JSON **冪等 upsert**（以 `team.id`、`video.id` 為鍵），可重跑 | 1 天 | 2.1、1.1 |
| 2.3 | Google 登入（Supabase Auth）；`profiles` 表標記 `role: owner/editor/viewer` | 0.5 天 | 2.1 |
| 2.4 | 前端讀取層抽象：`DataSource` 介面，兩個實作 `StaticJsonSource` / `SupabaseSource`，用環境變數切換 | 1 天 | 1.3 |
| 2.5 | 編輯 UI：隊伍頁登入後可改成員欄位，寫回 `review_status = reviewed`、`review_notes` | 2 天 | 2.3、2.4 |
| 2.6 | 保活：GitHub Action 每 3 天 `select 1`（避免一週無活動暫停） | 0.2 天 | 2.1 |
| 2.7 | 每日排程把 DB 公開資料 dump 回 `data/snapshots/`（版本化備份，也讓靜態模式永遠可退回） | 0.5 天 | 2.2 |

**Go/No-go 進 Phase 3**：有第二位以上真實使用者表達要投稿；且 Phase 2 的編輯流程穩定跑過一個規則組週期（約 3 個月）。

### Phase 3 — 社群功能
| # | 任務 | 估時 |
|---|---|---|
| 3.1 | 使用者建隊/編輯（複用 2.5 UI）、`visibility` public/unlisted/private、8 碼 `share_code` | 2 天 |
| 3.2 | 匯入 Showdown 文字 / pokepast 連結（解析需實測 `/{id}/json`） | 1 天 |
| 3.3 | 熱門排序（views/likes）、檢舉、簡單 rate limit（Postgres 函式） | 2 天 |
| 3.4 | 寶可夢頁加外部連結：Pikalytics 同 slug（`showdown_format` 欄位已對齊）、Limitless | 0.5 天 |
| 3.5 | 多來源使用率對照（我們資料 vs. Showdown usage stats），標明「ladder ≠ 賽事」 | 2 天 |

### 費用表（2026-11 查證）
| 方案 | 免費額度 | 付費起點 | 來源 |
|---|---|---|---|
| GitHub Pages | 站台 1 GB、每月 100 GB 軟上限 | — | <https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits> |
| **Supabase Free** | Postgres 500 MB、Auth 50K MAU、Storage 1 GB、egress 5 GB、Edge Functions 50 萬次；**閒置一週暫停**、最多 2 個 active 專案 | Pro US$25/月 | <https://supabase.com/pricing> |
| Firebase Spark | Firestore 1 GiB、50K 讀 / 20K 寫 / 20K 刪 每日、Auth 50K MAU、Hosting 10 GB | Blaze 用量計費 | <https://firebase.google.com/pricing> |
| Cloudflare D1 + Workers Free | 5 GB、每日 500 萬 rows read / 10 萬 rows written；無內建 Auth | Workers Paid US$5/月 | <https://developers.cloudflare.com/d1/platform/pricing/> |
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

## 七、需要第一擁有者決定的事
- **D1** 後端：Supabase（建議）或 Firebase？
- **D2** Notion 定位：一次性搬家（之後在網站編輯）或長期雙向同步（成本高，不建議）？
- **D3** 會員限定隊伍的公開程度？
- **D4** 圖片來源：PokeAPI sprites / 不放圖 / 其他？
- **D5** Phase 3 是否納入藍圖、何時開放投稿？
- **D6** 網站語言：繁中優先即可，或一開始就做 i18n（victorpoke 有 zh-TW/en/ja）？
- **D7** Game Log 工具與隊伍站是否同一個 SPA（我建議同一個，共用 `@pkmn/dex` 與資料層）？

## 附錄 A：查證紀錄
- 已查證：三家免費額度（上表來源）；victorpoke 程式碼包內的 API 端點與介面文字（見 01）。
- 未查證：pokepast.es JSON 端點、PocketBase 主機價格；victorpoke 實際畫面（無瀏覽器工具）。
