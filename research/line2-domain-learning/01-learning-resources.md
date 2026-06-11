# 學習資源標註目錄（人類專家 / 教學 / 賽事）

> 軌道 A：人類先驗與因果框架。每個資源都標註：是什麼、涵蓋主題、如何吸收、如何抽 takeaway。URL 皆已查證。

---

## 1. WolfeyVGC（Wolfe Glick）— 最高優先的系統教學

- **YouTube 頻道**：<https://www.youtube.com/channel/UC9OZkS1Mhl5UvKSiPrYqsxg>（自稱「Greatest Pokémon player of all time」，史上最強之一，2016 世界冠軍、2025 多倫多拿下第 10 個 Regional 冠軍）
- **Patreon**：<https://www.patreon.com/WolfeyVGC>
  - 系統課程「Introduction to Competitive Pokemon Course」，8 講結構化（已查證的章節範例）：
    - Lecture 1 – Basics：<https://www.patreon.com/posts/everything-you-1-155354509>
    - Lecture 2 – Battling Basics：<https://www.patreon.com/posts/everything-you-2-155910302>
    - Lecture 6 – How to Improve at Pokemon：<https://www.patreon.com/posts/everything-you-6-158359526>
  - 付費層級：Gym Trainer（$5/月，獨家對戰／反應影片、賽前準備）、Gym Leader（$10/月，賽後個人反思、隊伍提早曝光）。

**涵蓋主題**：基礎規則、對戰基礎、meta 拆解、賽前準備、隊伍構築、如何精進、賽後反思。

**如何吸收（合規）**：
- **免費 YouTube 影片**：用 `youtube-transcript-api`（Python，免金鑰）或 `yt-dlp --write-auto-sub --sub-lang en <url>` 批次抓字幕，丟給我自己做結構化摘要。
- **Patreon 付費內容**：**我不繞付費牆**。由人類第一擁有者（若已訂閱）提供重點，我負責結構化。這是合規紅線。

**takeaway 抽取模板**（每支影片產一張卡）：
```
影片：<標題> | 日期：<date> | 對應 Regulation：<reg>
涉及 Pokémon：[...] / 涉及機制：[speed control / TR / redirection ...]
3-5 條可操作 takeaway：
  1. ...（附原話引用，標時間碼）
產品對齊：此 takeaway 可用於哪個功能（選人建議 / 速度線 / 構築）
```

---

## 2. 官方賽事 VOD（主播即時決策推理）— 別處沒有的稀缺養分

- **Play! Pokémon 官方頻道**：<https://www.youtube.com/@PlayPokemon>
- **Pokémon 官方頻道**：<https://www.youtube.com/@Pokemon>
- **官方轉播入口**：<https://www.pokemon.com/broadcast>
- **2025 Worlds 主播陣容**（已查證）：Rosemary Kelley、Scott Glaza、Aaron Zheng（Cybertron）、Ben Kyriakou、Charlie Merriman、Lee Provost、Sierra Dawn、Gabby Snyder。
- **Victory Road**（替代轉播 + 資源）：<https://victoryroad.pro/> ／ YouTube <https://www.youtube.com/c/VictoryRoadVGC>；casters 含 Matt Maynard、Andrew Tham、Cedric Bernier、Evan Latt。

**為什麼價值高**：主播在**選人（Team Preview）階段**就會講出「他帶這四隻是要對抗對面 Trick Room」這種讀心與賽局推理——這是 usage 表永遠給不了的「決策因果」。

**如何吸收**：抓字幕，但摘要模板不同（聚焦推理而非知識）：
```
賽事：<event> | 對局：<player A vs B> | Regulation：<reg>
主播在 turn X 的預測：... | 依據：... | 結果是否驗證：對/錯
可複用的 reasoning pattern：...
```
**優先序**：Worlds > International Championships > 大型 Regionals Top 8，且優先「當前 Regulation」。量太大，不全看。

---

## 3. VGC 內容創作者（YouTube）

- **CybertronVGC（Aaron Zheng）**：<https://www.youtube.com/@CybertronVGC>。VGC 內容創作先驅，2008 入坑、5 個 Regional + 2 個 National 冠軍、7 次 Worlds。教育與娛樂兼具，適合入門到進階。Liquipedia：<https://liquipedia.net/pokemon/Cybertron>
- **Victory Road（同上）**：除轉播外有大量 team report 與工具，見 `02`。

**如何抽 signal**：創作者影片良莠不齊且重娛樂，我只抓「構築解說 / meta 分析 / counter 思路」類，用與 WolfeyVGC 相同的卡片模板。

---

## 4. X / Twitter 頂尖選手與社群（趨勢與一手隊伍）

- **Victory Road VGC**：<https://x.com/vgcvictoryroad>（~72K followers，賽事資訊與 team report 連結）
- **Wolfe Glick**：<https://x.com/WolfeyGlick>
- **Aaron "Cybertron" Zheng**：<https://x.com/CybertronVGC>
- **Hiroshi Onishi（cona）**：<https://x.com/cona_5757>（2026 JCS 冠軍；日本頂尖玩家是 meta 領先指標）
- 其他可追蹤的高水準選手（依賽果動態調整）：Luca Ceribelli（2024 世界冠軍）、Paul Chua（6× Regional、2023 EUIC 冠軍）、Eric Rios（2022 EUIC 冠軍）。

**如何抽 signal**：X 是「趨勢領先指標」與「一手 Poképaste 來源」，但雜訊極高。策略：不即時刷，而是**透過 Victory Road / VGCPastes 的彙整**間接吸收（它們已過濾出有賽果背書的隊伍），只在 meta 切換期短期密集追蹤頂尖日本／歐美選手的發文。

---

## 5. 工具型資源（可直接變成產品引擎）

- **官方傷害計算器 `@smogon/calc`**：原始碼 <https://github.com/smogon/damage-calc>，線上 <https://calc.pokemonshowdown.com>，npm 套件 `@smogon/calc`（前身 `@pokemon-showdown/calc`）。內含各世代傷害公式與全部所需資料，可直接當「傷害／KO 機率」功能的後端引擎。
- **Pokémon Showdown 模擬器 `@pkmn/*`**：見 `02`，提供 dex 資料、機制模擬，可用於自動驗證「速度線 / 互動」邏輯。

---

## 吸收紀律總則
1. **合規**：只爬公開字幕；不繞付費牆。
2. **結構化才算數**：所有影片產出統一卡片，存進可檢索知識庫，且標 Regulation 以便過期淘汰。
3. **因果優先於現象**：軌道 A 的任務是抓「why」，現象（usage）交給軌道 B（見 `02`）。
