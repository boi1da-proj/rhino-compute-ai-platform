#!/usr/bin/env python3
import argparse
import json
import importlib.util
import os
import sys
import time
import uuid
import hashlib
import tempfile
import multiprocessing as mp
from pathlib import Path
from typing import Any, Dict

DEFAULT_TIMEOUT = int(os.environ.get("SP_SHADOW_TIMEOUT_SEC", "60"))


def sha256_file(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with open(file_path, "rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def _worker(module_path: str, inputs: Dict[str, Any], work_dir: str, q: mp.Queue) -> None:
    os.chdir(work_dir)
    spec = importlib.util.spec_from_file_location("shadow_module", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Failed to load module at {module_path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[attr-defined]
    if not hasattr(mod, "run"):
        raise RuntimeError(f"Module at {module_path} missing 'run(inputs: dict) -> dict'")
    q.put(mod.run(inputs))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=False, default="shadow_config.json")
    parser.add_argument("--in", dest="inp", required=True)
    parser.add_argument("--out", dest="out", required=True)
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT)
    args = parser.parse_args()

    project_root = Path(os.getenv("SP_PROJECT_ROOT", os.getcwd())).resolve()
    index_path = project_root / "artifact_index.json"
    runs_path = project_root / "artifact_runs.json"

    with open(args.inp, "r", encoding="utf-8") as f:
        payload: Dict[str, Any] = json.load(f)
    module_name: str = payload["module"]
    inputs: Dict[str, Any] = payload.get("inputs", {})

    # Optional config and feature flags
    config: Dict[str, Any] = {}
    if os.path.isfile(args.config):
        with open(args.config, "r", encoding="utf-8") as f:
            try:
                config = json.load(f)
            except Exception:
                config = {}

    if not index_path.is_file():
        raise RuntimeError("artifact_index.json not found.")

    with open(index_path, "r", encoding="utf-8") as f:
        idx = json.load(f)

    allow = set((idx.get("meta") or {}).get("module_allowlist") or [])
    artifacts = idx.get("artifacts", [])
    mod_to_rel = {
        a.get("module_name"): a.get("path")
        for a in artifacts
        if a.get("type") == "shadow_module" and a.get("module_name") and a.get("path")
    }

    if module_name not in allow or module_name not in mod_to_rel:
        raise RuntimeError(f"Module not indexed/allowed: {module_name}")

    module_rel = mod_to_rel[module_name]
    module_path = (project_root / module_rel).resolve()
    if project_root not in module_path.parents and module_path != project_root:
        raise RuntimeError("Module path escapes project root.")
    if not module_path.is_file():
        raise RuntimeError(f"Module not found: {module_path}")

    # Verify checksum from index
    expected = next((a.get("checksum_sha256") for a in artifacts if a.get("path") == module_rel), None)
    if expected and sha256_file(module_path) != expected:
        raise RuntimeError("Checksum mismatch. Regenerate artifact index.")

    out_path = Path(args.out).resolve()
    if project_root not in out_path.parents and out_path != project_root:
        raise RuntimeError("Output path must be inside project root.")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    run_id = str(uuid.uuid4())
    started = time.time()
    status = "ok"
    result_obj: Any = None

    with tempfile.TemporaryDirectory(prefix="shadow_run_") as tmpdir:
        q: mp.Queue = mp.Queue()
        proc = mp.Process(target=_worker, args=(str(module_path), inputs, tmpdir, q), daemon=True)
        proc.start()
        proc.join(args.timeout)

        if proc.is_alive():
            proc.terminate()
            proc.join(5)
            status = "timeout"
        elif proc.exitcode != 0:
            status = "error"
        else:
            try:
                result_obj = q.get_nowait()
            except Exception:
                status = "error"

    duration_ms = int((time.time() - started) * 1000)
    envelope = {
        "run_id": run_id,
        "module": module_name,
        "environment_label": os.getenv("SP_ENV", config.get("environment_label", "dev")),
        "summary": {"duration_ms": duration_ms, "status": status},
        "result": result_obj if status == "ok" else None,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(envelope, f, indent=2)

    # Append to artifact_runs.json (best-effort)
    try:
        runs = []
        if runs_path.is_file():
            with open(runs_path, "r", encoding="utf-8") as f:
                runs = json.load(f)
        runs.append(envelope)
        with open(runs_path, "w", encoding="utf-8") as f:
            json.dump(runs, f, indent=2)
    except Exception:
        pass

    # Optional OTEL span (and optional env presence flags)
    try:
        from opentelemetry import trace  # type: ignore

        tracer = trace.get_tracer("softlyplease-shadow")
        with tracer.start_as_current_span("shadow.run") as span:
            span.set_attribute("run.id", run_id)
            span.set_attribute("shadow.module", module_name)
            span.set_attribute("env.label", envelope["environment_label"])
            span.set_attribute("duration.ms", duration_ms)
            span.set_attribute("status", status)
            # Presence-only; never values
            span.set_attribute("secret.RHINO_COMPUTE_TOKEN", "present" if os.getenv("RHINO_COMPUTE_TOKEN") else "absent")
            span.set_attribute("secret.INTERNAL_API_KEY", "present" if os.getenv("INTERNAL_API_KEY") else "absent")
    except Exception:
        pass

    return 0 if status == "ok" else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # pragma: no cover
        # Write a minimal error summary to GitHub step summary if present
        try:
            with open(os.environ.get("GITHUB_STEP_SUMMARY", os.devnull), "a", encoding="utf-8") as w:
                w.write(f"Shadow module failed: {e}\n")
        except Exception:
            pass
        sys.stderr.write(f"Shadow module failed: {e}\n")
        sys.exit(1)
