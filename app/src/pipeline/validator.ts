// GameLog validator v0（回饋 260614_3 的下一步工項）：
// 用規則找出「疑似遺漏 / 不合理」的 log，提示使用者補。
// v0 只做不依賴 HP / 回合分組（兩者目前停用）的規則。

import type { BattleEvent } from "./events";
import { secToClock } from "./time";

export interface Warning {
  level: "warn" | "info";
  msg: string;
}

const ACTION_KINDS = new Set(["move", "switch", "faint"]);

export function validateLog(events: BattleEvent[]): Warning[] {
  const w: Warning[] = [];
  if (events.length === 0) return [{ level: "warn", msg: "沒有任何事件——可能 ROI 沒框準、最低信心設太高，或來源沒內容。" }];

  const sorted = [...events].sort((a, b) => a.t - b.t);

  // 1. 某寶可夢出現過，卻從未出招/換上/倒下 → 可能漏記動作（旗艦規則）
  const species = new Map<string, { any: boolean; action: boolean }>();
  for (const e of sorted) {
    for (const en of e.entities) {
      if (en.type !== "species") continue;
      const rec = species.get(en.name) ?? { any: false, action: false };
      rec.any = true;
      if (ACTION_KINDS.has(e.kind)) rec.action = true;
      species.set(en.name, rec);
    }
  }
  for (const [name, rec] of species) {
    if (rec.any && !rec.action) {
      w.push({ level: "warn", msg: `「${name}」在紀錄中出現過，但沒看到牠出招 / 換上 / 倒下——可能漏記了動作。` });
    }
  }

  // 2. 時間大跳（只在「影片模式」有意義；圖片模式 t 是 0..n-1 索引就跳過）
  const looksIndexed = sorted.every((e, i) => e.t === i);
  if (!looksIndexed) {
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].t - sorted[i - 1].t;
      if (gap > 30) {
        w.push({ level: "info", msg: `${secToClock(sorted[i - 1].t)} ~ ${secToClock(sorted[i].t)} 之間約 ${Math.round(gap)} 秒沒有任何事件——可能漏抓畫面。` });
      }
    }
  }

  // 3. 低信心熱區
  const low = sorted.filter((e) => e.confidence < 50).length;
  if (low >= Math.max(3, Math.ceil(sorted.length * 0.3))) {
    w.push({ level: "warn", msg: `有 ${low} 筆低信心 (<50) 事件，建議人工複查、調整 ROI 或提高「最低信心」。` });
  }

  // 4. 事件只來自單一 ROI
  const regions = new Set(sorted.map((e) => e.region));
  if (regions.size === 1) {
    w.push({ level: "info", msg: `所有事件都來自單一 ROI（${[...regions][0]}）——其他區可能沒框準或沒辨識到內容。` });
  }

  return w;
}
