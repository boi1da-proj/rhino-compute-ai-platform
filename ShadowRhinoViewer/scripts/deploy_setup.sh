#!/usr/bin/env bash
set -euo pipefail
CFG="${1:-cfg/config.json}"
URL=$(jq -r '.ComputeUrl' "$CFG"); BASE="${URL%/grasshopper}"
curl -fsS -H "RhinoComputeKey: $(jq -r '.ApiKey' "$CFG")" \
     -H "Authorization: Bearer $(jq -r '.AuthToken' "$CFG")" \
     "$BASE/version" >/dev/null && echo "[ok] Compute reachable"
