#!/usr/bin/env node
// 檢查公開檔案（版控與網站會看到的）裡沒有會員限定影片的內容。有問題就列出並以非 0 結束。部署前會跑。
// 用法：node tools/yt/check-public.mjs [channelDir ...]
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { checkPublic } from "./lib-private.mjs";
const dirs = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync("data/channels").map((d) => join("data/channels", d)).filter((d) => existsSync(join(d, "videos.json")));
let n = 0;
for (const d of dirs) { const bad = checkPublic(d); n += bad.length; for (const b of bad.slice(0, 30)) console.error(`[${d}] ${b}`); if (bad.length > 30) console.error(`[${d}] …另有 ${bad.length - 30} 項`); }
console.log(n ? `發現 ${n} 項會員內容出現在公開檔案` : "公開檔案沒有會員影片內容");
process.exit(n ? 1 : 0);
