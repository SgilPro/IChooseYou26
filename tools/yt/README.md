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

## 會員影片影格的定期準備（排程已於 2026-11-10 關閉）

曾用 Claude Code 的 CronCreate 每 12 分鐘跑一次 `node tools/yt/prep-queue-next.mjs`，為了省 token 已關閉（排程只存在於 session，也會 7 天過期）。要重開時照下面做：

1. **前提**：cookies 檔在 repo 外（預設 `~/_projects/www.youtube.com_cookies.txt`，也可用環境變數 `COOKIES`），由使用者自己匯出，不要讀內容、不要提交。
2. **一次準備一支**：`node tools/yt/prep-queue-next.mjs`。佇列規則：會員限定、category=battle、有 `team_intro_range`、`teams/<id>.json` 仍是會員殼、還沒有影格；由新到舊。只下載「隊伍介紹段」，不下載整支影片。
3. **保護機制**：鎖檔（同時只跑一個）、超前上限 `MAX_AHEAD`（預設 12，影格備好卻未抽取的上限）、失敗退避 `BACKOFF_H`（預設 3 小時，寫在 `raw/.prep-backoff`）；輸出追加到 `raw/prep-queue.log`。若輸出含 FAIL／stop，多半是 cookies 失效或被限流，**不要自動重試**，先檢查帳號狀態。
4. **一次抓一批**：`COOKIES=<path> node tools/yt/prep-team-intro.mjs data/channels/fiskepokemon <id> [<id>...]`（請求間隔 `--sleep-requests 1`；要更保守可改慢）。
5. **抽取**：影格備好後，依 `EXTRACTION_PROMPT.md`（v1.3）平行派 agent，每支一個 agent、各自獨立的暫存目錄、只改自己的 `teams/<id>.json`；結束後跑 `validate-teams.mjs`、`merge-teams.mjs`，再 commit。
6. **目前狀態**：有「隊伍介紹章節」的會員影片已全部處理完（佇列為空）。尚未處理：朱紫對戰類沒有章節的 40 支、遊戲欄位未標的對戰類 71 支（內容未確認，建議先抽樣）、Champions Bonus 5 支（未看過畫面）、需「高級會員」的 5 支。

## 已知限制

- 標題/章節若不鎖 `youtube:lang=zh-TW` 會被 YouTube 自動翻成英文；`build-videos.mjs` 優先用 description 裡的時間戳重建原文章節。
- 分類（category / game / regulation）是規則式，會有誤判；`unknown` 的需要人工或 LLM 補。
- Champions 的努力值以「能力點」顯示：總和 66、單項 32，換算 EV = 4 + 8×(點數−1)（Bulbapedia Stat point）。`evs.scale` 記錄刻度，不自動換算。
