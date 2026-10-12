#!/usr/bin/env bash
# ============================================================================
# CRAVE POS — QA TEST RUNNER (ROOT ENTRY POINT)
# ============================================================================
# Wrapper untuk run-tests.sh di apps/pos-system
# Penggunaan:
#   ./test.sh                 # semua test
#   ./test.sh --unit          # hanya unit test
#   ./test.sh --e2e           # hanya E2E
#   ./test.sh --lint          # hanya lint
#   ./test.sh --coverage      # unit + coverage
#   ./test.sh --watch         # watch mode
#   ./test.sh --install       # install deps
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POS_DIR="$SCRIPT_DIR/apps/pos-system"

if [ ! -f "$POS_DIR/run-tests.sh" ]; then
  echo -e "\033[0;31m[ERROR]\033[0m run-tests.sh tidak ditemukan di $POS_DIR"
  exit 1
fi

exec bash "$POS_DIR/run-tests.sh" "$@"
