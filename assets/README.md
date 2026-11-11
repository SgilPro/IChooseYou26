# assets 總覽

圖片與顏色等靜態素材。**所有圖像素材的著作權與商標屬 Nintendo / Creatures / GAME FREAK / The Pokémon Company**；來源網站本身多半沒有明確授權，網站公開前要加「非官方粉絲網站」聲明，並再評估是否換成自製圖示。

| 資料夾 | 內容 | 來源 | 狀態 |
|---|---|---|---|
| `types/` | 18 屬性的色碼與 icon | 色碼：52poke 內嵌 CSS；icon：PokeAPI sprites | 已下載 |
| `items/` | 320 個對戰可攜帶道具 icon 與中英文名 | PokeAPI | 已下載 |
| （尚無）`pokemon/` | 寶可夢本體圖 | 見下方「寶可夢圖片」 | **尚未下載**，網頁目前即時向 PokeAPI 請求 |

各資料夾有自己的 `README.md`，寫明範圍、來源與授權細節。

## 寶可夢圖片（2026-11-10 調查紀錄）

### 我們目前（`docs-site/teams.html`）

- 網址：`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/<全國圖鑑編號>.png`（`teams.html` 約第 221、378 行），由瀏覽器即時載入，沒有存到本機。
- 尺寸：**96×96** 小像素圖，顯示為 48px。
- 限制：只用圖鑑編號對應，所以**只有基本型態**，Mega、地區型態、太晶都不會顯示正確外觀（例如阿勃梭魯 Mega Z 仍顯示一般阿勃梭魯）。
- 與 PokeAPI 的使用規範不一致：PokeAPI 要求本機快取，網站不要在執行期請求。

### 參考站 victorpoke-champions.com 的做法

以下是讀它的前端 JS（`/assets/index-*.js`）得到的結果，僅作調查，我們沒有使用它的素材。

1. **主要來源：日本官方「寶可夢圖鑑」站 `zukan.pokemon.co.jp`**
   - 程式內建 1,303 筆對照表，key 為「4 碼圖鑑編號_型態編號」（如 `0006_1`），值為官方圖 URL（`https://zukan.pokemon.co.jp/zukan-api/up/images/index/<hash>.png`）。
   - 實測一張為 **570×570** 透明背景 PNG。
   - Mega 另有一張表記錄各圖鑑編號的 Mega 數量與 X／Y／Z 對應，所以 Mega、地區型態都顯示正確圖。
   - 做法是直接 hotlink 官方站，沒有轉存。
2. **備援：PokeAPI sprites**（找不到對照時才用，同我們現況的小圖）。
3. 道具圖：PokeAPI `sprites/items`（與 `assets/items/` 同源）。

### 之後要放大時的選項（2026-11-10 已實測可用）

| 路徑（前綴 `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/`） | 尺寸 |
|---|---|
| `pokemon/<id>.png`（現況） | 96×96 |
| `pokemon/other/official-artwork/<id>.png` | 475×475 |
| `pokemon/other/home/<id>.png` | 512×512 |

- **Mega／地區型態要用「型態 id」**（PokeAPI 的 pokemon id，≥ 10000），不是圖鑑編號。例：噴火龍 Mega X = `10034`（`https://pokeapi.co/api/v2/pokemon/10034` 回傳 `charizard-mega-x`），`official-artwork/10034.png` 與 `home/10034.png` 都存在。
- 我們隊伍資料有 `species.form`（如 `Mega-Z`），可由此對 PokeAPI 查型態 id。
- **已知缺口**：Champions 新增的 Mega（如 Absolite Z 的阿勃梭魯 Mega Z）PokeAPI 可能尚未收錄，需逐一確認或另外補圖。
- 官方圖鑑站（上方第 1 點）的圖技術上可用，但屬官方素材，hotlink 或轉存都是灰色地帶，**不建議直接沿用 victorpoke 的對照表**。

### 待辦（先不做）

- [ ] 盤點 `teams.json` 用到的物種與型態，有多少能對到 PokeAPI 的大圖。
- [ ] 下載到 `assets/pokemon/`，網頁改讀本機；型態改用型態 id。
- [ ] 補不到的新 Mega 圖。
- [ ] 公開前加粉絲站聲明（見上方）。

## 遊戲圖示（`games/`，2026-11-10）

- `games/champions.png`（32×17）、`games/sv.png`（32×22）：使用者手動從 Liquipedia 下載（Liquipedia 對自動下載回 403，我們不繞過）。圖檔授權與遊戲標誌的權利屬各權利人，公開前要再確認。
- 2026-11-10 使用者決定：遊戲標籤**不用這兩張圖**（不好看），改用英文縮寫＋顏色；圖檔先留在 `games/` 備用。`teams.html` 的 `GAME_STYLE` 管遊戲符號：縮寫文字，每個字母取該版本主色，例如 USUM（究極日月：日橘、月藍）、ORAS（終極紅寶石／始源藍寶石：紅、藍）。之後抓到舊作隊伍，在 `GAME_STYLE` 補一筆即可（隊伍的 `game` 欄位也要有對應值）。
- 若找不到合適的 Champions 圖，備案是用免費授權的冠軍腰帶圖（需確認授權）。

## Logo（2026-11-11 起）

- 站台 logo 與 favicon 用大師球 `assets/master-ball-120.png`：取自 PokeAPI sprites 的 `sprites/items/master-ball.png`（30×30），以最近鄰 4 倍放大成 120×120 保留像素邊緣，頁面上以 `image-rendering: pixelated` 顯示。紫色與主色同一色相家族。
- 舊的 `cherish-ball*.png` 仍在 repo，但站台不再使用。
- 圖像版權屬任天堂／Creatures／GAME FREAK；公開前要加粉絲站聲明（見上方待辦）。
