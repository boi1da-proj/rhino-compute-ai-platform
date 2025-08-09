# SoftlyPlease Shadow (artifact-index driven)

Shadow Code workflow for Rhino/Grasshopper with an artifact index, CI validation, and optional Halifax self-hosted execution.

## Quick Start

- Python 3.11
- Optional: `python -m venv .venv && source .venv/bin/activate` (Windows: `.venv\\Scripts\\activate`)
- Install tools: `pip install -r requirements.txt`
- Regenerate index: `python tools/regen_artifact_index.py --root . --index artifact_index.json`
- Validate schema: `python tools/validate_index.py artifact_index.json tools/artifact_index.schema.json`

## Running a shadow module

```bash
python tools/run_shadow.py --config shadow_config.json --in tools/smoke_payload.json --out tools/smoke_result.json
```

## Structure

- `artifact_index.json` — canonical manifest (static)
- `artifact_runs.json` — dynamic run events (optional; not committed by default)
- `shadow_modules/` — shadow compute modules
- `tools/` — index tooling, runner, and CI helpers
- `i18n/` — localization bundles

## CI

- `.github/workflows/ci.yml` regenerates and validates the index and localization on Windows/macOS
- `.github/workflows/rhino-exec.yml` runs smoke tests on a self-hosted Halifax Windows runner (no secrets committed)

## Secrets

Use GitHub Actions Environments and Secrets. Do not commit or echo secrets in code.
