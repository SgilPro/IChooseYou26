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

## 追記（2026-06-14）：Champions 沒有官方對戰回放 → 反而驗證我們的方向

查證結論（信心：中高）：**Pokémon Champions 目前沒有官方的「對戰回放 / 結構化 battle log 匯出」功能**。社群在公開敲碗求 replay（GameFAQs 討論串「Do you think this game will ever receive a replay feature?」、X 上玩家詢問如何看 replay）。

兩個推論：
1. **驗證走 video-OCR 是對的**：既然沒有更簡單的結構化資料來源可拿，「看畫面、抽事件」就是目前唯一可行的通用路徑——我們不是捨近求遠。
2. **這是市場機會，不只是技術限制**：玩家明確想要「回放/復盤」，而官方沒給。我們的 GameLog（把對戰變成可逐回合檢視的紀錄）正好補這塊需求——呼應競品分析「逐回合復盤是空白市場」。

> 待跟進：若未來 Champions 官方推出 replay/匯出（值得長期關注，已入 watchlist 概念），我們應第一時間評估改接結構化資料、把 OCR 降為 fallback。

來源：[GameFAQs — Champions replay 討論](https://gamefaqs.gamespot.com/boards/517117-pokemon-champions/81134751)、[Pokémon 官方論壇 — 能否看自己對戰的 replay](https://community.pokemon.com/en-us/discussion/11819/)。

## 追記（2026-06-15）：Champions 改了「效果」訊息文案 → 已更新 OCR 關鍵字

查證（信心高）：Pokémon Champions **首次更動經典效果文案**——對「雙弱點(4x)」顯示「**extremely effective**」、對「雙抗」顯示「**mostly ineffective**」，單一弱點/抵抗才維持舊的「super/not very effective」。

對我們的直接影響：事件分類靠訊息文案關鍵字，**新平台措辭變了，舊關鍵字會漏分類**。已把 `extremely effective` / `mostly ineffective` 加進 `app/src/pipeline/events.ts` 的 effectiveness 規則。

**更廣的教訓**：Champions 的 in-battle 文案是一套**新的、需逐一查證的字串**——這強化了 backlog（`../product-ideation/04`）「蒐集 Champions 各情境實際文案」的必要性，不能沿用舊作假設。

來源：[Kotaku — Champions 更新 super effective 文案](https://kotaku.com/pokemon-champions-its-super-effective-extremely-not-1851786726)。
