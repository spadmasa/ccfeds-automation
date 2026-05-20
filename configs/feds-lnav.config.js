// @ts-check
// Playwright config for FEDs LNav tests.
//
// Layout breakpoint hierarchy:
//   Phone portrait  (393–480px wide)   → mobile layout   → feds-lnav-devices.test.js
//   Phone landscape / iPad portrait    → tablet layout   → feds-lnav-devices.test.js
//   iPad landscape  / Desktop          → desktop layout  → feds-lnav.test.js
//
// Projects: Desktop Chrome, Firefox, Safari | iPhone 15, Galaxy S24 (portrait + landscape)
//           iPad Pro 11 portrait | iPad Pro 11 landscape (= desktop layout)

const { devices } = require('@playwright/test');

const config = {
  testDir: '../tests/feds/feds-lnav',
  outputDir: '../test-results',
  globalSetup: '../global.setup.js',
  timeout: 90 * 1000,
  expect: { timeout: 3000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 6,

  // Local reporter strategy:
  //   default               → list + base-reporter only (fast exit, no HTML build).
  //   HTML_REPORT=1 env var → also build the HTML dashboard; opens it only on failure.
  // The HTML report build adds ~10-20s of post-test work, so make it opt-in.
  reporter: process.env.CI
    ? [
        ['allure-playwright', { detail: true, outputFolder: 'allure-results', suiteTitle: true }],
        ['github'],
        ['../utils/reporters/json-reporter.js'],
      ]
    : process.env.HTML_REPORT
      ? [
          ['html', { outputFolder: 'test-html-results', open: 'on-failure' }],
          ['list'],
          ['../utils/reporters/base-reporter.js'],
        ]
      : [
          ['list'],
          ['../utils/reporters/base-reporter.js'],
        ],

  use: {
    actionTimeout: 90000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: process.env.BASE_URL || 'https://main--upp--adobecom.aem.live',
  },

  projects: [
    // ── Desktop ────────────────────────────────────────────────────────────
    {
      name: 'feds-lnav-chrome',
      use: { ...devices['Desktop Chrome'] },
      retries: 0,
    },
    {
      name: 'feds-lnav-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'feds-lnav-webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // ── Mobile ─────────────────────────────────────────────────────────────
    {
      name: 'feds-lnav-iphone',
      use: {
        ...devices['iPhone 15'],
        viewport: { width: 393, height: 659 },
        isMobile: true,
      },
    },
    {
      name: 'feds-lnav-android',
      use: {
        ...devices['Galaxy S24'],
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 '
          + '(KHTML, like Gecko) Chrome/139.0.7258.31 Mobile Safari/537.36',
        viewport: { width: 480, height: 1040 },
        isMobile: true,
      },
    },

    // ── Mobile landscape ───────────────────────────────────────────────────
    // Swap portrait dimensions. Same user-agents as portrait counterparts.
    // CTA renders as a compact pill (not full-width) at this viewport width.
    {
      name: 'feds-lnav-iphone-landscape',
      use: {
        ...devices['iPhone 15 landscape'],
        viewport: { width: 659, height: 393 },
        isMobile: true,
      },
    },
    {
      name: 'feds-lnav-android-landscape',
      use: {
        ...devices['Galaxy S24'],
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 '
          + '(KHTML, like Gecko) Chrome/139.0.7258.31 Mobile Safari/537.36',
        viewport: { width: 480, height: 1040 },
        isMobile: true,
      },
    },

    // ── Tablet portrait — same layout as phone landscape ──────────────────
    // 820px: below the 1023px CSS breakpoint so feds-localnav-bar is visible
    {
      name: 'feds-lnav-ipad',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 820, height: 1180 },
        isMobile: true,
      },
    },

    // ── Tablet landscape — same layout as desktop, run feds-lnav.test.js ──
    {
      name: 'feds-lnav-ipad-landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
        viewport: { width: 1366, height: 1024 },
        isMobile: true,
      },
    },
  ],
};

export default config;
