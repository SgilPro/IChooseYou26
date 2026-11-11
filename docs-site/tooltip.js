// 自製 tooltip：hover／focus 立即顯示，不改游標。
// 用法：任何元素寫 title="…" 或 data-tip="…" 即可（事件委派，動態產生的元素也有效）。
// 實作：第一次 hover 時把 title 搬到 data-tip，避免瀏覽器原生 tooltip 重複出現。
(() => {
  const css = `
  .ic-tip { position: fixed; z-index: 9999; max-width: min(320px, calc(100vw - 16px)); padding: 7px 11px; border-radius: 8px;
    background: #1B1F24; color: #fff; font: 600 12.5px/1.45 system-ui, -apple-system, "Noto Sans TC", sans-serif; letter-spacing: .01em;
    box-shadow: 0 6px 18px rgba(27,31,36,.28); pointer-events: none; opacity: 0; transform: translateY(2px);
    transition: opacity .08s, transform .08s; white-space: pre-line; overflow-wrap: anywhere; }
  .ic-tip.on { opacity: 1; transform: none; }
  .ic-tip::after { content: ""; position: absolute; left: var(--ax, 50%); width: 10px; height: 10px; background: inherit; transform: translateX(-50%) rotate(45deg); }
  .ic-tip[data-pos="top"]::after { bottom: -4px; }
  .ic-tip[data-pos="bottom"]::after { top: -4px; }
  @media (prefers-reduced-motion: reduce) { .ic-tip { transition: none; } }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const tip = document.createElement("div"); tip.className = "ic-tip"; tip.setAttribute("role", "tooltip"); tip.id = "ic-tip";
  document.body.appendChild(tip);
  let cur = null;
  const find = (el) => (el && el.closest ? el.closest("[title],[data-tip]") : null);
  const text = (el) => {
    if (el.hasAttribute("title")) { const t = el.getAttribute("title"); if (t) el.dataset.tip = t; el.removeAttribute("title"); }
    return el.dataset.tip || "";
  };
  const place = (el) => {
    const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect(), gap = 9;
    let pos = "top", y = r.top - tr.height - gap;
    if (y < 6) { pos = "bottom"; y = r.bottom + gap; }
    let x = r.left + r.width / 2 - tr.width / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tr.width - 8));
    tip.dataset.pos = pos; tip.style.left = x + "px"; tip.style.top = y + "px";
    tip.style.setProperty("--ax", Math.max(14, Math.min(tr.width - 14, r.left + r.width / 2 - x)) + "px");
  };
  const show = (el) => {
    const t = text(el); if (!t) return;
    cur = el; tip.textContent = t; tip.classList.remove("on"); tip.style.left = "0px"; tip.style.top = "0px";
    place(el); tip.classList.add("on");
    el.setAttribute("aria-describedby", "ic-tip");
  };
  const hide = () => { if (cur) cur.removeAttribute("aria-describedby"); cur = null; tip.classList.remove("on"); };
  document.addEventListener("mouseover", (e) => { const el = find(e.target); if (el && el !== cur) show(el); else if (!el) hide(); });
  document.addEventListener("mouseout", (e) => { if (cur && !cur.contains(e.relatedTarget)) hide(); });
  document.addEventListener("focusin", (e) => { const el = find(e.target); if (el) show(el); });
  document.addEventListener("focusout", hide);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  window.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("resize", hide);
})();
