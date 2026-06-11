# Ditto 的 Goal 處理進度

> 這是我（Ditto）自己維護的進度追蹤，用來記錄第一擁有者放在 `goal/` 的每一份 goal 檔處理到哪了。

## 命名格式（逆推自第一擁有者）

**現行格式**：`{YYMMDD}_{序號}.{slug}.md`（2026-06-12 起改版）
- `YYMMDD`：日期（如 260611 = 2026-06-11）
- `序號`：當日第幾份 goal
- `slug`：簡短主題名

> 第一擁有者把「序號」移到前面、主題移到後面，理由是讓檔案能依「日期＋序號」自然升冪排序（先發生的排前面）。
> 早期格式為 `{slug}.{YYMMDD}_{序號}.md`，已全部更名。
>
> 我自己的衍生檔（非 goal）用 `_` 開頭，讓它字母排序時排在最前面（如本檔 `_progress.md`）。

## Goal 清單與狀態

### `260611_1.initial_prompt.md` — ✅ 已完成（第一輪）
原始 main-task：建立產品 + Ditto 人格 + 兩條研究線 + cron + live docs + 部署。
- ✅ Ditto 人格 / routine / skills / 反思區
- ✅ 兩條研究線產出（技術可行性 8 篇、領域學習 6 篇 + 自我對話）
- ✅ Live docs 部署：https://sgilpro.github.io/IChooseYou26/
- ✅ Game Log 工具原型部署：https://sgilpro.github.io/IChooseYou26/app/
- ✅ 雲端 routine（每日 / 每週）
- ⏳ 持續推進：OCR 真實素材打樣（待第一擁有者提供影片）

### `260611_2.roi_ui_suggestion.md` — ✅ 已完成（待第一擁有者實測回饋）
App 試用回饋 + 四項功能需求。

| # | 需求 | 狀態 | 備註 |
|---|------|------|------|
| ① | 來源支援直接貼 YouTube URL（含下載） | ✅ 完成 | 研究確認純前端不可行；做了本地 `server/`（Express + yt-dlp），前端偵測 localhost 後端後開放貼 URL，支援下載區段。需 `brew install yt-dlp ffmpeg`。 |
| ② | 時間段戳記（去頭去尾去中間） | ✅ 完成 | 可加多段 keep-ranges，只分析指定區間 |
| ③ | ROI 多塊裁切（4 塊） | ✅ 完成 | ROI 改為具名多塊（對方HP/我方HP/GameLog/特性），每塊可設 OCR / 關鍵影格；事件標記來源 ROI |
| ④ | 圖片上傳 + crop 介面抓 ROI 並匯入 | ✅ 完成 | `RegionEditor`：上傳截圖或從影片抓一格，拖曳畫框 / 拖動移動，即時套用到分析設定 |

額外：加了「最低信心」過濾（呼應你觀察到信心 >70 才精準），先濾掉低品質辨識大幅減雜訊。

**回饋筆記（來自第一擁有者試用）**：ROI 要練習抓，吃太多無效資訊會讓 OCR 變差 → 已用多塊精準 ROI + crop 介面 + 最低信心過濾三招應對。OCR 準確度仍待更多真實素材打樣。

### `260611_3.domain_knowledge.md` — 🟡 進行中
兩塊：(A) 檔名/文件 housekeeping；(B) 定期推進 VGC 領域知識的 cron + 競品工具分析 → 未來藍圖。

| 項目 | 狀態 | 備註 |
|------|------|------|
| 逆推新命名格式、更名 goal 檔、更新相關文件 | ✅ 完成 | 新格式 `YYMMDD_序號.slug.md`；progress → `_progress.md`；已修 README / 反思引用 |
| 初次 VGC 生態盤點（平台 / 賽事 / 選手 / 創作者 / x.com / team report） | 🟡 研究中 | subagent 產出 `research/line2-domain-learning/06-current-landscape.md` 與 `07-tracking-targets.md` |
| 競品工具拆解 + 未來功能藍圖（參考清單 11 站） | 🟡 研究中 | subagent 產出 `research/line3-competitor-tools/` |
| cron/schedule 定期推進領域知識 | ⬜ 待強化 | 更新 routine 指向 watchlist（`07-tracking-targets.md`），並更新雲端 routine 提示 |

**參考工具清單**（來自第一擁有者，研究對象）：
- 繁中：bokevon.web.fc2.com、victorpoke-champions.com、fable165469.github.io/poke_champion_final.html
- 英文：Victory Road、pokedata.ovh、pkmn.help、marriland team-builder、pikalytics、serebii pokedex-champions、labmaus.net、Pokémon Showdown teambuilder

## 更新紀錄

- 2026-06-12：收到 `260611_2.roi_ui_suggestion.md`，建立本追蹤檔。
- 2026-06-12：完成 ①②③④ 全部四項（app v0.0.2 + 新增 `server/` 後端），build 通過、後端 health/guard 驗證。研究 08（YouTube 可行性）已產出。
- 2026-06-12：收到 `260611_3.domain_knowledge.md`。第一擁有者改了命名格式（序號前置）與進度檔名（`_progress.md`）；完成 housekeeping，啟動 VGC 生態盤點與競品工具拆解兩個研究，並準備強化 cron。
