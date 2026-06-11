# 執行摘要：我（Ditto）成為 VGC 雙打領域專家的學習方法論

> 本文是給「人類第一擁有者」與未來的我自己看的白話總覽。詳細內容見同目錄 `01`～`05` 與思考過程 `self-dialogue.md`。

## 一、我要解決的問題

我不是要變成能上場打 Bo3 的選手，而是要成為「**能持續跟上版本、且能把領域知識轉成產品功能的 VGC 大腦**」，與人類共同擁有這個雙打對戰工具產品。

衡量「我真的懂了」的標準只有一個：**我能不能解釋 why，並能不能預測對手的選擇。** 「讀過很多文章」不算懂。

## 二、核心方法論（三句話）

1. **雙軌吸收，貝氏互校**
   - 軌道 A（人類先驗 / 因果框架）：WolfeyVGC 教學、官方賽事 VOD 主播分析、Victory Road team report。給我「思考模型」。
   - 軌道 B（原始資料 / 實證趨勢）：Limitless VGC API、Smogon usage（透過 data.pkmn.cc）、VGCPastes。用來驗證或修正 A，並抓 A 還沒覆蓋的新趨勢。
2. **一切為產品服務**：所有吸收都要結構化成可檢索的「知識卡片」，對齊到具體產品功能（速度線、傷害計算、選人建議），並建立英／日／繁中跨語言 ID 對照表。
3. **永不靜止**：用 cron 驅動「每週攝取 → 每週反思 → 每月 meta 體檢 → 每賽季大盤點」的迴圈，以「對戰預測準確率」為 KPI 防止自滿，並定期優化學習方法本身。

## 三、最高價值資源／資料源（精選）

| 類別 | 首選 | 為什麼 | 如何取用 |
|---|---|---|---|
| 系統教學 | WolfeyVGC（YouTube 免費影片 + Patreon 8 講課程） | 頂尖選手講「因果」，CP 值最高 | 抓公開 YouTube 字幕做摘要；Patreon 付費內容由人類擁有者提供，我不繞付費牆 |
| 即時決策推理 | 官方賽事 VOD（@PlayPokemon / @Pokemon、Victory Road） | 主播在選人階段講出讀心與賽局推理，usage 表給不了 | 抓字幕，聚焦「主播的預測與依據」 |
| 賽事資料（自動） | **Limitless VGC API** | **有正式 API + webhook**，可事件驅動自動更新 | `https://play.limitlesstcg.com/api`（多數端點免金鑰） |
| 使用率 / meta | **Smogon usage（經 data.pkmn.cc / @pkmn/smogon）** | 乾淨 JSON、每 24h 更新；原始 chaos JSON 可自算 | `data.pkmn.cc` 為主，`smogon.com/stats/YYYY-MM/` 為權威備援 |
| 真實隊伍語料 | VGCPastes（Google Sheets 公開表） | 大量真實上場 Poképaste，archetype 最佳語料 | Google Sheets CSV/API 讀取 |
| 影像辨識訓練 | PokeAPI/sprites（含 Pokémon HOME PNG） | 完整、結構化、社群授權乾淨 | GitHub 整包下載 / CDN |
| 繁中在地化 | 神奇寶貝百科（wiki.52poke.com） | 繁中正式譯名權威，建跨語言對照表必備 | 網頁 / 條目對照 |
| 傷害計算 | `@smogon/calc`（npm） | 官方傷害公式實作，可直接當產品引擎 | `npm i @smogon/calc` |

## 四、建議的學習路徑（時間順序）

1. **第一週：打地基**。讀完 `04-vgc-curriculum.md` 的基礎與核心機制章節，搭配 WolfeyVGC「Lecture 1-2」級別的入門影片字幕。把 `@smogon/calc` 跑起來，親手算幾個傷害驗證理解。
2. **第二週：建資料管線**。接上 Limitless API、data.pkmn.cc、VGCPastes sheet，把當前 Regulation 的 usage / top teams 拉進知識庫。建英／日／繁中 ID 對照表。
3. **第三週：學賽局**。看當前 Regulation 的官方 Worlds / IC / 大型 Regional Top 8 VOD，抽「主播決策推理」卡片，對齊到「選人建議」功能。
4. **第四週起：進入反思迴圈**（見 `05`）。每週攝取＋反思，每月 meta 體檢，每賽季大盤點。用預測準確率持續驗收。

## 五、我給自己的紀律（Caution）

- **合規優先**：只爬公開字幕與公開資料；不繞 Patreon 付費牆；影像辨識訓練優先用 sprite/官方 artwork，不直接爬比賽影格。
- **不腦補**：所有資源是否有 API、URL 長怎樣，都已用 WebSearch/WebFetch 查證（見各篇引用）。
- **防過期**：當前 meta 知識一律標注「會過期」，由反思迴圈負責更新；切 Regulation 時封存舊知識。
