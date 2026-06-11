# 04 — 日誌結構化與分回合（Log Structuring / Grouping）

把「依時間排序的零散事件流」整理成「一回合一回合、含出招順序、含回合結束結算」的乾淨復盤紀錄。寶可夢對戰流程是固定的，因此可用**規則 + 狀態機**達成高確定性。

## 1. VGC 雙打的回合結構（領域知識）

每個回合（turn）的固定階段：
1. **指令選擇階段（command phase）**：雙方各替兩隻寶可夢選「招式 / 換人」。畫面出現指令選單。此階段通常**沒有訊息框敘事**。
2. **換人先行（switch phase）**：本回合若有換人，通常先於攻擊執行。
3. **行動執行階段（action phase）**：依**優先度（priority）→ 速度（speed）**決定行動順序，逐一執行招式 / 特性觸發 / 傷害 / 命中與否 / 異常狀態附加。
4. **回合結束結算（end-of-turn / residual phase）**：天氣傷害、中毒/灼傷掉血、剩餘傷害（漏液種子、燃燒等）、狀態回合遞減、場地計時等，依固定順序結算。

回合邊界訊號：
- **指令選單出現** = 新回合開始（最可靠的邊界訊號之一）。
- 「結算事件」結束、回到指令選單 = 上一回合結束。

## 2. 事件流的中介資料模型

過濾 + OCR 後，先產生帶時間戳的原始事件流（raw events）：

```ts
interface RawEvent {
  ts: number;            // 影片時間或擷取時間（秒）
  frameId: string;       // 對應關鍵影格（含縮圖）
  rawText: string;       // OCR 原文
  type: EventType;       // move | ability | switch | status | damage |
                         // faint | weather | terrain | menu | unknown
  actor?: string;        // 哪隻寶可夢（字典校正後）
  target?: string;
  payload?: object;      // 招式名 / 特性名 / 狀態名 / HP 估值…
  confidence: number;    // OCR + 字典比對信心
}
```

## 3. 分回合與分階段的狀態機

用有限狀態機（FSM）走過事件流：

```
狀態：
  IDLE          // 對戰開始前 / 隊伍預覽
  TEAM_PREVIEW  // 選四階段（VGC 開局）
  COMMAND       // 指令選單顯示中（回合邊界）
  ACTION        // 執行招式/特性/傷害
  END_OF_TURN   // 結算
  BATTLE_END    // 勝負已分

轉移（節錄）：
  IDLE --偵測到隊伍預覽--> TEAM_PREVIEW
  TEAM_PREVIEW --偵測到指令選單--> COMMAND   // 開始第 1 回合
  COMMAND --出現 move/switch/ability 敘事--> ACTION
  ACTION --結算類事件(天氣/中毒/狀態遞減)--> END_OF_TURN
  END_OF_TURN --再次出現指令選單--> COMMAND  // turn += 1
  ACTION/END_OF_TURN --偵測到勝負訊息--> BATTLE_END
```

實作要點：
- **回合計數器**：每次從 END_OF_TURN/TEAM_PREVIEW 進入 COMMAND，`turn += 1`。
- **階段歸屬**：每個 RawEvent 依當前 FSM 狀態被標上 `turn` 與 `phase`。
- **出招順序推斷**：ACTION 階段內的事件本就依執行順序到達（OCR 是照畫面時序），順序即為實際行動順序；可再用已知速度/優先度做合理性檢查。
- **容錯**：若某些回合邊界訊號漏抓（例如沒截到指令選單），可用「敘事事件之間的長時間靜默」或「結算事件群」作為次要邊界推斷。

## 4. 衍生／結構化輸出（Game Log）

FSM 跑完輸出結構化紀錄：

```ts
interface GameLog {
  id: string;
  source: "file" | "obs" | "screen";
  language: string;
  createdAt: string;
  players?: { p1?: string; p2?: string };
  teamPreview?: { p1: string[]; p2: string[] };  // 雙方 6 隻（若可辨識）
  turns: Turn[];
  result?: "win" | "lose" | "unknown";
}

interface Turn {
  index: number;          // 第幾回合
  events: StructuredEvent[];
  // events 依 phase 排序：switch → action → endOfTurn
}

interface StructuredEvent {
  phase: "command" | "switch" | "action" | "endOfTurn";
  type: EventType;
  actor?: string; target?: string;
  description: string;    // 人類可讀（可由樣板生成或直接用 OCR 原文）
  rawText: string;
  frameId: string;        // 連結回截圖縮圖供使用者核對
  confidence: number;
  edited?: boolean;       // 使用者是否手動修正過
}
```

## 5. 信心與人工校正掛鉤

- 每個事件帶 `confidence`；低於閾值在 UI 標黃，提示使用者核對（見 06）。
- 結構化後仍保留每事件對應的截圖縮圖，使用者一眼可比對 OCR 是否正確。
- 使用者修正會回寫 `edited=true`，未來可作為改善字典/模型的回饋資料。

## 6. 規則覆蓋率風險

寶可夢的特性、招式、狀態、互動非常多（且每代新增）。FSM 與句型樣板需涵蓋常見情境：
- 多重觸發（如交換時威嚇對兩隻同時生效、再觸發不服輸/我行我素）。
- 同優先度依速度、Trick Room（戲法空間）反轉速度順序等特例。
- 連續攻擊、保護、替身等。

策略：**先覆蓋最常見的事件類型（出招、換人、威嚇/不服輸等熱門特性、基本狀態、天氣），把無法歸類者標為 `unknown` 並原文呈現，交使用者判讀**，而非追求一次涵蓋全部。隨真實樣本累積擴充規則。

## 7. 此環節可行性

**高（綠燈）**：純規則/狀態機、確定性高、不依賴外部服務。主要工作量在「窮舉與測試規則」，風險可控。真正的瓶頸在上游 OCR 的正確率（見 03）——garbage in, garbage out。

## 資料來源
- 領域知識（VGC 回合結構、優先度/速度、結算順序）為寶可夢對戰通用規則，可參考 Bulbapedia 等社群 wiki：https://bulbapedia.bulbagarden.net/wiki/Turn
- 寶可夢/招式/特性多語系資料：PokéAPI https://pokeapi.co/
