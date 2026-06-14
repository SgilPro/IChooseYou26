import { useEffect, useState } from "react";
import { loadVideo, extractFrames, framesFromImages, type Frame, type Segment } from "./pipeline/frames";
import { aHash, hamming } from "./pipeline/phash";
import { cropROI, ocrCanvas } from "./pipeline/ocr";
import { makeEvent, cleanupEvents, KIND_LABEL, type BattleEvent, type EventKind } from "./pipeline/events";
import { ensureDict } from "./pipeline/dict";
import { assignTurns, groupByTurn } from "./pipeline/turns";
import { officialRegions, hasOfficialPreset, type Region } from "./pipeline/regions";
import { secToClock } from "./pipeline/time";
import { checkBackend, fetchYoutube } from "./pipeline/youtube";
import {
  listPresets, savePreset, deletePreset, importPresets,
  saveLog, listLogs, loadLog, deleteLog, type SavedLogMeta,
} from "./pipeline/storage";
import RegionEditor from "./RegionEditor";
import TimeField from "./TimeField";

type Stage = "idle" | "extracting" | "filtering" | "ocr" | "done";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [interval, setIntervalSec] = useState(1);
  const [threshold, setThreshold] = useState(8);
  const [lang, setLang] = useState("eng");
  const [minConfidence, setMinConfidence] = useState(0);
  const [turnGapSec, setTurnGapSec] = useState(12);

  const [regions, setRegions] = useState<Region[]>(officialRegions("eng"));
  const [customRoi, setCustomRoi] = useState(false); // 回饋 #6：預設用官方 ROI，開此才可自定義
  const [segments, setSegments] = useState<Segment[]>([]);

  // 未開自定義時，ROI 跟著 OCR 語言帶入官方預設。
  useEffect(() => {
    if (!customRoi) setRegions(officialRegions(lang));
  }, [lang, customRoi]);

  // Feature ①：YouTube 來源（需本地後端）
  const [backend, setBackend] = useState<{ ok: boolean; ytdlp: string | null } | null>(null);
  const [ytUrl, setYtUrl] = useState("");
  const [ytStart, setYtStart] = useState(0);
  const [ytEnd, setYtEnd] = useState(0);
  const [ytBusy, setYtBusy] = useState(false);
  const [ytMsg, setYtMsg] = useState("");

  // 持久化：ROI presets + 已存 Log
  const [presets, setPresets] = useState<string[]>([]);
  const [savedLogs, setSavedLogs] = useState<SavedLogMeta[]>([]);

  useEffect(() => {
    checkBackend().then(setBackend);
    setPresets(listPresets().map((p) => p.name));
    listLogs().then(setSavedLogs).catch(() => {});
  }, []);

  function refreshPresets() {
    setPresets(listPresets().map((p) => p.name));
  }
  function onSavePreset() {
    const name = window.prompt("ROI preset 名稱（例如 SV 1080p / Champions 直播版）");
    if (!name) return;
    savePreset(name, regions);
    refreshPresets();
  }
  function onApplyPreset(name: string) {
    const p = listPresets().find((x) => x.name === name);
    if (p) setRegions(p.regions);
  }
  function onDeletePreset(name: string) {
    deletePreset(name);
    refreshPresets();
  }
  function onExportPresets() {
    // 回饋 #1：若還沒存任何 preset，至少匯出目前的 ROI（避免匯出空陣列）。
    const saved = listPresets();
    const payload = saved.length > 0 ? saved : [{ name: "目前 ROI", regions }];
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "roi-presets.json";
    a.click();
  }
  function onImportPresets(file?: File) {
    if (!file) return;
    file.text().then((t) => {
      try {
        importPresets(t);
        refreshPresets();
      } catch (e) {
        alert("匯入失敗：" + (e instanceof Error ? e.message : String(e)));
      }
    });
  }

  async function onSaveLog() {
    if (events.length === 0) return;
    const name = window.prompt("這場 Log 的名稱", `對戰 ${new Date().toLocaleString()}`);
    if (!name) return;
    await saveLog(name, { events, regions, segments });
    setSavedLogs(await listLogs());
  }
  async function onOpenLog(id: string) {
    const log = await loadLog(id);
    if (!log) return;
    setEvents(log.events);
    setRegions(log.regions);
    setSegments(log.segments);
    setStage("done");
    setStatus(`已載入 Log「${log.name}」（${log.events.length} 個事件）`);
  }
  async function onDeleteLog(id: string) {
    await deleteLog(id);
    setSavedLogs(await listLogs());
  }

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
    const imageMode = imageFiles.length > 0;
    if (!file && !imageMode) return;
    setEvents([]);
    setKeptCount(null);
    try {
      let kept: Frame[];
      if (imageMode) {
        // 圖片來源（OCR 打樣）：每張截圖都是一個影格，全部保留、不做關鍵影格過濾。
        setStage("extracting");
        setStatus("載入截圖…");
        kept = await framesFromImages(imageFiles);
        setKeptCount({ kept: kept.length, total: kept.length });
      } else {
        setStage("extracting");
        setStatus("載入影片並抽取影格…");
        const video = await loadVideo(file!);
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
        kept = [];
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
      }

      // OCR：對每張關鍵影格的每一塊「ocr=true」ROI 做辨識，產生標記來源的事件。
      setStage("ocr");
      await ensureDict(); // 預載名稱字典（動態 import），供事件做模糊校正
      const ocrRegions = regions.filter((r) => r.ocr);
      const out: BattleEvent[] = [];
      for (let i = 0; i < kept.length; i++) {
        const f = kept[i];
        setStatus(`OCR 辨識中 ${i + 1}/${kept.length}（每張 ${ocrRegions.length} 區）…`);
        setProgress((i + 1) / kept.length);
        for (const r of ocrRegions) {
          const crop = cropROI(f.canvas, r);
          const numeric = r.kind === "hp_opp" || r.kind === "hp_self";
          const { text, confidence } = await ocrCanvas(crop, lang, { numeric });
          if (text && text.replace(/\s/g, "").length >= 2 && confidence >= minConfidence) {
            out.push(
              makeEvent({ t: f.t, rawText: text, confidence, thumb: f.thumb, region: r.label, regionKind: r.kind })
            );
          }
        }
      }
      const cleaned = cleanupEvents(out, { lowConf: 50 });
      const grouped = assignTurns(cleaned, { gapSec: turnGapSec });
      setEvents(grouped);
      setStage("done");
      setStatus(
        imageMode
          ? `完成：${kept.length} 張截圖，辨識出 ${out.length} 個事件。`
          : `完成：留下 ${kept.length} 張關鍵影格，辨識出 ${out.length} 個事件。`
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
  function regroupTurns() {
    setEvents((evs) => assignTurns(evs, { gapSec: turnGapSec }));
  }
  function exportJson() {
    // 回饋 #3：匯出 JSON 不含 thumbnail（縮圖只供畫面顯示，會讓檔案爆大）。
    const slim = events.map(({ thumb, ...rest }) => { void thumb; return rest; });
    const blob = new Blob([JSON.stringify(slim, null, 2)], { type: "application/json" });
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

        <div className="src-divider">或：上傳截圖（多張，做 OCR 打樣）</div>
        <div className="row">
          <input type="file" accept="image/*" multiple
            onChange={(e) => { setImageFiles(Array.from(e.target.files ?? [])); setFile(null); setDuration(null); }} />
          {imageFiles.length > 0 && <span className="hint">已選 {imageFiles.length} 張截圖（將跳過影格抽取與過濾，直接逐張 OCR）</span>}
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
                下載區段 開始
                <TimeField value={ytStart} onChange={setYtStart} />
              </label>
              <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                結束
                <TimeField value={ytEnd} onChange={setYtEnd} />
              </label>
              <span className="hint">（m:ss；0:00–0:00＝整支）</span>
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

      {savedLogs.length > 0 && (
        <section className="panel">
          <h2>💾 已存的 Log（存在本機瀏覽器 IndexedDB）</h2>
          <p className="hint">「儲存此 Log」會把事件存進你瀏覽器的 IndexedDB（資料庫 vgc-gamelog）——不上傳、換瀏覽器或清除網站資料就會不見。</p>
          <ul className="log-list">
            {savedLogs.map((l) => (
              <li key={l.id}>
                <span className="log-name">{l.name}</span>
                <span className="hint">{new Date(l.savedAt).toLocaleString()} · {l.eventCount} 事件</span>
                <button onClick={() => onOpenLog(l.id)}>開啟</button>
                <button className="del" onClick={() => onDeleteLog(l.id)}>刪除</button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
          只分析這些時間段（格式 m:ss）。空白＝整支影片。直播多局可加多段，把局與局之間的畫面排除。
        </p>
        {segments.map((s, i) => (
          <div className="row" key={i}>
            <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              開始
              <TimeField value={s.start} onChange={(v) => updateSegment(i, { start: v })} />
            </label>
            <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              結束
              <TimeField value={s.end} onChange={(v) => updateSegment(i, { end: v })} />
            </label>
            <button className="del" onClick={() => removeSegment(i)}>刪除此段</button>
          </div>
        ))}
        <div className="row">
          <button onClick={addSegment}>+ 新增時間段</button>
        </div>
      </section>

      <section className="panel">
        <h2>4. ROI 多塊裁切</h2>
        <div className="row">
          <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={customRoi} onChange={(e) => setCustomRoi(e.target.checked)} />
            <strong>自定義 ROI 裁切</strong>（特殊版面用，如直播塞聊天室導致畫面縮小偏移）
          </label>
          <span className="hint">
            {customRoi
              ? "自定義模式：可拖曳/縮放/編輯，並存成 preset。"
              : `官方預設模式：依 OCR 語言自動帶入${hasOfficialPreset(lang) ? "" : "（此語言尚無官方預設，暫用英文）"}。`}
          </span>
        </div>
        <RegionEditor videoFile={file} regions={regions} onChange={setRegions} readOnly={!customRoi} />
        {customRoi && (
          <div className="row">
            <button onClick={() => setRegions(officialRegions(lang))}>重設為官方預設</button>
            <button onClick={onSavePreset}>💾 存成 preset</button>
            {presets.length > 0 && (
              <select defaultValue="" onChange={(e) => { if (e.target.value) onApplyPreset(e.target.value); }}>
                <option value="">套用 preset…</option>
                {presets.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            {presets.length > 0 && (
              <select defaultValue="" onChange={(e) => { if (e.target.value) onDeletePreset(e.target.value); e.target.value = ""; }}>
                <option value="">刪除 preset…</option>
                {presets.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            <button onClick={onExportPresets}>匯出 presets</button>
            <label className="file-btn">匯入 presets
              <input type="file" accept="application/json" hidden onChange={(e) => onImportPresets(e.target.files?.[0])} />
            </label>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="row">
          <button className="primary" onClick={run} disabled={(!file && imageFiles.length === 0) || busy}>
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
            <div className="row">
              <button onClick={onSaveLog}>💾 儲存此 Log</button>
              <button onClick={exportJson}>匯出 JSON</button>
            </div>
          </div>
          <p className="hint">機器產出的草稿，依推斷的回合分組。請校正分類/文字/回合，刪掉雜訊。每個事件標有來源 ROI。</p>
          <div className="row">
            <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              回合間隔門檻（秒）
              <input type="number" min={1} value={turnGapSec} onChange={(e) => setTurnGapSec(Number(e.target.value))} />
            </label>
            <button onClick={regroupTurns}>重新分回合</button>
            <span className="hint">偵測到「Turn/回合」字樣時以它為準，否則用間隔推斷；可手動改每事件的回合</span>
          </div>
          {groupByTurn(events).map((g) => (
            <div key={g.turn} className="turn-group">
              <h3 className="turn-head">
                {g.turn === 0 ? "選出 / 先發" : `回合 ${g.turn}`}
                <span className="hint"> · {g.events.length} 事件</span>
              </h3>
              <ul className="timeline">
                {g.events.map((ev) => (
                  <li key={ev.id} className="event">
                    <img src={ev.thumb} alt="" className="thumb" />
                    <div className="ev-body">
                      <div className="ev-meta">
                        <span className="t">{secToClock(ev.t)}</span>
                        <span className="region-tag">{ev.region}</span>
                        <label className="turn-edit">回合
                          <input type="number" min={0} value={ev.turn}
                            onChange={(e) => updateEvent(ev.id, { turn: Number(e.target.value) })} />
                        </label>
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
                      {ev.entities.length > 0 && (
                        <div className="entities">
                          {ev.entities.map((en) => (
                            <span key={en.type + en.name} className={"entity " + en.type} title={`${en.type} · 相似度 ${Math.round(en.score * 100)}`}>
                              {en.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <footer className="app-foot">
        原型 v0.0.4 · 全在瀏覽器執行，影片不會上傳 · 對戰知識與規則持續由 Ditto 學習中
      </footer>
    </div>
  );
}
