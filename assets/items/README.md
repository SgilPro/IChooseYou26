# 對戰可攜帶道具 icon（320 個）

- `items.json`：`id`（PokeAPI slug，如 `choice-scarf`）、`category`、`name_en`、`name_zh_hant`、`name_zh_hans`、`icon`。
- `icons/<id>.png`：PokeAPI 提供的 sprite（原樣下載，未加工）。

## 範圍（category）

| category | 數量 | 說明 |
|---|---|---|
| mega-stones | 92 | Mega 石（含 Champions 的 Mega Z 類，若 PokeAPI 已收錄） |
| held-items | 72 | 氣勢披帶、突擊背心、命玉、生命寶珠等 |
| species-specific | 22 | 特有道具（個性寶珠、白金寶珠…） |
| type-enhancement | 22 | 屬性強化道具（木炭、神秘水滴…） |
| plates / memories | 19 / 17 | 石板 / 記憶碟 |
| jewels | 18 | 寶石（第五世代機制，SV 不可用，僅供舊資料） |
| type-protection / in-a-pinch / picky-healing / berry-other | 18 / 9 / 5 / 13 | 樹果（抗性、瀕死、回復、狀態治療） |
| bad-held-items / choice | 6 / 3 | 毒火球、講究系等 |
| other-battle | 4 | 隊伍資料用到但分類外的：力量鏡、力量護踝、香羅果、大白金寶玉 |

刻意排除：Z 純晶（SV／Champions 無）、圍巾（華麗大賽用）、經驗分享、幸運蛋等非對戰道具。

## 涵蓋率

對照 `data/channels/fiskepokemon/teams.json` 用到的 106 種不同道具，補上 4 種後全數涵蓋。**新作新增的道具（例如 Champions 新 Mega 石）PokeAPI 可能還沒收錄**，隊伍資料新增時要重新比對。

## 來源與授權狀態

- 來源：PokeAPI（`https://pokeapi.co/api/v2/item/<id>` 取名稱，sprite 來自 https://github.com/PokeAPI/sprites ，2026-11-09 下載）。
- sprites repo **沒有明確授權**（GitHub 顯示 NOASSERTION）。PokeAPI 說明自己主要是教育用途，並註明寶可夢相關名稱與圖像是 Nintendo 的商標。圖像著作權屬 Nintendo / Creatures / GAME FREAK / The Pokémon Company。
- PokeAPI 要求：本機快取、勿頻繁請求。本資料夾即是快取，不要在網站執行期去打 PokeAPI。
- 網站公開前要加粉絲網站聲明，並再評估是否換成自製圖示。
