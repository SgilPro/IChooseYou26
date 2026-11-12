// 共用頁首行為：窄螢幕（≤720px）把 pill 導覽收進抽屜（menu 圖示開啟）。樣式在 header.css。需要 .topbar .head-actions 內的 .pill-nav a（或 a.try-btn）。
(() => {
  const bar = document.querySelector(".topbar .head-actions");
  if (!bar) return;
  // 樣式在 header.css（單一來源）；本檔只負責行為。
  // pill 導覽：有載入 components.js 時升級成滑動指示塊（跨頁時從上一頁的位置滑過來）
  const pn = bar.querySelector(".pill-nav");
  if (pn && window.UI) { pn.classList.add("ui-tabs"); if (!pn.dataset.uiPersist) pn.dataset.uiPersist = "site-nav"; window.UI.tabs(pn); }
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
