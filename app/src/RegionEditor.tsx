import { useRef, useState } from "react";
import { loadVideo, captureFrame } from "./pipeline/frames";
import { type Region, type RegionKind, KIND_LABEL, newRegionId } from "./pipeline/regions";
import TimeField from "./TimeField";
import ToggleButton from "./ToggleButton";

// ROI crop 介面：上傳/抓參考圖，在圖上拖曳畫框、拖動移動、拉把手縮放。
// readOnly 時（使用官方預設、未開自定義）只顯示、不可編輯。

interface Props {
  videoFile: File | null;
  regions: Region[];
  onChange: (regions: Region[]) => void;
  readOnly?: boolean;
  customRoi?: boolean;
  onToggleCustom?: (v: boolean) => void;
  langHasOfficial?: boolean;
}

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type Drag =
  | { mode: "draw"; x0: number; y0: number; cur: { x: number; y: number } }
  | { mode: "move"; id: string; dx: number; dy: number }
  | { mode: "resize"; id: string; handle: Handle };

const KINDS: RegionKind[] = ["gamelog", "ability", "hp_opp", "hp_self", "other"];
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const MIN = 0.02;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function RegionEditor({
  videoFile, regions, onChange, readOnly = false, customRoi, onToggleCustom, langHasOfficial = true,
}: Props) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [grabTime, setGrabTime] = useState(0);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  function frac(e: React.PointerEvent): { x: number; y: number } {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
  }

  async function grabFromVideo() {
    if (!videoFile) return;
    setBusy(true);
    try {
      const v = await loadVideo(videoFile);
      const c = await captureFrame(v, grabTime);
      setImgSrc(c.toDataURL("image/jpeg", 0.9));
    } finally {
      setBusy(false);
    }
  }
  function onUpload(file?: File) {
    if (file) setImgSrc(URL.createObjectURL(file));
  }

  function onStagePointerDown(e: React.PointerEvent) {
    if (readOnly || !imgSrc) return;
    const p = frac(e);
    setDrag({ mode: "draw", x0: p.x, y0: p.y, cur: p });
    boxRef.current?.setPointerCapture(e.pointerId);
  }
  function onRectPointerDown(e: React.PointerEvent, r: Region) {
    e.stopPropagation();
    setSelected(r.id);
    if (readOnly) return;
    const p = frac(e);
    setDrag({ mode: "move", id: r.id, dx: p.x - r.x, dy: p.y - r.y });
    boxRef.current?.setPointerCapture(e.pointerId);
  }
  function onHandlePointerDown(e: React.PointerEvent, r: Region, handle: Handle) {
    e.stopPropagation();
    if (readOnly) return;
    setSelected(r.id);
    setDrag({ mode: "resize", id: r.id, handle });
    boxRef.current?.setPointerCapture(e.pointerId);
  }

  function resizeRect(r: Region, handle: Handle, p: { x: number; y: number }): Region {
    let { x, y, w, h } = r;
    const right = x + w, bottom = y + h;
    if (handle.includes("w")) { const nx = Math.min(p.x, right - MIN); x = clamp01(nx); w = right - x; }
    if (handle.includes("e")) { w = Math.max(MIN, Math.min(p.x, 1) - x); }
    if (handle.includes("n")) { const ny = Math.min(p.y, bottom - MIN); y = clamp01(ny); h = bottom - y; }
    if (handle.includes("s")) { h = Math.max(MIN, Math.min(p.y, 1) - y); }
    return { ...r, x, y, w, h };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const p = frac(e);
    if (drag.mode === "draw") setDrag({ ...drag, cur: p });
    else if (drag.mode === "move")
      onChange(regions.map((r) => (r.id === drag.id ? { ...r, x: clamp01(Math.min(1 - r.w, p.x - drag.dx)), y: clamp01(Math.min(1 - r.h, p.y - drag.dy)) } : r)));
    else if (drag.mode === "resize")
      onChange(regions.map((r) => (r.id === drag.id ? resizeRect(r, drag.handle, p) : r)));
  }
  function onPointerUp() {
    if (drag?.mode === "draw") {
      const x = Math.min(drag.x0, drag.cur.x), y = Math.min(drag.y0, drag.cur.y);
      const w = Math.abs(drag.cur.x - drag.x0), h = Math.abs(drag.cur.y - drag.y0);
      if (w > MIN && h > MIN) {
        const id = newRegionId();
        onChange([...regions, { id, label: `區域 ${regions.length + 1}`, kind: "other", x, y, w, h, ocr: true, keyframe: false }]);
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
      ? { left: `${Math.min(drag.x0, drag.cur.x) * 100}%`, top: `${Math.min(drag.y0, drag.cur.y) * 100}%`, width: `${Math.abs(drag.cur.x - drag.x0) * 100}%`, height: `${Math.abs(drag.cur.y - drag.y0) * 100}%` }
      : null;

  return (
    <div>
      <p className="hint">
        {readOnly
          ? "目前使用官方預設 ROI（依 OCR 語言）。要微調請開啟上方「自定義 ROI 裁切」。下方仍可載入參考圖預覽框選位置。"
          : "上傳截圖或從影片抓一格當參考圖，在圖上拖曳畫框新增 ROI、拖動方框移動、拉四角/四邊把手縮放。"}
      </p>
      <div className="row">
        <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          上傳參考圖
          <input type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} />
        </label>
        <span className="hint">或</span>
        <label style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          影片時間
          <TimeField value={grabTime} onChange={setGrabTime} />
        </label>
        <button onClick={grabFromVideo} disabled={!videoFile || busy}>
          {busy ? "抓取中…" : "從影片抓一格"}
        </button>
      </div>

      {imgSrc ? (
        <div ref={boxRef} className="roi-stage" onPointerDown={onStagePointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
          <img src={imgSrc} alt="參考圖" draggable={false} />
          {regions.map((r) => (
            <div
              key={r.id}
              className={"roi-rect" + (selected === r.id ? " sel" : "")}
              style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` }}
              onPointerDown={(e) => onRectPointerDown(e, r)}
            >
              <span className="roi-tag">{r.label}</span>
              {!readOnly && selected === r.id &&
                HANDLES.map((hd) => (
                  <span key={hd} className={"roi-handle h-" + hd} onPointerDown={(e) => onHandlePointerDown(e, r, hd)} />
                ))}
            </div>
          ))}
          {pending && <div className="roi-rect pending" style={pending} />}
        </div>
      ) : (
        <div className="roi-stage empty">尚未載入參考圖</div>
      )}

      {onToggleCustom && (
        <div className="roi-toolbar">
          <ToggleButton checked={!!customRoi} onChange={onToggleCustom} label="自定義 ROI 裁切" />
          <span className="hint">
            {customRoi
              ? "已開啟：下方表格與圖上方框可編輯、縮放、存 preset。"
              : `關閉中：使用官方預設 ROI（依 OCR 語言）${langHasOfficial ? "" : "，此語言尚無官方預設，暫用英文"}，表格唯讀。開啟以微調特殊版面（如直播塞聊天室）。`}
          </span>
        </div>
      )}

      <table className={"roi-table" + (readOnly ? " readonly" : "")}>
        <thead>
          <tr><th>標籤</th><th>類型</th><th>x</th><th>y</th><th>w</th><th>h</th><th>OCR</th><th>關鍵影格</th><th></th></tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.id} className={selected === r.id ? "sel" : ""} onClick={() => setSelected(r.id)}>
              <td><input value={r.label} disabled={readOnly} onChange={(e) => update(r.id, { label: e.target.value })} /></td>
              <td>
                <select value={r.kind} disabled={readOnly} onChange={(e) => update(r.id, { kind: e.target.value as RegionKind })}>
                  {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
              </td>
              {(["x", "y", "w", "h"] as const).map((k) => (
                <td key={k}>
                  <input type="number" min={0} max={1} step={0.001} disabled={readOnly} value={Number(r[k].toFixed(3))}
                    onChange={(e) => update(r.id, { [k]: Number(e.target.value) } as Partial<Region>)} />
                </td>
              ))}
              <td><input type="checkbox" checked={r.ocr} disabled={readOnly} onChange={(e) => update(r.id, { ocr: e.target.checked })} /></td>
              <td><input type="checkbox" checked={r.keyframe} disabled={readOnly} onChange={(e) => update(r.id, { keyframe: e.target.checked })} /></td>
              <td><button className="del" disabled={readOnly} onClick={() => remove(r.id)}>刪</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
