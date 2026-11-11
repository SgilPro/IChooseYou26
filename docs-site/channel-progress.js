// 頻道資料線進度（原本在 teams.html 的「資料說明與進度」，2026-11-11 移到文件首頁的「頻道資料線」文章）。
// 用法：頁面有 <div id="data-progress"></div> 時呼叫 window.renderChannelProgress()。
window.renderChannelProgress = async function () {
  const el = document.getElementById("data-progress");
  if (!el) return;
  const j = async (p) => { const r = await fetch(p, { cache: "no-cache" }); if (!r.ok) throw new Error(p + " " + r.status); return r.json(); };
  try {
    const [videos, teams] = await Promise.all([j("data/channels/fiskepokemon/videos.json"), j("data/channels/fiskepokemon/teams.json")]);
    const total = videos.length;
    const members = videos.filter((v) => v.is_members_only).length;
    const fetched = videos.filter((v) => !v.is_members_only && v.fetch_error == null && v.published_at).length;
    const pending = total - members - fetched;
    const battle = videos.filter((v) => v.category === "battle").length;
    const champPublic = videos.filter((v) => v.game === "champions" && v.category === "battle" && !v.is_members_only && v.fetch_error == null);
    const champMember = videos.filter((v) => v.game === "champions" && v.category === "battle" && v.is_members_only).length;
    const teamVideoIds = new Set(teams.filter((t) => (t.members || []).length > 0).map((t) => t.video_id));
    const extracted = champPublic.filter((v) => teamVideoIds.has(v.id)).length;
    const svPublic = videos.filter((v) => v.game === "sv" && v.category === "battle" && !v.is_members_only && v.fetch_error == null);
    const svExtracted = svPublic.filter((v) => teamVideoIds.has(v.id)).length;
    const latest = videos.map((v) => v.fetched_at).filter(Boolean).sort().pop();
    const pct = (a, b) => (b ? (a / b * 100).toFixed(1) : 0);
    const tiles = [
      [total, "頻道影片總數"], [fetched, "已抓到完整資料"], [members, "會員限定影片"], [battle, "對戰類影片"],
      [teams.filter((t) => (t.members || []).length > 0).length, "已抽取隊伍"],
      [teams.reduce((n, t) => n + (t.members?.length || 0), 0), "已記錄寶可夢配置"],
      [teams.filter((t) => t.review_status === "needs-member-access").length, "會員限定隊伍待補"],
    ].map(([n, l]) => `<div class="tile"><div class="n">${n}</div><div class="l">${l}</div></div>`).join("");
    el.innerHTML = `<p class="pg-note">資料直接從 repo 的 JSON 即時讀取，每次 push 自動更新。資料時間：${latest ? latest.slice(0, 16).replace("T", " ") + " UTC" : "—"}。</p>
      <div class="tiles">${tiles}</div>
      <div class="bars">
        <div class="bar"><div class="t"><span>影片主表抓取進度</span><span>${fetched + members} / ${total}（${pct(fetched + members, total)}%）</span></div>
          <div class="track"><div class="seg ok" style="width:${pct(fetched, total)}%"></div><div class="seg member" style="width:${pct(members, total)}%"></div><div class="seg pending" style="width:${pct(pending, total)}%"></div></div>
          <div class="legend"><span><i style="background:var(--success)"></i>完整 ${fetched}</span><span><i style="background:var(--primary-400)"></i>會員限定 ${members}</span><span><i style="background:var(--line-strong)"></i>待重試 ${pending}</span></div></div>
        <div class="bar"><div class="t"><span>Champions 公開對戰影片 → 隊伍抽取</span><span>${extracted} / ${champPublic.length}（${pct(extracted, champPublic.length)}%）；另有 ${champMember} 支會員限定</span></div>
          <div class="track"><div class="seg ok" style="width:${pct(extracted, champPublic.length)}%"></div></div></div>
        <div class="bar"><div class="t"><span>朱紫（SV）公開對戰影片 → 隊伍匯入（pokepaste）</span><span>${svExtracted} / ${svPublic.length}（${pct(svExtracted, svPublic.length)}%）</span></div>
          <div class="track"><div class="seg ok" style="width:${pct(svExtracted, svPublic.length)}%"></div></div></div>
      </div>
      <p class="pg-note">下載：<a href="data/channels/fiskepokemon/teams.json">teams.json</a> · <a href="data/channels/fiskepokemon/teams.csv">teams.csv</a> · <a href="data/channels/fiskepokemon/videos.json">videos.json</a> · <a href="data/channels/fiskepokemon/videos.csv">videos.csv</a></p>`;
  } catch (e) { el.innerHTML = `<p class="pg-note">進度資料載入失敗：${String(e.message).replace(/[<>&]/g, "")}</p>`; }
};
