#!/usr/bin/env node
// 從 PokeAPI 的 CSV 建「繁中 ↔ 英文」名稱對照表：species / moves / items / abilities / natures。
// 用途：抽取 agent 查表填 value_en；validate-teams.mjs 檢查 value 與 value_en 是否對得上。
// 來源：https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv（CC0 之外的遊戲文字版權屬任天堂/GF，僅作對照用）
// 用法：node tools/yt/build-names-ref.mjs  → data/ref/names_zh-Hant.json

import { writeFileSync, mkdirSync } from "node:fs";

const BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/";
const ZH_HANT = 4; // languages.csv: 4 = zh-Hant
const EN = 9;

async function csv(name) {
  const res = await fetch(BASE + name);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  const text = await res.text();
  const [header, ...rows] = text.trim().split("\n");
  const cols = header.split(",");
  return rows.map((line) => {
    // 簡單 CSV（PokeAPI 名稱檔無逗號內嵌，但保險處理引號）
    const out = []; let cur = ""; let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return Object.fromEntries(cols.map((c, i) => [c, out[i] ?? ""]));
  });
}

function pairUp(rows, idKey) {
  const zh = new Map(), en = new Map();
  for (const r of rows) {
    const lang = Number(r.local_language_id);
    if (lang === ZH_HANT) zh.set(r[idKey], r.name);
    else if (lang === EN) en.set(r[idKey], r.name);
  }
  const zh2en = {}, en2zh = {};
  for (const [id, z] of zh) {
    const e = en.get(id);
    if (!e) continue;
    zh2en[z] = e;
    en2zh[e] = z;
  }
  return { zh2en, en2zh, count: Object.keys(zh2en).length };
}

const [species, moves, items, abilities, natures] = await Promise.all([
  csv("pokemon_species_names.csv").then((r) => pairUp(r, "pokemon_species_id")),
  csv("move_names.csv").then((r) => pairUp(r, "move_id")),
  csv("item_names.csv").then((r) => pairUp(r, "item_id")),
  csv("ability_names.csv").then((r) => pairUp(r, "ability_id")),
  csv("nature_names.csv").then((r) => pairUp(r, "nature_id")),
]);

// 常見簡稱 / 字幕口語（人工補充，持續擴充）
const speciesAliases = {
  "金剛猩": "轟擂金剛猩", "鋁鋼龍": "鋁鋼橋龍", "大嘴鷗": "大嘴鷗", "噴火龍Y": "噴火龍", "噴火龍 Y": "噴火龍",
  "鼠數兒": "一家鼠", "幽尾玄魚": "幽尾玄魚", "龍頭地鼠": "龍頭地鼠",
};

mkdirSync("data/ref", { recursive: true });
writeFileSync("data/ref/names_zh-Hant.json", JSON.stringify({
  generated_at: new Date().toISOString(),
  source: "PokeAPI data/v2/csv (*_names.csv, local_language_id 4=zh-Hant, 9=en)",
  note: "Champions 新道具（例：阿勃梭魯進化石 Z）與 Z-Mega 型態不在 PokeAPI，需人工補在 extra 區。",
  species, moves, items, abilities, natures,
  species_aliases_zh: speciesAliases,
  extra: {
    items_zh2en: { "阿勃梭魯進化石 Z": "Absolite Z", "路卡利歐進化石 Z": "Lucarionite Z", "烈咬陸鯊進化石 Z": "Garchompite Z" },
  },
}, null, 2));
console.error(`[names] species ${species.count} · moves ${moves.count} · items ${items.count} · abilities ${abilities.count} · natures ${natures.count}`);
