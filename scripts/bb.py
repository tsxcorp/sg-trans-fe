"""Compare content bounding boxes of design and render inside a region.
Usage: PAGE=home DEVICE=desktop-1920 python3 scripts/bb.py x0 y0 x1 y1 [tol|white]
 tol = tolerance vs the most common colour of the region; 'white' = pixels brighter than 235."""
import os, sys
import numpy as np
from collections import Counter
from PIL import Image
root = '/Users/pix/Documents/Mine/Draft/sg-trans/'
page = os.environ.get('PAGE', 'home'); device = os.environ.get('DEVICE', 'desktop-1920')
x0, y0, x1, y1 = map(int, sys.argv[1:5])
mode = sys.argv[5] if len(sys.argv) > 5 else '60'
def box(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int)[y0:y1, x0:x1]
    if mode == 'white':
        m = a.min(2) > 235
    else:
        bg = np.array(Counter(map(tuple, a.reshape(-1, 3)[::7])).most_common(1)[0][0])
        m = np.abs(a - bg).sum(2) > int(mode)
    ys, xs = np.where(m.any(1))[0], np.where(m.any(0))[0]
    if not len(ys): return None
    return (int(x0 + xs[0]), int(y0 + ys[0]), int(x0 + xs[-1]), int(y0 + ys[-1]))
d = box(f'{root}design/exports/{page}/{device}@1x.png')
r = box(f'{root}design/reference/_work/render-{page}-{device}.png')
print('design', d, 'w', d and d[2]-d[0]+1, 'h', d and d[3]-d[1]+1)
print('render', r, 'w', r and r[2]-r[0]+1, 'h', r and r[3]-r[1]+1)
if d and r: print('delta x0 %+d y0 %+d x1 %+d y1 %+d' % (r[0]-d[0], r[1]-d[1], r[2]-d[2], r[3]-d[3]))
