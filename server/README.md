# 本地下載後端（YouTube 來源）

讓 Game Log app 能「貼 YouTube 連結 → 直接取得影片」的本地後端。包 `yt-dlp`。

## 為什麼需要後端

純瀏覽器**無法**下載 YouTube 影片：CORS（`*.googlevideo.com` 只允許 youtube.com）、簽章且短效的串流 URL、以及 `n` 參數節流，三重阻擋。詳見 `research/line1-tech-feasibility/08-youtube-url-ingestion.md`。

可靠的做法是在**本機**跑一個小後端，用 `yt-dlp`（目前唯一維護良好、能正確處理 `n` 節流的工具）下載，再把 mp4 交給前端既有 pipeline。

## ⚠ 用途與合規

僅供第一擁有者在本機分析**自己的**對戰錄影。下載 YouTube 影片通常違反其服務條款；請勿用於再散佈或繞過付費 / DRM。

## 前置需求

```bash
brew install yt-dlp ffmpeg      # macOS（ffmpeg 用於時間區段下載與格式合併）
```

## 啟動

```bash
cd server
npm install
npm start                        # 預設 http://localhost:8787
```

啟動後，用 `npm run dev` 開啟 app（http://localhost），app 會自動偵測到後端並開放「貼 YouTube 連結」來源。

> 注意：若用**已部署的 https 網站**（github.io）去呼叫 http://localhost 後端，瀏覽器可能因 mixed-content / Private Network Access 擋下。最順的自用方式是本機 `npm run dev`。

## API

| 端點 | 說明 |
|------|------|
| `GET /api/health` | 回報 yt-dlp 是否可用與版本 |
| `GET /api/fetch?url=<youtube>&start=<sec>&end=<sec>` | 下載 mp4（H.264/AAC）。給 start/end 則只下載該區段（需 ffmpeg）。回傳 video/mp4 串流。 |

只接受 YouTube 網域的 url，降低被當成任意下載代理的風險。

## 環境變數

前端預設打 `http://localhost:8787`。要改連別的位址，建置 app 時設 `VITE_YTDLP_BACKEND`。
