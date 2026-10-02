"""One-off helper: cut sample images for the fixtures out of the exported Figma frame.

Source: design/exports/home/desktop-1920@1x.png (1920x5208). Output: public/fixtures/<file id>.<ext>
and src/content/fixtures/files.json (file id -> extension). Backgrounds that carry text in the export
(hero, stats band, service cards) are inpainted so the text can be rendered as real HTML.
Replace these with the original images exported from Figma / uploaded to Directus when available.
"""
import json, os, uuid
import numpy as np
import cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = cv2.imread(os.path.join(ROOT, 'design/exports/home/desktop-1920@1x.png'))
OUT = os.path.join(ROOT, 'public/fixtures')
os.makedirs(OUT, exist_ok=True)
U = lambda name: str(uuid.uuid5(uuid.NAMESPACE_URL, 'sg-trans/' + name))
files = {}

def save(name, img, ext='jpg'):
    fid = U(name)
    path = os.path.join(OUT, f'{fid}.{ext}')
    if ext == 'jpg':
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    else:
        cv2.imwrite(path, img)
    files[fid] = ext

def inpaint(img, rects, scale=3):
    mask = np.zeros(img.shape[:2], np.uint8)
    for x0, y0, x1, y1 in rects:
        mask[max(0, y0):y1, max(0, x0):x1] = 255
    small = cv2.resize(img, None, fx=1 / scale, fy=1 / scale, interpolation=cv2.INTER_AREA)
    sm = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    fixed = cv2.inpaint(small, sm, 5, cv2.INPAINT_TELEA)
    up = cv2.resize(fixed, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    up = cv2.GaussianBlur(up, (0, 0), 3)
    out = img.copy()
    soft = cv2.GaussianBlur(mask, (0, 0), 4)[..., None] / 255.0
    out = (up * soft + img * (1 - soft)).astype(np.uint8)
    out[mask > 0] = up[mask > 0]
    return out

# header logo
save('logo', SRC[6:66, 364:436])
# hero background (text, header, card removed)
hero = SRC[0:881].copy()
hero = inpaint(hero, [(310, 0, 1610, 134), (385, 280, 1535, 370), (500, 400, 1420, 460), (735, 520, 1185, 600), (355, 712, 1565, 881)])
save('hero', hero)
# quote card photo
save('quote-truck', SRC[830:1339, 970:1550])
# stats background: remove only what the page draws on top (heading text, white cards, icon circles)
stats = SRC[1489:1922].copy()
mask = np.zeros(stats.shape[:2], np.uint8)
mask[125:190, 595:1325] = 255                      # heading text
for i in range(5):
    x0 = 382 + 236 * i
    mask[298:, x0 - 4:x0 + 216] = 255              # white card (+ shadow)
    cv2.circle(mask, (x0 + 106, 302), 60, 255, -1)  # icon circle
small = cv2.resize(stats, None, fx=1 / 3, fy=1 / 3, interpolation=cv2.INTER_AREA)
sm = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
fixed = cv2.resize(cv2.inpaint(small, sm, 5, cv2.INPAINT_TELEA), (stats.shape[1], stats.shape[0]), interpolation=cv2.INTER_CUBIC)
stats[mask > 0] = fixed[mask > 0]
save('stats-bg', stats)
# service cards 1, 2, 4: inpaint icon + title at the bottom-left; card 3 has no visible image in the export
cards = [(16, 'service-logistic'), (494, 'service-freight'), (1450, 'service-ecommerce')]
for x0, name in cards:
    c = SRC[2304:2773, x0:x0 + 454].copy()
    # tight mask: only the white title glyphs and the orange icon strokes at the bottom-left
    reg = c.astype(int)
    white = reg[..., :].min(2) > 215
    orange = (reg[..., 2] > 170) & (reg[..., 1] < 150) & (reg[..., 0] < 120)  # BGR: red high, blue low
    mask = np.zeros(c.shape[:2], np.uint8)
    sel = (white | orange)
    sel[:300, :] = False
    sel[:, 340:] = False
    mask[sel] = 255
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    c = cv2.inpaint(c, mask, 4, cv2.INPAINT_TELEA)
    save(name, c)
grad = np.zeros((469, 454, 3), np.uint8)
for y in range(469):
    t = y / 468
    grad[y, :] = (int(60 + 40 * t), int(30 + 25 * t), int(18 + 12 * t))  # BGR dark blue
save('service-warehousing', grad)
# news images
for i, (x0, name) in enumerate([(386, 'news-1'), (786, 'news-2'), (1187, 'news-3')]):
    save(name, SRC[3642:3920, x0:x0 + 348])
# partner logos on #F5F5F5: make the background transparent
bg = np.array([245, 245, 245], np.float32)
strip = SRC[3120:3250].astype(np.float32)
diff = np.abs(strip - bg).sum(2)
cols = np.where((diff > 25).any(0))[0]
groups, s = [], cols[0]
for a, b in zip(cols[:-1], cols[1:]):
    if b - a > 60:
        groups.append((s, a)); s = b
groups.append((s, cols[-1]))
for i, (a, b) in enumerate(groups[:7], 1):
    sub = SRC[3120:3250, max(0, a - 6):b + 7].astype(np.float32)
    d = np.abs(sub - bg).sum(2)
    rows = np.where((d > 25).any(1))[0]
    sub = sub[max(0, rows[0] - 6):rows[-1] + 7]
    d = np.abs(sub - bg).sum(2)
    alpha = np.clip(d / 90.0, 0, 1)
    rgba = np.dstack([sub.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    save(f'partner-{i}', rgba, 'png')
# footer logo
# footer logo on the blue gradient: keep it as a transparent PNG (alpha from the distance to the local background)
fl = SRC[4750:4850, 366:480].astype(np.float32)
bgc = np.median(np.concatenate([fl[:4].reshape(-1, 3), fl[-4:].reshape(-1, 3)]), axis=0)
alpha = np.clip(np.abs(fl - bgc).sum(2) / 120.0, 0, 1)
save('footer-logo', np.dstack([fl.astype(np.uint8), (alpha * 255).astype(np.uint8)]), 'png')

json.dump(files, open(os.path.join(ROOT, 'src/content/fixtures/files.json'), 'w'), indent=2)
print(len(files), 'files written;', 'partner groups:', len(groups))
