// Live docs SPA — 載入 content/*.md 並用 marked 渲染。
// 新增頁面：在 PAGES 加一筆，並在 content/ 放對應 .md。

const PAGES = [
  {
    group: "開始", items: [
      { id: "overview", title: "這是什麼產品", file: "content/overview.md" },
      { id: "gamelog", title: "Game Log 功能", file: "content/gamelog.md" },
    ]
  },
  {
    group: "規劃", items: [
      { id: "roadmap", title: "藍圖與方向", file: "content/roadmap.md" },
      { id: "how-it-works", title: "運作原理（白話版）", file: "content/how-it-works.md" },
    ]
  },
  {
    group: "進度", items: [
      { id: "progress", title: "目前進度", file: "content/progress.md" },
      { id: "about-ditto", title: "關於 Ditto", file: "content/about-ditto.md" },
    ]
  },
];

const navEl = document.getElementById("nav");
const articleEl = document.getElementById("article");
const sidebar = document.getElementById("sidebar");
const navToggle = document.getElementById("navToggle");

function buildNav() {
  navEl.innerHTML = "";
  for (const grp of PAGES) {
    const g = document.createElement("div");
    g.className = "nav-group";
    const t = document.createElement("div");
    t.className = "nav-group-title";
    t.textContent = grp.group;
    g.appendChild(t);
    for (const it of grp.items) {
      const a = document.createElement("a");
      a.className = "nav-link";
      a.textContent = it.title;
      a.dataset.id = it.id;
      a.href = "#" + it.id;
      g.appendChild(a);
    }
    navEl.appendChild(g);
  }
}

function findPage(id) {
  for (const grp of PAGES) for (const it of grp.items) if (it.id === id) return it;
  return null;
}

function setActive(id) {
  document.querySelectorAll(".nav-link").forEach(a => {
    a.classList.toggle("active", a.dataset.id === id);
  });
}

async function load(id) {
  const page = findPage(id) || PAGES[0].items[0];
  setActive(page.id);
  articleEl.innerHTML = "載入中…";
  try {
    const res = await fetch(page.file, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    const md = await res.text();
    articleEl.innerHTML = marked.parse(md);
  } catch (e) {
    articleEl.innerHTML = `<h1>${page.title}</h1><p>這頁內容還在準備中。</p>`;
  }
  window.scrollTo(0, 0);
  sidebar.classList.remove("open");
}

function route() {
  const id = location.hash.replace(/^#/, "") || PAGES[0].items[0].id;
  load(id);
}

navToggle?.addEventListener("click", () => sidebar.classList.toggle("open"));
window.addEventListener("hashchange", route);

buildNav();
route();
document.getElementById("updated").textContent =
  "最後更新：2026-06-11";
