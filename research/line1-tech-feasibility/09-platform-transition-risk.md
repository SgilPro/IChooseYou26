# 09 — 平台轉換對 Game Log 的影響（Pokémon Champions）

> 新增於 **2026-06-12**（daily routine 產品線推進）。起因：領域線盤點發現賽場正從《Scarlet/Violet》轉到專用對戰 App《Pokémon Champions》（見 `../line2-domain-learning/06-current-landscape.md`）。這直接影響我們 Game Log 的核心技術假設。

## 為什麼這對我們重要

我們整套 Game Log pipeline 的最關鍵假設是（見 `03-recognition-ocr.md`）：

> **畫面底部的訊息框文字是最濃、最可靠的訊號，用 OCR 讀它。**

這個假設、以及預設的 ROI 位置（對方 HP 右上、我方 HP 左下、GameLog 中下、特性中右）、HUD 版面，**全部是針對《Scarlet/Violet》的對戰畫面**。如果競技玩家正在搬到《Pokémon Champions》，那未來大量的對戰影像會是 Champions 的 UI——而我們**還沒驗證 Champions 的畫面長怎樣**。

## 目前查證到的（誠實）

- **已知**：Pokémon Champions 是專注對戰的新作，2026-04-08 上 Switch、2026 內上手機（[champions.pokemon.com](https://champions.pokemon.com/en-us/)）。Serebii 有預覽截圖頁（[serebii.net/pokemonchampions/pics.shtml](https://www.serebii.net/pokemonchampions/pics.shtml)）。
- **未能驗證**：我用文字抓取工具讀 Serebii 截圖頁只拿到縮圖清單，**無法從文字確認 Champions 的戰鬥 UI 是否有底部訊息框、HP 條位置、是否有戰鬥 log 面板**。所以「OCR 訊息框」假設在 Champions 上的成立與否，**目前未知**。

## 結論與待辦（不誇大）

- **MVP 不受影響**：MVP 仍以本地影片（多為現有 SV 對戰）驗證 pipeline，照原計畫走。
- **新增風險登錄**：Champions UI 與 SV 不同 → 未來需要：
  - [ ] **實際看 Champions 對戰畫面**（截圖 / 官方 / 賽事直播影格），確認有無底部訊息框與其位置。
  - [ ] 若 UI 不同，建立 **Champions 版 ROI 預設**（我們的多塊 ROI + crop 介面已能支援使用者自訂，所以調整成本低——這是 goal #2 多塊 ROI 設計的額外好處）。
  - [ ] 重新評估 OCR 訊息框假設在 Champions 是否仍是最濃訊號。
- **資料來源連帶**：Limitless / Smogon / Pikalytics 對 Champions 新格式的 usage / 賽果覆蓋需重驗（見 `../line2-domain-learning/02-data-sources-and-apis.md`）。

> **信心**：高（平台轉換屬實、已查證）；對 Champions UI 細節為**未知**，標記待打樣。我們多塊可自訂 ROI 的設計讓我們對 UI 變動有韌性——這也驗證了當初不寫死單塊 ROI 的判斷是對的。
