# 01 · 怎麼把 YouTube 頻道的影片資料抓下來？（2026-11 方法比較與選型）

> 線 4「頻道分析」的第一份研究。目標：把 @fiskepokemon 全頻道 679 支影片的標題、章節、描述、置頂留言、字幕抓成結構化資料，供後續「影片 → 隊伍 → 對戰紀錄」分析用。

## 一句話結論

**用 yt-dlp（鎖 `lang=zh-TW`、每支睡 5–10 秒、不下載影片本體）抓公開影片；會員影片先標記、之後用一次性匯出的 cookies 補抓。** 官方 YouTube Data API、transcript 套件、MCP wrapper、Apify、瀏覽器自動化都看過，各自缺關鍵欄位或付不起成本，只當備援。

## 我們的情境與限制

- **對象**：單一頻道 @fiskepokemon（channel_id `UC7vu0iCSf9y732X3uSrbbQg`）。實測 /videos 552、/streams 99、/shorts 23，加上只出現在播放清單的影片共 **679 支**。
- **要的不是影片檔**，是 metadata：原文標題、章節（「隊伍介紹／實戰 1…」）、描述、置頂留言、手動 zh-TW 字幕。這些都是 `data/schema/video.schema.json` 的欄位。
- **會員影片**：沒有獨立的 /membership 分頁，會員限定影片就混在 /videos 裡（最近 14 支有 7 支是會員限定）；頻道另有「會員專屬對戰影片」播放清單（75 支）。
- **一次性全量 + 之後增量**，在自己的 Mac 上跑，不急（幾小時可接受），但不能讓第一擁有者的 Google 帳號出事。
- **本機環境**：yt-dlp 原本是 2026.06.09，`yt-dlp -U` 升到 2026.10.26（最新版，2026-10-26 發布）；YouTube 現在要 JS runtime，裝了 deno 2.9.8；另有 ffmpeg 9.0.2。

## 方法比較表

| 方法 | 費用 | 能拿到什麼 | 關鍵缺陷 | 適合我們嗎 |
|---|---|---|---|---|
| **yt-dlp** 2026.10.26 | 免費 | 標題／描述／章節／留言（含 `is_pinned`）／手動+自動字幕／`availability` | 需 JS runtime（Deno ≥2.3 建議，Node ≥22）；未登入約 300 支/小時；OAuth 登入已死，只能 cookies | **主力** |
| YouTube Data API v3 | 免費 10,000 單位/天 | 頻道→上傳清單→影片基本資料（各 1 單位/次） | **沒有章節欄位**（章節只是描述裡的時間戳）；`privacyStatus` 只有 public/unlisted/private，**看不出會員限定**；`captions.download` 200 單位且要有影片編輯權限；`search.list` 不會列出會員影片 | 只能當交叉驗證 |
| youtube-transcript-api 1.2.5 | 免費 | 只有字幕 | 雲端 IP 常被擋、需住宅代理；cookie 登入目前壞掉 | 不需要（yt-dlp 已含字幕） |
| MCP servers（kevinwatt/yt-dlp-mcp、kirbah/mcp-youtube、jkawamoto/mcp-youtube-transcript、eat-pray-ai/yutu） | 免費 | 同上各底層工具 | 都是 yt-dlp／Data API 的薄包裝，批次 679 支不如直接跑 CLI | 不用 |
| Apify YouTube actors | 約 US$0.5–6.5 / 千筆 | 清單、metadata、部分字幕 | 不能用會員身分登入；資料欄位不可控 | 不用 |
| 瀏覽器自動化（Playwright MCP / claude-in-chrome） | 免費 | 人眼看得到的一切，含會員影片 | 慢、脆弱；**絕不自動化 Google 登入**，只能附掛在已登入的瀏覽器 profile 上 | 最後備援 |

## 選型理由

1. **只有 yt-dlp 一次給齊所有欄位。** 章節是我們最需要的（`team_intro_range` 靠它切字幕／抽幀），Data API 根本沒有 chapters 欄位，只能自己從描述 regex 時間戳。
2. **會員限定判斷。** Data API 的 `privacyStatus` 不區分會員限定（Google 自己 issue #2648 到現在還開著）；yt-dlp 未登入抓會員影片會直接報錯，錯誤訊息就是訊號。
3. **原文標題要鎖語言。** 實測預設 yt-dlp 會回 YouTube 自動翻譯的英文標題（例：「Chronicles of Fire Emblem Engage…」），加 `--extractor-args "youtube:lang=zh-TW"` 才拿到「萬縷千絲編年史…」。這是 2026 新版才需要的事，舊版文件不會提。
4. **置頂留言。** yt-dlp 自 PR #9775（2024-05 合併）起每則留言帶 `is_pinned`；實測 L6mjmqYNkOk 的置頂留言正確抓到。作者常把 pokepaste 連結放在置頂留言，這欄很值錢。
5. **成本。** 679 支 × 每支睡 5–10 秒 ≈ 1.5–2 小時，一次做完；Data API 配額夠但欄位不夠；Apify 要錢又沒會員。

## 我們的 pipeline（對應 `tools/yt/`）

```
scan-channel.mjs ──► ids.txt + channel-index.json ──► fetch-videos.sh ──► <id>.info.json / .json3 字幕 / errors.log
   (flat-playlist)      (679 支 + tab/播放清單對照)       (逐支 -J, 不下載)
```

- **`tools/yt/scan-channel.mjs`**：對 /videos /streams /shorts 和每個播放清單跑 `yt-dlp --flat-playlist -J`，合併成 679 支的索引，記每支屬於哪些 tab、哪些播放清單。flat 模式**沒有** `upload_date`、`availability`、章節，所以只做清單。
- **`tools/yt/fetch-videos.sh`**：讀 ids.txt，跳過已有 info.json 的（可中斷重跑），`--skip-download --write-info-json --write-comments --write-subs --write-auto-subs`，留言 `comment_sort=top;max_comments=30,10,5,5`，字幕優先 zh-TW/zh-Hant，`--sleep-interval 5 --max-sleep-interval 10 --sleep-requests 1.5`，錯誤進 `errors.log` 不中斷。
- **已知陷阱**：章節標題有時仍是英文（YouTube 自動翻譯章節），所以 **保留原始 `description`**，必要時自己從描述重切章節。

## 會員影片的後續做法

**現在（未登入）**
- 抓失敗時，錯誤訊息是中文「成為這個頻道的會員，即可觀看僅限頻道會員收看的內容」（lang=zh-TW 時）或英文 "members-only"，兩種都要比對 → `is_members_only = true`、`fetch_error` 記錯誤摘要。
- 和「會員專屬對戰影片」播放清單（75 支）交叉比對：在清單內但沒報錯 → 可能已轉公開；報錯但不在清單 → 清單漏收。

**之後（第一擁有者本人是會員時補抓）**
- 照 yt-dlp wiki 的「無痕視窗」配方匯出 cookies：開無痕 → 登入 YouTube → 同一分頁開 `youtube.com/robots.txt` → 用擴充套件匯出 `cookies.txt` → **關掉無痕視窗不再打開**。原因：YouTube 會在開著的分頁輪替 cookie，匯出後若瀏覽器繼續用同一 session，cookies.txt 會失效。
- **不用 `--cookies-from-browser`**：它拿的是一般瀏覽器的 cookie，和無痕配方衝突，且共用日常 session 會提高被標記風險。wiki 明講用帳號跑 yt-dlp「有被暫時或永久停權的風險」，建議限速、只在必要時用。
- 只重跑失敗的 id：`tools/yt/fetch-videos.sh failed-ids.txt raw --cookies cookies.txt --sleep-interval 8 --max-sleep-interval 15`。
- 真的不行才用 claude-in-chrome 附掛第一擁有者已登入的 Chrome，一支一支讀（慢、手動監看）。

## 風險與對策

| 風險 | 對策 |
|---|---|
| YouTube 改版，yt-dlp 壞掉 | 固定 `yt-dlp -U` 再跑；EJS 腳本與 Deno 都要跟著更新；release 頁幾乎每月有 YouTube 修正 |
| 限速（"This content isn't available, try again later"） | 維持 5–10 秒睡眠；一小時不超過 300 支；可中斷重跑 |
| PO token / "Sign in to confirm you're not a bot" | 我們只抓 metadata 不抓串流，目前沒遇到；若出現再裝 bgutil-ytdlp-pot-provider 2.0.2（要 Node ≥22 或 Deno） |
| 帳號被標記 | 會員補抓用無痕 cookies、更長睡眠、只跑失敗 id；考慮用第一擁有者同意的獨立會員帳號 |
| 標題／章節被自動翻譯 | `lang=zh-TW` + 保留原始描述 |
| 資料用途 | 自用研究、不重新散佈影片與字幕全文；會員內容只存結構化欄位 |

## VGC 專屬：從影片到隊伍

目前**沒有現成的「影片 → 隊伍」工具**，要自己拼：
- 描述與置頂留言跑 regex `pokepast\.es/[0-9a-f]+` 取 pokepaste 連結；用 pokepastes-scraper 0.2.2（PyPI）或自己照 pokepast.es 語法（`物種 @ 道具 / Ability / EVs / Nature / - 招式`）解析；JS 端可用 @pkmn/sets 解析 Showdown 匯出格式。
- 沒有 pokepaste 的影片：隊伍介紹章節（`team_intro_range`）的字幕 + 抽幀是唯一來源。**對戰畫面的 team preview 只露物種**，招式／道具／努力值得靠隊伍介紹段落。
- RivalScope（hu-herrera）是 Pokémon Champions 的 OCR 伴隨工具，用系統 Tesseract；README 自承 OCR 準確率「尚未對真實遊戲量測」，只能參考架構，不能直接用。

## 來源

- yt-dlp releases（2026.10.26）：https://github.com/yt-dlp/yt-dlp/releases
- yt-dlp EJS（JS runtime 需求：Deno ≥2.3.0 建議、Node ≥22）：https://github.com/yt-dlp/yt-dlp/wiki/EJS
- yt-dlp PO Token Guide：https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide
- yt-dlp Extractors wiki（cookies 無痕配方、OAuth 失效、300/2000 支/小時、5–10 秒睡眠、帳號停權警告）：https://github.com/yt-dlp/yt-dlp/wiki/Extractors
- yt-dlp PR #9775（留言新格式、`is_pinned`）：https://github.com/yt-dlp/yt-dlp/pull/9775
- bgutil-ytdlp-pot-provider 2.0.2：https://pypi.org/project/bgutil-ytdlp-pot-provider/
- YouTube Data API 配額（10,000/天；list 1 單位）：https://developers.google.com/youtube/v3/determine_quota_cost
- captions.download（200 單位、需編輯權限）：https://developers.google.com/youtube/v3/docs/captions/download
- videos resource（privacyStatus 只有三值、無章節欄位）：https://developers.google.com/youtube/v3/docs/videos
- Data API 不回會員影片的 issue：https://github.com/googleapis/google-api-python-client/issues/2648
- youtube-transcript-api 1.2.5（雲端 IP 被擋、cookie 失效）：https://github.com/jdepoix/youtube-transcript-api
- Playwright MCP user profile（persistent / isolated / 附掛既有瀏覽器）：https://playwright.dev/mcp/configuration/user-profile
- pokepastes-scraper 0.2.2：https://pypi.org/project/pokepastes-scraper/
- pokepast.es 語法：https://pokepast.es/syntax.html
- @pkmn/sets：https://www.npmjs.com/package/@pkmn/sets
- RivalScope：https://github.com/hu-herrera/RivalScope
- 本機實測資料：`data/channels/fiskepokemon/raw/channel-index.json`、`errors.log`、三支 `*.info.json`（2026-11-08）
