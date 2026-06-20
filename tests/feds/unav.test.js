import { test, expect } from '@playwright/test';
import { features, UNAV_DEFAULT_PARAMS } from '../../features/feds/unav.spec.js';
import UnavPage from '../../selectors/feds/unav.page.js';

// ─────────────────────────────────────────────────────────────────────────────
// Environment
// ─────────────────────────────────────────────────────────────────────────────
const RAW_BASE     = process.env.BASE_URL || '';
const EXTRA_PARAMS = (process.env.BROWSER_PARAMS || UNAV_DEFAULT_PARAMS).replace(/^\?/, '');
const isSingleUrl  = /\.html|\.htm/.test(RAW_BASE);

// Expected UNav version:
//   Local → EXPECTED_UNAV_VERSION=1.6 npx playwright test ...
//   CI    → npx playwright test --grep "@unav1.6"
function parseExpectedVersion() {
  if (process.env.EXPECTED_UNAV_VERSION) return process.env.EXPECTED_UNAV_VERSION;
  const argMatch = process.argv.join(' ').match(/@unav-?v?([\d]+\.[\d]+)/);
  if (argMatch) return argMatch[1];
  // unavVersion=X.Y in BROWSER_PARAMS overrides the version loaded on the page — validate it automatically
  const paramMatch = EXTRA_PARAMS.match(/(?:^|&)unavVersion=([\d.]+)/);
  return paramMatch ? paramMatch[1] : null;
}
const EXPECTED_UNAV_VERSION = parseExpectedVersion();

// Build full URL: domain + spec path + optional query params.
// Uses URL object so hash fragments (#category=...) are preserved.
// subdomain: swap 'www' for another subdomain (e.g. 'helpx') while preserving stage/prod env.
function buildUrl(domain, specPath, subdomain = null) {
  const base = (subdomain ? domain.replace('//www.', `//${subdomain}.`) : domain).replace(/\/$/, '');
  const path = specPath.startsWith('/') ? specPath : `/${specPath}`;
  if (!EXTRA_PARAMS) return `${base}${path}`;
  const url = new URL(`${base}${path}`);
  for (const param of EXTRA_PARAMS.split('&')) {
    const [key, value = ''] = param.split('=');
    url.searchParams.set(key, value);
  }
  return url.toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// runChecks — runs all checks on a single page URL.
// Hard fails: page load, UNav JS/CSS/version — stop the test immediately.
// Soft fails: all remaining checks — caught individually so all run.
// At the end, if any soft checks failed the test is failed with a summary.
// ─────────────────────────────────────────────────────────────────────────────
async function runChecks(page, url, clientId, lang, expectedVersion, noAppSwitcher = false, slimFooter = false, marketSelector = false) {
  const unav     = new UnavPage(page);
  unav.noAppSwitcher  = noAppSwitcher;
  unav.slimFooter     = slimFooter;
  unav.marketSelector = marketSelector;
  const failures = []; // { name, detail }

  async function check(name, fn) {
    try {
      await test.step(name, fn);
    } catch (e) {
      const detail = e.message.split('\n').slice(0, 4).join(' | ').replace(/\s+/g, ' ').trim();
      failures.push({ name, detail });
    }
  }

  // ── Page load (hard fail — nothing else runs if this fails) ───────────────
  await test.step('Page load', async () => {
    await unav.goto(url);
  });

  // ── Locale redirect (hard fail — FR sub-locales must redirect to /fr/) ───
  await test.step('Locale | FR sub-locale redirects to /fr/', async () => {
    await unav.validateLocaleRedirect();
  });

  // ── UNav script + version (hard fail — if UNav didn't load or wrong version, stop here) ──
  await test.step('Network | UniversalNav JS + CSS loaded (version check)', async () => {
    await unav.validateUnavScript(expectedVersion);
  });

  // ── Network — parallel (read-only: networkResponses, no page-state changes) ─
  await Promise.all([
    check('Network | ArpService bundle loaded',               () => unav.validateArpService()),
    check('Network | Sherlock loaded',                        () => unav.validateSherlock()),
    check('Network | BFP script loaded + capture call fired', () => unav.validateBfp()),
  ]);

  // ── App switcher — sequential (opens/closes modal, changes page state) ────
  if (!noAppSwitcher) {
    await check('GNav | App switcher opens modal with links, closes', () => unav.validateAppSwitcher());
  }

  // ── GNav + Layout — parallel (read-only DOM, no page-state changes) ───────
  await Promise.all([
    check('GNav | Adobe logo visible with valid href',                       () => unav.validateAdobeLogo()),
    check('GNav | Sign In button visible',                                   () => unav.validateSignIn()),
    check('GNav | Nav items and links have valid hrefs',                     () => unav.validateNavItems()),
    check('GNav | Primary CTA has href (if present)',                        () => unav.validatePrimaryCta()),
    check('GNav | Secondary CTA has href (if present)',                      () => unav.validateSecondaryCta()),
    check('Layout | Elements visible, correct LTR/RTL order, fits viewport', () => unav.validateLayout()),
    check('Layout | GNav elements do not overlap',                           () => unav.validateGNavOverlap()),
  ]);

  // ── Footer — sequential (scrolls page to footer) ──────────────────────────
  await check('Footer | Social links, region picker, copyright, legal links present', () => unav.validateFooter());
  if (marketSelector) {
    await check('Footer | Market selectors (language + region) present and interactive', () => unav.validateMarketSelector());
  }

  // ── IMS + static A11y — parallel (read-only: DOM/window, no user input) ──
  await Promise.all([
    check(`IMS | window.adobeid loaded, client_id="${clientId}", required scopes present`, () => unav.validateAdobeId(clientId)),
    check('A11y | axe-core: zero critical/serious WCAG 2.1 AA violations in GNav',        () => unav.validateAccessibility()),
    check('A11y | Skip to main content link present in DOM',                               () => unav.validateSkipLink()),
    check('A11y | Adobe logo has alt text',                                                () => unav.validateLogoAltText()),
    check(`A11y | html[lang] matches locale language "${lang}"`,                           () => unav.validateLangAttribute(lang)),
    check('A11y | GNav has navigation landmark (nav or role=navigation)',                  () => unav.validateNavLandmark()),
  ]);

  // ── Focus + Keyboard — sequential (drives keyboard focus, must not interleave) ─
  await check('A11y | Tab through GNav — each element has visible focus ring', () => unav.validateFocusVisible());
  await check('A11y | Keyboard: Enter/Escape/Space operate nav dropdowns',     () => unav.validateKeyboardNavigation());

  // ── Analytics — sequential (clicks elements, must be last) ───────────────
  await check('Analytics | daa-ll on all nav elements, collect calls fire on click', () => unav.validateAnalytics());

  // ── Console errors — hard fail (runs after all interactions so all errors are captured) ──
  await test.step('Console | No errors from unav.js / notification / profile.js', () => unav.validateConsoleErrors());

  // ── Result ────────────────────────────────────────────────────────────────
  if (failures.length > 0) {
    throw new Error(
      `${failures.length} check(s) failed on ${url}\n` +
      failures.map(({ name, detail }, i) => `  ${i + 1}. ${name}\n     ↳ ${detail}`).join('\n')
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Universal Nav — full validation', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  if (isSingleUrl) {
    test('@unav-single | custom URL', async ({ page }) => {
      const url = EXTRA_PARAMS && !RAW_BASE.includes(EXTRA_PARAMS.split('&')[0])
        ? `${RAW_BASE}${RAW_BASE.includes('?') ? '&' : '?'}${EXTRA_PARAMS}`
        : RAW_BASE;
      console.info(`[unav] Single URL → ${url}`);
      await runChecks(page, url, null, 'en', EXPECTED_UNAV_VERSION);
    });
  } else {
    // Run all:        BASE_URL=https://www.adobe.com npx playwright test tests/feds/unav.test.js
    // Run one locale: --grep @unav-de
    // Run one page:   --grep "@unav.*photoshop"
    for (const f of features) {
      test(`${f.name} | ${f.localeName} | ${f.pageName}, ${f.tags}`, async ({ page, baseURL }) => {
        const url = buildUrl(RAW_BASE || baseURL, f.path, f.subdomain);
        console.info(`[unav] ${f.localeName} — ${f.pageName} → ${url}`);
        await runChecks(page, url, f.clientId, f.lang, EXPECTED_UNAV_VERSION, f.noAppSwitcher, f.slimFooter, f.marketSelector);
      });
    }
  }
});
