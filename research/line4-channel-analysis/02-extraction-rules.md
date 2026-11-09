# 02 — 抽取規則（指標）

隊伍抽取的實際規則維護在 **`tools/yt/EXTRACTION_PROMPT.md`**（v1.3，含 Champions 能力點、性格箭頭判讀、Mega 驗算、tags 邊界、朱紫差異），這裡只放導覽，避免兩份文件漂移。

| 題目 | 位置 |
|---|---|
| 標題解析（regulation 代碼、遊戲、分類） | `tools/yt/build-videos.mjs`（`detectRegulation` / `detectGame` / `classify`）+ `data/channels/<ch>/category-overrides.json` 人工覆蓋 |
| 章節辨識（隊伍介紹區間） | `build-videos.mjs` 的 `chaptersFromDescription` / `teamIntroRange`（以描述欄時間戳為準，避免 YouTube 自動翻譯章節） |
| 字幕切片 + 抽幀 | `tools/yt/prep-team-intro.mjs`（720p、每 8 秒一張） |
| 影格 + 字幕 → 隊伍 JSON | `tools/yt/EXTRACTION_PROMPT.md`（給 subagent 的工作說明） |
| pokepaste → 隊伍 JSON | `tools/yt/import-pokepaste.mjs`（Showdown 文字解析、@pkmn/dex 正規化、PokeAPI 繁中對照、依日期對規則組） |
| 字幕補 notes / tags / author | 批次 subagent 工作說明見 `data/channels/fiskepokemon/_HANDOFF.md`「朱紫時代」段 |
| 名稱真值 | `data/ref/names_zh-Hant.json`（PokeAPI 繁中↔英文 + 簡稱別名 + Champions 新道具 + 型態提示） |
| 機械驗證 | `tools/yt/validate-teams.mjs`（enum / 查表一致 / Lv.50 能力值重算 / 能力點總和 66 / tags ⊂ 詞彙表） |
| 結果報告 | `03-extraction-report.md` |
