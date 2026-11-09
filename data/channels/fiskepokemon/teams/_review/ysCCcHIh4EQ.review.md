# Review — ysCCcHIh4EQ（Mega 雷丘 X 電氣場地電龍隊）

- Extractor 檔：`data/channels/fiskepokemon/teams/ysCCcHIh4EQ.json`（`claude-fable-5.1/extract-v1.2`）
- Reviewer 獨立檔：`teams/_review/ysCCcHIh4EQ.reviewer.json`（`fable-5.1/review-v1`；先不看 extractor 檔獨立抽取，再比對）
- 素材：字幕切片 0:00–10:19；影格 f_001–f_077。隊伍表影格（reviewer 自行定位）：
  - 能力頁：**f_055–f_061**（六隻完整，左欄 slot 1/3/5、右欄 2/4/6；f_056 與 f_061 交叉確認 slot 5/6 第四招未被字幕遮住）
  - 狀態頁：**f_062**（六隻數值 + 能力點 + ▲▽）
  - 投影片：f_002（Mega 雷丘 X 特性電氣製造者）、f_027（電龍種族值 90/75/85/115/90/55）、f_042（芳香幕）、f_051（適應力）、f_063–f_066（選出）、f_067–f_074（弱點）、f_075–f_077（評分 1.5/1.5/3.5/2）
- 規則：標題無括號代碼、字幕未明說；發布日 2026-08-15 落在 M-B（6/17–9/9）→ `champions-m-b` / `date-inferred`，雙方一致。

## 1. 欄位比對表（機械 diff，182 項）

| 欄位 | 比對數 | 一致 | 不一致 | 備註 |
|---|---|---|---|---|
| species name_zh / name_en / form / dex_no | 24 | 24 | 0 | 雷丘 `Raichu-Mega-X` / `Mega-X`（@pkmn/dex 已有此 id） |
| nickname | 6 | 6 | 0 | 來世做不服輸 / 雷丘Y / 可靠的杯子 / 海馬Boy / 尬電 / 屠龍勇士 |
| gender | 6 | 5→6 | 1→0 | 來悲粗茶：reviewer 初版 null，extractor `N`；schema enum 有 `N`，**extractor 正確** |
| ability zh+en | 12 | 12 | 0 | 雷丘畫面顯示原形特性避雷針；Mega 後電氣製造者寫在 role_note ✓ |
| item zh+en | 12 | 12 | 0 | 雷丘進化石 X → `Raichunite X`（names 表無此條，雙方皆用 dex 知識、confidence 0.85；dex 查得存在） |
| nature zh+en（依 ▲▽） | 12 | 12 | 0 | 勇敢 / 固執 / 冷靜 ×4 |
| mega | 6 | 6 | 0 | 只有 slot 2 雷丘 `true` |
| evs（6×6）+ scale | 42 | 42 | 0 | 六隻總和皆 66（含 29/5/32、30/31/5 的非整點配置） |
| stats（6×6） | 36 | 36 | 0 | 36/36 以 Lv.50 公式驗算吻合（§2） |
| moves zh / en（順序不計） | 12 | 12 | 0 | |
| regulation_set_id / source | 2 | 2 | 0 | |
| author / author_source / game / is_members_only | 4 | 4 | 0 | |
| name | 1 | 0 | 1 | 措辭差異（§3-B） |
| tags | 1 | 1 | 0 | 雙方皆 `electric-terrain, trick-room, mega` |

**硬資料：180 項，初版一致 179（99.4%）；唯一不一致（gender N/null）為 reviewer 錯。最終 extractor 硬資料錯誤數：0。**
含軟欄位 182 項：最終一致 181（99.5%），餘 1 項（name）為措辭差異。

## 2. 能力點驗算（六隻全做，`@pkmn/dex` 種族值）

| slot | 寶可夢 | 種族值 | 能力點 hp/atk/def/spa/spd/spe | 性格 | 計算 | 畫面 f_062 | 結果 |
|---|---|---|---|---|---|---|---|
| 1 | 好勝毛蟹 | 97/132/77/62/67/43 | 32/32/2/0/0/0 | 勇敢 | 204/202/99/82/87/56 | 同 | 吻合 |
| 2 | 雷丘（原形） | 60/90/55/90/80/110 | 32/32/2/0/0/0 | 固執 | 167/156/77/99/100/130 | 同 | 吻合 |
| 3 | 來悲粗茶 | 71/60/106/121/80/70 | 32/0/2/32/0/0 | 冷靜 | 178/80/128/190/100/81 | 同 | 吻合 |
| 4 | 毒藻龍 | 65/75/90/97/123/44 | 29/0/5/32/0/0 | 冷靜 | 169/95/115/163/143/57 | 同 | 吻合 |
| 5 | 電龍 | 90/75/85/115/90/55 | 32/0/2/32/0/0 | 冷靜 | 197/95/107/183/110/67 | 同 | 吻合 |
| 6 | 芳香精 | 101/72/72/99/89/29 | 30/0/0/31/5/0 | 冷靜 | 206/92/92/165/114/44 | 同 | 吻合 |

毒藻龍 HP 29 點（EV 228 → +57）、芳香精 HP 30 / 特攻 31 / 特防 5 這類非整點配置也全部吻合，可排除點數讀錯。字幕交叉：芳香精「加特防」（5:00）對應特防 5 點 ✓；來悲粗茶「加滿特攻」（5:53）對應特攻 32 ✓；雷丘「低速空間」速度 0 點 ✓。

## 3. 不一致明細與裁決

### A. 來悲粗茶 gender（slot 3）
- extractor `N`；reviewer 初版 `null`。f_056 暱稱旁無 ♂/♀ 圖示（只有草/幽靈屬性圖示），來悲粗茶為無性別；schema enum 含 `N`。**裁決：extractor 正確**；reviewer.json 已修正。

### B. name
- extractor「Mega 雷丘 X 電氣場地電龍隊」vs reviewer「Mega 雷丘 X 電力上升空間隊」。標題為「Mega 雷丘 X 讓電龍打出全遊戲最高電系輸出」、字幕 0:00「雷丘的電力上升隊」。兩者皆合理；extractor 版本點出電龍，reviewer 版本點出空間。非錯誤，保留 extractor。

### C. notes / stats_note / role_note 準確度抽查（extractor）
核對 16 項陳述：X 開電氣場地、伏特攻擊比 Y 電磁炮高 14%（0:11–0:17）、三個缺點（0:37–0:48）、電力上升 70→140 再 +30%（1:25–1:32）、低速空間雷丘像袋獸（2:44–3:03）、隊友不能 Mega（3:07）、電龍扣除 Mega 後特攻第一（3:29）、電力上升剛好秒滿 HP 仆斬將軍（3:57）、芳香精接氣象球/分散熱風擊中要害、月亮之力 110–130%（5:00–5:17）、芳香幕防挑釁/再來一次（5:27–5:34）、來悲粗茶剋巨沼怪、不怕擊掌（5:50–6:06）、好勝毛蟹免疫威嚇比 Mega 強（6:20–6:22）、達人帶岩崩 = 生命寶珠烈咬陸鯊（6:31）、污泥炸彈秒 28 HP 仙布/花葉蒂、流星群秒 32 HP 鋁鋼橋龍（6:44–6:55）、真氣彈可換守住（7:47–7:55）、十萬伏特打電飛行/飄浮（7:57）、選出四種（8:18–8:47）、弱點避雷針/精神薄霧場地/擊掌（8:50–9:41）、評分 1.5/1.5/3.5/2（f_075）。**全部有據，無杜撰。**
- 小提醒：`@pkmn/dex` 內 `Raichu-Mega-X` 的特性是 `Surge Surfer`，與影片/投影片 f_002 的「電氣製造者 Electric Surge」不符（dex 資料過時）；extractor 以畫面為準寫在 role_note，處理正確。

## 4. 系統性錯誤疑慮

1. **gender `N` vs `null`**：與 rZtdoPktkLg 相同，reviewer 對無性別填 null；prompt 未明寫。建議補「無性別圖示 → N」。
2. `雷丘進化石 X` 不在 `names_zh-Hant.json`（`extra.items_zh2en` 只有三顆 Z 石），雙方皆靠 dex 知識填 `Raichunite X`；建議把 M-B 新增的 Mega 石（含雷丘 X/Y）補進 `extra`。
3. 本影片 extractor 無任何錯誤；唯一不一致在 reviewer 端。

## 5. 結論與處置

- extractor 六隻硬資料 **全部正確**（180/180），36 項數值驗算吻合，tags 與 v1.2 邊界一致，notes 與字幕一致。
- 未修改任何資料欄位；僅把 `review_status` 改為 `reviewed`、填 `review_notes`。
- `node tools/yt/validate-teams.mjs data/channels/fiskepokemon` → 0 ERR。
