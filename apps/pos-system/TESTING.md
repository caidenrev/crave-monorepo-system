# Crave POS — QA Testing Guide

> Dokumentasi lengkap command untuk menjalankan test Crave POS System.

---

## Struktur File Test

```
canvas-chime-creation/
├── test.sh                          # Entry point (root)
└── apps/
    └── pos-system/
        ├── run-tests.sh             # Script utama QA runner
        ├── vitest.config.ts         # Config Vitest (unit test)
        ├── playwright.config.ts     # Config Playwright (E2E test)
        ├── package.json             # Scripts & dependencies
        ├── src/
        │   └── __tests__/
        │   ├── setup.ts                    # Setup global test env
        │   ├── payment-guard.test.ts       # P0 — anti fake PAID
        │   ├── pendingCheckout.test.ts     # P0 — transaksi tidak hilang
        │   ├── pos-data.test.ts            # P0 — format rupiah & data
        │   ├── useTransactions.test.ts     # P0 — UUID transaksi
        │   ├── useCart.test.ts             # P0 — cart localStorage logic
        │   ├── receipt.test.ts             # P1 — struk 58mm/80mm
        │   └── paymentgt-service.test.ts   # P1 — gateway fetch mock
        └── e2e/
            ├── auth-flow.spec.ts     # E2E — login, register, PIN
            └── kasir.spec.ts         # E2E — kasir UI, cart
```

---

## Prasyarat

### 1. Install Node.js

Pastikan Node.js v20+ terinstall:

```bash
node --version
```

### 2. Install Dependencies

**Path:** `apps/pos-system/`

```bash
cd /d/canvas-chime-creation/apps/pos-system
npm install
```

### 3. Install Browser Playwright

**Path:** `apps/pos-system/`

```bash
npx playwright install chromium
```

---

## Command Lengkap

> **Semua command dijalankan dari directory:** `/d/canvas-chime-creation/apps/pos-system`
> kecuali yang ditandai lain.

### A. Unit Test — Vitest

#### Run semua unit test (verbose output)

**Path:** `apps/pos-system/`

```bash
npx vitest run --reporter=verbose
```

#### Run unit test tanpa verbose

```bash
npx vitest run
```

#### Run unit test + laporan coverage

```bash
npx vitest run --coverage
```

#### Watch mode (auto-rebuild saat file berubah)

```bash
npx vitest --watch
```

#### Run file test tertentu

```bash
# P0 — Payment Guard (anti fake PAID)
npx vitest run src/__tests__/payment-guard.test.ts

# P0 — Pending Checkout (transaksi tidak hilang saat refresh)
npx vitest run src/__tests__/pendingCheckout.test.ts

# P0 — POS Data (format rupiah, validasi produk)
npx vitest run src/__tests__/pos-data.test.ts

# P0 — Transactions (UUID v4 generator)
npx vitest run src/__tests__/useTransactions.test.ts

# P0 — Cart (localStorage read/write/validate)
npx vitest run src/__tests__/useCart.test.ts

# P1 — Receipt (struk HTML 58mm & 80mm, XSS escape)
npx vitest run src/__tests__/receipt.test.ts

# P1 — PaymentGT Service (fetch mock, URL composition, error handling)
npx vitest run src/__tests__/paymentgt-service.test.ts
```

#### Run dengan filter nama test

```bash
# Hanya test yang mengandung "stale" di nama
npx vitest run -t "stale"

# Hanya test yang mengandung "rupiah" di nama
npx vitest run -t "rupiah"
```

---

### B. ESLint — Static Analysis

#### Run ESLint

**Path:** `apps/pos-system/`

```bash
npx eslint . --max-warnings=0
```

#### Run ESLint dengan auto-fix

```bash
npx eslint . --fix
```

#### Run ESLint hanya untuk folder tertentu

```bash
npx eslint src/lib/
npx eslint src/__tests__/
npx eslint e2e/
```

---

### C. E2E Test — Playwright

#### Run semua E2E test

**Path:** `apps/pos-system/`

```bash
npx playwright test --reporter=list
```

#### Run dengan output detail

```bash
npx playwright test --reporter=line
```

#### Run dengan UI mode (interaktif, bisa lihat browser)

```bash
npx playwright test --ui
```

#### Run dengan headed mode (browser terlihat)

```bash
npx playwright test --headed
```

#### Run test file tertentu

```bash
# E2E — Auth flow (login, register, PIN, redirect)
npx playwright test e2e/auth-flow.spec.ts

# E2E — Kasir UI (search, cart, checkout)
npx playwright test e2e/kasir.spec.ts
```

#### Run dengan screenshot & video saat gagal

```bash
npx playwright test --trace=on-first-retry --video=retain-on-failure
```

#### Debug mode (pause di setiap step)

```bash
npx playwright test --debug
```

---

### D. Script Bash — All-in-One Runner

#### Dari folder pos-system

**Path:** `apps/pos-system/`

```bash
chmod +x run-tests.sh

# Jalankan semua test (lint + unit + e2e)
./run-tests.sh

# Hanya unit test
./run-tests.sh --unit

# Hanya E2E test
./run-tests.sh --e2e

# Hanya ESLint
./run-tests.sh --lint

# Unit test + coverage
./run-tests.sh --coverage

# Watch mode
./run-tests.sh --watch

# Install dependencies test
./run-tests.sh --install

# Bantuan
./run-tests.sh --help
```

#### Dari root project

**Path:** `/d/canvas-chime-creation/`

```bash
chmod +x test.sh

./test.sh              # semua test
./test.sh --unit       # hanya unit
./test.sh --e2e        # hanya e2e
./test.sh --lint       # hanya lint
./test.sh --coverage   # coverage
```

---

### E. NPM Scripts

**Path:** `apps/pos-system/`

```bash
npm run test              # semua test (lint + unit + e2e)
npm run test:unit        # hanya unit test
npm run test:e2e         # hanya e2e test
npm run test:lint        # hanya eslint
npm run test:coverage    # unit test + coverage
npm run test:watch       # watch mode
npm run test:install     # install deps test

npm run vitest           # = vitest run
npm run vitest:watch     # = vitest --watch
npm run playwright       # = playwright test
npm run playwright:ui    # = playwright test --ui
```

---

## Urutan Rekomendasi Testing

```bash
# 1. Install dulu (sekali saja)
cd /d/canvas-chime-creation/apps/pos-system
./run-tests.sh --install

# 2. Lint — cek code quality
./run-tests.sh --lint

# 3. Unit test — cek logic
./run-tests.sh --unit

# 4. E2E — cek end-to-end flow
./run-tests.sh --e2e

# atau sekali jalan semua:
./run-tests.sh
```

---

## Daftar Test & Yang Diuji

| File Test | Prioritas | Yang Diuji |
|---|---|---|
| `payment-guard.test.ts` | **P0** | Anti fake PAID: stale, ambiguous, tx_id reuse, paid_at validation |
| `pendingCheckout.test.ts` | **P0** | localStorage read/write/clear, data rusak, per-user isolation |
| `pos-data.test.ts` | **P0** | Format rupiah, validasi 12 produk, stok di bawah minimum |
| `useTransactions.test.ts` | **P0** | UUID v4 format, uniqueness, version & variant byte |
| `useCart.test.ts` | **P0** | Cart read/write, filter invalid lines, per-user isolation, validator |
| `receipt.test.ts` | **P1** | Struk 58mm/80mm, XSS escape, nama kasir/pelanggan, total qty, pajak |
| `paymentgt-service.test.ts` | **P1** | URL composition, POST/GET method, error handling, health check |
| `e2e/auth-flow.spec.ts` | **P1** | Login form, register toggle, protected route redirect, dashboard |
| `e2e/kasir.spec.ts` | **P2** | Search produk, add to cart, cart display |

---

## Troubleshooting

### `bash: run-tests.sh: command not found`

```bash
chmod +x run-tests.sh
./run-tests.sh
```

### `npx vitest: command not found`

```bash
npm install
npx vitest run
```

### `Playwright browser not installed`

```bash
npx playwright install chromium
```

### `E2E: dev server not starting`

Jalankan dev server secara manual di terminal terpisah:

```bash
cd /d/canvas-chime-creation/apps/pos-system
npm run dev
```

Lalu jalankan Playwright:

```bash
npx playwright test
```

### `Permission denied` saat `./run-tests.sh`

```bash
chmod +x run-tests.sh
# atau langsung pakai bash
bash run-tests.sh
```
