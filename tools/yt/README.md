# tools/yt — YouTube 頻道資料線工具

把一個寶可夢對戰 YouTube 頻道變成兩張表：**主表 videos**（每支影片的 metadata）與 **隊伍表 teams**（對戰影片介紹的六隻與配置）。
方法選型與社群做法比較見 `research/line4-channel-analysis/01-video-data-methods.md`。

## 需求

- `yt-dlp` ≥ 2026.10（`yt-dlp -U` 自我更新）、`deno`（yt-dlp 的 JS runtime）、`ffmpeg`、Node 20+、`jq`（可選）
- `app/node_modules` 已 `npm install`（`validate-teams.mjs` 借用 `@pkmn/dex`）

## 流程

```
scan-channel.mjs ──► raw/channel-index.json + ids.txt          # 1. 列表（tabs + 播放清單）
fetch-videos.sh  ──► raw/<id>.info.json + <id>.zh-TW.json3      # 2. 逐支 metadata + 字幕（不下載影片）
build-videos.mjs ──► videos.json / videos.csv                   # 3. 主表（規則式分類）
prep-team-intro  ──► intro/<id>.zh-TW.txt + frames/<id>/*.jpg   # 4. 隊伍介紹段：字幕切片 + 抽幀
(LLM extractor)  ──► teams/<id>.json                            # 5. 讀字幕 + 影格填 team（見 EXTRACTION_PROMPT.md）
validate-teams   ──► 機械檢查（@pkmn/dex 名稱、enum、能力點範圍）
merge-teams.mjs  ──► teams.json / teams.csv                     # 6. 合併匯出
```

```bash
CH=data/channels/fiskepokemon
node tools/yt/scan-channel.mjs @fiskepokemon
tools/yt/fetch-videos.sh $CH/raw/ids.txt $CH/raw          # 679 支約 1.5~2 小時，可中斷重跑
node tools/yt/build-videos.mjs $CH
node tools/yt/prep-team-intro.mjs $CH --all-champions-battle
#   → 對每支影片跑抽取 agent（EXTRACTION_PROMPT.md）→ $CH/teams/<id>.json
node tools/yt/validate-teams.mjs $CH
node tools/yt/merge-teams.mjs $CH
```

## 什麼進版控、什麼不進

- 進：`videos.json/csv`、`teams.json/csv`、`teams/*.json`、`intro/*.txt`（隊伍介紹字幕切片，每支幾 KB）、`raw/channel-index.json`
- 不進（`.gitignore`）：`raw/*.info.json`、`raw/*.json3`、`frames/`（數百 MB，可重抓）

## 會員限定影片

未登入抓不到，`videos.json` 會標 `is_members_only: true`，`teams/` 只建殼。之後用第一擁有者的會員帳號：照 yt-dlp wiki 在無痕視窗登入 → 匯出 `cookies.txt` → `tools/yt/fetch-videos.sh <只含失敗 id 的清單> $CH/raw --cookies cookies.txt --sleep-interval 8 --max-sleep-interval 15`。不要用 `--cookies-from-browser`（YouTube 會輪替 cookie，帳號有被標記風險）。

## 已知限制

- 標題/章節若不鎖 `youtube:lang=zh-TW` 會被 YouTube 自動翻成英文；`build-videos.mjs` 優先用 description 裡的時間戳重建原文章節。
- 分類（category / game / regulation）是規則式，會有誤判；`unknown` 的需要人工或 LLM 補。
- Champions 的努力值以「能力點 0~32」顯示，與 252 制換算待查證，`evs.scale` 記錄刻度。
