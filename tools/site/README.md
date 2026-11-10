# tools/site

## build-battle-lookup.mjs

產出 `data/ref/battle-lookup.json`，供靜態網站的隊伍詳細頁查「物種屬性 / 招式屬性 / 道具 icon」（靜態頁沒有 @pkmn/dex）。

```
node tools/site/build-battle-lookup.mjs
```

- 輸入：`data/channels/fiskepokemon/teams.json`（掃出用到的 name_en / value_en）、`app/node_modules/@pkmn/dex`（Gen 9）、`assets/items/items.json`、`assets/types/colors.json`（type_ids 與其 id 一致）。
- 可重複執行；新增隊伍後重跑即可。key 已排序，檔案約 90KB。
- 結尾會印出各類統計與 missing / base-fallback 清單。
- 物種 `match`：`dex`（dex 查得到）、`base-fallback`（改用 base 型態屬性，附 `note`）、`missing`。
- 招式 `match`：`dex` / `missing`。
- 道具：Showdown 名轉 PokeAPI slug（小寫、空白轉連字號、去撇號句點），再用 `items.json` 與 icon 檔存在與否驗證；不存在標 `missing`（不猜）。

## 已知缺口（最近一次執行）

統計：species 312（dex 310、base-fallback 2）；moves 381（dex 381）；items 116（exact 115、missing 1）。

- **base-fallback 物種（Mega-Z 屬性待確認）**：Absol-Mega-Z（阿勃梭魯）→ 暫用 Absol；Lucario-Mega-Z（路卡利歐）→ 暫用 Lucario。@pkmn/dex 雖有這兩型態的資料（標 Future，Absol-Mega-Z 為 Dark/Ghost），但非 Champions 實測，故不採用，值只寫在 note。
- **missing 道具**：Lustrous Globe（大白寶玉）— `assets/items/items.json` 無對應 slug `lustrous-globe`（只有 griseous-core）。
- missing 物種 / 招式：無。
