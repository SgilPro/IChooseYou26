"""合併 Showdown 合法名單與遊戲內文字，輸出特性表（JSON）與說明文字檔（CSV、Markdown）。
用法：python3 -I tools/tiermaker/build.py <.cache/tiermaker> <匯出資料夾> <規則代碼，例如 M-C>
"""
import csv, json, os, re, sys

cache, out, reg = sys.argv[1], sys.argv[2], sys.argv[3]
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.makedirs(out, exist_ok=True)


def table(name):
    j = json.load(open(f'{cache}/champout/{name}.json', encoding='utf-8'))
    return {int(re.search(r'(\d+)$', r['LabelName']).group(1)): r['OriginalText'] for r in j['mSDataSet']}


en_name, zh_name = table('usa_tokusei'), table('tch_tokusei')
en_desc, zh_desc = table('usa_tokuseiinfo_syn'), table('tch_tokuseiinfo_syn')
legal = json.load(open(f'{cache}/legal.json', encoding='utf-8'))
norm = lambda s: s.replace('’', "'")
by_en = {norm(v): k for k, v in en_name.items() if v}

# 遊戲內個體資料：所有寶可夢實際擁有的特性編號，用來交叉核對 Showdown 的名單
personal = json.load(open(f'{cache}/champout/personal.json', encoding='utf-8'))
game_ids = {int(r[k]) for r in personal if r.get('is_valid') == '1' for k in ('toku0', 'toku1', 'toku2')} - {0}

# 寶可夢中文名（PokeAPI），型態用簡短標記
sp_zh = json.load(open(f'{REPO}/data/ref/names_zh-Hant.json', encoding='utf-8'))['species']['en2zh']
FORME = {'Alola': '阿羅拉', 'Galar': '伽勒爾', 'Hisui': '洗翠', 'Paldea-Combat': '帕底亞鬥戰種', 'Paldea-Blaze': '帕底亞火熾種',
         'Paldea-Aqua': '帕底亞水瀾種', 'Heat': '加熱', 'Wash': '清洗', 'Frost': '結冰', 'Fan': '旋轉', 'Mow': '切割',
         'Sunny': '太陽', 'Rainy': '雨水', 'Snowy': '雪雲', 'F': '母', 'Eternal': '永恆之花', 'Blade': '刀劍形態',
         'Small': '小尺寸', 'Large': '大尺寸', 'Super': '特大尺寸', 'Midnight': '黑夜', 'Dusk': '黃昏', 'Low-Key': '低調',
         'Blue': '藍羽毛', 'Yellow': '黃羽毛', 'White': '白羽毛'}
species = {s['name']: s for s in legal['species']}


def zh_mon(name):
    s = species[name]
    base = sp_zh.get(s['base'], s['base'])
    f = s['forme']
    if not f:
        return base
    m = re.fullmatch(r'(?:(M|F)-)?Mega(?:-(X|Y|Z))?', f)
    if m:
        sex = {'M': '（公）', 'F': '（母）'}.get(m.group(1), '')
        return f'超級{base}{"ＸＹＺ"["XYZ".index(m.group(2))] if m.group(2) else ""}{sex}'
    return f'{base}（{FORME.get(f, f)}）'


def slug_en(n):
    return re.sub(r'[^a-z0-9]+', '-', norm(n).lower().replace("'", '')).strip('-')


rows, skipped = [], []
for a in legal['abilities']:
    i = by_en.get(norm(a['name']))
    if i is None or i not in game_ids:
        skipped.append(a['name'])
        continue
    rows.append(dict(
        index=i, id=a['id'], zh=zh_name[i], en=en_name[i],
        zh_desc=zh_desc[i].replace('\n', ''), zh_lines=zh_desc[i].split('\n'),
        en_desc=re.sub(r'\s+', ' ', en_desc[i]).strip(),
        mega_only=all('Mega' in species[u]['forme'] for u in a['users']),
        users=a['users'], users_zh=[zh_mon(u) for u in a['users']],
        image=f'images/{slug_en(en_name[i])}.png'))
rows.sort(key=lambda r: r['index'])
missing_in_sd = sorted(game_ids - {r['index'] for r in rows})
assert not missing_in_sd, f'遊戲有、名單沒有的特性：{[en_name[i] for i in missing_in_sd]}'

json.dump(rows, open(f'{cache}/abilities.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
slug = reg.lower()
with open(f'{out}/abilities-{slug}.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['遊戲編號', '中文名稱', '英文名稱', '中文說明', '英文說明', '超級進化專用', '擁有此特性的寶可夢', 'Pokémon (EN)', '圖檔'])
    for r in rows:
        w.writerow([r['index'], r['zh'], r['en'], r['zh_desc'], r['en_desc'], '是' if r['mega_only'] else '',
                    '、'.join(r['users_zh']), ', '.join(r['users']), r['image']])
manifest = json.load(open(f'{cache}/manifest.json'))
with open(f'{out}/abilities-{slug}.md', 'w', encoding='utf-8') as f:
    f.write(f'# Pokémon Champions {reg} 特性說明\n\n')
    f.write(f'共 {len(rows)} 個特性，依遊戲內編號排序。名稱與說明是遊戲內文字（繁中與英文）。\n\n')
    f.write(f'- 合法名單：Showdown `data/mods/champions`（commit `{manifest["showdown"][:7]}`），並與遊戲個體資料交叉核對。\n')
    f.write(f'- 遊戲文字：projectpokemon/champout（commit `{manifest["champout"][:7]}`）。\n')
    f.write(f'- 產生時間：{manifest["fetched_at"]}\n\n')
    for r in rows:
        tag = '（超級進化專用）' if r['mega_only'] else ''
        f.write(f'## {r["index"]:03d} {r["zh"]} {r["en"]}{tag}\n\n{r["zh_desc"]}\n\n{r["en_desc"]}\n\n')
        f.write(f'寶可夢：{"、".join(r["users_zh"])}\n\n')
print(f'特性 {len(rows)} 個｜超級進化專用 {sum(r["mega_only"] for r in rows)} 個｜排除（遊戲內沒有）：{skipped}')
