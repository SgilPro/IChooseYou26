#!/usr/bin/env node
// 掃整個 YouTube 頻道的影片清單（/videos /streams /shorts + 所有播放清單），
// 產出 ids.txt 與 channel-index.json（video → tabs / playlists 對照）。
// 只用 yt-dlp --flat-playlist，不抓單支細節（那是 fetch-videos.sh 的事）。
//
// 用法：node tools/yt/scan-channel.mjs @fiskepokemon [outDir]
// 需求：yt-dlp ≥ 2026.10（鎖 lang=zh-TW 才拿得到原文標題）

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const handle = process.argv[2] || "@fiskepokemon";
const outDir = process.argv[3] || join("data", "channels", handle.replace(/^@/, ""), "raw");
mkdirSync(outDir, { recursive: true });

const EXTRACTOR_ARGS = "youtube:lang=zh-TW";

function ytFlat(url) {
  const out = execFileSync(
    "yt-dlp",
    ["--flat-playlist", "-J", "--extractor-args", EXTRACTOR_ARGS, "--no-warnings", url],
    { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }
  );
  return JSON.parse(out);
}

const base = `https://www.youtube.com/${handle}`;
const index = new Map(); // id -> record
let channelMeta = null;

function upsert(entry, { tab, playlist }) {
  if (!entry?.id || entry.ie_key === "YoutubeTab") return;
  const rec = index.get(entry.id) ?? {
    id: entry.id,
    title: entry.title ?? null,
    duration_s: entry.duration ?? null,
    tabs: [],
    playlists: [],
  };
  if (!rec.title && entry.title) rec.title = entry.title;
  if (rec.duration_s == null && entry.duration != null) rec.duration_s = entry.duration;
  if (tab && !rec.tabs.includes(tab)) rec.tabs.push(tab);
  if (playlist && !rec.playlists.includes(playlist)) rec.playlists.push(playlist);
  index.set(entry.id, rec);
}

// 1. 三個 tab
for (const tab of ["videos", "streams", "shorts"]) {
  try {
    const data = ytFlat(`${base}/${tab}`);
    if (!channelMeta) {
      channelMeta = {
        channel: data.channel ?? data.uploader ?? null,
        channel_id: data.channel_id ?? null,
        handle,
        follower_count: data.channel_follower_count ?? null,
      };
    }
    for (const e of data.entries ?? []) upsert(e, { tab });
    console.error(`[tab] ${tab}: ${data.entries?.length ?? 0}`);
  } catch (err) {
    console.error(`[tab] ${tab}: failed (${String(err.message).split("\n")[0]})`);
  }
}

// 2. 播放清單
const playlists = [];
try {
  const pl = ytFlat(`${base}/playlists`);
  for (const p of pl.entries ?? []) {
    if (!p.id) continue;
    try {
      const data = ytFlat(`https://www.youtube.com/playlist?list=${p.id}`);
      const title = data.title ?? p.title ?? p.id;
      playlists.push({ id: p.id, title, count: data.entries?.length ?? 0 });
      for (const e of data.entries ?? []) upsert(e, { playlist: title });
      console.error(`[playlist] ${title}: ${data.entries?.length ?? 0}`);
    } catch (err) {
      console.error(`[playlist] ${p.id}: failed (${String(err.message).split("\n")[0]})`);
    }
  }
} catch (err) {
  console.error(`[playlists] failed (${String(err.message).split("\n")[0]})`);
}

const records = [...index.values()];
writeFileSync(join(outDir, "channel-index.json"), JSON.stringify({
  scanned_at: new Date().toISOString(),
  channel: channelMeta,
  playlists,
  videos: records,
}, null, 2));
writeFileSync(join(outDir, "ids.txt"), records.map((r) => r.id).join("\n") + "\n");
console.error(`[done] ${records.length} unique videos → ${outDir}/channel-index.json, ids.txt`);
