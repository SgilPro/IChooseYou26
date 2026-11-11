#!/usr/bin/env node
// 把 raw/*.info.json 瘦身成 build-videos.mjs 實際用到的欄位（原檔含大量格式清單、縮圖、留言，單檔可達數百 KB）。
// 用法：node tools/yt/slim-info-json.mjs <srcRawDir> <dstRawDir>   （dst 不存在會建立；非 *.info.json 的檔案不動）
// 保留：id、title、availability、description、duration、chapters、subtitles／automatic_captions（只留語言鍵）、
//      upload_date、comments（只留置頂）、channel_id、channel、view_count、like_count。
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const [src, dst] = process.argv.slice(2);
if (!src || !dst) { console.error("usage: slim-info-json.mjs <srcRawDir> <dstRawDir>"); process.exit(1); }
mkdirSync(dst, { recursive: true });
const keysOf = (o) => Object.fromEntries(Object.keys(o || {}).map((k) => [k, []]));
let n = 0, before = 0, after = 0;
for (const f of readdirSync(src).filter((x) => x.endsWith(".info.json"))) {
  const txt = readFileSync(join(src, f), "utf8"); before += txt.length;
  const i = JSON.parse(txt);
  const slim = {
    _slimmed: true, id: i.id, title: i.title, availability: i.availability ?? null, description: i.description ?? null, duration: i.duration ?? null,
    chapters: i.chapters ?? null, subtitles: keysOf(i.subtitles), automatic_captions: keysOf(i.automatic_captions), upload_date: i.upload_date ?? null,
    comments: (i.comments || []).filter((c) => c.is_pinned).map((c) => ({ is_pinned: true, text: c.text })),
    channel_id: i.channel_id ?? null, channel: i.channel ?? null, view_count: i.view_count ?? null, like_count: i.like_count ?? null,
  };
  const out = JSON.stringify(slim); after += out.length;
  writeFileSync(join(dst, f), out); n++;
}
console.log(`${n} files, ${(before / 1048576).toFixed(0)}MB → ${(after / 1048576).toFixed(1)}MB`);
