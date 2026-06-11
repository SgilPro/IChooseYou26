# 資料源與 API（使用率 / 賽事 / meta）

> 軌道 B：原始資料與實證趨勢。每個源都查證過「是否有正式 API、URL 長怎樣、如何取用」。取捨原則：**優先有正式 API 或穩定靜態檔的源做自動管線；無 API 但呈現好的源當人類對照與交叉驗證。**

---

## 1. Limitless VGC — 有正式 API + Webhook（賽事資料首選）

- **網站**：<https://limitlessvgc.com/> ／ 線上賽事平台 <https://play.limitlesstcg.com/tournaments/?game=VGC> ／ standings <https://standings.limitlessvgc.com/>
- **開發者文件**：<https://docs.limitlesstcg.com/developer.html> ／ tournaments 端點 <https://docs.limitlesstcg.com/developer/tournaments>
- **Base URL**：`https://play.limitlesstcg.com/api`

**已查證的端點：**
| 端點 | 說明 | 重要參數 |
|---|---|---|
| `GET /tournaments` | 列出賽事 | `game`(=VGC)、`format`、`organizerId`、`limit`(預設50)、`page` |
| `GET /tournaments/{id}/standings` | 名次、戰績、（若有）decklist | — |
| `GET /tournaments/{id}/pairings` | 對戰配對與勝者 | — |

**回應範例（standings）**：含 `player`、`name`、`country`、`placing`、`record{wins,losses,ties}`、`decklist`、`deck{id,name}`。

**認證 / 限流**：除 `/games` 下的 `/decks` 端點外，**多數端點免 API key**；有 rate limit（看 response header）；需更高額度或 decks 端點可申請金鑰。

**Webhook（殺手級功能）**：可註冊一個 URL，賽事結束時被回呼 → 我的反思迴圈可以是**事件驅動**的，賽事一結束就自動拉新資料。文件：<https://docs.limitlesstcg.com/developer/webhooks>

**生態工具**：Python wrapper `limitless-python`（<https://github.com/jpbullalayao/limitless-python>）、MCP server（<https://mcp.so/server/limitlesstcg-mcp/jpbullalayao>）。

**我的用法**：當「賽事結果 / 真實隊伍 / counter 趨勢」的自動主管線，搭配 webhook 觸發每週反思。

---

## 2. Smogon / Pokémon Showdown Usage Stats — 無官方 API，但有穩定靜態檔 + 乾淨鏡像

### 2a. 原始權威來源（無 API，靜態檔）
- **目錄**：`https://www.smogon.com/stats/YYYY-MM/`（自 2014-11 起，按月；DLC 期有 `2020-06-DLC1/` 等，半月期有 `-H1/-H2/`）
- **檔名規則**：`gen9vgc2025regh-1760.txt`（含分級 cutoff：0 / 1500 / 1630 / 1760，部分用 1695 / 1825），及 `.txt.gz` 壓縮版；Bo3 變體如 `gen9vgc2025reghbo3-*.txt`。
- **子目錄**：
  - `chaos/` — **JSON，程式可解析**，含完整 moveset / item / spread / teammate 統計（最原始、最可控）。
  - `moveset/`、`leads/`、`metagame/` — 人類可讀報告。
- **chaos JSON 結構說明**：<https://github.com/pkmn/stats/blob/main/stats/OUTPUT.md>（move count 為加權計數，約 movecount/4 ≈ raw count）。

### 2b. 乾淨鏡像（建議自動管線用這個）
- **`@pkmn/smogon`**：<https://pkmn.github.io/smogon/>，是 Smogon 分析與 set/usage 的 rich client，資料來自 **`https://data.pkmn.cc`**——已處理成可高效批次存取的 JSON（analysis/sets/teams/stats），**分析與 set 每 24h 更新、stats 每月轉成優化格式**。在 Smogon 無官方 API 的情況下提供穩定介面。API 文件：<https://github.com/pkmn/smogon/blob/main/API.md>
- **stats 處理庫 `@pkmn/stats`**：<https://github.com/pkmn/stats>

**我的用法**：以 `data.pkmn.cc`（經 `@pkmn/smogon`）為 usage / set 的自動主力；需最原始粒度時直接抓 `smogon.com/stats/.../chaos/*.json` 自算。**Showdown 是 ladder 對戰，非官方賽事**——是「廣度與趨勢」指標，要與 Limitless 的「實戰賽果」交叉校驗，不可單獨採信。

---

## 3. Pikalytics — 無公開官方 API（當人類視角對照）

- **網站**：<https://www.pikalytics.com/>（當前格式範例頁 <https://www.pikalytics.com/pokedex/homebsd>、賽事 <https://www.pikalytics.com/tournaments>、Top Teams <https://www.pikalytics.com/topteams>、Team Builder <https://www.pikalytics.com/team>）
- **提供**：usage %、常見隊友（teammates）、招式、道具、性格、EV spread、tournament 彙整，且呈現極佳。
- **資料來源**：聚合自大量高水準 ranked 對戰（Showdown / PGL 等）＋ 賽事結果，隨新賽果刷新。
- **API**：**查證後未找到公開官方 API**，僅見第三方 scraping 範例（如以 BeautifulSoup 爬取的教學文章）。

**我的判斷**：對程式管線而言，我寧可用 Smogon chaos JSON 自算（可控性高），把 Pikalytics 當「已算好、視覺化好」的**人類快速對照與 sanity check**，不納入自動爬蟲（尊重其無 API 的現狀）。

---

## 4. VGCPastes — 真實上場隊伍語料（Google Sheets 公開表）

- **核心 Repository（Google Sheets）**：<https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/edit>
- **X**：<https://x.com/VGCPastes>
- **內容**：按 Regulation 分類的大量真實上場隊伍 Poképaste（單一 Regulation 可達 1000+ 隊），由賽事結果與貢獻者匯入。

**取用方式**：Google Sheets 可用 CSV 匯出（`.../export?format=csv&gid=<gid>`）或 Google Sheets API 程式讀取。

**我的用法**：archetype 與構築語料的最佳來源——把 Poképaste 解析成結構化隊伍資料，餵給「選人建議 / 構築模板」功能，並與 Limitless decklist 交叉比對。

---

## 5. 其他可用的彙整 / 工具
- **Victory Road**：<https://victoryroad.pro/>（team reports `/sv-reports/`、rental teams `/sv-rental-teams/`、replica teams）—人類精編，當交叉驗證。
- **Porydex**（趨勢圖表）：Smogon 論壇 thread；**Gatrstats**（2014 至今全格式 ladder 統計）；**PokeStats.gg**（<https://pokestats.gg/competitive>）——皆為第三方 usage 檢視器，當對照。
- **jake-white/VGC-Usage**：<https://github.com/jake-white/VGC-Usage>（美化的 Showdown VGC usage）。

---

## 資料管線取捨總表
| 用途 | 主力（自動） | 對照 / 備援 |
|---|---|---|
| 賽事結果 / 真實隊伍 | Limitless API（+webhook） | Victory Road、VGCPastes |
| usage / set / spread | data.pkmn.cc（@pkmn/smogon） | smogon.com/stats chaos JSON、Pikalytics |
| 構築語料 | VGCPastes sheet | Limitless decklist |
| 傷害計算 | `@smogon/calc` | — |

**鐵律**：Showdown ladder 趨勢 ≠ 官方賽事 meta，兩者必須交叉校驗後才寫入知識庫。
