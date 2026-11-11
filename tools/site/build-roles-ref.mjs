import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// 產生 data/ref/roles.json（角色／功能標籤表）。來源：使用者 2026-11-10 的分類（data/knowledge/doubles/roles.md）。
// 用法：node tools/site/build-roles-ref.mjs
// rules 以中文名撰寫，轉成英文名比對；找不到的名稱會列出（不寫入）。主攻手／副攻手無法由招式推斷，只能由 analysis.roles 手動標。
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const N = JSON.parse(readFileSync(ROOT + "/data/ref/names_zh-Hant.json", "utf8"));
const z2e = { move: N.moves.zh2en, ability: N.abilities.zh2en, item: N.items.zh2en };
const T = []; const miss = [];
const SC = JSON.parse(readFileSync(ROOT + "/data/ref/speed-control.json", "utf8"));
const icon = (name) => {
  const f = readFileSync(`${ROOT}/assets/icons/roles/${name}.svg`, "utf8");
  return f.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/\s+/g, " ").trim();
};
const tag = (id, group, name_zh, ic, o = {}) => {
  const rules = { move: [], ability: [], item: [] };
  for (const [kind, key] of [["move", "moves"], ["ability", "abilities"], ["item", "items"]])
    for (const zh of o[key] || []) { const en = z2e[kind][zh]; if (en) rules[kind].push({ name_zh: zh, name_en: en }); else miss.push(`${kind}:${zh}`); }
  for (const en of o.moves_en || []) rules.move.push({ name_zh: N.moves.en2zh[en] ?? en, name_en: en });
  T.push({ id, group, name_zh, icon_name: ic, icon: icon(ic), manual_only: !(rules.move.length || rules.ability.length || rules.item.length), description_zh: o.d || "", rules });
};
// 顏色分組：attacker＝黃、tactic＝藍、support＝綠（使用者 2026-11-11）
tag("main-attacker", "attacker", "主輸出", "chess-queen", { d: "核心輸出，通常呼應核心戰術；可不只一隻（雙核心）。只能手動標。" });
tag("sub-attacker", "attacker", "副輸出／補盲", "chess-knight", { d: "多屬性打點或與主攻互補；Mega 不等於核心。只能手動標。" });
tag("weather", "tactic", "天氣", "cloud-sun-rain", { abilities: ["降雨", "日照", "揚沙", "降雪", "預知夢", "始源之海", "終結之地", "德爾塔氣流", "緋紅脈動"], moves: ["求雨", "大晴天", "沙暴", "雪景", "冰雹"] });
tag("terrain", "tactic", "場地", "layer-arrow-up", { abilities: ["電氣製造者", "青草製造者", "精神製造者", "薄霧製造者", "強子引擎"], moves: ["電氣場地", "青草場地", "精神場地", "薄霧場地"] });
tag("trick-room", "tactic", "空間", "box", { moves: ["戲法空間"] });
tag("tailwind", "tactic", "順風", "wind", { moves: ["順風"] });
// 控速（順風、空間以外）：依 speed-control.json 的範圍降速、麻痺、暫時性、其他降速招式（Level 2 的招式；黏黏網為 Level 3 不計）
tag("speed-other", "tactic", "控速", "sport-shoe", { moves_en: SC.entries.filter((e) => e.kind === "move" && e.level === 2 && ["spread-speed-drop", "paralysis", "temporary", "stat-drop-utility"].includes(e.category)).map((e) => e.name_en), d: "順風、空間以外的控速：範圍降速（冰凍之風、電網）、麻痺、延後、您先請、吐絲等。" });
tag("tactic-other", "tactic", "戰術", "tic-tac-toe", { abilities: ["化學變化氣體"], moves: ["找夥伴"], d: "其他特殊核心戰術：消掉負面特性（慢啟動、菌絲之力）、給隊友好用特性。" });
tag("cover", "support", "掩護", "shield", { moves: ["看我嘛", "憤怒粉", "廣域防守", "交換場地", "快速防守"], abilities: ["友情防守", "女王的威嚴", "鮮艷之軀", "尾甲", "精神製造者", "電氣製造者", "甜幕", "芳香幕"], d: "幫輸出減傷、免傷、轉移傷害或阻止干擾。" });
tag("dmg-boost", "support", "增傷", "circle-chevrons-up", { moves: ["指導", "長嚎", "裝飾", "點穴", "假哭", "潑冷水", "金屬音", "刺耳聲", "幫助"], d: "增傷、降對手防禦、暫時增傷（特殊增傷如避雷針＋放電需手動標）。" });
tag("mitigator", "support", "減傷", "circle-chevrons-down", { moves: ["指導", "磁場操控", "鮮花防守", "點穴", "芳香薄霧", "撒嬌", "圓瞳", "蟲之抵抗", "鬼火"], d: "增防、降對手攻擊。" });
tag("disruptor", "support", "干擾", "pumpkin-scary", { moves: ["擊掌奇襲", "定身法", "再來一次", "挑釁", "哈欠", "蘑菇孢子", "催眠粉", "虛張聲勢", "戲法", "輸電", "浸水"], d: "讓對手不能動作、限制動作、上負面狀態或改屬性。" });
tag("healer", "support", "治療", "cross", { moves: ["生命水滴", "治癒波動", "花療", "新月祈禱"], abilities: ["款待"], d: "特殊回血（儲水／蓄電／食土配群體攻擊）需手動標。" });
tag("controller", "support", "控制", "traffic-cone", { moves: ["佯攻", "死纏爛打", "黑色目光", "縫影"], abilities: ["踩影", "沙穴"], d: "不讓對方換人、破對面防守。" });
writeFileSync(ROOT + "/data/ref/roles.json", JSON.stringify({ version: 2, updated: "2026-11-11", note: "角色／功能標籤。group：attacker 黃、tactic 藍、support 綠。rules 命中＝「推斷」（UI 虛線邊框）；analysis.roles 手動標＝「確認」（實線）。一隻可有多個。圖示：lucide（ISC）與 tabler（MIT），見 assets/icons/roles/README.md。", tags: T }, null, 2) + "\n");
console.log(T.length, "tags；找不到名稱：", miss.join(" ") || "無");
