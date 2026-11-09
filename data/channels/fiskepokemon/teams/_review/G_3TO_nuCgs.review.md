# Review — G_3TO_nuCgs（謝米 & 露奈雅拉 隊）

- 受審檔：`data/channels/fiskepokemon/teams/G_3TO_nuCgs.json`（`import-pokepaste-v1` + 字幕補充 pass）
- 素材：`https://pokepast.es/7c3381f5d8b5781c`（reviewer 以 `curl …/json` 重抓、自行解析）、`intro/G_3TO_nuCgs.zh-TW.txt`（0:00–4:33）、`videos.json`（published_at 2025-09-13）
- 工具：`app/node_modules/@pkmn/dex`、`data/ref/names_zh-Hant.json`、`data/ref/regulation_sets.json`、`data/ref/tags.json`
- paste metadata：author / notes / title 皆空 → `paste_notes: null` 正確，無 format id 可對。

## 1. 欄位比對表（paste 重抓 vs teams JSON）

| 欄位 | 比對數 | 一致 | 不一致 | 備註 |
|---|---|---|---|---|
| species.name_en / dex_no / form | 18 | 18 | 0 | Shaymin-Sky 492 (Sky) / Lunala 792 / Pelipper 279 / Ursaluna 901 / Urshifu-Rapid-Strike 892 (Rapid-Strike) / Raging Bolt 1021 |
| species.name_zh | 6 | 6 | 0 | 謝米/露奈雅拉/大嘴鷗/月月熊/武道熊師/猛雷鼓（Shaymin-Sky 以 baseSpecies 查 → 謝米 ✓） |
| nickname / gender | 12 | 12 | 0 | paste 全無 → null |
| item zh+en | 12 | 12 | 0 | 氣勢披帶/強力香草/密探斗篷/突擊背心/講究圍巾/防塵護目鏡 |
| ability zh+en | 12 | 12 | 0 | 天恩/幻影防守/降雨/毅力/無形拳/古代活性 |
| nature zh+en | 12 | 12 | 0 | 膽小/內斂/內斂/固執/固執/內斂 |
| tera_type zh+en | 12 | 12 | 0 | 幽靈/妖精/草/幽靈/水/電 |
| evs（6×6，ev-252） | 36 | 36 | 0 | 含 Ursaluna 204/196/108、Raging Bolt 228/0/0/220/0/60 |
| stats_note（IVs） | 6 | 6 | 0 | 前三隻 atk 0；Raging Bolt `atk 20`（paste 原文如此，非筆誤處理）；Ursaluna/Urshifu null |
| moves zh+en（6×4，順序含） | 48 | 48 | 0 | |
| paste_text 原文 | 1 | 1 | 0 | byte-level 相同（含結尾兩個空行） |
| regulation_set_id | 1 | 1 | 0 | 2025-09-13 ∈ sv-reg-j（2025-09-01～2026-01-04）；隊上有幻獸謝米 + 傳說露奈雅拉，只有 Reg J 允許 → 與日期推斷互相印證 |
| name / name_source | 2 | 2 | 0 | 「謝米 & 露奈雅拉 隊」/ title |

**硬資料 186 項全部一致，0 錯。**

## 2. 不一致明細與裁決

### A. sources.subtitle_lang / subtitle_range_s 為 null
- notes、六個 role_note、author_source、tags_source 均標 subtitle，但 sources 仍為 import 預設 null。
- **裁決：補為 `zh-TW` / `[0, 273]`。** 已修。

### B. tags `hyper-offense`（邊界判斷，未改）
- `tags.json` 的 hyper-offense alias 含「高速」；標題「…超慢的高速 Combo！」與字幕 0:06「謝米的主要特色就是高速的天恩」命中。但字幕對隊伍的自我定義是 1:46–1:48「乍看之下很像空間隊的順風隊」，「高速」描述的是謝米這張牌的 combo 而非 archetype。
- 依 v1.2 規則 (a)「標題出現的概念」機械上成立，且順風隊本質為快攻，不算杜撰；屬偏寬標記。**裁決：保留，但註記；若日後收緊 alias「高速」只在「高速隊/速攻」句型才算，應移除。**
- `tailwind`：1:48「順風隊」明確定義 ✓。未標 `rain`（大嘴鷗降雨只是反晴天工具，2:32）、`weather`、`restricted`，符合邊界。

## 3. 字幕衍生欄位核對（逐句對 `intro/G_3TO_nuCgs.zh-TW.txt`）

| 欄位 | 陳述 | 字幕依據 | 判定 |
|---|---|---|---|
| author | Otsubo Ryota / subtitle | 0:02–0:05「作者是 2017 年世界冠軍 Otsubo Ryota」 | ✓ |
| notes / slot1 role_note | 披帶高速天恩、空氣斬 60% 畏縮、種子閃光 80% 特防 -2、開順風 | 0:06–0:31、1:04–1:11 | ✓ |
| notes / slot2 role_note | 較慢的群體特攻手；首發謝米+露奈雅拉讓對手以為要開空間；流星光束、太晶妖精魔法閃耀、暗影之光；格子不夠帶空間 | 0:43–1:12、1:28–1:44 | ✓ |
| notes | 「乍看像空間隊的順風隊」 | 1:46–1:48 | ✓ |
| notes / slot4 role_note | 背心月月熊、順風地震首發、加深空間隊假象、不帶火焰寶珠 | 1:14–1:25、1:50–2:01 | ✓ |
| notes / slot3 role_note | 大嘴鷗改天氣針對故勒頓+振翼髮晴天隊、太晶草防孢子、廣防 | 2:06–2:33、2:48、3:06 | ✓ |
| notes / slot6 role_note | 猛雷鼓蹭天氣（晴雨皆可）、防塵鏡防憤怒粉/孢子、迅雷隔壁高速隊友（太晶火故勒頓） | 2:34–2:56 | ✓ |
| notes / slot5 role_note | 圍巾武道熊師雨天保證秒滿血黑馬王、打藏瑪然特過半 | 3:16–3:21 | ✓ |
| notes | 弱點：劍舞阿爾宙斯+古劍豹、全隊多人弱冰或惡、爆發火力偏低、高耐久開牆隊打不死、謝米雙本系可能 miss、操作難度較高 | 3:33–4:30 | ✓ |

無杜撰。notes 說「第二回合種子閃光降特防後由露奈雅拉輸出」是 1:06–1:12 的合理濃縮。

## 4. 系統性問題（import-pokepaste.mjs，未改腳本）

1. `sources.subtitle_lang/subtitle_range_s` 寫死 null，字幕 pass 未回填（同 Q4njt3eekbs §4-2）。
2. ability 繁中查表 key 與 @pkmn/dex canonical 不一致的問題本隊未觸發（六個特性皆在表內），但同批 11 個含 As One 的檔會受影響（見 Q4njt3eekbs.review.md §4-1）。
3. `tagsFromTitle()` 只做 alias 子字串命中，「高速 Combo」→ hyper-offense 這類「牌的形容詞」會被當 archetype；字幕 pass 若沿用同邏輯會偏寬。建議 alias「高速」改為「高速隊」。

## 5. 結論

- paste 六隻硬資料 **186/186 一致**；regulation sv-reg-j 與幻獸入隊互相印證；author、notes、role_note 全部有字幕依據。
- 修改：補 `sources.subtitle_lang/subtitle_range_s`，`review_status: reviewed`，`review_notes`。tags 保留並註記邊界。validate 0 ERR。
