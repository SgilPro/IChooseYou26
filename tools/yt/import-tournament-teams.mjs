#!/usr/bin/env node
// 把「比賽播報影片」的隊伍規格（tournament-specs/<videoId>.json，人工／視覺辨識抽出）轉成：
//   (1) teams/<videoId>.json（多隊，id = team_<videoId>_<n>），每隊帶 event_id / match_id / player / team_signature / source_t_s
//   (2) data/events/<eventId>.json（賽事、對戰、選手、隊伍關聯；之後官方 replay 影片依 match_id 補齊，不重複建立）
// 用法：node tools/yt/import-tournament-teams.mjs data/channels/fiskepokemon <videoId>
// 英文名查 data/ref/names_zh-Hant.json；dex_no 查 @pkmn/dex（Gen 9）。道具只給英文名（圖示判讀）。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const [chDir, vid] = [process.argv[2], process.argv[3]];
if (!chDir || !vid) { console.error("usage: import-tournament-teams.mjs <channelDir> <videoId>"); process.exit(1); }
const spec = JSON.parse(readFileSync(join(chDir, "tournament-specs", `${vid}.json`), "utf8"));
const N = JSON.parse(readFileSync(join(ROOT, "data/ref/names_zh-Hant.json"), "utf8"));
const regs = JSON.parse(readFileSync(join(ROOT, "data/ref/regulation_sets.json"), "utf8"));
const videos = JSON.parse(readFileSync(join(chDir, "videos.json"), "utf8"));
const video = videos.find((v) => v.id === vid);
const { Dex } = createRequire(ROOT + "/app/package.json")("@pkmn/dex");
const dex = Dex.forGen(9);
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const itemZh = { ...N.items.en2zh, ...Object.fromEntries(Object.entries(N.extra?.items_zh2en || {}).map(([zh, en]) => [en, zh])) };
const natZh = N.natures?.en2zh || {};
const TYPE_ZH = { Normal: "一般", Fire: "火", Water: "水", Electric: "電", Grass: "草", Ice: "冰", Fighting: "格鬥", Poison: "毒", Ground: "地面", Flying: "飛行", Psychic: "超能力", Bug: "蟲", Rock: "岩石", Ghost: "幽靈", Dragon: "龍", Dark: "惡", Steel: "鋼", Fairy: "妖精", Stellar: "星晶" };
const warn = []; const miss = (k, v) => { warn.push(`${k}: ${v}`); };
const regId = spec.event.regulation_set_id ?? (() => { const d = video.published_at.slice(0, 10); const r = regs.find((x) => x.game === spec.event.game && x.starts_on <= d && (!x.ends_on || d <= x.ends_on)); return r?.id ?? null; })();

const evId = spec.event.id;
const teams = []; const matchById = new Map();
for (const m of spec.matches) {
  const id = `${evId}__${slug(m.round)}__${m.players.map(slug).sort().join("__")}`;
  matchById.set(`${m.round}|${m.players.join("|")}`, { id, round: m.round, players: m.players.map((p) => ({ name: p, team_ids: [] })), sources: [{ video_id: vid, header_t_s: m.header_t_s ?? null, kind: "commentary" }] });
}
const matchOf = (player, round) => [...matchById.values()].find((m) => m.round === round && m.players.some((p) => p.name === player));

spec.teams.forEach((t, i) => {
  const id = `team_${vid}_${i + 1}`;
  const members = t.members.map((x, k) => {
    const base = x.en.replace(/-Mega.*/, "");
    const dexSp = dex.species.get(base.startsWith("Lycanroc") ? "Lycanroc-Dusk" : base);
    if (!dexSp.exists) miss("species", x.en);
    const megaSuffix = x.mega ? `-${x.mega}` : "";
    const nameEn = x.mega ? `${base}${x.mega === "Mega" ? "-Mega" : "-" + x.mega}` : x.en;
    const ab = x.ability == null ? { exists: false } : dex.abilities.get(({ "人馬一體": x.en === "Calyrex-Ice" ? "As One (Glastrier)" : x.en === "Calyrex-Shadow" ? "As One (Spectrier)" : "" })[x.ability] || N.abilities.zh2en[x.ability] || ({ "軟待": "Hospitality", "漂浮": "Levitate" })[x.ability] || ""); if (x.ability != null && !ab.exists) miss("ability", x.ability);
    const it = dex.items.get(x.item); if (!it.exists) miss("item", x.item);
    const nat = x.nature ?? null; const natCn = nat ? (natZh[nat] || nat) : null;
    const teraEn = x.tera ?? null; const teraZh = teraEn ? (TYPE_ZH[teraEn] ?? null) : null;
    return {
      slot: k + 1,
      species: { dex_no: dexSp.num, name_zh: x.zh, name_en: nameEn, form: x.mega ? x.mega : (x.form ?? null), confidence: 0.95 },
      nickname: null, gender: x.gender ?? (["Basculegion", "Indeedee", "Meowstic"].includes(base) ? null : null),
      ability: x.ability == null ? { value: null, value_en: null, confidence: 0, source: null } : { value: x.ability, value_en: ab.exists ? ab.name : null, confidence: 0.95, source: "frame" },
      item: { value: itemZh[it.name] ?? null, value_en: it.exists ? it.name : null, confidence: x.item_conf ?? 0.85, source: "frame" },
      nature: { value: natCn, value_en: nat, confidence: nat ? 0.85 : 0, source: nat ? "frame" : null },
      tera_type: teraEn ? { value: teraZh ?? teraEn, value_en: teraEn, confidence: x.tera_conf ?? 0.9, source: "frame" } : null, mega: !!x.mega, evs: null, stats: null,
      stats_note: spec.stats_note ?? "轉播畫面無努力值與能力值；性格依畫面 ↑／↓ 箭頭換算；道具由圖示比對判讀（Mega 石為圖示色紋）。",
      moves: x.moves.map((mv) => { const en = N.moves.zh2en[mv] ?? ({ "踩腳": "Stomping Tantrum", "伴攻": "Coaching", "水砲": "Hydro Cannon", "聖火": "Sacred Fire", "蓄能焰擊": "Flame Charge", "雙刃頭槌": "Head Smash", "暗冥強襲": "Wicked Blow", "DD金勾臂": "Darkest Lariat", "看我嚇": "Follow Me" })[mv]; if (!en) miss("move", mv); return { value: mv, value_en: en ?? null, confidence: 0.95, source: "frame" }; }),
      role_note: null,
    };
  });
  const sig = createHash("sha1").update(JSON.stringify(members.map((m) => [m.species.name_en, m.ability.value_en, m.item.value_en, m.nature.value_en, m.moves.map((x) => x.value_en).sort()]).sort())).digest("hex").slice(0, 12);
  const match = matchOf(t.player, t.round);
  match.players.find((p) => p.name === t.player).team_ids.push(id);
  teams.push({
    id, name: `${t.player}（${spec.event.abbr ?? spec.event.name_zh} ${spec.event.year ?? ""}）`.replace(" ）", "）"), name_source: "manual",
    video_id: vid, video_url: `https://www.youtube.com/watch?v=${vid}&t=${t.t_s}s`, channel_handle: "@fiskepokemon",
    game: spec.event.game, regulation_set_id: regId, regulation_source: "date-inferred",
    tags: [], tags_source: "title", author: t.player, author_source: "frame",
    event_id: evId, match_id: match.id, player: t.player, team_signature: sig, source_t_s: t.t_s,
    members, is_members_only: true, related_video_ids: [], team_code: null,
    sources: { frames_used: t.frames.length, frames: t.frames, subtitle_lang: null, subtitle_range_s: null, pokepaste_url: null },
    confidence: 0.9, review_status: "auto",
    review_notes: `${spec.note} 選手 ${t.player} 的隊伍表出現在影片 ${Math.floor(t.t_s / 60)}:${String(t.t_s % 60).padStart(2, "0")}。`,
    notes: `${spec.event.name_zh}（${spec.event.name_en}）選手 ${t.player} 的公開配置（${t.round} 登場；同一選手在該賽事使用同一份隊伍）（來源：Fiske 講比賽影片的轉播畫面）。`,
    extracted_at: new Date().toISOString(), extracted_by: "claude-sonnet-5-5/extract-tournament-v1",
  });
});
// 同配置偵測
const bySig = new Map(); for (const t of teams) bySig.set(t.team_signature, [...(bySig.get(t.team_signature) || []), t.id]);
for (const t of teams) { const same = bySig.get(t.team_signature).filter((x) => x !== t.id); if (same.length) t.review_notes += ` 與 ${same.join("、")} 的配置完全相同（同一隊伍被不同選手使用）。`; }

writeFileSync(join(chDir, "teams", `${vid}.json`), JSON.stringify(teams, null, 2) + "\n");
const evPath = join(ROOT, "data", "events", `${evId}.json`);
const ev = existsSync(evPath) ? JSON.parse(readFileSync(evPath, "utf8")) : { id: evId, ...spec.event, matches: [] };
for (const m of matchById.values()) {
  const old = ev.matches.find((x) => x.id === m.id);
  if (!old) { ev.matches.push(m); continue; }
  for (const p of m.players) { const op = old.players.find((x) => x.name === p.name); if (op) op.team_ids = [...new Set([...op.team_ids, ...p.team_ids])]; else old.players.push(p); }
  for (const s of m.sources) if (!old.sources.some((x) => x.video_id === s.video_id && x.kind === s.kind)) old.sources.push(s);
}
writeFileSync(evPath, JSON.stringify(ev, null, 2) + "\n");
console.log(`${teams.length} teams, ${matchById.size} matches, reg=${regId}`);
if (warn.length) console.log("WARN:\n " + warn.join("\n "));
