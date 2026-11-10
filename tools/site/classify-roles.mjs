// 角色標籤推斷：依 data/ref/roles.json 的 rules，比對隊員實際帶的招式／特性／道具。
// 回傳 [{slot, roles:[tag id]}]（只含有命中者）；主攻手／副攻手不在此推斷，由 analysis.roles 手動標。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REF = JSON.parse(readFileSync(join(ROOT, "data", "ref", "roles.json"), "utf8"));
export function inferRoles(team) {
  const out = [];
  for (const [i, m] of (team?.members ?? []).entries()) {
    const have = { move: new Set((m.moves ?? []).map((x) => x?.value_en).filter(Boolean)), ability: new Set([m.ability?.value_en].filter(Boolean)), item: new Set([m.item?.value_en].filter(Boolean)) };
    const roles = REF.tags.filter((t) => ["move", "ability", "item"].some((k) => t.rules[k].some((r) => have[k].has(r.name_en)))).map((t) => t.id);
    if (roles.length) out.push({ slot: m.slot ?? i + 1, roles });
  }
  return out;
}
