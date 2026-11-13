#!/usr/bin/env node
// 從影片描述的 pokepast.es 連結匯入隊伍（朱紫時代 Fiske 幾乎每支對戰影片都附 paste）。
// 流程：videos.json 挑出有 pokepaste_urls 且尚無 teams/<id>.json 的對戰影片 → GET {paste}/json →
//       解析 Showdown 匯出文字 → 英文名用 @pkmn/dex 正規化、繁中用 names_zh-Hant.json → 寫 teams/<id>.json。
// 用法：node tools/yt/import-pokepaste.mjs data/channels/fiskepokemon [--limit N] [--only id,id] [--force]
// 之後請跑 validate-teams.mjs；notes/tags 的字幕補充可由後續 LLM pass 另做。

import { loadVideos } from "./lib-private.mjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

const chDir = process.argv[2] || join("data", "channels", "fiskepokemon");
const args = process.argv.slice(3);
const limit = Number((args.find((a) => a.startsWith("--limit")) || "").split("=")[1] || args[args.indexOf("--limit") + 1] || 0) || Infinity;
const onlyArg = args.indexOf("--only") >= 0 ? args[args.indexOf("--only") + 1].split(",") : null;
const force = args.includes("--force");

const require = createRequire(resolve("app/package.json"));
const { Dex } = require("@pkmn/dex");
const dex = Dex.forGen(9);
const NAMES = JSON.parse(readFileSync("data/ref/names_zh-Hant.json", "utf8"));
const REGS = JSON.parse(readFileSync("data/ref/regulation_sets.json", "utf8"));
const TAGS = JSON.parse(readFileSync("data/ref/tags.json", "utf8"));
const videos = loadVideos(chDir); // 完整主表在 private/videos.full.json（會員影片的章節與描述不在公開的 videos.json）
const teamsDir = join(chDir, "teams");
mkdirSync(teamsDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 查不到時去掉括號分型再查一次（例：As One (Glastrier) → As One）
const zh = (table, en) => {
  if (!en) return null;
  const t = NAMES[table]?.en2zh ?? {};
  return t[en] ?? t[en.replace(/\s*\([^)]*\)\s*$/, "")] ?? null;
};

// ---- Showdown 匯出解析 ----
const STAT_KEYS = { HP: "hp", Atk: "atk", Def: "def", SpA: "spa", SpD: "spd", Spe: "spe" };
function parsePaste(text) {
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const mons = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const head = lines.shift();
    if (!head || head.startsWith("===")) continue;
    // "Nick (Species) (M) @ Item" | "Species (F) @ Item" | "Species @ Item" | "Species"
    let rest = head, item = null;
    const at = rest.indexOf(" @ ");
    if (at >= 0) { item = rest.slice(at + 3).trim(); rest = rest.slice(0, at).trim(); }
    let gender = null;
    let m = /\((M|F)\)\s*$/.exec(rest);
    if (m) { gender = m[1]; rest = rest.slice(0, m.index).trim(); }
    let nickname = null, species = rest;
    m = /^(.*)\s\(([^()]+)\)$/.exec(rest);
    if (m) { nickname = m[1].trim(); species = m[2].trim(); }
    const mon = { species, nickname, gender, item, ability: null, level: null, tera: null, evs: {}, ivs: {}, nature: null, moves: [], shiny: false };
    for (const l of lines) {
      let mm;
      if ((mm = /^Ability:\s*(.+)$/i.exec(l))) mon.ability = mm[1].trim();
      else if ((mm = /^Level:\s*(\d+)/i.exec(l))) mon.level = Number(mm[1]);
      else if ((mm = /^Tera Type:\s*(.+)$/i.exec(l))) mon.tera = mm[1].trim();
      else if ((mm = /^Shiny:\s*Yes/i.exec(l))) mon.shiny = true;
      else if ((mm = /^EVs:\s*(.+)$/i.exec(l))) for (const part of mm[1].split("/")) { const [n, k] = part.trim().split(/\s+/); if (STAT_KEYS[k]) mon.evs[STAT_KEYS[k]] = Number(n); }
      else if ((mm = /^IVs:\s*(.+)$/i.exec(l))) for (const part of mm[1].split("/")) { const [n, k] = part.trim().split(/\s+/); if (STAT_KEYS[k]) mon.ivs[STAT_KEYS[k]] = Number(n); }
      else if ((mm = /^(\w+)\s+Nature$/i.exec(l))) mon.nature = mm[1];
      else if ((mm = /^-\s*(.+)$/.exec(l))) mon.moves.push(mm[1].trim());
    }
    mons.push(mon);
  }
  return mons;
}

// ---- 規則組（依日期，game=sv） ----
function regulationFor(date) {
  if (!date) return null;
  // 參照表（regulation_sets.json 的 sv-reg-i.pokemon_pool_note）：朱紫排位自 2026-01-05 起重啟 Reg I，為最終規則
  if (date >= "2026-01-05") return "sv-reg-i";
  const hits = REGS.filter((r) => r.game === "sv" && r.starts_on && r.starts_on <= date && (!r.ends_on || date <= r.ends_on));
  hits.sort((a, b) => (b.starts_on || "").localeCompare(a.starts_on || ""));
  return hits[0]?.id ?? null;
}

// ---- 標題 → tags（只用 aliases_zh 命中）----
function tagsFromTitle(title) {
  const out = [];
  for (const t of TAGS) if ((t.aliases_zh || []).some((a) => a && title.includes(a))) out.push(t.slug);
  return [...new Set(out)];
}
function teamNameFromTitle(title) {
  const m = /([^！!？?。｜|]{2,40}隊)\s*【/.exec(title);
  if (m) return m[1].trim();
  return title.split("【")[0].trim();
}

function field(valueEn, table, source = "pokepaste", conf = 0.98) {
  if (!valueEn) return null;
  let canon = valueEn;
  if (table === "moves") canon = dex.moves.get(valueEn)?.name ?? valueEn;
  if (table === "items") canon = dex.items.get(valueEn)?.name ?? valueEn;
  if (table === "abilities") canon = dex.abilities.get(valueEn)?.name ?? valueEn;
  if (table === "natures") canon = dex.natures.get(valueEn)?.name ?? valueEn;
  return { value: zh(table, canon) ?? canon, value_en: canon, confidence: zh(table, canon) ? conf : 0.7, source };
}

function toMember(mon, slot) {
  const sp = dex.species.get(mon.species);
  const nameEn = sp?.exists ? sp.name : mon.species;
  const baseEn = sp?.exists ? sp.baseSpecies : mon.species.split("-")[0];
  const nameZh = zh("species", baseEn) ?? zh("species", nameEn) ?? mon.species;
  const isMega = /-Mega/.test(nameEn);
  const evs = Object.keys(mon.evs).length ? { scale: "ev-252", hp: mon.evs.hp ?? 0, atk: mon.evs.atk ?? 0, def: mon.evs.def ?? 0, spa: mon.evs.spa ?? 0, spd: mon.evs.spd ?? 0, spe: mon.evs.spe ?? 0, confidence: 0.98, source: "pokepaste" } : null;
  return {
    slot,
    species: { dex_no: sp?.exists ? sp.num : null, name_zh: nameZh, name_en: nameEn, form: sp?.exists && sp.forme ? sp.forme : null, confidence: sp?.exists ? 0.98 : 0.6 },
    nickname: mon.nickname,
    gender: mon.gender,
    ability: field(mon.ability, "abilities"),
    item: field(mon.item, "items"),
    nature: field(mon.nature, "natures"),
    tera_type: mon.tera ? { value: NAMES.types?.en2zh?.[mon.tera] ?? TYPE_ZH[mon.tera] ?? mon.tera, value_en: mon.tera, confidence: 0.98, source: "pokepaste" } : null,
    mega: isMega,
    evs,
    stats: null,
    stats_note: Object.keys(mon.ivs).length ? `IVs: ${Object.entries(mon.ivs).map(([k, v]) => `${k} ${v}`).join(", ")}` : null,
    moves: mon.moves.slice(0, 4).map((mv) => field(mv, "moves")),
    role_note: null,
  };
}
const TYPE_ZH = { Normal: "一般", Fire: "火", Water: "水", Electric: "電", Grass: "草", Ice: "冰", Fighting: "格鬥", Poison: "毒", Ground: "地面", Flying: "飛行", Psychic: "超能力", Bug: "蟲", Rock: "岩石", Ghost: "幽靈", Dragon: "龍", Dark: "惡", Steel: "鋼", Fairy: "妖精", Stellar: "星晶" };

// ---- 主流程 ----
// 明確指定 --only 時不限 category（分類器把部分會員隊伍影片誤判成 chat/stream）
let candidates = videos.filter((v) => (onlyArg || v.category === "battle") && (v.pokepaste_urls?.length || 0) > 0 && v.fetch_error == null);
if (onlyArg) candidates = candidates.filter((v) => onlyArg.includes(v.id));
candidates.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
let done = 0, skipped = 0, failed = 0;
for (const v of candidates) {
  if (done >= limit) break;
  const out = join(teamsDir, `${v.id}.json`);
  if (existsSync(out) && !force) { skipped++; continue; }
  const teams = [];
  for (let i = 0; i < v.pokepaste_urls.length; i++) {
    const url = v.pokepaste_urls[i];
    try {
      const res = await fetch(`${url}/json`, { headers: { "User-Agent": "IChooseYou26-import/1.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const mons = parsePaste(j.paste || "");
      if (mons.length === 0) throw new Error("paste 無內容");
      const members = mons.slice(0, 6).map((m, k) => toMember(m, k + 1));
      teams.push({
        id: v.pokepaste_urls.length > 1 ? `team_${v.id}_${i + 1}` : `team_${v.id}`,
        name: (j.title && j.title.trim()) || teamNameFromTitle(v.title),
        name_source: j.title && j.title.trim() ? "pokepaste" : "title",
        video_id: v.id, video_url: v.url, channel_handle: v.channel_handle ?? "@fiskepokemon",
        game: v.game ?? "sv",
        regulation_set_id: regulationFor(v.published_at), regulation_source: "date-inferred",
        tags: tagsFromTitle(v.title), tags_source: "title",
        author: (j.author && j.author.trim()) || v.author || "Fiske", author_source: j.author && j.author.trim() ? "pokepaste" : "channel",
        members,
        is_members_only: v.is_members_only === true,
        related_video_ids: [],
        sources: { subtitle_lang: null, subtitle_range_s: null, frames_used: 0, pokepaste_url: url },
        paste_text: j.paste,
        paste_notes: j.notes || null,
        confidence: members.every((m) => m.species.dex_no != null) ? 0.95 : 0.8,
        review_status: "auto",
        review_notes: null,
        notes: null,
        extracted_at: new Date().toISOString(),
        extracted_by: "import-pokepaste-v1",
      });
    } catch (e) {
      console.error(`[paste] ${v.id} ${url}: ${e.message}`);
      failed++;
    }
    await sleep(800);
  }
  if (teams.length) { writeFileSync(out, JSON.stringify(teams, null, 2)); done++; console.error(`[ok] ${v.id} ${teams.map((t) => t.name).join(" / ")} (${teams[0].members.length} 隻, ${teams[0].regulation_set_id})`); }
}
console.error(`[import] written ${done} · skipped(existing) ${skipped} · failed ${failed}`);
