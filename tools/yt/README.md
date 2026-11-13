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
6. **目前狀態**：有「隊伍介紹章節」的會員影片已全部處理完（佇列為空）。尚未處理：朱紫對戰類沒有章節的 40 支、遊戲欄位未標的對戰類 71 支（內容未確認，建議先抽樣）、Champions Bonus 5 支（未看過畫面）。（需「高級會員」的 5 支，使用者 2026-11-11 指示不用抓，已從 backlog 移除。）
   - 2026-11-11 更新：會員朱紫 16 支有 pokepaste 者已匯入並補字幕（notes/tags/role_note/author）；朱紫無章節與 Champions Bonus 共 44 支已用 cookies 重抓 metadata，僅 2 支有（機翻）字幕、其餘無字幕無描述，Champions Bonus 為對戰實況（Bonus 章節）無隊伍介紹段，皆無可抽取範圍；遊戲未標的 71 支抽樣為對戰實況/Bonus，已標 review_notes「非隊伍介紹」，佇列已空。標題為隊伍名的朱紫會員影片（如「超硬平衡隊」）仍缺素材，需人工看畫面定隊伍介紹時間點才能走影格流程。

## 比賽播報影片（Fiske 講比賽）的隊伍抽取

影片類別 `official-commentary`：轉播畫面會在每場對戰開始時顯示選手隊伍表（中文遊戲 UI：技能、特性、性格箭頭為文字；**道具只有圖示**；沒有努力值）。一支影片只收錄「有出現的」對戰，每個對戰兩隊。

**找隊伍表影格的方法（粗到細，省 token）**
1. 下載 360p 整支影片到暫存目錄（repo 外）：`yt-dlp -f "bv*[height<=360][ext=mp4]" --cookies <cookies> --sleep-requests 1 …`（會員影片才要 cookies）。
2. 每 20 秒一張拼成總覽圖：`ffmpeg -i v.mp4 -vf "fps=1/20,scale=240:-2,tile=6x6" sheet_%02d.jpg`，一張 = 12 分鐘（第 n 格 = `(n-1)×20` 秒）。隊伍表畫面（紫色面板格）一眼可辨；對戰畫面、解說席、「VS」字卡也看得出段落。82 分鐘的影片約 7 張圖。
3. 找到時間點後，只對那幾個時間點下載 720p 的 15~20 秒片段（`--download-sections "*start-end"`），每 5 秒抽一張高畫質影格。
4. 道具圖示：把每個道具位置放大裁切（ffmpeg `crop`+`scale`+`hstack`），再與 `assets/items/icons/`（PokeAPI 圖示庫）比對；Mega 石只要認出「是 Mega 石」即可，不需分辨紋路（幾乎不會有人帶別隻的 Mega 石，使用者 2026-11-11 指示）；樹果、其他道具看形狀與色。道具、招式、特性的繁體中文名以 `data/ref/names_zh-Hant.json`（PokeAPI）為準，使用者 2026-11-11 確認夠準確（例：Coba Berry＝稜瓜果），不需另外用 52poke 等來源重複查證。低解析度下容易誤判：講究圍巾（藍色稜形晶片）曾被誤認成稜瓜果（Coba Berry），2026-11-11 經使用者更正。把握低的 `item_conf` 設 0.6~0.8。
5. 人工標記時間點（例如使用者提供「2:11 Chase 的隊伍表」）可以直接略過步驟 1~2。

**不抽取的轉播格式**：日本全國賽**公開第一部**轉播（`ZmCH9tKz6vE`，2026-11-13 評估；同賽事會員第二部 `UyrM7oewUuo` 則有完整卡片，已抽取）；2024 年朱紫日本全國賽（`P6S_SzoV26Y` 第一部已抽樣，同樣只有小圖＋圖示；第二、三部 `fXy6_PqCro4`、`jlzirRzIlBg` 同賽事未抽樣，視為同格式不抽）的隊伍表只有六隻小圖、性別與一個道具／屬性圖示，沒有技能、特性、性格，小圖辨識不穩，其餘章節為重播畫面沒有預覽表，故不登記；匯入腳本也不支援空技能。

**資料流程**
- 規格檔：`data/channels/<ch>/tournament-specs/<videoId>.json`（賽事、對戰、每隊的技能／特性／性格／道具）。
- `node tools/yt/import-tournament-teams.mjs <channelDir> <videoId>`：產生 `teams/<videoId>.json`（多隊，id `team_<videoId>_<n>`）與 `data/events/<eventId>.json`（賽事→對戰→選手→隊伍）。隊伍帶 `event_id`、`match_id`、`player`、`team_signature`（同配置偵測）、`source_t_s`。
- 對戰 id＝賽事＋輪次＋選手（排序）；之後抽官方 replay 影片時依同一 match id 補資料，不重複建立。
- 網頁：`docs-site/matches.html`（暫版，結構與介面之後再優化）。

## 本機清理（2026-11-11）

- `frames/`：隊伍抽取完成且沒有低把握欄位的 64 支影片影格已刪（約 331MB）；保留 6 支（未抽完的 `7DXkpHVcLZU`、`bzqnmAStdvM`，以及有低把握欄位待核對的 `6j1SmTtutHQ`、`8ACL1XG0vjI`、`D-APQ7NRrRI`、`NihuBOAXo94`）。要重看某支，用 `prep-team-intro.mjs` 重新下載該段。
- `raw/*.info.json`：用 `node tools/yt/slim-info-json.mjs <rawDir> <outDir>` 瘦身成 build-videos 用到的欄位（246MB → 1.5MB，檔內有 `_slimmed: true`）。已驗證：用瘦身後的檔案重建 `videos.json`，除了 `author`／`author_source`（這兩欄後來由隊伍作者回填，重建本來就會被覆蓋，與瘦身無關）外逐欄一致。重新抓取會得到完整版 info.json，可再瘦身。
- `raw/*.json3` 字幕（約 68MB）保留。
- 本機資料夾 `data/` 從約 700MB 降到約 120MB。

## 已知限制

- 標題/章節若不鎖 `youtube:lang=zh-TW` 會被 YouTube 自動翻成英文；`build-videos.mjs` 優先用 description 裡的時間戳重建原文章節。
- 分類（category / game / regulation）是規則式，會有誤判；`unknown` 的需要人工或 LLM 補。
- Champions 的努力值以「能力點」顯示：總和 66、單項 32，換算 EV = 4 + 8×(點數−1)（Bulbapedia Stat point）。`evs.scale` 記錄刻度，不自動換算。
