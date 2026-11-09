# Notion 隊伍資料庫搬家步驟（草案）

> 2026-11-08 · Ditto 起草；**2026-11-09 已實際讀取 Notion，結果見第七節（第二節的推測欄位以第七節為準）**。前提：Notion 連接器可讀第一擁有者的 workspace。goal 檔給了兩個連結：第 1 項的隊伍 DB（`app.notion.com/p/jake-the-dog/24a796b1ebe180f686d2d145ed70a25a`）與第 2 項的「Pokémon SV」頁（`.../Pok-mon-SV-4e051a70cc7f4664afa76eb2ea88e162`）；兩者關係（同一個 DB 的不同 view？還是頁面包著多個 DB？）**待讀取後確認**。我**尚未讀到實際內容**，以下欄位名稱是依 goal 檔描述推的，讀到後在第六節補正。

## 一、目標
把 Notion 的四個 DB（隊伍、寶可夢實體、圖鑑、規則組——goal 檔說規則組也是 relation 目標）一次性匯出成與第一線**同一份 schema** 的 JSON（`data/notion/teams.json`，`source_kind: "notion"`），再由同一條 build / seed 流程上線。這樣 Notion 搬家不是特例，只是另一個資料來源。

## 二、欄位對照（待確認）
| Notion 隊伍 DB | 型別（推測） | → team |
|---|---|---|
| Name | title | `name`，`name_source: manual` |
| Regulation Set | relation → 規則組 DB | `regulation_set_id`：用規則組頁的 code（M-C / I…）＋遊戲 對到 `data/ref/regulation_sets.json[].id`；對不到→暫存 `review_notes`，`review_status: conflict` |
| Tags | multi-select | `tags[]`：對 `tags.json` 的 `label_zh`/`aliases_zh`；對不到的新詞彙列成待審清單（不要自動新增 tag） |
| Video URL | url | `video_url`；若能解析出 YouTube id 且第一線已有該影片 → 填 `video_id` 並標 `related` |
| Author | text 或 relation | `author`，`author_source: manual` |
| Team Members | relation → 寶可夢實體 DB（≤6） | `members[]`，slot 依 relation 順序 |
| 內文 | blocks | `notes`（純文字）；長文另存 `note` |

| Notion 寶可夢實體 DB | → team_member |
|---|---|
| 圖鑑 relation | `species.dex_no` + `name_zh`，再用 `@pkmn/dex` 補 `name_en`；型態若在名稱裡（Mega X）→ `form` |
| 努力值（6 個 number 或 1 個文字 "252/0/4/…"） | `evs.{hp,atk,def,spa,spd,spe}`，`source: manual`，`confidence: 1`；**`evs.scale` 依規則組決定**：SV 隊伍填 `ev-252`，Champions 隊伍填 `champions-points-32`（第一擁有者的 Notion 以 SV 為主，但要逐隊看） |
| 性格 / 特性 / 道具 | select 或 text → `nature`/`ability`/`item` `{value, source: manual, confidence: 1}` |
| 技能 set | multi-select 或 4 個 text → `moves[]`（≤4） |

所有 Notion 來的欄位 `confidence` 設 1.0、`source` 設 `manual`，因為是人手記的；`review_status: manual`。

## 三、Relation 的處理
- Notion API 的 relation 屬性回傳**頁面 id 陣列**，取得頁面時一個屬性最多回 25 個 id、`has_more: true` 表示還有（<https://developers.notion.com/reference/page-property-values>，2026-11-08 核對），超過要用 property item 端點分頁（<https://developers.notion.com/reference/retrieve-a-page-property>）。成員 ≤6 不會超，但「圖鑑 ← 實體」反向 relation 可能超，我們不走反向。
- 兩段式：先把三個 DB 全部拉下來存成 `raw/notion/{teams,instances,dex}.json`（原樣），再離線 join。這樣 Notion 限速（平均每秒約 3 請求，超過回 429 + `Retry-After`，<https://developers.notion.com/reference/request-limits>，2026-11-08 核對）只付一次，之後重跑對照不必再打 API。
- 規則組與 tag **不從 Notion 建**，以 repo 的參照表為準；Notion 的值只是用來比對。

## 四、驗證
1. 數量對：Notion 隊伍數 = 匯出筆數；每隊成員數 = relation 數。
2. Schema 過：ajv 驗 `team.schema.json`，0 錯誤。
3. 對照率：規則組對到率、tag 對到率、物種對到 `@pkmn/dex` 率，各列出未對到清單給第一擁有者人工確認。
4. 抽樣 5 隊，人眼對 Notion 頁面與匯出 JSON。
5. 與第一線重疊：同一影片 id 在兩邊都有 → 列出差異（成員、道具），不自動合併，標 `conflict` 待人決定哪邊為準。

## 五、之後的 Notion 怎麼辦（對應決策 D2）
- **建議**：搬家後 Notion 唯讀封存；新資料直接在網站（Phase 2 編輯 UI）輸入。
- 若第一擁有者仍想用 Notion 當輸入介面：改成「單向、排程、冪等」匯入（每日跑一次同一腳本，以 `notion_page_id` upsert），不要做雙向同步。

## 六、待 Notion 讀取後補
- [ ] 三個 DB 的實際屬性名稱與型別（替換第二節推測）
- [ ] 努力值是 6 欄還是一串文字
- [ ] 規則組 DB 的實際欄位（是否有遊戲、限制類型、機制，與 `regulation_set.schema.json` 差多少）
- [ ] 隊伍總數、成員 relation 是否有順序意義（先發？）
- [ ] 是否有第一線沒有的欄位（例如戰績、對手、心得、單打/雙打）→ 決定進 `notes` 或加欄位（對應 D8）
- [ ] 兩個 goal 連結指向的是同一個 DB 還是不同結構
- [ ] 隊伍是 SV 還是 Champions 時代為主（決定 `evs.scale` 與規則組對照的工作量）

## 七、實際讀取結果（2026-11-09，workspace「Daniel」，唯讀）

**結構**：兩個 goal 連結是「頁面包著多個 DB」。`Pokémon SV` 頁（Others / Games 底下）內有 10 個 DB；另有 Champions 用的「就決定是你了」頁。

| DB | 筆數 | 備註 |
|---|---|---|
| 雙打隊伍（SV） | **24** | 主表。`collection://24a796b1-ebe1-8037-8226-000b3b9b83c7` |
| Pokemon Champion 雙打隊伍 | **4**（3 有連結） | 另一頁「就決定是你了」下，結構很簡單。`collection://34d796b1-ebe1-806a-9de2-000bf39ec039` |
| 寶可夢養成 | 未計 | 成員實體，被隊伍 relation。`collection://553bb91e-823a-474e-a143-df50b0b747f4` |
| 雙打隊伍作者 / 角色 / 類型、寶可夢屬性 / 圖鑑 / 六圍 | 未計 | 參照表 |

### 雙打隊伍（SV）欄位 → team

| Notion 欄位 | 型別 | → team |
|---|---|---|
| Name | title | `name`（`name_source: manual`） |
| Reg Type | select：無神 / 二級神 / 單神 / 雙神 / 幻神 / M-A | **不是 Reg A~J**，是「神獸限制類型」，要人工對 `regulation_sets.json`（Reg J 檢視篩選「幻神、雙神」，代表分類與 Reg 有對應但需確認） |
| Tags | multi_select（空間、順風、晴天、雨天、雪天、沙暴、重力、變小、強化、滅歌、特殊核心、吃吼霸、腹鼓釋陀果、控場、受隊） | `tags[]`，對 `tags.json`；多數是戰術名，和第一線 v1.2 tags 邊界可能重疊 |
| Fiske Video | url | `video_url`，解出 YouTube id 對第一線 `video_id` |
| Pokepastes | url | 可直接走 `import-pokepaste.mjs` |
| Author | relation → 作者 DB（單選） | `author` |
| Team Members | relation → 寶可夢養成（≤6） | `members[]` |
| Types / Roles / Coverage / Ready | relation / rollup / formula | **衍生值，不搬**（可由資料重算） |
| No. / Finished | number / checkbox | 個人管理欄位，不搬（或放 `private`） |

### 寶可夢養成（成員實體）欄位 → team_member

| Notion 欄位 | 型別 | → team_member |
|---|---|---|
| Pokemon | relation → 圖鑑（單選） | `species` |
| Nature | relation → 性格（單選） | `nature` |
| Ability | relation → 特性 | `ability` |
| Item | relation → 道具 | `item` |
| Move 1~4 | relation → 招式（各 4 欄） | `moves[]`（≤4，順序即槽位） |
| **EV** | **text（單一文字欄）** | `evs`，需解析文字；SV 用 `ev-252` |
| Crystal Type | relation → 屬性 | 太晶屬性 |
| Role | relation → 角色 | `role_note` |
| Purpose | multi_select：雙打對戰 / 團體戰 / 舊-團體戰 | **過濾條件：只搬含「雙打對戰」者** |
| Owned / EV ✅ / IV ✅ / Item ✅ / Moves ✅ / Crystal ✅ | checkbox | 個人養成進度，不搬 |

### Champions 雙打隊伍

欄位只有 Name、Lineup URL（Pokepaste 或 VictorPoke）、Lineup Image（檔案）、Person、賽季（relation → 「Pokemon Champions 賽季」，目前只有 M-A）。**沒有成員明細**，所以搬法是「連結 + 圖片」，不是結構化成員。

### 回答第六節的待辦

- [x] 三個 DB 實際屬性：見上表。
- [x] 努力值：**單一文字欄 `EV`**，格式待抽樣看（多為 `252/0/4/...` 或自由文字，需寫解析器並列出解析失敗者）。
- [ ] 規則組 DB：Notion 沒有獨立規則組 DB，只有 `Reg Type` select 與 Champions 賽季表（`Reg Set: M-A`）。需人工建對照表。
- [x] 隊伍總數：SV 24 + Champions 4 = 28。成員 relation 順序有無意義（先發？）**待抽樣**。
- [x] 第一線沒有的欄位：Notion 有個人管理欄位（Finished、No.、各 ✅）與衍生分析（Coverage）。建議不搬。
- [x] 兩個連結關係：頁面包 DB，見上。
- [x] 時代：SV 為主（24 隊），Champions 僅 4 筆。

### 對決策 D2 的影響

資料量只有 28 隊，且 SV 隊伍多數有 Pokepaste（約 14/24）和 Fiske 影片連結（約 18/24）。**一次性搬家明顯划算**：不需要排程匯入、也不需要雙向同步。建議 D2 = 一次性搬家 + Notion 封存。

### 與第一線重疊（2026-11-09 比對）

SV 雙打隊伍 24 筆中：

- **18 筆有 Fiske 影片連結，全部都在第一線主表 `videos.json`**；其中 16 筆已有 `teams/<id>.json`。沒有隊伍檔的 2 支是 `IpvzabezaMc`（北美洲國際賽講比賽，屬賽事解說而非隊伍介紹）和 `OMm6dj4gepk`（沙暴兄弟吃吼霸隊，可補抽）。
- **6 筆沒有影片連結**：勾魂眼沙奈朵隊、地面阿宙晴天隊、客房服務大嘴鷗、君主蛇唱反調、赫月平衡隊、古代晴天隊。這些是第一擁有者自己的隊伍，才是 Notion 獨有的資料。
- 另有兩隊（鐵壁撲擊林佳龍沙暴隊、龍頭地鼠鋼鎧鴉沙暴隊）填了同一個 Pokepaste，其中一筆應是填錯，搬家時要標記。

**結論**：SV 隊伍不需要「搬」，只要以 `video_id` 當 key 做對照，把 Notion 獨有的資料補進第一線的隊伍檔：Reg Type（神獸限制）、Tags、個人養成紀錄（若要保留）。真正要搬的只有 6 隊原創隊伍加 Champions 的 4 筆。
