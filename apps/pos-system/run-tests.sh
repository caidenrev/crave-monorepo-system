#!/usr/bin/env bash
# ============================================================================
# CRAVE POS — QA TEST RUNNER
# ============================================================================
# Script ini menjalankan seluruh test suite Crave POS dengan output berwarna
# dan ringkasan akhir. Bisa dijalankan dari root project atau folder pos-system.
#
# Penggunaan:
#   ./run-tests.sh                # jalankan semua test (unit + lint + e2e)
#   ./run-tests.sh --unit         # hanya unit test (Vitest)
#   ./run-tests.sh --e2e          # hanya E2E test (Playwright)
#   ./run-tests.sh --lint         # hanya ESLint
#   ./run-tests.sh --coverage     # unit test + laporan coverage
#   ./run-tests.sh --watch        # unit test dalam mode watch
#   ./run-tests.sh --install      # install dependencies test saja
# ============================================================================

set -euo pipefail

# --- Konfigurasi ------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POS_DIR="$SCRIPT_DIR"

# Jika script ada di root, arahkan ke pos-system
if [ -d "$SCRIPT_DIR/apps/pos-system" ]; then
  POS_DIR="$SCRIPT_DIR/apps/pos-system"
fi

cd "$POS_DIR"

# --- Warna ------------------------------------------------------------------
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' DIM='' RESET=''
fi

# --- Helper -----------------------------------------------------------------
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
RESULTS=()

timestamp() { date +"%H:%M:%S"; }

print_header() {
  local title="$1"
  echo ""
  echo -e "${CYAN}${BOLD}────────────────────────────────────────────────────────────────${RESET}"
  echo -e "${CYAN}${BOLD}  $title${RESET}"
  echo -e "${CYAN}${BOLD}────────────────────────────────────────────────────────────────${RESET}"
  echo ""
}

print_step() {
  echo -e "${BLUE}[$(timestamp)]${RESET} ${BOLD}$1${RESET}"
}

print_pass() {
  local name="$1"
  local detail="${2:-}"
  echo -e "${GREEN}  [PASS]${RESET} $name ${DIM}$detail${RESET}"
  PASS_COUNT=$((PASS_COUNT + 1))
  RESULTS+=("${GREEN}[PASS]${RESET} $name")
}

print_fail() {
  local name="$1"
  local detail="${2:-}"
  echo -e "${RED}  [FAIL]${RESET} $name ${DIM}$detail${RESET}"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  RESULTS+=("${RED}[FAIL]${RESET} $name")
}

print_skip() {
  local name="$1"
  local reason="${2:-}"
  echo -e "${YELLOW}  [SKIP]${RESET} $name ${DIM}$reason${RESET}"
  SKIP_COUNT=$((SKIP_COUNT + 1))
  RESULTS+=("${YELLOW}[SKIP]${RESET} $name")
}

print_summary() {
  echo ""
  echo -e "${CYAN}${BOLD}────────────────────────────────────────────────────────────────${RESET}"
  echo -e "${CYAN}${BOLD}  RINGKASAN HASIL TEST${RESET}"
  echo -e "${CYAN}${BOLD}────────────────────────────────────────────────────────────────${RESET}"
  echo ""

  for r in "${RESULTS[@]}"; do
    echo -e "  $r"
  done

  echo ""
  echo -e "  ${BOLD}Total : $((PASS_COUNT + FAIL_COUNT + SKIP_COUNT))${RESET}"
  echo -e "  ${GREEN}${BOLD}PASS  : $PASS_COUNT${RESET}"
  if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "  ${RED}${BOLD}FAIL  : $FAIL_COUNT${RESET}"
  else
    echo -e "  ${RED}FAIL  : $FAIL_COUNT${RESET}"
  fi
  if [ "$SKIP_COUNT" -gt 0 ]; then
    echo -e "  ${YELLOW}${BOLD}SKIP  : $SKIP_COUNT${RESET}"
  else
    echo -e "  ${YELLOW}SKIP  : $SKIP_COUNT${RESET}"
  fi
  echo ""
}

check_dependency() {
  local cmd="$1"
  local label="$2"
  if command -v "$cmd" &>/dev/null; then
    return 0
  else
    echo -e "${RED}[ERROR]${RESET} $label ($cmd) tidak ditemukan. Jalankan: ./run-tests.sh --install"
    return 1
  fi
}

# --- Argumen ----------------------------------------------------------------
MODE="all"
for arg in "$@"; do
  case "$arg" in
    --unit)     MODE="unit" ;;
    --e2e)      MODE="e2e" ;;
    --lint)     MODE="lint" ;;
    --coverage) MODE="coverage" ;;
    --watch)    MODE="watch" ;;
    --install)  MODE="install" ;;
    --all)      MODE="all" ;;
    -h|--help)
      echo "Crave POS — QA Test Runner"
      echo ""
      echo "Penggunaan: ./run-tests.sh [OPTION]"
      echo ""
      echo "Options:"
      echo "  (tanpa arg)  Jalankan semua test (lint + unit + e2e)"
      echo "  --unit       Hanya unit test (Vitest)"
      echo "  --e2e        Hanya E2E test (Playwright)"
      echo "  --lint       Hanya ESLint"
      echo "  --coverage   Unit test + laporan coverage"
      echo "  --watch      Unit test mode watch (interaktif)"
      echo "  --install    Install dependencies test"
      echo "  --help       Tampilkan bantuan ini"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}[ERROR]${RESET} Argumen tidak dikenal: $arg"
      echo "Jalankan: ./run-tests.sh --help"
      exit 1
      ;;
  esac
done

# --- Mode: Install ----------------------------------------------------------
if [ "$MODE" = "install" ]; then
  print_header "INSTALL TEST DEPENDENCIES"
  print_step "Menginstall devDependencies (vitest, playwright, testing-library)..."

  npm install --save-dev \
    vitest@^3 \
    @vitest/coverage-v8@^3 \
    @testing-library/react@^16 \
    @testing-library/jest-dom@^6 \
    @testing-library/user-event@^14 \
    jsdom@^25 \
    @playwright/test@^1.49 \
    @vitejs/plugin-react@^5 2>&1 | tail -5

  print_step "Menginstall browser Playwright..."
  npx playwright install chromium 2>&1 | tail -3

  print_pass "Install dependencies selesai"
  print_summary
  exit 0
fi

# --- Mode: Watch ------------------------------------------------------------
if [ "$MODE" = "watch" ]; then
  print_header "UNIT TEST — WATCH MODE"
  print_step "Menjalankan Vitest dalam mode interaktif..."
  echo -e "${DIM}Tekan 'q' untuk keluar, 'a' untuk run all, 'f' untuk filter${RESET}"
  echo ""
  npx vitest --watch
  exit 0
fi

# --- Pre-flight check -------------------------------------------------------
print_header "CRAVE POS — QA TEST RUNNER"
print_step "Working directory: $POS_DIR"
print_step "Mode: $MODE"
echo ""

if [ ! -f "package.json" ]; then
  echo -e "${RED}[ERROR]${RESET} package.json tidak ditemukan di $POS_DIR"
  exit 1
fi

# Cek node_modules
if [ ! -d "node_modules" ]; then
  print_step "node_modules belum ada — menjalankan npm install..."
  npm install 2>&1 | tail -3
fi

# --- Mode: Lint -------------------------------------------------------------
if [ "$MODE" = "lint" ] || [ "$MODE" = "all" ]; then
  print_header "ESLINT — STATIC CODE ANALYSIS"

  if ! check_dependency npx "npx (Node.js)"; then
    print_fail "ESLint" "npx tidak tersedia"
  elif [ -f "eslint.config.js" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    print_step "Menjalankan ESLint..."
    echo ""
    if npx eslint . --max-warnings=0 2>&1; then
      print_pass "ESLint — no errors"
    else
      print_fail "ESLint" "ada error/warning"
    fi
    echo ""
  else
    print_skip "ESLint" "config tidak ditemukan"
  fi
fi

# --- Mode: Unit Test --------------------------------------------------------
if [ "$MODE" = "unit" ] || [ "$MODE" = "coverage" ] || [ "$MODE" = "all" ]; then
  print_header "UNIT TEST — VITEST"

  if ! check_dependency npx "npx (Node.js)"; then
    print_fail "Unit Test" "npx tidak tersedia"
  elif [ ! -f "vitest.config.ts" ]; then
    print_fail "Unit Test" "vitest.config.ts tidak ditemukan"
  else
    print_step "Menjalankan Vitest..."
    echo ""
    if [ "$MODE" = "coverage" ]; then
      if npx vitest run --coverage 2>&1; then
        print_pass "Unit Test — semua test lulus"
      else
        print_fail "Unit Test" "ada test yang gagal"
      fi
    else
      if npx vitest run 2>&1; then
        print_pass "Unit Test — semua test lulus"
      else
        print_fail "Unit Test" "ada test yang gagal"
      fi
    fi
    echo ""
  fi
fi

# --- Mode: E2E --------------------------------------------------------------
if [ "$MODE" = "e2e" ] || [ "$MODE" = "all" ]; then
  print_header "E2E TEST — PLAYWRIGHT"

  if ! check_dependency npx "npx (Node.js)"; then
    print_fail "E2E Test" "npx tidak tersedia"
  elif [ ! -f "playwright.config.ts" ]; then
    print_fail "E2E Test" "playwright.config.ts tidak ditemukan"
  else
    # Cek browser sudah ter-install
    BROWSER_DIR="$HOME/.cache/ms-playwright"
    if [ ! -d "$BROWSER_DIR" ]; then
      print_step "Browser Playwright belum ter-install — menginstall chromium..."
      npx playwright install chromium 2>&1 | tail -3
    fi

    print_step "Menjalankan Playwright..."
    echo ""

    # Playwright butuh dev server. Cek apakah sudah berjalan.
    if curl -s http://localhost:8081 --max-time 3 >/dev/null 2>&1; then
      print_step "Dev server sudah berjalan di :8081"
      if npx playwright test 2>&1; then
        print_pass "E2E Test — semua test lulus"
      else
        print_fail "E2E Test" "ada test yang gagal"
      fi
    else
      print_step "Dev server belum berjalan — Playwright akan start otomatis"
      if npx playwright test 2>&1; then
        print_pass "E2E Test — semua test lulus"
      else
        print_fail "E2E Test" "ada test yang gagal atau dev server bermasalah"
      fi
    fi
    echo ""
  fi
fi

# --- Ringkasan --------------------------------------------------------------
print_summary

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo -e "${RED}${BOLD}TEST SUITE GAGAL — ada $FAIL_COUNT failure(s)${RESET}"
  exit 1
else
  echo -e "${GREEN}${BOLD}TEST SUITE BERHASIL — semua test lulus${RESET}"
  exit 0
fi
