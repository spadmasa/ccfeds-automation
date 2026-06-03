// @ts-check
// ─── CENTRALISED FEDS CONFIG — DO NOT MODIFY ─────────────────────────────────
// Single config for ALL feds test suites: feds, feds-lnav, site-redesign, etc.
// ✅ RUN SUBSETS via --project + test path (no code changes):
//   All feds:      npx playwright test --config=configs/feds.config.js
//   LNav only:     npx playwright test tests/feds/feds-lnav/ --config=configs/feds.config.js --project=feds-chrome --project=feds-ipad
//   Redesign only: npx playwright test tests/feds/site-redesign.test.js --config=configs/feds.config.js --project=feds-chrome
//   Mobile only:   npx playwright test --config=configs/feds.config.js --project=feds-iphone --project=feds-android
//
// ✅ VIEWPORT OVERRIDES per feature — use test.use() in the test file, not here:
//   test.use({ viewport: { width: 820, height: 1180 } }); // inside your test file
// ─────────────────────────────────────────────────────────────────────────────

const { devices } = require('@playwright/test');

const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 '
                 + '(KHTML, like Gecko) Chrome/139.0.7258.31 Mobile Safari/537.36';
const IPHONE_UA  = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) '
                 + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const config = {
  testDir: '../tests/feds',
  outputDir: '../test-results',
  globalSetup: '../global.setup.js',
  timeout: (process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 90) * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : (process.env.WORKERS ? parseInt(process.env.WORKERS) : 6),

  reporter: process.env.CI
    ? [
        ['allure-playwright', { detail: true, outputFolder: 'allure-results', suiteTitle: true }],
        ['github'],
        ['../utils/reporters/json-reporter.js'],
      ]
    : process.env.HTML_REPORT
      ? [['html', { outputFolder: 'test-html-results', open: 'on-failure' }], ['list'], ['../utils/reporters/base-reporter.js']]
      : [['list'], ['../utils/reporters/base-reporter.js']],

  use: {
    actionTimeout: (process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 90) * 1000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: process.env.BASE_URL || 'https://www.adobe.com',
  },

  projects: [
    // ─────────────────────────────────────────────────────────────────────────
    // DESKTOP — use site-redesign.test.js
    // ─────────────────────────────────────────────────────────────────────────
    { name: 'feds-chrome',  use: { ...devices['Desktop Chrome'] },  retries: 0 },
    { name: 'feds-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'feds-webkit',  use: { ...devices['Desktop Safari'] } },

    // ─────────────────────────────────────────────────────────────────────────
    // MOBILE PORTRAIT — iPhone 15 (393×852) | Galaxy S24 (360×780)
    // Hamburger nav → use site-redesign-devices.test.js
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'feds-iphone',           // iPhone 15 portrait  — 393×852
      use: { ...devices['iPhone 15'], userAgent: IPHONE_UA, isMobile: true },
    },
    {
      name: 'feds-android',          // Galaxy S24 portrait — 360×780
      use: { ...devices['Galaxy S24'], userAgent: ANDROID_UA, isMobile: true },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // MOBILE LANDSCAPE — iPhone 15 (852×393) | Galaxy S24 (780×360)
    // Hamburger nav → use site-redesign-devices.test.js
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'feds-iphone-landscape', // iPhone 15 landscape — 852×393
      use: { ...devices['iPhone 15 landscape'], userAgent: IPHONE_UA, isMobile: true },
    },
    {
      name: 'feds-android-landscape', // Galaxy S24 landscape — 780×360
      use: { ...devices['Galaxy S24 landscape'], userAgent: ANDROID_UA, isMobile: true },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TABLET PORTRAIT — iPad Air (820×1180)
    // Hamburger nav → use site-redesign-devices.test.js
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'feds-ipad-air-portrait', // iPad Air portrait — 820×1180
      use: { viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TABLET LANDSCAPE — iPad Air (1180×820)
    // Desktop nav → use site-redesign.test.js
    // ─────────────────────────────────────────────────────────────────────────
    {
      name: 'feds-ipad-air-landscape', // iPad Air landscape — 1180×820
      use: { viewport: { width: 1180, height: 820 }, isMobile: true, hasTouch: true },
    },
  ],
};

export default config;
