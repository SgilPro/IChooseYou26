# GameLog 該保留什麼、結構化什麼、現階段不必做什麼

> 構思階段 · 2026-06-14 · 用 VGC 雙打知識回答第一擁有者的問題：「一段完整的 GameLog 該保留哪些東西、該結構化哪些項目、哪些 tag 跟 grouping 不是現階段必要的。」

這份是「資料模型的北極星」——不是要 MVP 全做到，而是先想清楚**一場雙打對戰到底有哪些值得記的東西**，再從中切出現階段該做的最小集合。

## 一、先理解一場 VGC 雙打的結構

復盤一場雙打，玩家真正想回顧的是三層：

1. **選出（Team Preview）**：雙方亮出 6 隻，各選 4 隻出戰、決定先發 2 隻。
   - **這在雙打極度關鍵**，常常勝負在選出就決定了。第一擁有者提到的「選出畫面分析」價值極高——它不是旁支，是 GameLog 的第一等公民。
   - 想記：對手 6 隻、我方 6 隻、雙方各帶哪 4 隻（對手的會隨對戰逐漸揭露）、先發 pair。

2. **每回合（Turn）**：雙打一回合內的事件有嚴格順序：
   - **指令選擇**（雙方暗選招式/換人/Mega，對手執行前不可見）。
   - **結算順序**：換人 → 招式（依優先度 bracket，再依速度；受 Trick Room 反轉、Tailwind、麻痺等影響）。
   - **招式內事件**：特性發動（如登場威嚇、被降後不服輸）、命中與否、傷害、追加效果、擊倒、道具觸發（茵茵果、氣勢披帶、弱點保險）、保護。
   - **回合結算（end-of-turn / residual）**：天氣場地倒數、中毒/灼傷扣血、吃剩飯、加速、天氣場地消失、Trick Room 倒數。

3. **場面狀態（持續性）**：天氣、場地、Trick Room、順風、各種牆、重力——有「從第幾回合到第幾回合」的生命週期。

## 二、一段完整 GameLog「該保留」的東西（北極星，非 MVP）

- **對局後設**：格式/Regulation、日期、雙方玩家（若知）、Bo3 第幾局、最終勝負。
- **選出**：雙方 6 隻、實際帶的 4 隻、先發 pair。
- **逐回合事件流**：每個事件帶 → 回合數、階段、回合內順序、行動方（哪隻/哪側）、事件類型、目標、結果（傷害 %、是否擊倒、命中/落空、施加狀態、能力變化、觸發的特性/道具）。
- **場面狀態時間線**：天氣/場地/Trick Room/順風/牆…的起訖回合。
- **每隻 HP 軌跡**（以 % 為主）。
- **Mega 使用**（Champions M-A 每場限 1 次——值得單獨標記）。
- **溯源**：每個事件對應的「來源影格時間 + 來源 ROI + OCR 原文 + 信心」（這是我們半自動工具的命脈，方便人工校正與回看畫面）。

## 三、建議的結構化 schema（概念版）

```jsonc
GameLog {
  meta: { format, date, players?, gameNo?, result? },
  teamPreview: {
    opponent: [PokemonRef x6],   // 逐步揭露，未知以 unknown 佔位
    self:     [PokemonRef x6],
    broughtSelf: [PokemonRef x4]?, broughtOpp: [PokemonRef]?,  // 揭露多少記多少
    leads: { self: [..2], opp: [..2] }
  },
  fieldTimeline: [ { kind: weather|terrain|trickroom|tailwind|screen, value, startTurn, endTurn? } ],
  turns: [
    {
      n: 1,
      phase: "action" | "end-of-turn",
      events: [
        {
          orderInTurn: 0,
          side: "self" | "opp",
          source: PokemonRef,
          type: "move"|"switch"|"ability"|"item"|"faint"|"status"|"stat"|"field"|"mega"|"protect",
          name?: "地震" | "威嚇" | ...,        // 正規化後（經字典校正）
          target?: PokemonRef,
          effect?: { damagePct?, ko?, miss?, status?, statChanges?, fieldChange? },
          // 溯源（半自動工具必備）
          src: { t: 73.0, region: "GameLog", rawText: "...", confidence: 88 }
        }
      ]
    }
  ]
}
PokemonRef { species, nickname?, sideSlot?, confidence }
```

重點不在欄位齊全，而在**三件事可被結構化**：(1) 事件能歸到「第幾回合、第幾階段、回合內第幾順位」；(2) 每隻有身分與 HP 軌跡；(3) 每個事件可溯源回影格與 OCR 原文。

## 四、Tag 分類法（taxonomy）

事件主類型（與 app 現有 `EventKind` 對齊並擴充）：
`move`（招式）、`switch`（換人/上場）、`ability`（特性）、`item`（道具）、`faint`（倒下）、`status`（異常狀態）、`stat`（能力變化）、`field`（天氣/場地/室/牆）、`mega`（Mega 進化）、`protect`（保護類）。

每事件可再帶**屬性標籤**：行動方 side、來源 ROI、信心分數、是否人工已校正。

## 五、哪些 tag / grouping「現階段不必做」（守紀律）

為了讓 MVP 不被淹沒，以下先**不做**，等核心跑通再說：

- **精確傷害數值 / 確切 HP 數字**：先記「百分比變化 / 是否擊倒」就夠；EV 推導的精確傷害區間屬未來「傷害疊合」功能（藍圖 Phase 1），不是 log 本身。
- **速度先後 / 速度線推導**（誰比誰快）：有價值但屬分析層，之後做。
- **追加效果機率、能力等級精確數學、PP 追蹤**：現階段雜訊大於價值。
- **自動判讀「為什麼這樣打」**：那是復盤分析（roadmap），不是 log。
- **完整道具/努力值還原**：只記訊息框真的揭露的，不臆測。
- **跨語言完美正規化**：保留 OCR 原文 + 一個 best-effort 正規化名稱即可，不追求多語對齊完美。
- **回合內精確順位排序**：先能「分回合 + 分行動方」就很有用；精確 orderInTurn 可後補。

## 六、從現況到北極星的最小下一步

目前 app 的事件是「扁平的 OCR 文字 + 粗分類 + 來源 ROI」。往這個模型演進，**現階段最小、最高價值的兩步**是：

1. **回合分組（turn segmentation）**：用畫面訊號（指令選單出現＝新回合邊界、回合結算訊息聚集）把扁平事件歸進「回合」。這把一堆截圖變成「一回合一回合的紀錄」——正是產品的核心承諾。
2. **選出擷取（team preview capture）**：把「選出畫面」當成獨立 ROI 流程，記錄雙方 6 隻與先發。雙打復盤這塊價值極高且相對好辨識（靜態畫面、圖示固定）。

> 結論：**完整模型先寫清楚當北極星；MVP 只先做「回合分組 + 選出擷取 + 溯源」**，其餘標籤與精度留待核心驗證後再加。
