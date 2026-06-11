import { useEffect, useState } from "react";
import { loadVideo, extractFrames, type Frame, type Segment } from "./pipeline/frames";
import { aHash, hamming } from "./pipeline/phash";
import { cropROI, ocrCanvas } from "./pipeline/ocr";
import { makeEvent, KIND_LABEL, type BattleEvent, type EventKind } from "./pipeline/events";
import { defaultRegions, type Region } from "./pipeline/regions";
import { checkBackend, fetchYoutube } from "./pipeline/youtube";
import RegionEditor from "./RegionEditor";

type Stage = "idle" | "extracting" | "filtering" | "ocr" | "done";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [interval, setIntervalSec] = useState(1);
  const [threshold, setThreshold] = useState(8);
  const [lang, setLang] = useState("eng");
  const [minConfidence, setMinConfidence] = useState(0);

  const [regions, setRegions] = useState<Region[]>(defaultRegions());
  const [segments, setSegments] = useState<Segment[]>([]);

  // Feature ①：YouTube 來源（需本地後端）
  const [backend, setBackend] = useState<{ ok: boolean; ytdlp: string | null } | null>(null);
  const [ytUrl, setYtUrl] = useState("");
  const [ytStart, setYtStart] = useState(0);
  const [ytEnd, setYtEnd] = useState(0);
  const [ytBusy, setYtBusy] = useState(false);
  const [ytMsg, setYtMsg] = useState("");

  useEffect(() => {
    checkBackend().then(setBackend);
  }, []);

  async function fetchFromYoutube() {
    if (!ytUrl) return;
    setYtBusy(true);
    setYtMsg("");
    try {
      const range = ytEnd > ytStart ? { start: ytStart, end: ytEnd } : undefined;
      const f = await fetchYoutube(ytUrl, range, setYtMsg);
      await onPickFile(f);
      setYtMsg(`已取得影片（${(f.size / 1e6).toFixed(1)} MB），可往下設定分析。`);
    } catch (e) {
      setYtMsg("錯誤：" + (e instanceof Error ? e.message : String(e)));
    } finally {
      setYtBusy(false);
    }
  }

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [keptCount, setKeptCount] = useState<{ kept: number; total: number } | null>(null);

  async function onPickFile(f: File | null) {
    setFile(f);
    setDuration(null);
    if (f) {
      try {
        const v = await loadVideo(f);
        setDuration(v.duration);
      } catch {
        /* ignore */
      }
    }
  }

  async function run() {
    if (!file) return;
    setEvents([]);
    setKeptCount(null);
    try {
      setStage("extracting");
      setStatus("載入影片並抽取影格…");
      const video = await loadVideo(file);
      const frames = await extractFrames(video, {
        intervalSec: interval,
        segments,
        onProgress: (p) => setProgress(p),
      });

      // 關鍵影格過濾：以「keyframe=true」的 ROI 判斷畫面有無變化；任一塊變化即保留。
      setStage("filtering");
      setStatus("過濾關鍵影格…");
      const kfRegions = regions.filter((r) => r.keyframe);
      const prev: Record<string, bigint> = {};
      const kept: Frame[] = [];
      for (const f of frames) {
        let changed = false;
        if (kfRegions.length === 0) {
          const h = aHash(f.canvas);
          if (prev.__all === undefined || hamming(h, prev.__all) >= threshold) {
            changed = true;
            prev.__all = h;
          }
        } else {
          for (const r of kfRegions) {
            const h = aHash(f.canvas, r);
            if (prev[r.id] === undefined || hamming(h, prev[r.id]) >= threshold) changed = true;
          }
          if (changed) for (const r of kfRegions) prev[r.id] = aHash(f.canvas, r);
        }
        if (changed) kept.push(f);
      }
      setKeptCount({ kept: kept.length, total: frames.length });

      // OCR：對每張關鍵影格的每一塊「ocr=true」ROI 做辨識，產生標記來源的事件。
      setStage("ocr");
      const ocrRegions = regions.filter((r) => r.ocr);
      const out: BattleEvent[] = [];
      for (let i = 0; i < kept.length; i++) {
        const f = kept[i];
        setStatus(`OCR 辨識中 ${i + 1}/${kept.length}（每張 ${ocrRegions.length} 區）…`);
        setProgress((i + 1) / kept.length);
        for (const r of ocrRegions) {
          const crop = cropROI(f.canvas, r);
          const { text, confidence } = await ocrCanvas(crop, lang);
          if (text && text.replace(/\s/g, "").length >= 2 && confidence >= minConfidence) {
            out.push(
              makeEvent({ t: f.t, rawText: text, confidence, thumb: f.thumb, region: r.label, regionKind: r.kind })
            );
          }
        }
      }
      out.sort((a, b) => a.t - b.t);
      setEvents(out);
      setStage("done");
      setStatus(
        `完成：從 ${frames.length} 張影格留下 ${kept.length} 張關鍵影格，辨識出 ${out.length} 個事件。`
      );
    } catch (e) {
      setStage("idle");
      setStatus("錯誤：" + (e instanceof Error ? e.message : String(e)));
    }
  }

  function updateEvent(id: string, patch: Partial<BattleEvent>) {
    setEvents((evs) => evs.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function deleteEvent(id: string) {
    setEvents((evs) => evs.filter((e) => e.id !== id));
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "game-log.json";
    a.click();
  }

  function addSegment() {
    setSegments((s) => [...s, { start: 0, end: duration ? Math.round(duration) : 0 }]);
  }
  function updateSegment(i: number, patch: Partial<Segment>) {
    setSegments((s) => s.map((seg, idx) => (idx === i ? { ...seg, ...patch } : seg)));
  }
  function removeSegment(i: number) {
    setSegments((s) => s.filter((_, idx) => idx !== i));
  }

  const busy = stage === "extracting" || stage === "filtering" || stage === "ocr";

  return (
    <div className="app">
      <header className="app-head">
        <h1>🟣 VGC Game Log 原型</h1>
        <p className="sub">
          影片 → 定時截圖 → 多塊 ROI 關鍵影格過濾 → 訊息框 / 特性 / HP OCR → 可編輯事件時間軸。
          半自動工具：機器產草稿，你校正。
        </p>
      </header>

      <section className="panel">
        <h2>1. 選影片來源</h2>
        <div className="row">
          <strong className="src-label">本地影片檔</strong>
          <input type="file" accept="video/*" onChange={(e) => onPickFile(e.target.files?.[0] ?? null)} />
          {duration != null && <span className="hint">長度 {duration.toFixed(1)} 秒</span>}
        </div>

        <div className="src-divider">或：貼 YouTube 連結</div>
        {backend?.ok ? (
          <>
            <div className="row">
              <input className="yt-url" type="text" placeholder="https://www.youtube.com/watch?v=..."
                value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} />
            </div>
            <div className="row">
              <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                下載區段 開始(秒)
                <input type="number" min={0} step={1} value={ytStart}
                  onChange={(e) => setYtStart(Number(e.target.value))} />
              </label>
              <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                結束(秒)
                <input type="number" min={0} step={1} value={ytEnd}
                  onChange={(e) => setYtEnd(Number(e.target.value))} />
              </label>
              <span className="hint">（區段 0–0＝整支）</span>
              <button onClick={fetchFromYoutube} disabled={!ytUrl || ytBusy}>
                {ytBusy ? "下載中…" : "取得影片"}
              </button>
            </div>
            {ytMsg && <p className="status">{ytMsg}</p>}
            <p className="hint">後端 yt-dlp 版本 {backend.ytdlp}。僅供本機分析自己的對戰錄影。</p>
          </>
        ) : (
          <p className="hint">
            未偵測到本地下載後端，所以 YouTube 來源暫不可用。要啟用：在專案 <code>server/</code> 執行{" "}
            <code>npm install &amp;&amp; npm start</code>（需先 <code>brew install yt-dlp ffmpeg</code>），
            並用 <code>npm run dev</code> 開啟本 app。詳見 <code>server/README.md</code>。
          </p>
        )}
      </section>

      <section className="panel">
        <h2>2. 擷取與辨識設定</h2>
        <div className="grid">
          <label>
            截圖間隔（秒）
            <input type="number" min={0.2} step={0.2} value={interval}
              onChange={(e) => setIntervalSec(Number(e.target.value))} />
          </label>
          <label>
            關鍵影格門檻（Hamming 0–64）
            <input type="number" min={1} max={64} value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))} />
          </label>
          <label>
            OCR 語言
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="eng">英文 (eng)</option>
              <option value="chi_tra">繁體中文 (chi_tra)</option>
              <option value="jpn">日文 (jpn)</option>
              <option value="eng+chi_tra">英文+繁中</option>
            </select>
          </label>
          <label>
            最低信心（過濾雜訊）
            <input type="number" min={0} max={100} value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))} />
          </label>
        </div>
        <p className="hint">提示：信心 70 以上通常較精準；先用「最低信心」濾掉低品質辨識可大幅減少雜訊。</p>
      </section>

      <section className="panel">
        <h2>3. 時間段（去頭去尾去中間）</h2>
        <p className="hint">
          只分析這些時間段（秒）。空白＝整支影片。直播多局可加多段，把局與局之間的畫面排除。
        </p>
        {segments.map((s, i) => (
          <div className="row" key={i}>
            <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              開始
              <input type="number" min={0} step={1} value={s.start}
                onChange={(e) => updateSegment(i, { start: Number(e.target.value) })} />
            </label>
            <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              結束
              <input type="number" min={0} step={1} value={s.end}
                onChange={(e) => updateSegment(i, { end: Number(e.target.value) })} />
            </label>
            <button className="del" onClick={() => removeSegment(i)}>刪除此段</button>
          </div>
        ))}
        <div className="row">
          <button onClick={addSegment}>+ 新增時間段</button>
        </div>
      </section>

      <section className="panel">
        <h2>4. ROI 多塊裁切（含 crop 介面）</h2>
        <RegionEditor videoFile={file} regions={regions} onChange={setRegions} />
        <div className="row">
          <button onClick={() => setRegions(defaultRegions())}>重設為預設 4 塊</button>
        </div>
      </section>

      <section className="panel">
        <div className="row">
          <button className="primary" onClick={run} disabled={!file || busy}>
            {busy ? "處理中…" : "開始分析"}
          </button>
        </div>
        {(busy || status) && (
          <>
            {busy && (
              <div className="progress">
                <div className="bar" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
            <p className="status">{status}</p>
            {keptCount && <p className="status">關鍵影格：{keptCount.kept} / {keptCount.total}</p>}
          </>
        )}
      </section>

      {events.length > 0 && (
        <section className="panel">
          <div className="row between">
            <h2>5. 事件時間軸（可編輯）</h2>
            <button onClick={exportJson}>匯出 JSON</button>
          </div>
          <p className="hint">機器產出的草稿。請校正分類與文字，刪掉雜訊。每個事件標有來源 ROI。</p>
          <ul className="timeline">
            {events.map((ev) => (
              <li key={ev.id} className="event">
                <img src={ev.thumb} alt="" className="thumb" />
                <div className="ev-body">
                  <div className="ev-meta">
                    <span className="t">{ev.t.toFixed(1)}s</span>
                    <span className="region-tag">{ev.region}</span>
                    <select value={ev.kind}
                      onChange={(e) => updateEvent(ev.id, { kind: e.target.value as EventKind })}>
                      {Object.entries(KIND_LABEL).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                    <span className="conf">信心 {Math.round(ev.confidence)}</span>
                    <button className="del" onClick={() => deleteEvent(ev.id)}>刪除</button>
                  </div>
                  <textarea value={ev.text} onChange={(e) => updateEvent(ev.id, { text: e.target.value })} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="app-foot">
        原型 v0.0.2 · 全在瀏覽器執行，影片不會上傳 · 對戰知識與規則持續由 Ditto 學習中
      </footer>
    </div>
  );
}
