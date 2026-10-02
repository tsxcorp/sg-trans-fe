"""Side-by-side crop. Usage: PAGE=home DEVICE=desktop-1920 python3 scripts/side.py y0 y1 [x0 x1]  (design left, render right)
Writes design/reference/_work/side-<PAGE>-<DEVICE>.png"""
import os, sys
from PIL import Image
root = '/Users/pix/Documents/Mine/Draft/sg-trans/'
page = os.environ.get('PAGE', 'home'); device = os.environ.get('DEVICE', 'desktop-1920')
width = int(device.split('-')[-1])
a = [int(v) for v in sys.argv[1:5] if v.lstrip('-').isdigit()]
y0, y1 = a[0], a[1]
x0, x1 = (a[2], a[3]) if len(a) >= 4 else (0, width)
d = Image.open(f'{root}design/exports/{page}/{device}@1x.png').convert('RGB').crop((x0, y0, x1, y1))
r = Image.open(f'{root}design/reference/_work/render-{page}-{device}.png').convert('RGB').crop((x0, y0, x1, y1))
w = x1 - x0
s = min(1, 1500 / (w * 2 + 8))
c = Image.new('RGB', (w * 2 + 8, y1 - y0), (255, 0, 0))
c.paste(d, (0, 0)); c.paste(r, (w + 8, 0))
c = c.resize((max(1, int(c.width * s)), max(1, int(c.height * s))))
out = f'{root}design/reference/_work/side-{page}-{device}.png'
c.save(out); print(out)
