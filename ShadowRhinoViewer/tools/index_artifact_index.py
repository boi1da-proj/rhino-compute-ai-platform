#!/usr/bin/env python3
import os, json, hashlib, time
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
ALLOW = ('.ghx','.json','.sh','.py')

def sha256(p: Path):
  h = hashlib.sha256()
  with p.open('rb') as f:
    for chunk in iter(lambda: f.read(1024*1024), b''):
      h.update(chunk)
  return h.hexdigest()

def update_index():
  idx_path = ROOT / 'artifact_index.json'
  if not idx_path.exists():
    raise SystemExit('artifact_index.json missing at repo root')
  idx = json.loads(idx_path.read_text(encoding='utf-8'))
  for a in idx.get('assets', []):
    p = ROOT / a['path']
    if p.exists() and p.suffix.lower() in ALLOW:
      a['size_bytes'] = p.stat().st_size
      a['digest_sha256'] = sha256(p)
    else:
      a['size_bytes'] = 0
      a['digest_sha256'] = 'MISSING'
  idx['generated_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
  idx_path.write_text(json.dumps(idx, indent=2), encoding='utf-8')
  print(f'updated {idx_path}')

if __name__ == '__main__':
  update_index()
