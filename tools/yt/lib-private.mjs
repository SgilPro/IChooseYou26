// 會員限定內容的公開／私有分離（2026-11-13，站主決定：會員影片的內容不公開）。
//
// 原則：凡是來自「會員限定影片」的內容（隊伍配置、講解摘要、隊伍 ID、分析、影片描述、章節、字幕切片、比賽隊伍規格），
//       完整版只放在 <channelDir>/private/（.gitignore，不進版控、不上站）；
//       版控與網站上只留「殼」：標題、影片連結、日期、遊戲與規則，讓人知道有這支隊伍並連回原影片。
//
// private/ 的內容：
//   videos.full.json         完整影片主表（含會員影片的描述、章節、pokepaste 連結）
//   teams/<videoId>.json     會員影片的完整隊伍檔
//   tournament-specs/<id>.json、intro/<id>.*.txt   會員影片的比賽規格與字幕切片
//   teams.full.json          合併後的完整隊伍表（本機分析用）
//
// 所有工具讀資料時走這裡：loadVideos()、teamFiles()；merge-teams 會先 sweep() 自我修復（把誤放在公開資料夾的會員內容搬走）。
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, copyFileSync } from "node:fs";
import { join } from "node:path";

export const WITHHELD = "members-only-withheld";
export const privDir = (ch, ...p) => join(ch, "private", ...p);
const readJ = (p) => JSON.parse(readFileSync(p, "utf8"));
const ensure = (d) => { mkdirSync(d, { recursive: true }); return d; };

export const isMemberVideo = (v) => !!v && (v.is_members_only === true || v.availability === "subscriber_only");

/** 完整影片主表：有 private/videos.full.json 用它，否則退回公開的 videos.json（新 clone 的情況，會員影片的描述與章節會是空的）。 */
export function loadVideos(ch) {
  const full = privDir(ch, "videos.full.json");
  return readJ(existsSync(full) ? full : join(ch, "videos.json"));
}

export function redactVideo(v) {
  if (!isMemberVideo(v)) return v;
  return { ...v, chapters: [], team_intro_range: null, description: null, pinned_comment: null, pokepaste_urls: [], content_withheld: true };
}

const VIDEO_COLS = ["id", "url", "title", "published_at", "duration_s", "view_count", "like_count", "is_members_only", "category", "game", "regulation_code", "playlists", "subtitles", "team_intro_start_s", "team_intro_end_s", "pokepaste_urls", "author", "fetch_error"];
const esc = (v) => { if (v == null) return ""; const s = Array.isArray(v) ? v.join("|") : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

/** 寫出影片主表：完整版進 private/，公開版（會員影片已遮蔽）進 videos.json／videos.csv。 */
export function writeVideos(ch, fullVideos) {
  ensure(privDir(ch));
  writeFileSync(privDir(ch, "videos.full.json"), JSON.stringify(fullVideos, null, 2));
  const pub = fullVideos.map((v) => {
    const r = redactVideo(v);
    // 作者欄若是從會員影片內容回填的，公開版改回頻道預設
    return isMemberVideo(v) ? { ...r, author: null, author_source: "channel" } : r;
  });
  writeFileSync(join(ch, "videos.json"), JSON.stringify(pub, null, 2));
  const csv = [VIDEO_COLS.join(",")].concat(pub.map((v) => VIDEO_COLS.map((c) => c === "team_intro_start_s" ? esc(v.team_intro_range?.start_s) : c === "team_intro_end_s" ? esc(v.team_intro_range?.end_s) : esc(v[c])).join(","))).join("\n");
  writeFileSync(join(ch, "videos.csv"), csv + "\n");
  return pub;
}

/** 會員影片隊伍的公開殼：只留可從公開資訊得知的欄位。 */
export function redactTeam(t, v) {
  const titleName = (v?.title || "").split("【")[0].trim();
  const keepName = t.name_source === "title" || (t.event_id && t.name_source === "manual");
  const out = {
    id: t.id, name: (keepName && t.name) || titleName || t.name, name_source: keepName ? t.name_source : "title",
    video_id: t.video_id, video_url: `https://www.youtube.com/watch?v=${t.video_id}`, channel_handle: t.channel_handle ?? null,
    game: t.game ?? null, regulation_set_id: t.regulation_set_id ?? null, regulation_source: t.regulation_source ?? null,
    tags: t.tags_source === "title" ? (t.tags || []) : [], tags_source: "title",
    author: "未公開", author_source: "manual",
    members: [], is_members_only: true, related_video_ids: [], team_code: null,
    review_status: WITHHELD,
    review_notes: "會員限定影片：隊伍配置、講解與隊伍 ID 不公開，請到原影片觀看。",
    notes: null, extracted_at: t.extracted_at ?? null, extracted_by: t.extracted_by ?? null,
  };
  if (t.event_id) Object.assign(out, { event_id: t.event_id, match_id: t.match_id ?? null, player: t.player ?? null });
  return out;
}

export const hasContent = (t) => (t.members?.length ?? 0) > 0 || !!t.notes || !!t.team_code || !!t.analysis || !!t.paste_text || !!t.lead_modes;

/**
 * 自我修復：把公開資料夾裡的會員內容搬到 private/，原位留殼。回傳搬動紀錄。
 * - 第一次執行時，把目前的 videos.json（完整）複製成 private/videos.full.json，再把公開版改寫成遮蔽版。
 * - teams/<id>.json：影片是會員限定且檔內有內容 → 完整檔搬到 private/teams/，公開檔改寫成殼。
 *   影片不是會員限定卻標了 is_members_only: true → 改回 false（比賽匯入腳本早期寫死成 true）。
 * - tournament-specs/、intro/ 裡屬於會員影片的檔案 → 搬到 private/。
 */
export function sweep(ch) {
  const log = [];
  const full = privDir(ch, "videos.full.json");
  if (!existsSync(full)) { ensure(privDir(ch)); copyFileSync(join(ch, "videos.json"), full); log.push("init private/videos.full.json"); }
  const videos = readJ(full);
  const byId = new Map(videos.map((v) => [v.id, v]));
  const pubVideos = readJ(join(ch, "videos.json"));
  if (pubVideos.some((v) => isMemberVideo(v) && (v.description || v.chapters?.length || v.pokepaste_urls?.length))) { writeVideos(ch, videos); log.push("videos.json 遮蔽會員影片的描述與章節"); }

  const tdir = join(ch, "teams");
  for (const f of existsSync(tdir) ? readdirSync(tdir).filter((x) => x.endsWith(".json")) : []) {
    const p = join(tdir, f); let arr; try { arr = readJ(p); } catch { continue; }
    if (!Array.isArray(arr) || !arr.length) continue;
    const member = arr.some((t) => isMemberVideo(byId.get(t.video_id)));
    if (member) {
      if (arr.some(hasContent)) {
        ensure(privDir(ch, "teams")); writeFileSync(privDir(ch, "teams", f), JSON.stringify(arr, null, 2) + "\n");
        writeFileSync(p, JSON.stringify(arr.map((t) => redactTeam(t, byId.get(t.video_id))), null, 2) + "\n");
        log.push(`teams/${f} → private（${arr.length} 隊）`);
      }
    } else if (arr.some((t) => t.is_members_only === true)) {
      writeFileSync(p, JSON.stringify(arr.map((t) => ({ ...t, is_members_only: false })), null, 2) + "\n");
      log.push(`teams/${f} is_members_only 改回 false`);
    }
  }
  for (const [sub, idOf] of [["tournament-specs", (f) => f.replace(/\.json$/, "")], ["intro", (f) => f.split(".")[0]]]) {
    const d = join(ch, sub);
    for (const f of existsSync(d) ? readdirSync(d) : []) {
      if (f.startsWith("_") || !isMemberVideo(byId.get(idOf(f)))) continue;
      ensure(privDir(ch, sub)); renameSync(join(d, f), privDir(ch, sub, f)); log.push(`${sub}/${f} → private`);
    }
  }
  return log;
}

/** 隊伍檔清單：公開 teams/ 加上 private/teams/（同檔名以 private 的完整版為準）。回傳 [{ file, path, private }]。 */
export function teamFiles(ch) {
  const m = new Map();
  const tdir = join(ch, "teams");
  for (const f of existsSync(tdir) ? readdirSync(tdir).filter((x) => x.endsWith(".json")) : []) m.set(f, { file: f, path: join(tdir, f), private: false });
  const pdir = privDir(ch, "teams");
  for (const f of existsSync(pdir) ? readdirSync(pdir).filter((x) => x.endsWith(".json")) : []) m.set(f, { file: f, path: join(pdir, f), private: true });
  return [...m.values()].sort((a, b) => a.file.localeCompare(b.file));
}

/** 找某支影片的比賽規格檔（private 優先）。 */
export function specPath(ch, vid) {
  const a = privDir(ch, "tournament-specs", `${vid}.json`), b = join(ch, "tournament-specs", `${vid}.json`);
  return existsSync(a) ? a : b;
}

/** 檢查公開檔案裡有沒有會員內容；回傳問題清單（空陣列＝乾淨）。CI 也會跑。 */
export function checkPublic(ch) {
  const bad = [];
  const pub = readJ(join(ch, "videos.json")); const byId = new Map(pub.map((v) => [v.id, v]));
  for (const v of pub) if (isMemberVideo(v) && (v.description || v.pinned_comment || v.chapters?.length || v.pokepaste_urls?.length || v.team_intro_range)) bad.push(`videos.json ${v.id} 含會員影片的描述／章節`);
  const scan = (label, arr) => { for (const t of arr) if (isMemberVideo(byId.get(t.video_id)) && (hasContent(t) || t.analysis_derived)) bad.push(`${label} ${t.id} 含會員影片的隊伍內容`); };
  if (existsSync(join(ch, "teams.json"))) scan("teams.json", readJ(join(ch, "teams.json")));
  const tdir = join(ch, "teams");
  for (const f of existsSync(tdir) ? readdirSync(tdir).filter((x) => x.endsWith(".json")) : []) { try { scan(`teams/${f}`, readJ(join(tdir, f))); } catch {} }
  for (const [sub, idOf] of [["tournament-specs", (f) => f.replace(/\.json$/, "")], ["intro", (f) => f.split(".")[0]]]) {
    const d = join(ch, sub);
    for (const f of existsSync(d) ? readdirSync(d) : []) if (!f.startsWith("_") && isMemberVideo(byId.get(idOf(f)))) bad.push(`${sub}/${f} 屬於會員影片`);
  }
  return bad;
}
