import { useRef, useState } from "react";
import { loadVideo, captureFrame } from "./pipeline/frames";
import { type Region, type RegionKind, KIND_LABEL, newRegionId } from "./pipeline/regions";

// Feature ④：上傳一張參考圖（或從影片抓一格），在圖上拖曳畫出 ROI，
// 直接編輯共用的 regions（與下方數值表同一份資料）。

interface Props {
  videoFile: File | null;
  regions: Region[];
  onChange: (regions: Region[]) => void;
}

type Drag =
  | { mode: "draw"; x0: number; y0: number; cur: { x: number; y: number } }
  | { mode: "move"; id: string; dx: number; dy: number };

const KINDS: RegionKind[] = ["gamelog", "ability", "hp_opp", "hp_self", "other"];

export default function RegionEditor({ videoFile, regions, onChange }: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [grabTime, setGrabTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  function frac(e: React.PointerEvent): { x: number; y: number } {
    const r = boxRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  }

  async function grabFromVideo() {
    if (!videoFile) return;
    setBusy(true);
    try {
      const v = await loadVideo(videoFile);
      const c = await captureFrame(v, grabTime);
      setImgSrc(c.toDataURL("image/jpeg", 0.85));
    } finally {
      setBusy(false);
    }
  }

  function onUpload(file?: File) {
    if (!file) return;
    setImgSrc(URL.createObjectURL(file));
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!imgSrc) return;
    const p = frac(e);
    setDrag({ mode: "draw", x0: p.x, y0: p.y, cur: p });
    boxRef.current?.setPointerCapture(e.pointerId);
  }
  function onRegionPointerDown(e: React.PointerEvent, r: Region) {
    e.stopPropagation();
    setSelected(r.id);
    const p = frac(e);
    setDrag({ mode: "move", id: r.id, dx: p.x - r.x, dy: p.y - r.y });
    boxRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const p = frac(e);
    if (drag.mode === "draw") {
      setDrag({ ...drag, cur: p });
    } else {
      onChange(
        regions.map((r) =>
          r.id === drag.id
            ? { ...r, x: Math.min(1 - r.w, Math.max(0, p.x - drag.dx)), y: Math.min(1 - r.h, Math.max(0, p.y - drag.dy)) }
            : r
        )
      );
    }
  }
  function onPointerUp() {
    if (drag?.mode === "draw") {
      const x = Math.min(drag.x0, drag.cur.x);
      const y = Math.min(drag.y0, drag.cur.y);
      const w = Math.abs(drag.cur.x - drag.x0);
      const h = Math.abs(drag.cur.y - drag.y0);
      if (w > 0.02 && h > 0.02) {
        const id = newRegionId();
        onChange([
          ...regions,
          { id, label: `區域 ${regions.length + 1}`, kind: "other", x, y, w, h, ocr: true, keyframe: false },
        ]);
        setSelected(id);
      }
    }
    setDrag(null);
  }

  function update(id: string, patch: Partial<Region>) {
    onChange(regions.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function remove(id: string) {
    onChange(regions.filter((r) => r.id !== id));
    if (selected === id) setSelected(null);
  }

  const pending =
    drag?.mode === "draw"
      ? {
          left: `${Math.min(drag.x0, drag.cur.x) * 100}%`,
          top: `${Math.min(drag.y0, drag.cur.y) * 100}%`,
          width: `${Math.abs(drag.cur.x - drag.x0) * 100}%`,
          height: `${Math.abs(drag.cur.y - drag.y0) * 100}%`,
        }
      : null;

  return (
    <div>
      <p className="hint">
        上傳一張對戰截圖、或從已選影片抓一格當參考圖，然後在圖上<strong>拖曳畫框</strong>新增 ROI、
        拖動方框可移動位置（精細數值用下方表格調）。畫好即時套用到影片分析設定。
      </p>
      <div className="row">
        <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          上傳參考圖
          <input type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} />
        </label>
        <span className="hint">或</span>
        <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          影片秒數
          <input type="number" min={0} step={1} value={grabTime} style={{ width: 80 }}
            onChange={(e) => setGrabTime(Number(e.target.value))} />
        </label>
        <button onClick={grabFromVideo} disabled={!videoFile || busy}>
          {busy ? "抓取中…" : "從影片抓一格"}
        </button>
      </div>

      {imgSrc ? (
        <div
          ref={boxRef}
          className="roi-stage"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img src={imgSrc} alt="參考圖" draggable={false} />
          {regions.map((r) => (
            <div
              key={r.id}
              className={"roi-rect" + (selected === r.id ? " sel" : "")}
              style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
              onPointerDown={(e) => onRegionPointerDown(e, r)}
            >
              <span className="roi-tag">{r.label}</span>
            </div>
          ))}
          {pending && <div className="roi-rect pending" style={pending} />}
        </div>
      ) : (
        <div className="roi-stage empty">尚未載入參考圖</div>
      )}

      <table className="roi-table">
        <thead>
          <tr>
            <th>標籤</th><th>類型</th><th>x</th><th>y</th><th>w</th><th>h</th><th>OCR</th><th>關鍵影格</th><th></th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.id} className={selected === r.id ? "sel" : ""} onClick={() => setSelected(r.id)}>
              <td><input value={r.label} onChange={(e) => update(r.id, { label: e.target.value })} /></td>
              <td>
                <select value={r.kind} onChange={(e) => update(r.id, { kind: e.target.value as RegionKind })}>
                  {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
              </td>
              {(["x", "y", "w", "h"] as const).map((k) => (
                <td key={k}>
                  <input type="number" min={0} max={1} step={0.01} value={Number(r[k].toFixed(3))}
                    onChange={(e) => update(r.id, { [k]: Number(e.target.value) } as Partial<Region>)} />
                </td>
              ))}
              <td><input type="checkbox" checked={r.ocr} onChange={(e) => update(r.id, { ocr: e.target.checked })} /></td>
              <td><input type="checkbox" checked={r.keyframe} onChange={(e) => update(r.id, { keyframe: e.target.checked })} /></td>
              <td><button className="del" onClick={() => remove(r.id)}>刪</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
