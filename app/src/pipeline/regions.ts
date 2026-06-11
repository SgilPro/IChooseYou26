// 多塊 ROI（region）模型。
// 第一擁有者觀察到實戰中有 4 塊值得監看的區域，這裡定義其型別與預設值。
// 座標都是相對比例 0~1（相對影片畫面寬高），所以不同解析度通用。

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
  ability: "特性發動",
  hp_opp: "對方 HP",
  hp_self: "我方 HP",
  other: "其他",
};

let counter = 0;
export function newRegionId(): string {
  return `roi_${counter++}`;
}

// 預設 4 塊（依第一擁有者描述的相對位置；實際請用 ROI crop 介面校準）：
// 1. 對方寶可夢 HP：右上
// 2. 我方寶可夢 HP：左下
// 3. 核心 GameLog：中間偏下偏左（最重要，預設開 keyframe+ocr）
// 4. 特性發動：中間靠右、垂直偏正中
export function defaultRegions(): Region[] {
  return [
    { id: newRegionId(), label: "對方 HP", kind: "hp_opp", x: 0.62, y: 0.05, w: 0.33, h: 0.12, ocr: true, keyframe: false },
    { id: newRegionId(), label: "我方 HP", kind: "hp_self", x: 0.05, y: 0.70, w: 0.33, h: 0.12, ocr: true, keyframe: false },
    { id: newRegionId(), label: "核心 GameLog", kind: "gamelog", x: 0.06, y: 0.78, w: 0.56, h: 0.18, ocr: true, keyframe: true },
    { id: newRegionId(), label: "特性發動", kind: "ability", x: 0.55, y: 0.32, w: 0.26, h: 0.36, ocr: true, keyframe: true },
  ];
}
