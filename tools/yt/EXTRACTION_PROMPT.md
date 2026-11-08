# 隊伍抽取 prompt（extractor v1.2）

> 給抽取 agent 的工作說明。審查 agent 用同一份素材獨立再做一次，再比對。

## 你的任務

從一支 Fiske Pokémon 對戰影片的「隊伍介紹」段，抽出這支隊伍的六隻寶可夢與配置，寫成一個符合 `data/schema/team.schema.json`（members 用 `team_member.schema.json`）的 JSON 檔。

## 素材

- 字幕切片：`data/channels/<ch>/intro/<videoId>.zh-TW.txt`（含時間戳，是 Fiske 自己上傳的人工字幕，可信度高）
- 影格：`data/channels/<ch>/frames/<videoId>/f_NNN.jpg`（每 8 秒一張，1280px 寬）。**一定要看影格**：Fiske 會切到遊戲內的隊伍表畫面，那裡有
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

## 試跑學到的技巧（v1.1，來自 Xul9ZHTieLU）

- **先掃影格找隊伍表**：先快速看全部影格縮圖，鎖定「能力」頁（六隻的暱稱/特性/道具/四招）與「狀態」頁（六隻數值 + 能力點），通常在隊伍介紹段後半、連續 10~15 張。投影片（立繪、選出、弱點、評分）用來補 tags/notes。
- **小字看不清就裁切放大**：用 `sips -c <h> <w> --cropOffset <y> <x> -z <newH> <newW> f_056.jpg --out /tmp/x.jpg` 把左半/右半各放大到 ~1400px 再 Read（存到 scratchpad 的 `<videoId>/` 專屬子目錄，平行抽取時才不會互相覆蓋；不要放進 repo）。
- **slot 順序 = 遊戲隊伍表的編號順序**。
- **性格**：Champions 隊伍表不直接寫性格，但「狀態」頁能力名旁有 ▲/▽ 箭頭（例：攻擊▲ 特攻▽ = 固執）。依箭頭填 nature，`source: "frame"`、confidence 0.8，並在 `stats_note` 註明「依 ▲▽ 判讀」。無箭頭（中性性格）就 `null`。
- **能力點驗算**：Lv.50 數值 = floor((2×種族值 + 31 + floor(EV/4)) × 50/100 + 5)（HP +60 不 +5），EV = 4 + 8×(點數−1)；若能驗算吻合可把 evs.confidence 提到 0.95+。總和應為 66。
- **Mega 的特性**：隊伍表顯示的是原形特性（例：阿勃梭魯「正義之心」），Mega 後特性（例：「鋒銳」）寫進 `role_note`，ability 欄填畫面上的原形特性。
- **守住 vs 看穿**：圖示顏色一般系灰色 = 守住、格鬥系橘色 = 看穿；放大確認。
- **name_zh 用官方全名**（字幕常簡稱：金剛猩 → 轟擂金剛猩、鋁鋼龍 → 鋁鋼橋龍）。
- Z-Mega 道具 `value_en` 填 `<Species>ite Z`（例：`Absolite Z`，見 names_zh-Hant.json 的 extra），confidence ≤ 0.85。

## v1.2 新規則（來自試跑的對抗式複核：兩方一致 ≠ 正確，三個錯都出在「憑記憶填英文名」）

- **value_en / name_en 一律查表**：`data/ref/names_zh-Hant.json` 有 species / moves / items / abilities / natures 的 `zh2en`（PokeAPI 繁中官方譯名），以及 `species_aliases_zh`（簡稱 → 全名）與 `extra`（Champions 新道具）。用 `node -e 'const n=require("./data/ref/names_zh-Hant.json"); console.log(n.moves.zh2en["看穿"])'` 之類查。查不到才用自己的知識並把 confidence 降到 ≤ 0.6。
- **tags 邊界**：只標 (a) 標題/隊名出現的概念、(b) 字幕以「這是 XX 隊」「我們的 core 是 XX」明確定義的概念。單隻的工具招式（例：隊上一隻會冰凍之風）**不**標 `icy-wind`。`tags_source` 照實填。
- **Mega 驗算**：「狀態」頁顯示的是**未 Mega 的原形**數值 → 驗算用原形種族值；字幕講的速度線若是 Mega 後的數值（例：「Mega 後 188」），用 Mega/Mega-Z 種族值換算並在 `stats_note` 註明。
- **`sources.frames_used`** = 你實際用來填欄位的影格張數（不是目錄總數），並在回報裡列出隊伍表影格檔名。
- 寫完**一定跑** `node tools/yt/validate-teams.mjs data/channels/fiskepokemon`，修到自己檔案 0 ERR；WARN 逐條判斷（能力值重算不吻合 = 多半是讀錯點數或性格）。

## 輸出

寫到 `data/channels/<ch>/teams/<videoId>.json`，內容是 **JSON 陣列**（通常一個元素）。寫完用 `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <path>` 確認可解析。

回報：六隻的 name_zh/name_en、哪些欄位是 null、哪些影格是隊伍表（檔名），以及你不確定的地方。
