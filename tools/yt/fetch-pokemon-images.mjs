#!/usr/bin/env node
// 下載 teams.json 用到的所有寶可夢（含型態）圖，產出 assets/pokemon/{art,home,thumb,index.json}
// 用法：node tools/yt/fetch-pokemon-images.mjs [--map-only] [--home-size 384]
// 已存在的檔案會跳過；API 回應快取在 /tmp/pokemon-assets/api-cache/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(path.join(ROOT, 'app/package.json'));
const { Dex } = require('@pkmn/dex');

const OUT = path.join(ROOT, 'assets/pokemon');
const CACHE = '/tmp/pokemon-assets/api-cache';
const UA = 'IChooseYou26-asset-fetch/1.0 (personal fan project)';
const RAW = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other';
const args = process.argv.slice(2);
const MAP_ONLY = args.includes('--map-only');
const HOME_SIZE = (args.includes('--home-size') ? Number(args[args.indexOf('--home-size') + 1]) : 384); // 預設 384px；0 = 原尺寸 512

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(CACHE, { recursive: true });
for (const d of ['art', 'home', 'thumb']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

async function api(p) {
  const f = path.join(CACHE, p.replace(/\//g, '_') + '.json');
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  await sleep(150);
  const r = await fetch(`https://pokeapi.co/api/v2/${p}`, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  const j = await r.json();
  fs.writeFileSync(f, JSON.stringify(j));
  return j;
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return true;
  await sleep(120);
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (r.status === 404) return false;
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  return true;
}

// Showdown forme -> PokeAPI 後綴候選（依序嘗試，並與 varieties 清單驗證）
const FORME_ALIAS = {
  F: ['female'], M: ['male'],
  Alola: ['alola'], Galar: ['galar'], Hisui: ['hisui'], Paldea: ['paldea'],
  'Paldea-Combat': ['paldea-combat-breed'], 'Paldea-Blaze': ['paldea-blaze-breed'], 'Paldea-Aqua': ['paldea-aqua-breed'],
  Mega: ['mega'], 'Mega-X': ['mega-x'], 'Mega-Y': ['mega-y'], 'Mega-Z': ['mega-z'],
};
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// 手動覆寫（經驗證的特例）；key = name_en
const OVERRIDE = {
  'Necrozma-Dawn-Wings': 'necrozma-dawn', 'Necrozma-Dusk-Mane': 'necrozma-dusk',
  'Ogerpon-Cornerstone': 'ogerpon-cornerstone-mask', 'Ogerpon-Hearthflame': 'ogerpon-hearthflame-mask', 'Ogerpon-Wellspring': 'ogerpon-wellspring-mask',
  'Squawkabilly-Blue': 'squawkabilly-blue-plumage',
};

const teams = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/channels/fiskepokemon/teams.json'), 'utf8'));
const names = new Map();
for (const t of teams) for (const m of t.members || []) if (m.species?.name_en) names.set(m.species.name_en, m.species.name_zh);

const speciesCache = new Map();
const idOf = (url) => Number(url.match(/\/(\d+)\/?$/)[1]);
const result = {};

for (const [name, zh] of [...names].sort()) {
  const sp = Dex.species.get(name);
  if (!sp.exists) { result[name] = { slug: null, pokemon_id: null, art: null, home: null, thumb: null, form_match: 'missing', note: 'dex 查無此名稱', zh }; continue; }
  if (!speciesCache.has(sp.num)) speciesCache.set(sp.num, await api(`pokemon-species/${sp.num}`));
  const vs = speciesCache.get(sp.num).varieties.map((v) => ({ slug: v.pokemon.name, id: idOf(v.pokemon.url), def: v.is_default }));
  const def = vs.find((v) => v.def);
  let hit = null, note;
  if (OVERRIDE[name]) hit = vs.find((v) => v.slug === OVERRIDE[name]);
  else if (!sp.forme) hit = def;
  else {
    const suffixes = FORME_ALIAS[sp.forme] || [slugify(sp.forme)];
    const bases = [def.slug, speciesCache.get(sp.num).name];
    for (const b of bases) for (const s of suffixes) { hit = hit || vs.find((v) => v.slug === `${b}-${s}`); }
    hit = hit || vs.find((v) => v.slug === slugify(name));
    // 預設型態的 slug 已含後綴（如 basculegion-male）時，換成同前綴 + suffix
    if (!hit) for (const s of suffixes) hit = hit || vs.find((v) => v.slug.endsWith(`-${s}`));
  }
  let form_match = 'exact', usedFallback = null;
  if (!hit) {
    // fallback：Mega-X/Y/Z 等先試 -mega，再退原形
    if (/Mega/.test(sp.forme || '')) {
      const m = vs.find((v) => v.slug.endsWith('-mega'));
      if (m) { usedFallback = m; note = `PokeAPI 無 ${name}，改用 ${m.slug}（Mega）圖`; }
    }
    if (!usedFallback && def) { usedFallback = def; note = `PokeAPI 無 ${name}，改用原形 ${def.slug} 圖`; }
    hit = usedFallback; form_match = hit ? 'fallback-base' : 'missing';
  }
  result[name] = hit
    ? { slug: hit.slug, pokemon_id: hit.id, form_match, ...(note ? { note } : {}), zh }
    : { slug: null, pokemon_id: null, form_match: 'missing', zh };
}

if (MAP_ONLY) {
  for (const [n, v] of Object.entries(result)) console.log(n.padEnd(26), (v.slug || '-').padEnd(32), v.pokemon_id, v.form_match);
  process.exit(0);
}

// 下載
const hasWebp = (() => { try { return /libwebp/.test(execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' })); } catch { return false; } })();
const ext = hasWebp ? 'webp' : 'png';
const done = new Set();
for (const [name, v] of Object.entries(result)) {
  if (!v.slug) continue;
  const notes = [];
  const art = `art/${v.slug}.png`, home = `home/${v.slug}.png`, thumb = `thumb/${v.slug}.${ext}`;
  if (!done.has(v.slug)) {
    const okArt = await download(`${RAW}/official-artwork/${v.pokemon_id}.png`, path.join(OUT, art));
    const okHome = await download(`${RAW}/home/${v.pokemon_id}.png`, path.join(OUT, home));
    if (okHome && HOME_SIZE) {
      const w = Number((execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path.join(OUT, home)], { encoding: 'utf8' }).match(/\d+/g) || []).slice(-2).sort((x, y) => y - x)[0]);
      if (w > HOME_SIZE) execFileSync('sips', ['-Z', String(HOME_SIZE), path.join(OUT, home)], { stdio: 'ignore' });
    }
    const src = okArt ? art : okHome ? home : null;
    const td = path.join(OUT, thumb);
    if (src && !fs.existsSync(td)) {
      if (hasWebp) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT, src), '-vf', 'scale=128:-1', td]);
      else { fs.copyFileSync(path.join(OUT, src), td); execFileSync('sips', ['-Z', '128', td], { stdio: 'ignore' }); }
    }
    v._art = okArt; v._home = okHome; v._thumb = !!src;
    done.add(v.slug);
    result._cache ??= {};
    result._cache[v.slug] = { okArt, okHome, src: !!src };
  }
  const c = result._cache[v.slug];
  v.art = c.okArt ? art : null; v.home = c.okHome ? home : null; v.thumb = c.src ? thumb : null;
  if (!c.okArt) notes.push(c.okHome ? 'official-artwork 缺，縮圖取自 home' : '兩種圖源皆缺');
  if (!c.okHome) notes.push('home 缺');
  if (!c.src) v.form_match = 'missing';
  if (notes.length) v.note = [v.note, ...notes].filter(Boolean).join('；');
}
delete result._cache;

const index = {};
for (const [n, v] of Object.entries(result)) {
  const { zh, _art, _home, _thumb, ...rest } = v;
  index[n] = { slug: rest.slug, pokemon_id: rest.pokemon_id, art: rest.art ?? null, home: rest.home ?? null, thumb: rest.thumb ?? null, form_match: rest.form_match, ...(rest.note ? { note: rest.note } : {}) };
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1));
const stat = {};
for (const v of Object.values(index)) stat[v.form_match] = (stat[v.form_match] || 0) + 1;
console.log('total', Object.keys(index).length, stat);
for (const [n, v] of Object.entries(index)) if (v.form_match !== 'exact') console.log(v.form_match, n, names.get(n), v.slug, v.note || '');
