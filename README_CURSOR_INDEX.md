# Cursor Index for Rhino Developer Docs

This provides a baseline `cursor_index.json` that lists key Rhino developer docs as links with metadata. It is generated from `docs_manifest.json` by `regen_cursor_index.py` and can be extended later with a crawler.

## Files
- `docs_manifest.json`: source of truth for docs to include
- `regen_cursor_index.py`: regenerates `cursor_index.json` deterministically
- `cursor_index.json`: generated index (URLs + metadata only; no content copies)
- `.github/workflows/update_cursor_index.yml`: CI to regenerate on PRs and pushes

## Usage
```bash
python regen_cursor_index.py
```

## Extend later
- Replace `docs_manifest.json` with a crawler output (e.g., sitemap-based)
- Add per-language entries
- Integrate link health checks in the regen script
