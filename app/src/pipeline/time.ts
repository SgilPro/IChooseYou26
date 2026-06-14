// 時間格式：秒 <-> 幾分幾秒（m:ss）。回饋 #4。

export function secToClock(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  // 處理四捨五入到 60 的邊界
  if (sec === 60) return `${m + 1}:00`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function clockToSec(str: string): number {
  const t = str.trim();
  if (t.includes(":")) {
    const [mm, ss] = t.split(":");
    const m = parseInt(mm || "0", 10);
    const s = parseInt(ss || "0", 10);
    if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
  }
  const n = Number(t);
  return isNaN(n) ? 0 : n;
}
