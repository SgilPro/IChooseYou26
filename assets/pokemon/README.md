# 寶可夢圖庫（assets/pokemon）

網站用到的所有寶可夢（含型態）圖，以 PokeAPI 的 pokemon slug 命名，並以 `index.json` 對照 `teams.json` 的 `species.name_en`。

## 內容
- `art/<slug>.png`：官方插畫（official-artwork，475px）
- `home/<slug>.png`：HOME 3D 風格圖（原 512px，縮為 384px 以控制容量）
- `thumb/<slug>.png`：128px 縮圖（本機 ffmpeg 無 libwebp，故用 png；有 libwebp 時腳本會自動產 webp）
- `index.json`：`name_en -> { slug, pokemon_id, art, home, thumb, form_match, note? }`，路徑相對於 `assets/pokemon`
  - `form_match`：`exact`（型態完全對應）／`fallback-base`（退回其他圖，必有 note）／`missing`（無圖）

## 來源與授權
- 圖源：PokeAPI sprites repo（https://github.com/PokeAPI/sprites），透過 raw.githubusercontent.com 下載。
- 該 repo 無明確授權；圖像著作權屬 Nintendo / Creatures / GAME FREAK / The Pokémon Company。**網站公開前需加粉絲站聲明（非官方、非營利）。**
- PokeAPI 要求使用者本機快取，不要即時熱連結；本資料夾即為本機快取。API 回應快取於 `/tmp/pokemon-assets/api-cache/`。

## 範圍與統計
- 範圍：`data/channels/fiskepokemon/teams.json` 出現的所有 `name_en`。
- 共 312 種：exact 310、fallback-base 2、missing 0。
- 實際圖檔 309 組（Maushold / Maushold-Four 共用同一 slug）。
- Mega-Z（Absol-Mega-Z=10307、Lucario-Mega-Z=10310）PokeAPI 有收錄，為 exact。

## 已知缺口
- `Vivillon-Fancy`、`Vivillon-Marine`（彩粉蝶花紋）：PokeAPI 無花紋型態圖，退回原形（Meadow）`vivillon`，標為 fallback-base。
- 型態對照在 `tools/yt/fetch-pokemon-images.mjs` 以 @pkmn/dex 的 forme 對 PokeAPI `pokemon-species` varieties 驗證；特例（Necrozma、Ogerpon 面具、Squawkabilly 羽色）列在腳本 `OVERRIDE`。
- `Floette-Eternal-Mega` 對應 `floette-mega`（PokeAPI 的永恆之花 Mega）。
- `Indeedee`、`Basculegion`、`Landorus` 等無後綴名稱對應預設 variety（`indeedee-male`、`basculegion-male`、`landorus-incarnate`）。

## 重新產生
```
node tools/yt/fetch-pokemon-images.mjs              # 下載缺少的圖，已存在者跳過，重寫 index.json
node tools/yt/fetch-pokemon-images.mjs --map-only   # 只印出 name_en -> slug 對照，不下載
node tools/yt/fetch-pokemon-images.mjs --home-size 512   # 改 HOME 圖尺寸（預設 384；0 為不縮放）
```
請求間隔 >=120ms，User-Agent 為 `IChooseYou26-asset-fetch/1.0 (personal fan project)`。
