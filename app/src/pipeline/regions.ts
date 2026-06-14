// 多塊 ROI（region）模型 + 官方預設（依 OCR 語言）。
// 座標都是相對比例 0~1（相對影片畫面寬高），不同解析度通用。

export type RegionKind = "gamelog" | "ability" | "hp_opp" | "hp_self" | "other";

export interface Region {
  id: string;
  label: string;
  kind: RegionKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 是否對此區做 OCR（產生事件） */
  ocr: boolean;
  /** 是否把此區納入「關鍵影格」判定（畫面有變化才保留） */
  keyframe: boolean;
}

export const KIND_LABEL: Record<RegionKind, string> = {
  gamelog: "核心 GameLog",
  ability: "特性 / 道具", // 回饋 B-8：特性發動 → 特性/道具
  hp_opp: "對方 HP",
  hp_self: "我方 HP",
  other: "其他",
};

let counter = 0;
export function newRegionId(): string {
  return `roi_${counter++}`;
}

type PresetRegion = Omit<Region, "id">;

// 官方提供的 ROI 預設（依 OCR 語言）。英文為第一擁有者 2026-06-14 實測值。
// 中文待補；未涵蓋的語言 fallback 到 eng。
const OFFICIAL_PRESETS: Record<string, PresetRegion[]> = {
  eng: [
    { label: "對方 HP", kind: "hp_opp", x: 0.561, y: 0.035, w: 0.42, h: 0.12, ocr: true, keyframe: false },
    { label: "我方 HP", kind: "hp_self", x: 0.016, y: 0.852, w: 0.42, h: 0.12, ocr: true, keyframe: false },
    { label: "核心 GameLog", kind: "gamelog", x: 0.152, y: 0.723, w: 0.56, h: 0.07, ocr: true, keyframe: true },
    { label: "特性 / 道具", kind: "ability", x: 0.804, y: 0.426, w: 0.12, h: 0.1, ocr: true, keyframe: true },
  ],
};

/** 是否有該語言的官方預設（沒有就 fallback eng）。 */
export function hasOfficialPreset(lang: string): boolean {
  return lang in OFFICIAL_PRESETS;
}

/** 取得某 OCR 語言的官方 ROI 預設（帶新 id）。未知語言 fallback eng。 */
export function officialRegions(lang: string): Region[] {
  const key = OFFICIAL_PRESETS[lang] ? lang : "eng";
  return OFFICIAL_PRESETS[key].map((r) => ({ ...r, id: newRegionId() }));
}

/** 預設（＝英文官方預設）。 */
export function defaultRegions(): Region[] {
  return officialRegions("eng");
}
