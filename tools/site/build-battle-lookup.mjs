#!/usr/bin/env node
// 產出 data/ref/battle-lookup.json：隊伍詳細頁用的 物種屬性 / 招式屬性 / 道具 icon 查表。
// 用法：node tools/site/build-battle-lookup.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(ROOT, 'app/package.json'));
const { Dex } = require('@pkmn/dex');
const dexVersion = require('@pkmn/dex/package.json').version;
const dex = Dex.forGen(9);

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const teams = readJson('data/channels/fiskepokemon/teams.json');
const colors = readJson('assets/types/colors.json');
const itemsJson = readJson('assets/items/items.json');
const typeIds = new Set(colors.types.map((t) => t.id));
const itemBySlug = new Map(itemsJson.map((i) => [i.id, i]));

const species = new Map(); // en -> zh
const moves = new Map();
const items = new Map();
for (const t of teams) {
  for (const m of t.members || []) {
    const s = m.species;
    if (s?.name_en && !species.has(s.name_en)) species.set(s.name_en, s.name_zh || '');
    for (const mv of m.moves || []) if (mv.value_en && !moves.has(mv.value_en)) moves.set(mv.value_en, mv.value || '');
    if (m.item?.value_en && !items.has(m.item.value_en)) items.set(m.item.value_en, m.item.value || '');
  }
}

const tid = (t) => {
  const id = t.toLowerCase();
  if (!typeIds.has(id)) throw new Error(`type ${t} 不在 colors.json`);
  return id;
};
const sortObj = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
const out = { generated_at: new Date().toISOString(), source: `@pkmn/dex ${dexVersion}（Gen 9）+ assets/items/items.json`, species: {}, moves: {}, items: {} };
const missing = { species: [], moves: [], items: [] };
const fallback = [];

// 物種
for (const [en, zh] of species) {
  const sp = dex.species.get(en);
  const isMegaZ = /-Mega-Z$/.test(en);
  const ok = sp.exists && sp.types?.length && !isMegaZ;
  if (ok) {
    out.species[en] = { types: [...sp.types], type_ids: sp.types.map(tid), match: 'dex' };
    continue;
  }
  // base 型態 fallback：逐段去掉尾端 -xxx
  let base = null;
  const parts = (isMegaZ ? en.replace(/-Mega-Z$/, '') : en).split('-');
  for (let n = isMegaZ ? parts.length : parts.length - 1; n >= 1 && !base; n--) {
    const b = dex.species.get(parts.slice(0, n).join('-'));
    if (b.exists && b.types?.length) base = b;
  }
  if (base) {
    const e = { types: [...base.types], type_ids: base.types.map(tid), match: 'base-fallback' };
    e.note = isMegaZ
      ? `Mega-Z 屬性待確認（暫用 ${base.name} 的屬性；dex 資料標 Future：${sp.exists ? sp.types.join('/') : '無'}，僅供參考）`
      : `dex 無此型態，暫用 ${base.name} 的屬性`;
    out.species[en] = e;
    fallback.push(`${en}（${zh}）→ ${base.name}`);
  } else {
    out.species[en] = { types: [], type_ids: [], match: 'missing' };
    missing.species.push(`${en}（${zh}）`);
  }
}

// 招式
for (const [en, zh] of moves) {
  const mv = dex.moves.get(en);
  if (mv.exists && mv.type) out.moves[en] = { type_id: tid(mv.type), category: mv.category.toLowerCase(), match: 'dex' };
  else { out.moves[en] = { type_id: null, category: null, match: 'missing' }; missing.moves.push(`${en}（${zh}）`); }
}

// 道具：Showdown 名 → PokeAPI slug，並用 items.json 驗證
const slugify = (n) => n.toLowerCase().replace(/['’.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const [en, zh] of items) {
  const slug = slugify(en);
  const it = itemBySlug.get(slug);
  if (it && fs.existsSync(path.join(ROOT, 'assets/items', it.icon))) {
    out.items[en] = { slug, icon: it.icon, name_zh: it.name_zh_hant, match: 'exact' };
  } else {
    out.items[en] = { slug, icon: null, name_zh: zh, match: 'missing' };
    missing.items.push(`${en}（${zh}）[slug=${slug}]`);
  }
}

out.species = sortObj(out.species);
out.moves = sortObj(out.moves);
out.items = sortObj(out.items);
const file = path.join(ROOT, 'data/ref/battle-lookup.json');
fs.writeFileSync(file, JSON.stringify(out, null, 1) + '\n');

const count = (o) => Object.values(o).reduce((a, v) => ((a[v.match] = (a[v.match] || 0) + 1), a), {});
console.log(`寫入 ${path.relative(ROOT, file)}（${(fs.statSync(file).size / 1024).toFixed(1)} KB）`);
for (const k of ['species', 'moves', 'items']) console.log(`${k}: 共 ${Object.keys(out[k]).length}`, count(out[k]));
console.log('\n== base-fallback 物種 =='); fallback.forEach((x) => console.log(' ', x));
for (const k of ['species', 'moves', 'items']) { console.log(`\n== missing ${k}（${missing[k].length}） ==`); missing[k].forEach((x) => console.log(' ', x)); }
