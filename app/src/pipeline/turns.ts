// 回合分組（turn segmentation）：把扁平的事件流歸進「第幾回合」。
// 這是產品核心承諾「一回合一回合的紀錄」的第一步。
//
// 策略（兩段式，誠實面對不確定性）：
//  1. 若 OCR 文字裡有明確的回合標記（Turn 3 / 第3回合 / ターン3）→ 以它為權威邊界。
//  2. 否則退回「時間間隔」啟發式：事件間隔超過門檻就視為新回合（粗略但有用，且可人工修正）。
// 回合 0 保留給「選出 / 先發」階段（第一個回合標記之前）。

import type { BattleEvent } from "./events";

const TURN_RE = /(?:turn|回合|ターン)\s*[:#]?\s*(\d{1,2})/i;

export function detectTurnMarker(text: string): number | null {
  const m = TURN_RE.exec(text);
  return m ? parseInt(m[1], 10) : null;
}

export interface SegmentOptions {
  /** 退回啟發式時，間隔超過幾秒視為新回合 */
  gapSec: number;
}

/** 回傳帶上 turn 的「新事件陣列」（不就地修改），依時間排序。 */
export function assignTurns(events: BattleEvent[], opts: SegmentOptions): BattleEvent[] {
  const sorted = [...events].sort((a, b) => a.t - b.t);
  const hasMarkers = sorted.some((e) => detectTurnMarker(e.text) != null);

  if (hasMarkers) {
    let cur = 0; // 第一個標記前＝選出/先發
    return sorted.map((e) => {
      const m = detectTurnMarker(e.text);
      if (m != null) cur = m;
      return { ...e, turn: cur };
    });
  }

  // 退回：時間間隔啟發式
  let turn = 1;
  let lastT = sorted.length ? sorted[0].t : 0;
  return sorted.map((e) => {
    if (e.t - lastT > opts.gapSec) turn++;
    lastT = e.t;
    return { ...e, turn };
  });
}

/** 把事件依 turn 分組（回傳已排序的 [turn, events] 清單）。 */
export function groupByTurn(events: BattleEvent[]): { turn: number; events: BattleEvent[] }[] {
  const map = new Map<number, BattleEvent[]>();
  for (const e of events) {
    if (!map.has(e.turn)) map.set(e.turn, []);
    map.get(e.turn)!.push(e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([turn, evs]) => ({ turn, events: evs.sort((a, b) => a.t - b.t) }));
}
