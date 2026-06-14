# Ditto 的「讀取影片」能力：可用 skill 與工作流

> 2026-06-14 · 起因：第一擁有者問「為什麼你沒有看影片的能力」。我去查了「讓 AI agent 讀影片」的可用 skill 與工作流，記錄於此（並寫進記憶）。所有項目皆以 WebSearch/WebFetch 查證、附來源。

## 先講清楚我的真實能力

- **靜態圖片我看得到**：Claude Code 的 `Read` 工具能讀 PNG/JPG 並視覺呈現。所以**磁碟上的截圖檔我可以直接看、分析**。
- **影片不能直接串流播放觀看**，YouTube 影像也抓不到（`WebFetch` 只回文字）。
- **橋接方式**：把影片→影格圖片（ffmpeg），或→逐字稿（字幕/Whisper），我就能「讀」。下面是可用的 skill 與工作流。

## 本機現況（2026-06-14）

- ✅ **`yt-dlp` 已安裝**：官方單檔 binary（35MB，v2026.06.09）於 `/opt/homebrew/bin/yt-dlp`。**字幕/逐字稿工作流（C）現在可用**（抓 .vtt 不需 ffmpeg；轉 .srt 才需 ffmpeg）。
- ❌ **`ffmpeg` / `ffprobe` 未安裝**：資料卷只剩 ~11GB（95% 滿），brew 完整版約 1.5GB（佔剩餘 ~13%），靜態單檔約 100MB 但屬第三方來源——**第一擁有者決定先不裝**。所以**抽幀工作流（A 的影格部分 / B）暫不可用**，待之後騰出空間或改用靜態 binary 再裝。
- 其他：`whisper` 未安裝；有 `node v20`、`python 3.14`、`pip`、Homebrew。

> 影響：在 ffmpeg 裝好前，我**還不能**從影片抽幀來看（OCR 打樣的影片路徑卡住）；但**截圖檔我已能用 `Read` 直接看**（最快路徑仍是第一擁有者丟截圖），且 yt-dlp 可先抓字幕幫「讀內容 / 學 VGC」。

---

## 工作流 A（推薦・專用 skill）：`claude-video-vision` plugin

GitHub：<https://github.com/jordanrendric/claude-video-vision>（Claude Code plugin + MCP server，「給 Claude 看影片的能力」）。

- **定位**：perception layer——把影格當圖片、音訊轉成帶時間戳的逐字稿餵給 Claude。
- **安裝**：`/plugin marketplace add https://github.com/jordanrendric/claude-video-vision`（Node MCP server 首次用 `npx` 自動安裝）。
- **相依**：Node 20+（已有）、ffmpeg（需裝）；選配 yt-dlp（YouTube）、whisper-cpp / openai-whisper（本地音訊）。
- **音訊後端**：Gemini API（免費額度 1500 req/day）／本地 Whisper（全離線）／OpenAI Whisper API。
- **用法**：`/watch-video path/to/video.mp4`、`/watch-video x.mp4 "用什麼語言？"`、`/watch-video <youtube-url> "summarize"`；會依問題自動調 fps/解析度/時間範圍。YouTube 優先抓人工字幕→自動字幕→轉錄。
- **設定**：`/setup-video-vision`，存於 `~/.claude-video-vision/config.json`。

> 這是最貼近我需求的「skill」：裝好後我能直接對影片發問。**對我們的 Game Log 打樣**：可用它把對戰影片抽幀，我直接看畫面、判讀訊息框，協助建 OCR ground-truth。

## 工作流 B（最輕量・無需 plugin）：ffmpeg 抽幀 → 我用 Read 看

不裝任何 plugin，只要 ffmpeg：

```bash
# 安裝
brew install ffmpeg
# 固定間隔抽幀（每秒 1 張）
ffmpeg -i battle.mp4 -vf fps=1 frames/f_%04d.png
# 場景變化抽關鍵幀（只在畫面明顯變化時）
ffmpeg -i battle.mp4 -vf "select='gt(scene,0.4)',showinfo" -vsync vfr frames/kf_%04d.png
# 指定時間點抽單張
ffmpeg -ss 00:01:23 -i battle.mp4 -frames:v 1 frame.png
```

接著我用 `Read` 逐張看 `frames/*.png`。**這是我此環境最直接可行、零 ToS 疑慮（對本地檔）的路**。也正好對應我們 app 的 pipeline（抽幀→關鍵影格→看內容）。

## 工作流 C（最便宜的「讀內容」）：yt-dlp 抓字幕/逐字稿

不下載影片本體，只抓字幕文字——很多影片靠逐字稿就能「讀懂」：

```bash
brew install yt-dlp
# 只下字幕（人工+自動），轉 srt，不下影片
yt-dlp --write-sub --write-auto-sub --sub-langs "en.*" --convert-subs srt --skip-download "<URL>"
```

> 合規：下載 YouTube 影片本體屬其 ToS 灰區（僅本機個人分析、不可再散佈，見 `research/line1-tech-feasibility/08`）；**抓公開字幕做閱讀**相對輕量。對「學 VGC 知識」（看創作者影片重點）這條尤其有用——呼應領域線。

## 工作流 D（其他可選 skill / MCP）

- **vidlizer**（MCP server）：ffmpeg 抽幀→送 vision LLM，回「每個場景一筆」的 flow（誰在畫面、出現什麼文字、變化是什麼），有音訊則合併語音。<https://mcpservers.org/servers/arizawan/vidlizer>
- **Claude Code Video Skills**（mcpmarket）：Video Toolkit（ffmpeg+Whisper+Gemini）、Video Frame Extractor、Video Analysis Toolkit、Forensic Video Analyzer（長片分章節）。
- **音訊轉錄**：本地 `openai-whisper` / `whisper-cpp`，或 Gemini API。

## 我的建議（給這個專案）

1. **最快可用**：裝 `ffmpeg`，走工作流 B——我就能看任何本地影片的影格，立刻能幫 OCR 打樣建 ground-truth。
2. **最完整**：裝 `claude-video-vision` plugin（工作流 A），讓我能對影片直接發問（含 YouTube + 音訊）。
3. **學 VGC**：用工作流 C 抓創作者影片字幕來吸收內容。

> 目前都還沒安裝；要不要安裝由第一擁有者決定（brew 安裝會動到系統）。記錄完成即達成本次 goal。

## 來源
- claude-video-vision：<https://github.com/jordanrendric/claude-video-vision>
- ffmpeg 抽幀/場景偵測：<https://renderio.dev/blogs/ffmpeg-extract-frames/>、<https://www.bogotobogo.com/FFMpeg/ffmpeg_thumbnails_select_scene_iframe.php>
- vidlizer MCP：<https://mcpservers.org/servers/arizawan/vidlizer>
- yt-dlp 字幕：<https://github.com/yt-dlp/yt-dlp>（`--write-auto-sub`/`--write-sub`）
- Claude Code video skills 匯整：<https://mcpmarket.com/tools/skills/video-toolkit>
