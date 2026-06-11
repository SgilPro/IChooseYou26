import { useRef, useState } from "react";
import { loadVideo, extractFrames, type Frame } from "./pipeline/frames";
import { aHash, hamming } from "./pipeline/phash";
import { cropROI, ocrCanvas } from "./pipeline/ocr";
import { makeEvent, KIND_LABEL, type BattleEvent, type EventKind } from "./pipeline/events";

// 訊息框 ROI 預設值（相對比例）：畫面底部一條橫帶。可在 UI 微調。
const DEFAULT_ROI = { x: 0.05, y: 0.78, w: 0.9, h: 0.18 };

type Stage = "idle" | "extracting" | "filtering" | "ocr" | "done";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [interval, setIntervalSec] = useState(1);
  const [threshold, setThreshold] = useState(8); // hamming 距離門檻：>= 視為「畫面有變化」
  const [lang, setLang] = useState("eng");
  const [roi, setRoi] = useState(DEFAULT_ROI);

  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [keptCount, setKeptCount] = useState<{ kept: number; total: number } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

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
        onProgress: (p) => setProgress(p),
      });

      // 關鍵影格過濾：只在訊息框 ROI 的 aHash 與前一張差異 >= threshold 時保留。
      setStage("filtering");
      setStatus("過濾關鍵影格…");
      const kept: Frame[] = [];
      let prevHash: bigint | null = null;
      for (const f of frames) {
        const h = aHash(f.canvas, roi);
        if (prevHash === null || hamming(h, prevHash) >= threshold) {
          kept.push(f);
          prevHash = h;
        }
      }
      setKeptCount({ kept: kept.length, total: frames.length });

      // OCR 每張關鍵影格的訊息框 ROI。
      setStage("ocr");
      const out: BattleEvent[] = [];
      for (let i = 0; i < kept.length; i++) {
        const f = kept[i];
        setStatus(`OCR 辨識中 ${i + 1}/${kept.length}…`);
        setProgress((i + 1) / kept.length);
        const crop = cropROI(f.canvas, roi);
        const { text, confidence } = await ocrCanvas(crop, lang);
        if (text && text.replace(/\s/g, "").length >= 2) {
          out.push(makeEvent(f.t, text, confidence, f.thumb));
        }
      }
      setEvents(out);
      setStage("done");
      setStatus(`完成：從 ${frames.length} 張影格留下 ${kept.length} 張關鍵影格，辨識出 ${out.length} 個事件。`);
    } catch (e) {
      setStage("idle");
      setStatus("錯誤：" + (e instanceof Error ? e.message : String(e)));
    }
  }

  function previewROI() {
    if (!file) return;
    loadVideo(file).then(async (video) => {
      const frames = await extractFrames(video, { intervalSec: Math.max(1, video.duration / 2) });
      const f = frames[Math.floor(frames.length / 2)] ?? frames[0];
      if (!f || !previewRef.current) return;
      const crop = cropROI(f.canvas, roi);
      const c = previewRef.current;
      c.width = crop.width;
      c.height = crop.height;
      c.getContext("2d")!.drawImage(crop, 0, 0);
    });
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

  const busy = stage === "extracting" || stage === "filtering" || stage === "ocr";

  return (
    <div className="app">
      <header className="app-head">
        <h1>🟣 VGC Game Log 原型</h1>
        <p className="sub">
          本地影片 → 定時截圖 → 關鍵影格過濾 → 訊息框 OCR → 可編輯事件時間軸。
          這是半自動工具：機器產草稿，你校正。
        </p>
      </header>

      <section className="panel">
        <h2>1. 選影片 & 設定</h2>
        <div className="row">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
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
        </div>

        <h3>訊息框位置（ROI，畫面相對比例 0–1）</h3>
        <div className="grid">
          {(["x", "y", "w", "h"] as const).map((k) => (
            <label key={k}>
              {k}
              <input type="number" min={0} max={1} step={0.01} value={roi[k]}
                onChange={(e) => setRoi({ ...roi, [k]: Number(e.target.value) })} />
            </label>
          ))}
        </div>
        <div className="row">
          <button onClick={previewROI} disabled={!file || busy}>預覽 ROI 裁切</button>
          <canvas ref={previewRef} className="roi-preview" />
        </div>

        <div className="row">
          <button className="primary" onClick={run} disabled={!file || busy}>
            {busy ? "處理中…" : "開始分析"}
          </button>
        </div>
      </section>

      {(busy || status) && (
        <section className="panel">
          <h2>2. 進度</h2>
          {busy && (
            <div className="progress">
              <div className="bar" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
          <p className="status">{status}</p>
          {keptCount && (
            <p className="status">
              關鍵影格：{keptCount.kept} / {keptCount.total}
            </p>
          )}
        </section>
      )}

      {events.length > 0 && (
        <section className="panel">
          <div className="row between">
            <h2>3. 事件時間軸（可編輯）</h2>
            <button onClick={exportJson}>匯出 JSON</button>
          </div>
          <p className="hint">機器產出的草稿。請校正分類與文字，刪掉雜訊。</p>
          <ul className="timeline">
            {events.map((ev) => (
              <li key={ev.id} className="event">
                <img src={ev.thumb} alt="" className="thumb" />
                <div className="ev-body">
                  <div className="ev-meta">
                    <span className="t">{ev.t.toFixed(1)}s</span>
                    <select
                      value={ev.kind}
                      onChange={(e) => updateEvent(ev.id, { kind: e.target.value as EventKind })}
                    >
                      {Object.entries(KIND_LABEL).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                    <span className="conf">信心 {Math.round(ev.confidence)}</span>
                    <button className="del" onClick={() => deleteEvent(ev.id)}>刪除</button>
                  </div>
                  <textarea
                    value={ev.text}
                    onChange={(e) => updateEvent(ev.id, { text: e.target.value })}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="app-foot">
        原型 v0.0.1 · 全在瀏覽器執行，影片不會上傳 · 對戰知識與規則持續由 Ditto 學習中
      </footer>
    </div>
  );
}
