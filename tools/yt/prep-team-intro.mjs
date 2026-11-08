#!/usr/bin/env node
// 為「隊伍抽取」準備素材：把一支影片的「隊伍介紹」章節
//   (1) zh-TW 字幕切成純文字（含時間戳）→ data/channels/<ch>/intro/<id>.zh-TW.txt（小，進版控）
//   (2) 低畫質片段抽幀 → data/channels/<ch>/frames/<id>/f_NNN.jpg（不進版控）
//
// 用法：node tools/yt/prep-team-intro.mjs data/channels/fiskepokemon <videoId> [<videoId>...]
//       node tools/yt/prep-team-intro.mjs data/channels/fiskepokemon --all-champions-battle
// 環境變數：FPS（預設 1/10）、MAX_INTRO_S（章節缺失時的預設長度，預設 480）、NO_FRAMES=1 只切字幕

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const chDir = process.argv[2];
const args = process.argv.slice(3);
if (!chDir || args.length === 0) {
  console.error("usage: prep-team-intro.mjs <channelDir> <videoId...> | --all-champions-battle");
  process.exit(1);
}
const videos = JSON.parse(readFileSync(join(chDir, "videos.json"), "utf8"));
const byId = new Map(videos.map((v) => [v.id, v]));

let ids = args;
if (args[0] === "--all-champions-battle") {
  ids = videos
    .filter((v) => v.game === "champions" && v.category === "battle" && !v.is_members_only && v.fetch_error == null)
    .map((v) => v.id);
}

const FPS = process.env.FPS || "1/6"; // 1/6 才抓得到遊戲內隊伍表翻頁（實測 1/10 會漏）
const MAX_INTRO_S = Number(process.env.MAX_INTRO_S || 480);
const introDir = join(chDir, "intro");
mkdirSync(introDir, { recursive: true });

function fmt(s) {
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

function sliceSubtitle(id, start, end) {
  const candidates = [`${id}.zh-TW.json3`, `${id}.zh-Hant.json3`, `${id}.zh.json3`];
  const file = candidates.map((f) => join(chDir, "raw", f)).find(existsSync);
  if (!file) return null;
  const lang = /\.([\w-]+)\.json3$/.exec(file)[1];
  const data = JSON.parse(readFileSync(file, "utf8"));
  const lines = [];
  for (const ev of data.events || []) {
    const t = (ev.tStartMs || 0) / 1000;
    if (t < start || t > end) continue;
    const text = (ev.segs || []).map((s) => s.utf8 || "").join("").replace(/\s+/g, " ").trim();
    if (!text) continue;
    lines.push(`[${fmt(t)}] ${text}`);
  }
  return { lang, text: lines.join("\n") };
}

function extractFrames(id, start, end) {
  const outDir = join(chDir, "frames", id);
  if (existsSync(outDir) && readdirSync(outDir).some((f) => f.startsWith("f_"))) return readdirSync(outDir).filter((f) => f.startsWith("f_")).length;
  mkdirSync(outDir, { recursive: true });
  const seg = join(outDir, "seg.mp4");
  execFileSync("yt-dlp", [
    "-q", "--no-warnings",
    "-f", "bv*[height<=480][ext=mp4]/b[height<=480]",
    "--download-sections", `*${Math.floor(start)}-${Math.ceil(end)}`,
    "--force-keyframes-at-cuts",
    "--extractor-args", "youtube:lang=zh-TW",
    "-o", seg,
    `https://www.youtube.com/watch?v=${id}`,
  ], { stdio: ["ignore", "ignore", "inherit"] });
  execFileSync("ffmpeg", ["-loglevel", "error", "-i", seg, "-vf", `fps=${FPS},scale=854:-2`, "-q:v", "3", join(outDir, "f_%03d.jpg")], { stdio: "inherit" });
  rmSync(seg, { force: true });
  return readdirSync(outDir).filter((f) => f.startsWith("f_")).length;
}

const summary = [];
for (const id of ids) {
  const v = byId.get(id);
  if (!v) { console.error(`[skip] ${id}: not in videos.json`); continue; }
  const start = v.team_intro_range?.start_s ?? 0;
  const end = v.team_intro_range?.end_s ?? Math.min(MAX_INTRO_S, v.duration_s ?? MAX_INTRO_S);
  const sub = sliceSubtitle(id, start, end);
  if (sub) {
    const header = `# ${v.title}\n# ${v.url}\n# 隊伍介紹 ${fmt(start)}–${fmt(end)} · 字幕 ${sub.lang} · regulation ${v.regulation_code ?? "?"}\n\n`;
    writeFileSync(join(introDir, `${id}.${sub.lang}.txt`), header + sub.text + "\n");
  }
  let frames = 0;
  if (process.env.NO_FRAMES !== "1") {
    try { frames = extractFrames(id, start, end); } catch (e) { console.error(`[frames] ${id} failed: ${String(e.message).split("\n")[0]}`); }
  }
  summary.push({ id, start, end, sub: sub?.lang ?? null, frames });
  console.error(`[prep] ${id} ${fmt(start)}–${fmt(end)} sub=${sub?.lang ?? "none"} frames=${frames}`);
}
writeFileSync(join(introDir, "_prep-summary.json"), JSON.stringify(summary, null, 2));
