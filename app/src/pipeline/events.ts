// 把 OCR 文字粗略解析成「對戰事件」，並標記它來自哪一塊 ROI。
// 研究（03/04）建議：不要純信 OCR，要比對固定字典做模糊校正。
// 這裡是原型版的規則式解析——之後可接更完整的字典與狀態機（04-log-structuring）。

import type { RegionKind } from "./regions";

export type EventKind =
  | "ability" // 特性發動
  | "move" // 使用招式
  | "switch" // 換人 / 上場
  | "faint" // 倒下
  | "status" // 狀態變化
  | "weather_terrain" // 天氣 / 場地
  | "hp" // HP 數值
  | "unknown";

export interface BattleEvent {
  id: string;
  t: number; // 影片時間（秒）
  kind: EventKind;
  region: string; // 來源 ROI 標籤
  regionKind: RegionKind; // 來源 ROI 類型
  text: string; // 顯示用文字（OCR 原文或正規化後）
  raw: string; // OCR 原始文字
  confidence: number;
  thumb: string;
}

// 多語關鍵字（繁中 / 英 / 日 常見字樣），用來粗分 gamelog 區的事件類型。
const RULES: { kind: EventKind; keywords: string[] }[] = [
  { kind: "ability", keywords: ["特性", "Ability", "とくせい", "威嚇", "Intimidate", "不服輸", "Defiant"] },
  { kind: "faint", keywords: ["倒下", "fainted", "たおれた", "瀕死"] },
  { kind: "switch", keywords: ["收回", "換上", "上場", "withdrew", "sent out", "switched", "ひっこめた", "くりだした"] },
  { kind: "status", keywords: ["中毒", "麻痺", "灼傷", "睡眠", "冰凍", "混亂", "paralyzed", "burned", "poisoned", "asleep", "frozen", "confused"] },
  { kind: "weather_terrain", keywords: ["晴天", "下雨", "沙暴", "冰雹", "場地", "trick room", "rain", "sun", "sandstorm", "terrain", "weather"] },
  { kind: "move", keywords: ["使用了", "used", "のこうげき", "攻擊"] },
];

function classifyText(text: string): EventKind {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k) || lower.includes(k.toLowerCase()))) {
      return rule.kind;
    }
  }
  return "unknown";
}

/** 依 ROI 類型 + 文字內容決定事件類型 */
function classify(regionKind: RegionKind, text: string): EventKind {
  switch (regionKind) {
    case "ability":
      return "ability";
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
  ability: "特性發動",
  move: "使用招式",
  switch: "換人 / 上場",
  faint: "倒下",
  status: "狀態變化",
  weather_terrain: "天氣 / 場地",
  hp: "HP 數值",
  unknown: "未分類",
};

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
  return {
    id: `ev_${counter++}`,
    t: args.t,
    kind: classify(args.regionKind, text),
    region: args.region,
    regionKind: args.regionKind,
    text,
    raw: args.rawText,
    confidence: args.confidence,
    thumb: args.thumb,
  };
}
