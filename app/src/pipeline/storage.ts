// 本機持久化：
//  - GameLog 存 IndexedDB（事件 + 縮圖可能較大）
//  - ROI preset 存 localStorage（小、好讀），並支援匯出/匯入 JSON
// 全部本機，不上傳。對應構思 03 的 A/B 項。

import type { BattleEvent } from "./events";
import type { Region } from "./regions";
import type { Segment } from "./frames";

// ---------- ROI preset（localStorage） ----------

const PRESET_KEY = "vgc.roiPresets";

export interface RoiPreset {
  name: string;
  regions: Region[];
}

export function listPresets(): RoiPreset[] {
  try {
    return JSON.parse(localStorage.getItem(PRESET_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePreset(name: string, regions: Region[]): void {
  const presets = listPresets().filter((p) => p.name !== name);
  presets.push({ name, regions });
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}

export function deletePreset(name: string): void {
  localStorage.setItem(PRESET_KEY, JSON.stringify(listPresets().filter((p) => p.name !== name)));
}

export function exportPresets(): string {
  return JSON.stringify(listPresets(), null, 2);
}

/** 匯入 preset JSON（合併，同名覆蓋）。回傳匯入筆數。 */
export function importPresets(json: string): number {
  const incoming: RoiPreset[] = JSON.parse(json);
  if (!Array.isArray(incoming)) throw new Error("格式不符（應為 preset 陣列）");
  const map = new Map(listPresets().map((p) => [p.name, p]));
  for (const p of incoming) if (p?.name && Array.isArray(p.regions)) map.set(p.name, p);
  localStorage.setItem(PRESET_KEY, JSON.stringify([...map.values()]));
  return incoming.length;
}

// ---------- GameLog（IndexedDB） ----------

const DB_NAME = "vgc-gamelog";
const DB_VER = 1;
const STORE = "logs";

export interface SavedLog {
  id: string;
  name: string;
  savedAt: string;
  events: BattleEvent[];
  regions: Region[];
  segments: Segment[];
}

export interface SavedLogMeta {
  id: string;
  name: string;
  savedAt: string;
  eventCount: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const store = db.transaction(STORE, mode).objectStore(STORE);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export async function saveLog(
  name: string,
  data: { events: BattleEvent[]; regions: Region[]; segments: Segment[] }
): Promise<string> {
  const id = `log_${Date.now()}`;
  const rec: SavedLog = { id, name, savedAt: new Date().toISOString(), ...data };
  await tx("readwrite", (s) => s.put(rec));
  return id;
}

export async function listLogs(): Promise<SavedLogMeta[]> {
  const all = await tx<SavedLog[]>("readonly", (s) => s.getAll() as IDBRequest<SavedLog[]>);
  return all
    .map((l) => ({ id: l.id, name: l.name, savedAt: l.savedAt, eventCount: l.events?.length ?? 0 }))
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export async function loadLog(id: string): Promise<SavedLog | undefined> {
  return tx<SavedLog | undefined>("readonly", (s) => s.get(id) as IDBRequest<SavedLog | undefined>);
}

export async function deleteLog(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}
