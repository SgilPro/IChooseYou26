# 競品工具逐一拆解（Tool Teardowns）

> 軌道 C：對第一位 owner 指定的現有 Pokémon 工具/網站做功能拆解，作為我們 Game Log 之後路線圖的依據。每個工具記錄：**做什麼、招牌功能、可辨識的資料源、UX 好壞**。所有專有名詞保留英文並附 URL。
>
> 拆解日期：2026-06（Regulation 與賽季資訊以當時為準）。本文件僅描述觀察到的事實與判斷，不臆測未見功能。

功能分類代碼（後續矩陣共用）：
- **META** = 使用率／meta 統計（usage stats）
- **BUILD** = 組隊（team building）
- **CALC** = 傷害計算（damage calc）
- **TYPE** = 屬性／防守／覆蓋分析（type / coverage tools）
- **TOUR** = 賽事資訊與賽果（tournament info & results）
- **DECK** = 隊伍報告／租隊／decklist（team reports / rental / pastes）
- **DEX** = 圖鑑／資料查詢（Pokédex / move / ability data）
- **REPLAY** = replay／對戰逐回合分析（replay / per-turn analysis）— **這是我們 Game Log 的主場**

---

## A. 繁體中文工具

### A1. 電龍計算機 — bokevon（傷害計算為主）
- **URL**：<http://bokevon.web.fc2.com/>
- **做什麼**：繁體中文社群長年使用的**傷害計算機**（damage calculator），被 PTT／巴哈討論串稱為「（少數）我知道是中文的傷害計算機」。
- **招牌功能**：完整傷害計算（雙打變項齊全）；附帶 **Pokédex（約 No.1–898 起，含朱紫）**、**招式圖鑑（move dex）**、**特性圖鑑（ability dex）**、**招式相容／可習得（move compatibility）**查詢；支援電腦與手機瀏覽。
- **資料源**：自建本地資料表（FC2 免費空間靜態頁），未見對外 API。
- **UX**：功能強但介面「略複雜、需要熟悉」（社群普遍評價）；老派 FC2 版面、視覺陳舊，但繁中玩家認可其正確性。
- **分類**：CALC（主）、DEX。
- **參考**：PTT 對戰資源串 <https://www.ptt.cc/bbs/PokeMon/M.1605020854.A.154.html>、vocus 介紹 <https://vocus.cc/article/643f8886fd89780001c04859>

### A2. Poké Champions（victorpoke）— 冠軍賽資料查詢 + 組隊
- **URL**：<https://victorpoke-champions.com/zh-TW>
- **做什麼**：自我定位「**寶可夢冠軍賽資料查詢與組隊工具**」（繁體中文）。對應新的 **Pokémon Champions** 對戰格式。
- **招牌功能**：資料查詢 + team building 工具（從標題與定位判斷）。
- **資料源**：未在首屏明確標示。
- **UX**：繁中介面、定位清楚；首屏資訊量少，需進站才看得到完整選單（本次只取得標題層內容，細節有限）。
- **分類**：BUILD、DEX、（可能）META/TOUR。
- **備註**：與 A3 同屬「Champions 格式」的繁中工具圈，命名相近但為不同產品。

### A3. Poké Champion 終極聯防模擬器（冷颯）— 防守/聯防模擬器
- **URL**：<https://fable165469.github.io/poke_champion_final.html>
- **做什麼**：繁中創作者「冷颯」（Twitch／YouTube）做的 **「終極聯防模擬器」**，針對 M-A Format（Champions）對戰。
- **招牌功能**：
  - **六隻隊伍管理** + **天氣選擇**（晴／雨／沙／雪）。
  - **全隊聯防分析（type/ability/weather 互動）**：找出全隊防守上的屬性破口。
  - **招式覆蓋建議**：分析全隊攻擊覆蓋、指出 coverage gap。
  - **選人建議（lineup）**：依對手陣容推薦最佳選出（單打選 3／雙打選 4）。
  - **速度計算機（1v1 speed calc）**：含性格、EV、特性、道具、能力等級、麻痺、Mega、天氣/場地。
- **資料源**：未標示外部源；應為前端內建資料的單頁工具（GitHub Pages 靜態頁）。
- **UX**：定位明確、功能集中於「防守/選出決策」這個利基；單頁工具、無帳號。是繁中圈少見直接做「**選出建議 + 聯防破口**」的工具。
- **分類**：TYPE（主）、BUILD、CALC（speed）。

---

## B. 英文 — 對戰情報（battle info）

### B1. Victory Road（victoryroadvgc.com → victoryroad.pro）
- **URL**：<https://victoryroadvgc.com/>（301 轉址至 <https://victoryroad.pro/>）
- **做什麼**：英文圈**最完整的 VGC 情報中樞**（人類精編）。
- **招牌功能**：
  - **賽事行事曆與賽果**：2026 賽季 calendar、Regionals/NAIC/JCS/Worlds 等大賽的隊伍與賽果。
  - **Rental Teams**：當前 Regulation 可直接租用的隊伍合集（ladder/草根賽用）。
  - **Team Reports & War Stories**：冠軍親寫的隊伍解析（如 2025 Senior World Champion 報告）。
  - **VR Pastes**：組隊用的隊伍 paste 資料庫。
  - **Resources**：Speed tiers（朱紫）、Pokédex、Tera 機制、持有道具、規則與 Regulation 文件。
  - **In-game events**：Tera Raid、量產出現、神秘禮物等取得競賽用個體的情報。
  - **Champion Chat** 等社群內容。
- **資料源**：人工精編＋社群投稿；賽果對接官方/大型賽事。是我們資料源筆記中列為「人類精編、交叉驗證」的源。
- **UX**：內容權威、編排專業；偏「閱讀型」內容站，互動工具較少（無內建 calc/builder）。
- **分類**：TOUR、DECK、DEX、TYPE（speed tiers）。

### B2. pokedata.ovh — 賽事 standings/邏輯工具（TCG 為主，含 VG）
- **URL**：<https://pokedata.ovh/>
- **做什麼**：跨 **TCG / VG（Video Game）/ GO** 的**賽事 standings 與賽務工具**站。
- **招牌功能**：
  - **Standings**：TCG Standings、**VG Standings**、GO Standings。
  - **2026 Championship Points** 追蹤、**Pokémon Local Events** 行事曆。
  - **Players' History / matchups' history**：選手對戰歷史查詢（競技分析）。
  - **Compare Decklists**：並排比較 decklist。
  - TCG 專屬：Paper Decklist、Cardmarket converter、PTCGL→RK9 Sanitizer、Hand simulator。
- **資料源**：對接賽事系統（RK9 等）；以 standings/賽務資料為核心，未提供 calc/builder。
- **UX**：賽務導向、資訊密度高；重心明顯在 TCG，VG 區塊相對精簡。
- **分類**：TOUR（主）、DECK、（選手）REPLAY-鄰近（matchup history 不是逐回合，而是賽果層級）。

---

## C. 英文 — 單一用途工具（single-purpose tools）

### C1. pkmn.help — 屬性/防守/覆蓋計算機
- **URL**：<https://www.pkmn.help/defense/solo/>（另有 `/defense/team/`、offense、coverage 模式）
- **做什麼**：純粹、做得極好的 **Pokémon Type Calculator**。
- **招牌功能**：
  - **Defense（solo / team）**：單隻或整隊的屬性弱抗分析，支援雙屬性、**Tera type**、**abilities**。
  - **Offense / Coverage**：攻擊屬性對全圖鑑的覆蓋查詢。
  - 附 **Pokédex**：HD Pokémon Home 美術、叫聲、shiny、base stats。
  - **多語系**（含中文等多國語言）、**離線/PWA**、行動裝置優化。
- **資料源**：內建 Pokémon 資料；**開源（MIT），GitHub `wavebeem/pkmn.help`，TypeScript + Vite + Netlify**。
- **UX**：極乾淨、聚焦、載入快、可離線；屬性工具類的標竿。缺點是僅止於屬性層級（無傷害數值、無 meta）。
- **分類**：TYPE（標竿）、DEX。
- **參考**：<https://github.com/wavebeem/pkmn.help>、更新日誌 <https://www.wavebeem.com/blog/2025/pkmn-help-updates/>

### C2. Marriland Team Builder — 隊伍覆蓋/弱抗分析
- **URL**：<https://marriland.com/tools/team-builder/en/>
- **做什麼**：以**屬性覆蓋與弱抗分析**為核心的 team builder（最多 6 隻）。
- **招牌功能**：
  - 跨世代（Gen 1–9、含 Scarlet/Violet、Legends: Z-A），可選 form/ability/held item，**Tera 或自訂屬性覆寫**。
  - **Defensive / Offensive Coverage** 兩種分析表（18 屬性弱抗一覽）。
  - **Advanced mode**：每隻填 4 招、對最多 6 隻敵方做招式覆蓋檢查。
  - 顯示可切分數（½、2×）或符號（◯△×）。
  - **存隊（本地暱稱）、分享碼、可內嵌完整配置的 URL**；10 種語言。
- **資料源**：內建資料；無 meta/賽果。
- **UX**：覆蓋分析直覺、分享機制完善、多語系友善；偏 builder/分析，無真實傷害數字也無 usage。
- **分類**：BUILD、TYPE、DEX。

---

## D. 英文 — 資料/meta 與其他

### D1. Pikalytics — usage/meta + 賽果 + builder（綜合龍頭之一）
- **URL**：<https://pikalytics.com/>（Pokedex、Team Builder、Top Teams、Damage Calculator、Speed Tiers）
- **做什麼**：競技 Pokémon **統計與組隊綜合平台**，呈現極佳。
- **招牌功能**：
  - **Usage % + Winrate**（出場率與實際勝率分離呈現）。
  - **Cores**：2/3/4 隻常見搭配核心 + 出現頻率。
  - **每隻的競技 set**：abilities、items、moves、**EV spread**、性格。
  - **Top Teams**：真實賽事前段隊伍（含選手、戰績如 15-1、完整配置）。
  - 內建 **Team Builder、Damage Calculator、Speed Tiers、Quizzes**。
- **資料源**：聚合「real tournaments + live usage data」與 **Pokémon Showdown ladder**；**無公開官方 API**（我們筆記中當人類對照）。
- **UX**：視覺化與資訊密度俱佳、行動端友善；是玩家查 meta 的預設首選之一。缺點：資料屬聚合黑箱、無法逐回合分析、API 不開放。
- **分類**：META（標竿）、BUILD、CALC、TOUR、DECK、TYPE（speed）。

### D2. Serebii Pokédex (Champions) — 格式專屬圖鑑
- **URL**：<https://www.serebii.net/pokedex-champions/>
- **做什麼**：針對新 **Pokémon Champions** 格式的**專屬 Pokédex**（共約 237 隻，Kanto–Paldea 跨世代）。
- **招牌功能**：每隻 base stats（含 beneficial/hindering/neutral nature 下的 max stats）、依 18 屬性分類瀏覽。
- **資料源**：Serebii 自家長年維護的資料庫。
- **UX**：資料權威、結構清楚；屬靜態參考資料（無互動計算、無 meta、無賽果）。可見內容未深入 movepool/ability/locations。
- **分類**：DEX。

### D3. LabMaus — VGC 賽事分析（usage from tournaments）
- **URL**：<https://labmaus.net/>（個別 Pokémon 如 `/pokemon/230`、賽事如 `/tournaments/2499`）
- **做什麼**：自稱「**#1 VGC tournament analysis resource**」。由 Tim Keding 開發，**從 Twitter bot 進化成完整網站**，提供官方與非官方賽事的隊伍與 Pokémon usage 統計。
- **招牌功能**：
  - **Tournaments**：逐賽事的隊伍/usage 分析頁。
  - **Pokémon usage 統計**（官方＋非官方賽事，可下鑽到個別 Pokémon 頁，含 base stats 等）。
  - 賽事層級的隊伍趨勢分析，協助 teambuilding。
- **資料源**：賽事資料（與 Limitless 生態相鄰，聚焦「賽事而非 ladder」）；有 **Patreon** 支持。
- **UX**：偏資料分析師取向，賽事下鑽強；門面/說明較硬核（非新手友善）。
- **分類**：TOUR、META、DECK、DEX。
- **參考**：Patreon <https://www.patreon.com/labmaus/about>

### D4. Pokémon Showdown Teambuilder — 標準組隊/匯入匯出
- **URL**：<https://play.pokemonshowdown.com/teambuilder>
- **做什麼**：模擬器內建的**標準 team builder**，是全社群 paste 格式的事實標準。
- **招牌功能**：
  - 設定 species / item / ability / 4 moves / nature / **EVs / IVs / Tera type / level / gender / shiny**。
  - **格式驗證**（format validation / clauses）。
  - **Import/Export 純文字 paste**（人類可讀）與 packed format；一鍵互轉，與全社群通用。
- **資料源**：Pokémon Showdown／Smogon 資料（`@pkmn` 生態的上游）。
- **UX**：功能完備、格式驗證可靠、paste 互通性是生態基石；介面工程取向、視覺樸素，無 meta/覆蓋視覺化。
- **分類**：BUILD（標竿，含驗證與 paste 互通）、DEX。
- **參考**：paste/packed 格式 <https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md>

---

## 橫向觀察
1. **REPLAY/逐回合分析幾乎空白**：12 個工具中沒有一個做「把對戰拆成逐回合事件、可回看評析」。pokedata.ovh 的 matchup history 只到賽果層級，不是回合層級。**這正是我們 Game Log 的獨佔利基。**
2. **資料源高度集中**：賽果＝Limitless 生態（LabMaus、Victory Road 相鄰）；usage/set＝Smogon/Showdown（Pikalytics、Showdown、`@pkmn`）；屬性/圖鑑＝各自內建。我們筆記中的 Limitless API、data.pkmn.cc、@smogon/calc 正好覆蓋這三條主幹。
3. **單一工具普遍只強一兩格**：pkmn.help（TYPE）、Marriland（BUILD+TYPE）、Showdown（BUILD）、Serebii（DEX）、bokevon（CALC）。只有 Pikalytics 是橫跨多格的綜合站，但它無逐回合分析、API 不開放。
4. **繁中圈缺口明顯**：繁中只有 calc（bokevon）與兩個 Champions 模擬器/查詢工具，沒有任何繁中的 **usage/meta + 賽果 + 逐回合 review** 綜合站。對我們是地緣優勢。
