"""Merge src/content/fixtures/files.d/*.json (one file per page, file id -> extension) into files.json.
Page builders only write their own files.d/<page>.json, then run this script."""
import glob, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'src/content/fixtures/files.json')
merged = {}
for f in sorted(glob.glob(os.path.join(root, 'src/content/fixtures/files.d/*.json'))):
    merged.update(json.load(open(f)))
base = json.load(open(out)) if os.path.exists(out) else {}
base.update(merged)
json.dump(base, open(out, 'w'), indent=2)
print(len(base), 'file ids in files.json')
