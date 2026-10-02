"""One-off helper: cut the About Us images out of design/exports/about-us/desktop-1920@1x.png (1920x6182).

Writes public/fixtures/<file id>.<ext> and src/content/fixtures/files.d/about-us.json (file id -> extension);
then run `python3 scripts/merge_files.py`. Same technique as scripts/extract_fixture_images.py: backgrounds that carry
text in the export (hero, vision/mission, teamwork card) are inpainted so the text can be live HTML.
Replace these with the originals exported from Figma / uploaded to Directus when available.
"""
import json, os, uuid
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../../..'))
SRC = cv2.imread(os.path.join(ROOT, 'design/exports/about-us/desktop-1920@1x.png'))
OUT = os.path.join(ROOT, 'public/fixtures')
os.makedirs(OUT, exist_ok=True)
U = lambda name: str(uuid.uuid5(uuid.NAMESPACE_URL, 'sg-trans/about-us/' + name))
files = {}


def save(name, img, ext='jpg'):
    fid = U(name)
    path = os.path.join(OUT, f'{fid}.{ext}')
    if ext == 'jpg':
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    else:
        cv2.imwrite(path, img)
    files[fid] = ext
    print(name, fid, img.shape)


def inpaint_mask(img, mask, scale=3, blur=3):
    small = cv2.resize(img, None, fx=1 / scale, fy=1 / scale, interpolation=cv2.INTER_AREA)
    sm = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    fixed = cv2.inpaint(small, sm, 5, cv2.INPAINT_TELEA)
    up = cv2.resize(fixed, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    up = cv2.GaussianBlur(up, (0, 0), blur)
    out = img.copy()
    soft = cv2.GaussianBlur(mask, (0, 0), 4)[..., None] / 255.0
    out = (up * soft + img * (1 - soft)).astype(np.uint8)
    out[mask > 0] = up[mask > 0]
    return out


def inpaint_rects(img, rects, **kw):
    mask = np.zeros(img.shape[:2], np.uint8)
    for x0, y0, x1, y1 in rects:
        mask[max(0, y0):y1, max(0, x0):x1] = 255
    return inpaint_mask(img, mask, **kw)


# hero background (header, title, subtitle, buttons removed): export y 0-799
hero = SRC[0:800].copy()
# tight mask: the header bar (drawn by the page), then only the glyph / button pixels of the title, subtitle and buttons
mask = np.zeros(hero.shape[:2], np.uint8)
mask[0:132, 312:1608] = 255
h = hero.astype(int)
white = h.min(2) > 185
button = (h[..., 0] > 150) & (h[..., 2] < 140)  # BGR: the blue "Explore" button
sel = np.zeros(hero.shape[:2], bool)
for x0, y0, x1, y1 in [(500, 225, 1420, 345), (470, 362, 1450, 415), (735, 485, 1185, 570)]:
    sel[y0:y1, x0:x1] = (white | button)[y0:y1, x0:x1]
tight = cv2.dilate(sel.astype(np.uint8) * 255, np.ones((11, 11), np.uint8))
mask = np.maximum(mask, tight)
hero = inpaint_mask(hero, mask, scale=2, blur=2)
save('hero', hero)

# intro photo (480x556); the badge and circles are drawn by the page on top, as in the design
save('intro-photo', SRC[932:1488, 1070:1550])

# faint forklift photo (grey on white), bottom-left of the intro
save('forklift', SRC[1240:1622, 0:300])

# dotted world map: grey dots on white -> transparent PNG (alpha from darkness); the photo area is cleared
mx0, my0, mx1, my1 = 1380, 820, 1920, 1280
m = SRC[my0:my1, mx0:mx1].astype(np.float32)
minc = m.min(2)
dot = max(1.0, 255 - float(np.percentile(minc, 0.5)))
a = np.clip((255 - minc) / dot, 0, 1)
rgb = np.where(a[..., None] > 0.02, (m - 255 * (1 - a[..., None])) / np.maximum(a[..., None], 0.02), 255)
rgb = np.clip(rgb, 0, 255)
# clear the area covered by the photo, except inside the white circle (the dots show through it in the design)
yy, xx = np.mgrid[my0:my1, mx0:mx1]
in_photo = (yy >= 932) & (yy < 1488) & (xx >= 1070) & (xx < 1550)
in_circle = (xx - 1524) ** 2 + (yy - 968) ** 2 <= 80 ** 2
a[in_photo & ~in_circle] = 0
save('world-map', np.dstack([rgb.astype(np.uint8), (a * 255).astype(np.uint8)]), 'png')

# vision / mission background: export y 2346-3024, card (x 322-1598, y 2490-2880) removed. Already navy-tinted in the export.
vm = SRC[2346:3025].copy()
vm = inpaint_rects(vm, [(312, 134, 1608, 546)], blur=4)
save('vision-bg', vm)

# TEAMWORK card background: find the navy card, remove icon, title and body text
reg = SRC[4280:4680, 940:1640].astype(int)
navy = (reg[..., 0] > 90) & (reg[..., 2] < 70)  # BGR: blue high, red low
ys, xs = np.where(navy.sum(1) > 300)[0], np.where(navy.sum(0) > 150)[0]
cy0, cy1, cx0, cx1 = 4280 + ys[0], 4280 + ys[-1] + 1, 940 + xs[0], 940 + xs[-1] + 1
print('teamwork card', cx0, cy0, cx1, cy1)
card = SRC[cy0:cy1, cx0:cx1].copy()
c = card.astype(int)
white = c.min(2) > 150
orange = (c[..., 2] > 150) & (c[..., 1] < 140) & (c[..., 0] < 120)
mask = np.zeros(card.shape[:2], np.uint8)
mask[white | orange] = 255
mask[:, :20] = 0
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
card = cv2.inpaint(card, mask, 5, cv2.INPAINT_TELEA)
save('teamwork-bg', card)

json.dump(files, open(os.path.join(ROOT, 'src/content/fixtures/files.d/about-us.json'), 'w'), indent=2)
json.dump({k: U(k) for k in ['hero', 'intro-photo', 'forklift', 'world-map', 'vision-bg', 'teamwork-bg']}, open(os.path.join(HERE, 'file_ids.json'), 'w'), indent=2)
