# 03 — 隊伍抽取結果報告（Fiske Pokémon，截至 2026-11-09 12:45）

> 資料線第二層「隊伍資料庫」的覆蓋率、欄位填充率、三種抽取方法的比較，以及抽樣複核結果。數字由 `data/channels/fiskepokemon/teams.json` 算出（可用 `tools/yt/validate-teams.mjs` / `merge-teams.mjs` 重跑）。方法與規則見 `tools/yt/EXTRACTION_PROMPT.md`、`tools/yt/README.md`。

## 一、覆蓋率

| 項目 | 數量 |
|---|---|
| 公開對戰影片的隊伍（六隻完整） | **136 隊 / 816 隻** |
| └ Pokémon Champions（影格 + 字幕 LLM 抽取） | 22 隊 |
| └ 朱紫（pokepaste 匯入 105 隊 + 影格 LLM 9 隊） | 114 隊 |
| 會員限定對戰影片（只有殼，待會員登入補） | 219 隊 |
| 每隊都有字幕整理的思路（`notes`） | 136 / 136 |
| 標出非 Fiske 的原作者 | 101 / 136 |
| 機械驗證 | 0 ERR；7 WARN 皆為「隊上帶兩顆 Mega 石」的刻意配置 |

## 二、三種抽取方法的欄位填充率（以寶可夢實體計）

| 方法 | 隻數 | 特性 / 道具 / 四招 | 努力值 | 性格 | 實際數值 | 太晶 | 暱稱 |
|---|---|---|---|---|---|---|---|
| Champions 影格 + 字幕（extract v1~v1.2） | 132 | 100% | 100%（能力點 0~32） | 100%（▲▽ 判讀） | 100% | —（Champions 無太晶） | 100% |
| 朱紫 pokepaste 匯入（import-pokepaste v1） | 630 | 100% | 99.8% | 99.8% | 0%（paste 無） | 100% | 5%（paste 多半不寫） |
| 朱紫影格 + 字幕（extract v1.3，無 paste 的影片） | 54 | 100% | 2%（遊戲內租用畫面不顯示；只在字幕提到時填） | 4% | 0% | 100% | 4% |

**解讀**
- Champions 影片的遊戲內隊伍表把六隻的能力點與實際數值都放在畫面上，是最完整的來源；驗證器用 Lv.50 公式重算 132 隻全部吻合。
- 朱紫時代有 pokepaste 的影片，匯入即完整（含努力值、性格、太晶），零 LLM 成本；少數 paste 沒寫暱稱。
- 朱紫沒有 paste 的影片，遊戲內「租用隊伍」畫面只有種族、道具、特性、四招、太晶；努力值通常在影片後段或作者的 Patreon，依「只寫看得到的」原則留空。

## 三、抽樣複核（對抗式：獨立再抽取 → 逐欄比對）

| 隊伍 | 方法 | 硬資料比對 | 結果 |
|---|---|---|---|
| Xul9ZHTieLU 阿勃梭魯 Z 物攻強化隊 | Champions 影格 | 200 項一致 198 | 2 處不一致皆審查方錯 |
| rZtdoPktkLg 一家鼠 & Mega 大嘴娃 | Champions 影格 | 180 / 180 | 3 處初判不一致皆審查方錯 |
| ysCCcHIh4EQ Mega 雷丘 X 電龍隊 | Champions 影格 | 180 / 180 | 1 處初判不一致為審查方錯 |
| Q4njt3eekbs 蓋歐卡 & 圖圖犬 | pokepaste | 185 項一致 184 | 1 處為匯入腳本系統性問題（分型特性英文名），已全庫修正 11 處 |
| G_3TO_nuCgs 謝米 & 露奈雅拉 | pokepaste | 186 / 186 | — |
| DQ9m1uGQ4gE Wolfe Glick 御三家誓約隊 | 朱紫影格 | 全部一致 | 移除 1 個與字幕矛盾的標題 tag |
| hs60BbAe2uM onsoni 故勒頓假高速空間隊 | 朱紫影格 | 全部一致 | — |

**結論**：7 隊、約 1,100 項硬資料的抽樣中，抽取方的硬資料錯誤只有 1 項（且是腳本可修的系統性問題）；不一致多半出在審查方憑記憶填英文名。這印證了「兩個 LLM 互審抓不到共同的知識錯誤，要有外部真值」——PokeAPI 名稱對照表與能力值公式重算是真正把錯誤擋下來的機制（過程中即時抓到 `Golisopodite→Golisopite`、`Stalwart→Stamina`、勾魂眼性格 Bold→Impish 等）。

## 四、分布速寫

- 規則組：Champions M-A 10 / M-B 7 / M-C 5；朱紫 Reg A 4、B 4、C 6、D 7、E 8、F 10、G 15、G（2025）16、H 18、I 12、J 3。
- 最常見標籤：restricted 47、trick-room 42、tournament-team 39、tailwind 36、meme-gimmick 36、setup 25、mega 21。
- 最常出現的寶可夢：武道熊師 30、愛管侍 24、熾焰咆哮虎 23、振翼髮 22、厄鬼椪 19、轟擂金剛猩 18、風妖精 17。

## 五、已知限制與下一步

- 會員限定 219 隊只有殼：需第一擁有者用會員帳號匯出 cookies 重抓（流程見 `_HANDOFF.md`）。其中 6 隊已依標題比對連到對應的公開隊伍（`related_video_ids`）。
- 性格在 Champions 影片靠 ▲▽ 箭頭判讀（confidence 0.8），中性性格會變 null；朱紫影格隊的努力值大多為空。
- tags 第一層只依標題與字幕明說的概念，尚未做戰術層分析（第一擁有者 prompt 的第三步，列為未來工項）。
- 標題規則式分類已用 `category-overrides.json` 人工覆蓋 95 支 unknown；新影片進來若再落入 unknown 需同樣處理。
