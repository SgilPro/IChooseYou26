# GameLog 事件類別：已實作 + 待補（回饋 260614_2 的 B 區）

> 2026-06-14 · 記錄目前的事件分類、以及需要真實測試資料才能調好的待補類別（當作 Ditto 的日常研究素材）。

## 已實作的類別（app v0.0.4，`events.ts`）

`move` 使用招式、`switch` 換人/上場（含己方 Go! 與對方 sent out）、`ability` 特性發動、`item` 道具觸發、`stat` 能力變化（威嚇/不服輸/劍舞）、`status` 異常狀態、`weather_terrain` 天氣/場地/室、`faint` 倒下、`effectiveness` 效果絕佳/不好/要害/miss、`failed` But it failed!、`recoil` 受到反傷、`result` 勝負/平手/投降、`hp` HP 數值、`unknown` 未分類。

規則式關鍵字（英文為主）已涵蓋上述；gamelog 區的字典實體只取 species/move（不出現特性名，回饋 B-5），特性/道具區才取 ability/item。

## 待補：需要真實測試資料才能調好的（回饋 B-6 / B-10）

第一擁有者會陸續提供以下情境的測試素材；在拿到前，我先把「該辨識的訊息文案」當研究題目蒐集（daily research 可推進），有把握再加進關鍵字規則：

- [ ] **天氣隊**：放晴/下雨/沙暴/雪 的發動與結算文案（已先放基本關鍵字，待真實文案校準）。
- [ ] **滅歌（Perish Song）**：倒數 perish count 文案（"X's perish count fell to N"）。
- [ ] **異常狀態細分**：中毒/劇毒、灼傷、冰凍、睡眠、麻痺 的「陷入 / 因狀態受傷 / 解除 / 因狀態無法行動」各自文案。
- [ ] **畏縮（flinch）**："X flinched and couldn't move!"。
- [ ] **啄食 / 蟲咬（Pluck / Bug Bite）**：吃掉對方樹果的特殊語句（冷門，低優先）。

## 待查證的 Champions 確切訊息文案（截圖 / datamine）

Champions 改了部分文案（已證實效果類：`extremely effective` / `mostly ineffective`），所以**不能沿用 SV 字串假設**。以下文案線上查不到精確版本，需用對戰截圖 / datamine 確認後才補進 `events.ts`：

- [ ] **Mega 進化**發動文案（目前用 `mega evolved`/`mega evolution` 等推測字樣；已移除誤植的 Dynamax/極巨化）。
- [ ] **己方派出（Go!）/ 對方派出（sent out）** 在 Champions 的實際措辭。
- [ ] **倒下（fainted）**、**異常狀態**、**天氣/場地/氣場**、**滅歌**、**畏縮** 的 Champions 文案。
- [ ] **勝負結算**（you won / defeated 等）在 Champions 的措辭。

## 蒐集方式（Ditto 日常研究）

- 用官方賽事 VOD / 創作者影片的對戰畫面，或第一擁有者提供的截圖，記錄各情境的**實際英文訊息框文案**。
- 來源也可參考 Bulbapedia 各招式/狀態頁的「in-battle message」。
- 蒐集到的文案 → 補進 `events.ts` 的 RULES 關鍵字（先查證實際文案再加，避免猜錯）。

> 已把「蒐集天氣/滅歌/異常狀態/畏縮的實際訊息文案」列為領域線可推進的日常題目（見 `line2-domain-learning/07-tracking-targets.md` 的待辦概念）。
