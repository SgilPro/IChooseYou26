// I Choose You UI Kit 行為（樣式在 components.css）。純原生 JS、無相依。
//   window.UI.select(selectEl)   把原生 <select> 升級成自製下拉（保留原生 select 當資料來源，change 事件照常發出）
//   window.UI.tabs(containerEl)  pill 分頁／導覽的滑動指示塊與鍵盤操作
//   window.UI.init(root?)        掃描 root 內的 select[data-ui-select]、.ui-tabs、可移除的 .ui-chip .x
// 載入後會自動對整份文件執行一次 init。
(() => {
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  let uid = 0;

  // ---------- Select ----------
  // 鍵盤（WAI-ARIA combobox + listbox）：Enter／Space／↓／↑ 開啟；↑↓ 移動；Home／End；Enter／Space 選取；Esc 關閉；直接打字跳到開頭相符的選項；Tab 關閉並移走焦點。
  function select(sel) {
    if (!sel || sel._ui) return sel && sel._ui;
    const id = "ui-sel-" + (++uid);
    const wrap = document.createElement("span");
    wrap.className = "ui-select" + (sel.dataset.uiSize === "sm" ? " sm" : "");
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "ui-select-trigger";
    btn.setAttribute("role", "combobox"); btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", id);
    const lab = sel.getAttribute("aria-label") || (sel.closest("label") ? [...sel.closest("label").childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("") : "");
    if (lab) btn.setAttribute("aria-label", lab);
    btn.innerHTML = '<span class="v"></span>' + CHEV;
    wrap.appendChild(btn);
    const menu = document.createElement("div");
    menu.className = "ui-menu"; menu.id = id; menu.setAttribute("role", "listbox"); menu.tabIndex = -1;
    if (lab) menu.setAttribute("aria-label", lab);
    document.body.appendChild(menu);

    let items = [], active = -1, open = false, typed = "", typedAt = 0;
    const optEl = (o, i) => {
      const d = document.createElement("div");
      d.className = "ui-menu-item"; d.id = `${id}-o${i}`; d.setAttribute("role", "option"); d.dataset.i = i;
      d.setAttribute("aria-selected", String(o.selected)); if (o.disabled) d.setAttribute("aria-disabled", "true");
      const s = document.createElement("span"); s.className = "lab"; s.textContent = o.textContent; d.appendChild(s);
      return d;
    };
    const build = () => {
      menu.textContent = ""; items = [];
      const opts = [...sel.options];
      for (const node of sel.children) {
        if (node.tagName === "OPTGROUP") {
          const g = document.createElement("div"); g.className = "ui-menu-group"; g.setAttribute("role", "presentation"); g.textContent = node.label; menu.appendChild(g);
          for (const o of node.children) { const el = optEl(o, opts.indexOf(o)); menu.appendChild(el); items.push(el); }
        } else if (node.tagName === "OPTION") { const el = optEl(node, opts.indexOf(node)); menu.appendChild(el); items.push(el); }
      }
      sync();
    };
    const sync = () => {
      const o = sel.options[sel.selectedIndex];
      btn.querySelector(".v").textContent = o ? o.textContent : "";
      items.forEach((el) => el.setAttribute("aria-selected", String(Number(el.dataset.i) === sel.selectedIndex)));
      btn.disabled = sel.disabled;
    };
    const setActive = (k, scroll = true) => {
      if (!items.length) return;
      active = Math.max(0, Math.min(items.length - 1, k));
      items.forEach((el, j) => { if (j === active) el.dataset.active = "true"; else delete el.dataset.active; });
      btn.setAttribute("aria-activedescendant", items[active].id);
      if (scroll) items[active].scrollIntoView({ block: "nearest" });
    };
    const place = () => {
      const r = btn.getBoundingClientRect();
      menu.style.minWidth = r.width + "px";
      const mh = menu.offsetHeight, mw = menu.offsetWidth;
      const below = window.innerHeight - r.bottom, top = below < mh + 12 && r.top > below;
      menu.dataset.side = top ? "top" : "bottom";
      menu.style.top = (top ? Math.max(8, r.top - mh - 6) : r.bottom + 6) + "px";
      menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8)) + "px";
      menu.style.setProperty("--ui-origin", top ? "bottom left" : "top left");
    };
    const show = () => {
      if (open || sel.disabled) return;
      open = true; build(); place(); menu.classList.add("open"); btn.setAttribute("aria-expanded", "true");
      const cur = items.findIndex((el) => Number(el.dataset.i) === sel.selectedIndex);
      setActive(cur >= 0 ? cur : 0);
      document.addEventListener("pointerdown", outside, true);
      window.addEventListener("resize", hide); window.addEventListener("scroll", onScroll, true);
    };
    const hide = (focus) => {
      if (!open) return;
      open = false; menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.removeAttribute("aria-activedescendant");
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("resize", hide); window.removeEventListener("scroll", onScroll, true);
      if (focus === true) btn.focus({ preventScroll: true });
    };
    const outside = (e) => { if (!menu.contains(e.target) && !wrap.contains(e.target)) hide(); };
    const onScroll = (e) => { if (!menu.contains(e.target)) hide(); };
    const choose = (k) => {
      const el = items[k]; if (!el || el.getAttribute("aria-disabled") === "true") return;
      const i = Number(el.dataset.i);
      if (sel.selectedIndex !== i) { sel.selectedIndex = i; sync(); sel.dispatchEvent(new Event("input", { bubbles: true })); sel.dispatchEvent(new Event("change", { bubbles: true })); }
      hide(true);
    };
    const typeahead = (ch) => {
      const now = Date.now(); typed = now - typedAt > 700 ? ch : typed + ch; typedAt = now;
      const q = typed.toLowerCase();
      const from = open && typed.length === 1 ? active + 1 : 0;
      const order = [...items.keys()].slice(from).concat([...items.keys()].slice(0, from));
      const hit = order.find((k) => items[k].textContent.trim().toLowerCase().startsWith(q));
      if (hit === undefined) return;
      if (open) setActive(hit); else { build(); choose(hit); }
    };
    btn.addEventListener("click", () => (open ? hide(true) : show()));
    btn.addEventListener("keydown", (e) => {
      const k = e.key;
      if (!open) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(k)) { e.preventDefault(); show(); }
        else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { build(); typeahead(k); }
        return;
      }
      if (k === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (k === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (k === "Home") { e.preventDefault(); setActive(0); }
      else if (k === "End") { e.preventDefault(); setActive(items.length - 1); }
      else if (k === "Enter" || k === " ") { e.preventDefault(); choose(active); }
      else if (k === "Escape") { e.preventDefault(); e.stopPropagation(); hide(true); }
      else if (k === "Tab") hide();
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(k);
    });
    menu.addEventListener("pointermove", (e) => { const el = e.target.closest(".ui-menu-item"); if (el) setActive(items.indexOf(el), false); });
    menu.addEventListener("click", (e) => { const el = e.target.closest(".ui-menu-item"); if (el) choose(items.indexOf(el)); });
    menu.addEventListener("pointerdown", (e) => e.preventDefault()); // 焦點留在 trigger
    sel.addEventListener("change", sync);
    // 程式直接設 select.value／selectedIndex 不會有事件：包一層 setter 讓外觀跟著更新
    for (const prop of ["value", "selectedIndex"]) {
      const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, prop);
      Object.defineProperty(sel, prop, { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    }
    // 選項被動態增減時重建
    new MutationObserver(() => { if (open) { build(); place(); } else sync(); }).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "label"] });
    build();
    return (sel._ui = { open: show, close: hide, sync, rebuild: build, trigger: btn, menu });
  }

  // ---------- Tabs ----------
  // 選取項：role="tab" 用 aria-selected；連結用 aria-current="page"。←→／Home／End 切換（僅 role="tab"）。
  // data-ui-persist="key"：導覽連結跨頁時，記住上一頁指示塊的位置，新頁載入時從那裡滑到新的選取項。
  function tabs(box) {
    if (!box || box._ui) return box && box._ui;
    const list = () => [...box.querySelectorAll(':scope > [role="tab"], :scope > a')];
    const isTab = (el) => el.getAttribute("role") === "tab";
    const selected = () => list().find((el) => el.getAttribute("aria-selected") === "true" || el.getAttribute("aria-current") === "page");
    const mk = (cls) => { const s = document.createElement("span"); s.className = cls; s.setAttribute("aria-hidden", "true"); box.prepend(s); return s; };
    const hov = mk("ui-tabs-hover"), ind = mk("ui-tabs-ind");
    const rect = (el) => ({ x: el.offsetLeft, w: el.offsetWidth });
    const put = (node, r) => { node.style.transform = `translateX(${r.x}px)`; node.style.width = r.w + "px"; };
    const move = (animate = true) => {
      const el = selected();
      if (!el) { ind.style.opacity = "0"; return; }
      if (!animate || reduce()) { box.classList.add("no-anim"); put(ind, rect(el)); void ind.offsetWidth; box.classList.remove("no-anim"); }
      else put(ind, rect(el));
      ind.style.opacity = "1";
    };
    const activate = (el, focus) => {
      for (const t of list()) {
        if (!isTab(t)) continue;
        const on = t === el; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
        const p = t.getAttribute("aria-controls") && document.getElementById(t.getAttribute("aria-controls")); if (p) p.hidden = !on;
      }
      move(); if (focus) el.focus();
      box.dispatchEvent(new CustomEvent("ui-tab-change", { bubbles: true, detail: { tab: el, value: el.dataset.value ?? el.textContent.trim() } }));
    };
    box.addEventListener("click", (e) => {
      const el = e.target.closest('[role="tab"], a'); if (!el || el.parentNode !== box) return;
      if (isTab(el)) { if (el.getAttribute("aria-selected") !== "true") activate(el); }
      else if (box.dataset.uiPersist) { const cur = selected(); if (cur) try { sessionStorage.setItem("ui-tabs:" + box.dataset.uiPersist, JSON.stringify(rect(cur))); } catch (er) {} }
    });
    box.addEventListener("keydown", (e) => {
      const el = e.target.closest('[role="tab"]'); if (!el) return;
      const ts = list().filter(isTab), i = ts.indexOf(el); let n = -1;
      if (e.key === "ArrowRight") n = (i + 1) % ts.length; else if (e.key === "ArrowLeft") n = (i - 1 + ts.length) % ts.length;
      else if (e.key === "Home") n = 0; else if (e.key === "End") n = ts.length - 1;
      if (n >= 0) { e.preventDefault(); activate(ts[n], true); }
    });
    box.addEventListener("pointerover", (e) => {
      const el = e.target.closest('[role="tab"], a'); if (!el || el.parentNode !== box || e.pointerType === "touch") return;
      if (el === selected()) { hov.style.opacity = "0"; return; }
      if (hov.style.opacity !== "1") { box.classList.add("no-anim"); put(hov, rect(el)); void hov.offsetWidth; box.classList.remove("no-anim"); } else put(hov, rect(el));
      hov.style.opacity = "1";
    });
    box.addEventListener("pointerleave", () => { hov.style.opacity = "0"; });
    for (const t of list()) if (isTab(t)) t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
    // 初始定位；若有上一頁留下的位置，從那裡滑過來
    let from = null;
    if (box.dataset.uiPersist) try { const k = "ui-tabs:" + box.dataset.uiPersist; from = JSON.parse(sessionStorage.getItem(k) || "null"); sessionStorage.removeItem(k); } catch (er) {}
    box.classList.add("ready");
    if (from && selected() && !reduce()) { box.classList.add("no-anim"); put(ind, from); ind.style.opacity = "1"; void ind.offsetWidth; box.classList.remove("no-anim"); requestAnimationFrame(() => move(true)); }
    else move(false);
    const re = () => move(false);
    window.addEventListener("resize", re);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(re);
    if (window.ResizeObserver) new ResizeObserver(re).observe(box);
    return (box._ui = { move, activate });
  }

  // ---------- 可移除的 chip ----------
  document.addEventListener("click", (e) => {
    const x = e.target.closest(".ui-chip .x"); if (!x) return;
    const chip = x.closest(".ui-chip");
    if (!chip.dispatchEvent(new CustomEvent("ui-chip-remove", { bubbles: true, cancelable: true, detail: { value: chip.dataset.value ?? chip.textContent.trim() } }))) return;
    chip.classList.add("leaving"); setTimeout(() => chip.remove(), reduce() ? 0 : 150);
  });

  function init(root = document) {
    root.querySelectorAll("select[data-ui-select]").forEach(select);
    root.querySelectorAll(".ui-tabs").forEach(tabs);
  }
  window.UI = { select, tabs, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init()); else init();
})();
