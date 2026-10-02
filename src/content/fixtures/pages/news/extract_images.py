"""One-off helper: cut sample images for the News and News Article fixtures out of the exported Figma frames.

Sources: design/exports/news/desktop-1920@1x.png (1920x5107), design/exports/news-article/desktop-1920@1x.png (1920x4148).
Output: public/fixtures/<file id>.<ext>, src/content/fixtures/files.d/{news,news-article}.json (then run scripts/merge_files.py).
Hero backgrounds are inpainted (header, title and breadcrumb removed) so the text can be live HTML.
Replace with the original images when they are available.
"""
import json, os, uuid
import numpy as np
import cv2

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), *[".."] * 5))
NEWS = cv2.imread(os.path.join(ROOT, 'design/exports/news/desktop-1920@1x.png'))
ART = cv2.imread(os.path.join(ROOT, 'design/exports/news-article/desktop-1920@1x.png'))
OUT = os.path.join(ROOT, 'public/fixtures')
os.makedirs(OUT, exist_ok=True)
U = lambda name: str(uuid.uuid5(uuid.NAMESPACE_URL, 'sg-trans/' + name))
news_files, article_files = {}, {}


def save(files, name, img, ext='jpg'):
    fid = U(name)
    path = os.path.join(OUT, f'{fid}.{ext}')
    if ext == 'jpg':
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    else:
        cv2.imwrite(path, img)
    files[fid] = ext
    print(name, fid)


def inpaint(img, rects, scale=3):
    mask = np.zeros(img.shape[:2], np.uint8)
    for x0, y0, x1, y1 in rects:
        mask[max(0, y0):y1, max(0, x0):x1] = 255
    small = cv2.resize(img, None, fx=1 / scale, fy=1 / scale, interpolation=cv2.INTER_AREA)
    sm = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    fixed = cv2.inpaint(small, sm, 5, cv2.INPAINT_TELEA)
    up = cv2.resize(fixed, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    up = cv2.GaussianBlur(up, (0, 0), 3)
    soft = cv2.GaussianBlur(mask, (0, 0), 4)[..., None] / 255.0
    out = (up * soft + img * (1 - soft)).astype(np.uint8)
    out[mask > 0] = up[mask > 0]
    return out


# hero 1: header container, title (2 lines) and breadcrumb removed
h1 = NEWS[0:495].copy()
h1 = inpaint(h1, [(306, 0, 1614, 136), (340, 240, 1580, 350), (790, 356, 1130, 384)])
save(news_files, 'news-hero-1', h1)
# hero 2: title and breadcrumb removed
h2 = NEWS[2348:2843].copy()
h2 = inpaint(h2, [(720, 268, 1200, 322), (860, 334, 1045, 360)])
save(news_files, 'news-hero-2', h2)
# featured cover (861x329 from the article frame: no badge drawn on it)
save(news_files, 'news-cover-featured', ART[575:904, 320:1181])
# featured card image as drawn on the list (768x329, category badge removed)
feat = inpaint(NEWS[596:925].copy()[:, 320:1088], [(0, 0, 122, 34)], scale=2)
save(news_files, 'news-list-featured', feat)
# list thumbnails 245x245
for i, y in enumerate([1284, 1594, 1904], 1):
    save(news_files, f'news-thumb-{i}', NEWS[y:y + 245, 320:565])
# Industry Insights card covers at card size (382x277), one per card of the design, for the 3 articles of the Home fixtures
for i, x in enumerate([336, 769, 1203], 1):
    save(news_files, f'news-card-{i}', NEWS[3138:3415, x:x + 382])
# the same cards as drawn on the article page (that frame crops the photos slightly differently)
for i, x in enumerate([336, 769, 1203], 1):
    save(article_files, f'news-article-card-{i}', ART[2582:2859, x:x + 382])
# article feature block image (266x266 on the dark card)
save(article_files, 'news-article-feature', ART[1348:1614, 902:1168])

json.dump(news_files, open(os.path.join(ROOT, 'src/content/fixtures/files.d/news.json'), 'w'), indent=2)
json.dump(article_files, open(os.path.join(ROOT, 'src/content/fixtures/files.d/news-article.json'), 'w'), indent=2)
