"""One-off helper: cut sample images for the Our Service and Service Detail fixtures out of the Figma exports.

Sources: design/exports/our-service/desktop-1920@1x.png (1928 wide: frame is x 4..1923) and
design/exports/service-detail/desktop-1920@1x.png. Output: public/fixtures/<file id>.<ext>,
src/content/fixtures/files.d/our-service.json and service-detail.json (file id -> extension).
Backgrounds that carry text in the export are inpainted so the text can be live HTML (technique of
scripts/extract_fixture_images.py). Replace these with the Figma originals when available.
Run from the project root, then `python3 scripts/merge_files.py`.
"""
import json, os, uuid
import numpy as np
import cv2

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
OS = cv2.imread(os.path.join(ROOT, 'design/exports/our-service/desktop-1920@1x.png'))[:, 4:1924]
SD = cv2.imread(os.path.join(ROOT, 'design/exports/service-detail/desktop-1920@1x.png'))
OUT = os.path.join(ROOT, 'public/fixtures')
os.makedirs(OUT, exist_ok=True)
U = lambda name: str(uuid.uuid5(uuid.NAMESPACE_URL, 'sg-trans/services/' + name))
files = {'our-service': {}, 'service-detail': {}}
ids = {}


def save(page, name, img, ext='jpg', q=92):
    fid = U(name)
    path = os.path.join(OUT, f'{fid}.{ext}')
    if ext == 'jpg':
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, q])
    else:
        cv2.imwrite(path, img)
    files[page][fid] = ext
    ids[name] = fid


def inpaint_mask(img, mask, scale=3, blur=3):
    small = cv2.resize(img, None, fx=1 / scale, fy=1 / scale, interpolation=cv2.INTER_AREA)
    sm = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    fixed = cv2.inpaint(small, sm, 5, cv2.INPAINT_TELEA)
    up = cv2.resize(fixed, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    if blur:
        up = cv2.GaussianBlur(up, (0, 0), blur)
    out = img.copy()
    soft = cv2.GaussianBlur(mask, (0, 0), 4)[..., None] / 255.0
    out = (up * soft + img * (1 - soft)).astype(np.uint8)
    out[mask > 0] = up[mask > 0]
    return out


def inpaint(img, rects, scale=3, blur=3):
    mask = np.zeros(img.shape[:2], np.uint8)
    for x0, y0, x1, y1 in rects:
        mask[max(0, y0):y1, max(0, x0):x1] = 255
    return inpaint_mask(img, mask, scale, blur)


def tophat_text(img, region, thr=16, k=17, dil=7):
    """Remove light text: pixels brighter than their surroundings inside region (x0,y0,x1,y1)."""
    x0, y0, x1, y1 = region
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    th = cv2.morphologyEx(g, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_RECT, (k, k)))
    m = np.zeros(g.shape, np.uint8)
    m[y0:y1, x0:x1] = ((th[y0:y1, x0:x1] > thr) * 255).astype(np.uint8)
    m = cv2.dilate(m, np.ones((dil, dil), np.uint8))
    return cv2.inpaint(img, m, 4, cv2.INPAINT_TELEA)



def bright_text(img, regions, thr=205, dil=7, scale=3):
    """Mask of near-white text pixels inside the regions (x0,y0,x1,y1), dilated, then inpainted."""
    mask = np.zeros(img.shape[:2], np.uint8)
    for x0, y0, x1, y1 in regions:
        sub = img[y0:y1, x0:x1]
        mask[y0:y1, x0:x1] = ((sub.min(2) > thr) * 255).astype(np.uint8)
    mask = cv2.dilate(mask, np.ones((dil, dil), np.uint8))
    return inpaint_mask(img, mask, scale=scale, blur=2)


# ---------------------------------------------------------------- Our Service
P = 'our-service'
hero = OS[0:518].copy()
hero = inpaint(hero, [(340, 0, 1580, 132), (748, 338, 1040, 422)])
save(P, 'os-hero', bright_text(hero, [(675, 235, 1250, 330), (1040, 360, 1180, 400)]))
save(P, 'os-intro-1', OS[683:1067, 1082:1469])
save(P, 'os-intro-2', OS[783:1144, 1321:1608])
save(P, 'os-forklift', OS[860:1231, 0:300])

# dotted world map watermark: keep only the light-grey dots, blank the photos / dot-grid drawn above it
m = OS[560:1010, 1330:1920].copy()
for x0, y0, x1, y1 in [(1082, 683, 1469, 1067), (1321, 783, 1608, 1144), (1488, 672, 1620, 790), (1100, 960, 1310, 1160)]:
    m[max(0, y0 - 560):y1 - 560, max(0, x0 - 1330):x1 - 1330] = 255
g = m.min(2)
m[g < 200] = 255
save(P, 'os-map', m)

# group 1 tiles: the photo under the navy overlay, icon + title removed
def tile(img, x0, y0, x1, y1, local):
    c = img[y0:y1, x0:x1].copy()
    reg = c.astype(int)
    white = reg.min(2) > 215
    orange = (reg[..., 2] > 170) & (reg[..., 1] < 150) & (reg[..., 0] < 120)
    sel = white | orange
    mask = np.zeros(c.shape[:2], np.uint8)
    lx0, ly0, lx1, ly1 = local
    sub = np.zeros_like(sel)
    sub[ly0:ly1, lx0:lx1] = True
    mask[sel & sub] = 255
    mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
    return cv2.inpaint(c, mask, 4, cv2.INPAINT_TELEA)

save(P, 'os-tile-a', tile(OS, 32, 1533, 650, 2002, (40, 270, 600, 440)))
save(P, 'os-tile-b', tile(OS, 32, 2002, 960, 2470, (40, 250, 900, 440)))

# group 3 photo cells: blue gradient baked in, title and summary removed
cells = {'wh-1': (321, 3655), 'wh-2': (960, 3655), 'wh-3': (321, 3997), 'wh-4': (960, 3997)}
for name, (x0, y0) in cells.items():
    c = OS[y0:y0 + 341, x0:x0 + 639].copy()
    save(P, 'os-' + name, tophat_text(c, (28, 205, 560, 312), thr=14, k=15, dil=9))

# quote section: background (card area filled) and the photo half of the card
qbg = OS[5218:6120].copy()
mask = np.zeros(qbg.shape[:2], np.uint8)
mask[5314 - 5218:6022 - 5218, 344:1576] = 255
save(P, 'os-quote-bg', inpaint_mask(qbg, mask, scale=6, blur=5), q=90)
qp = OS[5314:6022, 960:1576].copy()
save(P, 'os-quote-photo', inpaint(qp, [(1008 - 960, 5825 - 5314, 1528 - 960, 5974 - 5314)], scale=3, blur=3))

# ---------------------------------------------------------------- Service Detail
P = 'service-detail'
sdh = inpaint(SD[0:495].copy(), [(340, 0, 1580, 132)])
save(P, 'sd-hero', bright_text(sdh, [(675, 262, 1245, 330), (465, 326, 1320, 368)], thr=185))
save(P, 'sd-highlights', SD[1106:1447, 353:1199])

m = SD[540:1010, 1330:1920].copy()
for x0, y0, x1, y1 in [(1247, 610, 1569, 906), (1247, 926, 1569, 1450), (1590, 940, 1700, 1010)]:
    m[max(0, y0 - 540):y1 - 540, x0 - 1330:x1 - 1330] = 255
m[m.min(2) < 200] = 255
save(P, 'sd-map', m)

for i, x0 in enumerate([702, 1059, 1414], 1):
    c = SD[2321:3019, x0:x0 + 341].copy()
    c = inpaint(c, [(45, 335, 300, 610)], scale=3, blur=3)
    save(P, f'sd-expertise-{i}', c)

why = [(320, 3787, 612, 4079), (628, 3819, 920, 4209), (320, 4095, 612, 4484), (628, 4224, 920, 4517)]
for i, (x0, y0, x1, y1) in enumerate(why, 1):
    save(P, f'sd-why-{i}', SD[y0:y1, x0:x1])

for page, d in files.items():
    json.dump(d, open(os.path.join(ROOT, f'src/content/fixtures/files.d/{page}.json'), 'w'), indent=2)
json.dump(ids, open(os.path.join(ROOT, 'src/content/fixtures/pages/services/file-ids.json'), 'w'), indent=2)
print(len(ids), 'files')
