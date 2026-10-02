"""Compare a render with the Figma export. Usage: PAGE=home DEVICE=desktop-1920 python3 scripts/cmp.py
Prints overall and per-band (10 equal bands) differing pixels; writes diff-<PAGE>-<DEVICE>.png."""
import os
import numpy as np
from PIL import Image

root = '/Users/pix/Documents/Mine/Draft/sg-trans/'
page = os.environ.get('PAGE', 'home')
device = os.environ.get('DEVICE', 'desktop-1920')
width = int(device.split('-')[-1])
r = Image.open(f'{root}design/reference/_work/render-{page}-{device}.png').convert('RGB')
d = Image.open(f'{root}design/exports/{page}/{device}@1x.png').convert('RGB')
print('render', r.size, 'design', d.size)
h = min(r.height, d.height)
R = np.array(r.crop((0, 0, width, h))).astype(int)
D = np.array(d.crop((0, 0, width, h))).astype(int)
diff = (np.abs(R - D).sum(2) > 75)
total = max(r.height, d.height)
extra = (total - h) * width  # missing rows count as different
print('overall differing pixels: %.2f%% (height mismatch: %s)' % ((diff.sum() + extra) / (total * width) * 100, r.height != d.height))
step = max(1, h // 10)
for a in range(0, h, step):
    b = min(h, a + step)
    print('  y%5d-%5d  %6.2f%%' % (a, b, diff[a:b].mean() * 100))
Image.fromarray((diff * 255).astype(np.uint8)).save(f'{root}design/reference/_work/diff-{page}-{device}.png')
