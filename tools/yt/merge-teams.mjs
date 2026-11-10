#!/usr/bin/env node
// 把 teams/<videoId>.json（每支影片一檔、陣列）合併成 teams.json（正本）與 teams.csv（扁平匯出，一列一隻寶可夢）。
// 用法：node tools/yt/merge-teams.mjs data/channels/fiskepokemon

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const chDir = process.argv[2] || join("data", "channels", "fiskepokemon");
const teamsDir = join(chDir, "teams");
if (!existsSync(teamsDir)) { console.error(`no ${teamsDir}`); process.exit(1); }

// 衍生欄位：控速分類（只寫進合併後的 teams.json，不回寫 teams/<video>.json）。分類器不存在或載入失敗時略過。
let classifyTeam = null;
try { ({ classifyTeam } = await import(new URL("../site/classify-speed-control.mjs", import.meta.url))); } catch (e) { console.error(`[merge] classifier unavailable, skip analysis_derived: ${e.message}`); }

let inferRoles = null;
try { ({ inferRoles } = await import(new URL("../site/classify-roles.mjs", import.meta.url))); } catch (e) { console.error(`[merge] roles inference unavailable: ${e.message}`); }

const videos = new Map(JSON.parse(readFileSync(join(chDir, "videos.json"), "utf8")).map((v) => [v.id, v]));
const all = [];
for (const f of readdirSync(teamsDir).filter((x) => x.endsWith(".json")).sort()) {
  const arr = JSON.parse(readFileSync(join(teamsDir, f), "utf8"));
  for (const t of arr) {
    const v = videos.get(t.video_id);
    const row = { ...t, video_title: v?.title ?? null, video_published_at: v?.published_at ?? null };
    if (classifyTeam && (t.members?.length ?? 0) === 6) row.analysis_derived = { ...(t.analysis_derived || {}), speed_control: classifyTeam(t), ...(inferRoles ? { roles: inferRoles(t) } : {}) };
    all.push(row);
  }
}
all.sort((a, b) => (b.video_published_at || "").localeCompare(a.video_published_at || "") || a.id.localeCompare(b.id));
writeFileSync(join(chDir, "teams.json"), JSON.stringify(all, null, 2));

const esc = (v) => {
  if (v == null) return "";
  const s = Array.isArray(v) ? v.join("|") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const fv = (f) => f?.value ?? "";
const fe = (f) => f?.value_en ?? "";
const cols = ["team_id", "team_name", "video_id", "video_url", "video_published_at", "game", "team_code", "regulation_set_id", "tags", "author", "is_members_only", "review_status", "team_confidence",
  "slot", "species_zh", "species_en", "form", "nickname", "mega", "ability_zh", "ability_en", "item_zh", "item_en", "nature",
  "ev_scale", "ev_hp", "ev_atk", "ev_def", "ev_spa", "ev_spd", "ev_spe", "stat_hp", "stat_atk", "stat_def", "stat_spa", "stat_spd", "stat_spe",
  "move1", "move2", "move3", "move4", "move1_en", "move2_en", "move3_en", "move4_en", "stats_note", "role_note"];
const rows = [cols.join(",")];
for (const t of all) {
  const base = [t.id, t.name, t.video_id, t.video_url, t.video_published_at, t.game, t.team_code ?? "", t.regulation_set_id, t.tags, t.author, t.is_members_only, t.review_status, t.confidence];
  if (!t.members?.length) { rows.push([...base, ...Array(cols.length - base.length).fill("")].map(esc).join(",")); continue; }
  for (const m of t.members) {
    const mv = m.moves ?? [];
    rows.push([...base,
      m.slot, m.species?.name_zh, m.species?.name_en, m.species?.form, m.nickname, m.mega, fv(m.ability), fe(m.ability), fv(m.item), fe(m.item), fv(m.nature),
      m.evs?.scale, m.evs?.hp, m.evs?.atk, m.evs?.def, m.evs?.spa, m.evs?.spd, m.evs?.spe,
      m.stats?.hp, m.stats?.atk, m.stats?.def, m.stats?.spa, m.stats?.spd, m.stats?.spe,
      fv(mv[0]), fv(mv[1]), fv(mv[2]), fv(mv[3]), fe(mv[0]), fe(mv[1]), fe(mv[2]), fe(mv[3]), m.stats_note, m.role_note,
    ].map(esc).join(","));
  }
}
writeFileSync(join(chDir, "teams.csv"), rows.join("\n") + "\n");
console.error(`[merge] ${all.length} teams → teams.json / teams.csv (${rows.length - 1} rows)`);
