// 從 Showdown 的 Champions 資料算出現行規則的合法寶可夢與其特性。
// 只用 TypeScript 編譯器把檔案解析成語法樹、取出字面值，不執行下載來的程式碼。
// 用法：node tools/tiermaker/legal.cjs <.cache/tiermaker> <輸出 legal.json>
const fs = require('fs'), path = require('path');
const ts = require(path.resolve(__dirname, '../../app/node_modules/typescript'));
const [cache, outFile] = process.argv.slice(2);
const dir = path.join(cache, 'showdown');

function lit(n) {
  const K = ts.SyntaxKind;
  switch (n.kind) {
    case K.StringLiteral: case K.NoSubstitutionTemplateLiteral: return n.text;
    case K.NumericLiteral: return Number(n.text);
    case K.TrueKeyword: return true;
    case K.FalseKeyword: return false;
    case K.NullKeyword: return null;
    case K.PrefixUnaryExpression: return n.operator === K.MinusToken ? -lit(n.operand) : undefined;
    case K.ArrayLiteralExpression: return n.elements.map(lit);
    case K.ObjectLiteralExpression: {
      const o = {};
      for (const p of n.properties) if (p.kind === K.PropertyAssignment) o[p.name.text ?? p.name.getText()] = lit(p.initializer);
      return o;
    }
    default: return undefined; // 函式等一律略過
  }
}
function load(f) {
  const src = ts.createSourceFile(f, fs.readFileSync(path.join(dir, f), 'utf8'), ts.ScriptTarget.Latest, true);
  let res;
  src.forEachChild(st => {
    if (st.kind !== ts.SyntaxKind.VariableStatement) return;
    for (const d of st.declarationList.declarations)
      if (d.initializer && d.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression) res = lit(d.initializer);
  });
  return res;
}

const fd = load('mods_champions_formats-data.ts');
const dex = load('pokedex.ts');
const txt = load('text_abilities.ts');
const toId = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const species = [], abil = new Map();
for (const [id, v] of Object.entries(fd)) {
  if (v.isNonstandard || v.tier === 'Illegal') continue;
  const sp = dex[id];
  if (!sp) { console.error('pokedex 缺少', id); continue; }
  const abilities = Object.values(sp.abilities);
  species.push({ id, name: sp.name, num: sp.num, base: sp.baseSpecies || sp.name, forme: sp.forme || '', abilities });
  for (const a of abilities) { if (!abil.has(a)) abil.set(a, []); abil.get(a).push(sp.name); }
}
fs.writeFileSync(outFile, JSON.stringify({
  species,
  abilities: [...abil].map(([name, users]) => ({ name, id: toId(name), users, sdShort: (txt[toId(name)] || {}).shortDesc })),
}, null, 1));
console.log(`合法條目 ${species.length}｜物種 ${new Set(species.map(s => s.num)).size}｜特性 ${abil.size}`);
