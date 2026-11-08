#!/usr/bin/env node
// 把 raw/（channel-index.json + 每支 *.info.json + errors.log）整理成主表 videos.json / videos.csv。
// 規則式分類（category / game / regulation_code / team_intro_range / is_members_only），不呼叫模型。
//
// 用法：node tools/yt/build-videos.mjs data/channels/fiskepokemon

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const chDir = process.argv[2] || join("data", "channels", "fiskepokemon");
const raw = join(chDir, "raw");
const index = JSON.parse(readFileSync(join(raw, "channel-index.json"), "utf8"));
const errorsLog = existsSync(join(raw, "errors.log")) ? readFileSync(join(raw, "errors.log"), "utf8") : "";

// errors.log → id → 錯誤摘要
const errById = new Map();
for (const line of errorsLog.split("\n")) {
  const m = /\[youtube\] ([\w-]{11}): (.*)$/.exec(line);
  if (m) errById.set(m[1], m[2].trim());
}

const MEMBERS_PL = "會員專屬對戰影片";
const PL_CATEGORY = [
  ["寶可夢官方比賽解說", "official-commentary"],
  ["對戰新手入門", "tutorial"],
  ["寶可夢全解析", "tutorial"],
  ["寶可夢對戰 直播精華", "stream-highlight"],
  ["Fiske 週末盃", "battle"],
  ["寶可夢 Champions", "battle"],
  ["寶可夢對戰", "battle"],
  ["會員專屬對戰影片", "battle"],
  ["閒聊", "chat"],
  ["火焰紋章 Fire Emblem", "other-game"],
  ["寶可夢 Pokopia", "other-game"],
  ["寶可夢火紅葉綠", "other-game"],
  ["寶可夢傳說 Z-A", "other-game"],
  ["PTCG Pocket", "other-game"],
  ["寶可夢不可思議迷宮", "other-game"],
  ["寶可夢朱紫 DLC 劇情流程", "other-game"],
];

function classify(rec, info) {
  const title = rec.title || info?.title || "";
  const pls = rec.playlists || [];
  if (rec.tabs?.includes("shorts")) return "short";
  const isStream = rec.tabs?.includes("streams");
  for (const [pl, cat] of PL_CATEGORY) {
    if (!pls.includes(pl)) continue;
    // 直播存檔（3~4 小時的週末盃/會員直播）不是「隊伍介紹 + 實戰」的對戰影片，歸 stream；閒聊/其他遊戲照清單
    if (isStream && cat === "battle") return "stream";
    return cat;
  }
  if (isStream) return "stream";
  if (/官方比賽|世界賽|Regional|Worlds|解說/.test(title)) return "official-commentary";
  if (/實戰|隊伍|對戰|Mega|雙打|Champions/.test(title)) return "battle";
  if (/新手|教學|入門|解析|怎麼|如何/.test(title)) return "tutorial";
  return "unknown";
}

function detectGame(title, pls) {
  if (/Champions|寶可夢冠軍|#寶可夢冠軍/i.test(title) || pls.includes("寶可夢 Champions")) return "champions";
  if (/朱紫|朱\/紫|Scarlet|Violet|\bSV\b|太晶/i.test(title)) return "sv";
  if (/Pokopia|Z-A|PTCG|火紅葉綠|迷宮|Fire Emblem|火焰紋章/i.test(title)) return "other";
  return null;
}

function detectRegulation(title) {
  // 【寶可夢 Champions｜M-C】 / 【M-B】 / Regulation M-C / Reg I / 規則 G
  // 前後不能是英數字，避免 "TEAM-A"、"M-Cup" 之類誤判
  let m = /(?<![A-Za-z0-9])M-([A-Z])(?![A-Za-z0-9])/.exec(title);
  if (m) return `M-${m[1]}`;
  m = /(?:Regulation|Reg\.?|規則|法規)\s*([A-J])\b/i.exec(title);
  if (m) return m[1].toUpperCase();
  return null;
}

function chaptersOf(info) {
  const ch = info?.chapters;
  if (!Array.isArray(ch)) return [];
  return ch.map((c) => ({ title: c.title, start_s: c.start_time, end_s: c.end_time ?? null }));
}

// 從 description 的時間戳重建原文章節（info.chapters 的標題可能被翻譯）
function chaptersFromDescription(desc, duration) {
  if (!desc) return [];
  const out = [];
  for (const line of desc.split("\n")) {
    const m = /^\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const parts = m[1].split(":").map(Number);
    const s = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
    out.push({ title: m[2], start_s: s, end_s: null });
  }
  // YouTube 章節至少要 3 個且遞增；描述裡孤零零一行「12:34 xxx」不是章節，交回 info.chapters 判斷
  if (out.length < 2 || out.some((c, i) => i > 0 && c.start_s <= out[i - 1].start_s)) return [];
  for (let i = 0; i < out.length; i++) out[i].end_s = i + 1 < out.length ? out[i + 1].start_s : duration ?? null;
  return out;
}

function teamIntroRange(chapters) {
  // 先找明確的「隊伍介紹」；找不到才接受第一章含「隊伍/team」（避免「隊伍弱點」「Team preview」之類章節誤中）
  let i = chapters.findIndex((c) => /隊伍介紹|Team Intro/i.test(c.title));
  if (i < 0 && chapters.length && /隊伍|team/i.test(chapters[0].title)) i = 0;
  if (i < 0) return null;
  const c = chapters[i];
  return { start_s: c.start_s, end_s: c.end_s ?? c.start_s + 480 };
}

function pinnedComment(info) {
  const c = (info?.comments || []).find((x) => x.is_pinned);
  return c ? c.text : null;
}

function pokepastes(...texts) {
  const set = new Set();
  for (const t of texts) for (const m of (t || "").matchAll(/https?:\/\/pokepast\.es\/[0-9a-f]+/g)) set.add(m[0]);
  return [...set];
}

const videos = [];
for (const rec of index.videos) {
  const infoPath = join(raw, `${rec.id}.info.json`);
  const info = existsSync(infoPath) ? JSON.parse(readFileSync(infoPath, "utf8")) : null;
  const err = errById.get(rec.id) ?? null;
  const pls = rec.playlists || [];
  const title = info?.title || rec.title || "";
  const isMembers = pls.includes(MEMBERS_PL) || /members-only|會員/.test(err || "") || info?.availability === "subscriber_only";
  const descChapters = chaptersFromDescription(info?.description, info?.duration);
  const chapters = descChapters.length ? descChapters : chaptersOf(info);
  const subs = info ? Object.keys(info.subtitles || {}) : [];
  const uploadDate = info?.upload_date ? `${info.upload_date.slice(0, 4)}-${info.upload_date.slice(4, 6)}-${info.upload_date.slice(6, 8)}` : null;
  const pinned = pinnedComment(info);

  videos.push({
    id: rec.id,
    url: `https://www.youtube.com/watch?v=${rec.id}`,
    // 播放清單可能收錄別人的影片，有 info.json 時以影片本身的頻道為準
    channel_id: info?.channel_id ?? rec.channel_id ?? index.channel?.channel_id ?? null,
    channel_name: info?.channel ?? index.channel?.channel ?? null,
    channel_handle: index.channel?.handle ?? null,
    title,
    published_at: uploadDate,
    duration_s: info?.duration ?? rec.duration_s ?? null,
    view_count: info?.view_count ?? null,
    like_count: info?.like_count ?? null,
    availability: info?.availability ?? null,
    is_members_only: isMembers,
    tab: rec.tabs || [],
    playlists: pls,
    category: classify(rec, info),
    game: detectGame(title, pls),
    regulation_code: detectRegulation(title),
    chapters,
    team_intro_range: teamIntroRange(chapters),
    subtitles: subs,
    has_auto_captions: !!(info && Object.keys(info.automatic_captions || {}).length),
    description: info?.description ?? null,
    pinned_comment: pinned,
    pokepaste_urls: pokepastes(info?.description, pinned),
    author: index.channel?.channel ?? null,
    author_source: "channel",
    fetched_at: new Date().toISOString(),
    fetch_error: info ? null : err,
  });
}

videos.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || "") || a.id.localeCompare(b.id));
writeFileSync(join(chDir, "videos.json"), JSON.stringify(videos, null, 2));

// CSV（主表精簡欄位；description 不放）
const cols = ["id", "url", "title", "published_at", "duration_s", "view_count", "like_count", "is_members_only", "category", "game", "regulation_code", "playlists", "subtitles", "team_intro_start_s", "team_intro_end_s", "pokepaste_urls", "author", "fetch_error"];
const esc = (v) => {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join("|") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [cols.join(",")].concat(
  videos.map((v) => cols.map((c) => {
    if (c === "team_intro_start_s") return esc(v.team_intro_range?.start_s);
    if (c === "team_intro_end_s") return esc(v.team_intro_range?.end_s);
    return esc(v[c]);
  }).join(","))
).join("\n");
writeFileSync(join(chDir, "videos.csv"), csv + "\n");

const stat = (f) => videos.reduce((m, v) => { const k = f(v) ?? "null"; m[k] = (m[k] || 0) + 1; return m; }, {});
console.error(JSON.stringify({
  total: videos.length,
  with_info: videos.filter((v) => v.fetch_error == null && v.published_at).length,
  members_only: videos.filter((v) => v.is_members_only).length,
  category: stat((v) => v.category),
  game: stat((v) => v.game),
  regulation: stat((v) => v.regulation_code),
  with_team_intro: videos.filter((v) => v.team_intro_range).length,
}, null, 2));
