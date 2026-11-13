# 接手指南 — Fiske Pokémon 資料線（261108_1 第 1 線）

> 給 reset 後接手的 session（人或 Ditto）。這裡只寫「現在到哪、下一步敲什麼」；方法與理由見 `tools/yt/README.md`、`research/line4-channel-analysis/`。
> 最後更新：2026-11-13（見下方「最新現況」；本行以後的內容為 11-09 舊版）
> 舊註：2026-11-09 12:55（複核 5 隊、unknown 清零、teams.html 搜尋篩選；主表 394/679；Champions 22 + 朱紫 104 pokepaste + 5 影格 = 131 隊有六隻，全部有 notes，97 隊標原作者；132 會員殼；抓取與影格準備仍在背景跑，若 session 結束請重跑步驟 1 與 4，腳本會跳過已完成的）。

## 最新現況（2026-11-13 夜，以此為準；下方 11-08／11-09 的表與待辦已過時）

- 隊伍 813 隊（約 4050 隻），validate 0 ERR（51 WARN 皆為 Champions 雙 Mega 提示）。賽事 28 個（`data/events/`，索引 `index.json`），賽事規格 77 支影片（`tournament-specs/`）。
- **比賽影片（官方比賽解說）**：Champions 公開 2 支（NAIC 2026 會員、世界賽 D1／決賽）＋會員 5 支（馬來西亞、韓國、日本全國賽二、世界賽二、巴爾的摩 2026）已抽；日本全國賽公開第一部（Champions `ZmCH9tKz6vE`、朱紫 2024 `P6S_SzoV26Y`、`fXy6_PqCro4`、`jlzirRzIlBg`）轉播只有小圖＋圖示，不抽（見 tools/yt/README.md）。朱紫公開 2024／2025 年比賽影片（約 60 支）**已全部抽完**。
- **朱紫轉播卡片**：物種、特性、道具、四招、太晶屬性；無性格／性別／努力值（留空）。規則組一律用 `spec.event.regulation_set_id` 覆寫（影片多半不寫，靠賽事日期＋每隊限定神獸數推論；2024 年 2–4 月＝sv-reg-f，5–8 月＝sv-reg-g，9 月後＝sv-reg-h，2025 年 1–4 月＝sv-reg-g-2025，5–8 月＝sv-reg-i）。賽事 `date_approx` 皆為估計值，未用官方資料核對。
- **會員佇列**（`/private/tmp/claude-501/tourney/m/queue.sh`／`queue2.sh`，只存在這台機器）：每支 1 次 720p 整支下載、間隔 ≥12 分鐘，cookies 檔 `~/_projects/www.youtube.com_cookies.txt`（不讀不提交）。已處理 Champions 5 支＋朱紫 qlqyk4HZGy0、19PpR0W2qk0、W2bkLeb0S5g、hDXCB1HiTRk；待處理：dLE-lpqNSIM（世界賽 2025 四，處理中）、KVDHWjf-bNk、1eZnYO-4uQ0、Liverpool 四部（lqa3EKpjQV4、x1aMTuWmXkw、AqD2a-S2cZw、By9wJ7CdTas）、A95rO0neaCg、8f3JGJd1Iy4、bxpEVZ8Q83I、gdQ_BDFyIGA。
- **磁碟**：2026-11-13 曾因 `/private/tmp` 暫存影片寫滿磁碟（ENOSPC）使下載失敗；agent 要在抽完影格後刪暫存影片。
- **會員短片 75 支**：2023 年 12 支已確認為公開影片同隊的延伸版（寫入公開隊伍 `related_video_ids`）；8 支不確定（`mHC9YuqyfmQ`、`pKmk6zGbkDY`、`g8W_4Rlkldw`、`yJ-XjMajwx4`、`145Yuis-vfM`、`blm0R8ztLH8`、`uZnip5S0vcQ`、`xULetDD2vcU`）要各抓一張影格核對。

### 待核對／待辦（整批做完後處理）

1. **Mega 特性記法不一致**：Champions 世界賽 2026 規格記 Mega 前的特性，馬來西亞／巴爾的摩 2026 記卡片顯示的特性（常是 Mega 後）。決定統一方式後整理。
2. **以預設填招式的舊規格**：前 13 支朱紫規格（iZCz6VRcsd0、7V6DLchwra0、WY016nnsTzc、LvOdelMxhnM、31xBomuvMFw、yzmlnb9mJFk、zSLmQo0E5Pg、Jg2nzPaYQ8k、3POGhTssglU、7ub0b8EM3ZY、j6ZfmcPbsLQ、QGa_yG9y518、FqKOui2soUw）的產生器把被字幕擋住的招式填成「守住」，需重看影格核對、讀不到的改成不填。
3. **局部字形判讀的招式／道具**：Wpgz1Z6YhnQ 等已改正文柚果＝Sitrus Berry；仍需抽驗的有 g3GW4KakDhA（Raging Bolt 的流星群）、m-boUrJaSqo（Nikhil 8 強的突擊背心）、jOn23r6uCq8（Yuta 的 Iron Valiant 指導）、6vwo00c7WTQ（Terapagos 晶光星群）、WY016nnsTzc 與 LvOdelMxhnM 兩份 Luca／Camporesi 太晶屬性對調。
4. **Flutter Mane 招式疑點**：qzAy1IpBwfA（Andrew Ding，十萬伏特）與 hMTNHZvP4cg／34H3YTlqnW0（冰凍之風）。
5. **道具中英對照誤配**：整批抽驗所有規格的道具中文名對照。
6. **帶推論的決賽登記**：戈亞尼亞（C84KeeY9ejs）Pedro 決賽沿用 4 強、巴爾的摩 Ywc5u4aegTM Paul Chua 決賽沿用 8 強、LA niNoUWP5410 決賽沿用 4 強——招式未逐一重驗。
7. 太晶徽章只靠圖示判讀，低信心以 `tera_conf` 標示（約 0.6–0.85）。
8. 其他 backlog（31 隊缺努力值、審核覆蓋率、RAG 評測集重標等）見最後一節，未動。

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
