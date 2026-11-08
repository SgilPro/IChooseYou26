# 接手指南 — Fiske Pokémon 資料線（261108_1 第 1 線）

> 給 reset 後接手的 session（人或 Ditto）。這裡只寫「現在到哪、下一步敲什麼」；方法與理由見 `tools/yt/README.md`、`research/line4-channel-analysis/`。
> 最後更新：2026-11-08 18:00（10 隊入庫；抓取與影格準備仍在背景跑，若 session 結束請重跑步驟 1 與 4，腳本會跳過已完成的）。

## 現況（2026-11-08 17:30）

| 項目 | 狀態 | 位置 |
|---|---|---|
| 頻道清單（679 支） | ✅ | `raw/channel-index.json`、`raw/ids.txt` |
| 逐支 metadata / 字幕抓取 | 🟡 第一輪跑完：214 成功、~280 會員限定、**~187 支被 YouTube 速率限制擋下（「無法播放」）**，需用更慢速率重跑（已排 20 分鐘後自動重試一次；若仍缺，隔幾小時再 `--sleep-interval 10 --max-sleep-interval 20`） | `raw/*.info.json`、`raw/*.zh-TW.json3`、`raw/errors.log` |
| 主表 videos.json / csv | 🟡 已可產出（規則式分類），抓取完要**重跑** | `videos.json`、`videos.csv` |
| Champions 公開對戰影片（23 支）隊伍介紹段素材 | ⏳ 背景跑中（約 12/23 完成） | `intro/<id>.zh-TW.txt`、`frames/<id>/` |
| 隊伍抽取 teams/<id>.json | 🟡 **10 完成**（validate 0 ERR），其餘約 13 支公開 Champions 對戰影片待做 | `teams/*.json` |
| 對抗式複核 | 🟡 1 支做了獨立再抽取（99% 一致）；其餘靠 `validate-teams.mjs` 機械驗證（0 ERR） | `teams/_review/` |
| 合併 teams.json / csv | ✅ 已跑一次（10 隊 / 60 隻），每新增隊伍後重跑 | `teams.json`、`teams.csv` |
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

## 會員影片（之後）

- 判定：`videos.json` 的 `is_members_only: true`（錯誤訊息含「會員」或在「會員專屬對戰影片」播放清單）。
- 殼記錄：對 `game=="champions"` 且會員限定者，建 `teams/<id>.json`，`members: []`、`is_members_only: true`、`review_status: "needs-member-access"`、name 由標題推。可寫個小腳本批次生成（尚未寫）。
- 補資料：第一擁有者用會員帳號照 yt-dlp wiki 匯出 `cookies.txt`（無痕登入 → 開 youtube.com/robots.txt → 匯出 → 關視窗），再 `tools/yt/fetch-videos.sh <只含會員 id 的清單> $CH/raw --cookies cookies.txt --sleep-interval 8 --max-sleep-interval 15`，之後走同一條抽取流程。

## 抓取錯誤的解讀（errors.log）

- 「成為這個頻道的會員…」/「僅供…高級會員觀看」→ 會員限定，正常，`is_members_only=true`。
- 「無法播放影片 / 這部影片目前無法播放，請稍後再試」→ **暫時性錯誤**（抓取到 2026-11-08 18:00 約 55 筆），多半是速率限制。重跑 `fetch-videos.sh` 會自動重試（沒有 info.json 的都會再抓）；若重試仍失敗，把 `--sleep-interval` 調到 8~15 再跑。
- errors.log 跨次重跑會累積重複行；`build-videos.mjs` 以 id 去重。

## 已知待辦 / 待決定

- [ ] `build-videos.mjs` 對沒進播放清單的 ~120 支影片分類為 `unknown`；可加「published ≥ 2026-04-08 且標題像對戰 → champions/battle」規則，或用 LLM 補分類。
- [ ] tags 邊界在 v1.2 才收緊，前 3 支（Xul9 已修、9REO、qFiH）的 tags 可依 v1.2 重審。
- [ ] `teams/_a7RrtzsMYM.json` 抽取者曾誤報影格混檔（主 agent 已查明不成立），建議列入抽樣複核。
- [ ] 第 2 線的 Notion 遷移章節（`research/line5-platform-backend/03-notion-migration.md`）仍是推測，等第一擁有者在 Claude Code 跑 `/mcp` 授權 Notion 後讀取實際結構再補。
- [ ] `research/line6-rag/` 內「目前在倉庫？」的數字是抓取進行到一半時統計的，抓取完後要更新。
