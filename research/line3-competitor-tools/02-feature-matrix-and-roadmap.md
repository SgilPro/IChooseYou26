# 功能矩陣、缺口與路線圖（Feature Matrix, Gaps & Roadmap）

> 軌道 C 第二部分：把拆解結果整理成功能矩陣，找出缺口與機會，並提出 Game Log 之後的分階段路線圖。對照資料源筆記：`research/line2-domain-learning/02-data-sources-and-apis.md`。

---

## 1. 功能矩陣（哪個工具覆蓋哪類功能）

分類：META=使用率/meta｜BUILD=組隊｜CALC=傷害計算｜TYPE=屬性/覆蓋｜TOUR=賽事資訊/賽果｜DECK=隊伍報告/租隊/paste｜DEX=圖鑑/資料｜REPLAY=逐回合/replay 分析

| 工具 | META | BUILD | CALC | TYPE | TOUR | DECK | DEX | REPLAY |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| bokevon（電龍計算機）| | | ● | | | | ● | |
| victorpoke Poké Champions | △ | ● | | | △ | | ● | |
| 冷颯 終極聯防模擬器 | | ● | △(speed) | ● | | | | |
| Victory Road | | | | △(speed) | ● | ● | ● | |
| pokedata.ovh | | | | | ● | ● | | △(賽果層) |
| pkmn.help | | △(plan) | | ●標竿 | | | ● | |
| Marriland Team Builder | | ● | | ● | | △(paste) | ● | |
| Pikalytics | ●標竿 | ● | ● | △(speed) | ● | ● | ● | |
| Serebii (Champions) | | | | | | | ● | |
| LabMaus | ● | | | | ● | ● | ● | |
| Showdown Teambuilder | | ●標竿 | | | | △(paste) | ● | |

● = 核心功能　△ = 部分/附帶　空白 = 無

**一眼結論**：
- **REPLAY（逐回合 review）整欄幾乎全空**——沒有任何一個工具把它當核心。我們 Game Log 直接落在這個空白裡。
- META 的標竿是 Pikalytics + LabMaus；BUILD 的標竿是 Showdown + Marriland；TYPE 的標竿是 pkmn.help；CALC 公認標竿（生態層）是 `@smogon/calc`（被多數 calc 站採用）。
- 沒有工具同時做到「**逐回合 review × usage/meta × 組隊/選出建議**」的閉環。

---

## 2. 缺口與機會（Gaps & Opportunities）

### 明顯缺口
1. **逐回合對戰 review（REPLAY）幾乎無人做**。現有「分析」都停在賽果或聚合 usage 層級，沒有「這場第 N 回合發生什麼、為什麼這步好/壞」的顆粒度。**這是我們 Game Log 的天然護城河。**
2. **「review → 可行動建議」的閉環沒人串起來**。看完一場對戰後，沒有工具能接著說「對手這隻常配這組 set（usage）、面對它你該怎麼選出、傷害大概多少」。各工具各做一格，玩家要手動在 5 個分頁間來回。
3. **繁體中文綜合站缺席**。繁中只有 calc 與模擬器；usage/meta + 賽果 + review 的繁中綜合站不存在。
4. **個人化/歷史沉澱薄弱**。除了 pokedata 的選手 matchup history，幾乎沒有工具幫「個別玩家」累積自己的對戰、找出反覆犯的錯。

### 與 Game Log 天然相配的機會（按「黏合度」排序）
- **A. 從 Game Log 自動抽 meta 訊號**：我們已經把對戰拆成事件，順手就能統計「我/對手用了哪些 Pokémon、招式、道具」，自然延伸到 usage 對照（接 data.pkmn.cc / Limitless）。
- **B. 在事件軸上疊傷害數字**：逐回合既然知道誰打誰、用什麼招，接 `@smogon/calc` 就能把「這招對那隻會造成多少傷害／是否一拳」直接標在回合上——把靜態 calc 變成**情境化 calc**，這是現有 calc 站做不到的。
- **C. review 後的選出/構築建議**：知道對手陣容後，用 usage（常見 set/teammates）＋屬性聯防（type）給出「下次面對這隊該怎麼選出」。
- **D. 對手 scouting 檔案**：把同一對手的多場 Game Log 聚成檔案（類似 pokedata 的 matchup history，但顆粒度到回合）。

---

## 3. Game Log 之後的路線圖（給非技術讀者）

原則：**先把 Game Log 已經抓到的資料「越用越值錢」，再往外擴**。每一階段都盡量重用我們已盤點好的資料源，少造新輪子。

可重用的既有資料源（出自 `02-data-sources-and-apis.md`）：
- **Limitless VGC API（+ webhook）**：賽事結果、真實隊伍、counter 趨勢。
- **Smogon usage via `data.pkmn.cc`（`@pkmn/smogon`）**：使用率、常見 set、EV spread。
- **`@smogon/calc`**：傷害計算引擎（業界標準，社群驗證過）。

---

### 第 1 階段（緊接 Game Log）— 「讓 review 自己會說話」
**主題：在我們已經有的逐回合事件上，疊出別人沒有的洞察。**

1. **回合內情境傷害（Inline Damage on the Timeline）**
   - 是什麼：在 Game Log 的每個攻擊事件旁，自動算出「這招對那隻造成的傷害區間／是否一拳帶走／需不需要疊狀態」。
   - 為何排第一：技術上最便宜（事件已含攻方/守方/招式），重用 `@smogon/calc`；體驗上把「靜態傷害計算機」升級成「比賽情境下的傷害」，直接打中沒人做的 REPLAY×CALC 交集。
   - 對標：Pikalytics/bokevon 的 calc 是脫離比賽的；我們是貼著比賽的。

2. **對手用招/用物自動摘要（Per-battle Auto Summary）**
   - 是什麼：每場 review 自動生出「本場雙方出場 Pokémon、用過的招式/道具/特性、關鍵回合」的摘要卡。
   - 為何：純靠我們已抽出的事件就能做，零外部依賴，立刻提升單場 review 的價值。

### 第 2 階段 — 「把單場接上整個 meta」
**主題：用外部資料讓 review 不只是回顧，而是有對照基準。**

3. **Usage 對照（Meta Overlay）**
   - 是什麼：對手某隻 Pokémon 旁顯示「目前 meta 中它最常見的 set／EV spread／常見隊友」，標出對手這次是不是走非主流配置。
   - 重用：`data.pkmn.cc`（`@pkmn/smogon`）抓 usage/set。
   - 對標：把 Pikalytics 的「set/cores」資料，貼進我們的 review 情境裡（Pikalytics 自己不做 review，API 也不開放，所以我們走 Smogon/`@pkmn` 這條開放管線）。

4. **選出/聯防建議（Lineup & Coverage Advisor）**
   - 是什麼：review 完一場後，根據對手陣容＋ meta 常見配置，建議「下次面對這隊，你的隊伍該選哪幾隻、有哪些屬性破口」。
   - 重用：屬性弱抗邏輯（對標 pkmn.help / Marriland / 冷颯模擬器）＋ usage 資料。
   - 對標：繁中圈只有冷颯模擬器做選出建議，但它脫離真實對戰；我們是「看完你的真實對戰後」給建議。

### 第 3 階段 — 「個人化沉澱與賽事連結」
**主題：從單場走向長期、從個人走向賽事生態。**

5. **對手 Scouting 檔案（Opponent Profiles）**
   - 是什麼：把同一對手的多場 Game Log 聚成檔案：他常帶什麼、慣用選出、招式偏好。
   - 對標：pokedata 的 matchup history 只到賽果；我們到回合級。

6. **個人弱點報告（My Mistakes Report）**
   - 是什麼：跨自己的多場對戰，找出反覆出現的失誤模式（例如某情境總是選錯出、低估某招傷害）。
   - 重用：第 1 階段的 inline damage + 事件資料即可推導；幾乎不需新資料源。

7. **賽事/趨勢連結（Tournament & Trend Hook）**
   - 是什麼：把當前 meta 趨勢、近期大賽結果與你的對戰連起來（「你輸的那隊正是本週 Regional 奪冠 archetype」）。
   - 重用：**Limitless API + webhook**（賽事一結束自動拉新賽果），可選 LabMaus/Victory Road 當人類對照。
   - 對標：Victory Road/LabMaus 提供賽果，但不和「你個人的對戰」連動。

---

## 4. 優先序與理由（一句話版）
| 階段 | 功能 | 為何這個順序 | 重用資料源 |
|---|---|---|---|
| 1 | 回合內情境傷害 | 最便宜、最獨佔（REPLAY×CALC 無人做） | `@smogon/calc` |
| 1 | 單場自動摘要 | 零外部依賴、立即加值 | 自有事件 |
| 2 | Usage 對照 | 讓 review 有 meta 基準 | `data.pkmn.cc` |
| 2 | 選出/聯防建議 | review 變成「下一步行動」 | usage + 屬性邏輯 |
| 3 | 對手 scouting 檔案 | 單場→長期，建立黏著 | 自有事件聚合 |
| 3 | 個人弱點報告 | 把 review 變成「會進步」 | 自有事件 |
| 3 | 賽事/趨勢連結 | 接上整個 VGC 生態 | Limitless API + webhook |

**鐵律延續**：Showdown ladder usage ≠ 官方賽事 meta；做 Usage 對照與趨勢連結時，Smogon/`@pkmn` 的 ladder 數字要與 Limitless 賽果交叉標註，不可單獨呈現為「唯一真相」。
