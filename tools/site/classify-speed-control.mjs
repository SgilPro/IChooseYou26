#!/usr/bin/env node
// 控速手段分類器：依 data/ref/speed-control.json，比對隊員「實際帶的」招式／特性／道具。
// 不看 tags、標題，也不看 role_note（Mega 後特性只寫在 role_note，不比對）。
// 用法：node tools/site/classify-speed-control.mjs [teams.json]   → 對所有六隻隊伍印出統計（各數字皆為「出現的隊數」）
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REF = JSON.parse(readFileSync(join(ROOT, "data", "ref", "speed-control.json"), "utf8"));
const catById = new Map(REF.categories.map((c) => [c.id, c]));
const catOrder = REF.categories.map((c) => c.id);
// kind -> name_en -> entry[]
const index = { move: new Map(), ability: new Map(), item: new Map() };
for (const e of REF.entries) {
  const m = index[e.kind];
  if (!m.has(e.name_en)) m.set(e.name_en, []);
  m.get(e.name_en).push(e);
}

export function classifyTeam(team) {
  const byCat = new Map();
  // 隊上實際帶的招式（英文名），供 requires_team_has 的條件式項目（如誓約需水＋草同隊）判斷
  const teamMoves = new Set((team?.members ?? []).flatMap((m) => (m.moves ?? []).map((mv) => mv?.value_en)).filter(Boolean));
  for (const [i, m] of (team?.members ?? []).entries()) {
    const slot = m.slot ?? i + 1;
    const hits = [];
    for (const mv of m.moves ?? []) hits.push(["move", mv?.value_en]);
    hits.push(["ability", m.ability?.value_en], ["item", m.item?.value_en]);
    for (const [kind, en] of hits) {
      if (!en) continue;
      for (const e of index[kind].get(en) ?? []) {
        if (e.requires_team_has && !e.requires_team_has.every((n) => teamMoves.has(n))) continue;
        if (!byCat.has(e.category)) byCat.set(e.category, []);
        const via = byCat.get(e.category);
        if (!via.some((v) => v.member_slot === slot && v.kind === kind && v.name_zh === e.name_zh))
          via.push({ member_slot: slot, kind, name_zh: e.name_zh });
      }
    }
  }
  return catOrder.filter((id) => byCat.has(id)).map((id) => ({ category: id, label_zh: catById.get(id).name_zh, tier: catById.get(id).tier, via: byCat.get(id) }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2] || join(ROOT, "data", "channels", "fiskepokemon", "teams.json");
  const teams = JSON.parse(readFileSync(file, "utf8")).filter((t) => (t.members?.length ?? 0) === 6);
  const catCount = new Map(), nameCount = new Map(), sample = new Map(), tierCount = new Map();
  let noneCore = 0, noneAny = 0;
  for (const t of teams) {
    const r = classifyTeam(t);
    if (!r.some((c) => c.tier === "core")) noneCore++;
    if (!r.some((c) => c.tier !== "cleanup")) noneAny++;
    for (const tier of new Set(r.map((c) => c.tier))) tierCount.set(tier, (tierCount.get(tier) || 0) + 1);
    for (const c of r) {
      catCount.set(c.category, (catCount.get(c.category) || 0) + 1);
      if (!sample.has(c.category)) sample.set(c.category, []);
      if (sample.get(c.category).length < 3) sample.get(c.category).push(t.id);
      for (const n of new Set(c.via.map((v) => v.name_zh))) nameCount.set(`${c.category}|${n}`, (nameCount.get(`${c.category}|${n}`) || 0) + 1); // 以「隊」為單位計數
    }
  }
  console.log(`六隻隊伍：${teams.length} 支`);
  console.log(`有 core 控速的隊伍數：${teams.length - noneCore}（沒有 core：${noneCore}）`);
  console.log(`有 core 或 broad（不含 cleanup）的隊伍數：${teams.length - noneAny}（兩者皆無：${noneAny}）`);
  console.log(`各 tier 出現隊數：core ${tierCount.get("core") || 0}、broad ${tierCount.get("broad") || 0}、cleanup（不計入控速）${tierCount.get("cleanup") || 0}`);
  for (const id of catOrder) {
    console.log(`\n[${catById.get(id).tier}/${id}] ${catById.get(id).name_zh}：${catCount.get(id) || 0} 隊（代表：${(sample.get(id) || []).join(", ")}）`);
    for (const [k, n] of [...nameCount].filter(([k]) => k.startsWith(id + "|")).sort((a, b) => b[1] - a[1])) console.log(`    ${k.split("|")[1]}：${n}`);
  }
}
