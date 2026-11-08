# 參考網站拆解：victorpoke / Pikalytics / pokepast.es / Victory Road

> 2026-11-08 · Ditto。victorpoke 部分以 2026-11-08 下載的程式碼包 `/assets/index-CpCFzDKQ.js`（1.12 MB）為依據，同日紅隊複查重新下載核對過；**畫面未親眼看到**（無瀏覽器工具，HTML 只有 `<title>`、meta、Google Ads / Analytics 與一個 module script）。

## 1. victorpoke-champions.com（Poké Champions）
- URL：<https://victorpoke-champions.com/zh-TW/teams>
- **技術**：Vue 3 + Vite SPA；Firebase Auth（專案 `poke-champions`，Google 登入）；REST API 在 Google Cloud Run `asia-east1`（主機 `https://poke-api-….asia-east1.run.app`，與網站不同網域），請求帶 `X-Api-Key`（寫死在前端包內）+ `Authorization: Bearer <idToken>`。未帶 key 直接打該主機的 `/api/teams` 回 403（2026-11-08 實測；注意打網站同網域的 `/api/teams` 只會拿到 SPA 的 index.html，不是 API）。端點：`/api/teams`、`/api/roster`、`/api/meta`、`/api/user`。
- **資訊架構**（由 i18n 字串還原）：「隊伍探索」列表（排序：最新 / 熱門）、「查看隊伍」詳情、「我的隊伍」（登入後管理分享過的隊伍）、隊伍組建器、傷害計算、速度比較、選出推薦、賽事詳情頁、「Meta 趨勢」頁。
- **資料模型線索**：`teamTitle`、`visibility`、`shareCode`、`battleFormat`（單打 / 雙打——我們的 schema 沒有這欄，提為決策 D8）、每隻的道具/招式/特性/性格/Mega 形態；投稿隊伍除 Google 登入外另設 **PIN 碼**（i18n：「PIN 碼用於日後編輯或刪除隊伍」）；寶可夢頁有「隊伍使用率（Bring）約 {pct} 的隊伍有帶」與「常見隊友（前五名）」；統計說明寫「資料來自 Limitless 公開賽事聚合」。
- **值得借鏡**：(1) 規則組切換（M-A/M-B/M-C）貫穿全站，切錯會顯示舊資料是他們自己更新紀錄承認過的 bug（程式碼包內 changelog v1.9.2，2026-06-26：「修正…切換至 M-B 賽制後仍顯示舊賽制資料的問題」），我們要一開始就把 `regulation_set_id` 當所有查詢的第一個篩選。(2) 「常見隊友前五」是最便宜又最有感的統計。(3) 分享碼 + 公開/私人兩級可見度，簡單夠用。(4) 連出 Limitless / Pikalytics / Showdown，不重造輪子。
- **不借鏡**：(1) 使用者投稿為主，**沒有影片連結與來源溯源**——我們的隊伍每一支都有影片、字幕時間與信心分數，這是差異化。(2) 自建 Cloud Run + 前端寫死 API key，對我們是多餘的維運；Supabase anon key + RLS 達到同樣效果。(3) 圖片直接取用 zukan.pokemon.co.jp 官方圖，版權風險我們不要跟。
- 外部圖片來源：`zukan.pokemon.co.jp/zukan-api/up/images/index/*.png`、`pokeapi.co/api/v2/pokemon/{id}`。

## 2. Pikalytics
- URL：<https://www.pikalytics.com/pokedex/gen9championsvgc2026regmc>
- 每個格式一個 slug（與 Showdown 格式名同款，我們 `regulation_set.showdown_format` 已對齊；上述 M-C 頁 2026-11-08 確認存在，首頁列前 20 名使用率、勝率、常見 2/3/4 隻核心、近期上位隊伍連到 Limitless）。每隻寶可夢頁的區塊（使用率、特性 %、道具 %、招式 %、隊友 %、努力值分布、太晶 %）是依 SV 格式的印象寫的，Champions 頁沒有太晶、努力值是 32 點制，**待實際打開個別寶可夢頁確認**。無公開 API（官網未標示，**待查證**）。
- **借鏡**：寶可夢頁的區塊順序（使用率 → 招式 → 道具 → 特性 → 隊友 → EV 分布）是玩家的心智模型，直接沿用。**不借鏡**：使用率主要來自 Showdown ladder（頁面自己寫明，門檻用 Glicko 分數），另有賽事區塊取自 Limitless；兩者與影片頻道的隊伍又是第三種來源，我們標示來源，不混算。

## 3. pokepast.es
- URL：<https://pokepast.es/>
- Showdown 匯出純文字是社群事實標準。未文件化的 `/{id}/json` → `{author, notes, paste, title}` 與 `/{id}/raw` **已於 2026-11-08 實測**（`https://pokepast.es/1/json` 正常回傳，CORS `*`），並對照原始碼 `server.go`（<https://github.com/felixphew/pokepaste>，v3 分支）：id 為 16 碼十六進位，舊制純數字 id ≥ 1000 回 403，其他字尾 404。
- **借鏡**：我們的 `team_member` 必須能無損轉成 Showdown 文字（物種/道具/特性/努力值/性格/招式），這是與全世界工具互通的最低門檻。

## 4. Victory Road
- URL：<https://victoryroad.pro/champions-regulations/>
- 靜態頁：規則組時間線（M-A 4/8–6/17、M-B 6/17–9/9、M-C 9/9–12/2，2026-11-08 核對），每組的可用池與 Mega 名單**是圖片**，程式無法直接讀；賽事隊伍報告表在另外的 Team Reports / Replica Teams 頁，不在這頁。我們 `regulation_sets.json` 的 sources 已引用。
- **借鏡**：規則組頁要放「期間 + 可用池 + 機制」三件事；隊伍報告表的「隊伍六隻 sprite 一列」是最省空間的列表呈現，我們列表頁採用。

## 對我們的啟示（總結）
1. **規則組是全站的第一維度**，所有列表、統計都先切規則組。
2. 列表頁 = 六隻一列 + 標籤 + 作者 + 影片縮圖；詳情頁 = 六張卡片 + 影片 + 筆記 + Showdown 匯出。
3. 寶可夢頁沿用 Pikalytics 區塊順序，但資料是「我們資料集」且標明來源與樣本數。
4. 我們的獨家：**每支隊伍可溯源到影片時間點與信心分數**，別人沒有。
5. 外部功能（傷害計算、Limitless 戰績）一律連出，不自建。
