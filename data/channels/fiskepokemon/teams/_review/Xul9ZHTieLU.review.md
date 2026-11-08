# Review — Xul9ZHTieLU（阿勃梭魯 Z 物攻強化隊）

- Extractor 檔：`data/channels/fiskepokemon/teams/Xul9ZHTieLU.json`（`claude-fable-5.1/extract-v1`）
- Reviewer 獨立檔：`teams/_review/Xul9ZHTieLU.reviewer.json`（`fable-5.1/review-v1`，先獨立抽取再比對）
- 素材：字幕切片 0:00–7:43；影格 f_001–f_077。隊伍表影格（reviewer 自行定位）：
  - 能力頁：f_052–f_055（放大只見 slot 1–2，字幕遮住 slot 2 道具/招式）、**f_056（六隻完整，左欄 slot 1/3/5、右欄 slot 2/4/6）**
  - 狀態頁：f_057–f_064（六隻數值 + 能力點 + ▲▽ 箭頭；八張內容相同）
  - 投影片：f_006（阿勃梭魯 Z 種族值 65/154/60/75/60/151）、f_007（鋒銳）、f_041–f_048（天蠍王/金剛猩介紹）、f_065–f_073（選出、弱點）、f_074–f_077（評分）

## 1. 欄位比對表

| 欄位 | 比對數 | 一致 | 不一致 | 備註 |
|---|---|---|---|---|
| species.name_zh / name_en / form / dex_no | 24 | 24 | 0 | Absol-Mega-Z 在 app/node_modules/@pkmn/dex 已有此 id |
| nickname | 6 | 6 | 0 | 四災第五名 / 守住吃口毒 / 咆哮伊布2 / 睡他 / 卡璞瑞拉 / 鯛魚燒 |
| gender | 6 | 6 | 0 | 大狃拉 ♀，其餘 ♂ |
| ability (zh+en) | 12 | 12 | 0 | |
| item (zh+en) | 12 | 11 | 1 | 文柚果：reviewer 初版填 Shuca Berry → **extractor（Sitrus Berry）正確** |
| nature (zh+en, 依 ▲▽) | 12 | 12 | 0 | 固執×4、爽朗（大狃拉）、內斂（西獅海壬） |
| mega / form | 6 | 6 | 0 | 只有 slot 1 `mega: true` / `Mega-Z` |
| evs (6×6 能力點) | 36 | 36 | 0 | 六隻總和皆 66 |
| stats (6×6 數值) | 36 | 36 | 0 | 六隻全部以 Lv.50 公式驗算吻合（見 §2） |
| moves zh (6×4，順序不計) | 24 | 24 | 0 | |
| moves en (6×4) | 24 | 23 | 1 | 看穿：reviewer 初版填 Feint → **extractor（Detect）正確**（格鬥系橘色圖示；Feint 是一般系） |
| name / name_source | 2 | 2 | 0 | 「阿勃梭魯 Z 物攻強化隊」 |
| regulation_set_id / source | 2 | 2 | 0 | `champions-m-c` / `date-inferred`（2026-10-24 落在 M-C；標題無括號代碼） |
| author / author_source | 2 | 2 | 0 | Fiske / channel |
| game / is_members_only | 2 | 2 | 0 | |
| tags | 1 | 0 | 1 | 見 §3-C（判斷差異，非硬資料錯誤） |
| stats_note（阿勃梭魯 速度說法） | 1 | 0 | 1 | reviewer 初版質疑「比大狃拉慢 1」→ **extractor（Mega-Z 188 vs 189）正確** |
| notes 摘要 vs 字幕 | 1 | 1 | 0 | 核對 15 項陳述皆有字幕/投影片依據（見 §3-D） |
| sources.frames_used | 1 | 0 | 1 | 77 vs 13；欄位語意未定義（見 §4） |

**硬資料欄位（species/nickname/gender/ability/item/nature/mega/evs/stats/moves）：200 項，初版一致 198 項（99.0%）；兩項不一致經再查證均為 extractor 正確、reviewer 錯誤。最終 extractor 硬資料錯誤數：0。**
**含軟欄位：208 項，一致 204（98.1%）；4 項不一致中 2 項 reviewer 錯、2 項為判斷/定義差異（tags、frames_used）。**

## 2. 能力點驗算（六隻全做）

公式：EV = 4 + 8×(點−1)（0 點 = 0）；stat = floor((2×種族值 + 31 + floor(EV/4)) × 50/100) + 5（HP +60），再乘性格 1.1/0.9 取整。種族值來自 `@pkmn/dex`（app/node_modules）。

| slot | 寶可夢 | 種族值 | 能力點 (hp/atk/def/spa/spd/spe) | 性格 | 計算結果 | 畫面 | 結果 |
|---|---|---|---|---|---|---|---|
| 1 | 阿勃梭魯（原形） | 65/130/60/75/60/75 | 17/32/0/0/0/17 | 固執 | 157/200/80/85/80/112 | 同 | 吻合 |
| 2 | 天蠍王 | 75/95/125/45/75/95 | 26/25/0/0/0/15 | 固執 | 176/154/145/58/95/130 | 同 | 吻合 |
| 3 | 風速狗 | 90/110/80/100/80/95 | 32/10/0/0/8/16 | 固執 | 197/154/100/108/108/131 | 同 | 吻合 |
| 4 | 大狃拉 | 80/130/60/40/80/120 | 1/32/1/0/0/32 | 爽朗 | 156/182/81/54/100/189 | 同 | 吻合 |
| 5 | 轟擂金剛猩 | 100/125/90/60/70/85 | 21/32/0/0/0/13 | 固執 | 196/194/110/72/90/118 | 同 | 吻合 |
| 6 | 西獅海壬 | 80/74/74/126/116/60 | 13/0/0/32/0/21 | 內斂 | 168/84/94/195/136/101 | 同 | 吻合 |

字幕速度線驗證：天蠍王 130 比風速狗 131 慢 1 ✓；兩者 > 膽小大嘴鷗極速 128 ✓（5:46–5:49）。金剛猩 118 > 內斂大嘴鷗極速 117 ✓（6:00）。西獅海壬順風 101×2=202 > 130 種族值爽朗極速 200 ✓（6:17）。阿勃梭魯 Mega-Z（速度種族 151）17 點 → 188，比隊內大狃拉 189 慢 1 ✓（5:35）。

## 3. 不一致明細與裁決

### A. 看穿 → value_en（slot 1 招式 1）
- extractor：`Detect`；reviewer 初版：`Feint`
- 證據：f_052 / f_056 左欄 slot 1 第一招圖示為**橘色格鬥系**；Detect（みきり）= 格鬥系變化技 = 繁中「看穿」；Feint（フェイント）= 一般系物理技 = 繁中「佯攻」。@pkmn/dex：Detect Fighting/Status，Feint Normal/Physical。
- **裁決：extractor 正確。** reviewer 錯誤已於 reviewer.json 修正。

### B. 文柚果 → value_en（slot 3 道具）
- extractor：`Sitrus Berry`；reviewer 初版：`Shuca Berry`
- 證據：文柚果（オボンのみ）= Sitrus Berry；刺角瓜（シュカのみ）= Shuca Berry。f_056 道具圖示為黃色果實；字幕 5:51–5:58「加了一點特防…而且是帶文柚果」= 回血耐久邏輯，與 Sitrus 一致。
- **裁決：extractor 正確。** reviewer 錯誤已修正。

### C. tags
- extractor：`setup, balance, mega, intimidate, tailwind, icy-wind, grassy-terrain`（7 個，全部存在於 `data/ref/tags.json`）
- reviewer：`setup, follow-me, balance, intimidate, mega, meme-gimmick`
- 逐項：
  - `setup`（標題「物攻強化」）、`balance`（2:25「我們要組的是一個平衡隊」）、`mega`（標題 Z = Z-Mega）、`intimidate`（1:48–1:55 列為隊伍關鍵功能；風速狗帶威嚇）：**雙方一致，有據。**
  - `tailwind`（4:08「他會開順風」）、`icy-wind`（4:33「他有冰凍之風」）、`grassy-terrain`（4:38「幫天蠍王開場地」）：字幕確有提到，但都是**單隻的工具招式**，字幕把它們歸為「軟性控速 / 補充功能」而非隊伍概念（3:01「這種控速可以是軟性的」）。prompt 第 8 條「字幕明說的概念」與例子（雨天、順風、空間…）會讓 extractor 把「提到順風」等同「順風隊」。**裁決：可辯護但偏過度標記；建議保留 `tailwind`（prompt 例子明列）、移除 `icy-wind`/`grassy-terrain`，或等 prompt 澄清。**
  - `follow-me`（reviewer 加）：`tags.json` 的 `follow-me` aliases 含「指導」，而字幕 3:10「我們的 core 就是讓隊友指導他」是全隊核心概念；**依現行 alias 表應標。** 但 `follow-me` 標籤語意是「看我嘛/引導（redirection）」，把「指導（Coaching）」放進它的 alias 本身就有問題 → 見 §4。
  - `meme-gimmick`（reviewer 加）：alias「冷門」；0:05「非常冷門的寶可夢」、4:49「四個都是蠻少人在玩的」。**可選**；extractor 未標不算錯。
- **裁決：無「錯誤」tag，但 extractor 漏了 alias 表明示的 `follow-me`，並多了 2 個單隻工具招式 tag。屬 prompt 定義不清造成的系統性差異。**

### D. 阿勃梭魯 stats_note「Mega 後 188 vs 189」
- extractor 寫 Mega 後速度 188 vs 大狃拉 189。reviewer 初版以 Mega 阿勃梭魯（速度種族 115）算得 152，判定字幕 5:35 口誤。
- 再查：**Mega 阿勃梭魯 Z 種族值為 65/154/60/75/60/151**（f_006 投影片總和 565；@pkmn/dex `Absol-Mega-Z` 相同），17 點 → floor((302+31+33)/2)+5 = 188。
- **裁決：extractor 正確且有加值（指出畫面數值是未 Mega 原形）。** reviewer 錯誤已修正。

### E. sources.frames_used
- extractor 77（全部影格）vs reviewer 13（實際用到的隊伍表影格）。schema 只說 `integer`，未定義是「看過的」還是「引用的」。非對錯，見 §4。

### F. notes 準確度抽查（extractor）
核對 extractor `notes` 與各 `role_note` 共 15 項陳述：七項組隊條件（1:48–3:25）、「六人中五人為物攻手」（畫面）、怪力鉗免疫威嚇（3:59）、青草種子 + 場地物防 +1（4:13–4:16）、「近似振翼髮隊只是種族值較低」（4:55–4:59）、選出無固定模式 / 天蠍王搭金剛猩（6:22–6:32）、弱點爆發低 / 怕重空間 HO / 風妖精先制再來一次（6:34–7:13）、評分 4 / 3.5 / 3 / 4（f_074–f_077）、風速狗不選洗翠版理由（3:47–3:58）、阿勃梭魯第四格不帶近身戰（5:18–5:23）。**全部有據，無杜撰。**

## 4. 流程回饋（EXTRACTION_PROMPT.md 的模糊點 / 可能在 60 支影片放大的系統性錯誤）

1. **繁中 → 英文對照沒有工具支援，只靠模型記憶。** 本次 reviewer 就錯了兩個（看穿≠Feint、文柚果≠Shuca）。這類「同類名詞互換」錯誤在 60 支 × 6 隻 × ~7 個名詞下必然反覆出現，且兩個 agent 都可能錯在同一處而互相「確認」。建議在 `data/ref/` 放 `moves_zh.json / items_zh.json / abilities_zh.json`（繁中 ↔ Showdown id），抽取時要求 `value_en` 必須查表得出；查不到才填 null + 降 confidence。prompt 既有的「守住 vs 看穿」技巧也應改寫成「橘色格鬥圖示 = 看穿 = Detect」把英文一起釘死。
2. **Mega 的種族值要用 Mega 型態算，且 Z-Mega 的種族值與一般 Mega 不同。** prompt 的驗算公式只提「種族值」，未說明「狀態頁顯示的是未 Mega 原形，驗算用原形；但字幕的速度線（比 XX 快/慢 1）往往是講 Mega 後」。reviewer 用錯 Mega 型態差點把正確的字幕判成口誤。建議在 prompt 補：「Mega 持有者：stats/evs 用原形驗算；stats_note 裡的速度線用 Mega（或 Mega-Z）種族值換算，並註明兩個數字。」投影片 f_006 這種「種族值」頁可直接拿來對照。
3. **tags 第 8 條的「字幕明說的概念」邊界不清。** 「提到某隻會開順風」和「這是順風隊」在現行描述下無法區分，會導致每支影片都掛 4–7 個工具招式 tag，讓 tag 失去檢索價值。建議明寫：只標 (a) 標題/隊名出現的，(b) 字幕用「這是一個 XX 隊 / 我們的 core 是 XX」句型定義的；單隻的招式/特性不標。另：`tags.json` 把「指導」放在 `follow-me`（redirection）的 alias 下語意不對，應獨立成 `coaching`（或 `support-boost`）tag。
4. **`sources.frames_used` 語意未定義**（看過 77 vs 用到 13）。建議改成 `frames_team_sheet: ["f_052", …]`（列出實際引用的隊伍表影格），對 reviewer 與日後重抽都更有用。
5. **slot 順序 vs 畫面欄位順序。** 六隻完整頁是「左欄 1/3/5、右欄 2/4/6」，prompt 只說「slot 順序 = 遊戲隊伍表的編號順序」。本次雙方都對，但建議明寫兩欄交錯規則，並要求回報時附上每個 slot 對應的畫面編號水印（卡片右下的淡色數字）。
6. **能力頁放大片段會被字幕遮住。** f_052–f_055 的 slot 2 道具/招式被字幕條蓋住，只有 f_056 完整。prompt 應提醒：「以完整六隻頁為主，放大頁只做交叉確認；若某欄只在放大頁且被字幕蓋住，改用其他影格或填 null」。
7. **Reviewer 自身也會錯，且本次 3 個錯都在 reviewer 端。** 「兩個 agent 一致」不等於正確。建議 pipeline 第三步加一個**機械驗證器**（`validate-teams.mjs` 擴充）：(a) 六隻 stats 用 @pkmn/dex 種族值 + 能力點 + 箭頭性格重算，必須全部吻合；(b) 所有 `value_en` 必須存在於 @pkmn/dex；(c) 能力點總和 = 66；(d) tags ⊂ tags.json。這能攔下大部分數值/拼字錯，讓人工審查聚焦在 tags/notes 的判斷。
8. 小項：`extracted_by` 寫法不一致（`claude-fable-5.1/extract-v1` vs prompt 例 `fable-5.1/extract-v1`），建議固定格式供日後統計。

## 5. 結論

- extractor 的六隻硬資料（種族、暱稱、性別、特性、道具、性格、能力點、數值、招式、Mega 旗標、regulation、作者、notes）**全部正確**，數值經公式驗算 36/36 吻合；`value_en` 與字幕引用也正確。
- 唯一值得調整的是 tags（漏 `follow-me`、多 `icy-wind`/`grassy-terrain`），屬 prompt 定義問題而非抽取失誤。
- 建議 `review_status` 可改為 `reviewed`（由人類決定），tags 依 §3-C 微調。
