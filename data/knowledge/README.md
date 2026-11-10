# data/knowledge — RAG 知識庫來源

這個資料夾放「給 RAG（檢索增強問答）使用」的知識文件。每份文件是獨立的 Markdown，章節（H2）要能單獨被檢索。

## 目錄約定

`data/knowledge/<領域>/<主題>.md`，例如 `doubles/speed-control.md`。

## Front matter 欄位

| 欄位 | 說明 |
|---|---|
| title | 文件標題 |
| topic | 主題代碼（kebab-case），例如 speed-control |
| game_scope | 適用遊戲範圍（Champions／朱紫），並註明驗證所依 Gen 9 資料 |
| sources | 用到的資料來源清單 |
| confidence | 整體可信度與原因 |
| updated | 更新日期（YYYY-MM-DD） |

## 來源標註規則

每個事實後面標註來源：

- `[dex]`：已用 @pkmn/dex（ROOT/app/node_modules）驗證（優先度、target、屬性、特性／道具效果說明）。
- `[domain]`：使用者（第一擁有者）的領域知識，未獨立驗證。
- `[待確認]`：無法驗證，或 Champions 與 Gen 9 可能不同。不可當成斷言引用。

寫作原則：繁體中文（台灣用語）；專有名詞第一次出現附簡短解釋；招式／特性／道具的中文名以 `data/ref/names_zh-Hant.json` 為準；中英文名都要寫。

## 新增文件

1. 在對應領域資料夾建立 `<主題>.md`，加上上述 front matter。
2. 每個分類或概念一個 H2，內容獨立可讀、事實逐項標來源。
3. 若文件需要程式可讀的對應表，放在 `data/ref/`（例如 `speed-control.json`）；網站用的分類器放 `tools/site/`。
4. 有統計章節時，註明統計日期、樣本數與統計方法。

## 目前文件

- `doubles/speed-control.md`：雙打控速手段。對應分類表 `data/ref/speed-control.json`、分類器 `tools/site/classify-speed-control.mjs`。

## 分類層級 tier（speed-control）

`data/ref/speed-control.json` 的 categories 與 entries 都有 `tier`：

- `core`：核心控速（順風、戲法空間、降速範圍技、麻痺、自身加速、道具、暫時性、威力 >= 70 的先制主力輸出）。
- `broad`：廣義，要看是不是這隊的核心戰術（特性式先制、擊掌奇襲等、誓約場地、蝶舞龍舞類、重踏吐絲棉孢子）。
- `cleanup`：收殘（威力 < 70 的先制攻擊），不計入控速，但分類器仍會回傳讓頁面另外顯示。

先制招式的篩選是可重現的：`node tools/site/build-speed-control-ref.mjs` 會從 @pkmn/dex 篩 priority > 0、category 非 Status、非 nonstandard 的招式，basePower >= 70 為 priority-main，其餘為 priority-cleanup；擊掌奇襲、迎頭一擊、佯攻、快手還擊固定歸 broad。70 的門檻是使用者的判斷（[domain]）。修改分類表請改該腳本再重跑，不要手改 JSON。

## 顯示層級 level（speed-control）

分類表另有 `level`（1/2/3）供網站顯示：Level 1 直接顯示（順風、戲法空間，以及被晉升的核心戰術）；Level 2 次要控速（折疊）；Level 3 輔助與收殘（折疊，不屬於控速討論）。預設對照集中在 `build-speed-control-ref.mjs` 的 `LEVEL_BY_CATEGORY`／`LEVEL_BY_ENTRY`，要調整請改那裡再重跑。

晉升（Level 2 → 1）只依 `analysis.speed_control_core`（`{slot, name_zh, reason}`，reason 須有依據）；缺席就不晉升也不降級，不可由標題推測。目前 Level 1 只有順風與戲法空間。

待使用者確認的預設：誓約場地、蝶舞龍舞類、先制主力（突襲、迅雷、神速）預設 Level 2；其他降速招式（重踏、吐絲、棉孢子）預設 Level 3。

## 名稱查表結果（speed-control.json）

分類表 51 筆 entries 的 name_zh／name_en 皆與 names_zh-Hant.json 一致，沒有查不到的名稱。需注意：使用者原文的「悠遊自如」在名稱表為「悠游自如」（以名稱表為準）；「順風」對應 Tailwind。
