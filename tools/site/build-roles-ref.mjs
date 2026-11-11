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
  for (const en of o.abilities_en || []) rules.ability.push({ name_zh: N.abilities.en2zh[en] ?? en, name_en: en });
  for (const en of o.items_en || []) rules.item.push({ name_zh: N.items.en2zh[en] ?? en, name_en: en });
  T.push({ id, group, name_zh, icon_name: ic, icon: icon(ic), manual_only: !(rules.move.length || rules.ability.length || rules.item.length), description_zh: o.d || "", examples_zh: o.ex || [], heuristic_zh: o.h || [], rules });
};
// 顏色分組：attacker＝黃、tactic＝藍、support＝綠（使用者 2026-11-11）
// 攻擊三兄弟（2026-11-11 使用者：名稱統一兩個字；主攻／副攻／攻擊，不再限定手動標，由 classify-roles.mjs 依招式、能力與標題推斷，推斷者以虛線顯示）
tag("main-attacker", "attacker", "主攻", "chess-queen", { h: ["影片標題或隊名圍繞這隻（+3）", "Mega 位且有 3 個以上攻擊招式（+2）；Mega 中少數輔助型（如 Mega 差不多娃娃）攻擊招式少，不會命中", "神獸／幻獸（+2）", "天氣隊的受益輸出手：隊上有對應天氣的設置者，且持有雨天電光束、雪天暴風雪、晴天日光束／氣象球等（+2）", "攻擊性格（+1）、攻擊或特攻能力點偏高（+1）", "得分 ≥ 3 取前兩名（雙核心）。僅當有 2 個以上攻擊招式才計分"], d: "核心輸出（主輸出）：隊伍戰術資源圍繞的火力來源；Mega／神獸位、天氣隊的受益輸出手（雨天鋁鋼橋龍的電光束、雪天雪妖女的暴風雪、晴天氣象球／日光束持有者）、有您先請等資源配合者。可不只一隻（雙核心）。", ex: ["Mega 甲賀忍蛙（甲賀忍蛙隊的核心輸出）", "雙主攻：Mega Y 噴火龍＋Mega 花葉蒂、Mega 妖火紅狐＋Mega 水箭龜（只是模式不同）", "天氣隊的輸出手：雨天鋁鋼橋龍（電光束不用等下一回合）、雪天雪妖女（暴風雪滿命中）、晴天 Mega Y 噴火龍／Mega 火炎獅", "配合核心戰術：空間白馬王、空間紅蓮鎧騎、順風暴飛龍；被您先請送出噴火的輸出手", "Mega 巨沼怪若是物攻版本也是主攻（忍蛙隊那隻是特攻，屬副攻）"] });
tag("sub-attacker", "attacker", "副攻", "chess-knight", { h: ["不是主攻，且有 2 個以上攻擊招式，並且帶三種以上屬性的攻擊招式（廣技能池補盲），或帶先制攻擊招式收殘（不含擊掌奇襲等輔助型先制）"], d: "聯攻補盲：補足主攻不好處理的打點，常帶廣的技能池（三個屬性以上的攻擊招式）或先制收殘；火力不一定比較弱，只是較不是戰術資源圍繞的對象，更常是百搭型隊友。", ex: ["仆斬將軍、公幽尾玄魚（先制技能收殘）", "圍巾烈咬陸鯊、甜冷美后、艾路雷朵、多龍", "風速狗／洗翠風速狗", "Mega 巨沼怪（忍蛙隊：特攻不高，補盲並帶資訊不對等的奇攻概念，戰術第二主線）"] });
tag("attacker", "attacker", "攻擊", "chess-rook", { h: ["不是主攻或副攻，但帶 3 個以上攻擊招式：確實在追求傷害，只是分不出定位時的中性標籤"], d: "確實在追求傷害（攻擊招式多、攻擊性格或能力），但分不出是主攻還是副攻時用的中性標籤。", ex: ["攻擊招式多、有攻擊性格，但資料不足以判斷戰術定位"] });
tag("weather", "tactic", "天氣", "cloud-sun-rain", { abilities: ["降雨", "日照", "揚沙", "降雪", "始源之海", "終結之地", "德爾塔氣流", "吐沙", "緋紅脈動", "歸零化境"], moves: ["求雨", "大晴天", "沙暴", "雪景", "冷笑話"], ex: ["主攻：Mega Y 噴火龍、蓋歐卡、故勒頓", "副攻：大嘴鷗、班基拉斯、雙倍多多冰", "輔助：阿羅拉九尾、求雨勾魂眼、大晴天酷豹、冷笑話呆呆王、沙暴鑰圈兒"], d: "改變天氣的特性與招式（依 52poke，剔除第九世代已移除的冰雹，以及不屬於本作的極巨招式）。" });
tag("terrain", "tactic", "場地", "layer-arrow-up", { abilities: ["電氣製造者", "精神製造者", "薄霧製造者", "青草製造者", "掉出種子", "強子引擎"], moves: ["電氣場地", "青草場地", "精神場地", "薄霧場地"], ex: ["主攻：密勒頓", "副攻：金剛猩", "輔助：愛管侍"], d: "改變場地的特性與招式（極巨招式與起源超新星大爆炸不屬於本作，不收）。" });
tag("trick-room", "tactic", "空間", "box", { moves: ["戲法空間"], ex: ["主攻：空間白馬王、空間紅蓮鎧騎", "副攻：空間奇麒麟", "輔助：空間來悲粗茶"] });
tag("tailwind", "tactic", "順風", "wind", { moves: ["順風"], ex: ["主攻：順風暴飛龍", "副攻：順風烈箭鷹、順風三首惡龍、順風大嘴鷗", "輔助：順風風妖精"] });
// 控速手＝「幫隊友控速」（讓輸出手先動）：只收把對手變慢或改變出手順序的招式。不收：自身加速（葉綠素、圍巾、蝶舞龍舞）、先制主力、道具、特性、誓約（單一角色無法造成）。順風、空間各有標籤；黏黏網 Level 3 不計；釋陀果不納入。
const SPEED_HELP_CATS = ["spread-speed-drop", "paralysis", "temporary", "stat-drop-utility"];
const scEntries = SC.entries.filter((e) => e.kind === "move" && e.level <= 2 && SPEED_HELP_CATS.includes(e.category) && !["Tailwind", "Trick Room"].includes(e.name_en));
tag("speed-other", "tactic", "控速", "sport-shoe", { moves_en: scEntries.map((e) => e.name_en), ex: ["範圍降速：冰凍之風、電網、吐絲（可能被免疫）", "麻痺：電磁波、電磁砲、蹭蹭臉頰、大蛇瞪眼（幫隊友把對手變慢）", "一回合的順序操縱：延後、您先請（例：愛管侍帶講究圍巾加您先請）", "不算：自己帶講究圍巾或葉綠素而沒有配合您先請、蝶舞龍舞（自身強化）、誓約（單一角色無法造成）"], d: "「幫隊友（輸出手）控速」的手段，順風、空間以外：讓對手變慢（範圍降速、麻痺）或改變出手順序（延後、您先請）。自身加速不算。" });
tag("tactic-other", "tactic", "戰術", "tic-tac-toe", { abilities: ["化學變化氣體"], moves: ["找夥伴", "輸電", "浸水"], ex: ["化學變化氣體：消掉負面特性（慢啟動、菌絲之力）", "找夥伴：給隊友好用的特性", "輸電、浸水：改對手屬性（同時可能是減傷或增傷用途）。註：輸電在第九世代已移除，僅保留在對照表"], d: "其他特殊核心戰術。釋陀果之後若為核心戰術可在此補充。" });
tag("cover", "support", "掩護", "shield", { moves: ["看我嘛", "憤怒粉", "廣域防守", "交換場地", "快速防守"], abilities: ["女王的威嚴", "鮮艷之軀", "尾甲", "精神製造者", "甜幕", "芳香幕"], ex: ["防止傷害：看我嘛、廣域防守、交換場地", "阻止干擾：快速防守（防擊掌）、尾甲／女王的威嚴／鮮豔之軀（防擊掌）、精神場地／精神製造者（防擊掌）、甜幕（防睡眠）、芳香幕（防心靈攻擊招式）", "電氣製造者多半不是為了掩護，不收；友情防守歸減傷"], d: "幫輸出減傷、免傷、轉移傷害或阻止干擾。" });
tag("dmg-boost", "support", "增傷", "circle-chevrons-up", { moves: ["指導", "長嚎", "裝飾", "點穴", "假哭", "金屬音", "刺耳聲", "幫助"], ex: ["增傷：指導、長嚎、裝飾、點穴", "降對手防禦：假哭、金屬音、刺耳聲", "暫時增傷：幫助", "特殊增傷（需手動標）：圍攻打自己的氣勢猴提升憤怒之拳威力；打自己有弱點保險的隊友提高雙攻；輸出手有避雷針、輔助手打放電；輸出手有食草"], d: "增傷、降對手防禦、暫時增傷（特殊增傷需手動標）。" });
tag("mitigator", "support", "減傷", "circle-chevrons-down", { moves: ["指導", "磁場操控", "鮮花防守", "點穴", "芳香薄霧", "撒嬌", "圓瞳", "蟲之抵抗", "鬼火", "潑冷水"], abilities: ["友情防守"], ex: ["增防：指導、磁場操控、鮮花防守、點穴、芳香薄霧", "降對手攻擊：撒嬌、圓瞳、蟲之抵抗、潑冷水、鬼火（透過灼傷）", "友情防守（特性）：降低隊友受到的傷害"], d: "增防、降對手攻擊、減少隊友受傷。" });
tag("disruptor", "support", "干擾", "pumpkin-scary", { moves: ["擊掌奇襲", "定身法", "再來一次", "挑釁", "哈欠", "蘑菇孢子", "催眠粉", "虛張聲勢", "戲法"], ex: ["讓對手不能動作或限制動作：擊掌奇襲、定身法、再來一次、挑釁（阻止強化或控速）", "上負面狀態：哈欠、蘑菇孢子、催眠粉、虛張聲勢", "戲法：給對手講究道具"], d: "讓對手不能動作、限制動作、上負面狀態。改對手屬性（輸電、浸水）歸戰術。" });
tag("healer", "support", "治療", "cross", { moves: ["生命水滴", "治癒波動", "花療", "新月祈禱", "復生祈禱", "祈願", "花粉團", "治癒之願", "新月舞"], abilities: ["款待"], ex: ["生命水滴、治癒波動、款待（特性）、花療、新月祈禱", "復生祈禱、祈願、花粉團、治癒之願、新月舞", "特殊回血（需手動標）：儲水／蓄電／食土／乾燥皮膚，配上地震、衝浪、放電等群體攻擊"], d: "替隊友回復。特殊回血需手動標。" });
tag("controller", "support", "控制", "traffic-cone", { moves: ["佯攻", "死纏爛打", "黑色目光", "縫影"], abilities: ["踩影", "沙穴"], ex: ["不讓對方換人：踩影、死纏爛打", "破對面防守：佯攻"], d: "不讓對方換人、破對面防守。" });
writeFileSync(ROOT + "/data/ref/roles.json", JSON.stringify({ version: 3, updated: "2026-11-11", note: "角色／功能標籤。group：attacker 黃、tactic 藍、support 綠。rules 命中＝「推斷」（UI 虛線邊框）；analysis.roles 手動標＝「確認」（實線）。一隻可有多個。圖示：lucide（ISC）與 tabler（MIT），見 assets/icons/roles/README.md。", tags: T }, null, 2) + "\n");
console.log(T.length, "tags；找不到名稱：", miss.join(" ") || "無");
