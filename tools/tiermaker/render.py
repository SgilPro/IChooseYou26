"""把特性名稱（中文＋英文）做成 1:1 PNG，供 TierMaker 上傳。
用 Chrome headless 截圖；字級會自動縮到放得下。
用法：python3 -I tools/tiermaker/render.py <abilities.json> <圖片資料夾> [邊長 px，預設 600] [只做這些英文名...]
"""
import html, json, os, subprocess, sys, tempfile

src, out = sys.argv[1], os.path.abspath(sys.argv[2])
size = int(sys.argv[3]) if len(sys.argv) > 3 else 600
pick = sys.argv[4:]
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
rows = json.load(open(src, encoding='utf-8'))
if pick:
    rows = [r for r in rows if r['en'] in pick]
os.makedirs(out, exist_ok=True)

# 顏色取自網站設計代幣：主色深靛 #4F3DB5、文字 #1B1F24、次要文字 #4A525B
CSS = r"""
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:600px;height:600px;overflow:hidden;background:#E4E7EA}
body{font-family:"PingFang TC","Helvetica Neue",sans-serif;color:#1B1F24;-webkit-font-smoothing:antialiased}
.card{position:absolute;inset:0;background:#4F3DB5;padding:18px}
.inner{width:100%;height:100%;background:#F7F8FA;border-radius:22px;padding:30px;
  box-shadow:inset 0 0 0 3px #4F3DB5,inset 0 0 0 9px #F7F8FA,inset 0 0 0 11px #C9C3EC;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:38px}
.zh{font-weight:600;white-space:nowrap;line-height:1.15;letter-spacing:.02em}
.en{font-weight:700;white-space:nowrap;color:#4A525B;line-height:1.1;font-family:"Helvetica Neue","PingFang TC",sans-serif}
"""
JS = r"""
function fit(el,max,min){let s=max;el.style.fontSize=s+'px';const W=el.parentElement.clientWidth-60;
  while(el.scrollWidth>W&&s>min){s-=2;el.style.fontSize=s+'px'}
  document.body.dataset[el.className]=s}
fit(document.querySelector('.zh'),180,60);fit(document.querySelector('.en'),68,26);
"""

tmp = tempfile.mkdtemp()
for i, r in enumerate(rows, 1):
    page = (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>'
            f'<div class="card"><div class="inner"><div class="zh">{html.escape(r["zh"])}</div>'
            f'<div class="en">{html.escape(r["en"])}</div></div></div><script>{JS}</script></body></html>')
    hp = os.path.join(tmp, 'card.html')
    open(hp, 'w', encoding='utf-8').write(page)
    png = os.path.join(out, os.path.basename(r['image']))
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', f'--force-device-scale-factor={size / 600}',
                    '--window-size=600,600', '--screenshot=' + png, 'file://' + hp],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if i % 25 == 0 or i == len(rows):
        print(f'{i}/{len(rows)}', flush=True)
