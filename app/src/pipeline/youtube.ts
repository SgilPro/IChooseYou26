// 前端對接本地 yt-dlp 後端（server/）。
// 純前端無法下載 YouTube（CORS + 簽章 URL + n 節流，見 research 08），
// 故需偵測本機是否有跑後端；有才開放「貼 YouTube URL」來源。

const BACKEND = (import.meta.env.VITE_YTDLP_BACKEND as string | undefined) || "http://localhost:8787";

export async function checkBackend(): Promise<{ ok: boolean; ytdlp: string | null }> {
  try {
    const res = await fetch(`${BACKEND}/api/health`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return { ok: false, ytdlp: null };
    return await res.json();
  } catch {
    return { ok: false, ytdlp: null };
  }
}

/** 透過本地後端取得 YouTube 影片，包成 File 餵進既有 pipeline。 */
export async function fetchYoutube(
  url: string,
  range?: { start: number; end: number },
  onProgress?: (msg: string) => void
): Promise<File> {
  const params = new URLSearchParams({ url });
  if (range && range.end > range.start) {
    params.set("start", String(range.start));
    params.set("end", String(range.end));
  }
  onProgress?.("後端 yt-dlp 下載中（可能需數十秒）…");
  const res = await fetch(`${BACKEND}/api/fetch?${params.toString()}`);
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).detail || (await res.json()).error || "";
    } catch {
      /* ignore */
    }
    throw new Error(`下載失敗（${res.status}）${detail ? "：" + detail : ""}`);
  }
  const blob = await res.blob();
  return new File([blob], "youtube.mp4", { type: "video/mp4" });
}
