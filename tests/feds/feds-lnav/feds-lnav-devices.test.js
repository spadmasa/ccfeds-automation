import { expect, test } from '@playwright/test';
import { fedsLnavFeatures } from '../../../features/feds/feds-lnav/feds-lnav.spec.js';
import FedsLnavDevicesPage from '../../../selectors/feds/feds-lnav-devices.page.js';
import { AnalyticsInterceptor } from '../../../utils/analytics/analytics.interceptor.js';
import { runAxeScan, getViolationSummary } from '../../../utils/accessibility/axe-runner.js';

// Viewport is driven by --project in feds.config.js — no test.use() needed here.
// Run commands:
//   iPhone portrait:   npx playwright test ... --project=feds-iphone
//   iPhone landscape:  npx playwright test ... --project=feds-iphone-landscape
//   Android portrait:  npx playwright test ... --project=feds-android
//   Android landscape: npx playwright test ... --project=feds-android-landscape
//   iPad portrait:     npx playwright test ... --project=feds-ipad-air-portrait
//   iPad landscape:    npx playwright test ... --project=feds-ipad-air-landscape

test.describe('FEDs LNav — Devices (iPhone / Android / iPad)', () => {
  fedsLnavFeatures.forEach((props) => {
    test(`${props.name} | ${props.locale.name}`, { tag: props.tags }, async ({ page, baseURL }) => {
      const analytics = new AnalyticsInterceptor(page);
      analytics.start();

      const localeHref = `https://www.adobe.com${props.locale.prefix}`;
      const nav = new FedsLnavDevicesPage(page, localeHref);

      console.info(`[LNav Devices] Testing: ${baseURL}${props.path}`);

      try {

      // ── 1. Page load ─────────────────────────────────────────────────────
      await test.step('Page load — check HTTP status', async () => {
        const { url, status } = await nav.navigateTo(baseURL, '', props.path);
        if (status === 404 || status === 410) {
          test.skip(true, `Page not found (HTTP ${status}) for locale ${props.locale.code}`);
          return;
        }
        expect(status, `Expected 2xx for ${url}`).toBeLessThan(400);
      });

      // ── 2. Nav structure ──────────────────────────────────────────────────
      await test.step('Nav structure — nav wrapper and Adobe logo visible', async () => {
        await nav.validateNavStructure();
      });

      // ── 3. Desktop CTA hidden ─────────────────────────────────────────────
      await test.step('"Go To Acrobat" secondary CTA must not be visible on devices', () => nav.validateDesktopLinksHidden());

      // ── 4. Nav links ──────────────────────────────────────────────────────
      await test.step('Nav links — every link inside nav has a valid href', () => nav.validateAllNavLinks());

      // ── 5. Read-only checks (parallel) ───────────────────────────────────
      await Promise.all([
        test.step('Adobe logo — visible, points to adobe.com, clickable', () => nav.validateAdobeLogo()),
        test.step('Local nav bar — product name label visible', () => nav.validateLocalnavBar()),
      ]);

      // ── 6. App switcher ───────────────────────────────────────────────────
      await test.step('App switcher — click opens bottom sheet with app grid, click closes', async () => {
        await nav.validateAppSwitcher();
      });

      // ── 7. Sign In ────────────────────────────────────────────────────────
      await test.step('Sign In — button visible and clickable', async () => {
        await nav.validateSignIn();
      });

      // ── 8. RTL direction ──────────────────────────────────────────────────
      await test.step('RTL direction — html[dir] is rtl for Arabic and Hebrew locales', async () => {
        await nav.validateRtlDirection(props.locale.code);
      });

      // ── 9. Local nav dropdown ─────────────────────────────────────────────
      await test.step('Local nav dropdown — tap opens panel, links valid, sub-panel back-button works', async () => {
        await nav.validateLocalnavDropdown();
      });

      // ── 10. CTAs ─────────────────────────────────────────────────────────
      await test.step('CTAs — "Buy now" visible; full-width on portrait phone, pill on landscape/iPad', async () => {
        await nav.validateCtas();
      });

      // ── 11. Font styles ───────────────────────────────────────────────────
      await test.step('Font styles — Adobe Clean font family and correct sizes on device nav', async () => {
        await nav.validateDeviceFontStyles();
      });

      // ── 12. Hamburger ─────────────────────────────────────────────────────
      await test.step('Hamburger — ≡ opens full-screen overlay with links and CTA, closes', async () => {
        await nav.validateHamburger();
      });

      // ── 13. Keyboard navigation ───────────────────────────────────────────
      await test.step('Accessibility — Enter, Space, Escape on hamburger and local nav bar', async () => {
        await nav.validateKeyboardNavigation();
      });

      // ── 14. Hamburger dropdown Tab navigation ─────────────────────────────
      await test.step('Accessibility — Tab must traverse items inside hamburger dropdowns (WCAG 2.1.1)', async () => {
        await nav.validateHamburgerDropdownTabNavigation();
      });

      // ── 15. Accessibility + height (parallel) ─────────────────────────────
      await Promise.all([
        test.step('Nav height — nav.localnav renders with non-zero height', () => nav.validateNavHeight()),
        test.step('Accessibility — skip link exists in DOM for screen readers', () => nav.validateSkipLink()),
        test.step('Accessibility — Adobe logo image has non-empty alt text', () => nav.validateLogoAltText()),
        test.step(`Accessibility — html[lang] matches locale "${props.locale.lang}"`, () => nav.validateLangAttribute(props.locale.lang)),
        test.step('Accessibility — nav is a landmark region for screen readers', () => nav.validateNavLandmark()),
      ]);

      // ── 16. Axe-core WCAG 2.1 AA scan ─────────────────────────────────────
      await test.step('Accessibility — axe-core WCAG 2.1 AA scan on nav', async () => {
        console.info('[LNav Devices] Step 11: Running axe-core WCAG 2.1 AA scan on header.global-navigation');
        const results = await runAxeScan(page, { selector: 'header.global-navigation' });
        const violations = getViolationSummary(results);
        const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        if (violations.length > 0)
          console.info(`[LNav Devices] Step 11: ${violations.length} a11y violation(s) found`);
        expect(
          criticalSerious,
          `Critical/serious a11y violations:\n${JSON.stringify(violations, null, 2)}`,
        ).toHaveLength(0);
        console.info('[LNav Devices] Step 11: PASS — no critical/serious a11y violations');
      });

      // ── 17. Analytics ─────────────────────────────────────────────────────
      await test.step('Analytics — daa-ll on device nav elements + collect call fires on click', async () => {
        console.info('[LNav Devices] Step 13: Starting analytics validation');
        await nav.validateAnalyticsDaaLl();
        console.info('[LNav Devices] Step 12: COMPLETE');
      });

      } finally {
        analytics.stop();
      }
    });
  });
});
