#!/usr/bin/env python3
import json
import sys
from pathlib import Path


def main() -> int:
    i18n_dir = Path("i18n")
    files = sorted(i18n_dir.glob("strings.*.json"))
    if not files:
        print("No i18n files found.")
        return 0

    keysets = {}
    for f in files:
        with f.open("r", encoding="utf-8") as h:
            data = json.load(h)
            keysets[f.name] = set(data.keys())

    baseline_name = files[0].name
    baseline_keys = keysets[baseline_name]
    ok = True

    for name, keys in keysets.items():
        missing = baseline_keys - keys
        extra = keys - baseline_keys
        if missing:
            print(f"{name}: missing keys: {sorted(missing)}")
            ok = False
        if extra:
            print(f"{name}: extra keys: {sorted(extra)}")
            ok = False

    if not ok:
        print("Localization parity check failed.")
        return 1
    print("Localization parity check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
