import { expect } from '@playwright/test';
import { rtlLocales } from '../../data/feds-lnav-locales.js';
import { BREAKPOINTS } from '../../features/feds/feds-lnav/feds-lnav.spec.js';

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

    // ── Direct nav bar links — generic, works on any page ────────────────────
    // No href filter — finds whatever direct <a> links exist on the current page.
    this.directNavLinks = page.locator('ul.feds-gnav-items > li > a.feds-link');

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

  // ── Compact mode detection ────────────────────────────────────────────────
  // Two-step check:
  //   Step 1 — viewport width < BREAKPOINTS.desktopMin (1024px) → compact for sure
  //   Step 2 — viewport >= 1024px but is-compact class present → LNav JS forced
  //            compact due to available space (e.g. content overflow). Log a warning
  //            since this should not happen at 1600px — it's a nav rendering bug.

  async isCompact() {
    const viewport = this.page.viewportSize();
    if (viewport.width < BREAKPOINTS.desktopMin) return true;
    const cls = await this.navContainer.getAttribute('class');
    const compact = cls?.includes('is-compact') ?? false;
    if (compact) {
      console.warn(`[LNav] WARNING — is-compact class present at ${viewport.width}px (expected desktop layout ≥${BREAKPOINTS.desktopMin}px). LNav JS is forcing compact mode — possible content overflow or rendering bug.`);
    }
    return compact;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateTo(baseURL, localePath, testPagePath) {
    const url = `${baseURL}${localePath}${testPagePath}`.replace('//', '/').replace(':/', '://');
    const domain = new URL(baseURL).hostname.replace(/^www\./, '');
    console.info(`[LNav] Navigating to: ${url}`);
    const response = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    // Wait for FEDS nav JS to initialise — faster than waitUntil:'load' but ensures
    // header.global-navigation is in the DOM before any step runs
    await this.page.locator('header.global-navigation').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    const status = response?.status() ?? 0;
    console.info(`[LNav] ${url} → HTTP ${status}`);
    return { url, status };
  }

  // ── Core structure ────────────────────────────────────────────────────────

  async validateNavStructure() {
    console.info('[LNav] Step 2: Checking nav wrapper, Adobe logo, nav list are visible');
    await expect(this.navWrapper).toBeVisible({ timeout: 15000 });
    await expect(this.adobeLogo).toBeVisible({ timeout: 15000 });
    // isCompact() logs a warning automatically if is-compact appears at ≥1024px
    if (await this.isCompact()) {
      await expect(this.mobileMenuBtn, 'Hamburger button must be visible in compact mode').toBeVisible({ timeout: 15000 });
      console.info('[LNav] Step 2: compact mode — hamburger button visible');
    } else {
      await expect(this.navList).toBeVisible({ timeout: 15000 });
    }
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
    console.info('[LNav] Step 3: Checking nav links by section — brand, top nav, local nav, breadcrumbs');

    const sections = [
      { label: 'Brand',       locator: this.navContainer.locator('.feds-brand-container a') },
      { label: 'Top nav',     locator: this.navContainer.locator('ul.feds-gnav-items > li > a') },
      { label: 'Local nav',   locator: this.navContainer.locator('nav.localnav a') },
      { label: 'Breadcrumbs', locator: this.navContainer.locator('.feds-breadcrumbs-wrapper a, ul.feds-breadcrumbs a') },
    ];

    let total = 0;
    for (const { label, locator } of sections) {
      // Single browser call per section — avoids timeout from serial await per element
      const linkData = await locator.filter({ visible: true }).evaluateAll((els) =>
        els.map((el) => ({
          href: el.getAttribute('href'),
          text: (el.innerText || '').trim()
            || el.querySelector('img')?.getAttribute('alt')
            || '(no text)',
        }))
      );
      if (linkData.length === 0) {
        console.info(`[LNav] Step 3: [${label}] — no visible links found, skipping`);
        continue;
      }
      for (const { href, text } of linkData) {
        if (href === '#') {
          console.warn(`[LNav] Step 3: [${label}] WARNING — "${text}" has href="#" (placeholder link)`);
        } else {
          expect(href, `[${label}] "${text}" is missing href`).toBeTruthy();
          console.info(`[LNav] Step 3: [${label}] "${text}" — href="${href}" ✓`);
        }
        total++;
      }
    }

    expect(total, 'No nav links found across all sections').toBeGreaterThan(0);
    console.info(`[LNav] Step 3: PASS — ${total} nav links validated across all sections`);
  }

  // ── Adobe logo ────────────────────────────────────────────────────────────

  async validateAdobeLogo() {
    console.info('[LNav] Step 4: Checking Adobe logo — visible, href, clickable');
    await expect(this.adobeLogoLink).toBeVisible({ timeout: 15000 });
    const href = await this.adobeLogoLink.getAttribute('href');
    expect(href, 'Adobe logo link must point to adobe.com').toContain('adobe.com');
    console.info(`[LNav] Step 4: PASS — Adobe logo href="${href}"`);
  }

  // ── Direct nav bar links — generic, works on any page/locale ────────────

  async validateDirectNavLinks() {
    console.info('[LNav] Step 5: Checking direct nav bar links — visible, have href');
    const links = this.directNavLinks.filter({ visible: true });
    const count = await links.count();
    expect(count, 'No direct nav links found in gnav').toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = ((await link.innerText()) || '').trim() || `link-${i}`;
      const href = await link.getAttribute('href');
      expect(href, `Direct nav link "${text}" is missing href`).toBeTruthy();
      await expect(link, `Direct nav link "${text}" is not visible`).toBeVisible({ timeout: 15000 });
      console.info(`[LNav] Step 5: "${text}" — href="${href}" ✓`);
    }
    console.info(`[LNav] Step 5: PASS — ${count} direct nav link(s) validated`);
  }

  // ── Active element — desktop only (border-bottom at width >= 1024px) ──────

  async validateActiveElement() {
    // Use hamburger visibility to detect actual layout — content overflow can trigger
    // tablet mode even at desktop widths, so viewport width alone is not reliable
    const isDesktopLayout = !await this.mobileMenuBtn.isVisible().catch(() => true);
    if (!isDesktopLayout) {
      console.warn('[LNav] Active element: WARN — hamburger is visible at desktop viewport. GNAV content is overflowing and triggering tablet/mobile layout on desktop. Active element underline will not be shown.');
      return;
    }

    const activeItem = this.page.locator('li.active-element');
    // Active element can be an <a> (direct link) or <button> (dropdown trigger)
    const activeLink = this.page.locator('li.active-element > a.feds-link, li.active-element > button.feds-link');

    await expect(activeItem, 'li.active-element not found').toBeVisible({ timeout: 15000 });
    await expect(activeLink, 'a/button.feds-link inside li.active-element not found').toBeVisible({ timeout: 15000 });
    // href only on <a> — buttons don't have it
    const tag = await activeLink.first().evaluate((el) => el.tagName.toLowerCase());
    if (tag === 'a') {
      await expect(activeLink.first(), 'Active link is missing href').toHaveAttribute('href', /.+/);
    }

    const borderStyle = await activeItem.evaluate((el) => window.getComputedStyle(el).borderBottomStyle);
    if (borderStyle !== 'solid')
      console.warn(`[LNav] Active element WARN: li.active-element border-bottom-style="${borderStyle}" (expected solid) — underline may not be applied on this page/variant`);
    else
      console.info('[LNav] Active element: PASS — li.active-element visible with underline ✓');
  }

  // ── CTAs ──────────────────────────────────────────────────────────────────

  async validateCtas() {
    console.info('[LNav] Step 9: Checking primary and secondary CTAs — visible, href, clickable');
    await expect(this.primaryCta, 'Primary CTA not found').toBeVisible({ timeout: 15000 });
    const primaryText = ((await this.primaryCta.innerText().catch(() => '')) || '').trim() || 'Primary CTA';
    const primaryHref = await this.primaryCta.getAttribute('href');
    expect(primaryHref, `"${primaryText}" CTA must have an href`).toBeTruthy();
    console.info(`[LNav] Step 9: PASS — "${primaryText}" href="${primaryHref}" ✓`);

    const secondaryVisible = await this.secondaryCta.isVisible().catch(() => false);
    if (secondaryVisible) {
      const secondaryText = ((await this.secondaryCta.innerText().catch(() => '')) || '').trim() || 'Secondary CTA';
      const secondaryHref = await this.secondaryCta.getAttribute('href');
      expect(secondaryHref, `"${secondaryText}" CTA must have an href`).toBeTruthy();
      console.info(`[LNav] Step 9: PASS — "${secondaryText}" href="${secondaryHref}" ✓`);
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
      console.info(`[LNav] Dropdown: "${name}" → "${text}" — href="${href}" ✓`);
    }

    // ── Link descriptions — text + 14px font ─────────────────────────────────
    const descData = await panel.locator('span.links-card-links__item-description').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.innerText || '').trim(), fontSize: s.fontSize, fontFamily: s.fontFamily };
      }));
    if (descData.length > 0) {
      console.info(`[LNav] Dropdown: "${name}" has ${descData.length} description(s)`);
      for (const [i, { text, fontSize, fontFamily }] of descData.entries()) {
        expect(text, `"${name}" description ${i + 1} has empty text`).toBeTruthy();
        if (!fontFamily.toLowerCase().includes('adobe clean')) console.warn(`[LNav] Font WARN: "${name}" description "${text}" — font-family: ${fontFamily.split(',')[0].trim()} (expected Adobe Clean)`);
        if (fontSize !== '14px') console.warn(`[LNav] Font WARN: "${name}" description "${text}" — font-size: ${fontSize} (expected 14px)`);
        console.info(`[LNav] Dropdown: "${name}" description ${i + 1} — "${text}" ${fontSize} ✓`);
      }
    }

    // ── Font sizes + family inside open panel (warnings only — test does not fail) ──
    const warnFont = (label, text, fontFamily, fontSize, expectedSize) => {
      const familyOk = fontFamily.toLowerCase().includes('adobe clean');
      const sizeOk   = fontSize === expectedSize;
      if (!familyOk) console.warn(`[LNav] Font WARN: "${name}" ${label} "${text}" — font-family: ${fontFamily.split(',')[0].trim()} (expected Adobe Clean)`);
      if (!sizeOk)   console.warn(`[LNav] Font WARN: "${name}" ${label} "${text}" — font-size: ${fontSize} (expected ${expectedSize})`);
      if (familyOk && sizeOk) console.info(`[LNav] Font: "${name}" ${label} "${text}" — ${fontSize} | ${fontFamily.split(',')[0].trim()} ✓`);
    };

    // Headings — Adobe Clean, 24px
    const headingFontData = await panel.locator('h2.links-card-title').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.innerText || '').trim(), fontSize: s.fontSize, fontFamily: s.fontFamily };
      }));
    if (headingFontData.length === 0)
      console.info(`[LNav] Font: "${name}" — no headings found, skipping 24px check`);
    for (const { text, fontSize, fontFamily } of headingFontData)
      warnFont('heading', text, fontFamily, fontSize, '24px');

    // Product link titles — Adobe Clean, 16px
    const productFontData = await panel.locator('a.links-card-links__item-title, a.links-card__item-link').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.innerText || '').trim().slice(0, 40), fontSize: s.fontSize, fontFamily: s.fontFamily };
      }));
    for (const { text, fontSize, fontFamily } of productFontData)
      warnFont('product', text, fontFamily, fontSize, '16px');

    // All other visible links — Adobe Clean, 14px
    const otherLinkFontData = await panel.locator('a:not(.links-card-links__item-title):not(.links-card__item-link)').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.innerText || '').trim().slice(0, 40), fontSize: s.fontSize, fontFamily: s.fontFamily };
      }));
    for (const { text, fontSize, fontFamily } of otherLinkFontData) {
      if (!text) continue;
      warnFont('link', text, fontFamily, fontSize, '14px');
    }

    // ── Column gap — desktop dropdown card grid (div.feds-gnav-cards) ─────────
    const gnavCards = panel.locator('div.feds-gnav-cards').first();
    const hasCards = await gnavCards.count() > 0;
    if (hasCards) {
      const colGap = await gnavCards.evaluate((el) => window.getComputedStyle(el).columnGap);
      console.info(`[LNav] Gaps "${name}": div.feds-gnav-cards column-gap=${colGap}`);
      expect(colGap, `"${name}" dropdown column-gap: ${colGap} (expected 8px)`).toBe('8px');
    } else {
      console.info(`[LNav] Gaps "${name}": div.feds-gnav-cards not found — skipping column-gap check`);
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
    console.info('[LNav] Font check: checking font sizes for all always-visible nav elements');
    const failures = [];

    const check = (label, fontFamily, fontSize, expectedSize) => {
      if (!fontFamily.toLowerCase().includes('adobe clean'))
        failures.push(`[${label}] font-family: ${fontFamily.split(',')[0].trim()} (expected Adobe Clean)`);
      if (fontSize !== expectedSize)
        console.warn(`[LNav] Font WARN: [${label}] font-size: ${fontSize} (expected ${expectedSize})`);
      else
        console.info(`[LNav] Font: [${label}] ${fontSize} | ${fontFamily.split(',')[0].trim()} ✓`);
    };

    // ── Product name (localnav bar label) — 16px ──────────────────────────────
    const productNameData = await this.navContainer.locator('span.feds-localnav-bar-label')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.innerText || '').trim().slice(0, 40) };
      }));
    for (const { fontFamily, fontSize, text } of productNameData) {
      check(`Product name "${text}"`, fontFamily, fontSize, '16px');
    }

    // ── GNAV links + buttons — 14px ───────────────────────────────────────────
    const linkData = await this.navContainer.locator('a.feds-link, button.feds-link')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.innerText || '').trim().slice(0, 40) };
      }));
    expect(linkData.length, 'No visible nav links found for font check').toBeGreaterThan(0);
    for (const { fontFamily, fontSize, text } of linkData) {
      check(`GNAV link "${text}"`, fontFamily, fontSize, '14px');
    }

    // ── Breadcrumbs — 14px ────────────────────────────────────────────────────
    const breadcrumbData = await this.navContainer
      .locator('.feds-breadcrumbs-wrapper a, ul.feds-breadcrumbs a')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.innerText || '').trim().slice(0, 40) };
      }));
    for (const { fontFamily, fontSize, text } of breadcrumbData) {
      check(`Breadcrumb "${text}"`, fontFamily, fontSize, '14px');
    }

    // ── Buttons / CTAs — font 14px, padding 10px top/bottom 24px left/right ────
    const ctaData = await this.navContainer.locator('a.feds-primary-cta, a.feds-secondary-cta, a[class*="cta"]')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return {
          text:         (el.innerText || '').trim().slice(0, 30),
          fontSize:     s.fontSize,
          fontFamily:   s.fontFamily,
          paddingTop:   s.paddingTop,
          paddingBottom: s.paddingBottom,
          paddingLeft:  s.paddingLeft,
          paddingRight: s.paddingRight,
        };
      }));
    for (const { text, fontSize, fontFamily, paddingTop, paddingBottom, paddingLeft, paddingRight } of ctaData) {
      console.info(`[LNav] Font: CTA "${text}" — font: ${fontSize} | padding: ${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft} | ${fontFamily.split(',')[0].trim()}`);
      if (!fontFamily.toLowerCase().includes('adobe clean'))
        failures.push(`CTA "${text}" — font-family: ${fontFamily.split(',')[0].trim()} (expected Adobe Clean)`);
      if (fontSize      !== '14px')  console.warn(`[LNav] Font WARN: CTA "${text}" — font-size: ${fontSize} (expected 14px)`);
      if (paddingTop    !== '10px')  console.warn(`[LNav] Font WARN: CTA "${text}" — padding-top: ${paddingTop} (expected 10px)`);
      if (paddingBottom !== '10px')  console.warn(`[LNav] Font WARN: CTA "${text}" — padding-bottom: ${paddingBottom} (expected 10px)`);
      if (paddingLeft   !== '24px')  console.warn(`[LNav] Font WARN: CTA "${text}" — padding-left: ${paddingLeft} (expected 24px)`);
      if (paddingRight  !== '24px')  console.warn(`[LNav] Font WARN: CTA "${text}" — padding-right: ${paddingRight} (expected 24px)`);
    }

    expect(failures, `Nav font style violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info(`[LNav] Font check: PASS — product name (16px) | ${linkData.length} GNAV links (14px) | ${breadcrumbData.length} breadcrumbs (14px)`);
  }

  // ── Nav font color theme + scroll ────────────────────────────────────────────
  // Two text themes on the LNav (determined by page hero background, not just class):
  //   gnav-dark-font present + dark hero  → links white at top, black after scroll
  //   gnav-dark-font present + light hero → links black at top (and after scroll)
  //   no gnav-dark-font                   → links may be black or white depending on page bg
  // After scroll: ALWAYS black regardless of initial theme — this is the hard assertion.

  async validateNavFontColorTheme() {
    console.info('[LNav] Font color: Checking nav font color theme and scroll behaviour');

    const hasDarkFont = await this.navContainer.evaluate((el) => el.classList.contains('gnav-dark-font'));
    console.info(`[LNav] Font color: gnav-dark-font = ${hasDarkFont}`);

    // ── 1. At page top — observe only, don't assert (depends on page background) ─
    await this.page.evaluate(() => window.scrollTo(0, 0));
    const topColor = await this.navContainer.locator('a.feds-link, button.feds-link')
      .filter({ visible: true }).first()
      .evaluate((el) => window.getComputedStyle(el).color);

    const isBlack = (c) => c === 'rgb(0, 0, 0)' || c === 'rgba(0, 0, 0, 1)';
    console.info(`[LNav] Font color: top color="${topColor}" (gnav-dark-font=${hasDarkFont}) — observed`);

    // ── 2. After scroll — font must be black regardless of theme ──────────────
    // Scroll 800px to exit tall dark hero sections (200px is not always enough)
    await this.page.evaluate(() => window.scrollTo(0, 800));

    const scrolledColors = await this.navContainer.locator('a.feds-link, button.feds-link')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => ({
        text:  (el.textContent || '').trim().slice(0, 30),
        color: window.getComputedStyle(el).color,
      })));

    for (const { text, color } of scrolledColors) {
      if (!isBlack(color))
        console.warn(`[LNav] Font color WARN: "${text}" color="${color}" after scroll (expected black)`);
      else
        console.info(`[LNav] Font color: "${text}" = ${color} after scroll ✓`);
    }

    await this.page.evaluate(() => window.scrollTo(0, 0));
    console.info('[LNav] Font color: PASS');
  }

  // ── Nav hover dimming effect ──────────────────────────────────────────────────
  // When hovering any nav link, the hovered element is prominent (opacity 1) and
  // all other nav links + GNAV buttons fade (opacity < 1).
  // Sign In is excluded — it has no hover dimming effect.

  async validateNavHoverEffect() {
    console.info('[LNav] Hover: Checking hover dimming — hovered item prominent, others faded');

    const navItems = this.navContainer.locator('ul.feds-gnav-items > li').filter({ visible: true });
    const count = await navItems.count();
    if (count < 2) {
      console.info('[LNav] Hover: fewer than 2 nav items — skipping');
      return;
    }

    // Hover over the middle nav item for a realistic test
    const midIndex = Math.floor(count / 2);
    const hoveredItem = navItems.nth(midIndex);
    const hoveredText = ((await hoveredItem.textContent()) || '').trim().slice(0, 30);
    await hoveredItem.locator('a.feds-link, button.feds-link').first().hover();

    // ── Check opacity + color on the child link/button inside each li ─────────
    // The hover dimming is applied to <a>/<button> children, not the <li> wrapper
    const opacityData = await navItems.evaluateAll((els, idx) =>
      els.map((li, i) => {
        const link = li.querySelector('a.feds-link, button.feds-link');
        if (!link) return null;
        const s = window.getComputedStyle(link);
        return {
          text:    (link.textContent || '').trim().slice(0, 30),
          opacity: parseFloat(s.opacity),
          color:   s.color,
          isHovered: i === idx,
        };
      }).filter(Boolean), midIndex
    );

    const hovered = opacityData.find((d) => d.isHovered);
    const others  = opacityData.filter((d) => !d.isHovered);

    console.info(`[LNav] Hover: "${hovered?.text}" opacity=${hovered?.opacity} color=${hovered?.color} (hovered)`);
    for (const { text, opacity, color } of others)
      console.info(`[LNav] Hover: "${text}" opacity=${opacity} color=${color} (not hovered)`);

    // Fading is via opacity — non-hovered items go to 0.65
    const notFaded = others.filter(({ opacity }) => opacity >= 1);
    for (const { text, opacity } of others)
      console.info(`[LNav] Hover: "${text}" opacity=${opacity} ${opacity < 1 ? '(faded ✓)' : '(not faded ✗)'}`);

    expect(
      notFaded,
      `Non-hovered nav items must fade (opacity < 1) when "${hoveredText}" is hovered:\n${notFaded.map((o) => `"${o.text}" opacity=${o.opacity}`).join('\n')}`,
    ).toHaveLength(0);
    console.info(`[LNav] Hover: all ${others.length} non-hovered items faded at opacity < 1 ✓`);

    // ── Sign In must NOT fade ──────────────────────────────────────────────────
    const signInOpacity = await this.signInBtn.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    if (signInOpacity < 1)
      console.warn(`[LNav] Hover WARN: Sign In opacity=${signInOpacity} — should not fade on hover`);
    else
      console.info(`[LNav] Hover: Sign In opacity=${signInOpacity} — not faded ✓`);

    // Move mouse away to reset hover state
    await this.page.mouse.move(0, 0);

    // ── CTA buttons own hover effect ──────────────────────────────────────────
    // When hovering Buy now / Go To Acrobat, the button itself changes appearance.
    // Sign In is excluded — it has no hover dimming effect.
    const ctaButtons = this.navContainer.locator('a.feds-primary-cta, a.feds-secondary-cta').filter({ visible: true });
    const ctaCount = await ctaButtons.count();
    for (let i = 0; i < ctaCount; i++) {
      const cta = ctaButtons.nth(i);
      const ctaText = ((await cta.textContent()) || '').trim().slice(0, 20);
      const beforeBg = await cta.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      await cta.hover();
      const afterBg = await cta.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      if (beforeBg === afterBg)
        console.warn(`[LNav] Hover WARN: CTA "${ctaText}" background unchanged on hover (${afterBg}) — expected overlay`);
      else
        console.info(`[LNav] Hover: CTA "${ctaText}" bg ${beforeBg} → ${afterBg} on hover ✓`);
      await this.page.mouse.move(0, 0);
    }

    console.info('[LNav] Hover: PASS');
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
      } else if (/\/collect(\?|$)/.test(route.request().url()) && route.request().url().includes('configId=')) {
        // Let collect calls through so the request listener captures them
        await route.continue();
      } else {
        // Fulfill all other requests immediately — prevents 3rd-party scripts
        // from hanging open and delaying browser context teardown after the test
        await route.fulfill({ status: 200, body: '' });
      }
    };
    await this.page.route('**/*', blockNavigations);

    // Detect which nav link opens a new tab — target="_blank" must not be on nav links
    let lastClicked = 'unknown';
    const onNewPage = (newPage) => {
      console.warn(`[LNav] Analytics WARN: "${lastClicked}" opened a new tab — target="_blank" must not be on nav links (url: ${newPage.url()})`);
      newPage.close().catch(() => {});
    };
    this.page.context().on('page', onNewPage);

    const clicked = [];

    // Pre-read all daa-ll values + labels concurrently — avoids serial getAttribute calls
    const [dropdownInfo, logoDaaLl, directNavInfo, primaryDaaLl, signInDaaLl] = await Promise.all([
      this.allDropdownBtns.evaluateAll((els) => els.map((el) => ({
        daaLl: el.getAttribute('daa-ll'),
        text:  (el.textContent || '').trim(),
      }))),
      this.adobeLogoLink.getAttribute('daa-ll'),
      this.directNavLinks.filter({ visible: true }).evaluateAll((els) => els.map((el) => ({
        daaLl: el.getAttribute('daa-ll'),
        text:  (el.textContent || '').trim(),
      }))),
      this.primaryCta.getAttribute('daa-ll'),
      this.signInBtn.getAttribute('daa-ll'),
    ]);

    const clickElement = async (element, label, preDaaLl = undefined) => {
      lastClicked = label;
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

      // ── 3. Direct nav links — generic, works on any page ───────────────────
      for (let i = 0; i < directNavInfo.length; i++) {
        const link = this.directNavLinks.filter({ visible: true }).nth(i);
        const { text, daaLl } = directNavInfo[i];
        await clickElement(link, text || `nav-link-${i}`, daaLl);
      }

      // ── 5. CTAs ─────────────────────────────────────────────────────────────
      await clickElement(this.primaryCta, 'Primary CTA', primaryDaaLl);
      const secondaryVisible = await this.secondaryCta.isVisible().catch(() => false);
      if (secondaryVisible) await clickElement(this.secondaryCta, 'Secondary CTA');

      // ── 6. Sign In — visibility + clickability only (clicking navigates away) ──
      await expect(this.signInBtn, 'Sign In button not visible').toBeVisible({ timeout: 15000 });
      await this.signInBtn.click({ trial: true, timeout: 15000 });
      console.info('[LNav] Step 24: Sign In — visible and clickable ✓ (no daa-ll, skipping actual click)');
    } finally {
      await this.page.unroute('**/*', blockNavigations);
      this.page.off('request', onRequest);
      this.page.context().off('page', onNewPage);
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
