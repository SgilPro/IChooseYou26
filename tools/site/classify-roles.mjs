// 角色標籤推斷：
//  (1) 依 data/ref/roles.json 的 rules，比對隊員實際帶的招式／特性／道具（功能類標籤）。
//  (2) 攻擊三標籤（主攻／副攻／攻擊）：用 @pkmn/dex 的招式資料＋隊名／標題、Mega、神獸、天氣受益招式、性格與能力點推斷（啟發式，推斷者一律虛線；手動 analysis.roles 優先）。
// 回傳 [{slot, roles:[tag id]}]（只含有命中者）。
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REF = JSON.parse(readFileSync(join(ROOT, "data", "ref", "roles.json"), "utf8"));
let dex = null;
try { dex = createRequire(ROOT + "/app/package.json")("@pkmn/dex").Dex.forGen(9); } catch { /* 沒有 dex 就略過攻擊推斷 */ }

const OFF_NATURE_UP = new Set(["Lonely", "Brave", "Adamant", "Naughty", "Modest", "Mild", "Quiet", "Rash"]); // 提升攻擊或特攻
const UTILITY_PRIO = new Set(["Fake Out", "First Impression", "Feint", "Upper Hand"]); // 先制但偏輔助，不算火力
const WEATHER = {
  rain: { setAb: ["Drizzle", "Primordial Sea"], setMv: ["Rain Dance"], boost: ["Electro Shot", "Thunder", "Hurricane", "Hydro Pump"] },
  sun: { setAb: ["Drought", "Desolate Land", "Orichalcum Pulse"], setMv: ["Sunny Day"], boost: ["Solar Beam", "Solar Blade", "Weather Ball"] },
  snow: { setAb: ["Snow Warning"], setMv: ["Snowscape", "Chilly Reception"], boost: ["Blizzard", "Weather Ball"] },
};

function attackRoles(team) {
  if (!dex) return new Map();
  const ms = team?.members ?? [];
  const teamName = `${team?.name ?? ""} ${team?.video_title ?? ""}`;
  const has = (m, kind, en) => kind === "move" ? (m.moves ?? []).some((x) => x?.value_en === en) : m.ability?.value_en === en;
  const weather = new Set();
  for (const [w, d] of Object.entries(WEATHER)) for (const m of ms) if (d.setAb.some((a) => has(m, "ability", a)) || d.setMv.some((v) => has(m, "move", v))) weather.add(w);
  const info = ms.map((m, i) => {
    const slot = m.slot ?? i + 1;
    const mv = (m.moves ?? []).map((x) => (x?.value_en ? dex.moves.get(x.value_en) : null)).filter((x) => x && x.exists);
    const dmg = mv.filter((x) => x.category !== "Status" && !UTILITY_PRIO.has(x.name));
    const types = new Set(dmg.map((x) => x.type));
    const prio = dmg.some((x) => x.priority > 0 && x.basePower > 0);
    const sp = m.species?.name_en ? dex.species.get(m.species.name_en.replace(/-Mega.*/, "")) : null;
    const restricted = !!sp?.exists && (sp.tags?.includes("Restricted Legendary") || sp.tags?.includes("Mythical"));
    const natUp = OFF_NATURE_UP.has(m.nature?.value_en);
    const e = m.evs; const emax = e?.scale === "champions-points-32" ? 32 : e?.scale === "ev-252" ? 252 : 0;
    const evOff = !!(emax && Math.max(e.atk || 0, e.spa || 0) >= emax * 0.6);
    const named = !!(m.species?.name_zh && teamName.includes(m.species.name_zh.replace(/（.*/, "")));
    const wBoost = [...weather].some((w) => WEATHER[w].boost.some((b) => has(m, "move", b)));
    let score = 0;
    if (dmg.length >= 2) {
      if (named) score += 3;
      if (m.mega && dmg.length >= 3) score += 2;
      if (restricted) score += 2;
      if (wBoost) score += 2;
      if (natUp) score += 1;
      if (evOff) score += 1;
    }
    return { slot, dmg: dmg.length, types: types.size, prio, score };
  });
  const out = new Map();
  const mains = info.filter((x) => x.score >= 3).sort((a, b) => b.score - a.score).slice(0, 2);
  for (const x of mains) out.set(x.slot, "main-attacker");
  for (const x of info) {
    if (out.has(x.slot)) continue;
    if (x.dmg >= 2 && (x.types >= 3 || x.prio)) out.set(x.slot, "sub-attacker");
    else if (x.dmg >= 3) out.set(x.slot, "attacker");
  }
  return out;
}

export function inferRoles(team) {
  const atk = attackRoles(team);
  const out = [];
  for (const [i, m] of (team?.members ?? []).entries()) {
    const slot = m.slot ?? i + 1;
    const have = { move: new Set((m.moves ?? []).map((x) => x?.value_en).filter(Boolean)), ability: new Set([m.ability?.value_en].filter(Boolean)), item: new Set([m.item?.value_en].filter(Boolean)) };
    const roles = REF.tags.filter((t) => ["move", "ability", "item"].some((k) => t.rules[k].some((r) => have[k].has(r.name_en)))).map((t) => t.id);
    if (atk.has(slot)) roles.unshift(atk.get(slot));
    if (roles.length) out.push({ slot, roles });
  }
  return out;
}
