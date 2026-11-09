# Review — Q4njt3eekbs（蓋歐卡 & 圖圖犬 隊）

- 受審檔：`data/channels/fiskepokemon/teams/Q4njt3eekbs.json`（`import-pokepaste-v1` + 字幕補充 pass）
- 素材：`https://pokepast.es/4728aff22e71da5a`（reviewer 以 `curl …/json` 重抓、自行解析 Showdown 文字）、`intro/Q4njt3eekbs.zh-TW.txt`（0:00–7:02）、`videos.json`（published_at 2025-08-03）
- 工具：`app/node_modules/@pkmn/dex`（species name/num/forme）、`data/ref/names_zh-Hant.json`（en2zh）、`data/ref/regulation_sets.json`、`data/ref/tags.json`
- paste metadata：author / notes / title 皆空字串 → `paste_notes: null` 正確，無 format id 可對。

## 1. 欄位比對表（paste 重抓 vs teams JSON）

| 欄位 | 比對數 | 一致 | 不一致 | 備註 |
|---|---|---|---|---|
| species.name_en / dex_no / form | 18 | 18 | 0 | Kyogre 382 / Flutter Mane 987 / Urshifu-Rapid-Strike 892 (Rapid-Strike) / Landorus 645 / Smeargle 235 / Calyrex-Ice 898 (Ice) |
| species.name_zh | 6 | 6 | 0 | 以 baseSpecies 查 en2zh：蓋歐卡/振翼髮/武道熊師/土地雲/圖圖犬/蕾冠王 |
| nickname / gender | 12 | 12 | 0 | paste 全無暱稱、性別 → 全 null |
| item zh+en | 12 | 12 | 0 | 力量鏡/氣勢披帶/講究圍巾/生命寶珠/避難背包/清淨墜飾 |
| ability zh+en | 12 | 11 | 1 | slot6 `As One (Glastrier)` 繁中未查到（見 §2-A） |
| nature zh+en | 12 | 12 | 0 | 冷靜/膽小/固執/內斂/爽朗/勇敢 |
| tera_type zh+en | 12 | 12 | 0 | 水/惡/幽靈/鋼/地面/草 |
| evs（6×6，ev-252） | 36 | 36 | 0 | 含 Landorus 12/0/4/212/36/244、Smeargle 28/0/0/0/236/244 |
| stats_note（IVs） | 6 | 6 | 0 | Kyogre atk0 spe0、Flutter Mane atk0、Landorus atk0、Calyrex spe0；其餘 null |
| moves zh+en（6×4，順序含） | 48 | 48 | 0 | |
| paste_text 原文 | 1 | 1 | 0 | byte-level 相同（含 `\r\n`） |
| regulation_set_id | 1 | 1 | 0 | 2025-08-03 ∈ sv-reg-i（2025-05-01～08-31）；隊上雙神（蓋歐卡+蕾冠王）與雙神規則一致 |
| name / name_source | 2 | 2 | 0 | 標題「蓋歐卡 & 圖圖犬 隊」/ title |

**硬資料 185 項，一致 184；唯一不一致為查表失敗的繁中特性（非 paste 資料錯誤）。**

## 2. 不一致明細與裁決

### A. slot6 蕾冠王 ability.value = "As One (Glastrier)"（英文）
- 正確繁中官方名為「人馬一體」。`names_zh-Hant.json` 的 abilities 表只有 `"As One": "人馬一體"`，而 paste / @pkmn/dex 的 canonical 名是 `As One (Glastrier)`，import 腳本 `field()` 查 `zh("abilities","As One (Glastrier)")` 失敗 → 用英文當 value、confidence 0.7。
- 嘗試改成 value「人馬一體」+ value_en「As One (Glastrier)」會被 `validate-teams.mjs` 判 ERR（表查回 `As One` ≠ value_en）；改 value_en 為 `As One` 則 @pkmn/dex 無此 id 亦 ERR。兩個 ref/工具檔都在本次「不得修改」範圍。
- **裁決：維持現狀（英文 + 0.7 已如實標示未查到），列為系統性問題（§4-1）；待 names 表補 `As One (Glastrier)`/`As One (Spectrier)` → 人馬一體 後一併修 11 個含此特性的 teams 檔。**

### B. sources.subtitle_lang / subtitle_range_s 為 null
- notes、六個 role_note、tags_source、author_source 都標 subtitle，但 sources 仍是 import 腳本的預設 null。
- **裁決：補為 `zh-TW` / `[0, 422]`（隊伍介紹章節）。** 已修。

## 3. 字幕衍生欄位核對（逐句對 `intro/Q4njt3eekbs.zh-TW.txt`）

| 欄位 | 陳述 | 字幕依據 | 判定 |
|---|---|---|---|
| author | つな / subtitle | 0:03「這個隊伍的作者是つな」 | ✓ |
| notes | 日本全國賽八強 | 0:05 | ✓ |
| notes | 八強前不公開配置、八強後公開、三戰兩勝 | 0:55–1:00 | ✓ |
| notes | 策略單純的 HO 隊、固定泛用首發 | 1:45–1:48 | ✓ |
| notes / slot5 role_note | 避難背包圖圖犬：擊掌、看我嘛、廣防、蘑菇孢子；心情不定保證退場；重空間 | 1:54–2:23 | ✓ |
| notes / slot1 role_note | 0 速力量鏡、比月月熊/鐵臂膀更慢、空間下第一個噴水、必帶守住防擊掌 | 0:27–0:41、3:18–3:33 | ✓ |
| notes / slot6 role_note | 白馬王清場最強、封印防反開空間／封雪矛、不帶守住 | 2:39–2:42、3:42–3:53 | ✓ |
| notes / slot3 role_note | 第二首發圍巾武道熊師+白馬王、太晶幽靈躲擊掌、換蓋歐卡開雨天先手秒黑馬王/振翼髮 | 4:32–4:47 | ✓ |
| notes / slot4 role_note | 土地雲秒殺藏瑪然特、屬性適合搭白馬王 | 5:01–5:04（字幕說「化身土地雲」，paste 為 Landorus 化身 ✓） | ✓ |
| notes / slot2 role_note | 披帶冰凍之風+空間振翼髮，第三首發/高速模式，應付雙彈瓦斯、露奈雅拉、故勒頓 | 5:09–6:06 | ✓ |
| notes | 弱點：空間開不出/不開且對面有順風時高速模式偏弱、控速最關鍵；配置知名可能被預判 | 6:20–7:00 | ✓ |
| tags | trick-room | 0:01「空間噴水的蓋歐卡隊」、1:54「重空間」= 隊伍層級定義 | ✓ |
| tags | hyper-offense | 1:45「策略比較單純的 HO 隊」、6:16「很強的進攻型隊伍」 | ✓ |
| tags_source | subtitle | 兩個 tag 都來自字幕（標題無 alias 命中） | ✓ |

無杜撰；notes 用詞偏「摘要」而非逐字，但每句皆可回溯。小瑕：slot3 role_note「雨天下秒黑馬王、振翼髮」是蓋歐卡開雨後武道熊師的輸出，字幕原意相同。未標 `restricted`（雙神）、`fake-out`/`follow-me`（單隻工具招）符合 v1.2 邊界。

## 4. 系統性問題（import-pokepaste.mjs，未改腳本）

1. **ability 繁中查表 key 與 @pkmn/dex canonical 名不一致**：`field()` 先把名稱正規化成 dex canonical（`As One (Glastrier)`），再去 names 表查，但表以 PokeAPI 名建（只有 `As One`），凡 Showdown 分裂的特性（As One ×2，日後若有其它）都會退化成「英文當繁中 + 0.7」。目前 11 個 teams 檔受影響。建議：names 表補兩個 key，或 `field()` 在查不到時以去括號的 base 名再查一次。
2. **`sources.subtitle_lang/subtitle_range_s` 固定寫 null**：腳本註解說 notes/tags 由後續 LLM pass 補，但該 pass 沒回填 sources，導致「tags_source/author_source=subtitle」與「sources.subtitle_lang=null」自相矛盾。應在字幕 pass 一併寫入 `zh-TW` 與 `team_intro_range`。
3. （觀察）`tags_source` 由腳本固定寫 `"title"`，字幕 pass 改成 `"subtitle"` 後單一欄位無法表達「標題 + 字幕」混合來源；本隊兩個 tag 恰好都來自字幕所以無誤。

## 5. 結論

- paste 六隻硬資料與 teams JSON **0 錯**（185 項中 184 一致，唯一差異為表缺 key 的繁中特性，已如實標 0.7）。
- regulation sv-reg-i、author つな、notes/role_note/tags 全部有字幕依據。
- 修改：補 `sources.subtitle_lang/subtitle_range_s`，`review_status: reviewed`，`review_notes`。validate 0 ERR。
