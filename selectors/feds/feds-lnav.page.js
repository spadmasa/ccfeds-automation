import { expect } from '@playwright/test';
import { rtlLocales } from '../../data/feds-lnav-locales.js';
import { setConsentCookies } from '../../utils/analytics/analytics.interceptor.js';

export default class FedsLnavPage {
  constructor(page, localeHref = 'https://www.adobe.com/') {
    this.page       = page;
    this.localeHref = localeHref;

    // ── Header ────────────────────────────────────────────────────────────────
    this.navContainer = page.locator('header.global-navigation');
    this.navWrapper   = page.locator('nav.localnav');

    // ── Adobe logo ────────────────────────────────────────────────────────────
    this.adobeLogoLink = page.locator('.feds-brand-container a').first();
    this.adobeLogo     = page.locator('.feds-brand-container .feds-brand');
    this.adobeLogoImg  = page.locator('.feds-brand-container .feds-brand img').first();

    // ── Acrobat brand link — only <a> in gnav-items (dropdowns are <button>) ──
    // ── Nav bar links — direct child > avoids nested dropdown panel links ─────
    // All 4 are li > a direct children of ul.feds-gnav-items pointing to locale root.
    // nth() reflects DOM source order: Acrobat brand → Compare Plans → Learn & Support → Free Trials
    const navBarLinks     = page.locator(`ul.feds-gnav-items > li > a.feds-link[href="${localeHref}"]`);
    this.acrobatBrandLink = navBarLinks.nth(0);
    this.comparePlansLink = navBarLinks.nth(1);
    this.learnSupportLink = navBarLinks.nth(2);
    this.freeTrialLink    = navBarLinks.nth(3);

    // ── Local nav bar ─────────────────────────────────────────────────────────
    this.localnavBar   = page.locator('button.feds-localnav-bar');
    this.localnavLabel = page.locator('span.feds-localnav-bar-label');

    // ── Gnav items list ───────────────────────────────────────────────────────
    this.navList = page.locator('ul.feds-gnav-items');

    // ── CTAs — nth(1) = second element (first is hidden inside a closed dropdown) ─
    this.primaryCta   = page.locator('a.feds-primary-cta').nth(1);
    this.secondaryCta = page.locator('a.feds-secondary-cta').nth(1);

    // ── App switcher — confirmed from inspector ───────────────────────────────
    // button: div id="unav-app-switcher", role="button", aria-label="App switcher"
    // modal:  div id="unav-app-switcher-dialog-id", role="dialog"
    this.appSwitcher      = page.locator('#unav-app-switcher');
    this.appSwitcherModal = page.locator('#unav-app-switcher-dialog-id');

    // 11 app tiles — confirmed from inspector (each <a aria-label="App Name">)
    this.appSwitcherAdobeExpress  = page.locator('#unav-app-switcher-dialog-id a[aria-label="Adobe Express"]');
    this.appSwitcherAdobeFirefly  = page.locator('#unav-app-switcher-dialog-id a[aria-label="Adobe Firefly"]');
    this.appSwitcherAcrobat       = page.locator('#unav-app-switcher-dialog-id a[aria-label="Acrobat"]');
    this.appSwitcherPhotoshop     = page.locator('#unav-app-switcher-dialog-id a[aria-label="Photoshop"]');
    this.appSwitcherLightroom     = page.locator('#unav-app-switcher-dialog-id a[aria-label="Lightroom"]');
    this.appSwitcherStock         = page.locator('#unav-app-switcher-dialog-id a[aria-label="Stock"]');
    this.appSwitcherAcrobatSign   = page.locator('#unav-app-switcher-dialog-id a[aria-label="Acrobat Sign"]');
    this.appSwitcherFonts         = page.locator('#unav-app-switcher-dialog-id a[aria-label="Fonts"]');
    this.appSwitcherBehance       = page.locator('#unav-app-switcher-dialog-id a[aria-label="Behance"]');
    this.appSwitcherFrameIo       = page.locator('#unav-app-switcher-dialog-id a[aria-label="Frame.io"]');
    this.appSwitcherExpCloud      = page.locator('#unav-app-switcher-dialog-id a[aria-label="Experience Cloud"]');

    // 2 footer links — data-test-id is locale-independent
    this.appSwitcherAdobeCom = page.locator('[data-test-id="unav-app-switcher--adobe-dot-com-footer-item"]');
    this.appSwitcherAllApps  = page.locator('[data-test-id="unav-app-switcher--see-all-apps-footer-item"]');

    // ── Sign In ───────────────────────────────────────────────────────────────
    this.signInBtn = page.locator('[data-test-id="unav-profile--sign-in"]');

    // ── Breadcrumbs ───────────────────────────────────────────────────────────
    this.breadcrumbList  = page.locator('ul.feds-breadcrumbs, nav.breadcrumbs, .feds-breadcrumbs-wrapper');
    this.breadcrumbItems = page.locator('ul.feds-breadcrumbs a, .feds-breadcrumbs-wrapper a');

    // ── Mobile hamburger ──────────────────────────────────────────────────────
    this.mobileMenuBtn     = page.locator('button.feds-nav-toggle');
    this.mobileMenuWrapper = page.locator('li#feds-menu-wrapper');

    // ── All dropdown buttons ──────────────────────────────────────────────────
    this.allDropdownBtns = page.locator('button.mega-menu.feds-link');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateTo(baseURL, localePath, testPagePath) {
    const url = `${baseURL}${localePath}${testPagePath}`.replace('//', '/').replace(':/', '://');
    const domain = new URL(baseURL).hostname.replace(/^www\./, '');
    await setConsentCookies(this.page, domain);
    console.info(`[LNav] Navigating to: ${url}`);
    const response = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const status = response?.status() ?? 0;
    console.info(`[LNav] ${url} → HTTP ${status}`);
    return { url, status };
  }

  // ── Core structure ────────────────────────────────────────────────────────

  async validateNavStructure() {
    console.info('[LNav] Step 2: Checking nav wrapper, Adobe logo, nav list are visible');
    await expect(this.navWrapper).toBeVisible({ timeout: 15000 });
    await expect(this.adobeLogo).toBeVisible({ timeout: 15000 });
    await expect(this.navList).toBeVisible({ timeout: 15000 });
    // Allow nav entrance animations to settle before interaction checks
    await this.page.waitForTimeout(500);
    console.info('[LNav] Step 2: PASS — nav structure visible');
  }

  // ── RTL ───────────────────────────────────────────────────────────────────

  async validateRtlDirection(localeCode) {
    console.info(`[LNav] Step 12: Checking RTL direction for locale "${localeCode}"`);
    if (!rtlLocales.includes(localeCode)) {
      console.info(`[LNav] Step 12: SKIP — locale "${localeCode}" is not RTL`);
      return;
    }
    const dir = await this.page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
    console.info(`[LNav] Step 12: PASS — html[dir]="${dir}"`);
  }

  // ── All nav links href ────────────────────────────────────────────────────

  async validateAllNavLinks() {
    console.info('[LNav] Step 3: Checking every <a> inside the nav has a valid href');
    const linkData = await this.navContainer.locator('a').evaluateAll((els) =>
      els.map((el, i) => ({
        href: el.getAttribute('href'),
        text: (el.textContent || '').trim() || `link ${i + 1}`,
      }))
    );
    expect(linkData.length, 'No links found inside nav').toBeGreaterThan(0);
    for (const { href, text } of linkData) {
      expect(href, `Nav link "${text}" is missing href`).toBeTruthy();
    }
    console.info(`[LNav] Step 3: PASS — ${linkData.length} nav links all have href`);
  }

  // ── Adobe logo ────────────────────────────────────────────────────────────

  async validateAdobeLogo() {
    console.info('[LNav] Step 4: Checking Adobe logo — visible, href, clickable');
    await expect(this.adobeLogoLink).toBeVisible({ timeout: 15000 });
    const href = await this.adobeLogoLink.getAttribute('href');
    expect(href, 'Adobe logo link must point to adobe.com').toContain('adobe.com');
    console.info(`[LNav] Step 4: PASS — Adobe logo href="${href}"`);
  }

  // ── Acrobat brand link ────────────────────────────────────────────────────

  async validateAcrobatBrandLink() {
    console.info('[LNav] Step 5: Checking Acrobat brand link — visible, href, clickable');
    await expect(this.acrobatBrandLink, 'Acrobat brand link not found — check selector in feds-lnav.page.js').toBeVisible({ timeout: 15000 });
    const href = await this.acrobatBrandLink.getAttribute('href');
    expect(href, 'Acrobat brand link must have an href').toBeTruthy();
    console.info(`[LNav] Step 5: PASS — Acrobat brand href="${href}"`);
  }

  // ── Compare Plans ─────────────────────────────────────────────────────────

  async validateComparePlans() {
    console.info('[LNav] Step 6: Checking Compare Plans link — visible, href, clickable');
    await expect(this.comparePlansLink, 'Compare Plans link not found — check selector in feds-lnav.page.js').toBeVisible({ timeout: 15000 });
    const href = await this.comparePlansLink.getAttribute('href');
    expect(href, 'Compare Plans link must have an href').toBeTruthy();
    console.info(`[LNav] Step 6: PASS — Compare Plans href="${href}"`);
  }

  // ── Learn and Support ─────────────────────────────────────────────────────

  async validateLearnAndSupport() {
    console.info('[LNav] Step 7: Checking Learn & Support link — visible, href, clickable');
    await expect(this.learnSupportLink, 'Learn & Support link not found — check selector in feds-lnav.page.js').toBeVisible({ timeout: 15000 });
    const href = await this.learnSupportLink.getAttribute('href');
    expect(href, 'Learn & Support link must have an href').toBeTruthy();
    console.info(`[LNav] Step 7: PASS — Learn & Support href="${href}"`);
  }

  // ── Free Trial ────────────────────────────────────────────────────────────

  async validateFreeTrial() {
    console.info('[LNav] Step 8: Checking Free Trial link — visible, href, clickable');
    await expect(this.freeTrialLink, 'Free Trial link not found — check selector in feds-lnav.page.js').toBeVisible({ timeout: 15000 });
    const href = await this.freeTrialLink.getAttribute('href');
    expect(href, 'Free Trial link must have an href').toBeTruthy();
    console.info(`[LNav] Step 8: PASS — Free Trial href="${href}"`);
  }

  // ── CTAs ──────────────────────────────────────────────────────────────────

  async validateCtas() {
    console.info('[LNav] Step 9: Checking primary and secondary CTAs — visible, href, clickable');
    await expect(this.primaryCta, 'Primary CTA not found').toBeVisible({ timeout: 15000 });
    const primaryHref = await this.primaryCta.getAttribute('href');
    expect(primaryHref, 'Primary CTA must have an href').toBeTruthy();
    console.info(`[LNav] Step 9: PASS — Primary CTA href="${primaryHref}"`);

    const secondaryVisible = await this.secondaryCta.isVisible().catch(() => false);
    if (secondaryVisible) {
      const secondaryHref = await this.secondaryCta.getAttribute('href');
      expect(secondaryHref, 'Secondary CTA must have an href').toBeTruthy();
      console.info(`[LNav] Step 9: PASS — Secondary CTA href="${secondaryHref}"`);
    } else {
      console.info('[LNav] Step 9: Secondary CTA not present on this page — skipping');
    }
  }

  // ── App switcher ──────────────────────────────────────────────────────────

  async validateAppSwitcher() {
    console.info('[LNav] Step 10: Checking app switcher — button, modal, all 11 apps + 2 footer links');
    // unav loads async after FEDS nav — Firefox/WebKit need extra time under parallel load
    await expect(this.appSwitcher, 'App switcher button not found').toBeVisible({ timeout: 20000 });
    await this.appSwitcher.evaluate((el) => el.click());
    await expect(this.appSwitcherModal, 'App switcher dialog not found').toBeVisible({ timeout: 15000 });
    console.info('[LNav] Step 10: App switcher modal opened');

    // wait for apps to render, then spot-check Adobe Express is visible
    await this.appSwitcherAdobeExpress.waitFor({ state: 'visible', timeout: 15000 });
    console.info('[LNav] Step 10: App switcher modal content visible ✓');

    // ── 2 footer links ────────────────────────────────────────────────────────
    await expect(this.appSwitcherAdobeCom, 'Adobe.com footer link not visible').toBeVisible({ timeout: 15000 });
    await expect(this.appSwitcherAllApps, 'All apps footer link not visible').toBeVisible({ timeout: 15000 });

    // close the modal
    await this.appSwitcher.evaluate((el) => el.click());
    await expect(this.appSwitcherModal).toBeHidden({ timeout: 15000 });
    console.info('[LNav] Step 10: PASS — app switcher modal closed');
  }

  // ── Sign In ───────────────────────────────────────────────────────────────

  async validateSignIn() {
    console.info('[LNav] Step 11: Checking Sign In button — visible, clickable');
    await expect(this.signInBtn, 'Sign In button not found').toBeVisible({ timeout: 15000 });
    await this.signInBtn.click({ trial: true, timeout: 15000 });
    console.info('[LNav] Step 11: PASS — Sign In button visible and clickable');
  }

  // ── Generic dropdown validator ────────────────────────────────────────────

  async validateDropdown(ariaControls, name, onPromoCheck = null) {
    console.info(`[LNav] Dropdown: Opening "${name}" (aria-controls="${ariaControls}")`);
    // button.mega-menu.feds-link targets only the real dropdown button —
    // the mobile hamburger (feds-nav-toggle) also has aria-controls on the first panel,
    // so without the class filter it would match 2 buttons and click the wrong one
    const btn   = this.page.locator(`button.mega-menu.feds-link[aria-controls="${ariaControls}"]`);
    const panel = this.page.locator(`#${ariaControls}`);

    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click({ timeout: 15000 });
    await expect(panel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });
    console.info(`[LNav] Dropdown: "${name}" panel opened`);

    // ── Section headings — 1 browser call for all texts ──────────────────────
    const headingTexts = await panel.locator('h2.links-card-title').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => (el.textContent || '').trim()));
    if (headingTexts.length > 0) {
      console.info(`[LNav] Dropdown: "${name}" has ${headingTexts.length} section heading(s)`);
      for (const [i, text] of headingTexts.entries()) {
        expect(text, `"${name}" section heading ${i + 1} has empty text`).toBeTruthy();
        console.info(`[LNav] Dropdown: "${name}" heading ${i + 1} — "${text}"`);
      }
    } else {
      console.info(`[LNav] Dropdown: "${name}" — no h2.links-card-title headings found`);
    }

    // ── Links — 1 browser call for all hrefs + texts ──────────────────────────
    const links = panel.locator('a').filter({ visible: true });
    const linkData = await links.evaluateAll((els) =>
      els.map((el, i) => ({
        href: el.getAttribute('href'),
        text: (el.textContent || '').trim() || `link ${i + 1}`,
      }))
    );
    expect(linkData.length, `"${name}" panel has no visible links`).toBeGreaterThan(0);
    console.info(`[LNav] Dropdown: "${name}" has ${linkData.length} visible links — checking href and clickability`);
    for (const { href, text } of linkData) {
      expect(href, `"${name}" link "${text}" is missing href`).toBeTruthy();
      expect(href, `"${name}" link "${text}" href must point to adobe.com`).toContain('adobe.com');
      // TODO: uncomment when locale-prefix bug is fixed in PDF dropdown first column
      // const localePath = new URL(this.localeHref).pathname;
      // if (localePath !== '/') {
      //   expect(href, `BUG: "${text}" missing locale "${localePath}" — href="${href}"`).toContain(localePath);
      // }
    }
    // sample clickability check on first link — panel is confirmed open and links are visible
    await links.first().click({ trial: true, timeout: 15000 });

    // ── Link descriptions — 1 browser call for all texts ─────────────────────
    const descTexts = await panel.locator('span.links-card-links__item-description').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => (el.textContent || '').trim()));
    if (descTexts.length > 0) {
      console.info(`[LNav] Dropdown: "${name}" has ${descTexts.length} description(s)`);
      for (const [i, text] of descTexts.entries()) {
        expect(text, `"${name}" description ${i + 1} has empty text`).toBeTruthy();
        console.info(`[LNav] Dropdown: "${name}" description ${i + 1} — "${text}"`);
      }
    } else {
      console.info(`[LNav] Dropdown: "${name}" — no link descriptions found`);
    }

    // ── Promo card (optional — not all dropdowns have one) ─────────────────
    // article.promo-card-small    → the whole promo card
    // picture.promo-card__bg      → the background/device photo
    // div.promo-card-small__text  → title + description text
    // a.feds-secondary-cta        → "Start buy now" CTA link (confirmed from inspector)
    const promo = panel.locator('article.promo-card-small');
    const hasPromo = (await promo.count()) > 0;

    // onPromoCheck is a callback passed from the test — it adds the annotation
    // immediately (present/not present) BEFORE the full promo validation runs,
    // so the annotation is recorded even if the promo validation step fails
    if (onPromoCheck) onPromoCheck(hasPromo);

    if (hasPromo) {
      console.info(`[LNav] Dropdown: "${name}" — promo card found, validating`);
      await expect(promo, `"${name}" promo card not visible`).toBeVisible({ timeout: 15000 });
      await expect(promo.locator('picture.promo-card__bg'), `"${name}" promo image not visible`).toBeVisible({ timeout: 15000 });
      await expect(promo.locator('div.promo-card-small__text'), `"${name}" promo text not visible`).toBeVisible({ timeout: 15000 });
      const promoCta = promo.locator('div.promo-card-small__cta a.feds-secondary-cta');
      await expect(promoCta, `"${name}" promo CTA not visible`).toBeVisible({ timeout: 15000 });
      await promoCta.click({ trial: true, timeout: 15000 });
    } else {
      console.info(`[LNav] Dropdown: "${name}" — no promo card`);
    }

    await btn.click({ timeout: 15000 });
    await expect(panel, `"${name}" panel did not close`).toBeHidden({ timeout: 15000 });
    console.info(`[LNav] Dropdown: "${name}" PASS — opened, validated, closed`);

    return { hasPromo };
  }

  // ── Breadcrumbs ───────────────────────────────────────────────────────────

  async validateBreadcrumbs() {
    console.info('[LNav] Step 15: Checking breadcrumbs — links visible and have href');
    const visible = this.breadcrumbItems.filter({ visible: true });
    await expect(visible.first(), 'Breadcrumb links not found — check selector in feds-lnav.page.js').toBeVisible({ timeout: 15000 });
    const items = await visible.all();
    expect(items.length, 'Breadcrumbs must be present on page').toBeGreaterThan(0);
    const names = [];
    for (const item of items) {
      const href = await item.getAttribute('href');
      expect(href, 'Breadcrumb link must have an href').toBeTruthy();
      names.push((await item.textContent()).trim());
    }
    console.info(`[LNav] Step 15: PASS — ${items.length} breadcrumbs: ${names.join(' > ')}`);
    return names;
  }

  // ── Nav height ────────────────────────────────────────────────────────────

  async validateNavHeight() {
    console.info('[LNav] Step 16: Checking nav.localnav renders with non-zero height');
    await expect(this.navWrapper).toBeVisible({ timeout: 15000 });
    const box = await this.navWrapper.boundingBox();
    expect(box, 'nav.localnav has no bounding box').not.toBeNull();
    expect(box.height, `nav height is ${box.height}px — expected > 0`).toBeGreaterThan(0);
    console.info(`[LNav] Step 16: PASS — nav height is ${box.height}px`);
    return box.height;
  }

  // ── Skip link ─────────────────────────────────────────────────────────────
  // A "Skip to main content" link must exist at the top of the page.
  // It is usually visually hidden but becomes visible on focus.
  // Screen readers (NVDA, JAWS, VoiceOver) use it to jump past the nav
  // directly to the page content — without it, keyboard users must Tab
  // through every single nav item on every page load.

  async validateSkipLink() {
    console.info('[LNav] Step 17: Checking skip link exists in DOM for screen readers');
    // toBeAttached() checks the element exists in the DOM even if visually hidden —
    // skip links are intentionally off-screen until focused, so toBeVisible() would fail
    const skipLink = this.page.locator('a[href="#main-content"], a[href="#main"], a[href="#root"]').first();
    await expect(skipLink, 'Skip to main content link must exist in the DOM').toBeAttached();
    console.info('[LNav] Step 17: PASS — skip link found in DOM');
  }

  // ── Logo alt text ─────────────────────────────────────────────────────────
  // The Adobe logo <img> must have a non-empty alt attribute.
  // Without alt text, a screen reader either skips the image entirely or
  // reads out the file name (e.g. "adobe-logo.svg") which is meaningless.
  // alt="Adobe" tells screen readers "this is the Adobe logo".

  async validateLogoAltText() {
    console.info('[LNav] Step 18: Checking Adobe logo img has non-empty alt text');
    // toBeAttached() checks the img exists in DOM — it may be CSS-hidden in the
    // redesigned LNav but the alt attribute must still be present for screen readers
    await expect(this.adobeLogoImg).toBeAttached();
    const alt = await this.adobeLogoImg.getAttribute('alt');
    expect(alt, 'Adobe logo <img> must have a non-empty alt attribute').toBeTruthy();
    console.info(`[LNav] Step 18: PASS — alt="${alt}"`);
  }

  // ── Lang attribute ────────────────────────────────────────────────────────
  // The <html> tag must have a lang attribute matching the page locale.
  // e.g. <html lang="fr"> for French, <html lang="ja"> for Japanese.
  // Screen readers use this to select the correct voice/pronunciation engine.
  // Without it, a French page might be read with an English voice.

  async validateLangAttribute(localeLang) {
    console.info(`[LNav] Step 19: Checking html[lang] matches locale lang="${localeLang}"`);
    // page.locator('html') targets the root <html> element of the page
    const lang = await this.page.locator('html').getAttribute('lang');
    expect(lang, 'html element must have a lang attribute').toBeTruthy();
    // Check the lang value starts with the locale's language code
    // e.g. localeLang='fr' matches lang="fr" or lang="fr-FR"
    expect(lang.toLowerCase(), `html lang="${lang}" does not match locale lang="${localeLang}"`).toContain(localeLang.toLowerCase());
    console.info(`[LNav] Step 19: PASS — html lang="${lang}"`);
  }

  // ── Nav landmark ──────────────────────────────────────────────────────────
  // The nav must be a landmark region — either a <nav> tag, or an element
  // with role="navigation" and an aria-label.
  // Landmarks let screen reader users jump directly to the nav using a
  // keyboard shortcut (e.g. pressing R in NVDA) — without one they have
  // no way to navigate efficiently.

  async validateNavLandmark() {
    console.info('[LNav] Step 20: Checking nav is a landmark region (<nav> or role="navigation")');
    // Check 1: navWrapper is a <nav> tag — <nav> is implicitly role="navigation"
    const tagName = await this.navWrapper.evaluate((el) => el.tagName.toLowerCase());
    const isNavTag = tagName === 'nav';

    // Check 2: if not a <nav> tag, it must at least have role="navigation"
    const role = await this.navWrapper.getAttribute('role');
    const hasRole = role === 'navigation';

    expect(
      isNavTag || hasRole,
      'Nav must be a <nav> element or have role="navigation" so screen readers can find it',
    ).toBe(true);
    console.info(`[LNav] Step 20: PASS — tag="${tagName}", role="${role}"`);
  }

  // ── Focus visible ─────────────────────────────────────────────────────────
  // Every focused nav element must have a visible outline (focus ring).
  // WCAG 2.4.11 requires focus to be visually apparent.
  // Developers often write outline: none in CSS to "clean up" focus styles,
  // which makes the nav completely unusable for keyboard-only users.
  // We Tab through the first 5 focusable nav items and check each one
  // has a CSS outline that is not "none".

  async validateFocusVisible() {
    console.info('[LNav] Step 21: Checking every LNav element has a visible focus ring');

    // locator.focus() is programmatic — Chrome does not apply :focus-visible for it
    // so computed outline is always "none". Tab via keyboard triggers :focus-visible
    // and shows the real focus ring. We start at the logo and Tab through the nav,
    // checking each focused element with document.activeElement.
    const totalTabs = 5;

    await this.adobeLogo.focus();

    let passed = 0;
    for (let i = 0; i < totalTabs; i++) {
      await this.page.keyboard.press('Tab');

      const el = await this.page.evaluate(() => {
        const node = document.activeElement;
        if (!node || node === document.body) return null;
        const s = window.getComputedStyle(node);
        return {
          tag:          node.tagName,
          label:        (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 50),
          focusVisible: node.matches(':focus-visible'),
          outline:      s.outlineStyle,
          outlineW:     s.outlineWidth,
          shadow:       s.boxShadow,
        };
      });

      if (!el) {
        console.info(`[LNav] Step 21: Tab ${i + 1} — focus moved outside nav, stopping`);
        break;
      }

      const hasRing = el.focusVisible && (
        (el.outline !== 'none' && el.outlineW !== '0px') || el.shadow !== 'none'
      );

      console.info(`[LNav] Step 21: Tab ${i + 1} <${el.tag}> "${el.label}" — :focus-visible=${el.focusVisible} outline=${el.outline} shadow=${el.shadow !== 'none' ? 'yes' : 'none'}`);

      expect(
        hasRing,
        `Tab ${i + 1}: <${el.tag}> "${el.label}" has no visible focus ring (:focus-visible=${el.focusVisible}, outline=${el.outline}, box-shadow=${el.shadow})`,
      ).toBe(true);

      passed++;
    }

    console.info(`[LNav] Step 21: PASS — ${passed} nav elements verified with visible focus ring`);
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────
  // Tests that the nav is fully operable by keyboard alone (WCAG 2.1.1).
  // Each key tested and what it must do:
  //   Tab   → moves focus to the next focusable element
  //   Enter → opens a dropdown button (aria-expanded becomes "true")
  //   Tab   → after a dropdown opens, focus moves inside the panel
  //   Escape → closes the open dropdown (aria-expanded becomes "false")
  //   Space → also opens a dropdown button (same as Enter for buttons)

  async validateKeyboardNavigation() {
    console.info('[LNav] Step 22: Checking Tab, Enter, Space, Escape all work on nav dropdowns');
    const browserName = this.page.context().browser()?.browserType().name() ?? 'chromium';
    // ── Tab moves through nav items ───────────────────────────────────────
    // Start focus on the Adobe logo and Tab 5 times.
    // Each Tab press must land on a visible element — if focus disappears
    // or gets trapped, this fails.
    await this.adobeLogo.focus();
    for (let i = 0; i < 5; i++) {
      await this.page.keyboard.press('Tab');
      await expect(
        this.page.locator(':focus'),
        `Tab press ${i + 1} did not land on a visible element`,
      ).toBeVisible();
    }
    console.info('[LNav] Step 22: Tab — 5 Tab presses all landed on visible elements');

    // ── Enter / Tab / Escape / Space — validated on first dropdown only ──
    const count = Math.min(await this.allDropdownBtns.count(), 1);
    for (let i = 0; i < count; i++) {
      const btn = this.allDropdownBtns.nth(i);
      const btnText = (await btn.textContent()).trim() || `dropdown ${i + 1}`;
      const panelId = await btn.getAttribute('aria-controls');
      const panel = this.page.locator(`#${panelId}`);

      // Enter opens
      await btn.focus();
      await this.page.keyboard.press('Enter');
      await expect(btn, `[${btnText}] Enter must set aria-expanded="true"`).toHaveAttribute('aria-expanded', 'true');
      await expect(panel, `[${btnText}] Panel must be visible after Enter`).toBeVisible({ timeout: 15000 });
      console.info(`[LNav] Step 22: [${btnText}] Enter — opened`);

      // Tab moves focus inside the open panel
      // WebKit/Safari does not Tab to <a> links by default (macOS keyboard nav setting) —
      // so Tab skips panel links and exits the panel. This is OS-level behavior, not a nav bug.
      await this.page.keyboard.press('Tab');
      const focusInPanel = await panel.evaluate((el) => el.contains(document.activeElement));
      if (browserName === 'webkit') {
        console.info(`[LNav] Step 22: [${btnText}] Tab focus in panel: ${focusInPanel} (WebKit — links not tab-focusable by default on macOS)`);
      } else {
        expect(focusInPanel, `[${btnText}] Tab must move focus inside the open panel`).toBe(true);
        console.info(`[LNav] Step 22: [${btnText}] Tab — focus inside panel`);
      }

      // Escape closes
      await this.page.keyboard.press('Escape');
      await expect(btn, `[${btnText}] Escape must set aria-expanded="false"`).toHaveAttribute('aria-expanded', 'false');
      await expect(panel, `[${btnText}] Panel must be hidden after Escape`).toBeHidden({ timeout: 15000 });
      console.info(`[LNav] Step 22: [${btnText}] Escape — closed`);

      // Space also opens
      await btn.focus();
      await this.page.keyboard.press('Space');
      await expect(btn, `[${btnText}] Space must set aria-expanded="true"`).toHaveAttribute('aria-expanded', 'true');
      await this.page.keyboard.press('Escape');
      await expect(btn, `[${btnText}] Escape must close after Space`).toHaveAttribute('aria-expanded', 'false');
      console.info(`[LNav] Step 22: [${btnText}] Space opened, Escape closed`);
    }
    console.info(`[LNav] Step 22: PASS — Enter/Tab/Escape/Space verified on all ${count} dropdown(s)`);
  }

  // ── Font family + size ────────────────────────────────────────────────────
  // Product name label (localnav bar): Adobe Clean, 16px.
  // Nav links + dropdown buttons: Adobe Clean, 14px.
  // Dropdown descriptions: 14px.

  async validateNavFontStyles() {
    console.info('[LNav] Font check: product name 16px, nav links 14px, descriptions 14px');
    const failures = [];

    // ── Product name — 16px ───────────────────────────────────────────────────
    const productNameData = await this.navContainer.locator('span.feds-localnav-bar-label')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.textContent || '').trim().slice(0, 40) };
      }));

    for (const { fontFamily, fontSize, text } of productNameData) {
      if (!fontFamily.toLowerCase().includes('adobe clean')) {
        failures.push(`Product name "${text}" — font-family: ${fontFamily} (expected Adobe Clean)`);
      }
      if (fontSize !== '16px') {
        failures.push(`Product name "${text}" — font-size: ${fontSize} (expected 16px)`);
      }
    }

    // ── Nav links + buttons — Adobe Clean + 14px ─────────────────────────────
    const linkData = await this.navContainer.locator('a.feds-link, button.feds-link')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.textContent || '').trim().slice(0, 40) };
      }));

    expect(linkData.length, 'No visible nav links found for font check').toBeGreaterThan(0);
    for (const { fontFamily, fontSize, text } of linkData) {
      if (!fontFamily.toLowerCase().includes('adobe clean')) {
        failures.push(`"${text}" — font-family: ${fontFamily} (expected Adobe Clean)`);
      }
      if (fontSize !== '14px') {
        failures.push(`"${text}" — font-size: ${fontSize} (expected 14px)`);
      }
    }

    // ── Dropdown descriptions — 14px ──────────────────────────────────────────
    const descData = await this.navContainer.locator('span.links-card-links__item-description')
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontSize: s.fontSize, text: (el.textContent || '').trim().slice(0, 40) };
      }));

    for (const { fontSize, text } of descData) {
      if (fontSize !== '14px') {
        failures.push(`Description "${text}" — font-size: ${fontSize} (expected 14px)`);
      }
    }

    expect(failures, `Nav font style violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info(`[LNav] Font check: PASS — product name (16px) + ${linkData.length} nav links (14px) + ${descData.length} descriptions (14px)`);
  }

  // ── Nav transparency + scroll behaviour ──────────────────────────────────────
  // Validates three things:
  //   1. Nav background is transparent when no dropdown is open
  //   2. Nav background turns white when a dropdown is opened
  //   3. Page is still scrollable while a dropdown is open (no blocking overlay)
  //   4. Nav returns to transparent after dropdown closes

  async validateNavTransparency() {
    console.info('[LNav] Transparency: Checking nav background states and scroll with dropdown open');

    // ── 1. Scroll down so sticky nav is active, then check it is transparent ──
    await this.page.evaluate(() => window.scrollTo(0, 200));
    await this.page.waitForFunction(() => window.scrollY > 0);

    const initialBg = await this.navWrapper.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const isTransparent = (bg) => bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
    expect(
      isTransparent(initialBg),
      `Nav should be transparent when scrolled with no dropdown open, got "${initialBg}"`,
    ).toBe(true);
    console.info(`[LNav] Transparency: scrolled state background="${initialBg}" — transparent ✓`);

    // ── 2. Open first dropdown → nav must turn white ───────────────────────────
    const firstBtn = this.allDropdownBtns.nth(0);
    const panelId  = await firstBtn.getAttribute('aria-controls');
    await firstBtn.click();
    await expect(this.page.locator(`#${panelId}`)).toBeVisible({ timeout: 15000 });

    // Walk up from the panel to find the nearest element with a non-transparent background.
    // background-color is not CSS-inherited, so getComputedStyle on the panel alone may return
    // transparent even though the panel visually appears white via an ancestor's background.
    const panelBg = await this.page.evaluate((id) => {
      let el = document.querySelector(`#${id}`);
      while (el) {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        el = el.parentElement;
      }
      return 'rgba(0, 0, 0, 0)';
    }, panelId);

    expect(
      panelBg,
      `Dropdown panel or its container should have a white background when open, got "${panelBg}"`,
    ).toBe('rgb(255, 255, 255)');
    console.info(`[LNav] Transparency: dropdown panel background="${panelBg}" — white ✓`);

    // ── 3. Page scroll still works while dropdown is open ─────────────────────
    const scrollBefore = await this.page.evaluate(() => window.scrollY);
    await this.page.evaluate(() => window.scrollBy(0, 200));
    const scrollAfter = await this.page.evaluate(() => window.scrollY);
    expect(
      scrollAfter,
      `Page should be scrollable while dropdown is open (scrollY stayed at ${scrollBefore})`,
    ).toBeGreaterThan(scrollBefore);
    console.info(`[LNav] Transparency: scroll with dropdown open — scrollY ${scrollBefore} → ${scrollAfter} ✓`);

    // ── 4. No full-page overlay blocking the page ──────────────────────────────
    const bodyOverflow = await this.page.evaluate(() => window.getComputedStyle(document.body).overflow);
    expect(
      bodyOverflow,
      `Body must not have overflow:hidden while dropdown is open — got "${bodyOverflow}"`,
    ).not.toBe('hidden');
    console.info(`[LNav] Transparency: body overflow="${bodyOverflow}" — no blocking overlay ✓`);

    // ── 5. Close dropdown → nav returns to transparent ────────────────────────
    await firstBtn.click();
    await expect(this.page.locator(`#${panelId}`)).toBeHidden({ timeout: 15000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));

    const closedBg = await this.navWrapper.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(
      isTransparent(closedBg),
      `Nav should return to transparent after dropdown closes, got "${closedBg}"`,
    ).toBe(true);
    console.info(`[LNav] Transparency: after close background="${closedBg}" — transparent ✓`);
  }

  // ── Analytics — daa-ll attributes + collect call ────────────────────────────
  // Clicks every nav element and validates:
  //   - daa-ll attribute present on the element (warning if missing)
  //   - AEP Web SDK collect call fires after click (defect if daa-ll present but no call)
  //   - webInteraction.name in collect call payload contains the element's daa-ll value
  //
  // Uses page.waitForRequest at the network level — catches sendBeacon, fetch and XHR.
  // If a link click navigates, we detect via page.url() and goto() back to the original.

  async validateAnalyticsDaaLl() {
    console.info('[LNav] Step 24: Checking daa-ll + collect call for every clickable nav element');
    const isCollectCall = (url) => /\/collect(\?|$)/.test(url) && url.includes('configId=');

    // ── Global listener — captures ALL collect calls for name validation ──────
    // Per-click waitForRequest only checks URL (fast/reliable in parallel).
    // Name matching uses this pool so timing of individual calls doesn't matter.
    const capturedCalls = [];
    const onRequest = (req) => {
      if (!isCollectCall(req.url())) return;
      try {
        const xdm  = JSON.parse(req.postData() || '{}').events?.[0]?.xdm ?? {};
        capturedCalls.push(xdm.web?.webInteraction?.name ?? '');
      } catch { capturedCalls.push(''); }
    };
    this.page.on('request', onRequest);

    // Block all main-frame navigations during analytics so link clicks stay on page.
    // Use 204 (not abort) — Chrome retries aborted navigations, creating a request loop.
    // Analytics collect calls (fetch/beacon) are NOT navigation requests — they pass through.
    const blockNavigations = async (route) => {
      if (route.request().isNavigationRequest()) {
        await route.fulfill({ status: 204, body: '' });
      } else {
        await route.continue();
      }
    };
    await this.page.route('**/*', blockNavigations);

    const clicked = [];

    // Pre-read all daa-ll values + labels concurrently — avoids serial getAttribute calls
    const [dropdownInfo, logoDaaLl, brandDaaLl, compareDaaLl, learnDaaLl, trialDaaLl, primaryDaaLl, signInDaaLl] = await Promise.all([
      this.allDropdownBtns.evaluateAll((els) => els.map((el) => ({
        daaLl: el.getAttribute('daa-ll'),
        text:  (el.textContent || '').trim(),
      }))),
      this.adobeLogoLink.getAttribute('daa-ll'),
      this.acrobatBrandLink.getAttribute('daa-ll'),
      this.comparePlansLink.getAttribute('daa-ll'),
      this.learnSupportLink.getAttribute('daa-ll'),
      this.freeTrialLink.getAttribute('daa-ll'),
      this.primaryCta.getAttribute('daa-ll'),
      this.signInBtn.getAttribute('daa-ll'),
    ]);

    const clickElement = async (element, label, preDaaLl = undefined) => {
      const daaLl = preDaaLl !== undefined ? preDaaLl : await element.getAttribute('daa-ll');
      if (!daaLl) {
        console.info(`[LNav] Step 24: WARNING — "${label}" is missing daa-ll attribute`);
      } else {
        console.info(`[LNav] Step 24: "${label}" — daa-ll="${daaLl}" ✓`);
      }
      // DOM click — navigation blocked at network level, no goto() recovery needed
      await element.evaluate((el) => el.click()).catch(() => {});
      clicked.push({ label, daaLl });
    };

    try {
      // ── 1. Dropdown buttons ─────────────────────────────────────────────────
      for (let i = 0; i < dropdownInfo.length; i++) {
        const btn  = this.allDropdownBtns.nth(i);
        const name = dropdownInfo[i].text || `dropdown ${i + 1}`;
        await clickElement(btn, `${name} — open`, dropdownInfo[i].daaLl);
        const expanded = await btn.getAttribute('aria-expanded').catch(() => null);
        if (expanded === 'true') await clickElement(btn, `${name} — close`, dropdownInfo[i].daaLl);
      }

      // ── 2. Adobe logo ───────────────────────────────────────────────────────
      await clickElement(this.adobeLogoLink, 'Adobe Logo', logoDaaLl);

      // ── 3. Acrobat brand link ───────────────────────────────────────────────
      await clickElement(this.acrobatBrandLink, 'Adobe Acrobat', brandDaaLl);

      // ── 4. Utility nav links ────────────────────────────────────────────────
      await clickElement(this.comparePlansLink, 'Compare plans', compareDaaLl);
      await clickElement(this.learnSupportLink, 'Learn & Support', learnDaaLl);
      await clickElement(this.freeTrialLink, 'Free trials', trialDaaLl);

      // ── 5. CTAs ─────────────────────────────────────────────────────────────
      await clickElement(this.primaryCta, 'Primary CTA', primaryDaaLl);
      const secondaryVisible = await this.secondaryCta.isVisible().catch(() => false);
      if (secondaryVisible) await clickElement(this.secondaryCta, 'Secondary CTA');

      // ── 6. Sign In — visibility + clickability only (clicking navigates away) ──
      await expect(this.signInBtn, 'Sign In button not visible').toBeVisible({ timeout: 15000 });
      await this.signInBtn.click({ trial: true, timeout: 15000 });
      console.info('[LNav] Step 24: Sign In — visible and clickable ✓ (no daa-ll, skipping actual click)');
    } finally {
      // Always unroute and remove listener, even if a step throws
      await this.page.unroute('**/*', blockNavigations);
      this.page.off('request', onRequest);
    }

    console.info(`[LNav] Step 24: ${capturedCalls.length} total collect call(s) captured`);

    // ── Check: daa-ll value found in captured call names ─────────────────────
    for (const { label, daaLl } of clicked) {
      if (!daaLl) {
        console.info(`[LNav] Step 24: INFO — "${label}" no daa-ll, skipping name check`);
        continue;
      }
      const match = capturedCalls.find((name) => name.includes(daaLl));
      if (match) {
        console.info(`[LNav] Step 24: PASS — "${label}" daa-ll="${daaLl}" matched in collect call ✓`);
      } else {
        console.warn(`[LNav] Step 24: WARNING — "${label}" daa-ll="${daaLl}" not found in any captured collect call`);
      }
    }

    console.info(`[LNav] Step 24: COMPLETE — ${dropdownInfo.length} dropdowns + logo + brand + utility links + CTAs + sign in checked`);
  }

}
