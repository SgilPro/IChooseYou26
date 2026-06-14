// 把 OCR 文字解析成「對戰事件」，並標記它來自哪一塊 ROI。
// 研究（03/04）建議：不要純信 OCR，要比對固定字典做模糊校正。
// 類別與規則依第一擁有者的測試回饋擴充（260614_2）。

import type { RegionKind } from "./regions";
import { detectEntities, type DetectedEntity, type EntityType } from "./dict";

export type EventKind =
  | "move" // 使用招式
  | "switch" // 換人 / 上場（含己方 Go! 與對方 sent out）
  | "ability" // 特性發動
  | "item" // 道具觸發
  | "stat" // 能力變化（威嚇/不服輸/劍舞…）
  | "status" // 異常狀態（中毒/灼傷/冰凍/睡眠/麻痺/畏縮）
  | "weather_terrain" // 天氣 / 場地 / 室
  | "faint" // 倒下
  | "effectiveness" // 效果絕佳 / 效果不好 / 擊中要害 / miss
  | "failed" // But it failed!（連保、靈騷沒道具…）
  | "recoil" // 受到反傷
  | "result" // 勝負 / 平手 / 投降
  | "hp" // HP 數值
  | "unknown";

export interface BattleEvent {
  id: string;
  t: number; // 影片時間（秒）
  turn: number; // 所屬回合（0 = 選出/先發階段）
  kind: EventKind;
  region: string; // 來源 ROI 標籤
  regionKind: RegionKind; // 來源 ROI 類型
  text: string; // 顯示用文字
  raw: string; // OCR 原始文字
  confidence: number;
  thumb: string;
  entities: DetectedEntity[]; // 字典校正偵測到的實體
}

// 規則順序＝優先序：先匹配先決定。英文為主（目前 OCR 預設 eng），輔以中/日常見字樣。
const RULES: { kind: EventKind; keywords: string[] }[] = [
  { kind: "result", keywords: ["you won", "you lost", "whited out", "forfeit", "it's a tie", "ended in a draw", "defeated the", "打敗", "投降", "平手", "輸了", "贏了"] },
  { kind: "failed", keywords: ["but it failed", "but nothing happened", "失敗", "うまくきまらなかった"] },
  { kind: "recoil", keywords: ["recoil", "hit with recoil", "受到反傷", "はんどう"] },
  { kind: "effectiveness", keywords: ["super effective", "not very effective", "no effect", "critical hit", "missed", "avoided the", "but it missed", "效果絕佳", "效果拔群", "效果不好", "要害", "沒有命中", "落空", "miss"] },
  { kind: "stat", keywords: ["rose", "fell", "sharply", "harshly", "won't go higher", "can't go any lower", "wasn't lowered", "won't be lowered", "能力", "提升", "下降", "上升"] },
  { kind: "faint", keywords: ["fainted", "倒下", "たおれた", "瀕死"] },
  { kind: "switch", keywords: ["go!", "sent out", "switched in", "withdrew", "come back", "that's enough", "派出", "收回", "換上", "上場", "くりだした", "ひっこめた"] },
  { kind: "status", keywords: ["poisoned", "badly poisoned", "burned", "frozen", "fell asleep", "is asleep", "paralyzed", "flinched", "confused", "中毒", "灼傷", "冰凍", "睡眠", "麻痺", "畏縮", "混亂"] },
  { kind: "weather_terrain", keywords: ["trick room", "rain", "sunlight", "sandstorm", "hail", "snow", "terrain", "tailwind", "perish", "晴天", "下雨", "沙暴", "冰雹", "場地", "順風", "滅歌"] },
  { kind: "item", keywords: ["berry", "restored", "leftovers", "life orb", "focus sash", "held", "道具", "果", "持有物"] },
  { kind: "ability", keywords: ["ability", "intimidate", "defiant", "drizzle", "drought", "特性", "とくせい"] },
  { kind: "move", keywords: ["used", "使用了", "のこうげき", "攻擊"] },
];

function classifyText(text: string): EventKind {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k.toLowerCase()))) return rule.kind;
  }
  return "unknown";
}

// 特性/道具 區：先判道具，否則視為特性。
function classifyAbilityItem(text: string): EventKind {
  const lower = text.toLowerCase();
  const itemKw = ["berry", "restored", "leftovers", "life orb", "focus sash", "held", "道具", "果"];
  if (itemKw.some((k) => lower.includes(k.toLowerCase()))) return "item";
  return "ability";
}

function classify(regionKind: RegionKind, text: string): EventKind {
  switch (regionKind) {
    case "ability": // 特性/道具 區
      return classifyAbilityItem(text);
    case "hp_opp":
    case "hp_self":
      return "hp";
    case "gamelog":
    case "other":
    default:
      return classifyText(text);
  }
}

export const KIND_LABEL: Record<EventKind, string> = {
  move: "使用招式",
  switch: "換人 / 上場",
  ability: "特性發動",
  item: "道具觸發",
  stat: "能力變化",
  status: "異常狀態",
  weather_terrain: "天氣 / 場地",
  faint: "倒下",
  effectiveness: "效果 / 要害 / 落空",
  failed: "失敗 (But it failed)",
  recoil: "受到反傷",
  result: "勝負 / 平手",
  hp: "HP 數值",
  unknown: "未分類",
};

// gamelog 區：理論上只會有寶可夢名/招式/事件，不會有特性名 → 實體只取 species/move。
// 特性/道具 區：取 ability/item。
function allowedEntityTypes(regionKind: RegionKind): EntityType[] | undefined {
  if (regionKind === "gamelog") return ["species", "move"];
  if (regionKind === "ability") return ["ability", "item"];
  return undefined;
}

// ---- 清理 / 去重（回饋 B-1, B-2）----

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9一-鿿]/g, "");
}
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[m];
}
function similar(a: string, b: string): boolean {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return na === nb;
  if (na === nb) return true;
  return lev(na, nb) / Math.max(na.length, nb.length) <= 0.2;
}

export interface CleanupOptions {
  /** 低於此信心且無 tag、無實體、文字過短 → 視為雜訊移除 */
  lowConf?: number;
}

/**
 * 清理事件（回饋 B-1/B-2）：
 *  - 移除「無 tag(unknown) + 信心過低 + 無實體 + 文字過短」的雜訊。
 *  - 相差 ≤1 秒、同區、文字極相似的連續 log，只留信心高的那筆。
 */
export function cleanupEvents(events: BattleEvent[], opts: CleanupOptions = {}): BattleEvent[] {
  const lowConf = opts.lowConf ?? 50;
  const denoised = events.filter(
    (e) => !(e.kind === "unknown" && e.confidence < lowConf && e.entities.length === 0 && norm(e.text).length < 4)
  );
  const sorted = [...denoised].sort((a, b) => a.t - b.t);
  const keep: BattleEvent[] = [];
  for (const e of sorted) {
    const idx = keep.findIndex(
      (k) => k.region === e.region && Math.abs(k.t - e.t) <= 1 && similar(k.text, e.text)
    );
    if (idx >= 0) {
      if (e.confidence > keep[idx].confidence) keep[idx] = e; // 留信心高的
    } else {
      keep.push(e);
    }
  }
  return keep;
}

let counter = 0;
export function makeEvent(args: {
  t: number;
  rawText: string;
  confidence: number;
  thumb: string;
  region: string;
  regionKind: RegionKind;
}): BattleEvent {
  const text = args.rawText.replace(/\s+/g, " ").trim();
  const isHp = args.regionKind === "hp_opp" || args.regionKind === "hp_self";
  const entities = isHp ? [] : detectEntities(text, allowedEntityTypes(args.regionKind));
  return {
    id: `ev_${counter++}`,
    t: args.t,
    turn: 0,
    kind: classify(args.regionKind, text),
    region: args.region,
    regionKind: args.regionKind,
    text,
    raw: args.rawText,
    confidence: args.confidence,
    thumb: args.thumb,
    entities,
  };
}
