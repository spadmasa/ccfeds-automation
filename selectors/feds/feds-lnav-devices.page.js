import { expect } from '@playwright/test';
import FedsLnavPage from './feds-lnav.page.js';
import { BREAKPOINTS } from '../../features/feds/feds-lnav/feds-lnav.spec.js';

// Extends the desktop POM — all selectors are identical.
// Mobile/tablet interaction model (Samsung Galaxy S8+, iPhone 15, iPad Pro 11):
//
//  Portrait collapsed:
//    Row 1 — Adobe logo | ≡ hamburger | ⠿ app switcher | Sign In
//    Row 2 — "Product Name" + ▼ (local nav bar)
//
//  Local nav bar tap (▼→▲):
//    Dropdown expands downward — flat list:
//      direct links (Overview, Compare plans, Learn & Support, Free trials)
//      ">" buttons (Features >, Online tools >) → open sub-panels via back-button pattern
//    "Buy now" full-width purple CTA always at the bottom of the dropdown
//
//  "Features >" tap:
//    Entire dropdown content REPLACES with sub-panel — "< Features" back button at top
//    Sub-items listed below; back button returns to main dropdown
//
//  Hamburger (≡) tap:
//    Full-screen overlay with × close button (top-left)
//    Shows mega-menu sections (accordion) + full-width CTA inside
//
//  App switcher tap:
//    Bottom sheet slides up from the bottom
//
// Desktop-only — SKIPPED on devices:
//   Acrobat brand link, Compare Plans / Learn & Support / Free Trial utility links,
//   breadcrumbs, font styles, nav transparency, focus rings, keyboard navigation.

export default class FedsLnavDevicesPage extends FedsLnavPage {
  constructor(page, localeHref) {
    super(page, localeHref);

    // ── Hamburger × close button ──────────────────────────────────────────────
    // When the hamburger panel is open the ≡ button becomes a × close button.
    // Try a dedicated close selector first; fall back to the toggle itself.
    this.hamburgerCloseBtn = page.locator(
      'button.feds-nav-close, button[aria-label="Close navigation"], button[aria-label*="close" i]'
    ).first();

    // ── App switcher — mobile uses the wrapper div, not the inner button ─────────
    // On mobile the inner #unav-app-switcher gets inert="true" when the modal opens,
    // so the correct click target is the outer wrapper which stays interactive.
    this.appSwitcher      = page.locator('div.unav-comp-app-switcher-wrapper');
    this.appSwitcherModal = page.locator('#unav-app-switcher-dialog-id');

    // ── Back button inside sub-panels ("< Features") ──────────────────────────
    // Appears at the top of a sub-panel when a ">" item is tapped.
    // Clicking it returns to the main dropdown list.
    this.subPanelBackBtn = page.locator('button.feds-popup-back-button').first();
  }

  // ── All nav links — devices override ─────────────────────────────────────
  // Top nav + local nav links are CSS-hidden on devices — only check brand and breadcrumbs.
  // Full link validation happens inside validateLocalnavDropdown() and validateHamburger().

  async validateAllNavLinks() {
    console.info('[LNav Devices] Step 3: Checking visible links — brand and breadcrumbs only');
    const sections = [
      { label: 'Brand',       locator: this.navContainer.locator('.feds-brand-container a') },
      { label: 'Breadcrumbs', locator: this.navContainer.locator('.feds-breadcrumbs-wrapper a, ul.feds-breadcrumbs a') },
    ];
    let total = 0;
    for (const { label, locator } of sections) {
      const linkData = await locator.filter({ visible: true }).evaluateAll((els) =>
        els.map((el) => ({
          href: el.getAttribute('href'),
          text: (el.innerText || '').trim() || el.querySelector('img')?.getAttribute('alt') || '(no text)',
        }))
      );
      if (linkData.length === 0) { console.info(`[LNav Devices] Step 3: [${label}] — none found, skipping`); continue; }
      for (const { href, text } of linkData) {
        expect(href, `[${label}] "${text}" is missing href`).toBeTruthy();
        console.info(`[LNav Devices] Step 3: [${label}] "${text}" — href="${href}" ✓`);
        total++;
      }
    }
    console.info(`[LNav Devices] Step 3: PASS — ${total} visible link(s) validated`);
  }

  // ── Font styles — device validation ──────────────────────────────────────

  async validateDeviceFontStyles() {
    console.info('[LNav Devices] Font: Checking font family and size on device elements');
    const failures = [];

    const check = (label, fontFamily, fontSize, expectedSize) => {
      if (!fontFamily.toLowerCase().includes('adobe clean'))
        failures.push(`[${label}] font-family: ${fontFamily} (expected Adobe Clean)`);
      if (fontSize !== expectedSize)
        failures.push(`[${label}] font-size: ${fontSize} (expected ${expectedSize})`);
      else
        console.info(`[LNav Devices] Font: [${label}] ${fontSize} | ${fontFamily.split(',')[0].trim()} ✓`);
    };

    // Product name label — always visible
    const productData = await this.navContainer.locator('span.feds-localnav-bar-label')
      .filter({ visible: true }).evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.innerText || '').trim() };
      }));
    for (const { fontFamily, fontSize, text } of productData)
      check(`Product name "${text}"`, fontFamily, fontSize, '14px');

    // Open localnav → check links + CTA → close
    if (await this.localnavBar.isVisible().catch(() => false)) {
      // Reuse already-open bar if possible (called after validateLocalnavDropdown/validateCtas)
      const alreadyOpen = await this.navList.isVisible().catch(() => false);
      if (!alreadyOpen) {
        await this.localnavBar.click();
        await this.navList.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
      }

      // Separate top-level links (direct li > a, 32px) from sub-panel links (nested, 14px)
      // isTopLevel: el is a direct child of a <li> whose parent is the gnav items <ul>
      const linkData = await this.navList.locator('a.feds-link').filter({ visible: true })
        .evaluateAll((els) => els.map((el) => {
          const s = window.getComputedStyle(el);
          const isTopLevel = el.parentElement?.tagName === 'LI'
            && el.parentElement?.parentElement?.classList?.contains('feds-gnav-items');
          return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.innerText || '').trim().slice(0, 20), isTopLevel };
        }));
      const compact = await this.isCompact();
      // top-level: 32px compact / 48px desktop | sub-panel: always 14px
      for (const { fontFamily, fontSize, text, isTopLevel } of linkData) {
        const expectedSize = isTopLevel ? (compact ? '32px' : '48px') : '14px';
        const level = isTopLevel ? 'Nav link' : 'Sub-panel link';
        if (!fontFamily.toLowerCase().includes('adobe clean'))
          failures.push(`${level} "${text}" — font-family: ${fontFamily.split(',')[0].trim()} (expected Adobe Clean)`);
        if (fontSize !== expectedSize)
          console.warn(`[LNav Devices] Font WARN: ${level} "${text}" — font-size: ${fontSize} (expected ${expectedSize})`);
        else
          console.info(`[LNav Devices] Font: ${level} "${text}" — ${fontSize} | ${fontFamily.split(',')[0].trim()} ✓`);
      }

      const ctaData = await this.navList.locator('a.feds-primary-cta').filter({ visible: true })
        .evaluateAll((els) => els.map((el) => {
          const s = window.getComputedStyle(el);
          return { fontFamily: s.fontFamily, fontSize: s.fontSize, paddingTop: s.paddingTop, paddingRight: s.paddingRight, paddingBottom: s.paddingBottom, paddingLeft: s.paddingLeft, text: (el.innerText || '').trim() };
        }));
      for (const { fontFamily, fontSize, paddingTop, paddingRight, paddingBottom, paddingLeft, text } of ctaData) {
        check(`CTA "${text}"`, fontFamily, fontSize, '14px');
        if (paddingTop    !== '10px') failures.push(`CTA "${text}" padding-top: ${paddingTop} (expected 10px)`);
        if (paddingRight  !== '24px') failures.push(`CTA "${text}" padding-right: ${paddingRight} (expected 24px)`);
        if (paddingBottom !== '10px') failures.push(`CTA "${text}" padding-bottom: ${paddingBottom} (expected 10px)`);
        if (paddingLeft   !== '24px') failures.push(`CTA "${text}" padding-left: ${paddingLeft} (expected 24px)`);
      }

      // Always close — this is the last method in the localnav bar validation sequence
      await this.localnavBar.click();
      await this.navList.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    }

    expect(failures, `Device font violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info('[LNav Devices] Font: PASS');
  }

  // ── "Go To Acrobat" secondary CTA must be hidden on devices ─────────────
  // "Go To Acrobat" (a.feds-secondary-cta) is a desktop-only CTA visible in the
  // localnav bar on desktop. It must never be visible on any device viewport.

  async validateDesktopLinksHidden() {
    // isCompact() checks viewport width first, then is-compact class — see feds-lnav.page.js.
    // Only assert hidden when nav is actually in compact/mobile mode.
    // If desktop layout (e.g. iPad landscape at 1180px without is-compact), "Go To Acrobat"
    // is expected to be visible — skip the check.
    const compact = await this.isCompact();
    if (!compact) {
      console.info('[LNav Devices] Desktop CTA: nav in desktop layout — "Go To Acrobat" expected visible, skipping');
      return;
    }
    console.info('[LNav Devices] Desktop CTA: compact mode — checking "Go To Acrobat" is not visible');
    const goToAcrobat = this.navContainer.locator('a.feds-secondary-cta').filter({ visible: true });
    const count = await goToAcrobat.count();
    expect(
      count,
      `"Go To Acrobat" must not be visible in compact mode — found ${count} visible`,
    ).toBe(0);
    console.info('[LNav Devices] Desktop CTA: PASS — "Go To Acrobat" not visible in compact mode ✓');
  }

  // ── Core structure ────────────────────────────────────────────────────────
  // Overrides parent — navList (ul.feds-gnav-items) is hidden on mobile by default
  // (only becomes visible after tapping the local nav bar), so we skip that check.

  async validateNavStructure() {
    console.info('[LNav Devices] Step 2: Checking nav wrapper and Adobe logo visible');
    await expect(this.navWrapper).toBeVisible({ timeout: 8000 });
    await expect(this.adobeLogo).toBeVisible({ timeout: 8000 });
    console.info('[LNav Devices] Step 2: PASS');
  }

  // ── Hamburger ─────────────────────────────────────────────────────────────
  // ≡ opens a full-screen overlay showing mega-menu sections with a × close button.
  // Validates: panel opens → links inside have href → CTA is full-width → panel closes.

  async validateHamburger() {
    console.info('[LNav Devices] Hamburger: Checking ≡ opens overlay, links, breadcrumbs, CTA, × closes');
    // At desktop/tablet-landscape widths the hamburger button is hidden (desktop nav is shown instead)
    if (!await this.mobileMenuBtn.isVisible().catch(() => false)) {
      console.info('[LNav Devices] Hamburger: button hidden at this viewport — desktop layout, skipping');
      return;
    }
    await this.mobileMenuBtn.click({ timeout: 8000 });

    // The same button.feds-nav-toggle acts as open AND close (aria-expanded toggles).
    // aria-expanded="true" is the reliable indicator the overlay is open.
    await expect(this.mobileMenuBtn, 'Hamburger overlay did not open').toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });
    console.info('[LNav Devices] Hamburger: overlay opened');

    // Font observe — capture while hamburger is open
    const hamburgerFontData = await this.navContainer.locator('li#feds-menu-wrapper a.feds-link, li#feds-menu-wrapper button.feds-link')
      .filter({ visible: true }).evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.innerText || '').trim().slice(0, 30), fontSize: s.fontSize, fontFamily: s.fontFamily.split(',')[0].trim() };
      }));
    const hamburgerCtaData = await this.navContainer.locator('li#feds-menu-wrapper a.feds-primary-cta, li#feds-menu-wrapper a.feds-secondary-cta')
      .filter({ visible: true }).evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.innerText || '').trim().slice(0, 30), fontSize: s.fontSize, fontFamily: s.fontFamily.split(',')[0].trim(), padding: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}` };
      }));
    if (hamburgerFontData.length > 0)
      console.info(`[LNav Devices] Hamburger fonts: ${hamburgerFontData.map(({ text, fontSize }) => `"${text}" ${fontSize}`).join(' | ')}`);
    if (hamburgerCtaData.length > 0)
      console.info(`[LNav Devices] Hamburger CTA: ${hamburgerCtaData.map(({ text, fontSize, padding }) => `"${text}" ${fontSize} pad:${padding}`).join(' | ')}`);

    // Links visible in nav while hamburger is open
    const linkData = await this.navContainer.locator('a').filter({ visible: true }).evaluateAll((els) =>
      els.map((el, i) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim() || `link ${i + 1}` }))
    );
    expect(linkData.length, 'No links found inside hamburger panel').toBeGreaterThan(0);
    for (const { href, text } of linkData) {
      expect(href, `Hamburger link "${text}" is missing href`).toBeTruthy();
    }
    console.info(`[LNav Devices] Hamburger: ${linkData.length} links — all have href`);

    // Promo card — present at the bottom of the hamburger on phone viewports.
    // May not render on wider tablet layouts — log a warning instead of failing.
    const promo = this.navContainer.locator('article.promo-card-small').first();
    const promoCount = await promo.count();
    if (promoCount > 0 && await promo.isVisible().catch(() => false)) {
      await expect(promo.locator('picture.promo-card__bg'), 'Promo card image missing').toBeVisible({ timeout: 8000 });
      await expect(promo.locator('div.promo-card-small__text'), 'Promo card text missing').toBeVisible({ timeout: 8000 });
      const promoCta = promo.locator('div.promo-card-small__cta a.feds-secondary-cta');
      await expect(promoCta, 'Promo card CTA missing').toBeVisible({ timeout: 8000 });
      const promoHref = await promoCta.getAttribute('href');
      expect(promoHref, 'Promo card CTA missing href').toBeTruthy();
      console.info(`[LNav Devices] Hamburger: promo card ✓ href="${promoHref}"`);
    } else {
      console.info('[LNav Devices] Hamburger: promo card not rendered at this viewport — skipping');
    }

    // Dropdowns inside hamburger (PDF & Productivity, Features, Online Tools, etc.)
    // Same button.mega-menu.feds-link buttons as desktop — cards arranged vertically on mobile.
    const dropdownBtns = this.navContainer.locator('button.mega-menu.feds-link').filter({ visible: true });
    const dropdownCount = await dropdownBtns.count();
    for (let i = 0; i < dropdownCount; i++) {
      const btn = dropdownBtns.nth(i);
      const btnText = ((await btn.textContent()) || '').trim() || `dropdown ${i + 1}`;
      const panelId = await btn.getAttribute('aria-controls');
      // Breadcrumbs inside the open hamburger can overlap these buttons at tablet widths.
      // Use JS click to dispatch directly on the element, bypassing coordinate hit-testing.
      await btn.evaluate((el) => el.click());
      if (panelId) {
        const panel = this.page.locator(`#${panelId}`);
        await expect(panel, `"${btnText}" panel did not open`).toBeVisible({ timeout: 8000 });
        const panelLinks = await panel.locator('a').filter({ visible: true }).evaluateAll((els) =>
          els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim() }))
        );
        expect(panelLinks.length, `"${btnText}" panel has no links`).toBeGreaterThan(0);
        for (const { href, text } of panelLinks) {
          expect(href, `"${btnText}" link "${text}" missing href`).toBeTruthy();
        }
        console.info(`[LNav Devices] Hamburger: "${btnText}" — ${panelLinks.length} links ✓`);
        await btn.evaluate((el) => el.click()); // collapse
        await expect(panel).toBeHidden({ timeout: 8000 });
      } else {
        console.info(`[LNav Devices] Hamburger: "${btnText}" — no aria-controls, skipping`);
      }
    }
    if (dropdownCount === 0) console.info('[LNav Devices] Hamburger: no dropdown sections found');

    // ── Card gap — each article.links-card should have 12px gap ──────────────
    const cardGapData = await this.navContainer.locator('article.links-card').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { marginBottom: s.marginBottom };
      }));
    if (cardGapData.length > 0) {
      const wrongGap = cardGapData.filter(({ marginBottom }) => marginBottom !== '12px');
      if (wrongGap.length > 0)
        console.warn(`[LNav Devices] Hamburger: ${wrongGap.length} card(s) have wrong gap: ${wrongGap.map(c => c.marginBottom).join(', ')} (expected 12px)`);
      else
        console.info(`[LNav Devices] Hamburger: ${cardGapData.length} card(s) — gap 12px ✓`);
    }

    // Breadcrumbs are only visible inside the open hamburger on devices
    const crumbs = this.navContainer.locator('ul.feds-breadcrumbs a, .feds-breadcrumbs-wrapper a, nav.breadcrumbs a').filter({ visible: true });
    const crumbCount = await crumbs.count();
    if (crumbCount > 0) {
      const crumbData = await crumbs.evaluateAll((els) =>
        els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim() }))
      );
      for (const { href, text } of crumbData) {
        expect(href, `Hamburger breadcrumb "${text}" missing href`).toBeTruthy();
      }
      console.info(`[LNav Devices] Hamburger: ${crumbCount} breadcrumb(s) — all have href`);
    } else {
      console.info('[LNav Devices] Hamburger: no breadcrumbs visible inside overlay');
    }

    // CTA inside hamburger — visible and has a non-zero width. Width varies by device:
    // phone portrait ~390px (full-width), phone landscape ~100px (compact pill), iPad ~100px.
    const hamburgerCta = this.navContainer.locator('a.feds-primary-cta, a.feds-cta').filter({ visible: true }).first();
    if (await hamburgerCta.isVisible().catch(() => false)) {
      const box = await hamburgerCta.boundingBox();
      expect(box.width, 'Hamburger CTA has no width').toBeGreaterThan(0);
      console.info(`[LNav Devices] Hamburger: CTA ${Math.round(box.width)}px — visible ✓`);
    } else {
      console.info('[LNav Devices] Hamburger: no CTA visible inside panel');
    }

    // Close via Escape — after sub-panel interactions the toggle's aria-controls shifts to the
    // last-active sub-panel, so clicking it reopens that panel instead of closing the hamburger.
    await this.page.keyboard.press('Escape');
    await expect(this.mobileMenuBtn, 'Hamburger overlay did not close').toHaveAttribute('aria-expanded', 'false', { timeout: 8000 });
    console.info('[LNav Devices] Hamburger: PASS');
  }

  // ── Local nav bar ─────────────────────────────────────────────────────────

  async validateLocalnavBar() {
    console.info('[LNav Devices] Local nav bar: Checking product name label visible');
    // At wider viewports (iPad portrait 1024px) the button is hidden — nav items shown inline
    if (!await this.localnavBar.isVisible().catch(() => false)) {
      console.info('[LNav Devices] Local nav bar: hidden at this viewport — tablet/wide layout, skipping');
      return;
    }
    const label = ((await this.localnavLabel.textContent().catch(() => '')) || '').trim();
    expect(label, 'Local nav bar label should not be empty').toBeTruthy();
    console.info(`[LNav Devices] Local nav bar: PASS — label="${label}"`);
  }

  // ── Local nav dropdown ────────────────────────────────────────────────────
  // Tap ▼ → dropdown expands downward with direct links + ">" sub-panel buttons.
  // ">" items use a back-button sub-panel pattern:
  //   the dropdown content REPLACES itself with the sub-items; a "< Name" back
  //   button at the top returns to the main list.
  // "Buy now" CTA always present at the bottom — validated in validateCtas().

  async validateLocalnavDropdown() {
    console.info('[LNav Devices] Local nav dropdown: open → links → sub-panels → CTA → close');

    // At wider viewports (iPad portrait 1024px) the local nav bar button is hidden
    if (!await this.localnavBar.isVisible().catch(() => false)) {
      console.info('[LNav Devices] Local nav dropdown: localnavBar hidden — tablet/wide layout, skipping dropdown');
      return;
    }

    await this.localnavBar.click({ timeout: 8000 });
    await expect(this.navList, 'Nav dropdown did not open').toBeVisible({ timeout: 8000 });

    // Validate all direct links have href
    const linkData = await this.navList.locator('a').filter({ visible: true }).evaluateAll((els) =>
      els.map((el, i) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim() || `link ${i + 1}` }))
    );
    expect(linkData.length, 'No links found in local nav dropdown').toBeGreaterThan(0);
    for (const { href, text } of linkData) {
      expect(href, `Local nav link "${text}" missing href`).toBeTruthy();
    }
    console.info(`[LNav Devices] Local nav dropdown: ${linkData.length} direct links — all have href`);

    // ── Row gap — device dropdown stacked row layout (div.feds-gnav-cards) ───
    const gnavCards = this.navList.locator('div.feds-gnav-cards').first();
    const hasCards = await gnavCards.count() > 0;
    if (hasCards) {
      const { rowGap, colGap } = await gnavCards.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return { rowGap: s.rowGap, colGap: s.columnGap };
      });
      console.info(`[LNav Devices] Gaps: div.feds-gnav-cards row-gap=${rowGap} column-gap=${colGap}`);
      expect(rowGap, `Device dropdown row-gap: ${rowGap} (expected 4px)`).toBe('4px');
    } else {
      console.info('[LNav Devices] Gaps: div.feds-gnav-cards not found — skipping row-gap check');
    }

    // Iterate through all visible sub-panel buttons (Features >, Online Tools >, etc.)
    // Re-query after each back-navigation so the list is fresh.
    // In sub-panel view the only visible <button> inside navList is the "< Title" back button.
    const subMenuSelector = 'button.feds-link';
    const totalPanels = await this.navList.locator(subMenuSelector).filter({ visible: true }).count();

    for (let i = 0; i < totalPanels; i++) {
      const btn = this.navList.locator(subMenuSelector).filter({ visible: true }).nth(i);
      const btnText = ((await btn.textContent()) || '').trim() || `panel ${i + 1}`;

      await btn.click({ timeout: 8000 });
      console.info(`[LNav Devices] Sub-panel "${btnText}": opened`);

      // Validate sub-links
      const subLinks = await this.navList.locator('a').filter({ visible: true }).evaluateAll((els) =>
        els.map((el, i) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim() || `link ${i + 1}` }))
      );
      for (const { href, text } of subLinks) {
        expect(href, `"${btnText}" sub-link "${text}" missing href`).toBeTruthy();
      }
      console.info(`[LNav Devices] Sub-panel "${btnText}": ${subLinks.length} links — all have href`);

      // Back button lives inside the open sub-panel (div.feds-popup-header-left)
      const backBtn = this.navList.locator('button.feds-popup-back-button').filter({ visible: true }).first();
      await backBtn.click({ timeout: 8000 });
      // Wait for main dropdown to be restored (first sub-panel button visible again)
      await expect(
        this.navList.locator(subMenuSelector).filter({ visible: true }).first(),
        'Main dropdown not restored after back button',
      ).toBeVisible({ timeout: 8000 });
      console.info(`[LNav Devices] Sub-panel "${btnText}": returned via back button`);
    }

    if (totalPanels === 0) {
      console.info('[LNav Devices] Local nav dropdown: no ">" sub-panel buttons found');
    }

    // CTA at the bottom of the dropdown
    const cta = this.navList.locator('a.feds-primary-cta').first();
    if (await cta.isVisible().catch(() => false)) {
      const href = await cta.getAttribute('href');
      expect(href, 'CTA in dropdown missing href').toBeTruthy();
      console.info(`[LNav Devices] Local nav dropdown: CTA visible, href="${href}" ✓`);
    }

    // Leave bar open — validateCtas() and validateDeviceFontStyles() reuse the open state
    console.info('[LNav Devices] Local nav dropdown: PASS');
  }

  // ── CTAs — "Buy now" always at the bottom of the local nav dropdown ─────────
  // Portrait phone (≤BREAKPOINTS.mobileMax wide): CTA renders full-width (enlarged) — assert > 50% viewport.
  // Landscape phone / iPad portrait (>BREAKPOINTS.mobileMax wide): CTA is a compact pill button — assert
  //   only that it is visible and has href (width is not enforced in wider viewports).
  // Acrobat brand link (desktop-only) is not validated here.

  async validateCtas() {
    console.info('[LNav Devices] CTAs: Opening local nav dropdown to validate "Buy now" CTA');

    if (!await this.localnavBar.isVisible().catch(() => false)) {
      console.info('[LNav Devices] CTAs: localnavBar hidden at this viewport — skipping CTA check');
      return;
    }

    // Reuse already-open bar if possible (called after validateLocalnavDropdown)
    const opened = await this.navList.isVisible().catch(() => false);
    if (!opened) {
      await this.localnavBar.click({ timeout: 8000 });
      await expect(this.navList, 'Nav dropdown did not open for CTA check').toBeVisible({ timeout: 8000 });
    }

    const ctaInDropdown = this.navList.locator('a.feds-primary-cta').first();
    const primaryVisible = await ctaInDropdown.isVisible().catch(() => false);

    if (primaryVisible) {
      const ctaText = ((await ctaInDropdown.innerText().catch(() => '')) || '').trim() || 'Primary CTA';
      const href = await ctaInDropdown.getAttribute('href');
      expect(href, `"${ctaText}" CTA must have an href`).toBeTruthy();
      await ctaInDropdown.click({ trial: true });

      const box      = await ctaInDropdown.boundingBox();
      const viewport = this.page.viewportSize();
      const isPhonePortrait = viewport.height > viewport.width && viewport.width <= BREAKPOINTS.mobileMax;

      if (isPhonePortrait) {
        const ratio = box.width / viewport.width;
        expect(
          ratio,
          `"${ctaText}" CTA should fill > 50% of viewport in portrait phone — got ${(ratio * 100).toFixed(0)}%`,
        ).toBeGreaterThan(0.5);
        console.info(`[LNav Devices] CTAs: "${ctaText}" ${box.width}px / viewport ${viewport.width}px (${(ratio * 100).toFixed(0)}%) — full-width portrait ✓`);
      } else {
        const context = viewport.width > viewport.height ? 'landscape' : 'iPad portrait';
        console.info(`[LNav Devices] CTAs: "${ctaText}" ${box.width}px — compact pill (${context}), href="${href}" ✓`);
      }
    } else {
      console.info('[LNav Devices] CTAs: primary CTA not visible in local nav dropdown — skipping');
    }
    // Leave bar open — validateDeviceFontStyles() reuses the open state
  }

  // ── App switcher ──────────────────────────────────────────────────────────
  // Portrait phone: slides up as a bottom sheet.
  // Landscape phone / iPad: appears as a centered overlay modal.
  // Same selectors work for both — dialog element is identical.

  async validateAppSwitcher() {
    console.info('[LNav Devices] App switcher: open → verify content → close');
    // unav-comp-* loads asynchronously — give it extra time on slower Android emulation
    await expect(this.appSwitcher, 'App switcher wrapper not found').toBeVisible({ timeout: 15000 });
    await this.appSwitcher.click({ timeout: 8000 });
    await expect(this.appSwitcherModal, 'App switcher modal did not open').toBeVisible({ timeout: 8000 });
    await this.appSwitcherAdobeExpress.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.appSwitcherAdobeCom).toBeVisible({ timeout: 8000 });
    await expect(this.appSwitcherAllApps).toBeVisible({ timeout: 8000 });
    // Button is inert while modal is open; app tiles overlap the dismiss overlay.
    // Escape is the reliable close — works regardless of z-index.
    await this.page.keyboard.press('Escape');
    await expect(this.appSwitcherModal).toBeHidden({ timeout: 8000 });
    console.info('[LNav Devices] App switcher: PASS');
  }

  // ── Analytics — device-visible elements only ──────────────────────────────
  // Clicks only elements visible without opening sub-panels:
  //   logo, local nav bar (open/close), direct links in dropdown, Sign In.
  // Skipped: utility nav links, breadcrumbs, hamburger sub-menus (desktop-only).

  async validateAnalyticsDaaLl() {
    console.info('[LNav Devices] Analytics: Checking daa-ll on visible device nav elements');
    const originalUrl   = this.page.url();
    const isCollectCall = (url) => /\/collect(\?|$)/.test(url) && url.includes('configId=');

    const capturedCalls = [];
    const onRequest = (req) => {
      if (!isCollectCall(req.url())) return;
      try {
        const xdm = JSON.parse(req.postData() || '{}').events?.[0]?.xdm ?? {};
        capturedCalls.push(xdm.web?.webInteraction?.name ?? '');
      } catch { capturedCalls.push(''); }
    };
    this.page.on('request', onRequest);

    // Block main-frame navigations so link clicks stay on the page
    const blockNavigations = async (route) => {
      if (route.request().isNavigationRequest()) {
        await route.fulfill({ status: 204, body: '' });
      } else {
        await route.continue();
      }
    };
    await this.page.route('**/*', blockNavigations);

    // Detect which nav link opens a new tab — target="_blank" must not be on nav links
    let lastClicked = 'unknown';
    const onNewPage = (newPage) => {
      console.warn(`[LNav Devices] Analytics WARN: "${lastClicked}" opened a new tab — target="_blank" must not be on nav links (url: ${newPage.url()})`);
      newPage.close().catch(() => {});
    };
    this.page.context().on('page', onNewPage);

    const clicked = [];
    const clickElement = async (element, label, preDaaLl = undefined) => {
      lastClicked = label;
      const daaLl = preDaaLl !== undefined ? preDaaLl : await element.getAttribute('daa-ll');
      if (!daaLl) {
        console.info(`[LNav Devices] Analytics: WARNING — "${label}" is missing daa-ll`);
      } else {
        console.info(`[LNav Devices] Analytics: "${label}" — daa-ll="${daaLl}" ✓`);
      }
      await element.evaluate((el) => {
        el.addEventListener('click', (e) => e.preventDefault(), { once: true, capture: true });
      }).catch(() => {});
      await element.click({ timeout: 8000 }).catch(() => {});
      if (this.page.url() !== originalUrl) {
        console.info(`[LNav Devices] Analytics: "${label}" navigated — returning`);
        await this.page.goto(originalUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      }
      clicked.push({ label, daaLl });
    };

    // 1. Adobe logo
    await clickElement(this.adobeLogoLink, 'Adobe Logo', await this.adobeLogoLink.getAttribute('daa-ll'));

    // 2. Local nav bar open → click direct links in dropdown → close
    const localnavDaaLl = await this.localnavBar.getAttribute('daa-ll');
    await clickElement(this.localnavBar, 'Local nav bar — open', localnavDaaLl);
    await expect(this.navList).toBeVisible({ timeout: 8000 });

    // Click only the direct links (a.feds-link) — skip ">" sub-panel buttons to avoid
    // navigation into sub-panels which would require back-button handling in analytics
    const directLinks = this.navList.locator('a.feds-link').filter({ visible: true });
    const directLinkInfo = await directLinks.evaluateAll((els) => els.map((el) => ({
      daaLl: el.getAttribute('daa-ll'),
      text:  (el.innerText || '').trim(),
    })));
    for (let i = 0; i < directLinkInfo.length; i++) {
      const link = directLinks.nth(i);
      const name = directLinkInfo[i].text || `link ${i + 1}`;
      await clickElement(link, name, directLinkInfo[i].daaLl);
    }

    // Close local nav
    await clickElement(this.localnavBar, 'Local nav bar — close', localnavDaaLl);

    // 3. Sign In — verify visible only (trial click unreliable on fixed nav after scroll)
    await this.page.evaluate(() => window.scrollTo(0, 0));
    const signInVisible = await this.signInBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (signInVisible) {
      console.info('[LNav Devices] Analytics: Sign In — visible ✓');
    } else {
      console.warn('[LNav Devices] Analytics: Sign In — not visible at this viewport');
    }

    await this.page.unroute('**/*', blockNavigations);
    this.page.off('request', onRequest);
    this.page.context().off('page', onNewPage);
    console.info(`[LNav Devices] Analytics: ${capturedCalls.length} total collect call(s) captured`);

    for (const { label, daaLl } of clicked) {
      if (!daaLl) {
        console.info(`[LNav Devices] Analytics: INFO — "${label}" no daa-ll, skipping name check`);
        continue;
      }
      const match = capturedCalls.find((name) => name.includes(daaLl));
      if (match) {
        console.info(`[LNav Devices] Analytics: PASS — "${label}" daa-ll="${daaLl}" matched ✓`);
      } else {
        console.warn(`[LNav Devices] Analytics: WARNING — "${label}" daa-ll="${daaLl}" not found in any captured collect call`);
      }
    }
    console.info('[LNav Devices] Analytics: COMPLETE');
  }

  // ── Keyboard navigation (Enter / Space / Escape) ──────────────────────────
  // Mobile/tablet users with external Bluetooth keyboards or Switch Control
  // must be able to operate the nav using Enter, Space, and Escape.
  // (WCAG 2.1.1 — Keyboard, WCAG 2.1.3 — No Keyboard Trap)
  //
  // Checks:
  //   Hamburger   — Enter opens overlay, Escape closes | Space opens, Escape closes
  //   Local nav   — Enter opens dropdown, Escape closes | Space opens, Escape closes
  //   (Skipped at tablet-landscape widths where these controls are hidden)

  async validateKeyboardNavigation() {
    console.info('[LNav Devices] Keyboard: Checking Enter, Space, Escape on hamburger and local nav bar');

    // ── Hamburger ────────────────────────────────────────────────────────────
    if (await this.mobileMenuBtn.isVisible().catch(() => false)) {
      // Enter opens
      await this.mobileMenuBtn.focus();
      await this.page.keyboard.press('Enter');
      await expect(this.mobileMenuBtn, 'Hamburger: Enter must set aria-expanded="true"').toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Hamburger — Enter opened ✓');

      // Escape closes
      await this.page.keyboard.press('Escape');
      await expect(this.mobileMenuBtn, 'Hamburger: Escape must set aria-expanded="false"').toHaveAttribute('aria-expanded', 'false', { timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Hamburger — Escape closed ✓');

      // Space opens
      await this.mobileMenuBtn.focus();
      await this.page.keyboard.press('Space');
      await expect(this.mobileMenuBtn, 'Hamburger: Space must set aria-expanded="true"').toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Hamburger — Space opened ✓');

      // Escape closes again
      await this.page.keyboard.press('Escape');
      await expect(this.mobileMenuBtn, 'Hamburger: Escape must close after Space').toHaveAttribute('aria-expanded', 'false', { timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Hamburger — PASS (Enter/Space open, Escape closes)');
    } else {
      console.info('[LNav Devices] Keyboard: Hamburger hidden at this viewport — skipping');
    }

    // ── Local nav bar ─────────────────────────────────────────────────────────
    if (await this.localnavBar.isVisible().catch(() => false)) {
      // Enter opens
      await this.localnavBar.focus();
      await this.page.keyboard.press('Enter');
      await expect(this.navList, 'Local nav: Enter must open dropdown').toBeVisible({ timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Local nav bar — Enter opened ✓');

      // Escape closes — on iPad the nav animates with class "subscreen-closing" but may not
      // fully hide. Fall back to clicking the bar to close and log a warning for the Jira bug.
      await this.page.keyboard.press('Escape');
      const escapeClosed = await this.navList.waitFor({ state: 'hidden', timeout: 5000 }).then(() => true).catch(() => false);
      if (!escapeClosed) {
        console.warn('[LNav Devices] Keyboard: WARNING — Escape did not close local nav dropdown (subscreen-closing animation stuck). Falling back to button click. Potential WCAG 2.1.1 bug on tablet.');
        await this.localnavBar.click({ timeout: 8000 });
        await expect(this.navList, 'Local nav: fallback click must close dropdown').toBeHidden({ timeout: 8000 });
      } else {
        console.info('[LNav Devices] Keyboard: Local nav bar — Escape closed ✓');
      }

      // Space opens
      await this.localnavBar.focus();
      await this.page.keyboard.press('Space');
      await expect(this.navList, 'Local nav: Space must open dropdown').toBeVisible({ timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Local nav bar — Space opened ✓');

      // Close via button click (Escape may not work on tablet — handled above)
      await this.localnavBar.click({ timeout: 8000 });
      await expect(this.navList, 'Local nav: must close after Space').toBeHidden({ timeout: 8000 });
      console.info('[LNav Devices] Keyboard: Local nav bar — PASS (Enter/Space open, close verified)');
    } else {
      console.info('[LNav Devices] Keyboard: Local nav bar hidden at this viewport — skipping');
    }

    console.info('[LNav Devices] Keyboard: PASS');
  }

  // ── Hamburger dropdown Tab navigation ─────────────────────────────────────
  // Bug: Tab key does not traverse items inside hamburger dropdowns (e.g. PDF & Productivity)
  // on tablet and mobile — only arrow keys work, which is not accessible (WCAG 2.1.1).
  // This test opens each dropdown inside the hamburger and verifies that pressing Tab
  // moves focus to a visible element inside the open panel.

  async validateHamburgerDropdownTabNavigation() {
    console.info('[LNav Devices] Keyboard Tab: Checking Tab traversal inside hamburger dropdowns (PDF & Productivity, Features, Online Tools)');

    if (!await this.mobileMenuBtn.isVisible().catch(() => false)) {
      console.info('[LNav Devices] Keyboard Tab: hamburger hidden at this viewport — skipping');
      return;
    }

    // Open hamburger
    await this.mobileMenuBtn.focus();
    await this.page.keyboard.press('Enter');
    await expect(this.mobileMenuBtn, 'Hamburger did not open').toHaveAttribute('aria-expanded', 'true', { timeout: 8000 });

    // Target only top-level mega-menu dropdown buttons (PDF & Productivity, Features, Online Tools)
    // Exclude small-menu accordion headings (Outils en ligne, Solutions etc.) — they are section
    // headings focusable via Tab but do not open panels when Enter is pressed
    const dropdownBtns = this.navContainer.locator('button.mega-menu.feds-link:not(.small-menu)').filter({ visible: true });
    const dropdownCount = await dropdownBtns.count();

    if (dropdownCount === 0) {
      console.info('[LNav Devices] Keyboard Tab: no dropdown buttons found inside hamburger — skipping');
      await this.page.keyboard.press('Escape');
      return;
    }

    const tabFailures = [];

    // Fetch all button texts + panelIds in one browser call to avoid serial await failures
    const dropdownInfo = await dropdownBtns.evaluateAll((els) => els.map((el, i) => ({
      text:    (el.innerText || el.textContent || '').trim() || `dropdown ${i + 1}`,
      panelId: el.getAttribute('aria-controls'),
    })));

    for (let i = 0; i < dropdownInfo.length; i++) {
      const btn = dropdownBtns.nth(i);
      const { text: btnText, panelId } = dropdownInfo[i];
      if (!panelId) continue;

      const panel = this.page.locator(`#${panelId}`);

      // Open dropdown via Enter
      await btn.focus();
      await this.page.keyboard.press('Enter');
      const opened = await panel.waitFor({ state: 'visible', timeout: 2000 }).then(() => true).catch(() => false);
      if (!opened) {
        console.warn(`[LNav Devices] Keyboard Tab: "${btnText}" — panel did not open via Enter (potential WCAG 2.1.1 concern)`);
        continue;
      }

      // Tab once — focus must land inside the open panel
      await this.page.keyboard.press('Tab');
      const focusInPanel = await panel.evaluate((el) => el.contains(document.activeElement));

      if (!focusInPanel) {
        const focusedEl = await this.page.evaluate(() => `<${document.activeElement?.tagName?.toLowerCase() ?? 'unknown'}>`);
        console.warn(`[LNav Devices] Keyboard Tab: BUG — "${btnText}" Tab did not enter panel (focus on ${focusedEl}). WCAG 2.1.1 violation — only arrow keys work.`);
        tabFailures.push(btnText);
      } else {
        console.info(`[LNav Devices] Keyboard Tab: "${btnText}" — Tab focus inside panel ✓`);
      }

      // Close dropdown before moving to next
      await this.page.keyboard.press('Escape');
      await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
        await btn.evaluate((el) => el.click());
      });
    }

    // Close hamburger
    await this.page.keyboard.press('Escape');
    await expect(this.mobileMenuBtn, 'Hamburger did not close').toHaveAttribute('aria-expanded', 'false', { timeout: 8000 });

    expect(
      tabFailures,
      `Tab navigation broken inside hamburger dropdowns: [${tabFailures.join(', ')}] — WCAG 2.1.1 violation`,
    ).toHaveLength(0);

    console.info('[LNav Devices] Keyboard Tab: PASS');
  }
}
