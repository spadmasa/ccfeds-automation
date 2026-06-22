import { expect, test } from '@playwright/test';
import { fedsLnavFeatures, BREAKPOINTS } from '../../../features/feds/feds-lnav/feds-lnav.spec.js';
import FedsLnavPage from '../../../selectors/feds/feds-lnav.page.js';
import { AnalyticsInterceptor } from '../../../utils/analytics/analytics.interceptor.js';
import { runAxeScan, getViolationSummary } from '../../../utils/accessibility/axe-runner.js';

// Force 1600px — LNav-specific override so is-compact is never triggered at desktop.
// Device viewports come from --project in the shared config (no test.use needed there).
test.use({ viewport: BREAKPOINTS.viewports.desktop });

test.describe('FEDs LNav', () => {
  fedsLnavFeatures.forEach((props) => {
    test(`${props.name} | ${props.locale.name}`, { tag: props.tags }, async ({ page, baseURL }) => {
      const analytics = new AnalyticsInterceptor(page);
      analytics.start();

      const localeHref = `https://www.adobe.com${props.locale.prefix}`;
      const nav = new FedsLnavPage(page, localeHref);

      console.info(`[LNav] Testing: ${baseURL}${props.path}`);

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

      // ── 2. Nav structure ─────────────────────────────────────────────────
      await test.step('Nav structure — nav wrapper, Adobe logo, nav list visible', async () => {
        await nav.validateNavStructure();
      });

      // ── 3–9. Read-only nav checks — run in parallel ──────────────────────────
      await Promise.all([
        test.step('Nav links — every link inside nav has a valid href', () => nav.validateAllNavLinks()),
        test.step('Nav font styles — Adobe Clean font family and 16px size on all nav items', () => nav.validateNavFontStyles()),
        test.step('Adobe logo — visible, points to adobe.com, clickable', () => nav.validateAdobeLogo()),
        test.step('Direct nav links — all visible, have href (generic for any page/locale)', () => nav.validateDirectNavLinks()),
        test.step('Active element — current page link has bold underline (desktop only, width >= 1024px)', () => nav.validateActiveElement()),
        test.step('CTAs — primary and secondary visible, have href, clickable', () => nav.validateCtas()),
      ]);

      // ── 10. App switcher ──────────────────────────────────────────────────
      await test.step('App switcher — click opens modal with app links, click closes modal', async () => {
        await nav.validateAppSwitcher();
      });

      // ── 11. Sign In ───────────────────────────────────────────────────────
      await test.step('Sign In — button visible and clickable', async () => {
        await nav.validateSignIn();
      });

      // ── 12. RTL direction ─────────────────────────────────────────────────
      await test.step('RTL direction — html[dir] is rtl for Arabic and Hebrew locales', async () => {
        await nav.validateRtlDirection(props.locale.code);
      });

      // ── 13. Each dropdown open / validate / close ────────────────────────
      const dropdownCount = await nav.allDropdownBtns.count();
      expect(dropdownCount, 'No dropdown buttons found in nav').toBeGreaterThan(0);
      for (let i = 0; i < dropdownCount; i++) {
        const btn          = nav.allDropdownBtns.nth(i);
        const ariaControls = await btn.getAttribute('aria-controls');
        const name         = (await btn.textContent()).trim() || `Dropdown ${i + 1}`;
        await test.step(`Dropdown — ${name} opens, links have href and are clickable, closes`, async () => {
          await nav.validateDropdown(ariaControls, name);
        });
      }

      // ── 15–20. Read-only checks — run in parallel ────────────────────────────
      await Promise.all([
        test.step('Breadcrumbs — links visible and have valid href', () => nav.validateBreadcrumbs()),
        test.step('Nav height — nav.localnav renders with non-zero height', () => nav.validateNavHeight()),
        test.step('Accessibility — skip link exists in DOM for screen readers', () => nav.validateSkipLink()),
        test.step('Accessibility — Adobe logo image has non-empty alt text', () => nav.validateLogoAltText()),
        test.step(`Accessibility — html[lang] matches locale "${props.locale.lang}"`, () => nav.validateLangAttribute(props.locale.lang)),
        test.step('Accessibility — nav is a landmark region for screen readers', () => nav.validateNavLandmark()),
      ]);

      // ── 16b. Nav transparency + scroll ───────────────────────────────────────
      await test.step('Nav transparency — transparent by default, white on dropdown open, page scrolls with dropdown open', async () => {
        await nav.validateNavTransparency();
      });

      // ── Font color theme + scroll ─────────────────────────────────────────
      // Detects gnav-dark-font class → validates black/white text at top,
      // then verifies all nav links turn black after scroll.
      await test.step('Nav font color — dark-font/white-font theme at top, black after scroll', async () => {
        await nav.validateNavFontColorTheme();
      });

      // ── Hover dimming effect ───────────────────────────────────────────────
      // Hovered nav link is prominent (opacity 1), all others + CTAs fade (opacity < 1).
      // Sign In is excluded from dimming.
      await test.step('Nav hover — hovered link prominent, others and CTAs faded, Sign In not faded', async () => {
        await nav.validateNavHoverEffect();
      });

      // ── 21. Focus visible ─────────────────────────────────────────────────
      await test.step('Accessibility — focused nav elements have visible focus ring', async () => {
        await nav.validateFocusVisible();
      });

      // ── 22. Keyboard navigation ───────────────────────────────────────────
      await test.step('Accessibility — Tab, Enter, Space, Escape all work on nav dropdowns', async () => {
        await nav.validateKeyboardNavigation();
      });

      // ── 23. Axe-core WCAG 2.1 AA scan ────────────────────────────────────
      await test.step('Accessibility — axe-core WCAG 2.1 AA scan on nav', async () => {
        console.info('[LNav] Step 23: Running axe-core WCAG 2.1 AA scan on header.global-navigation');
        const results = await runAxeScan(page, { selector: 'header.global-navigation' });
        const violations = getViolationSummary(results);
        const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        if (violations.length > 0)
          console.info(`[LNav] Step 23: ${violations.length} a11y violation(s) found`);
        expect(
          criticalSerious,
          `Critical/serious a11y violations:\n${JSON.stringify(violations, null, 2)}`,
        ).toHaveLength(0);
        console.info('[LNav] Step 23: PASS — no critical/serious a11y violations');
      });

      // ── 24. Analytics ─────────────────────────────────────────────────────
      await test.step('Analytics — daa-ll on all nav elements + collect call fires on click', async () => {
        console.info('[LNav] Step 24: Starting analytics validation — daa-ll attributes + collect call per click');
        await nav.validateAnalyticsDaaLl();
        console.info('[LNav] Step 24: COMPLETE');
      });

      } finally {
        analytics.stop();
      }
    });
  });
});
