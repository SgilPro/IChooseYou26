# 隊伍抽取 prompt（extractor v1）

> 給抽取 agent 的工作說明。審查 agent 用同一份素材獨立再做一次，再比對。

## 你的任務

從一支 Fiske Pokémon 對戰影片的「隊伍介紹」段，抽出這支隊伍的六隻寶可夢與配置，寫成一個符合 `data/schema/team.schema.json`（members 用 `team_member.schema.json`）的 JSON 檔。

## 素材

- 字幕切片：`data/channels/<ch>/intro/<videoId>.zh-TW.txt`（含時間戳，是 Fiske 自己上傳的人工字幕，可信度高）
- 影格：`data/channels/<ch>/frames/<videoId>/f_NNN.jpg`（每 6 秒一張，854px 寬）。**一定要看影格**：Fiske 會切到遊戲內的隊伍表畫面，那裡有
  - 「能力」頁：每隻的暱稱、性別、特性、道具、四個招式（一頁顯示 2~3 隻，會翻頁）
  - 「狀態」頁：六隻的實際能力值（HP/攻擊/防禦/特攻/特防/速度）與右側的**能力點**（0~32 刻度，這是 Champions 的努力值顯示方式）
  - 投影片：六隻的立繪、選出組合、隊伍弱點
- 影片 metadata：`data/channels/<ch>/videos.json` 中該 id 的 title / regulation_code / published_at

## 填寫規則

1. **只寫看得到或聽得到的**。字幕沒講、畫面沒出現的欄位填 `null`，不要憑 meta 常識補（例如不要因為「風速狗通常帶威嚇」就填威嚇）。
2. **每個欄位標 source 與 confidence**：`frame`（畫面讀到）> `subtitle`（字幕講到）> `title`。兩者都有且一致 → confidence ≥ 0.95；只有一個來源 → 0.7~0.9；畫面模糊或字幕含糊 → ≤ 0.6。
3. **species**：`name_zh` 用畫面/字幕的繁中官方譯名；`name_en` 填 Pokémon Showdown / @pkmn/dex 的英文名（含型態，例如 `Arcanine`、`Basculegion-F`、`Absol-Mega`）；Mega 進化的那隻 `form` 填 `Mega`（或 `Mega-X`/`Mega-Y`/`Mega-Z`），`mega: true`。Champions M-C 有「Z-Mega」（例如阿勃梭魯 Z、路卡利歐 Z、烈咬陸鯊 Z），`form` 填 `Mega-Z`，`name_en` 填 `Absol-Mega-Z`（若 Showdown 尚無此 id 也先這樣填並降 confidence）。
4. **evs**：Champions 畫面上的能力點直接抄進 hp/atk/def/spa/spd/spe，`scale: "champions-points-32"`。不要自行換算成 252 制。`stats` 填畫面上的實際數值。字幕提到的調整理由（「速度比大狃拉慢 1」）寫進 `stats_note`。
5. **moves**：畫面上的四招優先；字幕提到但畫面沒拍到的招式也可填（source=subtitle）。保留繁中原文在 `value`，英文在 `value_en`。
6. **nature**：Champions 隊伍表不一定顯示性格；沒看到就 `null`。
7. **name**（隊名）：從標題取隊伍概念（例如標題「阿勃梭魯 Z 的火力不夠？物攻強化大隊，與天蠍王一起打出爆炸輸出！」→ name「阿勃梭魯 Z 物攻強化隊」）。`name_source: "title"`。
8. **tags**：只用 `data/ref/tags.json` 裡的 slug。第一層只依標題/隊名/字幕明說的概念（雨天、順風、空間、強化、平衡隊…），`tags_source: "title"` 或 `"subtitle"`。不要做深度戰術分析。
9. **regulation_set_id**：標題括號有 M-C → `champions-m-c`；沒有就依 published_at 落在哪個 regulation 區間（`data/ref/regulation_sets.json`）填，`regulation_source: "date-inferred"`。
10. **author**：預設 `Fiske`（`author_source: "channel"`）。字幕說這是別人的隊伍（「這隊是 XX 選手的」）才改。
11. **notes**：3~5 句摘要隊伍思路（核心、選出、弱點）。
12. **confidence（整隊）**：六隻 species 全部正確的主觀機率。
13. `review_status: "auto"`，`extracted_by: "<model>/extract-v1"`，`extracted_at` 用現在時間（ISO）。
14. 一支影片若介紹多支隊伍，輸出多個物件（id 加 `_1`、`_2`）。

## 輸出

寫到 `data/channels/<ch>/teams/<videoId>.json`，內容是 **JSON 陣列**（通常一個元素）。寫完用 `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <path>` 確認可解析。

回報：六隻的 name_zh/name_en、哪些欄位是 null、哪些影格是隊伍表（檔名），以及你不確定的地方。
