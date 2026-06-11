# 08 — 貼上 YouTube URL 取得影片（YouTube URL Ingestion）

本文件評估「讓使用者貼上一個 YouTube 連結，App 就幫忙把那支影片抓下來」這個來源選項的**可行性**與**實作方案**，並給出對本專案最務實的建議。

結論先講：**純前端（client-only）做不到；唯一務實可靠的路是「使用者在自己電腦上跑一個小型本機後端，由它用 `yt-dlp` 下載」**。下面逐項說明。

---

## 1. 瀏覽器能不能在前端直接抓 YouTube 影片？— 不能

幾個彼此疊加的障礙，讓「純前端 fetch 下載 YouTube 影片」基本上走不通：

### (a) googlevideo.com 的 CORS
YouTube 真正的影片串流檔在 `*.googlevideo.com`，這些網域只允許從 `youtube.com` 發出的請求，沒有對任意第三方網域回 `Access-Control-Allow-Origin`。從我們部署在 GitHub Pages 的網頁用 `fetch()` / `XMLHttpRequest` 去拉，會直接被瀏覽器的 CORS 政策擋下。([How They Bypass YouTube Video Download Throttling — 0x7D0](https://blog.0x7d0.dev/history/how-they-bypass-youtube-video-download-throttling/)、[ytdl-core discussion #1045](https://github.com/fent/node-ytdl-core/discussions/1045))

> 這也是 01-video-ingestion.md 已經點出的「tainted canvas」問題的延伸：就算硬塞進 `<video>`，跨域內容會污染 canvas，`getImageData / toBlob` 全被封鎖；而 YouTube 不會為你開 CORS。

### (b) 串流網址是簽名且短效的（signed / expiring URLs）
googlevideo 的播放網址帶有簽名參數與到期時間，且要先解析 YouTube 播放頁 / `player` 回應裡那段**混淆過、會頻繁更動的 base.js**才能組出來。前端要自己重現這套解析邏輯，維護成本極高。([How They Bypass — 0x7D0](https://blog.0x7d0.dev/history/how-they-bypass-youtube-video-download-throttling/))

### (c) `n` 參數節流（throttling）
自 2021 年中起，YouTube 在多數影片網址加入查詢參數 `n`，必須用 base.js 裡一段 JavaScript 演算法把它**轉換**過再帶上去；這是用來驗證下載者是不是「官方客戶端」的挑戰題。**若沒解對 `n`，YouTube 不會報錯，而是默默把下載速度節流到 ~50–100 KB/s 等級**，慢到不可用。這段演算法被刻意混淆且常改版，逆向不切實際。([youtube-dl issue #30976 — n-parameter throttled](https://github.com/ytdl-org/youtube-dl/issues/30976)、[youtube-dl #29263 — throttled to ~1.16 MByte/s](https://github.com/ytdl-org/youtube-dl/issues/29263)、[How They Bypass — 0x7D0](https://blog.0x7d0.dev/history/how-they-bypass-youtube-video-download-throttling/))

**小結**：CORS（拿不到串流）＋ 簽名短效網址（要跑 base.js）＋ `n` 節流（要解混淆演算法）三重夾擊，純瀏覽器端**做不到**穩定下載。所有能用的方案，背後都靠一個非瀏覽器環境（後端／CLI）來解這些東西。

---

## 2. 真正可行的選項與取捨

### 選項 A：使用者自己在本機跑的後端（Node 或 Python）— ✅ 推薦
由使用者在自己電腦上啟一個小服務，前端打 `http://localhost:PORT/api/fetch?url=...`，後端用下列工具之一去抓，再把 mp4 回傳給瀏覽器。

各工具現況（截至近期）：

| 工具 | 語言 | 現況可靠度 |
|---|---|---|
| **`yt-dlp`** | Python（CLI） | 🟢 **最穩**。社群活躍維護、內建處理 `n` 參數的 JS 直譯器、格式選擇強；已取代 youtube-dl 進主流 Linux 發行版。([yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp)、[youtube-dl Wikipedia](https://en.wikipedia.org/wiki/Youtube-dl)) |
| `ytdl-core`（原版 `fent/node-ytdl-core`） | Node | 🔴 **不要用**。原作者自 2023-07 起暫停維護、PR 不再合併，YouTube 一改就壞。([ytdl-core npm](https://www.npmjs.com/package/ytdl-core)、[fent/node-ytdl-core](https://github.com/fent/node-ytdl-core)) |
| `@distube/ytdl-core` | Node | 🟡 比原版活躍，是社群快速修 bug 的 fork，但仍是「追著 YouTube 改版跑」，會週期性壞掉。([distubejs/ytdl-core](https://github.com/distubejs/ytdl-core)) |
| `@ybd-project/ytdl-core` | Node | 🟡 另一個較新的 fork，主打快/穩，同樣有追版維護風險。([@ybd-project/ytdl-core npm](https://www.npmjs.com/package/@ybd-project/ytdl-core)) |
| `play-dl` | Node | 🟡 純 JS 方案，曾是 ytdl-core 的替代，但同樣受 YouTube 改版影響。 |
| `ytdlp-nodejs` | Node | 🟢（間接）本質是 **`yt-dlp` 的 Node wrapper**，等於借 yt-dlp 的可靠度，並給 TypeScript 介面。([ytdlp-nodejs GitHub](https://github.com/iqbal-rashed/ytdlp-nodejs)) |

**判斷**：純 JS 的 ytdl 系列都在跟 YouTube 打地鼠，會三不五時壞。要穩，就直接或間接用 **`yt-dlp`**（CLI，或用 `ytdlp-nodejs` 之類的 wrapper 包起來）。

前端怎麼呼叫：一個 `/api/fetch?url=<youtube>` 端點，後端跑 yt-dlp 下載成本機暫存 mp4，再把檔案內容串流回應給瀏覽器（`Content-Type: video/mp4`）。瀏覽器把 response 變成 `Blob` → `File`，丟進現有 pipeline（見第 4 節）。

### 選項 B：你架的雲端後端 — ⚠️ 不建議（法律/營運風險高）
把同樣的下載服務架在你自己的伺服器上對所有使用者開放，會踩到：
- **YouTube ToS**：用自動化工具存取/下載內容、且對外提供，明確違反條款（見第 3 節），有帳號/法律風險。([YouTube Terms of Service](https://www.youtube.com/static?template=terms))
- **IP 封鎖**：機房 IP 大量抓取很快會被 YouTube 風控擋（403 / 要求登入驗證），需要 cookies、代理輪替等，維運成本與灰色程度都飆高。([yt-dlp issue #11622 — HTTP 403 Forbidden](https://github.com/yt-dlp/yt-dlp/issues/11622))
- **頻寬/規模成本**：影片下載很吃流量與磁碟。

對一個個人取向、部署在 GitHub Pages 的工具，這條路不划算也不安全。**誠實地說：不要做雲端代抓。**

### 選項 C：對「正在播放的 YouTube 分頁」做螢幕擷取（getDisplayMedia）— 🟡 免下載的替代方案
使用者在瀏覽器分頁播 YouTube，我們用 `getDisplayMedia()` 請他分享那個分頁，截到的是**顯示出來的像素**，繞過 CORS/taint。([MDN getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia))

- 一般 YouTube 影片**不套 HDCP**（除了部分 Premium 離線內容），所以擷取通常不會變黑畫面（不像 Netflix）。([web.dev screen-record](https://web.dev/patterns/media/screen-record))
- 缺點：須**即時播完整段**（無法快進抽影格、1 小時影片就得錄 1 小時）、畫面含播放器 UI 雜訊、解析度受視窗大小限制、每次都要使用者手動選來源。
- 這其實就是 01 文件已列的 v1.5 路線，與「貼 URL 自動抓」的便利目標不同——它不是下載，是錄螢幕。

---

## 3. 法律 / 服務條款（ToS）考量

**直白講：用第三方工具下載 YouTube 影片，普遍違反 YouTube 服務條款。** 條款「Permissions and Restrictions」明訂，未經授權不得「存取、重製、下載……或以任何其他方式使用本服務的任何部分或任何內容」，也禁止「以任何自動化工具（如機器人、網路爬蟲）存取服務」。只有在 YouTube 自己顯示下載按鈕（或透過 YouTube Premium、YouTube Studio、Google Takeout）時才屬授權下載。([YouTube Terms of Service](https://www.youtube.com/static?template=terms)、[YouTube 下載條款說明 — TLDRLegal](https://www.tldrlegal.com/license/youtube-terms-of-service))

務必區分兩種情境：
- **使用者下載「自己的對戰錄影」做私人分析（復盤）**：實務上風險最低的場景——若影片是使用者自己上傳/擁有版權的內容，他本就能用 YouTube Studio 取回原檔，本工具只是便利。仍屬 ToS 灰區，但傷害面小、不涉散布。
- **再散布 / 公開重製他人影片**：明確不可，版權風險高。

界線：**本工具的定位應是「使用者為自己的私人分析、在自己機器上、自負責任地跑的工具」，而非代下載服務。** 不協助破解付費牆或 DRM（這也是為什麼第 2 節 C 不嘗試繞 HDCP）。把選擇與責任留在使用者端（本機後端、需自行安裝 yt-dlp），是最乾淨的設計與法律姿態。

---

## 4. 對本專案的具體建議：最簡單可靠的路

**結論：做一個極小的本機 Node/Express 後端，包一層 `yt-dlp`，使用者自己在本機跑；部署在 GitHub Pages 的靜態 App 偵測到 `http://localhost:PORT` 在線時，才顯示「貼 YouTube URL」這個來源選項。** 抓到的 mp4 餵進現有 pipeline（`app/src/pipeline/frames.ts` 的 `loadVideo(file)` 已經吃 `File` → `URL.createObjectURL` → `<video>` seek → canvas，完全相容）。

為什麼是本機而非雲端：把 ToS 風險、IP 封鎖、頻寬成本全留在使用者自己環境，符合第 3 節「自用工具」定位；且 GitHub Pages 是純靜態，本就不能跑後端。

關鍵設計點：
- **格式**：強制要 **mp4 / H.264（avc1）+ AAC**，這是 `<video>` + canvas 最保險能解的組合；別讓它抓到 VP9/AV1/Opus 的 webm，否則某些瀏覽器讀不到、`onerror` 觸發（見現有 `frames.ts` 的錯誤訊息）。
- **時間範圍下載**：yt-dlp 支援 `--download-sections "*START-END"`（`*` 前綴代表時間範圍而非章節，需要 ffmpeg），可直接呼應本 App 規劃中的 trim 功能——使用者只想分析第 3 分到第 8 分，就只抓那段，省時省流量。([yt-dlp Arch man page](https://man.archlinux.org/man/extra/yt-dlp/yt-dlp.1.en)、[yt-dlp issue #11124 — start/end time](https://github.com/yt-dlp/yt-dlp/issues/11124))
- **回傳方式**：後端下載到暫存檔後，把整個 mp4 串流回前端（最簡單）；前端 `await res.blob()` → 包成 `File` 丟進 pipeline。
- **CORS**：本機後端必須回 `Access-Control-Allow-Origin`（針對 GitHub Pages 來源，或開發時 `*`），否則部署版網頁打 `localhost` 一樣被擋。

---

## 建議的 MVP 做法

> 前提：使用者需自行安裝 `yt-dlp` 與 `ffmpeg`（README 寫明），並啟動本機後端。屬「自用工具」。

### (1) yt-dlp 指令

下載整支、強制 mp4 / H.264 / AAC（瀏覽器最相容）：

```bash
yt-dlp \
  -f "bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/b[ext=mp4]/b" \
  --merge-output-format mp4 \
  --recode-video mp4 \
  -o "out.mp4" \
  "https://www.youtube.com/watch?v=XXXX"
```

只抓某時間區間（對應 trim 功能；需要 ffmpeg）：

```bash
yt-dlp \
  -f "bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/b[ext=mp4]" \
  --download-sections "*00:03:00-00:08:00" \
  --merge-output-format mp4 \
  -o "out.mp4" \
  "https://www.youtube.com/watch?v=XXXX"
```
（`*` 前綴＝時間範圍；可多次給 `--download-sections` 抓多段。([yt-dlp Arch man page](https://man.archlinux.org/man/extra/yt-dlp/yt-dlp.1.en))）

### (2) 最小 Express 端點

```js
// server.mjs — 使用者本機執行：node server.mjs
import express from "express";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const app = express();
const PORT = 8787;
const ALLOW_ORIGIN = "*"; // 或鎖定你的 GitHub Pages 來源

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  next();
});

// GET /api/fetch?url=...&start=00:03:00&end=00:08:00
app.get("/api/fetch", (req, res) => {
  const { url, start, end } = req.query;
  if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url ?? "")) {
    return res.status(400).json({ error: "invalid youtube url" });
  }
  const out = path.join(os.tmpdir(), `${randomUUID()}.mp4`);
  const args = [
    "-f", "bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/b[ext=mp4]/b",
    "--merge-output-format", "mp4",
    "-o", out,
  ];
  if (start && end) args.push("--download-sections", `*${start}-${end}`);
  args.push(url);

  const dl = spawn("yt-dlp", args);
  dl.stderr.on("data", (d) => process.stderr.write(d)); // 進度/錯誤
  dl.on("close", (code) => {
    if (code !== 0) return res.status(502).json({ error: "yt-dlp failed" });
    res.setHeader("Content-Type", "video/mp4");
    const stream = createReadStream(out);
    stream.pipe(res);
    stream.on("close", () => unlink(out).catch(() => {}));
  });
});

app.listen(PORT, () => console.log(`local fetch backend on http://localhost:${PORT}`));
```

> 進階：可改成回 SSE/JSON 進度，下載完再給檔；或把 mp4 存成可 `Range` 取的靜態檔。MVP 先一次性串回整檔即可。

### (3) 前端 fetch（接回現有 pipeline）

```ts
const LOCAL_BACKEND = "http://localhost:8787";

async function fetchFromYouTube(url: string, start?: string, end?: string): Promise<File> {
  const qs = new URLSearchParams({ url, ...(start && end ? { start, end } : {}) });
  const res = await fetch(`${LOCAL_BACKEND}/api/fetch?${qs}`);
  if (!res.ok) throw new Error(`下載失敗：${res.status}`);
  const blob = await res.blob(); // video/mp4
  return new File([blob], "youtube.mp4", { type: "video/mp4" });
}

// 偵測本機後端是否在線，決定要不要顯示「貼 YouTube URL」選項
async function backendAvailable(): Promise<boolean> {
  try {
    const r = await fetch(`${LOCAL_BACKEND}/api/fetch?url=ping`, { method: "GET" });
    return r.status === 400; // 後端在跑、只是 url 無效 → 視為可用
  } catch { return false; }
}
```

拿到的 `File` 直接走現有流程：`App.tsx` 的 `setFile(file)` → `loadVideo(file)`（`app/src/pipeline/frames.ts`）→ seek + canvas 截圖 → OCR。**無需改動 pipeline 本體**，只是多一個「來源 = YouTube URL」的入口。

---

## 5. 實務地雷（Gotchas）

- **codec 相容性**：`<video>` + canvas 在所有瀏覽器最保險的是 **mp4 / H.264 + AAC**。不要拿到 VP9/AV1/Opus 的 .webm，Safari 等可能解不出來，會觸發 `frames.ts` 的「無法載入影片」錯誤。指令裡用 `vcodec^=avc1` 並 `--merge-output-format mp4` 確保。
- **檔案大小**：完整對戰影片可能數百 MB～GB，整檔串回再 `blob()` 會吃記憶體。**強烈建議預設只抓使用者要分析的時間區間**（`--download-sections`），既快又省記憶體，正好對接 trim 功能。
- **CORS header**：本機後端**一定要**回 `Access-Control-Allow-Origin`，否則部署在 `https://<user>.github.io` 的網頁打 `http://localhost` 會被擋。注意這是 https 網頁打 http localhost——現代瀏覽器多半允許對 `localhost` 的 mixed/private-network 請求，但建議實測，必要時走 `127.0.0.1` 並處理 Private Network Access 預檢。
- **完整檔 vs Range**：MVP 一次串回整段（簡單）即可；若要邊抓邊播放/抽影格，再進化成支援 HTTP `Range` 的靜態檔服務或邊下邊回的串流。
- **依賴安裝門檻**：使用者得自己裝 `yt-dlp` + `ffmpeg` 並啟後端，這是「便利 vs. 零安裝」的取捨。值得在 UI 明示「此功能需本機輔助程式」。
- **可靠度維運**：YouTube 改版會偶爾打到 yt-dlp，但社群通常很快出新版——提醒使用者 `pip install -U yt-dlp` / `yt-dlp -U` 保持更新即可，遠比自己維護 ytdl-core fork 省心。

---

## 誠實的最終判定（Verdict）

- **純前端貼 URL 直接下載：不可行**（CORS + 簽名短效網址 + `n` 節流）。
- **你架雲端代抓：技術可行但 ToS / IP 封鎖 / 成本風險高，不建議。**
- **務實且推薦：本機跑 `yt-dlp` 小後端，靜態 App 偵測在線才開啟此來源**；強制 mp4/H.264、預設只抓時間區間（接 trim），拿到的 mp4 直接餵進既有 `loadVideo` pipeline，零侵入。
- **法律姿態**：定位為「使用者為自己的私人分析、在自己機器上自負責任跑的工具」，不做代下載服務、不碰 DRM/付費牆。

---

## 資料來源
- https://blog.0x7d0.dev/history/how-they-bypass-youtube-video-download-throttling/
- https://github.com/ytdl-org/youtube-dl/issues/30976
- https://github.com/ytdl-org/youtube-dl/issues/29263
- https://github.com/fent/node-ytdl-core/discussions/1045
- https://github.com/yt-dlp/yt-dlp
- https://en.wikipedia.org/wiki/Youtube-dl
- https://www.npmjs.com/package/ytdl-core
- https://github.com/fent/node-ytdl-core
- https://github.com/distubejs/ytdl-core
- https://www.npmjs.com/package/@ybd-project/ytdl-core
- https://github.com/iqbal-rashed/ytdlp-nodejs
- https://github.com/yt-dlp/yt-dlp/issues/11622
- https://man.archlinux.org/man/extra/yt-dlp/yt-dlp.1.en
- https://github.com/yt-dlp/yt-dlp/issues/11124
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
- https://web.dev/patterns/media/screen-record
- https://www.youtube.com/static?template=terms
- https://www.tldrlegal.com/license/youtube-terms-of-service
