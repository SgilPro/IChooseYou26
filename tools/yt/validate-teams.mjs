#!/usr/bin/env node
// 機械式檢查 teams/*.json：
//  1. 可解析、必要欄位齊全、enum 合法（輕量 schema 檢查，不依賴 ajv）
//  2. name_en / moves.value_en / ability.value_en / item.value_en 是否存在於 @pkmn/dex（用 app/node_modules）
//  3. regulation_set_id / tags 是否在參照表
//  4. 能力點（Champions 0~32）範圍與總和合理性
// 用法：node tools/yt/validate-teams.mjs data/channels/fiskepokemon [--strict]
// 輸出：每個問題一行（WARN/ERR），最後統計；--strict 時有 ERR 則 exit 1

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { teamFiles } from "./lib-private.mjs";
import { createRequire } from "node:module";

const chDir = process.argv[2] || join("data", "channels", "fiskepokemon");
const strict = process.argv.includes("--strict");
const require = createRequire(resolve("app/package.json"));
const { Dex } = require("@pkmn/dex");
const dex = Dex.forGen(9);

const NAMES = existsSync("data/ref/names_zh-Hant.json") ? JSON.parse(readFileSync("data/ref/names_zh-Hant.json", "utf8")) : null;
const TABLE_KEY = { species: "species", moves: "moves", items: "items", abilities: "abilities", natures: "natures" };
// 繁中 value 查表 → 預期英文；查不到回 undefined（不報錯，只在有對照且不一致時報）
function expectedEn(table, zh) {
  if (!NAMES || !zh) return undefined;
  const t = NAMES[TABLE_KEY[table]];
  const alias = table === "species" ? (NAMES.species_aliases_zh?.[zh] ?? zh) : zh;
  return t?.zh2en?.[alias] ?? NAMES.extra?.[`${TABLE_KEY[table]}_zh2en`]?.[zh];
}
const regs = new Set(JSON.parse(readFileSync("data/ref/regulation_sets.json", "utf8")).map((r) => r.id));
const tags = new Set(JSON.parse(readFileSync("data/ref/tags.json", "utf8")).map((t) => t.slug));

const teamsDir = join(chDir, "teams");
if (!existsSync(teamsDir)) { console.error(`no ${teamsDir}`); process.exit(0); }

let errs = 0, warns = 0;
const err = (m) => { errs++; console.log(`ERR  ${m}`); };
const warn = (m) => { warns++; console.log(`WARN ${m}`); };

const SOURCES = new Set(["title", "subtitle", "frame", "description", "pinned_comment", "pokepaste", "inferred", "manual"]);
const REVIEW = new Set(["auto", "reviewed", "conflict", "needs-member-access", "manual", "members-only-withheld"]);

// Z-Mega 是 Champions 新型態，Showdown 可能尚未收錄 → 只警告
function checkSpecies(where, sp) {
  if (!sp?.name_zh) return err(`${where}: species.name_zh 缺`);
  if (!sp.name_en) return warn(`${where}: species.name_en 缺（${sp.name_zh}）`);
  const expSp = expectedEn("species", sp.name_zh);
  const baseEn = String(sp.name_en).replace(/-Mega(-[XYZ])?$/, "").replace(/-(F|M)$/, "");
  if (expSp && expSp.toLowerCase() !== baseEn.toLowerCase() && !baseEn.toLowerCase().startsWith(expSp.toLowerCase())) err(`${where}: species「${sp.name_zh}」查表應為「${expSp}」，但 name_en 是「${sp.name_en}」`);
  const s = dex.species.get(sp.name_en);
  if (!s?.exists) {
    if (/-Mega-Z$/.test(sp.name_en)) return warn(`${where}: ${sp.name_en} 是 Z-Mega，@pkmn/dex 尚無此型態（可接受）`);
    return err(`${where}: species.name_en「${sp.name_en}」不在 @pkmn/dex`);
  }
  if (sp.dex_no != null && sp.dex_no !== s.num) warn(`${where}: dex_no ${sp.dex_no} ≠ @pkmn/dex ${s.num}（${sp.name_en}）`);
}
function checkField(where, f, table, label) {
  if (f == null) return;
  if (typeof f !== "object" || !("value" in f)) return err(`${where}: ${label} 不是 {value,...} 物件`);
  if (f.source && !SOURCES.has(f.source)) err(`${where}: ${label}.source「${f.source}」不合法`);
  if (f.confidence != null && (f.confidence < 0 || f.confidence > 1)) err(`${where}: ${label}.confidence 超界`);
  if (f.value && f.value_en) {
    const exp = expectedEn(table, f.value);
    // 比對用 Showdown 式 id（去掉非英數，忽略彎/直引號差異，如 Dragon’s Maw vs Dragon's Maw）
    const toId = (x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, "");
    // Showdown 對同名特性有分型（例：As One (Glastrier) / As One (Spectrier)），接受「以查表名開頭」
    if (exp && toId(exp) !== toId(f.value_en) && !toId(f.value_en).startsWith(toId(exp))) err(`${where}: ${label}「${f.value}」查表應為「${exp}」，但填了「${f.value_en}」`);
  }
  if (f.value_en) {
    const x = dex[table].get(f.value_en);
    if (!x?.exists) {
      if (table === "items" && /Mega Stone|進化石|ite Z$|ite$/.test(f.value_en)) return warn(`${where}: ${label}.value_en「${f.value_en}」可能是 Champions 新 Mega 石，@pkmn/dex 無`);
      err(`${where}: ${label}.value_en「${f.value_en}」不在 @pkmn/dex.${table}`);
    }
  } else if (f.value) {
    warn(`${where}: ${label}「${f.value}」沒有 value_en 對齊`);
  }
}

let teamCount = 0, memberCount = 0;
// 公開 teams/ 加上 private/teams/（會員影片的完整檔；同檔名以 private 為準）
for (const { file, path } of teamFiles(chDir)) {
  let arr;
  try { arr = JSON.parse(readFileSync(path, "utf8")); } catch (e) { err(`${file}: JSON 解析失敗 ${e.message}`); continue; }
  if (!Array.isArray(arr)) { err(`${file}: 根節點必須是陣列`); continue; }
  for (const t of arr) {
    teamCount++;
    const w = `${file}#${t.id ?? "?"}`;
    for (const k of ["id", "name", "video_id", "video_url", "game", "regulation_set_id", "author", "members", "is_members_only", "review_status", "extracted_at"]) {
      if (!(k in t)) err(`${w}: 缺必要欄位 ${k}`);
    }
    if (!["champions", "sv", "other"].includes(t.game)) err(`${w}: game「${t.game}」不合法`);
    if (t.regulation_set_id && !regs.has(t.regulation_set_id)) err(`${w}: regulation_set_id「${t.regulation_set_id}」不在參照表`);
    if (t.review_status && !REVIEW.has(t.review_status)) err(`${w}: review_status「${t.review_status}」不合法`);
    for (const tg of t.tags ?? []) if (!tags.has(tg)) err(`${w}: tag「${tg}」不在 tags.json`);
    if (!Array.isArray(t.members)) { err(`${w}: members 不是陣列`); continue; }
    if (t.members.length !== 6 && !t.is_members_only) warn(`${w}: members 只有 ${t.members.length} 隻`);
    const slots = new Set();
    for (const m of t.members) {
      memberCount++;
      const mw = `${w}/slot${m.slot}`;
      if (slots.has(m.slot)) err(`${mw}: slot 重複`); slots.add(m.slot);
      checkSpecies(mw, m.species);
      checkField(mw, m.ability, "abilities", "ability");
      checkField(mw, m.item, "items", "item");
      checkField(mw, m.nature, "natures", "nature");
      if (!Array.isArray(m.moves)) err(`${mw}: moves 不是陣列`);
      else {
        if (m.moves.length > 4) err(`${mw}: moves 超過 4`);
        m.moves.forEach((mv, i) => checkField(mw, mv, "moves", `moves[${i}]`));
      }
      if (m.evs) {
        const vals = ["hp", "atk", "def", "spa", "spd", "spe"].map((k) => m.evs[k]).filter((v) => v != null);
        if (!m.evs.scale) err(`${mw}: evs 缺 scale`);
        if (m.evs.scale === "champions-points-32") {
          if (vals.some((v) => v < 0 || v > 32)) err(`${mw}: 能力點超出 0~32`);
          const sum = vals.reduce((a, b) => a + b, 0);
          // Champions 規則：總和上限 66、單項上限 32（Bulbapedia Stat point）
          if (sum > 66) err(`${mw}: 能力點總和 ${sum} > 66`);
          else if (vals.length === 6 && sum < 66) warn(`${mw}: 能力點總和 ${sum} < 66（未滿配或讀錯）`);
        } else if (m.evs.scale === "ev-252") {
          const sum = vals.reduce((a, b) => a + b, 0);
          if (sum > 510) err(`${mw}: EV 總和 ${sum} > 510`);
        }
      }
      if (m.mega === true && !/Mega/.test(m.species?.form ?? "")) warn(`${mw}: mega=true 但 species.form 沒標 Mega`);
      // 能力值重算（Lv.50、IV 31）。Champions 能力點 EV = 4 + 8×(點數−1)；SV 直接用 EV。畫面顯示的是未 Mega 的原形 → 用原形種族值。
      if ((m.evs?.scale === "champions-points-32" || m.evs?.scale === "ev-252") && m.stats && m.species?.name_en) {
        const baseName = String(m.species.name_en).replace(/-Mega(-[XYZ])?$/, "");
        const sp = dex.species.get(baseName);
        const natEn = m.nature?.value_en ? dex.natures.get(m.nature.value_en) : null;
        if (sp?.exists) {
          const toEv = m.evs.scale === "ev-252" ? (ev) => (ev ?? 0) : (pt) => (pt == null || pt <= 0 ? 0 : 4 + 8 * (pt - 1));
          for (const k of ["hp", "atk", "def", "spa", "spd", "spe"]) {
            const shown = m.stats[k]; if (shown == null || m.evs[k] == null) continue;
            const base = sp.baseStats[k];
            let calc = Math.floor((2 * base + 31 + Math.floor(toEv(m.evs[k]) / 4)) * 50 / 100);
            if (k === "hp") calc += 60; else {
              calc += 5;
              if (natEn?.plus === k) calc = Math.floor(calc * 1.1);
              if (natEn?.minus === k) calc = Math.floor(calc * 0.9);
            }
            if (calc !== shown) warn(`${mw}: ${k} 重算 ${calc} ≠ 畫面 ${shown}（種族 ${base}、點數 ${m.evs[k]}、性格 ${m.nature?.value_en ?? "?"}）`);
          }
        }
      }
    }
    const megas = t.members.filter((m) => m.mega === true).length;
    if (t.game === "champions" && megas > 1) warn(`${w}: 有 ${megas} 隻標 mega=true（Champions 每場限一次，但隊上可帶多顆石頭，確認是否刻意）`);
  }
}
console.log(`\n${teamCount} teams, ${memberCount} members · ${errs} ERR · ${warns} WARN`);
if (strict && errs > 0) process.exit(1);
