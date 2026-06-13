# 當前 VGC 賽場全景掃描（current landscape）

> 軌道 B 的「活文件」：給團隊保持對賽場現況的同步。本文聚焦**現在這個賽季在打什麼、用哪個平台、誰在贏、去哪看**。
>
> **資料時效：2026-06-12**（我的知識有 cutoff，本文所有「現況」皆以 WebSearch/WebFetch 查證並附 URL；信心標記見各段）。

---

## 0. 重大轉折（一定要先知道）— 平台正在從 Scarlet/Violet 換到 Pokémon Champions

2026 賽季正值**世代級的平台轉換**。這不是換 Regulation 而已，是換**遊戲本體**：

- VGC 長期跑在 **Pokémon Scarlet/Violet（SV）** 上；2026 起轉到一款**專用對戰 App「Pokémon Champions」**（Switch / iOS / Android），於 **2026-04-08 上線**。
- 轉換不是一刀切，是**分段切換**：SV 的線下賽事用到 2026 年 4–5 月，Pokémon Champions 平台首個正式賽事為 **Global Challenge I（2026-05-01～05-04，線上）**，首個線下 Championship Series 賽事為 **Indianapolis Regionals（2026-05-29～31）**。
- **2027-09-01 起，Pokémon Champions 才會成為 Championship Point 賽事的強制平台**——意味 2026 整季是過渡期，兩個平台/多個 Regulation 並存。
- 來源：[Pokemon.com — Play! Pokémon Competitions Transition to Pokémon Champions](https://www.pokemon.com/us/pokemon-news/play-pokemon-competitions-transition-to-pokemon-champions-on-april-and-may-2026)、[Pokemon.com — Pokémon Champions Is Coming to Worlds](https://www.pokemon.com/us/pokemon-news/pokemon-champions-is-coming-to-worlds)

> **信心：高**（官方 pokemon.com 公告直接佐證）。
> **對本專案的影響（重要）**：我們先前在 02 號文件建立的資料管線（Limitless / Smogon SV usage / VGCPastes）都是 **SV 世代**的。Pokémon Champions 上線後，**usage 來源、HOME 轉移規則、可用寶可夢池、甚至 Showdown 是否支援新格式都會變動**，管線需要重新驗證。這是接下來最該追蹤的風險點。

---

## 1. 現行遊戲與 Regulation

到 **2026-06-12** 為止，賽場同時存在「SV 尾聲」與「Champions 開局」兩條線：

### 1a. Pokémon Champions — **Regulation Set M-A**（當前主線格式）
- **期間**：2026-04-08 ～ 2026-06-17（in-game Ranked 與 VGC 賽事，5 月起進入線下/線上正式賽）。
- **核心變化**：**Mega Evolution 回歸 VGC**（自 2019 年以來首次）；**每場對戰只能 Mega 進化一次**；M-A 共開放 **59 種 Mega**。
- **禁限**：**禁用所有 Legendary / Restricted 寶可夢**（因為這些在 Champions 開局時根本還沒實裝）——所以 M-A 是**無傳說的限制格式**，與 SV 末期的「雙限制傳說」風格完全相反。
- **缺席的 Mega（meta 重點）**：開局**沒有** Mega Salamence、Mega Metagross、Mega Mawile 等過去強勢者。
- **隊伍清單**：TPCi 賽事採 **open team list**（公開隊表：species/ability/item/moves/Tera Type）。
- 來源：[Victory Road — Champions Regulations](https://victoryroad.pro/champions-regulations/)、[Bulbagarden — Reg M-A runs until June 17 2026](https://bulbagarden.net/threads/pokemon-champions-launches-new-ruleset-for-competitive-vgc-regulation-set-m-a-runs-until-june-17th-2026.310333/)、[Bulbapedia — Regulation Set M-A](https://bulbapedia.bulbagarden.net/wiki/Regulation_Set_M-A)

> **信心：高**（多源一致）。**注意**：M-A 在 6/17 結束，**之後的 Champions Regulation 尚未在來源中完整公布**——這是需要持續追蹤的空白。具體可 Mega 名單以官方 tweet 為準，須另查。

### 1b. Pokémon Scarlet/Violet — **Regulation Set I**（SV 末代格式，並行中）
- **期間**：2026-04-01 起回歸，**預期是 SV 的最終 VGC 格式**，無公告結束日（將隨平台轉換自然退場）。
- **禁限**：**每隊最多 2 隻 Restricted**（雙限制傳說格式），開放 Mewtwo、創造三神（Dialga/Palkia/Giratina）、Kyogre、Groudon、Rayquaza、Reshiram/Zekrom/Kyurem、Solgaleo/Lunala/Necrozma、Zacian/Zamazenta、Eternatus、Calyrex、Koraidon、Miraidon、Terapagos 及各別型態。
- 來源：[Bulbagarden — Regulation Set I returns as SV's final ruleset from 1 April 2026](https://bulbagarden.net/threads/regulation-set-i-returns-as-pokemon-scarlet-and-violets-final-vgc-ruleset-from-1-april-2026.310074/)、[Pikalytics — gen9vgc2026regi](https://www.pikalytics.com/pokedex/gen9vgc2026regi)
- **同賽季稍早的 SV 格式（供回看舊賽果）**：Reg H（2025 秋至 LAIC）、Reg F（2025-12-01 回歸，至 2026-03-31，EUIC London 用此）。來源：[Pokemon.com — Reg F returns Dec 1 2025](https://www.pokemon.com/us/pokemon-news/regulation-set-f-returns-as-the-pokemon-vgc-format-starting-december-1-2025)、[Victory Road — SV Rules & Regulations](https://victoryroad.pro/sv-rules-regulations/)

> **信心：高**。**2026 賽季制度變更**：採 **open team list**，且 **VGC Regulation 不再與遊戲內 ranked ladder 對齊**（過去兩者綁定，現在脫鉤）。

---

## 2. 賽事循環（Play! Pokémon Championship Series 2026）

結構：Regionals → International Championships（4 大洲）→ World Championships。透過 Championship Points（CP）累積取得 Worlds 邀請。

### 2026 World Championships（賽季終點）
- **日期**：**2026-08-28 ～ 08-30**
- **地點**：**San Francisco, CA, USA — Moscone Center**
- **平台**：**Pokémon Champions**（首次以新平台辦 Worlds）；獎金池 約 **$160,000 USD**。
- 來源：[Bulbapedia — 2026 Pokémon World Championships](https://bulbapedia.bulbagarden.net/wiki/2026_Pok%C3%A9mon_World_Championships)、[worlds.pokemon.com](https://worlds.pokemon.com/en-us)、[Liquipedia — Worlds 2026 VGC](https://liquipedia.net/pokemon/Pokemon_Championships/Worlds/2026/VGC)

> **信心：高**（Bulbapedia + 官方 worlds 站一致）。

### International Championships（2026 賽季四大 IC）
| IC | 日期 | 地點 | 平台 / Regulation |
|---|---|---|---|
| LAIC | 2025-11-21～23 | São Paulo | SV, Reg H（已結束） |
| EUIC | 2026-02-13～15 | London | SV, Reg F（已結束） |
| **NAIC** | **2026-06-12～14** | **New Orleans** | **Pokémon Champions, M-A** ← 即將/進行中 |
| OCIC | （查 Victory Road calendar 確認） | — | — |

> **NAIC 正好落在本文資料時效當天附近（6/12 起）**——這是**眼前最大的賽事**，且是 Pokémon Champions M-A 的首場 International。
> 來源：[Victory Road — 2026 Season Calendar](https://victoryroad.pro/2026-season-calendar/)

### 近期 / 即將的 Regionals（節選，North America + Europe）
- SV Reg H：Pittsburgh、Milwaukee、Las Vegas（2025 秋）
- SV Reg F：Toronto（2026-01-17～18）、Seattle、Houston
- SV Reg I：Orlando（2026-04-04～05）、Los Angeles（2026-05-09～10）
- **Champions M-A**：**Indianapolis（2026-05-29～31，首場線下 Champions 賽）**、Turin（2026-06-06～07，歐洲首場 Champions）
- 來源：[Victory Road — 2026 Season Calendar](https://victoryroad.pro/2026-season-calendar/)、[RK9 — Upcoming Tournaments](https://rk9.gg/tournaments)

### 賽果發布處（官方/權威）
- **RK9.gg**（TPCi 官方賽務/報名/即時 standings 與 pairings）：<https://rk9.gg/tournaments>
- **Pikalytics tournaments**（賽後 Top-cut 隊表 + usage 彙整）：例 [2026 Indianapolis Top 16](https://www.pikalytics.com/tournaments/rk9/2026-indianapolis-regional-top-16)
- **pokedata.ovh**（VGC standings 鏡像）：<https://www.pokedata.ovh/standingsVGC/>
- **Liquipedia**（賽事 wiki 化整理）、**Bulbagarden 論壇**（每場 Regional/IC 的 results & top teams thread）

> **信心：高**（RK9 為官方賽務平台，是賽果的第一手）。

---

## 3. 近期強勢選手

### Worlds 2025（SV 世代）冠軍
- **Masters 冠軍：Giovanni Cischke**（生涯首冠，決賽於 Koraidon 鏡像戰勝 James Evans）。
- Senior：**Kevin Han**（史上首位在兩個年齡組各拿一次 Worlds 的選手）；Junior：**Luke Whittier**。
- 來源：[Bulbagarden — 2025 Worlds Results](https://bulbagarden.net/threads/2025-pokemon-vgc-world-championships-results-and-top-teams-giovanni-cischke-takes-masters-in-their-first-tournament-win.307962/)、[Liquipedia — Worlds 2025 VGC](https://liquipedia.net/pokemon/Pokemon_Championships/Worlds/2025/VGC)

### 2026 賽季近期冠軍 / 知名選手（附查得的 X handle）
- **Wolfe Glick**（`@WolfeyGlick`）— 2016 World Champion；贏 **2025 Toronto Regional**，達生涯**第 10 座 Regional**（紀錄）。也是頂級內容創作者（見 §4）。
- **Aaron "Cybertron" Zheng**（`@CybertronVGC`）— Worlds 半決賽、2× National、5× Regional 冠軍；頂級主播/創作者。
- **Paul Chua** — 6× Regional 冠軍、2023 EUIC 冠軍，贏 **2026 EUIC（London）**。
- **Dylan Salvanera** — 贏 **2026 Las Vegas Regional**。
- **Cary D'Ortona** — 贏 **2026 Toronto Regional**。
- **Arsal Puri** — 贏 **2026 Indianapolis Regional**（首場線下 Champions M-A）。
- 來源：[Bulbagarden — Las Vegas 2026](https://bulbagarden.net/threads/vgc-2026-las-vegas-regionals-top-teams-and-results.309027/)、[Toronto 2026](https://bulbagarden.net/threads/vgc-2026-pokemon-toronto-regionals-top-teams-and-results.309586/)、[EUIC 2026](https://bulbagarden.net/threads/vgc-2026-europe-international-championships-top-teams-and-results.309794/)、[Indianapolis 2026](https://bulbagarden.net/threads/vgc-2026-indianapolis-regionals-results-and-teams.310706/)、[Wikipedia — Wolfe Glick](https://en.wikipedia.org/wiki/Wolfe_Glick)

> **信心：中–高**。冠軍名字多源一致；**X handle 須在發布前點開帳號二次確認**（handle 會改、會撞名）。`@WolfeyGlick`、`@CybertronVGC` 信心高（直接見於其推文）。

---

## 4. 優質內容創作者（doubles VGC）

| 創作者 | 頻道 / 連結 | 擅長 |
|---|---|---|
| **WolfeyVGC**（Wolfe Glick） | <https://www.youtube.com/c/WolfeyVGC>（[channel id](https://www.youtube.com/channel/UC9OZkS1Mhl5UvKSiPrYqsxg)）／X `@WolfeyGlick` | 教學、賽事 vlog、原創策略（常實際影響 meta）；新手到進階皆宜 |
| **CybertronVGC**（Aaron Zheng） | <https://www.youtube.com/@CybertronVGC>（約 23 萬訂閱）／X `@CybertronVGC` | 隊伍分析、傷害計算、賽前 prep、賽事主播；偏教學與系統化 |
| **JamesWBaek** | YouTube/Twitch（搜尋頻道確認 URL）／X 須確認 | 直播為主，高水準實戰過程 |
| **官方 Pokémon 賽事直播** | <https://worlds.pokemon.com/en-us> / Twitch `pokemon` | 賽事官方轉播（Worlds/IC/Regionals） |

- 教學總綱：Cybertron 等人合製的 **VGC Guide**（`@VGCguide`）是系統化入門資源。
- 來源：[Jaxon.gg — Best Pokémon Streamers 2026](https://www.jaxon.gg/best-pokemon-streamers/)、[Pokemon Authority — Top Creators](https://pokemonauthority.com/pokemon-content-creators-us)、[Wikipedia — Wolfe Glick](https://en.wikipedia.org/wiki/Wolfe_Glick)

> **信心：中**。WolfeyVGC / CybertronVGC 為公認頂級、URL 已查證；其餘創作者「最佳」屬主觀榜單，URL 在訂閱前請點開確認。

---

## 5. 隊伍報告與 decklist 哪裡看

| 來源 | URL | 看什麼 / 怎麼讀 |
|---|---|---|
| **RK9.gg** | <https://rk9.gg/tournaments> | **官方**賽務：報名、即時 standings、pairings；open team list 時代可看到公開隊表。第一手賽果。 |
| **Limitless VGC** | <https://limitlessvgc.com/> ／ standings <https://standings.limitlessvgc.com/> | 賽事資料庫，**有正式 API**（見 02 號文件）；自動化主力。 |
| **Pikalytics** | <https://www.pikalytics.com/tournaments> | 賽後 Top-cut 隊表 + usage 彙整，視覺化好；快速看「冠軍/前 16 帶了什麼」。 |
| **Victory Road** | <https://victoryroad.pro/>（reports、rental teams、season calendar、regulations） | 人類精編：賽季行事曆、規則、選手隊伍報告（team reports），交叉驗證的權威。 |
| **VGCPastes** | [Google Sheet](https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/edit) ／ X `@VGCPastes` | 按 Regulation 分類的真實上場 Poképaste 語料（單一 Reg 可達 1000+）。 |
| **Trainer Hill** | <https://www.trainerhill.com/> | usage / 趨勢 / 隊伍工具（須確認其對 Champions 新格式的支援度）。 |
| **Bulbagarden 論壇** | 每場賽事一個「Results and Top Teams」thread | 人工整理 Top-cut 名單與隊伍。 |
| **選手 X threads** | 見 §6 | 冠軍常自發「team report」長推（含 Poképaste、EV 思路、選人邏輯）。 |

**怎麼讀 team report**：先看 archetype（核心 + 限制傳說/Mega）→ 看 item/Tera/ability 組合 → 看 EV spread 的 benchmark（針對哪些對手的傷害/速度線）→ 看選人（lead vs back）對不同 matchup 的計畫。

> **信心：高**（RK9/Limitless/Pikalytics/VR/VGCPastes 皆既有且查證過）。**待驗證**：Limitless / Smogon / Pikalytics 對 **Pokémon Champions** 新格式的資料覆蓋是否到位（平台剛換）。

---

## 6. X / Twitter 作為訊號源

| 帳號 / 社群 | 承載的訊號 | 怎麼用 |
|---|---|---|
| `@VGCVictoryRoad`（Victory Road） | 賽果、行事曆、規則更新 | 權威彙整，當官方之外的主錨點 |
| `@VGCPastes` | 真實隊伍 Poképaste | 構築語料來源 |
| `@WolfeyGlick` / `@CybertronVGC` | tech、meta call、賽事即時感 | 頂級選手視角；注意是「觀點」非「資料」 |
| 各 Regional/IC 冠軍個人帳號 | 冠軍 **team reveal / report**（賽後 1–3 天常見） | 第一手構築與思路，但**單點、要交叉驗證** |
| 官方 `@PlayPokemon` / 賽事官方帳 | 規則/平台/賽程**官方公告** | 規則變更以此為準 |

**負責任的監控方式**：
1. **官方公告（pokemon.com / @PlayPokemon）優先於任何二手**；規則/平台/日期一律回查官方。
2. X 上的 tech 與 meta call 是**領先指標但噪音大**——當「假設」而非「事實」，必須用 RK9/Limitless 的**實際賽果**校驗後才寫入知識庫（延續 02 號文件鐵律：ladder/X 趨勢 ≠ 官方賽事 meta）。
3. 用 list / 關鍵字而非無限滑動；對「爆紅 tech」保持懷疑，等 2–3 場賽果重現再採信。
4. 留意 handle 會變更/撞名——引用前點開帳號確認本人。

> **信心：中**。帳號清單為慣例已知；具體 handle 在自動化引用前需逐一點開確認。

---

## 一句話現況

> **2026-06-12**：賽場正從 **Pokémon Scarlet/Violet（Reg I，雙限制傳說）** 過渡到專用 App **Pokémon Champions（Reg M-A，無傳說、Mega 回歸、每場限 1 次 Mega）**。眼前最大賽事是 **NAIC New Orleans（6/12–14，Champions M-A）**，賽季終點是 **Worlds：San Francisco，8/28–30（Champions）**。賽果看 **RK9.gg / Limitless / Pikalytics**，行事曆與規則看 **Victory Road + 官方 pokemon.com**。

---

## 每日核對紀錄（daily checks）

- **2026-06-12（daily routine）**：查證 watchlist A 區塊最高優先問題「M-A 之後接哪個格式」。
  - **結論（信心高）**：Bulbapedia「Regulation Sets in Pokémon Champions」確認 **M-A 是目前唯一公布的 Regulation Set**（active 2026-04-08 02:00 UTC ～ 2026-06-17 01:59 UTC，共 69 天），**M-A 之後（6/17 起）的格式尚未公布**。M-A 首場線下賽為 2026 Indianapolis Regional（5/30–31）。
  - **待跟進**：6/17 前後官方應公布接續格式，屆時更新本檔與 watchlist。
  - 來源：[Bulbapedia — Regulation Sets in Pokémon Champions](https://bulbapedia.bulbagarden.net/wiki/Regulation_Sets_in_Pok%C3%A9mon_Champions)、[Victory Road — Champions Regulations](https://victoryroad.pro/champions-regulations/)、[Bulbagarden 公告串](https://bulbagarden.net/threads/pokemon-champions-launches-new-ruleset-for-competitive-vgc-regulation-set-m-a-runs-until-june-17th-2026.310333/)。

- **2026-06-13（daily routine）**：追蹤 watchlist B 區塊——NAIC New Orleans 賽果。
  - **結論（信心高，但賽果未定）**：NAIC **進行中**（查詢當下 Masters 約 Round 3 / 13），Day 1 尚未結束，完整名次與 Top-cut 隊伍**尚未出爐**。這是 **Pokémon Champions 首次用於 International**。賽果待 6/13–14 賽程推進。
  - **下次該做**：賽事結束（~6/14）後回來抓 Top-cut 隊伍與 M-A meta 觀察（哪些 Mega / 核心組合表現好），寫入 curriculum。
  - 賽果來源（已確認可用）：[RK9 NAIC 2026](https://rk9.gg/event/pokemon-naic-2026/sides)、[Victory Road 2026 NAIC](https://victoryroad.pro/2026-naic/)、[pokedata standings 0000190 (Masters)](https://www.pokedata.ovh/standingsVGC/0000190/masters/)、[Liquipedia NAIC 2026 VGC](https://liquipedia.net/pokemon/Pokemon_Championships/International/North_America/2026/VGC)。
