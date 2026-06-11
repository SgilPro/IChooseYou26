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

### `260611_3.domain_knowledge.md` — ✅ 已完成
兩塊：(A) 檔名/文件 housekeeping；(B) 定期推進 VGC 領域知識的 cron + 競品工具分析 → 未來藍圖。

| 項目 | 狀態 | 備註 |
|------|------|------|
| 逆推新命名格式、更名 goal 檔、更新相關文件 | ✅ 完成 | 新格式 `YYMMDD_序號.slug.md`；progress → `_progress.md`；已修 README / 反思引用 |
| 初次 VGC 生態盤點（平台 / 賽事 / 選手 / 創作者 / x.com / team report） | ✅ 完成 | `06-current-landscape.md`、`07-tracking-targets.md`（附來源、信心、時效）|
| 競品工具拆解 + 未來功能藍圖（參考清單 12 站） | ✅ 完成 | `research/line3-competitor-tools/` 三篇 |
| cron/schedule 定期推進領域知識 | ✅ 完成 | daily 改輪流推進 `07-tracking-targets.md` watchlist；weekly 新增生態時效更新；雲端 routine 讀檔即生效 |
| live docs 同步（VGC 生態 / 未來藍圖兩頁）| ✅ 完成 | 已上線 |

**🔑 重大發現（已更新我過時的知識）**：VGC 正從《Scarlet/Violet》轉到專用對戰 App《**Pokémon Champions**》（2026-04-08 上線），當前 Reg M-A（Mega 回歸、禁傳說），SV Reg I 並行。
**對產品的連帶影響（待跟進）**：Champions 的對戰 UI 與 SV 不同 → Game Log 的 ROI 預設與 OCR 假設未來需要 Champions 版本；資料來源（Limitless/Smogon/Pikalytics）對 Champions 新格式的覆蓋需重新驗證。已記入 watchlist。

**競品分析結論**：「逐回合復盤」是空白市場（我們的護城河）；沒人串「復盤→行動」；繁中無 all-in-one 站。藍圖 Phase 1 時間軸疊合即時傷害 → Phase 2 meta 疊加+選用建議 → Phase 3 偵察/個人弱點/賽事趨勢，全部重用既有資料來源。

**參考工具清單**（來自第一擁有者，研究對象）：
- 繁中：bokevon.web.fc2.com、victorpoke-champions.com、fable165469.github.io/poke_champion_final.html
- 英文：Victory Road、pokedata.ovh、pkmn.help、marriland team-builder、pikalytics、serebii pokedex-champions、labmaus.net、Pokémon Showdown teambuilder

## 更新紀錄

- 2026-06-12：收到 `260611_2.roi_ui_suggestion.md`，建立本追蹤檔。
- 2026-06-12：完成 ①②③④ 全部四項（app v0.0.2 + 新增 `server/` 後端），build 通過、後端 health/guard 驗證。研究 08（YouTube 可行性）已產出。
- 2026-06-12：收到 `260611_3.domain_knowledge.md`。第一擁有者改了命名格式（序號前置）與進度檔名（`_progress.md`）；完成 housekeeping，啟動 VGC 生態盤點與競品工具拆解兩個研究，並準備強化 cron。
- 2026-06-12：兩個研究完成。VGC 生態盤點（發現平台轉換到 Pokémon Champions）、競品拆解 + 三階段未來藍圖均產出並同步進 live docs。cron routine 已強化。goal #3 完成。
