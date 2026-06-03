import { fedsLnavLocales } from '../../../data/feds-lnav-locales.js';

// ── Breakpoints ───────────────────────────────────────────────────────────────
// Single source of truth for LNav CSS breakpoints and viewport overrides.
// Device viewports come from --project in feds.config.js.
// Desktop viewport is overridden in feds-lnav.test.js via test.use() to guarantee
// no is-compact class regardless of which config project is used.
export const BREAKPOINTS = {
  mobileMax:  480,   // ≤480px  → mobile layout
  tabletMax:  1023,  // ≤1023px → tablet layout
  desktopMin: 1024,  // ≥1024px → desktop layout — CSS @media (width >= 1024px)
  viewports: {
    desktop: { width: 1600, height: 800 },
  },
};

// ── Page path ─────────────────────────────────────────────────────────────────
// BASE_URL controls the environment (set at config level or via env var).
// TEST_PAGE controls the page path — set via env var, no hardcoded URLs here.
//
// Examples:
//   BASE_URL=https://www.adobe.com TEST_PAGE=/acrobat?georouting=off
//   BASE_URL=https://www.stage.adobe.com TEST_PAGE=/dc-shared/fragments/...
//   BASE_URL=https://main--upp--adobecom.aem.live TEST_PAGE=/homepage/drafts/...
//
// The locale prefix (/fr, /de, /jp ...) is prepended automatically per test case.
// TEST_PAGE must NOT include the locale prefix.
const TEST_PATH = process.env.TEST_PAGE || '';

export const fedsLnavFeatures = fedsLnavLocales.map((locale, idx) => ({
  tcid:   `LNav-${String(idx).padStart(3, '0')}`,
  name:   `@feds-lnav-${locale.code}`,
  path:   `${locale.prefix.replace(/\/$/, '')}${TEST_PATH}`,
  locale,
  tags:   ['@feds-lnav', `@feds-lnav-${locale.code}`, `@feds-lnav-${locale.lang}`],
}));
