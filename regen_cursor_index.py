#!/usr/bin/env python3
import json
import hashlib
import datetime
import os
import argparse
import urllib.request
import urllib.error
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Tuple, Optional, Set

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


def classify_url(url: str) -> Tuple[str, str]:
    # returns (category, language)
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception:
        return ("Docs", "en")
    path = (parsed.path or "/").lower()
    if "/api/rhinocommon" in path:
        return ("SDK", "en")
    if "/guides/grasshopper" in path or "/guides/grasshopper-sdk" in path:
        return ("SDK", "en")
    if "/guides/" in path:
        return ("Guides", "en")
    if "/rhinoinside" in parsed.netloc or "/rhinoinside" in path:
        return ("Interop", "en")
    if "/compute" in path:
        return ("Compute", "en")
    return ("Docs", "en")


def fetch(url: str, timeout: int = 15) -> Optional[bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": "cursor-index-bot/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except urllib.error.URLError:
        return None


def parse_sitemap(xml_bytes: bytes) -> List[Dict[str, Any]]:
    docs: List[Dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return docs
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    for url_el in root.findall("sm:url", ns):
        loc_el = url_el.find("sm:loc", ns)
        if loc_el is None or not (loc_el.text or "").strip():
            continue
        loc = loc_el.text.strip()
        lastmod_el = url_el.find("sm:lastmod", ns)
        lastmod = (lastmod_el.text.strip() if lastmod_el is not None and lastmod_el.text else None)
        cat, lang = classify_url(loc)
        docs.append(
            {
                "id": loc,  # use URL as id when crawling
                "title": None,
                "url": loc,
                "category": cat,
                "last_updated": lastmod or "",
                "language": lang,
                "version": "latest",
            }
        )
    return docs


def crawl_rhino_docs(sitemaps: List[str], timeout: int = 15) -> List[Dict[str, Any]]:
    aggregated: List[Dict[str, Any]] = []
    seen: Set[str] = set()
    for sm in sitemaps:
        payload = fetch(sm, timeout=timeout)
        if not payload:
            continue
        items = parse_sitemap(payload)
        for it in items:
            url = it.get("url") or ""
            if not url:
                continue
            # scope: only developer.rhino3d.com and rhinoinside.com
            host = urllib.parse.urlparse(url).netloc.lower()
            if host not in {"developer.rhino3d.com", "www.rhinoinside.com"}:
                continue
            if url in seen:
                continue
            seen.add(url)
            aggregated.append(it)
    return aggregated


def build_index(docs: List[Dict[str, Any]]) -> Dict[str, Any]:
    now = datetime.datetime.utcnow().isoformat() + "Z"
    indexed: List[Dict[str, Any]] = []
    for d in docs:
        doc = dict(d)
        if "checksum" not in doc:
            doc["checksum"] = "sha256:" + checksum_of_url(doc.get("url", ""))
        if not doc.get("category"):
            cat, lang = classify_url(doc.get("url", ""))
            doc["category"] = cat
            doc.setdefault("language", lang)
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate cursor_index.json from manifest and/or Rhino docs sitemap")
    parser.add_argument("--root", default=".")
    parser.add_argument("--index", default=OUTPUT_PATH)
    parser.add_argument("--manifest", default=MANIFEST_PATH)
    parser.add_argument("--crawl", action="store_true", help="Enable crawling Rhino developer sitemaps")
    parser.add_argument("--timeout", type=int, default=15)
    args = parser.parse_args()

    docs = load_docs(args.manifest)
    if args.crawl:
        # baseline sitemaps; can be extended later
        sitemaps = [
            "https://developer.rhino3d.com/sitemap.xml",
        ]
        crawled = crawl_rhino_docs(sitemaps, timeout=args.timeout)
        # Merge, preferring manifest entries for duplicates
        existing_urls = {d.get("url") for d in docs}
        docs.extend([d for d in crawled if d.get("url") not in existing_urls])

    index = build_index(docs)
    out_path = os.path.abspath(args.index)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, sort_keys=True)
    print(f"Wrote {out_path} with {len(index['Cursor Index']['docs'])} docs")


if __name__ == "__main__":
    main()
