# Notion 隊伍資料庫搬家步驟（草案）

> 2026-11-08 · Ditto。前提：Notion 連接器可讀第一擁有者的 workspace（`app.notion.com/p/jake-the-dog/...`）。我**尚未讀到實際內容**，以下欄位名稱是依 goal 檔描述推的，讀到後在第六節補正。

## 一、目標
把 Notion 的三個 DB（隊伍、寶可夢實體、圖鑑）一次性匯出成與第一線**同一份 schema** 的 JSON（`data/notion/teams.json`，`source_kind: "notion"`），再由同一條 build / seed 流程上線。這樣 Notion 搬家不是特例，只是另一個資料來源。

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
| 努力值（6 個 number 或 1 個文字 "252/0/4/…"） | `evs.{hp,atk,def,spa,spd,spe}`，`source: manual`，`confidence: 1` |
| 性格 / 特性 / 道具 | select 或 text → `nature`/`ability`/`item` `{value, source: manual, confidence: 1}` |
| 技能 set | multi-select 或 4 個 text → `moves[]`（≤4） |

所有 Notion 來的欄位 `confidence` 設 1.0、`source` 設 `manual`，因為是人手記的；`review_status: manual`。

## 三、Relation 的處理
- Notion API 的 relation 屬性回傳**頁面 id 陣列**，一個屬性最多 25 個 id，超過要用 property item 端點分頁（<https://developers.notion.com/reference/retrieve-a-page-property>）。成員 ≤6 不會超，但「圖鑑 ← 實體」反向 relation 可能超，我們不走反向。
- 兩段式：先把三個 DB 全部拉下來存成 `raw/notion/{teams,instances,dex}.json`（原樣），再離線 join。這樣 Notion 限速（每秒 3 請求，<https://developers.notion.com/reference/request-limits>）只付一次，之後重跑對照不必再打 API。
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
- [ ] 是否有第一線沒有的欄位（例如戰績、對手、心得）→ 決定進 `notes` 或加欄位
