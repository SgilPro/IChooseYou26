# Review — rZtdoPktkLg（一家鼠 & Mega 大嘴娃 鼠數兒隊）

- Extractor 檔：`data/channels/fiskepokemon/teams/rZtdoPktkLg.json`（`claude-fable-5.1/extract-v1.2`）
- Reviewer 獨立檔：`teams/_review/rZtdoPktkLg.reviewer.json`（`fable-5.1/review-v1`；先不看 extractor 檔獨立抽取，再比對）
- 素材：字幕切片 0:00–6:25；影格 f_001–f_048。隊伍表影格（reviewer 自行定位）：
  - 能力頁：**f_031–f_034**（六隻完整，左欄 slot 1/3/5、右欄 2/4/6；f_033 字幕條未遮到任何欄位）
  - 狀態頁：**f_035**（六隻數值 + 能力點 + ▲▽）
  - 投影片：f_001（一家鼠種族值 74/75/70/65/75/111 與四隻鼠立繪）、f_017/f_018（多龍種族值）、f_019（一家鼠模式 / 憤怒之拳模式）、f_036–f_045（選出、弱點）、f_046–f_048（評分 1.5/2.5/3.5/3.5）
- 規則：字幕 0:55「現在規則 M-B 有廣角鏡了」+ 發布日 2026-07-25 落在 M-B（6/17–9/9）→ `champions-m-b` / `subtitle`，雙方一致。

## 1. 欄位比對表（機械 diff，182 項）

| 欄位 | 比對數 | 一致 | 不一致 | 備註 |
|---|---|---|---|---|
| species name_zh / name_en / form / dex_no | 24 | 22→24 | 2→0 | 一家鼠：reviewer 初版 `Maushold`（三口之家）/ form null；extractor `Maushold-Four` / `Family of Four` → **extractor 正確**（見 §3-A） |
| nickname | 6 | 6 | 0 | 我就不揍了 / 快來揍我 / 我也先不揍 / 好想要雪矛 / 哈哈是我啦 / 大嘴大嘴大嘴 |
| gender | 6 | 5→6 | 1→0 | 一家鼠：reviewer 初版 null，extractor `N`；schema enum 有 `N`，**extractor 正確**（無性別應填 N） |
| ability zh+en | 12 | 12 | 0 | |
| item zh+en | 12 | 12 | 0 | 刺耳果 = Colbur Berry（字幕稱「抗惡果」）✓ |
| nature zh+en（依 ▲▽） | 12 | 12 | 0 | 爽朗 / 固執 / 內斂 / 固執 / 膽小 / 勇敢 |
| mega | 6 | 6 | 0 | 只有 slot 6 大嘴娃 `true` |
| evs（6×6）+ scale | 42 | 42 | 0 | 六隻總和皆 66 |
| stats（6×6） | 36 | 36 | 0 | 36/36 以 Lv.50 公式驗算吻合（§2） |
| moves zh / en（順序不計） | 12 | 12 | 0 | 佯攻 = Feint（一般系灰色圖示，非看穿）✓ |
| regulation_set_id / source | 2 | 2 | 0 | |
| author / author_source / game / is_members_only | 4 | 4 | 0 | |
| name | 1 | 0 | 1 | 措辭差異（皆由標題取），非錯誤 |
| tags | 1 | 0 | 1 | 判斷差異（§3-B） |

**硬資料（species/nickname/gender/ability/item/nature/mega/evs/stats/moves）：180 項，初版一致 177（98.3%）；3 項不一致經回查影格與 schema 全部是 reviewer 錯、extractor 對。最終 extractor 硬資料錯誤數：0。**
含軟欄位 182 項：最終一致 180（98.9%），餘 2 項（name、tags）為判斷差異。

## 2. 能力點驗算（六隻全做，`@pkmn/dex` 種族值）

EV = 4+8×(pt−1)（0 點 = 0）；stat = floor((2×種族+31+floor(EV/4))×50/100)+5（HP +60）；性格 ×1.1/0.9 取整。

| slot | 寶可夢 | 種族值 | 能力點 hp/atk/def/spa/spd/spe | 性格 | 計算 | 畫面 f_035 | 結果 |
|---|---|---|---|---|---|---|---|
| 1 | 一家鼠 | 74/75/70/65/75/111 | 2/32/0/0/0/32 | 爽朗 | 151/127/90/76/95/179 | 同 | 吻合 |
| 2 | 棄世猴 | 110/115/80/50/90/90 | 9/32/0/0/0/25 | 固執 | 194/183/100/63/110/135 | 同 | 吻合 |
| 3 | 風妖精 | 60/67/85/77/75/116 | 32/0/2/32/0/0 | 內斂 | 167/78/107/141/95/136 | 同 | 吻合 |
| 4 | 象牙豬 | 110/130/80/70/60/80 | 32/32/0/0/0/2 | 固執 | 217/200/100/81/80/102 | 同 | 吻合 |
| 5 | 多龍巴魯托 | 88/120/75/100/75/142 | 2/0/0/32/0/32 | 膽小 | 165/126/95/152/95/213 | 同 | 吻合 |
| 6 | 大嘴娃（原形） | 50/85/85/55/55/50 | 32/32/0/0/2/0 | 勇敢 | 157/150/105/75/77/63 | 同 | 吻合 |

字幕交叉：棄世猴 135×1.5 = 202（4:35）✓；多龍 213 = 滿速圍巾棄世猴極速（2:15）✓，本隊棄世猴 202 < 213 故多龍先圍攻 ✓。

## 3. 不一致明細與裁決

### A. 一家鼠 name_en / form（slot 1）
- extractor：`Maushold-Four` / `Family of Four`；reviewer 初版：`Maushold` / null
- 證據：投影片 f_001、f_038 的一家鼠立繪為 **兩大兩小四隻**；`@pkmn/dex` 中 `Maushold` = Family of Three、`Maushold-Four` = Family of Four（種族值相同，驗算無法區分）。`names_zh-Hant.json` 只有「一家鼠 → Maushold」一條，無型態區分，導致 reviewer 直接照表填成三口之家。
- **裁決：extractor 正確**；reviewer.json 已修正。
- 附註：corpus 內另一檔把 form 寫成「四口之家」，與本檔「Family of Four」不一致，屬命名規範問題（非本次修改範圍）。

### B. 一家鼠 gender（slot 1）
- extractor `N`；reviewer 初版 `null`。schema `gender` enum = ["M","F","N",null]，畫面無性別圖示 = 無性別 → `N` 更精確。**裁決：extractor 正確**；reviewer.json 已修正。

### C. tags
- extractor：`trick-room, tailwind, follow-me, coaching, mega`；reviewer：`mega, trick-room, tailwind`
- 雙方一致：`mega`（標題）、`trick-room`/`tailwind`（1:40–1:42「順風跟空間都可以」、2:28–2:48 控速輔助是隊伍設計條件）。
- `coaching`：2:05「讓棄世猴帶圍巾指導」、f_019「一家鼠模式」= 棄世猴指導一家鼠，是三種基本首發之一 → **可標**，reviewer 偏保守漏標。
- `follow-me`：1:43–1:52「一家鼠本來就會看我嘛，可以掩護隊友開空間」、5:01「一家鼠掩護大嘴娃劍舞」列為潛在首發 → 介於「單隻工具招式」與「隊伍概念」之間，可辯護。
- **裁決：非錯誤，保留 extractor 版本。**

### D. name
- 「一家鼠 & Mega 大嘴娃 鼠數兒隊」vs「一家鼠鼠數兒隊（Mega 大嘴娃）」— 皆由標題「鼠數兒隊！一家鼠 & Mega 大嘴娃 隊」取，extractor 更貼近原文。非錯誤。

### E. notes / stats_note / role_note 準確度抽查（extractor）
核對 14 項陳述：四個弱點（1:19–1:37）、棄世猴最完美隊友理由（1:53–2:04）、多龍唯一能壓圍巾棄世猴（2:09–2:16）、風妖精唯一同時會順風空間（2:33）、大嘴娃突襲 = 物攻 157 本系（3:24）、岩崩比班基拉斯強（3:30）、象牙豬冰礫確殺生命寶珠烈咬陸鯊（3:37–3:41）、不像空間隊誘導對手首發順風（3:49–3:56）、佯攻用途（4:00–4:09）、刺耳果防突襲（4:11–4:20）、拍落穩定出手無守住（4:22–4:28）、只有棄世猴加 HP（4:32）、弱點憤怒粉/狠辣椒/來悲粗茶/強化隊三人（5:13–5:55）、評分 1.5/2.5/3.5/3.5（f_046）。**全部有據。** 多龍 stats_note 另指出「字幕說少加一點速度，但隊伍表實際滿速 213」— 與影格相符，是正確的加值觀察。

## 4. 系統性錯誤疑慮

1. **多型態同種族值的型態（Maushold / Maushold-Four、Sinistcha / -Masterpiece 等）靠查表會填錯**：`names_zh-Hant.json` 只有一對一 zh→en，reviewer 照表就錯。建議在 `species_aliases_zh` 或 `extra` 補「一家鼠 → 預設 Maushold-Four（Champions 常見為四口之家；三口之家需畫面確認）」之類的型態提示，並要求抽取者看立繪數鼠。
2. **gender 的 N vs null**：prompt 未說明無性別應填 `N`，reviewer 填了 null；extractor 正確。建議 prompt 明寫「無性別圖示 → `N`；看不到性別欄 → null」。
3. 本次 3 處不一致全部在 reviewer 端（與 Xul9ZHTieLU 複核相同模式），extractor v1.2 在此影片無錯誤。

## 5. 結論與處置

- extractor 六隻硬資料 **全部正確**（180/180），36 項數值驗算吻合，notes 與字幕一致。
- 未修改任何資料欄位；僅把 `review_status` 改為 `reviewed`、填 `review_notes`。
- `node tools/yt/validate-teams.mjs data/channels/fiskepokemon` → 0 ERR。
