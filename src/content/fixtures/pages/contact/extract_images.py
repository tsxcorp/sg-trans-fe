"""One-off helper: cut the Contact page images out of the exported Figma frame.

Source: design/exports/contact/desktop-1920@1x.png (1928x5845, the 1920 frame sits at x 4..1923).
Output: public/fixtures/<file id>.<ext> and src/content/fixtures/files.d/contact.json (then run scripts/merge_files.py).
Backgrounds that carry live text or UI in the export (hero, map chip, quote photo overlay card) are inpainted.
Replace with the original images exported from Figma / uploaded to Directus when available.
"""
import json, os, uuid
import numpy as np
import cv2

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), *[".."] * 5))
SRC = cv2.imread(os.path.join(ROOT, 'design/exports/contact/desktop-1920@1x.png'))[:, 4:1924].copy()  # the 1920 frame
OUT = os.path.join(ROOT, 'public/fixtures')
os.makedirs(OUT, exist_ok=True)
U = lambda name: str(uuid.uuid5(uuid.NAMESPACE_URL, 'sg-trans/contact-' + name))
files = {}


def save(name, img, ext='jpg'):
    fid = U(name)
    path = os.path.join(OUT, f'{fid}.{ext}')
    if ext == 'jpg':
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    else:
        cv2.imwrite(path, img)
    files[fid] = ext
    print(name, fid, ext, img.shape[1], 'x', img.shape[0])


def inpaint(img, rects, scale=3, blur=3, feather=4):
    mask = np.zeros(img.shape[:2], np.uint8)
    for x0, y0, x1, y1 in rects:
        mask[max(0, y0):y1, max(0, x0):x1] = 255
    small = cv2.resize(img, None, fx=1 / scale, fy=1 / scale, interpolation=cv2.INTER_AREA)
    sm = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    fixed = cv2.inpaint(small, sm, 5, cv2.INPAINT_TELEA)
    up = cv2.resize(fixed, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    up = cv2.GaussianBlur(up, (0, 0), blur)
    soft = cv2.GaussianBlur(mask, (0, 0), feather)[..., None] / 255.0
    out = (up * soft + img * (1 - soft)).astype(np.uint8)
    out[mask > 0] = up[mask > 0]
    return out


# hero 1920x838: header, title, subtitle and buttons removed (the page draws them as live HTML)
hero = SRC[0:838].copy()
hero = inpaint(hero, [(340, 0, 1580, 136), (700, 262, 1220, 345), (630, 380, 1292, 436), (748, 504, 1180, 590)])
save('hero', hero)

# static map 608x400 (chip removed, it is live HTML)
mp = SRC[956:1356, 992:1600].copy()
mp = inpaint(mp, [(420, 15, 594, 66)], scale=2, blur=2, feather=1)
save('map', mp)

# dotted world map decoration: right of / above the map card, card area painted white (the card covers it)
dots = SRC[880:1580, 1400:1920].copy()
dots[956 - 880:1356 - 880, :1600 - 1400] = 255
save('world-dots', dots, 'png')

# forklift decoration, washed grey on white, clipped by the grey section at y 1799
save('forklift', SRC[1436:1799, 0:284].copy())

# quote band background 1920x901; the card hides its middle, so the hole is filled with the surrounding colours
band = SRC[3506:4407].copy()
band = inpaint(band, [(340, 96, 1580, 806)], scale=8, blur=12, feather=8)
save('quote-bg', band)

# right half of the quote card: photo with its dark gradient baked in; frosted overlay card removed (live HTML)
ph = SRC[3602:4310, 960:1576].copy()
ph = inpaint(ph, [(44, 504, 572, 660)], scale=2, blur=3, feather=4)
save('quote-photo', ph)

json.dump(files, open(os.path.join(ROOT, 'src/content/fixtures/files.d/contact.json'), 'w'), indent=2)
print(len(files), 'files written')
