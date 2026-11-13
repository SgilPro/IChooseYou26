#!/usr/bin/env node
// 慢速穩定的影格準備：每次執行只處理「佇列中的下一支」會員對戰影片，供排程（cron/launchd/CronCreate）定期呼叫。
//
// 佇列規則（發布日由新到舊）：
//   is_members_only && category=battle && 抓到 metadata && 有隊伍介紹段（team_intro_range）
//   && teams/<id>.json 仍是「會員殼」（review_status=needs-member-access 且無成員、且 review_notes 沒標「非隊伍介紹」）
//   && 還沒有影格。
// 保護機制：
//   - 鎖檔：同時只跑一個。
//   - 超前上限（MAX_AHEAD，預設 4）：影格已備好、但隊伍尚未抽取的影片達上限就不再下載，避免抽取跟不上而白下載。
//   - 退避：下載失敗（含被限流/要求登入）就寫 raw/.prep-backoff，BACKOFF_H（預設 3）小時內不再嘗試。
//   - 只下載「隊伍介紹段」片段，不下載整支影片。
//
// 用法：node tools/yt/prep-queue-next.mjs [channelDir]   （預設 data/channels/fiskepokemon）
// 環境變數：COOKIES（預設 ~/_projects/www.youtube.com_cookies.txt）、MAX_AHEAD、BACKOFF_H
// 輸出一行摘要到 stdout，並追加到 <ch>/raw/prep-queue.log。

import { loadVideos } from "./lib-private.mjs";
import { readFileSync, existsSync, writeFileSync, appendFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const ch = process.argv[2] || "data/channels/fiskepokemon";
const raw = join(ch, "raw");
const LOG = join(raw, "prep-queue.log");
const LOCK = join(raw, ".prep-queue.lock");
const BACKOFF = join(raw, ".prep-backoff");
const MAX_AHEAD = Number(process.env.MAX_AHEAD || 12);
const BACKOFF_H = Number(process.env.BACKOFF_H || 3);
const COOKIES = process.env.COOKIES || join(homedir(), "_projects", "www.youtube.com_cookies.txt");

const say = (msg) => {
  const line = `${new Date().toISOString()} ${msg}`;
  appendFileSync(LOG, line + "\n");
  console.log(line);
};

// --- 鎖（超過 40 分鐘視為殘留）
if (existsSync(LOCK) && Date.now() - statSync(LOCK).mtimeMs < 40 * 60 * 1000) { say("skip: 另一個準備程序執行中"); process.exit(0); }
writeFileSync(LOCK, String(process.pid));
const done = (code = 0) => { rmSync(LOCK, { force: true }); process.exit(code); };

// --- 已有其他 prep-team-intro 在跑（例如手動批次）就不要重複下載
const others = spawnSync("pgrep", ["-f", "tools/yt/prep-team-intro.mjs"], { encoding: "utf8" }).stdout.trim().split("\n").filter(Boolean);
if (others.length) { say(`skip: 已有 prep-team-intro 程序執行中（pid ${others.join(",")}）`); done(); }

// --- 退避
if (existsSync(BACKOFF)) {
  const until = Number(readFileSync(BACKOFF, "utf8"));
  if (Date.now() < until) { say(`skip: 退避中，到 ${new Date(until).toISOString()}`); done(); }
  rmSync(BACKOFF, { force: true });
}
if (!existsSync(COOKIES)) { say(`stop: 找不到 cookies：${COOKIES}`); done(1); }

const videos = loadVideos(ch);
const isShell = (id) => {
  const f = join(ch, "teams", `${id}.json`);
  if (!existsSync(f)) return false;
  const t = JSON.parse(readFileSync(f, "utf8"))[0];
  return t && t.review_status === "needs-member-access" && !(t.members?.length) && !/非隊伍介紹/.test(t.review_notes || "");
};
const hasFrames = (id) => { const d = join(ch, "frames", id); return existsSync(d) && readdirSync(d).some((f) => f.startsWith("f_")); };

const queue = videos
  .filter((v) => v.is_members_only && v.category === "battle" && v.fetch_error == null && v.team_intro_range && isShell(v.id))
  .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));

const ahead = queue.filter((v) => hasFrames(v.id)).length;
const next = queue.find((v) => !hasFrames(v.id));
if (!next) { say(`idle: 佇列無待準備影片（待抽取 ${queue.length} 支，其中已備影格 ${ahead}）`); done(); }
if (ahead >= MAX_AHEAD) { say(`wait: 已備影格但尚未抽取 ${ahead} 支（上限 ${MAX_AHEAD}），暫不下載。下一支會是 ${next.id}`); done(); }

say(`start: ${next.id} (${next.published_at?.slice(0, 10)}) ${next.title?.slice(0, 30)}`);
const r = spawnSync("node", ["tools/yt/prep-team-intro.mjs", ch, next.id], {
  env: { ...process.env, COOKIES }, encoding: "utf8", timeout: 20 * 60 * 1000,
});
const out = `${r.stdout || ""}${r.stderr || ""}`.trim().split("\n").slice(-3).join(" | ");
if (r.status !== 0 || !hasFrames(next.id)) {
  writeFileSync(BACKOFF, String(Date.now() + BACKOFF_H * 3600 * 1000));
  say(`FAIL: ${next.id} 退避 ${BACKOFF_H} 小時。${out.slice(0, 300)}`);
  done(1);
}
say(`ok: ${next.id} 影格已備好。${out.slice(0, 160)}`);
done();
