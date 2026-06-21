import { fedsLnavLocales } from '../../../data/feds-lnav-locales.js';

// ── Environment URLs ──────────────────────────────────────────────────────────
// Set BASE_URL env var to target a specific environment.
// Default: AEM Live (draft). Stage and Prod need no code change — just set BASE_URL.
export const ENVS = {
  aem: {
    baseURL:  'https://main--upp--adobecom.aem.live',
    testPage: '/homepage/drafts/blaishram/redesign-demo-copy?fedsbranch=localnav-new&georouting=off&mep=off',
  },
  stage: {
    baseURL:  'https://www.stage.adobe.com',
    testPage: '/homepage/drafts/blaishram/redesign-demo-copy?fedsbranch=localnav-new&georouting=off&mep=off',
  },
  prod: {
    baseURL:  'https://www.adobe.com',
    testPage: '/homepage/drafts/blaishram/redesign-demo-copy?georouting=off&mep=off',
  },
};

const _baseUrl = process.env.BASE_URL || '';
const _env = _baseUrl.startsWith('https://www.adobe.com') && !_baseUrl.includes('stage')
  ? ENVS.prod
  : _baseUrl.includes('stage')
    ? ENVS.stage
    : ENVS.aem;

export const TEST_PAGE = _env.testPage;

// Dropdowns for UPP.
// ariaControls = the aria-controls attribute on the button = the id of the panel div.
// Confirmed from inspector on the live LNav page.
export const uppDropdowns = [
  { name: 'PDF & Productivity', ariaControls: 'pdf-productivity' },
  { name: 'Features', ariaControls: 'features' },
  { name: 'Online Tools', ariaControls: 'online-tools' },
];

// ── To add a new client in future ────────────────────────────────────────────
// 1. Create a new spec file, e.g. features/feds/feds-lnav/photoshop.spec.js
// 2. Set its own TEST_PAGE URL and dropdowns array:
//
// export const TEST_PAGE = '/products/photoshop/?georouting=off&mep=off';
// export const photoshopDropdowns = [
//   { name: 'Features', index: 0 },
//   { name: 'Plans & Pricing', index: 2 },
// ];
//
// 3. Create tests/feds/feds-lnav/photoshop.test.js importing that spec.
//    The page object (feds-lnav.page.js) stays unchanged — it works for all clients.
// ─────────────────────────────────────────────────────────────────────────────

export const fedsLnavFeatures = fedsLnavLocales.map((locale, idx) => ({
  tcid: `LNav-${String(idx).padStart(3, '0')}`,
  name: `@feds-lnav-${locale.code}`,
  path: `${locale.prefix.replace(/\/$/, '')}${TEST_PAGE}`,
  locale,
  dropdowns: uppDropdowns, // each entry has { name, ariaControls }
  tags: ['@feds-lnav', `@feds-lnav-${locale.code}`, `@feds-lnav-${locale.lang}`],
}));
