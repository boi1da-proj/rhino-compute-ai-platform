#!/usr/bin/env python3
import os
import sys
import argparse

DEFAULT_REQUIRED = [
    "RHINO_CLOUDZOO_EMAIL",
    "RHINO_CLOUDZOO_PW",
    "OTEL_EXPORTER_OTLP_ENDPOINT",
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Fail if required env vars are missing (names only).")
    parser.add_argument("--require", nargs="*", default=None, help="Required env var names.")
    parser.add_argument("--allow-missing", nargs="*", default=[], help="Treat these names as optional.")
    parser.add_argument("--print-ok", action="store_true")
    args = parser.parse_args()

    required = args.require if args.require is not None else DEFAULT_REQUIRED
    required = [name for name in required if name not in (args.allow_missing or [])]

    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        sys.stderr.write("Missing required env vars:\n")
        for name in missing:
            sys.stderr.write(f"  - {name}\n")
        return 2

    if args.print_ok:
        print("All required secrets present.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
