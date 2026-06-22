import { expect, test } from '@playwright/test';
import { runAxeScan, getViolationSummary } from '../../utils/accessibility/axe-runner.js';

export default class UnavPage {
  constructor(page) {
    this.page = page;
    this.url  = '';

    // ── Core GNav elements ─────────────────────────────────────────────────
    this.adobeLogo        = page.locator('.feds-brand-container a.feds-brand');
    this.appSwitcher      = page.locator('#unav-app-switcher');
    this.appSwitcherModal = page.locator('#unav-app-switcher-dialog-id');
    this.appSwitcherLinks = page.locator('#unav-app-switcher-dialog-id a');
    this.signIn           = page.locator('#unav-profile');
    this.navItems         = page.locator('.feds-navItem, button.mega-menu.feds-link');
    // Direct child > prevents matching links inside dropdown panels.
    this.navLinks         = page.locator('.feds-navItem > a[href]').filter({ visible: true });
    // Direct child > prevents matching buttons inside dropdown panels.
    this.navButtons       = page.locator('.feds-navItem > button, button.mega-menu.feds-link').filter({ visible: true });
    this.primaryCtas      = page.locator('.feds-cta--primary');
    this.secondaryCtas    = page.locator('.feds-cta--secondary');

    // ── Footer elements ───────────────────────────────────────────────────
    this.footer                 = page.locator('footer.global-footer');
    this.footerFeaturedProducts = page.locator('div.feds-featuredProducts');
    this.footerProductLinks     = page.locator('div.feds-featuredProducts a');
    this.footerSocialLinks      = page.locator('ul.feds-social a');
    this.footerChangeRegion     = page.locator('a.feds-regionPicker');
    // C2 footer (Homepage): legal section is div.feds-footer-miscLinks-legal
    this.footerMiscLinksLegal      = page.locator('div.feds-footer-miscLinks-legal');
    // Normal footer: legal wrapper with 6 privacy list items
    this.footerLegalWrapper        = page.locator('div.feds-footer-legalWrapper');
    this.footerPrivacyListItems    = page.locator('div.feds-footer-legalWrapper li.feds-footer-privacy-listitem');

    // ── Footer logo (C2 footer pages e.g. Homepage) ───────────────────────
    this.footerLogo = page.locator('.feds-footer-logo');

    // Page flags — set from spec via test runner
    this.noAppSwitcher  = false;
    this.slimFooter     = false;
    this.marketSelector = false;
    this.originalLocale   = null;
    this.redirectedLocale = null;

    // ── Jarvis / Virtual Assistant ────────────────────────────────────────
    this.jarvisButton    = page.locator('#adbmsgCta');
    this.jarvisContainer = page.locator('iframe.adbmsgContentIframe');

    // ── Network responses ─────────────────────────────────────────────────
    this.networkResponses = [];
    page.on('response', (res) => {
      this.networkResponses.push({ url: res.url(), status: res.status() });
    });

    // ── Console errors from UNav scripts ─────────────────────────────────
    this.consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push({ text: msg.text(), location: msg.location()?.url ?? '' });
      }
    });

    // ── Analytics collect calls (AEP Web SDK) ────────────────────────────
    this.collectCalls = [];
    page.on('request', (req) => {
      if (!/\/collect(\?|$)/.test(req.url()) || !req.url().includes('configId=')) return;
      try {
        const xdm = JSON.parse(req.postData() || '{}').events?.[0]?.xdm ?? {};
        this.collectCalls.push({
          url: req.url(),
          eventType: xdm.eventType ?? '',
          interactionName: xdm.web?.webInteraction?.name ?? '',
        });
      } catch {
        this.collectCalls.push({ url: req.url(), eventType: '', interactionName: '' });
      }
    });
  }

  // ── Step helpers ──────────────────────────────────────────────────────────
  #ok(label) {
    console.info(label);
  }

  #warn(label) {
    console.warn(`WARN — ${label}`);
    test.info().annotations.push({ type: 'warning', description: label });
  }

  // ── Navigate ─────────────────────────────────────────────────────────────
  async goto(url) {
    this.url          = url;
    this.finalPageUrl = url;

    // Register listeners BEFORE navigation so scripts loading during page load are captured.
    // page.on('response') in the constructor records all responses; these promises just ensure
    // we wait long enough for async scripts that load after waitUntil:'load'.
    const unavJsP     = this.page.waitForResponse((r) => /\/unav\/[\d.]+\/UniversalNav\.js/.test(r.url()),  { timeout: 20000 }).catch(() => null);
    const unavCssP    = this.page.waitForResponse((r) => /\/unav\/[\d.]+\/UniversalNav\.css/.test(r.url()), { timeout: 20000 }).catch(() => null);
    const arpP        = this.page.waitForResponse((r) => /ArpService\.\w+\.bundle\.js/.test(r.url()),       { timeout: 20000 }).catch(() => null);
    const sherlockP   = this.page.waitForResponse((r) => /sherlock\.min\.js/.test(r.url()),                 { timeout: 20000 }).catch(() => null);
    const bfpScriptP  = this.page.waitForResponse((r) => /bfp\.min\.js/.test(r.url()),                     { timeout: 20000 }).catch(() => null);
    const bfpCaptureP = this.page.waitForResponse((r) => /bfp_capture/.test(r.url()),                      { timeout: 25000 }).catch(() => null);

    await this.page.evaluate(() => {
      try { localStorage.clear(); } catch { /* cross-origin frames may throw */ }
      try { sessionStorage.clear(); } catch { /* cross-origin frames may throw */ }
    }).catch(() => {});
    const response    = await this.page.goto(url, { waitUntil: 'load' });
    this.finalPageUrl = this.page.url();

    await Promise.all([unavJsP, unavCssP, arpP, sherlockP, bfpScriptP, bfpCaptureP]);

    const status = response?.status() ?? 0;
    if (status === 404) {
      throw new Error(`[${url}] Page returned HTTP 404`);
    }
    const originalHost = new URL(url).hostname;
    const finalHost    = new URL(this.finalPageUrl).hostname;
    if (finalHost !== originalHost) {
      throw new Error(`[${url}] Page redirected to different domain: ${this.finalPageUrl}`);
    }

    // Detect locale redirect once — reused by all validators (logo, nav links, etc.)
    const localeRe = /^[a-z]{2}(_[a-z]{2,4})?$/i;
    const origSeg  = new URL(url).pathname.split('/').filter(Boolean);
    const finalSeg = new URL(this.finalPageUrl).pathname.split('/').filter(Boolean);
    this.originalLocale   = origSeg[0]  && localeRe.test(origSeg[0])  ? origSeg[0]  : null;
    this.redirectedLocale = finalSeg[0] && localeRe.test(finalSeg[0]) && finalSeg[0] !== this.originalLocale
      ? finalSeg[0] : null;
    const FR_SUB_LOCALES = new Set(['ca_fr', 'be_fr', 'lu_fr', 'ch_fr']);

    if (this.redirectedLocale && !FR_SUB_LOCALES.has(this.originalLocale)) {
      throw new Error(`[${url}] Unexpected locale redirect: /${this.originalLocale}/ → /${this.redirectedLocale}/`);
    }

    await this.page.locator('#unav-app-switcher, .feds-brand-container').first()
      .waitFor({ state: 'attached', timeout: 30000 });

    // Dismiss georouting modal if present (helpx ignores georouting=off param).
    const localeModalClose = this.page.locator('a.dexter-CloseButton[aria-label="Close"]');
    const modalVisible = await localeModalClose.isVisible({ timeout: 2000 }).catch(() => false);
    if (modalVisible) await localeModalClose.click().catch(() => {});
  }

  // ── Locale redirect validation ───────────────────────────────────────────
  async validateLocaleRedirect() {
    const FR_SUB_LOCALES = new Set(['ca_fr', 'be_fr', 'lu_fr', 'ch_fr']);
    if (!FR_SUB_LOCALES.has(this.originalLocale)) return;
    if (this.redirectedLocale) {
      await this.#ok(`[Page] /${this.originalLocale}/ redirected to /${this.redirectedLocale}/ ✓`);
    } else {
      throw new Error(`[${this.url}] /${this.originalLocale}/ did not redirect to /fr/ — expected FR sub-locale redirect`);
    }
  }

  // ── GNav: Adobe Logo ─────────────────────────────────────────────────────
  async validateAdobeLogo() {
    const pageUrl    = this.url;
    const pageOrigin = new URL(this.url).origin;

    await expect(this.adobeLogo, `[${pageUrl}] Adobe logo (.feds-brand) must be visible`).toBeVisible();

    const href = await this.adobeLogo.getAttribute('href');
    expect(href, `[${pageUrl}] Adobe logo href is empty`).toBeTruthy();

    const segments     = new URL(this.url).pathname.split('/').filter(Boolean);
    const localePrefix = segments.length > 0 && /^[a-z]{2}(_[a-z]{2,4})?$/i.test(segments[0]) ? segments[0] : null;
    if (this.redirectedLocale) {
      if (!href.includes(`/${this.redirectedLocale}/`)) {
        await this.#warn(`[GNav] Adobe logo href="${href}" missing redirected locale "/${this.redirectedLocale}/" (redirected from /${this.originalLocale}/)`);
      }
    } else if (localePrefix) {
      expect(href, `[${pageUrl}] Adobe logo href="${href}" must contain locale prefix "/${localePrefix}/"`).toContain(`/${localePrefix}/`);
    } else {
      expect(href, `[${pageUrl}] Adobe logo href="${href}" must point to adobe.com`).toContain('adobe.com');
    }

    if (href.startsWith('http')) {
      const hrefHost       = new URL(href).hostname;
      const pageHost       = new URL(this.url).hostname;
      // Normalize both to www.* — logo always goes to www, even from helpx
      const expectedHost   = pageHost.replace(/^[^.]+\./, 'www.');
      expect(
        hrefHost,
        `[${pageUrl}] Adobe logo href="${href}" points to "${hrefHost}" — expected "${expectedHost}" for this env`
      ).toBe(expectedHost);
    }

    await this.#ok(`[GNav] Adobe logo ✓  href="${href}"`);
  }

  // ── GNav: Nav links and buttons ──────────────────────────────────────────
  async validateNavItems() {
    const pageUrl    = this.url;
    const pageOrigin = new URL(this.url).origin;

    const pathSegments  = new URL(this.url).pathname.split('/').filter(Boolean);
    const localePrefix  = pathSegments.length > 0 && /^[a-z]{2}(_[a-z]{2,4})?$/i.test(pathSegments[0]) ? pathSegments[0] : null;

    const redirectedLocale = this.redirectedLocale;
    if (redirectedLocale) {
      await this.#warn(`[GNav] Locale redirect: /${this.originalLocale}/ → /${redirectedLocale}/`);
    }

    const itemCount = await this.navItems.count();
    if (itemCount === 0) { await this.#warn(`[GNav] No nav items found — slim nav (logo + sign-in only)`); return; }

    const linkCount = await this.navLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const link  = this.navLinks.nth(i);
      const text  = (await link.innerText().catch(() => '')).trim() || `(empty link ${i})`;
      const href  = await link.getAttribute('href');
      const isCta = await link.evaluate((el) => el.classList.contains('feds-cta'));
      const kind  = isCta ? 'Nav CTA' : 'Nav link';
      expect(href, `[${pageUrl}] ${kind} "${text}" (index ${i}) has no href`).toBeTruthy();

      if (href.startsWith('http') && /^https?:\/\/www\.(stage\.)?adobe\.com/.test(href)) {
        const linkOrigin = new URL(href).origin;
        if (linkOrigin !== pageOrigin) {
          await this.#warn(`[GNav] ${kind} "${text}" href="${href}" points to "${linkOrigin}" (page is on "${pageOrigin}")`);
        }

        if (redirectedLocale) {
          // Page redirected to a different locale — hrefs should use the redirected locale.
          if (!href.includes(`/${redirectedLocale}/`)) {
            await this.#warn(`[GNav] ${kind} "${text}" href="${href}" missing redirected locale "/${redirectedLocale}/" (redirected from /${localePrefix}/)`);
          }
        } else if (localePrefix && !href.includes(`/${localePrefix}/`)) {
          expect(false, `[${pageUrl}] ${kind} "${text}" href="${href}" missing locale prefix "/${localePrefix}/" — links must respect the page locale`).toBe(true);
        }
      }
      await this.#ok(`[GNav] ${kind} "${text}" ✓  href="${href}"`);
    }

    const btnCount = await this.navButtons.count();
    for (let i = 0; i < btnCount; i++) {
      const btn  = this.navButtons.nth(i);
      const text = (await btn.innerText().catch(() => '')).trim().split('\n')[0].trim() || `(dropdown ${i})`;
      await expect(btn, `[${pageUrl}] Nav dropdown "${text}" (index ${i}) must be visible`).toBeVisible();
      await this.#ok(`[GNav] Nav dropdown "${text}" visible ✓`);
    }
  }

  // ── GNav: find first CTA rendered on screen ───────────────────────────────
  async #findVisibleCta(selector) {
    const all = await this.page.locator(selector).evaluateAll((els) =>
      els.map((el, i) => {
        const rect = el.getBoundingClientRect();
        return { href: el.getAttribute('href'), text: el.textContent.trim(), index: i, width: rect.width, height: rect.height };
      })
    );
    return all.find((c) => c.width > 0 && c.height > 0) ?? null;
  }

  // ── GNav: Primary CTA ────────────────────────────────────────────────────
  async validatePrimaryCta() {
    const pageUrl    = this.url;
    const pageOrigin = new URL(this.url).origin;
    const count = await this.primaryCtas.count();
    if (count === 0) { await this.#warn(`[GNav] No .feds-cta--primary found in nav`); return; }
    const cta = await this.#findVisibleCta('.feds-cta--primary');
    if (!cta) { await this.#warn(`[GNav] Primary CTA exists in DOM but is off-screen`); return; }
    expect(cta.href, `[${pageUrl}] Primary CTA "${cta.text}" is visible but has no href`).toBeTruthy();
    if (cta.href.startsWith('http') && /adobe\.com/.test(cta.href)) {
      const ctaOrigin = new URL(cta.href).origin;
      if (ctaOrigin !== pageOrigin) {
        await this.#warn(`[GNav] Primary CTA href="${cta.href}" points to "${ctaOrigin}" (page is on "${pageOrigin}")`);
      }
    }
    await this.#ok(`[GNav] Primary CTA "${cta.text}" ✓  href="${cta.href}"`);
  }

  // ── GNav: Secondary CTA ──────────────────────────────────────────────────
  async validateSecondaryCta() {
    const pageUrl    = this.url;
    const pageOrigin = new URL(this.url).origin;
    const count = await this.secondaryCtas.count();
    if (count === 0) { await this.#warn(`[GNav] No .feds-cta--secondary found in nav`); return; }
    const cta = await this.#findVisibleCta('.feds-cta--secondary');
    if (!cta) { await this.#warn(`[GNav] Secondary CTA exists in DOM but is off-screen`); return; }
    expect(cta.href, `[${pageUrl}] Secondary CTA "${cta.text}" is visible but has no href`).toBeTruthy();
    if (cta.href.startsWith('http') && /adobe\.com/.test(cta.href)) {
      const ctaOrigin = new URL(cta.href).origin;
      if (ctaOrigin !== pageOrigin) {
        await this.#warn(`[GNav] Secondary CTA href="${cta.href}" points to "${ctaOrigin}" (page is on "${pageOrigin}")`);
      }
    }
    await this.#ok(`[GNav] Secondary CTA "${cta.text}" ✓  href="${cta.href}"`);
  }

  // ── GNav: App Switcher ───────────────────────────────────────────────────
  async validateAppSwitcher() {
    const pageUrl = this.url;
    await expect(this.appSwitcher, `[${pageUrl}] App switcher button (#unav-app-switcher) must be visible`).toBeVisible();

    await this.appSwitcher.click();
    await expect(this.appSwitcherModal, `[${pageUrl}] App switcher modal (#unav-app-switcher-dialog-id) did not open after click`).toBeVisible({ timeout: 10000 });
    await expect(this.appSwitcherLinks.first(), `[${pageUrl}] App switcher modal opened but no links found`).toBeVisible({ timeout: 30000 });

    const linkCount = await this.appSwitcherLinks.count();
    expect(linkCount, `[${pageUrl}] App switcher modal has 0 links`).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = this.appSwitcherLinks.nth(i);
      const name = (await link.innerText().catch(() => '')).trim() || `app-link-${i}`;
      const href = await link.getAttribute('href');
      expect(href, `[${pageUrl}] App switcher link "${name}" (index ${i}) has no href`).toBeTruthy();
    }
    await this.#ok(`[GNav] App switcher ✓  ${linkCount} app links`);

    await this.appSwitcher.dispatchEvent('click');
    await this.page.waitForTimeout(150);
  }

  // ── GNav: Sign In ────────────────────────────────────────────────────────
  async validateSignIn() {
    const pageUrl = this.url;
    await expect(this.signIn, `[${pageUrl}] Sign In button (#unav-profile) must be visible`).toBeVisible();
    await this.#ok(`[GNav] Sign In button visible ✓`);
  }

  // ── Layout — dimensions, viewport fit, LTR/RTL order ────────────────────
  async validateLayout() {
    const pageUrl       = this.url;
    const viewportWidth = this.page.viewportSize().width;
    const isRtl         = await this.page.evaluate(() => document.documentElement.dir === 'rtl');

    const coreElements = [
      { label: 'Adobe logo', locator: this.adobeLogo },
      { label: 'Sign In',    locator: this.signIn },
    ];
    if (!this.noAppSwitcher) coreElements.splice(1, 0, { label: 'App switcher', locator: this.appSwitcher });

    const boxes = {};
    for (const { label, locator } of coreElements) {
      const box = await locator.boundingBox();
      expect(box,        `[${pageUrl}] "${label}" has no bounding box — element may be hidden or collapsed`).toBeTruthy();
      expect(box.width,  `[${pageUrl}] "${label}" width is 0 — element is collapsed`).toBeGreaterThan(0);
      expect(box.height, `[${pageUrl}] "${label}" height is 0 — element is collapsed`).toBeGreaterThan(0);
      expect(box.y,      `[${pageUrl}] "${label}" is clipped above the viewport`).toBeGreaterThanOrEqual(0);
      boxes[label] = box;
    }

    if (this.noAppSwitcher) {
      const appSwitcherVisible = await this.appSwitcher.isVisible().catch(() => false);
      expect(appSwitcherVisible, `[${pageUrl}] App switcher (#unav-app-switcher) is visible but this page is marked as no-app-switcher`).toBe(false);
      await this.#ok(`[Layout] App switcher not expected on this page — confirmed absent ✓`);
      await this.#ok(`[Layout] Adobe logo, Sign In — have non-zero dimensions ✓`);
    } else {
      await this.#ok(`[Layout] Adobe logo, App switcher, Sign In — all have non-zero dimensions ✓`);
    }

    const header    = this.page.locator('#feds-header, header').first();
    const headerBox = await header.boundingBox();
    if (headerBox) {
      expect(
        headerBox.x + headerBox.width,
        `[${pageUrl}] GNav header overflows viewport — right edge ${Math.round(headerBox.x + headerBox.width)}px > ${viewportWidth}px`
      ).toBeLessThanOrEqual(viewportWidth + 1);
      await this.#ok(`[Layout] GNav header fits within viewport ✓`);
    }

    const logoBox   = boxes['Adobe logo'];
    const signInBox = boxes['Sign In'];
    if (this.noAppSwitcher) {
      if (isRtl) {
        expect(logoBox.x, `[${pageUrl}] RTL order broken — Adobe logo should be RIGHT of Sign In`).toBeGreaterThan(signInBox.x);
        await this.#ok(`[Layout] RTL element order correct (Sign In → Logo) ✓`);
      } else {
        expect(logoBox.x, `[${pageUrl}] LTR order broken — Adobe logo should be LEFT of Sign In`).toBeLessThan(signInBox.x);
        await this.#ok(`[Layout] LTR element order correct (Logo → Sign In) ✓`);
      }
    } else {
      const switcherBox = boxes['App switcher'];
      if (isRtl) {
        expect(logoBox.x,     `[${pageUrl}] RTL order broken — Adobe logo should be RIGHT of App switcher`).toBeGreaterThan(switcherBox.x);
        expect(switcherBox.x, `[${pageUrl}] RTL order broken — App switcher should be RIGHT of Sign In`).toBeGreaterThan(signInBox.x);
        await this.#ok(`[Layout] RTL element order correct (Sign In → App switcher → Logo) ✓`);
      } else {
        expect(logoBox.x,     `[${pageUrl}] LTR order broken — Adobe logo should be LEFT of App switcher`).toBeLessThan(switcherBox.x);
        expect(switcherBox.x, `[${pageUrl}] LTR order broken — App switcher should be LEFT of Sign In`).toBeLessThan(signInBox.x);
        await this.#ok(`[Layout] LTR element order correct (Logo → App switcher → Sign In) ✓`);
      }
    }
  }

  // ── GNav overlap check ────────────────────────────────────────────────────
  async validateGNavOverlap() {
    const pageUrl = this.url;

    const candidates = [
      { label: 'Adobe logo', locator: this.adobeLogo },
      { label: 'Sign In',    locator: this.signIn },
    ];
    if (!this.noAppSwitcher) candidates.splice(1, 0, { label: 'App switcher', locator: this.appSwitcher });

    const [btnInfos, linkInfos] = await Promise.all([
      this.navButtons.evaluateAll((els) => els.map((el) => (el.textContent || '').trim())),
      this.navLinks.evaluateAll((els) => els.map((el) => (el.textContent || '').trim())),
    ]);
    for (let i = 0; i < btnInfos.length;  i++) candidates.push({ label: btnInfos[i]  || `nav-btn-${i}`,  locator: this.navButtons.nth(i) });
    for (let i = 0; i < linkInfos.length; i++) candidates.push({ label: linkInfos[i] || `nav-link-${i}`, locator: this.navLinks.nth(i) });

    const boxes = (await Promise.all(
      candidates.map(async ({ label, locator }) => ({ label, box: await locator.boundingBox().catch(() => null) }))
    )).filter((e) => e.box);

    boxes.sort((a, b) => a.box.x - b.box.x);

    const overlaps = (a, b) =>
      a.x < b.x + b.width  && a.x + a.width  > b.x &&
      a.y < b.y + b.height && a.y + a.height > b.y;

    const overlapFailures = [];
    for (let i = 0; i < boxes.length - 1; i++) {
      const a = boxes[i];
      const b = boxes[i + 1];
      if (overlaps(a.box, b.box)) {
        overlapFailures.push(`"${a.label}" overlaps "${b.label}"`);
        this.#warn(`[Layout] Overlap — "${a.label}" overlaps "${b.label}"`);
      } else {
        this.#ok(`[Layout] "${a.label}" → "${b.label}" — no overlap ✓`);
      }
    }

    expect(
      overlapFailures.length,
      `[${pageUrl}] GNav element overlap(s) detected:\n${overlapFailures.map((f) => `  • ${f}`).join('\n')}`
    ).toBe(0);
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  async validateFooter() {
    const pageUrl = this.url;

    // Footer is lazy-loaded — scroll to bottom first to trigger rendering, then wait for it to appear.
    await this.footer.waitFor({ state: 'attached', timeout: 20000 });
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.footer.waitFor({ state: 'visible', timeout: 15000 });

    await this.page.locator('ul.feds-social').waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

    const hasFeaturedProducts = await this.footerFeaturedProducts.isVisible().catch(() => false);
    if (hasFeaturedProducts) {
      const productCount = await this.footerProductLinks.count();
      expect(productCount, `[${pageUrl}] Footer featured products section is visible but contains 0 product links`).toBeGreaterThan(0);
      for (let i = 0; i < productCount; i++) {
        const link = this.footerProductLinks.nth(i);
        const name = (await link.innerText().catch(() => '')).trim() || `product-${i}`;
        const href = await link.getAttribute('href');
        expect(href, `[${pageUrl}] Footer featured product "${name}" (index ${i}) has no href`).toBeTruthy();
        if (href.startsWith('http')) {
          const host = new URL(href).hostname;
          expect(
            host.endsWith('adobe.com'),
            `[${pageUrl}] Footer product "${name}" href="${href}" points to "${host}" — expected an adobe.com domain`
          ).toBe(true);
        }
      }
      await this.#ok(`[Footer] featured products: ${productCount} links ✓`);
    } else {
      await this.#ok(`[Footer] featured products: not present on this page — skipping`);
    }

    const socialCount = await this.footerSocialLinks.count();
    expect(socialCount, `[${pageUrl}] Footer social links (ul.feds-social a) — 0 found, expected at least 1`).toBeGreaterThan(0);
    for (let i = 0; i < socialCount; i++) {
      const link     = this.footerSocialLinks.nth(i);
      const platform = (await link.getAttribute('aria-label').catch(() => null)) || `social-${i}`;
      const href     = await link.getAttribute('href');
      expect(href, `[${pageUrl}] Footer social link "${platform}" (index ${i}) has no href`).toBeTruthy();
    }
    await this.#ok(`[Footer] social links: ${socialCount} ✓`);

    const isExpress       = new URL(pageUrl).pathname.includes('/express');
    const isHelpx         = new URL(pageUrl).hostname.startsWith('helpx.');
    const regionPicker    = isHelpx
      ? this.page.locator('a.feds-regionPicker').nth(1)
      : this.footerChangeRegion;
    const hasRegionPicker = await regionPicker.isVisible().catch(() => false);
    if (hasRegionPicker) {
      await this.#ok(`[Footer] change region ✓`);
    } else if (isExpress) {
      await this.#warn(`[Footer] Footer "Change region" not present on Express — expected`);
    } else {
      expect(false, `[${pageUrl}] Footer "Change region" link (a.feds-regionPicker) must exist`).toBe(true);
    }

    // Auto-detect footer type — C2 pages use feds-footer-miscLinks-legal, standard use feds-footer-legalWrapper.
    const isC2Footer = await this.footerMiscLinksLegal.isVisible().catch(() => false);
    if (isC2Footer) {
      await this.#ok(`[Footer] C2 footer detected`);
      await expect(this.footerLogo, `[${pageUrl}] Footer logo (.feds-footer-logo) must be visible`).toBeVisible();
      await this.#ok(`[Footer] footer logo ✓`);
    } else {
      await expect(this.footerLegalWrapper, `[${pageUrl}] Footer legal wrapper (div.feds-footer-legalWrapper) must be visible`).toBeVisible({ timeout: 10000 });
      const listItemCount = await this.footerPrivacyListItems.count();
      if (listItemCount < 6 || listItemCount > 7) await this.#warn(`[Footer] Expected 6–7 privacy list items — found ${listItemCount}`);
      const itemTexts = await this.footerPrivacyListItems.evaluateAll((els) =>
        els.map((el) => el.textContent.trim().split('\n')[0].trim()).filter(Boolean)
      );
      await this.#ok(`[Footer] legal links: ${itemTexts.join(' | ')} ✓`);
    }
  }

  // ── Footer: Market selectors (Express) ───────────────────────────────────
  async validateMarketSelector() {
    const pageUrl = this.url;
    const buttons = this.page.locator('button.market-selector-button');
    const count   = await buttons.count();
    expect(count, `[${pageUrl}] Expected 2 market selector buttons (language + region), found ${count}`).toBe(2);
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i), `[${pageUrl}] Market selector button ${i + 1} must be visible`).toBeVisible();
      const haspopup = await buttons.nth(i).getAttribute('aria-haspopup');
      expect(haspopup, `[${pageUrl}] Market selector button ${i + 1} missing aria-haspopup`).toBeTruthy();
    }
    await this.#ok(`[Footer] Market selectors ✓  2 buttons present (language + region)`);
  }

  // ── Jarvis / Virtual Assistant ────────────────────────────────────────────
  async validateJarvisWidget() {
    const pageUrl = this.url;

    const jarvisVisible = await this.jarvisButton.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true).catch(() => false);
    if (!jarvisVisible) {
      await this.#ok(`[Jarvis] chat button not present on this page — skipping`);
      return;
    }
    await this.#ok(`[Jarvis] chat button visible ✓`);

    await this.jarvisButton.click({ timeout: 3000 });

    await expect(this.jarvisContainer, `[${pageUrl}] Jarvis iframe did not appear after clicking`).toBeVisible({ timeout: 5000 });
    await this.#ok(`[Jarvis] panel opened ✓`);

    const jarvisFrame = this.page.frameLocator('iframe.adbmsgContentIframe');
    const heading     = jarvisFrame.locator('[role="heading"], h1, h2').first();
    await expect(heading, `[${pageUrl}] Jarvis iframe visible but no heading element found inside`).toBeVisible({ timeout: 5000 });
    await this.#ok(`[Jarvis] heading element ✓`);

    await jarvisFrame.locator('#quitDialogTriggerButton').click({ timeout: 2000 }).catch(() => null);
    await this.page.keyboard.press('Escape');
    await this.#ok(`[Jarvis] panel closed ✓`);
  }

  // ── Accessibility — axe-core WCAG 2.1 AA ─────────────────────────────────
  async validateAccessibility() {
    const pageUrl = this.url;
    const results  = await runAxeScan(this.page, { selector: 'header', wcag: ['wcag21aa'] });
    const all      = getViolationSummary(results);
    const critical = all.filter((v) => v.impact === 'critical' || v.impact === 'serious');

    for (const v of all) {
      await this.#ok(`[Accessibility] [${v.impact}] ${v.id} — ${v.description} (${v.affectedNodes} node(s))  ${v.helpUrl}`);
    }

    expect(
      critical.length,
      `[${pageUrl}] ${critical.length} critical/serious WCAG 2.1 AA violation(s) in GNav header:\n` +
      critical.map((v) => `  • [${v.impact}] ${v.id}: ${v.description}\n    ${v.helpUrl}`).join('\n')
    ).toBe(0);

    await this.#ok(`[Accessibility] ✓  ${all.length} total, ${critical.length} critical/serious`);
  }

  // ── window.adobeid — IMS config check ───────────────────────────────────
  async validateAdobeId(expectedClientId) {
    const pageUrl = this.url;

    const adobeId = await this.page.evaluate(() => window.adobeid ?? null);
    expect(adobeId, `[${pageUrl}] window.adobeid is not defined — IMS config did not load`).toBeTruthy();

    expect(adobeId.client_id, `[${pageUrl}] window.adobeid.client_id is not defined`).toBeTruthy();
    if (expectedClientId) {
      expect(
        adobeId.client_id,
        `[${pageUrl}] window.adobeid.client_id="${adobeId.client_id}" — expected "${expectedClientId}"`
      ).toBe(expectedClientId);
    }
    await this.#ok(`[IMS] window.adobeid.client_id="${adobeId.client_id}" ✓`);

    const REQUIRED_SCOPES = ['AdobeID', 'openid', 'gnav', 'pps.read', 'firefly_api', 'read_organizations', 'account_cluster.read'];
    const actualScopes    = typeof adobeId.scope === 'string'
      ? adobeId.scope.split(/[\s,]+/).map((s) => s.trim())
      : [];

    const missingScopes = REQUIRED_SCOPES.filter((s) => !actualScopes.includes(s));
    expect(
      missingScopes.length,
      `[${pageUrl}] window.adobeid.scope is missing required scope(s): ${missingScopes.join(', ')}\n  actual scope: "${adobeId.scope}"`
    ).toBe(0);
    await this.#ok(`[IMS] window.adobeid.scope ✓  all required scopes present`);
  }

  // ── Analytics — daa-ll attributes + AEP Web SDK collect calls ────────────
  async validateAnalytics() {
    const pageUrl = this.url;

    const blockNavigations = async (route) => {
      if (route.request().isNavigationRequest()) await route.fulfill({ status: 204, body: '' });
      else await route.continue();
    };
    await this.page.route('**/*', blockNavigations);
    const onNewPage = (newPage) => { newPage.close().catch(() => {}); };
    this.page.context().on('page', onNewPage);

    const [navBtnInfo, navLinkInfo, logoDaaLl, switcherDaaLl] = await Promise.all([
      this.navButtons.evaluateAll((els) => els.map((el) => ({
        daaLl: el.getAttribute('daa-ll'), text: (el.textContent || '').trim().split('\n')[0].trim(),
      }))),
      this.navLinks.evaluateAll((els) => els.map((el) => ({
        daaLl: el.getAttribute('daa-ll'), text: (el.textContent || '').trim().split('\n')[0].trim(),
      }))),
      this.adobeLogo.getAttribute('daa-ll').catch(() => null),
      this.noAppSwitcher ? Promise.resolve(null) : this.appSwitcher.getAttribute('daa-ll').catch(() => null),
    ]);

    const clicked      = [];
    const panelResults = [];

    const clickEl = async (locator, label, daaLl, isClose = false) => {
      await locator.evaluate((el) => el.click()).catch(() => {});
      clicked.push({ label, daaLl, isClose });
    };

    try {
      for (let i = 0; i < navBtnInfo.length; i++) {
        const btn = this.navButtons.nth(i);
        const { daaLl, text } = navBtnInfo[i];
        const label = text || `nav-btn-${i}`;

        await clickEl(btn, `${label} — open`, daaLl, false);

        const opened = await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
          .then(() => true).catch(() => false);
        panelResults.push({ label, opened, closed: null });

        if (opened) {
          await clickEl(btn, `${label} — close`, daaLl, true);
          const closed = await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 1000 })
            .then(() => true).catch(() => false);
          panelResults[panelResults.length - 1].closed = closed;
        }
      }
      for (let i = 0; i < navLinkInfo.length; i++) {
        await clickEl(this.navLinks.nth(i), navLinkInfo[i].text || `nav-link-${i}`, navLinkInfo[i].daaLl);
      }
      await clickEl(this.adobeLogo, 'Adobe logo', logoDaaLl);
      if (!this.noAppSwitcher) {
        await clickEl(this.appSwitcher, 'App switcher', switcherDaaLl);
        const modalOpen = await this.appSwitcherModal.isVisible().catch(() => false);
        if (modalOpen) await this.appSwitcher.click().catch(() => {});
      } else {
        await this.#ok(`[Analytics] App switcher not expected on this page — skipping`);
      }

      await expect(this.signIn, `[${pageUrl}] Sign In button must be visible`).toBeVisible();
      const signInDaaLl = await this.signIn.getAttribute('daa-ll').catch(() => null);
      if (signInDaaLl) await this.#ok(`[Analytics] "Sign In" daa-ll="${signInDaaLl}" ✓ (click skipped — navigates to IMS)`);
      else             await this.#warn(`[Analytics] "Sign In" missing daa-ll`);

      await this.page.keyboard.press('Escape');

      let lastCount = this.collectCalls.length;
      let stableMs  = 0;
      const deadline = Date.now() + 1500;
      while (Date.now() < deadline) {
        await this.page.waitForTimeout(100);
        const current = this.collectCalls.length;
        if (current === lastCount) {
          stableMs += 100;
          if (stableMs >= 400) break;
        } else {
          stableMs = 0;
          lastCount = current;
        }
      }
    } finally {
      await this.page.unroute('**/*', blockNavigations);
      this.page.context().off('page', onNewPage);
    }

    for (const { label, opened, closed } of panelResults) {
      if (!opened) {
        await this.#warn(`[Analytics] "${label}" ✗ did not open`);
      } else if (closed === false) {
        await this.#warn(`[Analytics] "${label}" ✓ opened  ✗ did not close`);
      } else {
        await this.#ok(`[Analytics] "${label}" ✓ opened  ✓ closed`);
      }
    }

    const allNames = this.collectCalls.map((c) => c.interactionName);

    const findCall = (names, daaLl, isClose) => {
      if (!isClose) return names.find((n) => n.startsWith(daaLl) && !n.endsWith('|Close'));
      const standard = names.find((n) => n.startsWith(daaLl) && n.endsWith('|Close'));
      if (standard) return standard;
      const closePrefix = daaLl.replace(/\bOpen\b/, 'Close');
      return closePrefix !== daaLl ? names.find((n) => n.startsWith(closePrefix) && n.includes('|gnav|')) : null;
    };

    const validateName = (name, daaLl, isClose) => {
      const issues = [];
      if (!name.includes('|gnav|')) issues.push(`name missing "|gnav|" segment`);
      if (isClose) {
        const isStdClose      = name.startsWith(daaLl) && name.endsWith('|Close');
        const isHomepageClose = name.startsWith(daaLl.replace(/\bOpen\b/, 'Close'));
        if (!isStdClose && !isHomepageClose) issues.push(`close event name format unrecognised — got "${name}"`);
      } else {
        if (!name.startsWith(daaLl)) issues.push(`name does not start with daa-ll "${daaLl}"`);
        if (name.endsWith('|Close'))  issues.push(`open/click event should not end with "|Close"`);
      }
      return issues;
    };

    let missingDaaLl = 0, noCall = 0, nameIssueCount = 0;
    for (const { label, daaLl, isClose } of clicked) {
      if (!daaLl) {
        await this.#warn(`[Analytics] "${label}" missing daa-ll`);
        missingDaaLl++; continue;
      }
      const call = findCall(allNames, daaLl, isClose);
      if (!call) {
        await this.#warn(`[Analytics] "${label}" daa-ll="${daaLl}" — no matching collect call found`);
        noCall++; continue;
      }
      const issues = validateName(call, daaLl, isClose);
      if (issues.length > 0) {
        for (const issue of issues) await this.#warn(`[Analytics] "${label}" — ${issue}`);
        nameIssueCount++;
      } else {
        await this.#ok(`[Analytics] "${label}" ✓  name="${call}"`);
      }
    }

    const total  = clicked.length;
    const passed = total - missingDaaLl - noCall - nameIssueCount;
    await this.#ok(`[Analytics] summary: ${passed}/${total} passed ✓  (${missingDaaLl} missing daa-ll, ${noCall} no call, ${nameIssueCount} name issues)`);
  }

  // ── A11y: Skip link ───────────────────────────────────────────────────────
  async validateSkipLink() {
    const skipLink = this.page.locator('a[href="#main-content"], a[href="#main"], a[href="#root"]').first();
    const present  = await skipLink.count() > 0;
    if (present) await this.#ok(`[Accessibility] Skip link present in DOM ✓`);
    else         await this.#warn(`[Accessibility] "Skip to main content" link not found in DOM`);
  }

  // ── A11y: Adobe logo alt text ─────────────────────────────────────────────
  async validateLogoAltText() {
    const logoImg = this.adobeLogo.locator('img').first();
    const hasImg  = (await logoImg.count()) > 0;
    if (!hasImg) { await this.#warn(`[Accessibility] Adobe logo uses SVG/icon (no <img>) — alt text check skipped`); return; }
    const alt = await logoImg.getAttribute('alt');
    if (!alt) { await this.#warn(`[Accessibility] Adobe logo <img> has no alt attribute`); return; }
    await this.#ok(`[Accessibility] Adobe logo alt="${alt}" ✓`);
  }

  // ── A11y: html[lang] matches locale ──────────────────────────────────────
  async validateLangAttribute(localeLang) {
    const pageUrl = this.url;
    const lang    = await this.page.locator('html').getAttribute('lang');
    expect(lang, `[${pageUrl}] <html> has no lang attribute`).toBeTruthy();
    expect(
      lang.toLowerCase(),
      `[${pageUrl}] html lang="${lang}" does not match locale lang="${localeLang}"`
    ).toContain(localeLang.toLowerCase());
    await this.#ok(`[Accessibility] html lang="${lang}" ✓`);
  }

  // ── A11y: Nav landmark ────────────────────────────────────────────────────
  async validateNavLandmark() {
    const present = await this.page.locator('#feds-header nav, #feds-header [role="navigation"]').count() > 0;
    if (present) await this.#ok(`[Accessibility] Nav landmark present ✓`);
    else         await this.#warn(`[Accessibility] GNav has no <nav> or role="navigation" landmark`);
  }

  // ── A11y: Focus visible ───────────────────────────────────────────────────
  async validateFocusVisible() {
    const pageUrl   = this.url;
    const totalTabs = 3;
    await this.adobeLogo.focus();
    let passed = 0;
    for (let i = 0; i < totalTabs; i++) {
      await this.page.keyboard.press('Tab');
      const el = await this.page.evaluate(() => {
        const node = document.activeElement;
        if (!node || node === document.body) return null;
        const header = document.querySelector('#feds-header, header');
        const inHeader = header ? header.contains(node) : true;
        const s = window.getComputedStyle(node);
        return {
          tag:          node.tagName,
          label:        (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 50),
          focusVisible: node.matches(':focus-visible'),
          outline:      s.outlineStyle,
          outlineW:     s.outlineWidth,
          shadow:       s.boxShadow,
          inHeader,
        };
      });
      if (!el) { await this.#ok(`[Accessibility] Focus: Tab ${i + 1} moved outside DOM — stopping`); break; }
      if (!el.inHeader) { await this.#ok(`[Accessibility] Focus: Tab ${i + 1} moved outside header — stopping`); break; }
      const hasRing = el.focusVisible && (
        el.outline === 'auto' ||
        (el.outline !== 'none' && el.outlineW !== '0px') ||
        el.shadow !== 'none'
      );
      await this.#ok(`[Accessibility] Focus: Tab ${i + 1} <${el.tag}> "${el.label}" outline=${el.outline} shadow=${el.shadow !== 'none' ? 'yes' : 'none'}`);
      expect(hasRing, `[${pageUrl}] Tab ${i + 1}: <${el.tag}> "${el.label}" has no visible focus ring (outline=${el.outline}, box-shadow=${el.shadow})`).toBe(true);
      passed++;
    }
    await this.#ok(`[Accessibility] Focus visible: ${passed} nav elements have visible focus ring ✓`);
  }

  // ── A11y: Keyboard navigation (Tab / Shift+Tab / Enter / Escape / Space) ──
  async validateKeyboardNavigation() {
    const pageUrl  = this.url;
    const browser  = this.page.context().browser()?.browserType().name() ?? 'unknown';
    const keyboardFailures = [];

    // Run a single keyboard sub-check; always continues to the next.
    const keyCheck = async (label, fn) => {
      try {
        await fn();
        this.#ok(`[Keyboard] ✓ ${label}`);
      } catch (e) {
        keyboardFailures.push(`${label}: ${e.message.split('\n')[0].trim()}`);
      }
    };

    // Log which element currently has focus in the browser.
    const logFocus = async (context) => {
      const info = await this.page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return {
          tag:      el.tagName,
          text:     (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 50),
          role:     el.getAttribute('role'),
          expanded: el.getAttribute('aria-expanded'),
        };
      }).catch(() => null);
      if (info) this.#ok(`[Keyboard] focus after ${context} → <${info.tag}> "${info.text}" role=${info.role} aria-expanded=${info.expanded} [${browser}]`);
      else       this.#ok(`[Keyboard] focus after ${context} → none / body [${browser}]`);
    };

    // ── Tab forward ───────────────────────────────────────────────────────────
    await this.adobeLogo.focus();
    await logFocus('logo.focus()');
    for (let i = 0; i < 3; i++) {
      await this.page.keyboard.press('Tab');
      await logFocus(`Tab ${i + 1}`);
      const ok = await expect(this.page.locator(':focus')).toBeVisible({ timeout: 2000 }).then(() => true).catch(() => false);
      if (!ok) { this.#warn(`[Keyboard] Tab ${i + 1} — focus left the nav`); break; }
    }
    this.#ok(`[Keyboard] Tab forward ✓`);

    // ── Shift+Tab reverse ────────────────────────────────────────────────────
    // Only meaningful if Tab 1 stays inside the GNav header.
    // Some pages (e.g. helpx) put GNav at the end of the DOM tab order so Tab 1
    // exits the header immediately — that's a DOM order choice, not a bug.
    const tab1InHeader = await this.page.evaluate(() => {
      const node = document.activeElement;
      if (!node || node === document.body) return false;
      const header = document.querySelector('#feds-header, header');
      return header ? header.contains(node) : false;
    });
    if (!tab1InHeader) {
      this.#warn(`[Keyboard] Shift+Tab skipped — Tab 1 exited the GNav header (GNav is last in DOM tab order on this page)`);
    } else {
      await keyCheck('Shift+Tab moves focus backward in GNav', async () => {
        await this.page.keyboard.press('Shift+Tab');
        await logFocus('Shift+Tab');
        const el = await this.page.evaluate(() => {
          const node = document.activeElement;
          if (!node || node === document.body) return null;
          const header = document.querySelector('#feds-header, header');
          return { inHeader: header ? header.contains(node) : false };
        });
        if (!el?.inHeader) throw new Error('Shift+Tab moved focus outside the GNav header');
      });
    }

    // ── Enter / Escape / Space on first dropdown button ───────────────────────
    const btnCount = await this.navButtons.count();
    if (btnCount === 0) { this.#warn(`[Keyboard] No nav dropdown buttons — dropdown keyboard test skipped`); return; }

    const btn     = this.navButtons.first();
    const btnText = (await btn.textContent().catch(() => '')).trim() || 'dropdown-1';
    const panelId = await btn.getAttribute('aria-controls');
    const panel   = panelId ? this.page.locator(`#${panelId}`) : null;

    const btnInfo = await btn.evaluate((el) => ({
      tag:      el.tagName,
      text:     el.textContent?.trim().slice(0, 60),
      expanded: el.getAttribute('aria-expanded'),
      controls: el.getAttribute('aria-controls'),
      visible:  el.checkVisibility?.() ?? el.offsetParent !== null,
    })).catch(() => ({}));
    this.#ok(`[Keyboard] dropdown target → <${btnInfo.tag}> "${btnInfo.text}" aria-expanded=${btnInfo.expanded} aria-controls=${btnInfo.controls} visible=${btnInfo.visible} [${browser}]`);

    try {
      // Enter — open
      await keyCheck(`[${btnText}] Enter sets aria-expanded="true"`, async () => {
        await btn.press('Enter');
        await logFocus('btn.press(Enter)');
        await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
      });
      if (panel) {
        await keyCheck(`[${btnText}] Panel visible after Enter`, async () => {
          await expect(panel).toBeVisible({ timeout: 2000 });
        });
      }

      // Tab — focus moves inside panel (WebKit skips: Safari Tab only cycles inputs by default)
      await this.page.keyboard.press('Tab');
      await logFocus('Tab into panel');
      if (panel) {
        if (browser === 'webkit') {
          this.#warn(`[Keyboard] [${btnText}] Tab-into-panel skipped on WebKit — Safari requires "Tab focuses all controls" in System Preferences`);
        } else {
          await keyCheck(`[${btnText}] Tab moves focus inside open panel`, async () => {
            const focusInPanel = await panel.evaluate((el) => el.contains(document.activeElement));
            if (!focusInPanel) throw new Error('focus is outside the open panel');
          });
        }
      }

      // Escape — close
      const escapeFailsBefore = keyboardFailures.length;
      await keyCheck(`[${btnText}] Escape sets aria-expanded="false"`, async () => {
        await this.page.keyboard.press('Escape');
        await logFocus('Escape');
        await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 2000 });
      });
      const escapeWorks = keyboardFailures.length === escapeFailsBefore;

      // Space — open then close.
      // Reset to closed state first so Space is always tested independently of Escape.
      // If dropdown is still open (Escape failed), close it via click to avoid cascade failure.
      const stillOpen = await btn.getAttribute('aria-expanded').catch(() => null);
      if (stillOpen === 'true') await btn.click().catch(() => {});

      await btn.focus();
      await logFocus('btn.focus() before Space');
      await keyCheck(`[${btnText}] Space sets aria-expanded="true"`, async () => {
        await this.page.keyboard.press('Space');
        await logFocus('Space');
        await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 2000 });
      });

      if (!escapeWorks) {
        this.#warn(`[Keyboard] [${btnText}] Escape-after-Space skipped — Escape non-functional on this page`);
      } else {
        await keyCheck(`[${btnText}] Escape closes after Space`, async () => {
          await this.page.keyboard.press('Escape');
          await logFocus('Escape after Space');
          await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 2000 });
        });
      }
    } finally {
      // Always close dropdown so analytics clicks are not blocked by an open panel.
      // Use click (not Escape) — Escape may not close on some pages (e.g. helpx).
      const isOpen = await btn.getAttribute('aria-expanded').catch(() => null);
      if (isOpen === 'true') await btn.click().catch(() => {});
    }

    for (const f of keyboardFailures) this.#warn(`[Keyboard] ✗ ${f}`);
  }

  // ── Console errors from UNav scripts ─────────────────────────────────────
  async validateConsoleErrors() {
    const pageUrl  = this.url;
    const patterns = [/unav\.js/, /utils\.js/, /notification/, /profile\.js/];
    const relevant = this.consoleErrors.filter(({ text, location }) =>
      patterns.some((re) => re.test(location) || re.test(text))
    );
    if (relevant.length > 0) {
      const lines = relevant.map(({ text, location }) => `  • ${location ? `[${location}] ` : ''}${text}`).join('\n');
      throw new Error(`[${pageUrl}] ${relevant.length} console error(s) from UNav scripts:\n${lines}`);
    }
    await this.#ok(`[Console] No errors from unav.js / notification / profile.js ✓`);
  }

  // ── Network: helpers ──────────────────────────────────────────────────────
  // Waits for a response matching pattern if page.on('response') hasn't captured a 200 yet.
  // Unblocks on any non-error response (< 400) so disk-cache 302s don't cause unnecessary timeout.
  // Validators still assert status === 200 — this is only the wait gate.
  async #waitForResponse(pattern, timeout = 10000) {
    if (this.networkResponses.some((r) => pattern.test(r.url) && r.status === 200)) return;
    await this.page.waitForResponse(
      (r) => pattern.test(r.url()) && r.status() < 400,
      { timeout }
    ).catch(() => null);
  }

  // ── Network: UniversalNav.js + CSS ───────────────────────────────────────
  async validateUnavScript(expectedVersion = null) {
    const pageUrl = this.url;

    await this.#waitForResponse(/\/unav\/[\d.]+\/UniversalNav\.js/);
    await this.#waitForResponse(/\/unav\/[\d.]+\/UniversalNav\.css/);

    const allJsRes   = this.networkResponses.filter((r) => /\/unav\/[\d.]+\/UniversalNav\.js/.test(r.url));
    const jsRedirect = allJsRes.find((r) => r.status >= 300 && r.status < 400);
    const jsRes      = allJsRes.find((r) => r.status === 200);
    const js200Count = allJsRes.filter((r) => r.status === 200).length;

    if (jsRedirect) {
      await this.#warn(`[Network] UniversalNav.js redirect: ${jsRedirect.url} → HTTP ${jsRedirect.status}`);
    }
    expect(jsRes,      `[${pageUrl}] UniversalNav.js not loaded — no 200 response found`).toBeDefined();
    expect(js200Count, `[${pageUrl}] UniversalNav.js loaded ${js200Count}× — expected exactly 1`).toBe(1);
    await this.#ok(`[Network] UniversalNav.js ✓  ${jsRes.url}  HTTP ${jsRes.status}`);

    const allCssRes   = this.networkResponses.filter((r) => /\/unav\/[\d.]+\/UniversalNav\.css/.test(r.url));
    const cssRedirect = allCssRes.find((r) => r.status >= 300 && r.status < 400);
    const cssRes      = allCssRes.find((r) => r.status === 200);
    const css200Count = allCssRes.filter((r) => r.status === 200).length;

    if (cssRedirect) {
      await this.#warn(`[Network] UniversalNav.css redirect: ${cssRedirect.url} → HTTP ${cssRedirect.status}`);
    }
    expect(cssRes,      `[${pageUrl}] UniversalNav.css not loaded — no 200 response found`).toBeDefined();
    expect(css200Count, `[${pageUrl}] UniversalNav.css loaded ${css200Count}× — expected exactly 1`).toBe(1);
    await this.#ok(`[Network] UniversalNav.css ✓  HTTP ${cssRes.status}`);

    const match           = jsRes.url.match(/\/unav\/([\d.]+)\//);
    const actual          = match ? match[1] : 'unknown';
    const redirectVersion = jsRedirect ? (jsRedirect.url.match(/\/unav\/([\d.]+)\//) || [])[1] || 'unknown' : null;

    if (redirectVersion && redirectVersion !== actual) {
      await this.#warn(`[Network] Version redirect: requested ${redirectVersion} → served ${actual}`);
    }
    // Log version result before asserting so it always appears in console
    this.#ok(`[Network] Version loaded: ${actual}${expectedVersion ? ` | expected: ${expectedVersion} | ${actual === expectedVersion ? '✓' : '✗ MISMATCH'}` : ''}`);
    if (expectedVersion) {
      expect(actual, `[${pageUrl}] UNav version mismatch — expected ${expectedVersion}, got ${actual}`).toBe(expectedVersion);
    }
  }

  // ── Network: ArpService bundle ───────────────────────────────────────────
  async validateArpService() {
    const pageUrl = this.url;

    await this.#waitForResponse(/ArpService\.\w+\.bundle\.js/);
    const allArp = this.networkResponses.filter((r) => /ArpService\.\w+\.bundle\.js/.test(r.url));
    const res    = allArp.find((r) => r.status === 200);
    const count  = allArp.filter((r) => r.status === 200).length;
    expect(res,   `[${pageUrl}] ArpService bundle not loaded (HTTP 200)`).toBeDefined();
    expect(count, `[${pageUrl}] ArpService bundle loaded ${count}× — expected exactly 1`).toBe(1);
    await this.#ok(`[Network] ArpService ✓  ${res.url}`);

    await this.page.waitForFunction(() => !!window.adobeArp?.sessionToken, { timeout: 10000 }).catch(() => null);
    const sessionToken = await this.page.evaluate(() => window.adobeArp?.sessionToken ?? null);
    expect(sessionToken, `[${pageUrl}] window.adobeArp.sessionToken is null — ArpService did not initialise`).toBeTruthy();
    await this.#ok(`[Network] ArpService sessionToken ✓`);
  }

  // ── Network: sherlock.min.js ─────────────────────────────────────────────
  async validateSherlock() {
    const pageUrl = this.url;

    await this.#waitForResponse(/sherlock\.min\.js/);
    const allSherlock = this.networkResponses.filter((r) => /sherlock\.min\.js/.test(r.url));
    const res         = allSherlock.find((r) => r.status === 200);
    const count       = allSherlock.filter((r) => r.status === 200).length;
    expect(res,   `[${pageUrl}] sherlock.min.js not loaded (HTTP 200)`).toBeDefined();
    expect(count, `[${pageUrl}] sherlock.min.js loaded ${count}× — expected exactly 1`).toBe(1);
    await this.#ok(`[Network] Sherlock ✓  ${res.url}`);
  }

  // ── Network: bfp.min.js + bfp_capture ───────────────────────────────────
  async validateBfp() {
    const pageUrl = this.url;

    await this.#waitForResponse(/bfp\.min\.js/);
    const allBfpScript = this.networkResponses.filter((r) => /bfp\.min\.js/.test(r.url));
    const scriptRes    = allBfpScript.find((r) => r.status === 200);
    const scriptCount  = allBfpScript.filter((r) => r.status === 200).length;
    expect(scriptRes,   `[${pageUrl}] bfp.min.js not loaded (HTTP 200)`).toBeDefined();
    expect(scriptCount, `[${pageUrl}] bfp.min.js loaded ${scriptCount}× — expected exactly 1`).toBe(1);
    await this.#ok(`[Network] BFP script ✓  ${scriptRes.url}`);

    // BFP capture fires after UNav initialises — allow extra time in parallel runs
    await this.#waitForResponse(/bfp_capture/, 30000);
    const allBfpCapture = this.networkResponses.filter((r) => /bfp_capture/.test(r.url));
    const captureRes    = allBfpCapture.find((r) => r.status === 200);
    const captureCount  = allBfpCapture.filter((r) => r.status === 200).length;
    expect(captureRes,   `[${pageUrl}] bfp_capture call never fired (HTTP 200)`).toBeDefined();
    expect(captureCount, `[${pageUrl}] bfp_capture fired ${captureCount}× — expected exactly 1`).toBe(1);
    await this.#ok(`[Network] BFP capture ✓`);
  }
}
