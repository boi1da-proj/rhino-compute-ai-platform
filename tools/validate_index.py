#!/usr/bin/env python3
"""Validate artifact_index.json against tools/artifact_index.schema.json"""
import json
import sys
from pathlib import Path

try:
    from jsonschema import validate
    from jsonschema.exceptions import ValidationError
except Exception as exc:  # pragma: no cover
    print("Missing dependency: jsonschema. Please `pip install -r requirements.txt`.")
    raise


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: validate_index.py <index.json> <schema.json>")
        return 2
    index_path = Path(sys.argv[1])
    schema_path = Path(sys.argv[2])

    with index_path.open("r", encoding="utf-8") as rf:
        index_data = json.load(rf)
    with schema_path.open("r", encoding="utf-8") as sf:
        schema = json.load(sf)

    try:
        validate(instance=index_data, schema=schema)
    except ValidationError as ve:
        print("Schema validation failed:\n", ve)
        return 1

    # Strict checks beyond schema
    artifacts = index_data.get("artifacts", [])
    paths = [a.get("path") for a in artifacts]
    if paths != sorted(paths):
        print("ERROR: artifacts must be sorted by path.")
        return 1

    meta = index_data.get("meta") or {}
    allow = set(meta.get("module_allowlist") or [])
    mods = {
        a.get("module_name")
        for a in artifacts
        if a.get("type") == "shadow_module" and a.get("module_name")
    }
    missing = mods - allow
    if missing:
        print(
            "ERROR: shadow modules missing from module_allowlist:",
            ", ".join(sorted(missing)),
        )
        return 1

    print("artifact_index.json passed schema and strict checks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
