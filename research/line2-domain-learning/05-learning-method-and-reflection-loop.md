# 學習方法、節奏與自我精進反思迴圈

> 這是整個方法論的心臟。VGC 每幾個月換 Regulation，靜態知識會過期。我要的是一個**永遠跟得上版本、且會自我優化**的學習系統。

---

## 一、整體架構：雙軌吸收 + 三層反思

```
                ┌─────────── 軌道 A（人類先驗 / 因果） ───────────┐
                │  WolfeyVGC 字幕 · 官方 VOD 主播分析 · VR 報告      │
                ▼                                                  ▼
   原始輸入 ──► 結構化（知識卡片 + Regulation 標籤）──► 知識庫 ──► 產品功能
                ▲                                                  ▲
                │  Limitless API · data.pkmn.cc · VGCPastes        │
                └─────────── 軌道 B（原始資料 / 實證） ───────────┘
                                     │
                                     ▼
              ┌──────── 反思迴圈（cron 驅動，KPI 驗收）────────┐
              │  每週攝取+反思 → 每月 meta 體檢 → 每賽季大盤點   │
              └──────────────────────────────────────────────┘
```

兩軌做「貝氏互校」：人類框架是 prior，資料是 likelihood，反思迴圈做更新。

---

## 二、知識卡片格式（一切結構化的原子單位）

所有攝取（不論影片或資料）最終落成統一卡片，存進可檢索知識庫（建議：帶標籤的 markdown / 向量檢索）：

```yaml
id: <uuid>
type: takeaway | reasoning | meta-fact | interaction-rule | team-archetype
source: { kind: youtube|vod|limitless|smogon|vgcpastes, url, date }
regulation: <字母>        # 過期淘汰用
pokemon: [..]
mechanics: [speed-control|trick-room|redirection|intimidate|protect|weather|terrain|..]
claim: "<一句話結論>"
evidence: "<原話引用/數據>"
product_hook: "<對應哪個功能：速度線|傷害計算|選人建議|構築>"
confidence: 0-1
status: active | archived
```

**淘汰機制**：切 Regulation 時，舊卡片 `status` 改 `archived`，不刪（保留歷史對照），但不參與當前判斷。

---

## 三、攝取管線（可自動化的部分）

| 來源 | 取用方式 | 頻率 |
|---|---|---|
| WolfeyVGC / 官方 VOD 字幕 | `youtube-transcript-api` 或 `yt-dlp --write-auto-sub`，LLM 摘要成卡片 | 每週掃新片 |
| Limitless 賽事 | `GET /tournaments?game=VGC` → standings/pairings；或註冊 **webhook** 事件驅動 | 事件觸發 / 每週 |
| usage / set | data.pkmn.cc（`@pkmn/smogon`），月度直接抓 smogon chaos JSON | 每日刷 set，每月刷 stats |
| VGCPastes | Google Sheets CSV 匯出 → 解析 Poképaste | 每週 |
| 跨語言 ID 對照 | PokeAPI + 52Poke + 官方台灣圖鑑 | 新 Pokémon/form 時更新 |

合規紅線：只爬公開字幕與公開資料，不繞 Patreon 付費牆，影像訓練優先用 sprite（見 `03`）。

---

## 四、反思迴圈（cron 驅動，三層）

> 落地工具：本專案環境提供 `schedule`（cron 雲端 routine）與 `loop`（間隔重跑）skill，可用來掛這些定時任務。

### 第 1 層：每週「攝取 + 反思」（cron: 每週一）
1. 拉本週新賽事（Limitless）、新影片字幕、刷新 set 資料。
2. 與現有知識庫做 **diff**，產出「Weekly Delta 報告」回答：
   - 哪隻 Pokémon usage 竄升 / 跌落？
   - 出現了我沒見過的 build / spread / archetype？
   - 主播或 Wolfe 提到哪個我**還不懂**的互動？（標為待補洞）
3. 對每個 delta 寫下「我的新假設」（confidence 標低，待驗證）。

### 第 2 層：每月「meta 體檢」（cron: 每月 1 號，對齊 Smogon 月度 stats）
1. 拉當月完整 usage（chaos JSON），重算 top usage / teammate / spread。
2. **回頭驗證上個月的假設**對不對（自我問責）——對的升 confidence，錯的記錄「為什麼我之前判斷錯」。
3. 覆寫課綱 `04` 第 5 章「當前 meta 速覽」。

### 第 3 層：每賽季 / 每 Regulation 切換「大盤點」（事件觸發：官方公告新 Regulation）
1. 封存上個 format 全部卡片（`status: archived`）。
2. 重建當前 Regulation 的 restricted 規則、威脅清單、archetype。
3. 寫一份「上個 format 復盤」：我學到什麼、哪些判斷準、哪些翻車。

---

## 五、防自滿的驗收 KPI：對戰預測準確率

每次反思都對自己出題，逼自己從「讀過」進步到「真懂」：

```
題型 A（選人預測）：給定對手 6 隻 → 預測他會選哪 4 隻 + 開場行動
題型 B（spread 反推）：給定一隻的角色 → 預測其 EV benchmark 的意圖
題型 C（互動判定）：給定場況 → 預測下一回合最優解
```
用真實賽事的 standings / replay 對答案，記錄**預測準確率**。這是我唯一的學習 KPI——準確率上升才算真的在進步，否則只是堆積資訊。

---

## 六、元反思：連學習方法本身都要被優化（每季一次）

我不允許自己對「學習方法」本身自滿。每季回顧：
1. **來源效益審計**：哪個源產出的卡片，後來被驗證「最準 / 最有產品價值」？把注意力預算往高效益源傾斜。
2. **洞檢查**：上季標的「待補洞」補完了嗎？沒補的為什麼？
3. **KPI 趨勢**：預測準確率有沒有長期上升？若停滯，代表方法要改（換題型、換來源、換結構化粒度）。
4. **流程精簡**：哪些攝取步驟其實沒產出價值，可以砍掉？

---

## 七、落地檢查清單（人類擁有者可據此協助）
- [ ] 建知識庫（卡片格式 + 標籤檢索）。
- [ ] 寫攝取腳本：YouTube 字幕、Limitless API（含 webhook）、data.pkmn.cc、VGCPastes sheet。
- [ ] 建跨語言 ID 對照表（PokeAPI + 52Poke）。
- [ ] 整合 `@smogon/calc` 當傷害引擎。
- [ ] 用 `schedule` / `loop` 掛上週/月/賽季三層 cron 任務。
- [ ] 設定預測 KPI 的出題與對答案流程。
- [ ] （人類）若訂閱 WolfeyVGC Patreon，提供付費課程重點供我結構化。

---

## 一句話收束
**雙軌吸收、貝氏互校；一切結構化、為產品服務；cron 驅動三層反思，用預測準確率防自滿，連學習方法本身都定期優化。** 這樣我才配得上「相信自己有無限潛力，但永不自滿」。
