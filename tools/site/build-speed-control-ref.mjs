import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// 產生 data/ref/speed-control.json（分類表）。用法：node tools/site/build-speed-control-ref.mjs
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BP_THRESHOLD = 70; // 先制攻擊招式「主力輸出」的威力門檻：使用者的判斷（[domain]），非 dex 規則
const require = createRequire(ROOT + "/app/package.json");
const { Dex } = require("@pkmn/dex");
const g = Dex.forGen(9);
const N = JSON.parse(readFileSync(ROOT + "/data/ref/names_zh-Hant.json", "utf8"));
const en2zh = { move: N.moves.en2zh, ability: N.abilities.en2zh, item: N.items.en2zh };
// ===== 顯示 Level 預設對照（集中於此，之後只改這裡）[domain]：使用者定義三層；未明說者為整理者判斷，列於 README 待確認 =====
// Level 1：順風、戲法空間（以及「核心戰術」晉升者，由 analysis.speed_control_core 在分類器晉升，不在此預設）
// Level 2：次要控速（折疊）；Level 3：輔助與收殘（折疊，不屬於控速討論）
const LEVEL_BY_CATEGORY = {
  "field-control": 1,
  "spread-speed-drop": 2, "paralysis": 2, "temporary": 2, "item-speed": 2, "self-speed-boost": 2,
  "priority-main": 2, "pledge-field": 2, "setup-speed": 2,
  "ability-priority": 3, "tempo-moves": 3, "priority-cleanup": 3, "stat-drop-utility": 3,
};
const LEVEL_BY_ENTRY = {}; // 例外：{ "<name_en>": level }，目前無
const cats = [
  { id: "field-control", tier: "core", name_zh: "場地／全隊控速", name_en: "Field / Side Speed Control", scope: "field", description_zh: "直接改變全隊或全場的速度關係：順風讓己方全隊速度加倍，戲法空間讓場上出手順序反轉（慢的先動）。" },
  { id: "spread-speed-drop", tier: "core", name_zh: "範圍降速技", name_en: "Spread Speed-Drop Moves", scope: "target", description_zh: "用範圍招式（或場地設置）降低對手速度；可能被特性、道具或屬性免疫。" },
  { id: "paralysis", tier: "core", name_zh: "麻痺", name_en: "Paralysis", scope: "target", description_zh: "用麻痺狀態讓單一對手變慢（並有機率無法行動）；電屬性等對象可能免疫。" },
  { id: "self-speed-boost", tier: "core", name_zh: "自身加速（天氣／特性）", name_en: "Self Speed Boost", scope: "self", description_zh: "靠天氣、場地或特性條件，讓寶可夢自己的速度提高（含衝浪之尾、加速）。" },
  { id: "item-speed", tier: "core", name_zh: "道具控速", name_en: "Item-based Speed", scope: "item", description_zh: "靠持有道具提高持有者速度，例如講究圍巾。" },
  { id: "temporary", tier: "core", name_zh: "暫時性控速", name_en: "Temporary Turn-Order Manipulation", scope: "temporary", description_zh: "只影響單一回合出手順序的手段，例如延後、您先請、釋陀果。" },
  { id: "priority-main", tier: "core", name_zh: "先制主力輸出", name_en: "Priority Main Attackers", scope: "priority", description_zh: "優先度大於 0、威力 70 以上的攻擊招式（門檻為使用者判斷），主攻手靠它先手輸出，不只是收殘。" },
  { id: "ability-priority", tier: "broad", name_zh: "特性式先制", name_en: "Ability-based Priority", scope: "priority", description_zh: "靠特性取得先制（疾風之翼、惡作劇之心）；要看是否為隊伍核心戰術。" },
  { id: "tempo-moves", tier: "broad", name_zh: "先制輔助招式", name_en: "Utility Priority Moves", scope: "priority", description_zh: "擊掌奇襲、迎頭一擊、佯攻等有先制的招式；要看是否為隊伍核心戰術。" },
  { id: "pledge-field", tier: "broad", name_zh: "誓約場地（濕地）", name_en: "Pledge Swamp", scope: "field", description_zh: "水之誓約與草之誓約合併後，在對手場地形成濕地，使該側全體速度降為 1/4（4 回合）。" },
  { id: "setup-speed", tier: "broad", name_zh: "自身提速（蝶舞、龍舞類）", name_en: "Self Speed Setup Moves", scope: "self", description_zh: "核心輸出手靠隊友掩護，自己用提升速度的變化招式（蝶舞、龍舞、高速移動等）加速。" },
  { id: "stat-drop-utility", tier: "broad", name_zh: "其他降速招式", name_en: "Other Speed-Drop Moves", scope: "target", description_zh: "重踏、吐絲、棉孢子等也會降速，但是否為這隊的主要控速要另外判斷。" },
  { id: "priority-cleanup", tier: "cleanup", name_zh: "收殘手段（不計入控速）", name_en: "Cleanup Priority Moves", scope: "priority", description_zh: "優先度大於 0 但威力低於 70 的攻擊招式，主要用於收掉殘血對手，不視為控速。" },
];
const E = [];
const add = (category, kind, en, o = {}) => {
  const zh = en2zh[kind][en];
  if (!zh) { console.error("NAME MISSING", kind, en); process.exitCode = 1; return; }
  const e = { category, tier: cats.find((c) => c.id === category).tier, level: LEVEL_BY_ENTRY[en] ?? LEVEL_BY_CATEGORY[category], kind, name_zh: zh, name_en: en, ...o };
  if (kind === "move") { const m = g.moves.get(en); if (!m.exists) { console.error("DEX MISSING", en); process.exitCode = 1; } else if (e.priority === undefined) e.priority = m.priority; }
  E.push(e);
};
// 1
add("field-control","move","Tailwind",{notes_zh:"己方全隊速度加倍 4 回合（dex：For 4 turns, allies' Speed is doubled）。",source:"dex"});
add("field-control","move","Trick Room",{notes_zh:"優先度 -7（最後行動），5 回合內出手順序反轉。",source:"dex"});
// 2
const gnd = "地面屬性（電屬性招式無效，dex 屬性相剋表）";
const elecAb = ["特性：蓄電","特性：避雷針","特性：電氣引擎"];
const statDrop = ["特性：恆淨之軀","特性：白色煙霧","特性：金屬防護","道具：清淨墜飾","特性：鏡甲（降速反彈）"];
add("spread-speed-drop","move","Icy Wind",{notes_zh:"冰屬性特殊招式，打全體對手，100% 降速 1 級；命中 95。",immunities:[...statDrop,"特性：不服輸／好勝（被降能力反而提升攻擊／特攻）"],source:"dex"});
add("spread-speed-drop","move","Electroweb",{notes_zh:"電屬性特殊招式，打全體對手，100% 降速 1 級；命中 95。",immunities:[gnd,...elecAb,...statDrop],source:"dex"});
add("spread-speed-drop","move","Sticky Web",{notes_zh:"對手場地設置，對手上場時（接地者）速度降 1 級。",immunities:["非接地者（dex：Lowers Speed of grounded foes）：例如飄浮、氣球、飛行屬性（待確認細節）",...statDrop],source:"dex"});
// 3
const par = ["特性：柔軟","特性：潔淨之鹽","特性：絕對睡眠","電屬性（麻痺免疫，dex 型別表介面未提供，待確認）"];
add("paralysis","move","Thunder Wave",{notes_zh:"變化招式，命中 90，必中麻痺；電屬性招式。",immunities:[gnd,...elecAb,...par],source:"dex"});
add("paralysis","move","Zap Cannon",{notes_zh:"電屬性特殊招式，命中 50，100% 麻痺。",immunities:[gnd,...elecAb,...par],source:"dex"});
add("paralysis","move","Nuzzle",{notes_zh:"電屬性物理接觸招式，命中 100，100% 麻痺。",immunities:[gnd,...elecAb,...par],source:"dex"});
add("paralysis","move","Glare",{notes_zh:"一般屬性變化招式，命中 100，麻痺；dex 標記無視屬性免疫（ghost 也可中）。",immunities:[...par],source:"dex"});
// 4
add("self-speed-boost","ability","Chlorophyll",{notes_zh:"晴天時速度加倍。",source:"dex"});
add("self-speed-boost","ability","Swift Swim",{notes_zh:"下雨時速度加倍。",source:"dex"});
add("self-speed-boost","ability","Sand Rush",{notes_zh:"沙暴時速度加倍。",source:"dex"});
add("self-speed-boost","ability","Slush Rush",{notes_zh:"下雪時速度加倍。",source:"dex"});
add("self-speed-boost","ability","Unburden",{notes_zh:"道具消耗／失去後速度加倍，換下場或獲得新道具／特性即失效。",source:"dex"});
add("self-speed-boost","ability","Surge Surfer",{notes_zh:"電氣場地時速度加倍。",source:"dex"});
add("self-speed-boost","ability","Speed Boost",{notes_zh:"每回合結束速度 +1 級。",source:"dex"});
// 5
add("item-speed","item","Choice Scarf",{notes_zh:"持有者速度 1.5 倍，但只能選第一個使出的招式。",source:"dex"});
// 6
add("temporary","move","Quash",{notes_zh:"使用者指定一隻對手，本回合改為最後行動。使用者原文的「延後」依名稱表對應 Quash（延後），[待確認] 是否即使用者所指。",source:"dex"});
add("temporary","move","After You",{notes_zh:"指定對象在使用者之後立刻行動（雙打常用於讓隊友提前行動）。",source:"dex"});
add("temporary","item","Custap Berry",{notes_zh:"HP 剩 1/4 以下時，同優先度中最先行動，單次使用。",source:"dex"});
// 7 先制攻擊招式：priority > 0、category 非 Status、非 Past；威力 >= BP_THRESHOLD → priority-main，否則 priority-cleanup。
// 例外：擊掌奇襲／迎頭一擊／佯攻／快手還擊用途偏輔助（首回合、擋保護、條件式），歸 broad 的 tempo-moves。
const UTILITY = new Set(["Fake Out", "First Impression", "Feint", "Upper Hand"]);
const protectAb = ["特性：鮮艷之軀／女王的威嚴／尾甲（擋住對手先制招式）"];
const prio = g.moves.all().filter((m) => m.exists && m.priority > 0 && m.category !== "Status" && !m.isNonstandard && en2zh.move[m.name]).sort((a, b) => b.priority - a.priority || b.basePower - a.basePower);
for (const m of prio) {
  const base = `優先度 +${m.priority}，威力 ${m.basePower}（dex）。`;
  if (UTILITY.has(m.name)) add("tempo-moves", "move", m.name, { base_power: m.basePower, notes_zh: base + (m.shortDesc || ""), immunities: protectAb, source: "dex" });
  else if (m.basePower >= BP_THRESHOLD) add("priority-main", "move", m.name, { base_power: m.basePower, notes_zh: base + "威力達門檻 70（使用者判斷）。" + (m.name === "Sucker Punch" || m.name === "Thunderclap" ? m.shortDesc : ""), immunities: m.type === "Electric" ? [gnd, ...elecAb, ...protectAb] : protectAb, source: "dex" });
  else add("priority-cleanup", "move", m.name, { base_power: m.basePower, notes_zh: base + "威力未達 70，視為收殘（使用者判斷）。", immunities: protectAb, source: "dex" });
}
// 8 特性式先制
add("ability-priority","ability","Gale Wings",{notes_zh:"滿 HP 時飛行屬性招式優先度 +1（dex）。",source:"dex"});
add("ability-priority","ability","Prankster",{notes_zh:"變化招式優先度 +1，但惡屬性對象免疫（dex）。",immunities:["惡屬性對象"],source:"dex"});
// 9 誓約（需同隊有水之誓約與草之誓約才成立）
for (const n of ["Water Pledge","Grass Pledge"]) add("pledge-field","move",n,{notes_zh:"水之誓約＋草之誓約由兩隻同回合使出，對手場地形成濕地：該側全體速度為 1/4，持續 4 回合（dex 招式說明與 condition.duration）。分類器要求同隊兩招都有才計入。",requires_team_has:["Water Pledge","Grass Pledge"],source:"dex"});
// 10 自身提速變化招式（挑常見者；速度升幅取自 dex boosts）
const SETUP = ["Agility","Rock Polish","Dragon Dance","Quiver Dance","Shift Gear","Shell Smash","Clangorous Soul"];
for (const n of SETUP) { const m = g.moves.get(n); add("setup-speed","move",n,{notes_zh:`自身速度 +${m.boosts.spe} 級（dex：${JSON.stringify(m.boosts)}）。`,source:"dex"}); }
// 11 其他降速
for (const n of ["Bulldoze","String Shot","Cotton Spore"]) { const m = g.moves.get(n); add("stat-drop-utility","move",n,{notes_zh:`目標 ${m.target}，速度 ${m.boosts?.spe ?? m.secondary?.boosts?.spe} 級（dex）。是否為主要控速待判斷。`,source:"dex"}); }
for (const c of cats) c.level = LEVEL_BY_CATEGORY[c.id];
const out = { version: 3, updated: "2026-11-10", note: "level：1＝直接顯示（順風、空間、核心戰術晉升者）、2＝次要控速（折疊）、3＝輔助與收殘（折疊，不屬於控速討論）。tier：core＝核心控速、broad＝廣義（看是否為隊伍核心戰術）、cleanup＝收殘（不計入控速）。依 @pkmn/dex（Gen 9）驗證；Champions 與 Gen 9 可能不同，均待確認。名稱以 data/ref/names_zh-Hant.json 為準。", categories: cats, entries: E };
writeFileSync(ROOT + "/data/ref/speed-control.json", JSON.stringify(out, null, 2) + "\n");
console.log(E.length, "entries");
