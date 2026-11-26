"""TierMaker 模板封面：標題「Pokémon Ability」、幾張特性卡、I Choose You logo。
用法：python3 -I tools/tiermaker/cover.py <匯出資料夾> <規則代碼> <特性數>
輸出：<匯出資料夾>/cover.png（1200×1200）與 cover-wide.png（1200×630）。放在 images/ 外面，避免被當成項目上傳。
"""
import os, subprocess, sys, tempfile

out, reg, count = os.path.abspath(sys.argv[1]), sys.argv[2], sys.argv[3]
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
LOGO = f'{REPO}/assets/master-ball-wordmark-web.png'
IMG = f'{out}/images'
FAN = ['intimidate', 'prankster', 'drought', 'regenerator', 'good-as-gold']
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

CSS = r"""
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:var(--w);height:var(--h);overflow:hidden;background:#4F3DB5}
body{font-family:"Helvetica Neue","PingFang TC",sans-serif;color:#1B1F24;-webkit-font-smoothing:antialiased}
.frame{position:absolute;inset:0;padding:30px;background:#4F3DB5}
.inner{position:relative;width:100%;height:100%;border-radius:40px;overflow:hidden;
  background:radial-gradient(120% 90% at 50% 0%,#FFFFFF 0%,#F7F8FA 45%,#E9E7F7 100%);
  box-shadow:inset 0 0 0 5px #4F3DB5,inset 0 0 0 15px #F7F8FA,inset 0 0 0 18px #C9C3EC}
.kicker{font:600 var(--kick)/1 "Helvetica Neue";letter-spacing:.32em;color:#4F3DB5;text-transform:uppercase}
.title{font:800 var(--t1)/.95 "Avenir Next","Helvetica Neue",sans-serif;letter-spacing:-.01em;color:#1B1F24}
.title b{color:#4F3DB5;font-weight:800}
.zh{font:600 var(--t2)/1.1 "PingFang TC";letter-spacing:.12em;color:#4A525B}
.fan{position:relative}
.fan img{position:absolute;width:var(--card);height:var(--card);border-radius:calc(var(--card)*.06);
  box-shadow:0 14px 28px rgba(27,31,36,.22),0 3px 6px rgba(27,31,36,.12)}
.logo{display:block;height:auto}
.meta{font:600 var(--meta)/1 "Helvetica Neue","PingFang TC";color:#5C646D;letter-spacing:.04em}
/* 正方形 */
.sq .head{position:absolute;top:78px;left:0;right:0;text-align:center;display:flex;flex-direction:column;align-items:center;gap:22px}
.sq .fan{position:absolute;left:50%;top:700px;width:0;height:0}
.sq .logo{position:absolute;left:50%;bottom:118px;transform:translateX(-50%);width:560px}
.sq .meta{position:absolute;left:0;right:0;bottom:70px;text-align:center}
/* 橫式 */
.wd .head{position:absolute;top:0;bottom:0;left:84px;width:560px;display:flex;flex-direction:column;justify-content:center;gap:18px}
.wd .fan{position:absolute;left:862px;top:300px;width:0;height:0}
.wd .logo{width:400px;margin-top:22px}
.wd .meta{margin-top:4px}
"""


def fan_html(card, spread, lift):
    n = len(FAN); h = []
    for i, name in enumerate(FAN):
        k = i - (n - 1) / 2
        x = k * spread - card / 2
        y = abs(k) * lift - card / 2
        h.append(f'<img src="file://{IMG}/{name}.png" style="left:{x}px;top:{y}px;transform:rotate({k * 7}deg);z-index:{10 - int(abs(k) * 2)}">')
    return '<div class="fan">' + ''.join(h) + '</div>'


def page(kind):
    if kind == 'sq':
        vars_ = '--w:1200px;--h:1200px;--kick:30px;--t1:138px;--t2:60px;--card:210px;--meta:26px'
        body = ('<div class="head"><div class="kicker">Pokémon Champions</div>'
                '<div class="title">Pokémon <b>Ability</b></div><div class="zh">寶可夢特性</div></div>'
                + fan_html(210, 160, 24) +
                f'<img class="logo" src="file://{LOGO}"><div class="meta">Regulation {reg}・{count} 個特性</div>')
        w, h = 1200, 1200
    else:
        vars_ = '--w:1200px;--h:630px;--kick:22px;--t1:104px;--t2:44px;--card:170px;--meta:20px'
        body = ('<div class="head"><div class="kicker">Pokémon Champions</div>'
                '<div class="title">Pokémon<br><b>Ability</b></div><div class="zh">寶可夢特性</div>'
                f'<img class="logo" src="file://{LOGO}"><div class="meta">Regulation {reg}・{count} 個特性</div></div>'
                + fan_html(170, 80, 20))
        w, h = 1200, 630
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>:root{{{vars_}}}{CSS}</style></head>'
            f'<body class="{kind}"><div class="frame"><div class="inner">{body}</div></div></body></html>'), w, h


tmp = tempfile.mkdtemp()
for kind, name in (('sq', 'cover.png'), ('wd', 'cover-wide.png')):
    html, w, h = page(kind)
    hp = os.path.join(tmp, kind + '.html'); open(hp, 'w', encoding='utf-8').write(html)
    png = os.path.join(out, name)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
                    '--force-device-scale-factor=1', f'--window-size={w},{h}', '--screenshot=' + png, 'file://' + hp],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(png, os.path.getsize(png))
