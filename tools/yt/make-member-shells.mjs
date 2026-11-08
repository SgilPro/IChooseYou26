#!/usr/bin/env node
// 為「會員限定」的對戰影片建立隊伍殼記錄（members 空、review_status=needs-member-access），
// 讓主表與隊伍表的覆蓋率一目了然，之後用會員 cookies 補資料時直接覆寫。
// 用法：node tools/yt/make-member-shells.mjs data/channels/fiskepokemon

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const chDir = process.argv[2] || join("data", "channels", "fiskepokemon");
const videos = JSON.parse(readFileSync(join(chDir, "videos.json"), "utf8"));
const REGS = JSON.parse(readFileSync("data/ref/regulation_sets.json", "utf8"));
const TAGS = JSON.parse(readFileSync("data/ref/tags.json", "utf8"));
const teamsDir = join(chDir, "teams");
mkdirSync(teamsDir, { recursive: true });

const CHAMPIONS_LAUNCH = "2026-04-08";
function regulationFor(game, date) {
  if (!date) return null;
  const hits = REGS.filter((r) => r.game === game && r.starts_on && r.starts_on <= date && (!r.ends_on || date <= r.ends_on));
  hits.sort((a, b) => (b.starts_on || "").localeCompare(a.starts_on || ""));
  return hits[0]?.id ?? null;
}
function tagsFromTitle(title) {
  return [...new Set(TAGS.filter((t) => (t.aliases_zh || []).some((a) => a && title.includes(a))).map((t) => t.slug))];
}
function teamNameFromTitle(title) {
  const m = /([^！!？?。｜|]{2,40}隊)\s*【/.exec(title);
  return m ? m[1].trim() : title.split("【")[0].trim().slice(0, 40);
}

// 會員影片沒有 published_at（未登入抓不到）；遊戲/規則用標題推：【寶可夢 Champions】→ champions，【寶可夢朱紫】→ sv
let made = 0, skipped = 0;
for (const v of videos) {
  if (!v.is_members_only) continue;
  const title = v.title || "";
  const isBattleLike = v.category === "battle" || /隊【|Mega|雙打|對戰/.test(title);
  if (!isBattleLike) continue;
  const out = join(teamsDir, `${v.id}.json`);
  if (existsSync(out)) { skipped++; continue; }
  const game = /Champions|寶可夢冠軍/i.test(title) ? "champions" : /朱紫/.test(title) ? "sv" : (v.game ?? "sv");
  writeFileSync(out, JSON.stringify([{
    id: `team_${v.id}`,
    name: teamNameFromTitle(title),
    name_source: "title",
    video_id: v.id, video_url: v.url, channel_handle: v.channel_handle ?? "@fiskepokemon",
    game,
    regulation_set_id: regulationFor(game, v.published_at), regulation_source: v.published_at ? "date-inferred" : null,
    tags: tagsFromTitle(title), tags_source: "title",
    author: "Fiske", author_source: "channel",
    members: [],
    is_members_only: true,
    related_video_ids: [],
    sources: { subtitle_lang: null, subtitle_range_s: null, frames_used: 0, pokepaste_url: null },
    confidence: 0,
    review_status: "needs-member-access",
    review_notes: "會員限定影片，未登入抓不到 metadata/字幕/畫面；待用會員 cookies 重抓後走抽取流程。",
    notes: null,
    extracted_at: new Date().toISOString(),
    extracted_by: "make-member-shells-v1",
  }], null, 2));
  made++;
}
console.error(`[shells] made ${made} · skipped(existing) ${skipped}`);
