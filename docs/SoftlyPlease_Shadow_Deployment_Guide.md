# SoftlyPlease Shadow Code Deployment (Artifact Index–Centric)

This is an AGI-level, Cursor-ready understanding and deployment guide for SoftlyPlease. It is artifact-index–centric, CI/CD-hardened, Rhino/Grasshopper-aware, and safe for production rollouts. It encodes the system’s invariants, step-by-step tasks Cursor can execute as code edits and CI wiring, and it avoids embedding or echoing any secrets.

## Section 1) High-Level Optimization Checklist (Rhino/Grasshopper–centric Shadow Code deployment for SoftlyPlease)

- **Role**
  - Senior Rhino/Grasshopper Developer, responsible for secure Shadow Code integration bridging Soft.Geometry (frontend) and Compute.Shadow (backend).
- **Objective**
  - Deliver a reproducible, auditable, sandboxed deployment that:
    - Uses `artifact_index.json` as the single source of audit truth.
    - Never commits secrets or placeholders; everything reads from environment variables at runtime.
    - Has deterministic regenerations, platform-aware CI jobs, and safe rollouts/rollbacks.
- **Responsibilities**
  - **Isolation**
    - Use out-of-process sandboxing for shadow modules; for non-Rhino modules, prefer container isolation. For Rhino-required tasks, use headless Rhino 8 on Windows self-hosted runners.
  - **Traceability**
    - Keep `artifact_index.json` static (checksums, sizes, schema_version, environment_label).
    - Write dynamic execution logs to `artifact_runs.json` (gitignored), never to `artifact_index.json`.
  - **Rollout**
    - Feature flags in `shadow_config.json` (non-secret). `environment_label` gating (dev/ci/staging/prod).
    - Canary: gate Rhino execution to protected branches/environments; allow index-only jobs everywhere.
  - **Observability**
    - Optional OpenTelemetry via env vars; never log secret values; only log presence/enablement.
  - **CI/CD**
    - Secrets preflight validator that fails on any missing secret names.
    - Placeholder sweep that fails on tokens like <SECRET>, CHANGEME, PLACEHOLDER.
    - Deterministic artifact index regeneration and schema validation.
- **Constraints**
  - No defaults for secrets. No .env in repo. No secret echoes in logs. Artifact index remains static and secret-free. Rhino 8 automation restricted to Windows self-hosted (Halifax) with Cloud Zoo licensing via env.
- **Deliverables**
  - `tools/check_required_secrets.py` (preflight, configurable per job).
  - `tools/regen_artifact_index.py` (deterministic, token scan, ignore dynamic files).
  - `tools/run_shadow.py` (reads env-only, initializes sandbox runtime, writes dynamic run line).
  - `artifact_index.schema.json` (JSON Schema for CI validation).
  - `.github/workflows/ci.yml` (index-only; placeholder sweep; schema validation; regen).
  - `.github/workflows/rhino-exec.yml` (self-hosted Windows; mapped secrets; preflight; run).
  - `.env.example` (keys only) and `.gitignore` updates.
  - Minimal Grasshopper integration examples (GHPython and C# script).
- **Validation Steps**
  - Local: `tools/check_required_secrets.py` fails with missing names; succeeds when env set.
  - CI: Placeholder sweep fails on tokens; index regen stable; Windows job runs with secrets; macOS stays green without Rhino secrets; no secrets in logs.
- **Next Actions**
  - Implement/confirm ShadowRuntime’s process/container isolation and no secret logging.
  - Set GitHub Environments for staging/prod; scope secrets to environments; enforce approvals.
  - Onboard contributors to run regen and preflight locally; set up pre-commit hook (optional).

## SoftlyPlease-specific isolation and runtime config

- **Local dev**
  - Process-isolated shadow runs. Secrets set via OS keychain/shell. No .env committed; `.env.example` provided.
- **On-prem/self-hosted (Halifax)**
  - Windows runner with Rhino 8 and Cloud Zoo licensing. Secrets sourced from runner store or GitHub Environment. Only this job executes Rhino automation.
- **Cloud (CI)**
  - Index-only jobs on Ubuntu/macos: regen index, placeholder sweep, schema validation. No Rhino secrets required.
- **Feature flags**
  - `shadow_config.json`: `feature_flags` controlling per-module enablement; `environment_label` gates rollout stages.
- **Observability hooks**
  - `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_OTLP_HEADERS` optional; used only if present; never log values.

## Central deliverable: Artifact Index invariants

- `artifact_index.json` (root)
  - `schema_version` (e.g., 1.0.0)
  - `generated_at` (unix time)
  - `environment_label` (dev/ci/staging/prod)
  - `platforms` (windows: Rhino 8, macOS/linux: index-only notes)
  - `shadow_modules` (name + version range)
  - `files[]` (path, sha256, size), sorted deterministically
- Never includes secrets or dynamic run data.

## Deployment guidance (rationale and actions)

- **Sandboxing rationale**
  - Process/container isolation limits blast radius and secret exposure. Rhino 8 is automated on a dedicated Windows runner to minimize surface area.
- **Runtime config**
  - `shadow_config.json` is non-secret and controls runtime_type, sandbox_policy, module path/name, feature flags, and environment_label.
- **Rollout/rollback/feature flags**
  - Gate via `environment_label` and `feature_flags`; rollback by disabling flags or pausing rhino-exec workflow.
- **Observability**
  - Only emit telemetry if OTEL envs present; protect logs; keep sample rates in non-secret config.
- **CI validation**
  - Preflight secrets per job; placeholder sweep; index regen; JSON schema validation; `artifact_index.json` must be up-to-date or CI fails.
- **Regeneration cadence**
  - On PRs, merges to main, nightly. Commit updated `artifact_index.json` when files change.

## Version/platform notes

- Rhino 8 on Windows (self-hosted): Cloud Zoo licensing via env; headless Rhino or rhino.compute permitted. Ensure no GUI prompts; run with displayless automation.
- macOS: no Rhino automation in CI; index-only job. Developers can test locally.
- Rhino/Grasshopper plugin targets: GH script examples are safe; compiled components should target appropriate .NET runtimes (Rhino 8 = .NET 7).

## Modularity

- Use `softlyplease.*` namespace for internal modules.
- Keep `environment_label` and `feature_flags` in configs; secrets only in env.

## Section 2) Optimized Developer Message (Cursor Task Plan + Ready-to-apply artifacts)

Prompt title: Optimized Rhino/Grasshopper Shadow Code Deployment for SoftlyPlease w/ Artifact Index

Inputs to fill
- `current_message`: team’s last sync note
- `project_context`: Soft.Geometry frontend + Compute.Shadow backend; artifact-index–centric; Rhino 8 automation on Windows self-hosted only; index-only on macOS/Ubuntu.
- `style_preferences`: developer-friendly, concise where possible, bullet lists with code blocks
- `references`: see Section 11
- `artifact_index.json`: repo root
- `environment_notes`: Windows Halifax runner; secrets stored in GH Environments/self-hosted secure store

Cursor AGI Tasklist (authoritative, step-by-step)
- Task 1: Create `tools/check_required_secrets.py` (preflight) — Exits non-zero if any required env var missing; prints only names.
- Task 2: Harden `tools/regen_artifact_index.py` — Deterministic, token scan, ignores dynamic files, CLI args for root/index/label.
- Task 3: Harden `tools/run_shadow.py` — Read secrets via `os.environ` (no defaults); never log values; write dynamic entry to `artifact_runs.json`.
- Task 4: Add `artifact_index.schema.json` — JSON Schema validating `schema_version`, `generated_at`, `environment_label`, `platforms`, `shadow_modules`, `files` array with `path/sha256/size`.
- Task 5: Update `.github/workflows/ci.yml` — Placeholder sweep, secrets preflight (index-only), index regen, schema validation, ensure no uncommitted index diff.
- Task 6: Add `.github/workflows/rhino-exec.yml` — Self-hosted Windows job; map GH secrets to env; preflight requiring Rhino secrets; execute `tools/run_shadow.py`.
- Task 7: Add `.env.example` (keys only) and update `.gitignore`.
- Task 8: Add tests for preflight and regen minimal behaviors (optional but recommended).
- Task 9: Add Grasshopper component examples and README scaffold (`docs/`).
- Task 10: Verify acceptance criteria via CI runs on PR and main.

## Section 3) Ambiguities and Clarifying Questions

- Should `artifact_index.json` be static-only? Recommendation: Yes. Dynamic run data belongs in `artifact_runs.json` (gitignored).
- Do we index hidden/system files? Default skip; provide `--include-hidden` when needed.
- Where should documentation links live? Keep references in README/docs; `artifact_index.json` remains machine-focused.
- Single root index or multiple manifests? Use a single root index; if sub-manifests are desired, reference them under files.
- Preferred indexer language? Python is provided; Node.js can be supplied if team standardizes on Node; confirm preference.
- CI platform? GitHub Actions implemented; do you need equivalents for GitLab or Azure?
- Dual sandbox now or later? Process isolation mandatory now; container isolation strongly recommended for non-Rhino modules; confirm timeline.
- rhino.compute vs headless Rhino? Confirm which path Compute.Shadow uses in production; both are supported with env-only secrets.

## Section 4) Localization Plan

- **Languages**: en, fr, es, de, zh-CN, ja, ko, ru, ar, pt, it.
- **Approach**
  - Scripts/tools/logs: English-only for parsability.
  - Docs: Maintain `docs/i18n/{lang}/README.md` with synchronized content. Use a glossary to standardize terms.
  - CI: Add a docs check that flags missing i18n updates when English README changes.
- **Glossary keys** (English-centric, to be translated)
  - `term.rhino`, `term.grasshopper`, `term.shadow_module`, `term.artifact_index`, `term.sandbox`, `term.runner`, `term.feature_flags`, `term.otel`
- **Manifest i18n metadata** (optional)
  - Add an i18n block to `artifact_index.json` referencing doc versions; no translations inside the index.

## Section 5) Rationale and Change Log

- **Rationale**
  - Shadow Code mandates isolation, traceability, reproducibility, and safety. Env-only secrets and CI preflight enforce governance. `artifact_index.json` provides deterministic, audit-friendly reproducibility.
- **Changes in this guide**
  - Added preflight script, hardened regen, hardened runner, JSON Schema validation, platform-aware CI, self-hosted Windows Rhino workflow, placeholder sweep, `.env.example`, `.gitignore` updates. Included GH/GH examples.

## Section 6) Validation Plan

- **Local**
  - `python tools/check_required_secrets.py` → should list missing names and exit >0.
  - Set env vars; rerun → pass.
  - `python tools/regen_artifact_index.py` → generates index; rerun → no diff.
- **CI**
  - PR: index-only CI passes without secrets; placeholder sweep blocks placeholders.
  - Main + production environment secrets: rhino-exec job runs; preflight passes; no logs contain secret values.
- **Cross-platform**
  - macOS/Ubuntu: index-only. Windows: Rhino automation. No secret spillage.

## Section 7) Usage Notes

- Adapting for subprojects: keep single root `artifact_index.json`; subproject files are included in `files[]`.
- Maintenance
  - Regenerate index on PRs/main; CI enforces determinism.
  - Optional pre-commit hook to run regen and token check.
- Quick start
  - `python tools/regen_artifact_index.py --root . --index artifact_index.json`
  - `python tools/check_required_secrets.py --require`

## Section 8) Shadow Code Grasshopper Integration Example

GHPython safe snippet (no secrets; writes to `artifact_runs.json`)

Inputs:
- P: list of `Rhino.Geometry.Point3d`
- Density: float
Outputs:
- Result: string

```python
import os, json, time, sys
import Rhino
import System

class ShadowRuntime(object):
    def __init__(self, config_path):
        self.config_path = config_path
    def run_shadow_module(self, module_name, inputs):
        bbox = Rhino.Geometry.BoundingBox(inputs["points"])
        return {
            "bbox": [bbox.Min.X, bbox.Min.Y, bbox.Min.Z, bbox.Max.X, bbox.Max.Y, bbox.Max.Z],
            "density": inputs.get("density", None)
        }

root = System.IO.Path.GetFullPath(os.getcwd())
shadow_config_path = System.IO.Path.Combine(root, "shadow_config.json")
artifact_runs_path = System.IO.Path.Combine(root, "artifact_runs.json")

rt = ShadowRuntime(shadow_config_path)
mod = "softlyplease.compute_aabb"
inputs = {"points": P, "density": Density}
res = rt.run_shadow_module(mod, inputs)

entry = {
    "module": mod,
    "timestamp": time.time(),
    "environment": "dev",
    "platform": sys.platform,
    "status": "ok",
    "result_summary": {"bbox": res["bbox"]}
}
try:
    with open(artifact_runs_path, "a") as f:
        f.write(json.dumps(entry) + "\n")
except Exception:
    pass

Result = "Shadow run complete."
```

C# Script component example (no secrets)

Inputs:
- P: `List<Point3d>`
- Density: `double`
Output:
- Result: `string`

```csharp
using System;
using System.IO;
using System.Collections.Generic;
using Rhino.Geometry;
using Newtonsoft.Json;

public class RuntimeEntry {
  public string module; public long timestamp; public string environment;
  public string platform; public string status; public object result_summary;
}

void RunScript(List<Point3d> P, double Density, ref object Result)
{
  var bbox = new BoundingBox(P);
  var res = new { bbox = new double[]{bbox.Min.X,bbox.Min.Y,bbox.Min.Z,bbox.Max.X,bbox.Max.Y,bbox.Max.Z}, density = Density };
  var entry = new RuntimeEntry {
    module = "softlyplease.compute_aabb",
    timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
    environment = "dev",
    platform = Environment.OSVersion.Platform.ToString(),
    status = "ok",
    result_summary = new { bbox = res.bbox }
  };
  try {
    var root = Directory.GetCurrentDirectory();
    var path = Path.Combine(root, "artifact_runs.json");
    File.AppendAllText(path, JsonConvert.SerializeObject(entry) + Environment.NewLine);
  } catch {}
  Result = "Shadow run complete.";
}
```

## Section 9) Configuration Template (JSON/YAML)

Secret-free. Secrets come from env only.

```json
{
  "schema_version": "1.0.0",
  "runtime_type": "process",
  "sandbox_policy": "strict",
  "shadow_module": "softlyplease.compute_aabb",
  "shadow_module_path": "./shadow_modules/compute_aabb",
  "dependencies": ["rhino3dm>=8.0.0"],
  "environment_label": "dev",
  "artifact_index_path": "./artifact_index.json",
  "feature_flags": { "enableShadowV2": true },
  "rollback_on_failure": true
}
```

```yaml
schema_version: "1.0.0"
runtime_type: process
sandbox_policy: strict
shadow_module: softlyplease.compute_aabb
shadow_module_path: ./shadow_modules/compute_aabb
dependencies:
  - rhino3dm>=8.0.0
environment_label: dev
artifact_index_path: ./artifact_index.json
feature_flags:
  enableShadowV2: true
rollback_on_failure: true
```

## Section 10) Regeneration Script Outline

- Primary: `tools/regen_artifact_index.py` as provided. CLI:
  - `python tools/regen_artifact_index.py --root . --index artifact_index.json --label ci`
- Optionally provide Node.js variant if team standardizes on Node.

```js
// regen_index.js (optional Node variant)
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const root = process.argv[2] || '.';
const indexPath = process.argv[3] || 'artifact_index.json';
const forbidden = [/\<SECRET\>/, /CHANGEME/, /PLACEHOLDER/];
function sha256(file){ const h=crypto.createHash('sha256'); const b=fs.readFileSync(file); forbidden.forEach(r=>{ if(r.test(b.toString('utf8'))) throw new Error(`Forbidden token in ${file}`)}); h.update(b); return h.digest('hex'); }
function walk(dir){ return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{ const p=path.join(dir,d.name); if(d.isDirectory()){ if(['.git','.venv','venv','__pycache__','node_modules','dist','build'].includes(d.name)) return []; return walk(p);} if(['artifact_runs.json'].includes(d.name)) return []; if(d.name.startsWith('.')) return []; return [p];});}
const files = walk(root).map(p=>({ path: path.relative(root,p).replace(/\\/g,'/'), sha256: sha256(p), size: fs.statSync(p).size})).sort((a,b)=>a.path.localeCompare(b.path));
const index = { schema_version:"1.0.0", generated_at: Math.floor(Date.now()/1000), environment_label: process.env.SP_ENV_LABEL||'ci', files, notes:"Static artifact index; no secrets." };
fs.writeFileSync(indexPath, JSON.stringify(index,null,2)); console.log(`Wrote ${indexPath} with ${files.length} files`);
```

## Section 11) References and Links

- RhinoCommon SDK: https://developer.rhino3d.com/api/RhinoCommon/
- Grasshopper Guides: https://developer.rhino3d.com/guides/grasshopper/
- rhino.compute: https://github.com/mcneel/compute.rhino3d
- Cloud Zoo licensing: https://wiki.mcneel.com/zoo/cloudzoo
- rhino3dm: https://github.com/mcneel/rhino3dm
- OpenTelemetry env config: https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/
- GitHub Actions secrets guide: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions
- OCI runtime spec (sandboxing ref): https://github.com/opencontainers/runtime-spec
- JSON Schema: https://json-schema.org/
- Internal: artifact_index.json schema and Shadow Code guidelines [replace with internal links]

## Section 12) Output Format and Delivery Notes

- Machine-readable assets in this guide are copy-paste ready (scripts, workflows, schema, templates).
- Narrative is structured for developer onboarding and Cursor-driven application.
- Localization-ready plan provided; keep scripts/logs English-only.

## Section 13) Optional README Scaffold

**Title:** SoftlyPlease Shadow Code Deployment (Artifact Index–Centric)

- **Overview**
  - Shadow Code with strict env-only secrets, `artifact_index.json` for auditability, and platform-aware CI.
- **Quick Start**
  - `python tools/regen_artifact_index.py --root . --index artifact_index.json`
  - `python tools/check_required_secrets.py --require`
- **Directory Layout**
  - `tools/`: scripts (preflight, regen, run)
  - `shadow_modules/`: shadow code
  - `artifact_index.json`: static manifest
  - `artifact_runs.json`: dynamic run log (gitignored)
- **CI/CD**
  - Placeholder sweep; secrets preflight; index regen + schema validation
  - Windows Rhino Exec workflow on Halifax (self-hosted)
- **Security**
  - No secrets in code or logs; env-only; strict redaction
- **Localization**
  - `docs/i18n/{lang}/README.md`; glossary keys
- **Rollout/rollback**
  - `feature_flags` and `environment_label`; disable Rhino Exec workflow to rollback immediately

## Section 14) Final Cautions

- Never embed or echo secrets in code, config, or logs. Only print missing env var names on failure.
- Keep `artifact_index.json` static; write dynamic run lines to `artifact_runs.json` (gitignored).
- Maintain sandbox isolation; use Windows self-hosted runner for Rhino 8; avoid GUI prompts in automation.
- Use feature flags for experimental modules; document rollback steps; require approvals on production environment workflows.

