# 參考網站拆解：victorpoke / Pikalytics / pokepast.es / Victory Road

> 2026-11-08 · Ditto。victorpoke 部分以 2026-11-08 下載的程式碼包 `/assets/index-CpCFzDKQ.js`（1.1 MB）為依據；**畫面未親眼看到**（無瀏覽器工具，HTML 只有 `<title>` 與 meta）。

## 1. victorpoke-champions.com（Poké Champions）
- URL：<https://victorpoke-champions.com/zh-TW/teams>
- **技術**：Vue 3 + Vite SPA；Firebase Auth（專案 `poke-champions`，Google 登入）；REST API 在 Google Cloud Run `asia-east1`，請求帶 `X-Api-Key`（寫死在前端包內）+ `Authorization: Bearer <idToken>`。未帶 key 直接打 `/api/teams` 回 403（我實測）。端點：`/api/teams`、`/api/roster`、`/api/meta`、`/api/user`。
- **資訊架構**（由 i18n 字串還原）：「隊伍探索」列表（排序：最新 / 熱門）、「查看隊伍」詳情、「我的隊伍」（登入後管理分享過的隊伍）、隊伍組建器、傷害計算、速度比較、選出推薦、賽事詳情頁、「Meta 趨勢」頁。
- **資料模型線索**：`teamTitle`、`visibility`、`shareCode`、每隻的道具/招式/特性/性格/Mega 形態；寶可夢頁有「隊伍使用率（Bring）約 {pct}」與「常見隊友（前五名）」；統計說明寫「資料來自 Limitless 公開賽事聚合」。
- **值得借鏡**：(1) 規則組切換（M-A/M-B/M-C）貫穿全站，切錯會顯示舊資料是他們自己 changelog 承認過的 bug，我們要一開始就把 `regulation_set_id` 當所有查詢的第一個篩選。(2) 「常見隊友前五」是最便宜又最有感的統計。(3) 分享碼 + 公開/私人兩級可見度，簡單夠用。(4) 連出 Limitless / Pikalytics / Showdown，不重造輪子。
- **不借鏡**：(1) 使用者投稿為主，**沒有影片連結與來源溯源**——我們的隊伍每一支都有影片、字幕時間與信心分數，這是差異化。(2) 自建 Cloud Run + 前端寫死 API key，對我們是多餘的維運；Supabase anon key + RLS 達到同樣效果。(3) 圖片直接取用 zukan.pokemon.co.jp 官方圖，版權風險我們不要跟。
- 外部圖片來源：`zukan.pokemon.co.jp/zukan-api/up/images/index/*.png`、`pokeapi.co/api/v2/pokemon/{id}`。

## 2. Pikalytics
- URL：<https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc>
- 每個格式一個 slug（與 Showdown 格式名同款，我們 `regulation_set.showdown_format` 已對齊）；每隻寶可夢頁：使用率、特性 %、道具 %、招式 %、隊友 %、努力值分布、太晶 %。無公開 API。
- **借鏡**：寶可夢頁的區塊順序（使用率 → 招式 → 道具 → 特性 → 隊友 → EV 分布）是玩家的心智模型，直接沿用。**不借鏡**：資料來源是 Showdown ladder，與賽事 meta 不同；我們標示來源，不混算。

## 3. pokepast.es
- URL：<https://pokepast.es/>
- Showdown 匯出純文字是社群事實標準；先前研究記錄有未文件化的 `/{id}/json` → `{author, notes, paste, title}` 與 `/raw`。**本次未實測**（找不到可測的 paste id），Phase 3 匯入功能動工前需驗證。
- **借鏡**：我們的 `team_member` 必須能無損轉成 Showdown 文字（物種/道具/特性/努力值/性格/招式），這是與全世界工具互通的最低門檻。

## 4. Victory Road
- URL：<https://victoryroad.pro/champions-regulations/>
- 靜態頁：規則組時間線、賽事隊伍報告表（依規則組分組）。我們 `regulation_sets.json` 的 sources 已引用。
- **借鏡**：規則組頁要放「期間 + 可用池 + 機制」三件事；隊伍報告表的「隊伍六隻 sprite 一列」是最省空間的列表呈現，我們列表頁採用。

## 對我們的啟示（總結）
1. **規則組是全站的第一維度**，所有列表、統計都先切規則組。
2. 列表頁 = 六隻一列 + 標籤 + 作者 + 影片縮圖；詳情頁 = 六張卡片 + 影片 + 筆記 + Showdown 匯出。
3. 寶可夢頁沿用 Pikalytics 區塊順序，但資料是「我們資料集」且標明來源與樣本數。
4. 我們的獨家：**每支隊伍可溯源到影片時間點與信心分數**，別人沒有。
5. 外部功能（傷害計算、Limitless 戰績）一律連出，不自建。
