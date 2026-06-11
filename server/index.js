// 本地後端：包 yt-dlp，提供「貼 YouTube URL → 取得 mp4」給前端 pipeline。
//
// ⚠ 用途與合規：此後端僅供第一擁有者在「本機」分析「自己的」對戰錄影之用。
// 下載 YouTube 影片通常違反其服務條款；請勿用於再散佈或繞過付費 / DRM。
// 詳見 research/line1-tech-feasibility/08-youtube-url-ingestion.md。
//
// 前置需求（系統需安裝）：yt-dlp 與 ffmpeg
//   brew install yt-dlp ffmpeg        # macOS
//
// 啟動：cd server && npm install && npm start   （預設 http://localhost:8787）

import express from "express";
import cors from "cors";
import { spawn } from "node:child_process";
import { mkdtempSync, createReadStream, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = process.env.PORT || 8787;
const app = express();
app.use(cors()); // 允許前端（localhost dev / 部署站）呼叫

// 只接受 YouTube 網址，降低被當成任意下載代理的風險。
function isYouTubeUrl(u) {
  try {
    const h = new URL(u).hostname.replace(/^www\./, "");
    return ["youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com"].includes(h);
  } catch {
    return false;
  }
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args);
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => resolve({ code, out, err }));
    p.on("error", () => resolve({ code: -1, out, err: "spawn failed" }));
  });
}

app.get("/api/health", async (_req, res) => {
  const { code, out } = await run("yt-dlp", ["--version"]);
  res.json({ ok: code === 0, ytdlp: code === 0 ? out.trim() : null });
});

// GET /api/fetch?url=...&start=SEC&end=SEC
// 下載成 mp4 (H.264/AAC，最相容於 <video>+canvas)，可選時間區段，串回前端。
app.get("/api/fetch", async (req, res) => {
  const { url, start, end } = req.query;
  if (!url || !isYouTubeUrl(String(url))) {
    return res.status(400).json({ error: "需要合法的 YouTube url" });
  }

  const dir = mkdtempSync(join(tmpdir(), "vgc-yt-"));
  const outTpl = join(dir, "video.%(ext)s");
  const args = [
    "-f",
    "bv*[ext=mp4][vcodec^=avc1]+ba[ext=m4a]/b[ext=mp4]/b",
    "--merge-output-format",
    "mp4",
    "-o",
    outTpl,
  ];
  // 時間區段下載（需 ffmpeg）：大幅縮小檔案 / 記憶體
  if (start != null && end != null && String(start) !== "" && String(end) !== "") {
    args.push("--download-sections", `*${Number(start)}-${Number(end)}`);
  }
  args.push(String(url));

  const cleanup = () => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  };

  const { code, err } = await run("yt-dlp", args);
  if (code !== 0) {
    cleanup();
    return res.status(500).json({ error: "yt-dlp 失敗", detail: err.slice(-800) });
  }

  const files = readdirSync(dir).filter((f) => f.endsWith(".mp4"));
  if (!files.length) {
    cleanup();
    return res.status(500).json({ error: "找不到輸出的 mp4（可能格式合併失敗，確認已安裝 ffmpeg）" });
  }

  const filePath = join(dir, files[0]);
  res.setHeader("Content-Type", "video/mp4");
  const stream = createReadStream(filePath);
  stream.pipe(res);
  stream.on("close", cleanup);
  res.on("close", cleanup);
});

app.listen(PORT, () => {
  console.log(`[vgc-game-log-server] listening on http://localhost:${PORT}`);
  console.log("  健康檢查：GET /api/health");
  console.log("  取得影片：GET /api/fetch?url=<youtube>&start=<sec>&end=<sec>");
});
