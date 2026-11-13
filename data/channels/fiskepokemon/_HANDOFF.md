# 接手指南 — Fiske Pokémon 資料線（261108_1 第 1 線）

> 給 reset 後接手的 session（人或 Ditto）。這裡只寫「現在到哪、下一步敲什麼」；方法與理由見 `tools/yt/README.md`、`research/line4-channel-analysis/`。
> 最後更新：2026-11-13（見下方「最新現況」；本行以後的內容為 11-09 舊版）
> 舊註：2026-11-09 12:55（複核 5 隊、unknown 清零、teams.html 搜尋篩選；主表 394/679；Champions 22 + 朱紫 104 pokepaste + 5 影格 = 131 隊有六隻，全部有 notes，97 隊標原作者；132 會員殼；抓取與影格準備仍在背景跑，若 session 結束請重跑步驟 1 與 4，腳本會跳過已完成的）。

## 最新現況（2026-11-13，以此為準；下方 11-08／11-09 的表與待辦已過時）

- 隊伍 360 隊、1278 隻，validate 0 ERR（32 WARN 皆為雙 Mega 提示）。賽事資料 2 個：`naic-2026`、`worlds-2026`（`data/events/`）。
- 會員影片：有章節的隊伍介紹已全抽完；會員短片 12 支確認為同期公開影片同隊的延伸版，已刪殼、寫入公開隊伍的 `related_video_ids`；仍待處理 75 支（約 8 支需各抓一張影格核對是否同隊：`mHC9YuqyfmQ`、`pKmk6zGbkDY`、`g8W_4Rlkldw`、`yJ-XjMajwx4`、`145Yuis-vfM`、`blm0R8ztLH8`、`uZnip5S0vcQ`、`xULetDD2vcU`）。會員下載頻率維持每小時 ≤5 次、間隔 12 分鐘。
- 比賽影片（官方比賽解說 90 支）已抽：`8ACL1XG0vjI`（NAIC）、`RyYI7S_Jcfc`（世界賽 D1）、`OXRky0qvDuI`（世界賽決賽三組別）。`ZmCH9tKz6vE`（日本全國賽）轉播只有圖示，不抽（見 tools/yt/README.md）。
- 朱紫比賽影片（公開）2025 年 6 支已抽：`iZCz6VRcsd0`（laic-2026）、`7V6DLchwra0`／`WY016nnsTzc`（worlds-2025）、`LvOdelMxhnM`（naic-2025）、`31xBomuvMFw`／`yzmlnb9mJFk`（euic-2025）。朱紫卡片有物種、特性、道具、四招、太晶屬性，無性格／性別／努力值；規則組要用 `spec.event.regulation_set_id` 覆寫（影片多半不寫，靠日期＋每隊限定神獸數推論）。每支約 10~12 分鐘、6~12 萬 tokens（agent）。流程：360p 全片 → 5s 拼圖找卡 → ≤10s 720p 片段 → 寫 spec → `import-tournament-teams.mjs`。
- 待核對：`laic-2026`／`euic-2025`／`worlds-2025` 的 `date_approx` 是估計值；Camporesi（LvOdelMxhnM）與 Luca Ceribelli（WY016nnsTzc）同一份配置，但 Incineroar／Urshifu 太晶屬性對調，需重看 Luca 的卡；太晶徽章靠圖示判讀，部分以 `tera_conf` 標低信心。
- 下一步：公開朱紫比賽影片 2024 年約 62 支（每場多為 Swiss／Top 賽各一桌）；會員 Champions／朱紫比賽影片（Liverpool 地區賽等）要 cookies 且守每小時 ≤5 次；Champions 其餘比賽影片同理。匯入腳本 `import-tournament-teams.mjs` 目前不支援空技能。
- 其他 backlog 見最後一節；31 隊缺努力值、審核覆蓋率偏低等未動。

## 現況（2026-11-08 17:30）

| 項目 | 狀態 | 位置 |
|---|---|---|
| 頻道清單（679 支） | ✅ | `raw/channel-index.json`、`raw/ids.txt` |
| 逐支 metadata / 字幕抓取 | ✅ 401/679 完整、275 會員限定、4 抓不到（3 私人影片 + 1） |
| 主表 videos.json / csv | 🟡 已可產出（規則式分類），抓取完要**重跑** | `videos.json`、`videos.csv` |
| Champions 公開對戰影片（23 支）隊伍介紹段素材 | ⏳ 背景跑中（約 12/23 完成） | `intro/<id>.zh-TW.txt`、`frames/<id>/` |
| 隊伍抽取 teams/<id>.json | ✅ 公開對戰影片全部完成（136 隊）；⬜ 會員限定 219 隊只有殼（含 95 支原 unknown 經人工覆蓋分類後新增的 87 支） | `teams/*.json` |
| 對抗式複核 | ✅ 18/136（7 隊硬資料 + 11 隊字幕忠實度：291 項陳述有依據 281、無依據 7 已修、錯誤 3 已修） 做了獨立再抽取或重抓 paste 比對（Xul9、rZtd、ysCC、Q4nj、G_3T、DQ9m、hs60；硬資料一致率 99~100%，不一致皆在審查方）；其餘靠機械驗證 | `teams/_review/` |
| 合併 teams.json / csv | ✅ 355 隊（136 有六隻 / 219 會員殼）、816 隻；每次異動後重跑 | `teams.json`、`teams.csv` |
| 會員限定影片（~96 支）殼記錄 | ⬜ 未做 | 見下「會員影片」 |

## 接手步驟（照順序敲）

```bash
cd /Users/d9niel/_projects/IChooseYou26
CH=data/channels/fiskepokemon

# 0. 工具鏈：yt-dlp ≥ 2026.10.26（yt-dlp -U）、deno、ffmpeg、app/node_modules 已裝

# 1. 抓取若沒跑完（ls $CH/raw/*.info.json | wc -l 應接近 679 − 會員數）
tools/yt/fetch-videos.sh $CH/raw/ids.txt $CH/raw        # 可重跑，只補缺的

# 2. 重建主表
node tools/yt/build-videos.mjs $CH                       # 看 stderr 統計：category/game/regulation 分布

# 3. 找出還沒抽取的 Champions 公開對戰影片
jq -r '[.[] | select(.game=="champions" and .category=="battle" and .is_members_only==false and .fetch_error==null)] | .[].id' $CH/videos.json \
  | while read id; do [ -f $CH/teams/$id.json ] || echo $id; done > /tmp/todo-teams.txt
cat /tmp/todo-teams.txt

# 4. 準備素材（每支約 1 分 40 秒；已有 frames 的會跳過）
node tools/yt/prep-team-intro.mjs $CH $(cat /tmp/todo-teams.txt)

# 5. 逐支抽取：每支開一個 subagent，prompt 照 tools/yt/EXTRACTION_PROMPT.md（v1.2），
#    指定專屬 scratchpad 子目錄 <id>/ 做裁切，寫 $CH/teams/<id>.json，跑完 validate 修到 0 ERR。
#    一支約 10~17 萬 tokens、5~10 分鐘；平行 2~3 支即可。

# 6. 驗證 + 合併
node tools/yt/validate-teams.mjs $CH --strict
node tools/yt/merge-teams.mjs $CH

# 7. commit + push（raw/ frames/ 已 gitignore）
git add $CH tools/yt && git commit -m "feat(data): ..." && git push
```

## 朱紫時代（已走 pokepaste 捷徑）

- Fiske 朱紫影片的描述欄幾乎都附 pokepast.es 連結（102/113）。`node tools/yt/import-pokepaste.mjs $CH` 會抓 `/json`、解析 Showdown 文字、對照繁中名、依發布日對應 Reg A~J（含 2025 再登場的 Reg G）。不需影格、不需 LLM。
- 字幕補 `notes` / `tags` / `role_note` / `author` 已對 104 隊做完（每批 12 支一個 subagent，約 11~13 萬 tokens/批）。做法：讀 `intro/<id>.zh-TW.txt` + team JSON，只改這四個欄位，tags 守 v1.2 邊界，字幕點名原作者就改 author。
- 沒有 paste 的 11 支走 Champions 同一套影格流程（prompt 需改 `evs.scale: "ev-252"`、太晶屬性從畫面讀）。

## 會員影片（之後）

- 判定：`videos.json` 的 `is_members_only: true`（錯誤訊息含「會員」或在「會員專屬對戰影片」播放清單）。
- 殼記錄：對 `game=="champions"` 且會員限定者，建 `teams/<id>.json`，`members: []`、`is_members_only: true`、`review_status: "needs-member-access"`、name 由標題推。可寫個小腳本批次生成（尚未寫）。
- 補資料：第一擁有者用會員帳號照 yt-dlp wiki 匯出 `cookies.txt`（無痕登入 → 開 youtube.com/robots.txt → 匯出 → 關視窗），再 `tools/yt/fetch-videos.sh <只含會員 id 的清單> $CH/raw --cookies cookies.txt --sleep-interval 8 --max-sleep-interval 15`，之後走同一條抽取流程。

## 抓取錯誤的解讀（errors.log）

- 「成為這個頻道的會員…」/「僅供…高級會員觀看」→ 會員限定，正常，`is_members_only=true`。
- 「無法播放影片 / 這部影片目前無法播放，請稍後再試」→ **暫時性錯誤**（抓取到 2026-11-08 18:00 約 55 筆），多半是速率限制。重跑 `fetch-videos.sh` 會自動重試（沒有 info.json 的都會再抓）；若重試仍失敗，把 `--sleep-interval` 調到 8~15 再跑。
- errors.log 跨次重跑會累積重複行；`build-videos.mjs` 以 id 去重。

## 待辦總表（2026-11-09 13:05 整理，接手從這裡開始）

> 分三類：**A. 要第一擁有者動手**（我做不到）、**B. 接手 session 可直接做**（有指令）、**C. 之後的方向**（要先討論）。完成一項就打勾並 commit。

### A. 需要第一擁有者

- [ ] **會員限定影片（219 隊殼）**：用會員帳號照 yt-dlp wiki 匯出 `cookies.txt`（無痕視窗登入 → 開 youtube.com/robots.txt → 匯出 → 關視窗），放到 repo 外（例如 `~/cookies-yt.txt`，**不要 commit**）。然後接手 session 跑：
  ```bash
  CH=data/channels/fiskepokemon
  jq -r '.[] | select(.is_members_only) | .id' $CH/videos.json > /tmp/member-ids.txt
  tools/yt/fetch-videos.sh /tmp/member-ids.txt $CH/raw --cookies ~/cookies-yt.txt --sleep-interval 10 --max-sleep-interval 20
  node tools/yt/build-videos.mjs $CH && node tools/yt/import-pokepaste.mjs $CH --force   # 殼會被 paste 匯入覆蓋
  ```
  沒有 paste 的會員影片再走影格流程（步驟 4~5）。
- [x] **Notion 已讀取**（2026-11-09）：欄位對照與重疊分析寫在 `research/line5-platform-backend/03-notion-migration.md` 第七節。SV 24 隊中 18 隊是 Fiske 影片（已在主表），只有 6 隊原創 + Champions 4 筆是 Notion 獨有。**D2 建議：一次性搬家 + Notion 封存**，待第一擁有者拍板。
- [x] **關閉 Ditto 雲端 routine**（2026-11-09 確認）：兩個 trigger（`trig_01SxgunyV3A44zHNRLCNiC6n`、`trig_01KApKAacVFDkbBqttMFnWom`）在兩個帳號都查不到，判定已刪除，不需處理。
- [ ] **第 2 線 Action Plan 的決策 D1~D8**（`research/line5-platform-backend/00-action-plan.md`）：Supabase vs Firebase、Notion 搬家方式、會員限定隊伍公開程度、圖片來源、何時開放投稿、i18n、Game Log 與隊伍站是否同一 SPA、battle_format 欄位。

### B. 接手 session 可直接做

- [x] **主表最後 4 支抓不到**（2026-11-09 確認為永久性，放棄）：3 支私人影片（1PwvZF-_gAI、bWN3Zr7jz4k、LM5xf-yA8uc）、1 支「已由上傳者移除」（jftZDwsxBhc）。不需再重試。
- [ ] **朱紫影格抽取的 9 隊努力值**（`extracted_by: extract-v1.3`，evs 幾乎全空）：影片後段有「努力值分配」章節（例：-OfKLGjXqEk 5:28、obqoq82GcBs 3:38），用 `prep-team-intro.mjs` 指定該章節區間抽幀再補 evs / nature。
- [ ] **複核覆蓋率**：目前 18/136 隊 reviewed。建議再做：(a) 前 3 支 Champions 隊（9REO、qFiH）依 v1.2 tags 邊界重審；(b) `_a7RrtzsMYM`（抽取者曾誤報影格混檔）；(c) 每批 pokepaste 字幕補充抽 1 隊做忠實度稽核（目前 11/104）。稽核 prompt 範本見 git log 2026-11-09 的 Agent 任務描述或複製 `teams/_review/*.review.md` 的表格格式。
- [ ] **tags 第二層（戰術分析）**：目前只標標題/字幕明說的概念（prompt 第三步「未來進階」）。可對 136 隊跑一次 LLM pass，依六隻配置 + notes 推 archetype / speed-control / core，寫到新欄位 `tags_analysis`（不要混進 `tags`），`tags_source: "analysis"`。
- [ ] **新影片增量**：Fiske 每週 1~2 支。流程：`scan-channel.mjs` → `fetch-videos.sh`（只補缺） → `build-videos.mjs` → `import-pokepaste.mjs`（朱紫）或 `prep-team-intro.mjs` + 抽取 agent（Champions） → `validate` → `merge` → commit。可寫進 `scripts/daily-routine.md` 當 Ditto 每日步驟（目前 routine 沒有這段）。
- [ ] **分類規則補強**：新影片若落入 `unknown`，加進 `category-overrides.json`；可考慮「published ≥ 2026-04-08 且標題含隊/Mega → champions/battle」規則。
- [ ] **名稱對照表擴充**：`names_zh-Hant.json` 的 `extra` 目前只補了幾顆 Mega 石與型態提示；每次驗證器出現「不在 @pkmn/dex」或查表不一致，就把正確對照加進 extra，不要只改單一隊伍檔。
- [ ] **validator 的 7 個 WARN**：皆為「隊上帶兩顆 Mega 石」刻意配置，可加 `review_notes` 關鍵字白名單讓驗證器不再提醒。
- [ ] **網站**：teams.html 已有搜尋/篩選/排序；下一步可做「寶可夢頁」（點 species 看出場隊伍、常見道具/特性，資料已在 raw species 表）與「會員待補清單」頁。更大的 Phase 1 規劃見 `research/line5-platform-backend/00-action-plan.md`。
- [ ] **RAG 線 M1 前置**：`research/line6-rag/01-pre-plan.md` 的評估集 25 題中現在可測的變多了（字幕 328 支、隊伍 136），可把「M1 可測？」欄重新標記。

### C. 之後的方向（先討論再做）

- [ ] 其他頻道：同一套工具只要換 handle（`scan-channel.mjs @xxx`）；但隊伍介紹段的畫面與 pokepaste 習慣因頻道而異，抽取 prompt 需要針對新頻道試跑一支再調。
- [ ] 官方比賽解說影片（90 支）：裡面有賽事隊伍（OTS），是另一種實體（選手的賽事隊伍而非創作者介紹隊），要不要納入、schema 怎麼標 `source: tournament`。
- [ ] 直播與週末盃（51 + 39 支）：隊伍資訊零散，價值低，暫不處理。
- [ ] Game Log 原型（app/）自 6 月後未動；與隊伍資料站整合見第 2 線 D7。

### 已完成（供查證）

- [x] 2026-11-09：Champions 不早於 2026-04-08、專訪→chat 分類規則；95 支 unknown 人工覆蓋。
- [x] 2026-11-09：RAG 語料清單數字更新；Reg G 2025 再登場補進參照表；分型特性英文名回填；author 正規化與主表回填。
