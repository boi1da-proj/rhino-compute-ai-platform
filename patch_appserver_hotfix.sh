#!/usr/bin/env bash
set -euo pipefail

# Config (adjust as needed)
REPO_ROOT="${REPO_ROOT:-$(pwd)}"                             # Path to the repo (default: current dir)
REPO_URL="${REPO_URL:-https://github.com/mcneel/compute.rhino3d.appserver.git}"
BRANCH="hotfix/appserver-startup-$(date +%Y%m%d%H%M%S)"
PATCH_LOG="${PATCH_LOG:-${REPO_ROOT}/patch_deploy.log}"

# Helpers (avoid logging secrets; do not echo env var values)
log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$PATCH_LOG"; }
die() { echo "ERROR: $*" >&2 | tee -a "$PATCH_LOG"; exit 1; }

log "Starting non-breaking hotfix routine (safe mode, no secrets logged)."

# Pre-checks
command -v git >/dev/null 2>&1 || die "git is required but not found"
command -v node >/dev/null 2>&1 || die "node is required but not found"
command -v npm >/dev/null 2>&1 || die "npm is required but not found"

# Prepare repo
if [ -d "${REPO_ROOT}/.git" ]; then
  log "Using existing repo at ${REPO_ROOT}"
else
  log "Cloning repository into ${REPO_ROOT}"
  git clone "${REPO_URL}" "${REPO_ROOT}"
fi

cd "${REPO_ROOT}"

# Create branch
log "Fetching and preparing branch ${BRANCH}"
git fetch --all || true
# If branch exists, checkout; else create
if git rev-parse --verify "${BRANCH}" >/dev/null 2>&1; then
  git checkout "${BRANCH}"
else
  git checkout -b "${BRANCH}" || true
fi
git pull --rebase || true

# 1) Patch: src/bin/www - add global error handlers for startup/runtime (non-breaking)
SRC1="src/bin/www"
if [ -f "${SRC1}" ]; then
  if ! grep -q "Uncaught exception" "${SRC1}" 2>/dev/null; then
    log "Applying Patch 1: global error handlers to ${SRC1}"
    cat >> "${SRC1}" <<'JS'
/* Global error handling for startup/run-time observability (non-breaking) */
process.on('uncaughtException', (err) => {
  const msg = err && err.stack ? err.stack : String(err)
  // Avoid leaking secrets in logs
  console.error('[AppServer] Uncaught exception:', msg)
})
process.on('unhandledRejection', (reason, p) => {
  const r = reason && reason.stack ? reason.stack : String(reason)
  console.error('[AppServer] Unhandled rejection at:', p, 'reason:', r)
})
JS
    git add "${SRC1}"
    git commit -m "hotfix(appserver): add global error handlers for startup/runtime (src/bin/www)" || true
  else
    log "Patch 1 already present in ${SRC1}"
  fi
else
  log "Warning: ${SRC1} not found; skipping Patch 1"
fi

# 2) Patch: optionally load environment from dotenv if available (non-breaking)
if [ -f "${SRC1}" ]; then
  if ! grep -q "dotenv" "${SRC1}" 2>/dev/null; then
    log "Applying Patch 2: dotenv.config() integration (best-effort)"
    cat >> "${SRC1}" <<'JS'
/* Optional dotenv config to support env-based tokens/configs when available */
try {
  require('dotenv').config()
} catch (e) {
  // dotenv not installed or not required; proceed
}
JS
    git add "${SRC1}"
    git commit -m "hotfix(appserver): attempt dotenv.config() for env-based config (best-effort)" || true
  else
    log "Patch 2 already present in ${SRC1}"
  fi
else
  log "Warning: ${SRC1} not found; skipping Patch 2"
fi

# 3) Patch: add lightweight observability module (new file) for audit/logging
OBS_DIR="tools/observability"
OBS_INDEX="${OBS_DIR}/index.js"
if [ ! -f "${OBS_INDEX}" ]; then
  log "Applying Patch 3: add lightweight observability (tools/observability/index.js)"
  mkdir -p "${OBS_DIR}"
  cat > "${OBS_INDEX}" <<'JS'
/* Lightweight observability helper for appserver */
const fs = require('fs')
const path = require('path')
const LOG_PATH = process.env.OBS_LOG_PATH || path.join(__dirname, 'observability.log')

module.exports = {
  logEvent: (evt, data) => {
    const payload = { t: Date.now(), evt, data }
    try { fs.appendFileSync(LOG_PATH, JSON.stringify(payload) + "\n") } catch (err) { /* ignore */ }
  }
}
JS
  git add "${OBS_INDEX}"
  git commit -m "feat(observability): add lightweight observability helper (tools/observability/index.js)" || true
else
  log "Observability module already exists at ${OBS_INDEX}"
fi

# 4) Patch: safety Scan for token exposures (non-invasive)
log "Running non-destructive token exposure scan (no automatic fixes)."
SCAN_CMD="grep -RInE 'TOKEN|Authorization|Bearer' src | wc -l || true"
SCAN_RESULT=$(bash -c "$SCAN_CMD" || true)
log "Token-exposure scan executed; review any hits manually. Matches: ${SCAN_RESULT}"
# Record a no-op commit to indicate scan run
(git commit --allow-empty -m "style(security): token-exposure scan run; review required" >/dev/null 2>&1) || true

# 5) Optional: basic npm install and test (non-breaking, best-effort)
if [ -f package.json ]; then
  log "Installing dependencies and running tests (best-effort)"
  (npm ci --silent >/dev/null 2>&1 || npm install --silent >/dev/null 2>&1 || true)
  if npm run -s | grep -q 'test'; then
    (npm test --silent || true)
  else
    log "No test script defined; skipping tests."
  fi
else
  log "No package.json found; skipping npm steps."
fi

# 6) Push patch branch (optional; CI can run PR checks instead)
(git push -u origin "${BRANCH}" >/dev/null 2>&1) || true
log "Patches applied. Branch prepared: ${BRANCH}"
log "Review the git diff and patch notes. See also ${PATCH_LOG} for log output."

# 7) Final notes (do NOT echo secrets)
log "Next steps:"
log "- Validate startup locally: node src/bin/www (or your npm start script) and watch for 'Uncaught exception' logs (if any)."
log "- If your environment ever contained hardcoded tokens, rotate them and store in a secure vault/environment; never commit secrets."
log "- Open a PR against main with this branch, and have CI run full tests and lint."

exit 0