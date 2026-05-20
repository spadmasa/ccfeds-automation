import { expect, test } from '@playwright/test';
import { fedsLnavFeatures } from '../../../features/feds/feds-lnav/feds-lnav.spec.js';
import FedsLnavPage from '../../../selectors/feds/feds-lnav.page.js';
import { AnalyticsInterceptor } from '../../../utils/analytics/analytics.interceptor.js';
import { runAxeScan, getViolationSummary } from '../../../utils/accessibility/axe-runner.js';

test.describe('FEDs LNav', () => {
  fedsLnavFeatures.forEach((props) => {
    test(`${props.name} | ${props.locale.name}`, { tag: props.tags }, async ({ page, baseURL }, testInfo) => {
      const analytics = new AnalyticsInterceptor(page);
      analytics.start();

      const localeHref = `https://www.adobe.com${props.locale.prefix}`;
      const nav = new FedsLnavPage(page, localeHref);

      testInfo.annotations.push({ type: 'locale', description: props.locale.code });
      testInfo.annotations.push({ type: 'language', description: props.locale.lang });
      testInfo.annotations.push({ type: 'direction', description: props.locale.dir });
      testInfo.annotations.push({ type: 'market', description: props.locale.name });

      console.info(`[LNav] Testing: ${baseURL}${props.path}`);

      try {

      // ── 1. Page load ─────────────────────────────────────────────────────
      await test.step('Page load — check HTTP status', async () => {
        const { url, status } = await nav.navigateTo(baseURL, '', props.path);

        if (status === 404 || status === 410) {
          testInfo.annotations.push({ type: 'skip-reason', description: `Page not found (HTTP ${status}): ${url}` });
          test.skip(true, `Page not found (HTTP ${status}) for locale ${props.locale.code}`);
          return;
        }

        if (status >= 400) {
          testInfo.annotations.push({ type: 'error', description: `HTTP ${status}: ${url}` });
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
        test.step('Acrobat brand link — visible, has href, clickable', () => nav.validateAcrobatBrandLink()),
        test.step('Compare Plans — visible, has href, clickable', () => nav.validateComparePlans()),
        test.step('Learn and Support — visible, has href, clickable', () => nav.validateLearnAndSupport()),
        test.step('Free Trial — visible, has href, clickable', () => nav.validateFreeTrial()),
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
      // promo only ever appears in the first dropdown — track it for ONE annotation
      let promoFoundIn = null;
      const dropdownCount = await nav.allDropdownBtns.count();
      expect(dropdownCount, 'No dropdown buttons found in nav').toBeGreaterThan(0);
      const dropdownNames = [];
      for (let i = 0; i < dropdownCount; i++) {
        const btn          = nav.allDropdownBtns.nth(i);
        const ariaControls = await btn.getAttribute('aria-controls');
        const name         = (await btn.textContent()).trim() || `Dropdown ${i + 1}`;
        dropdownNames.push(name);
        await test.step(`Dropdown — ${name} opens, links have href and are clickable, closes`, async () => {
          await nav.validateDropdown(ariaControls, name, (hasPromo) => {
            if (hasPromo) promoFoundIn = name;
          });
        });
      }
      testInfo.annotations.push({ type: 'dropdown-count', description: `${dropdownCount}: ${dropdownNames.join(', ')}` });
      testInfo.annotations.push({
        type: 'promo',
        description: promoFoundIn ? `present in: ${promoFoundIn}` : 'not present',
      });

      // ── 15–20. Read-only checks — run in parallel ────────────────────────────
      await Promise.all([
        test.step('Breadcrumbs — links visible and have valid href', async () => {
          const breadcrumbNames = await nav.validateBreadcrumbs();
          testInfo.annotations.push({ type: 'breadcrumbs', description: breadcrumbNames.join(' > ') });
        }),
        test.step('Nav height — nav.localnav renders with non-zero height', async () => {
          const height = await nav.validateNavHeight();
          testInfo.annotations.push({ type: 'nav-height-px', description: `${height}px` });
        }),
        test.step('Accessibility — skip link exists in DOM for screen readers', () => nav.validateSkipLink()),
        test.step('Accessibility — Adobe logo image has non-empty alt text', () => nav.validateLogoAltText()),
        test.step(`Accessibility — html[lang] matches locale "${props.locale.lang}"`, () => nav.validateLangAttribute(props.locale.lang)),
        test.step('Accessibility — nav is a landmark region for screen readers', () => nav.validateNavLandmark()),
      ]);

      // ── 16b. Nav transparency + scroll ───────────────────────────────────────
      await test.step('Nav transparency — transparent by default, white on dropdown open, page scrolls with dropdown open', async () => {
        await nav.validateNavTransparency();
      });

      // ── 21. Focus visible ─────────────────────────────────────────────────
      // Tabs through 5 nav items and checks each has a visible CSS outline —
      // outline:none makes the nav unusable for keyboard-only users
      await test.step('Accessibility — focused nav elements have visible focus ring', async () => {
        await nav.validateFocusVisible();
      });

      // ── 22. Keyboard navigation ───────────────────────────────────────────
      // Tests Tab/Enter/Space/Escape on dropdowns — confirms full keyboard
      // operability as required by WCAG 2.1.1
      await test.step('Accessibility — Tab, Enter, Space, Escape all work on nav dropdowns', async () => {
        await nav.validateKeyboardNavigation();
      });

      // ── 23. Axe-core WCAG 2.1 AA scan ────────────────────────────────────
      await test.step('Accessibility — axe-core WCAG 2.1 AA scan on nav', async () => {
        console.info('[LNav] Step 23: Running axe-core WCAG 2.1 AA scan on header.global-navigation');
        const results = await runAxeScan(page, { selector: 'header.global-navigation' });
        const violations = getViolationSummary(results);
        const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        if (violations.length > 0) {
          testInfo.annotations.push({ type: 'a11y-violations', description: JSON.stringify(violations, null, 2) });
          console.info(`[LNav] Step 23: ${violations.length} a11y violation(s) found`);
        }
        // annotation pushed BEFORE expect so it is always recorded even if the test fails
        testInfo.annotations.push({
          type: 'accessibility',
          description: criticalSerious.length === 0
            ? 'pass'
            : `FAIL — ${criticalSerious.map((v) => v.id).join(', ')}`,
        });
        expect(
          criticalSerious,
          `Critical/serious a11y violations:\n${JSON.stringify(violations, null, 2)}`,
        ).toHaveLength(0);
        console.info('[LNav] Step 23: PASS — no critical/serious a11y violations');
      });

      // ── 24. Analytics — daa-ll attributes + collect network call ─────────
      await test.step('Analytics — daa-ll on all nav elements + collect call fires on click', async () => {
        console.info('[LNav] Step 24: Starting analytics validation — daa-ll attributes + collect call per click');
        let analyticsResult = 'pass';
        try {
          await nav.validateAnalyticsDaaLl();
        } catch (e) {
          analyticsResult = `FAIL — ${e.message.split('\n')[0]}`;
          throw e;
        } finally {
          // finally always runs — annotation is recorded whether step passes or fails
          testInfo.annotations.push({ type: 'analytics', description: analyticsResult });
        }
        console.info('[LNav] Step 24: COMPLETE');
      });
      } finally {
        analytics.stop();
      }
    });
  });
});
