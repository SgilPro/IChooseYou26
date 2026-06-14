// 字典模糊校正：OCR 出來的雜訊文字，snap 到最接近的合法寶可夢/招式/特性/道具名。
// 研究建議的「最便宜、最高槓桿的準確度保險」。資料來自 @pkmn/dex（純前端，無需 API）。
//
// 限制（誠實）：@pkmn/dex 是英文名稱，所以此校正主要對 eng OCR 有效。
// 中文 / 日文需要另建 zh-Hant / ja 名稱對照表（見領域線 03 文件），未來再做。

import Fuse from "fuse.js";

export type EntityType = "species" | "move" | "ability" | "item";

interface DictEntry {
  name: string;
  type: EntityType;
}

let fuse: Fuse<DictEntry> | null = null;

/**
 * 預載字典（動態 import @pkmn/dex，避免進初始 bundle）。
 * 在跑 OCR 迴圈前 await 一次即可；之後 detectEntities/bestMatch 可同步使用。
 */
export async function ensureDict(): Promise<void> {
  if (fuse) return;
  const { Dex } = await import("@pkmn/dex");
  const entries: DictEntry[] = [];
  for (const s of Dex.species.all()) if (s.exists !== false) entries.push({ name: s.name, type: "species" });
  for (const m of Dex.moves.all()) entries.push({ name: m.name, type: "move" });
  for (const a of Dex.abilities.all()) if (a.name !== "No Ability") entries.push({ name: a.name, type: "ability" });
  for (const it of Dex.items.all()) entries.push({ name: it.name, type: "item" });
  fuse = new Fuse(entries, {
    keys: ["name"],
    includeScore: true,
    threshold: 0.3, // 0=完全相符；越小越嚴格
    ignoreLocation: true,
    minMatchCharLength: 3,
  });
}

export interface DetectedEntity {
  name: string;
  type: EntityType;
  score: number; // 0~1，越大越像
}

const MATCH_CUTOFF = 0.3; // Fuse score 上限（越小越像）

/** 從一段（含雜訊的）文字裡，找出疑似出現的寶可夢/招式/特性/道具。
 *  allowedTypes 可限制只回傳某些類型（例如 gamelog 區只要 species/move）。 */
export function detectEntities(
  text: string,
  allowedTypes?: EntityType[],
  maxResults = 6
): DetectedEntity[] {
  if (!fuse) return []; // 字典未載入（未呼叫 ensureDict）→ 不校正
  const f = fuse;
  const words = text.split(/[^A-Za-z0-9'.-]+/).filter((w) => w.length >= 3);
  if (words.length === 0) return [];
  const windows = new Set<string>();
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i + n <= words.length; i++) windows.add(words.slice(i, i + n).join(" "));
  }
  const found = new Map<string, DetectedEntity>();
  for (const win of windows) {
    const r = f.search(win, { limit: 1 })[0];
    if (r && r.score != null && r.score <= MATCH_CUTOFF) {
      if (allowedTypes && !allowedTypes.includes(r.item.type)) continue;
      const key = r.item.type + ":" + r.item.name;
      const score = 1 - r.score;
      const prev = found.get(key);
      if (!prev || score > prev.score) found.set(key, { name: r.item.name, type: r.item.type, score });
    }
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, maxResults);
}

/** 把一段（理應是單一名稱的）文字 snap 到最接近的合法名稱。 */
export function bestMatch(text: string): DetectedEntity | null {
  if (!fuse) return null;
  const t = text.trim();
  if (t.length < 3) return null;
  const r = fuse.search(t, { limit: 1 })[0];
  if (r && r.score != null && r.score <= MATCH_CUTOFF) {
    return { name: r.item.name, type: r.item.type, score: 1 - r.score };
  }
  return null;
}
