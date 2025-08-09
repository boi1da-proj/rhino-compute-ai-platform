#!/usr/bin/env python3
import json
import hashlib
import datetime
import os
from typing import List, Dict, Any

MANIFEST_PATH = "docs_manifest.json"
OUTPUT_PATH = "cursor_index.json"


def checksum_of_url(url: str) -> str:
    hasher = hashlib.sha256()
    hasher.update(url.encode("utf-8"))
    return hasher.hexdigest()


def load_docs(manifest_path: str) -> List[Dict[str, Any]]:
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("docs", [])
    return []


def build_index(docs: List[Dict[str, Any]]) -> Dict[str, Any]:
    now = datetime.datetime.utcnow().isoformat() + "Z"
    indexed: List[Dict[str, Any]] = []
    for d in docs:
        doc = dict(d)
        if "checksum" not in doc:
            doc["checksum"] = "sha256:" + checksum_of_url(doc.get("url", ""))
        indexed.append(doc)
    # stable ordering by id then url
    indexed.sort(key=lambda x: (x.get("id", ""), x.get("url", "")))
    return {
        "Cursor Index": {
            "generated_at": now,
            "version": "1.0.0",
            "source": "Rhino Developer Docs",
            "docs": indexed,
        }
    }


def main(output_path: str = OUTPUT_PATH) -> None:
    docs = load_docs(MANIFEST_PATH)
    index = build_index(docs)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, sort_keys=True)
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
