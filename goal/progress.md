# Ditto 的 Goal 處理進度

> 這是我（Ditto）自己維護的進度追蹤，用來記錄第一擁有者放在 `goal/` 的每一份 goal 檔處理到哪了。

## 命名格式（逆推自第一擁有者）

`{slug}.{YYMMDD}_{序號}.md`
- `slug`：簡短主題名
- `YYMMDD`：日期（如 260611 = 2026-06-11）
- `序號`：當日第幾份 goal

我自己的衍生檔（非 goal）放在 `goal/` 時，會用 `_` 開頭或明確命名以區別（如本檔 `progress.md`）。

## Goal 清單與狀態

### `initial_prompt.260611_1.md` — ✅ 已完成（第一輪）
原始 main-task：建立產品 + Ditto 人格 + 兩條研究線 + cron + live docs + 部署。
- ✅ Ditto 人格 / routine / skills / 反思區
- ✅ 兩條研究線產出（技術可行性 8 篇、領域學習 6 篇 + 自我對話）
- ✅ Live docs 部署：https://sgilpro.github.io/IChooseYou26/
- ✅ Game Log 工具原型部署：https://sgilpro.github.io/IChooseYou26/app/
- ✅ 雲端 routine（每日 / 每週）
- ⏳ 持續推進：OCR 真實素材打樣（待第一擁有者提供影片）

### `roi_ui_suggestion.260611_2.md` — ✅ 已完成（待第一擁有者實測回饋）
App 試用回饋 + 四項功能需求。

| # | 需求 | 狀態 | 備註 |
|---|------|------|------|
| ① | 來源支援直接貼 YouTube URL（含下載） | ✅ 完成 | 研究確認純前端不可行；做了本地 `server/`（Express + yt-dlp），前端偵測 localhost 後端後開放貼 URL，支援下載區段。需 `brew install yt-dlp ffmpeg`。 |
| ② | 時間段戳記（去頭去尾去中間） | ✅ 完成 | 可加多段 keep-ranges，只分析指定區間 |
| ③ | ROI 多塊裁切（4 塊） | ✅ 完成 | ROI 改為具名多塊（對方HP/我方HP/GameLog/特性），每塊可設 OCR / 關鍵影格；事件標記來源 ROI |
| ④ | 圖片上傳 + crop 介面抓 ROI 並匯入 | ✅ 完成 | `RegionEditor`：上傳截圖或從影片抓一格，拖曳畫框 / 拖動移動，即時套用到分析設定 |

額外：加了「最低信心」過濾（呼應你觀察到信心 >70 才精準），先濾掉低品質辨識大幅減雜訊。

**回饋筆記（來自第一擁有者試用）**：ROI 要練習抓，吃太多無效資訊會讓 OCR 變差 → 已用多塊精準 ROI + crop 介面 + 最低信心過濾三招應對。OCR 準確度仍待更多真實素材打樣。

## 更新紀錄

- 2026-06-12：收到 `roi_ui_suggestion.260611_2.md`，建立本追蹤檔。
- 2026-06-12：完成 ①②③④ 全部四項（app v0.0.2 + 新增 `server/` 後端），build 通過、後端 health/guard 驗證。研究 08（YouTube 可行性）已產出。
