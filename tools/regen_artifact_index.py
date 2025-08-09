#!/usr/bin/env python3
"""
Deterministically regenerate artifact_index.json for SoftlyPlease Shadow Code.
- Walks whitelisted paths
- Computes SHA-256, size, mtime
- Produces normalized, sorted output
"""
import argparse
import hashlib
import json
import os
import sys
import time
from pathlib import Path

WHITELIST = [
    "shadow_modules",
    "gh",
    "plugins",
    "assets",
    "tools/run_shadow.py",
    "shadow_config.json",
    "README.md",
]

EXCLUDE_GLOBS = [
    ".git/",
    ".github/",
    ".venv/",
    "__pycache__/",
    ".DS_Store",
]


def sha256_file(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def is_excluded(file_path: Path) -> bool:
    standardized = str(file_path).replace("\\", "/")
    return any(pattern in standardized for pattern in EXCLUDE_GLOBS)


def collect_artifacts(root_dir: Path):
    collected = []
    for whitelisted in WHITELIST:
        absolute = root_dir / whitelisted
        if absolute.is_file() and not is_excluded(absolute):
            collected.append(absolute)
        elif absolute.is_dir():
            for file_path in absolute.rglob("*"):
                if file_path.is_file() and not is_excluded(file_path):
                    collected.append(file_path)
    return collected


def to_logical_name(root_dir: Path, file_path: Path) -> str:
    rel = file_path.relative_to(root_dir).as_posix()
    if rel.startswith("shadow_modules/") and rel.endswith(".py"):
        module = rel[len("shadow_modules/") : -3].replace("/", ".")
        return f"softlyplease.shadow_modules.{module}"
    return rel


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--index", default="artifact_index.json")
    parser.add_argument("--ci", action="store_true")
    args = parser.parse_args()

    root_dir = Path(args.root).resolve()
    index_path = root_dir / args.index

    artifacts = []
    files = sorted(collect_artifacts(root_dir), key=lambda p: p.as_posix())
    for file_path in files:
        rel = file_path.relative_to(root_dir).as_posix()
        stat = file_path.stat()
        checksum = sha256_file(file_path)
        module_name = None
        if rel.startswith("shadow_modules/") and rel.endswith(".py"):
            module_name = to_logical_name(root_dir, file_path)
        artifacts.append(
            {
                "path": rel,
                "logical_name": module_name if module_name else rel,
                "type": "shadow_module" if module_name else "file",
                "module_name": module_name,
                "checksum_sha256": checksum,
                "size_bytes": int(stat.st_size),
                "last_modified": int(stat.st_mtime),
                "platform_tags": [
                    "win"
                    if rel.endswith(".gha") or rel.endswith(".rhp")
                    else "any"
                ],
            }
        )

    # Build module allowlist from discovered shadow modules
    module_allowlist = sorted(
        [
            a["module_name"]
            for a in artifacts
            if a.get("type") == "shadow_module" and a.get("module_name")
        ]
    )

    meta = {
        "project": "SoftlyPlease",
        "index_version": 1,
        "generated_at": int(time.time()),
        "generator": "tools/regen_artifact_index.py",
        "module_allowlist": module_allowlist,
        "environments": [
            {"label": "dev", "runtime": "process"},
            {"label": "ci", "runtime": "process"},
            {"label": "ca-hfx", "runtime": "process|container"},
        ],
        "deployment": {
            "sandbox_policy": "strict",
            "container_image": "ghcr.io/softlyplease/shadow-rhino8:8.9.24180-windows-ltsc2022",
            "feature_flags": {"enableShadowV2": True},
        },
        "localization": {
            "default": "en",
            "available": [
                "en",
                "fr",
                "es",
                "de",
                "zh-CN",
                "ja",
                "ko",
                "ru",
                "ar",
                "pt",
                "it",
            ],
        },
    }

    output = {"meta": meta, "artifacts": artifacts}
    with index_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2, sort_keys=True)

    # Optional: schema validation can be invoked by a separate tool in CI
    return 0


if __name__ == "__main__":
    sys.exit(main())
