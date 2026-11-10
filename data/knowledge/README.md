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

## 名稱查表結果（speed-control.json）

分類表 33 筆 entries 的 name_zh／name_en 皆與 names_zh-Hant.json 一致，沒有查不到的名稱。需注意：使用者原文的「悠遊自如」在名稱表為「悠游自如」（以名稱表為準）；「順風」對應 Tailwind。
