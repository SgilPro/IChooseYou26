// 關鍵影格過濾：用 average hash (aHash) 比對前後影格差異。
// 研究（02）建議用感知雜湊 + ROI diff 便宜地過濾掉「沒變化」的影格。
// aHash 簡單、夠快、對「畫面有無明顯變化」很有效，適合原型。

const HASH_SIZE = 8; // 8x8 → 64-bit hash

/** 在指定 ROI（相對比例 0~1）內計算 aHash。roi 省略則用整張。 */
export function aHash(
  canvas: HTMLCanvasElement,
  roi?: { x: number; y: number; w: number; h: number }
): bigint {
  const r = roi ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = Math.floor(r.x * canvas.width);
  const sy = Math.floor(r.y * canvas.height);
  const sw = Math.max(1, Math.floor(r.w * canvas.width));
  const sh = Math.max(1, Math.floor(r.h * canvas.height));

  const small = document.createElement("canvas");
  small.width = HASH_SIZE;
  small.height = HASH_SIZE;
  const ctx = small.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, HASH_SIZE, HASH_SIZE);
  const { data } = ctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE);

  const gray: number[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray.push(g);
    sum += g;
  }
  const avg = sum / gray.length;

  let hash = 0n;
  for (let i = 0; i < gray.length; i++) {
    hash <<= 1n;
    if (gray[i] >= avg) hash |= 1n;
  }
  return hash;
}

/** 兩個 hash 的 Hamming distance（0~64，越大代表差異越大） */
export function hamming(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}
