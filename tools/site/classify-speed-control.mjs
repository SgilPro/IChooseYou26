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
  // 核心戰術晉升（Level 2 → 1）：只依 analysis.speed_control_core 的明確資料；缺席就不晉升也不降級，絕不由標題推測
  const coreList = Array.isArray(team?.analysis?.speed_control_core) ? team.analysis.speed_control_core : [];
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
  const result = [];
  for (const id of catOrder) {
    if (!byCat.has(id)) continue;
    const defLevel = catById.get(id).level ?? 2;
    const via = byCat.get(id).map((v) => {
      const hit = coreList.find((c) => c && c.slot === v.member_slot && c.name_zh === v.name_zh);
      return hit ? { ...v, level: 1, promoted: true, reason: hit.reason ?? null } : { ...v, level: REF.entries.find((e) => e.category === id && e.name_zh === v.name_zh)?.level ?? defLevel };
    });
    // 同類別內依 level 拆組（被晉升的項目單獨成組，其餘維持預設 level）
    for (const lv of [...new Set(via.map((v) => v.level))].sort()) {
      result.push({ category: id, label_zh: catById.get(id).name_zh, tier: catById.get(id).tier, level: lv, via: via.filter((v) => v.level === lv) });
    }
  }
  return result.sort((a, b) => a.level - b.level);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2] || join(ROOT, "data", "channels", "fiskepokemon", "teams.json");
  const teams = JSON.parse(readFileSync(file, "utf8")).filter((t) => (t.members?.length ?? 0) === 6);
  const catCount = new Map(), nameCount = new Map(), sample = new Map(), tierCount = new Map(), lvCount = new Map();
  let noneCore = 0, noneAny = 0, noneL1 = 0;
  for (const t of teams) {
    const r = classifyTeam(t);
    if (!r.some((c) => c.level === 1)) noneL1++;
    if (!r.some((c) => c.tier === "core")) noneCore++;
    if (!r.some((c) => c.tier !== "cleanup" && c.tier !== "support")) noneAny++;
    for (const lv of new Set(r.map((c) => c.level))) lvCount.set(lv, (lvCount.get(lv) || 0) + 1);
    for (const tier of new Set(r.map((c) => c.tier))) tierCount.set(tier, (tierCount.get(tier) || 0) + 1);
    for (const c of r) {
      const key = `L${c.level}|${c.category}`;
      catCount.set(key, (catCount.get(key) || 0) + 1);
      if (!sample.has(key)) sample.set(key, []);
      if (sample.get(key).length < 3) sample.get(key).push(t.id);
      for (const n of new Set(c.via.map((v) => v.name_zh))) nameCount.set(`${key}|${n}`, (nameCount.get(`${key}|${n}`) || 0) + 1); // 以「隊」為單位計數
    }
  }
  console.log(`六隻隊伍：${teams.length} 支（以下皆為隊數）`);
  console.log(`有 Level 1 控速的隊伍數：${teams.length - noneL1}（沒有：${noneL1}）`);
  console.log(`各 Level 出現隊數：Level 1 ${lvCount.get(1) || 0}、Level 2 ${lvCount.get(2) || 0}、Level 3（不屬於控速討論）${lvCount.get(3) || 0}`);
  console.log(`（次要）tier：core ${tierCount.get("core") || 0}、broad ${tierCount.get("broad") || 0}、cleanup ${tierCount.get("cleanup") || 0}；沒有 core ${noneCore}、core+broad 皆無 ${noneAny}`);
  for (const lv of [1, 2, 3]) for (const id of catOrder) {
    const key = `L${lv}|${id}`;
    if (!catCount.has(key)) continue;
    console.log(`\n[Level ${lv}/${catById.get(id).tier}/${id}] ${catById.get(id).name_zh}：${catCount.get(key)} 隊（代表：${sample.get(key).join(", ")}）`);
    for (const [k, n] of [...nameCount].filter(([k]) => k.startsWith(key + "|")).sort((a, b) => b[1] - a[1])) console.log(`    ${k.split("|")[2]}：${n}`);
  }
}
