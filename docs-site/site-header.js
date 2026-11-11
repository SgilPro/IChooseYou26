// 共用頁首：窄螢幕（≤720px）把右側按鈕收進抽屜（menu 圖示開啟）。需要 .topbar .head-actions 內的 a.try-btn。
(() => {
  const bar = document.querySelector(".topbar .head-actions");
  if (!bar) return;
  const css = `
  .pill-nav { display: flex; align-items: center; gap: 2px; padding: 4px; border-radius: 999px; background: var(--bg-soft, #EEF0F2); border: 1px solid var(--border, #C9CDD2); }
  .pill-nav a { text-decoration: none; font-size: 14px; font-weight: 600; line-height: 1; padding: 8px 14px; border-radius: 999px; color: var(--ink-soft, #4A525B); white-space: nowrap; transition: background .2s, color .2s; }
  .pill-nav a:hover { color: var(--ink, #1B1F24); background: var(--sunken, #D9DDE1); }
  .pill-nav a[aria-current="page"] { background: var(--primary, #4F3DB5); color: var(--on-primary, #fff); }
  .topbar.compact .pill-nav a { padding: 7px 12px; font-size: 13px; }
  @media (prefers-reduced-motion: reduce) { .pill-nav a { transition: none; } }
  .menu-btn, .drawer, .drawer-back { display: none; }
  @media (max-width: 720px) {
    .head-actions > a.try-btn, .head-actions > .nav-toggle, .head-actions > .pill-nav { display: none !important; }
    .menu-btn { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border, #C9CDD2); background: var(--bg-soft, #EEF0F2); color: var(--ink, #1B1F24); cursor: pointer; }
    .drawer-back { display: block; position: fixed; inset: 0; background: rgba(27,31,36,.45); opacity: 0; pointer-events: none; transition: opacity .2s; z-index: 9000; }
    .drawer { display: flex; flex-direction: column; gap: 10px; position: fixed; top: 0; right: 0; bottom: 0; width: min(300px, 82vw); background: var(--panel, #F7F8F9); border-left: 1px solid var(--border, #C9CDD2); padding: 16px; transform: translateX(100%); transition: transform .22s; z-index: 9001; overflow-y: auto; }
    .drawer a, .drawer button.dlink { display: flex; align-items: center; gap: 8px; text-decoration: none; font: inherit; font-size: 15px; font-weight: 600; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border, #C9CDD2); background: var(--bg-soft, #EEF0F2); color: var(--ink, #1B1F24); cursor: pointer; text-align: left; }
    .drawer .dclose { align-self: flex-end; width: 40px; height: 40px; padding: 0; justify-content: center; }
    .drawer svg { flex: none; }
    .drawer a[aria-current="page"] { background: var(--primary, #4F3DB5); color: var(--on-primary, #fff); border-color: var(--primary, #4F3DB5); }
    body.drawer-open .drawer { transform: none; }
    body.drawer-open .drawer-back { opacity: 1; pointer-events: auto; }
  }
  @media (prefers-reduced-motion: reduce) { .drawer, .drawer-back { transition: none; } }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const ICON = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "menu-btn"; btn.setAttribute("aria-label", "選單"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "site-drawer");
  btn.innerHTML = ICON('<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>');
  bar.appendChild(btn);
  const back = document.createElement("div"); back.className = "drawer-back";
  const dr = document.createElement("nav"); dr.className = "drawer"; dr.id = "site-drawer"; dr.setAttribute("aria-label", "網站選單");
  const close = document.createElement("button"); close.type = "button"; close.className = "dlink dclose"; close.setAttribute("aria-label", "關閉選單");
  close.innerHTML = ICON('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
  dr.appendChild(close);
  bar.querySelectorAll(":scope > a.try-btn, :scope > .pill-nav a").forEach((a) => { const c = document.createElement("a"); c.href = a.getAttribute("href"); c.textContent = a.textContent; if (a.getAttribute("aria-current")) c.setAttribute("aria-current", "page"); dr.appendChild(c); });
  const toc = document.getElementById("navToggle");
  if (toc) { const b = document.createElement("button"); b.type = "button"; b.className = "dlink"; b.textContent = "📚 文件目錄"; b.addEventListener("click", () => { set(false); toc.click(); }); dr.appendChild(b); }
  document.body.append(back, dr);
  const set = (open) => { document.body.classList.toggle("drawer-open", open); btn.setAttribute("aria-expanded", String(open)); if (open) close.focus(); else btn.focus({ preventScroll: true }); };
  btn.addEventListener("click", () => set(!document.body.classList.contains("drawer-open")));
  close.addEventListener("click", () => set(false));
  back.addEventListener("click", () => set(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("drawer-open")) set(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 720) set(false); });
})();
