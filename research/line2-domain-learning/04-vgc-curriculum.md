# VGC 雙打知識課綱（工具開發者視角，淺→深）

> 我不是要當選手，是要當「能做工具的領域專家」。所以課綱用四欄思維編排：**機制 → 為什麼重要 → 對應哪個產品功能 → 需要的資料**。難度由淺到深。當前 meta 放最後且標注「會過期，由反思迴圈更新」。

---

## 第 0 章：VGC 是什麼（基礎規則）

- **雙打（Doubles）**：每方場上同時 2 隻，雙方各從 6 隻中**選 4 隻**（Team Preview 後選人），Bo3 為主流賽制。
- **時間規則**：Your Time / 回合計時，時間耗盡判定（影響操作節奏）。
- **太晶（Terastallization）**：每場限一次、選一隻變更其屬性（攻防雙向影響），是 Gen9 最核心的新賽局變數。
- **產品對齊**：選人介面、Bo3 流程、太晶狀態追蹤。**資料**：official rules、PokeAPI form 資料。

---

## 第 1 章：數值系統（傷害的地基）

- **六圍 / IV / EV / 性格（Nature）**：EV 上限 252/單項、510/總和；性格 ±10% 修正一項。
- **傷害公式**：等級、攻防、威力、屬性相剋（type chart）、STAB、暴擊、亂數（85-100%）、天氣/場地/道具/特性修正。
- **為什麼重要**：VGC 的 EV spread 不是隨便配的，是為了「**剛好擋住某招 / 剛好打死某隻**」反推出來的（benchmark / KO 線）。看得懂 spread 才看得懂隊伍。
- **產品對齊**：傷害計算 / KO 機率 / EV 最佳化器。**資料／工具**：`@smogon/calc`（直接當引擎）、Smogon usage 的 spread 統計。

---

## 第 2 章：速度控制（Speed Control）— 雙打第一課

雙打勝負極度依賴「誰先動」。控速手段：
- **Tailwind（順風）**：我方全體速度 ×2，持續數回合（飛羽常見載體）。
- **Trick Room（戲法空間 / TR）**：**反轉速度順序**，慢的先動，持續 5 回合——撐起整個「慢速隊」archetype。
- **Icy Wind / Electroweb / Bulldoze 等群體降速招**。
- **Choice Scarf（講究圍巾）**：持有者速度 ×1.5（鎖招）。
- **Prankster**：變化招優先度 +1。
- **Speed Tie（同速）**：50/50 亂數，構築時要避免或刻意賭。
- **為什麼重要**：選人與每回合決策的核心；「我這隻在順風下／TR 下跑多快」是構築的硬約束。
- **產品對齊**：**速度線計算器**（給定控速狀態，排出雙方行動順序）。**資料**：base speed（PokeAPI）、道具/特性/招式效果、usage 中的 scarf/spread 比例。

---

## 第 3 章：核心互動機制（賽局的零件）

- **Intimidate（威嚇）/ Defiant / Competitive**：威嚇降對方物攻一階；Defiant（反制攻↑↑）、Competitive（特攻↑↑）會懲罰降階，形成博弈。
- **Redirection（聚氣 / 引導）**：Follow Me / Rage Powder（撫子招）強制把對手單體招引到自己身上——保護隊友的關鍵（注意 Rage Powder 對草屬性/防塵特性無效）。
- **Protect 心理戰**：保護招擋下一回合攻擊；連續使用成功率遞減；雙打裡「對手會不會 protect」是每回合的讀心核心（fake out → protect → double target 的賽局）。
- **Fake Out（擊掌奇襲）**：先制 +3、必定畏縮，但僅出場首回合可用——控場與打斷對手節奏的關鍵。
- **天氣（Weather）**：晴/雨/沙/雪改變傷害、命中、特性聯動（葉綠素/通信、噴火龍 mega 等）。
- **場地（Terrain）**：電/草/超能力/薄霧場地改變先制、傷害、狀態。
- **狀態與道具細節**：講究系（鎖招）、剩飯、focus sash、costume 等。
- **產品對齊**：選人建議引擎需把這些互動編碼成規則（例如「對面有 redirection，我的單體控制招會被吃掉」）。**資料**：PokeAPI 特性/招式、Bulbapedia 判定細節、Showdown sim 驗證互動。

---

## 第 4 章：隊伍構築與 Archetype（把零件組成隊伍）

- **角色分工**：restricted（受限傳說，依 Regulation 而定）、控速手、redirection 手、Fake Out 手、物理/特殊 attacker、bulky support、TR setter、TR abuser。
- **常見 archetype**：
  - **Trick Room 隊**（慢速高耐久爆發）
  - **Tailwind / 進攻型快攻隊**
  - **平衡（balance）/ goodstuff**
  - **天氣隊**（晴/雨/沙）
  - **特定 restricted 核心隊**（隨 Regulation 改變）
- **構築邏輯**：先定 win condition → 配速度控制 → 補 redirection/Fake Out 保護 → 補對 meta 大威脅的解 → 反推 EV benchmark。
- **產品對齊**：**構築模板 / 隊伍分析 / counter-team 建議**。**資料**：VGCPastes（真實隊伍語料）、Limitless decklist、usage teammate 統計。

---

## 第 5 章：當前 Meta（⚠️ 會過期，由反思迴圈持續更新）

> 此章是「動態章節」。VGC 每幾個月換一次 Regulation，meta 會整盤翻掉。這裡只記「如何掌握當前 meta 的方法」，具體內容由 `05` 的反思迴圈每月／每賽季覆寫。

掌握當前 meta 的固定動作：
1. 確認**當前 Regulation 字母**與其 restricted 規則（看官方公告 / Victory Road）。
2. 拉當月 Smogon usage（data.pkmn.cc）+ Pikalytics 對照，列出 top 20 usage 與其常見 spread/item。
3. 拉近期 Limitless 大賽 Top Cut 的 decklist，比對「ladder 趨勢 vs 實戰賽果」差異。
4. 看當前 Regulation 的官方 VOD / WolfeyVGC meta 拆解，補「為什麼這隻強」的因果。
5. 產出一份「當前 meta 速覽」：前排威脅、主流 archetype、新興黑馬、常見 counter 關係。

**截至撰文（2026-06）的查證線索**（僅供方法示範，不當定論，須由迴圈驗證更新）：當前處於 VGC 2026 賽季、出現過 Regulation F/H/I/J 等字母與「Pokémon Champions」相關格式；近期大賽如 2026 Stuttgart Regional（Luca Ceribelli 奪冠）、2026 EUIC（Paul Chua 奪冠）、2026 JCS（Hiroshi Onishi 奪冠）。**具體 meta 內容請以 `05` 迴圈最新一次輸出為準。**

---

## 課綱使用方式
- 第 0-2 章是一次性打底（規則 + 數值），學完要能用 `@smogon/calc` 親手驗算。
- 第 3-4 章是「規則編碼」的核心，要把互動寫成產品邏輯並用 Showdown sim 驗證。
- 第 5 章永遠是「進行式」，交給反思迴圈。
- **驗收標準**：每章學完，我要能對自己出題並答對（見 `05` 的預測 KPI），不能只是「讀過」。
