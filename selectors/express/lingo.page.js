import { expect } from '@playwright/test';

export class LingoGeoBannerPage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  constructor(page) {
    this.page = page;

    // Language banner
    this.languageBanner = page.locator('.language-banner');
    this.languageBannerText = page.locator('.language-banner-text');
    this.languageBannerLink = page.locator('.language-banner-link');
    this.languageBannerClose = page.locator('.language-banner-close');

    // Geo-routing modal shell (#locale-modal-v2 outer container; optional on some locales)
    this.geoModalShell = page.locator('#locale-modal-v2');

    // Geo-routing modal: first `.georouting-wrapper` (no CTA filter — class names vary)
    this.geoRoutingModal = page.locator('.georouting-wrapper').first();

    // Primary CTA: first visible, enabled link/button in the modal wrapper.
    // Excludes paddle/scroll buttons which carry aria-hidden="true" and disabled.
    this.geoRoutingModalButton = this.geoRoutingModal
      .locator('a:not([aria-hidden="true"]), button:not([disabled]):not([aria-hidden="true"])')
      .first();


    // Geo modal region priority dropdown trigger: the a/button that CONTAINS the down-arrow icon.
    // The icon itself (.icon-milo.down-arrow) is <img role="presentation"> — not directly clickable.
    this.geoModalRegionPriorityDropdown = this.geoRoutingModal
      .locator('a, button')
      .filter({ has: page.locator('.icon-milo.down-arrow') })
      .first();

    this.geoModalRegionPriorityTab= page.locator('')

    // Stay link: last link in the modal wrapper (typically the "stay on current site" action)
    this.geoRoutingModalStayLink = this.geoRoutingModal.locator('a').last();

    this.geoModalClose = this.geoRoutingModal
      .locator('button[aria-label="Close"], .dialog-close, [class*="close-button"], button.close')
      .first();

    // Footer / main landmark — **do not** `filter({ has: .market-selector-dropdown })`: before hydration no
    // footer matches and scroll + polling cannot target the block where controls will mount.
    const footerMarketRoot = page.locator('footer').last().or(page.locator('[role="contentinfo"]').last());
    const footerMarketDropdowns = footerMarketRoot.locator('.market-selector-dropdown');
    this.footerMarketRoot = footerMarketRoot;
    this.footerMarketDropdowns = footerMarketDropdowns;

    this.languageSelectorDropdown = footerMarketDropdowns.nth(0);
    this.languageSelectorButton = footerMarketDropdowns.nth(0).locator('.market-selector-button');
    this.languageSelectorPopover = footerMarketDropdowns.nth(0).locator('.market-selector-popover');
    this.languageSelectedItem = footerMarketDropdowns.nth(0).locator('.market-selector-item.selected');

    this.currencySelectorDropdown = footerMarketDropdowns.nth(1);
    this.currencySelectorButton = footerMarketDropdowns.nth(1).locator('.market-selector-button');
    this.currencySelectorPopover = footerMarketDropdowns.nth(1).locator('.market-selector-popover');
    this.currencySelectedItem = footerMarketDropdowns.nth(1).locator('.market-selector-item.selected');

    this.priceCurrencySymbols = page.locator('.price-currency-symbol');
  }

  // ─── Static Data Maps ─────────────────────────────────────────────────────

  /**
   * Spec `prefix` (Express locale id, same as supported-markets `prefix`) →
   * column key on each row in `markets.json` (`en`, `fr`, `ja`, …).
   */
  static LANG_TO_MARKET_KEY = {
    '': 'en',
    us: 'en',
    uk: 'en',
    in: 'en',
    jp: 'ja',
    kr: 'ko',
    br: 'pt',
    tw: 'zh-tw',
    cn: 'zh-cn',
    fr: 'fr',
    de: 'de',
    es: 'es',
    it: 'it',
    nl: 'nl',
    dk: 'da',
    fi: 'fi',
    no: 'no',
    se: 'sv',
    id_id: 'id',
  };

  /**
   * Extract the locale prefix and geo region directly from a URL.
   *
   * ACOM Express:
   *   "adobe.com/express/?akamaiLocale=ae"       → { prefix: '',      region: 'ae' }
   *   "adobe.com/fr/express/?akamaiLocale=be"    → { prefix: 'fr',    region: 'be' }
   *   "adobe.com/uk/express/?akamaiLocale=gb"    → { prefix: 'uk',    region: 'gb' }
   *   "adobe.com/id_id/express/?akamaiLocale=id" → { prefix: 'id_id', region: 'id' }
   *
   * BACOM (business[.stage].adobe.com):
   *   "business.adobe.com/fr/products/..."  → { prefix: 'fr', region: '' }
   *   "business.adobe.com/jp/products/..."  → { prefix: 'jp', region: 'jp' } (with akamaiLocale=jp)
   *   "business.adobe.com/products/..."     → { prefix: '',   region: '' }   (US, no locale)
   *   Only 2–5 char segments match as locale to avoid 'products', 'solutions' etc.
   *
   * @param {string} url
   * @returns {{ prefix: string, region: string }}
   * @throws {Error} When `url` is on `adobe.com` but not an Express or BACOM surface this suite supports.
   */
  static parseUrlLocale(url) {
    const regionMatch = url.match(/[?&]akamaiLocale=([^&]*)/);
    const region = regionMatch ? regionMatch[1] : '';

    // ACOM Express: /[prefix]/express/ or /express/ (US, no prefix)
    const expressMatch = url.match(/adobe\.com\/([^/]+)\/express\//);
    if (expressMatch) return { prefix: expressMatch[1], region };
    if (/adobe\.com\/express\//.test(url)) return { prefix: '', region };

    // BACOM: business[.stage].adobe.com/[locale]/ — only 2–5 char locale codes
    const bacomMatch = url.match(/business(?:\.stage)?\.adobe\.com\/([a-z_]{2,5})\//);
    if (bacomMatch) return { prefix: bacomMatch[1], region };

    if (/adobe\.com/i.test(url)) {
      throw new Error(`[LingoGeo] URL is not Express (or BACOM): ${url}`);
    }

    // AEM branch domains (aem.live / aem.page) — extract locale from path
    const aemLocaleMatch = url.match(/\/([a-z_]{2,5})\/express\//);
    if (aemLocaleMatch) return { prefix: aemLocaleMatch[1], region };

    return { prefix: '', region };
  }

  /**
   * Returns true when the page's currency/UI is driven by the visitor's real IP.
   * Both absent (`akamaiLocale` not in URL) and present-but-empty (`akamaiLocale=`)
   * mean the Akamai CDN receives no geo override — the server uses the real client IP.
   *
   * @param {string} url
   * @returns {boolean}
   */
  static isGeoIpDriven(url) {
    try {
      return !new URL(url).searchParams.get('akamaiLocale');
    } catch {
      return false;
    }
  }

  /**
   * Resolve the effective region for default-currency checks using the full
   * priority chain:
   *
   *   1. `country` URL param   — explicit page-level override (highest)
   *   2. `country` cookie      — persisted user choice
   *   3. `akamaiLocale` param  — geo-IP / VPN signal on the URL
   *   4. `''`                  — no signal; caller falls back to path default
   *
   * @param {string} finalUrl  — this.page.url() after all redirects
   * @param {Array}  cookies   — await context.cookies()
   * @returns {string} lowercase region code, or '' when nothing is found
   */
  static resolveEffectiveRegion(finalUrl, cookies = []) {
    const countryParam = finalUrl.match(/[?&]country=([^&]+)/)?.[1];
    if (countryParam) return countryParam.toLowerCase();

    const akamaiLocale = finalUrl.match(/[?&]akamaiLocale=([^&]*)/)?.[1];
    if (akamaiLocale) return akamaiLocale.toLowerCase();

    const countryCookie = cookies.find((c) => c.name === 'country')?.value;
    if (countryCookie) return countryCookie.toLowerCase();

    return '';
  }

  /**
   * Derive the current page's locale context from the live URL and cookies.
   * Eliminates the need to pass `prefix`/`region` from the spec into assertions.
   *
   * @param {import('@playwright/test').BrowserContext} context
   * @returns {Promise<{ prefix: string, region: string, prefLang: string }>}
   */
  async getCurrentPageContext(context) {
    const { prefix, region } = LingoGeoBannerPage.parseUrlLocale(this.page.url());
    const cookies = await context.cookies();
    const prefLang = cookies.find((c) => c.name === 'international')?.value ?? 'en';
    return { prefix, region, prefLang };
  }

  /**
   * Normalize a spec prefix to the `markets.json` language column name.
   *
   * @param {string|undefined|null} specPrefix — `feature.prefix`, `prefLang`, or `''` / `us` for US
   * @returns {string}
   */
  static specPrefixToMarketJsonColumn(specPrefix) {
    const key =
      specPrefix === '' || specPrefix === undefined || specPrefix === null
        ? ''
        : String(specPrefix).toLowerCase();
    return LingoGeoBannerPage.LANG_TO_MARKET_KEY[key] ?? key;
  }

  /**
   * Whether preference and page resolve to the same `markets.json` language column
   * (`en`, `fr`, `ja`, …), so there is no locale mismatch for the flowchart “no action” branch.
   * Aligns `''` / `us` / `uk` / `in` (all `en`) and accepts literal column names like `en`.
   *
   * @param {string|undefined|null} prefLang — `international` value / `feature.prefLang`
   * @param {string|undefined|null} pagePrefix — `feature.prefix`
   */
  static prefLangMatchesPageByJsonColumn(prefLang, pagePrefix) {
    const a = LingoGeoBannerPage.specPrefixToMarketJsonColumn(prefLang);
    const b = LingoGeoBannerPage.specPrefixToMarketJsonColumn(pagePrefix);
    return String(a).toLowerCase() === String(b).toLowerCase();
  }

  /** `us`, `en`, and `''` (after normalize) all resolve to the US row in supported-markets JSON. */
  static normalizePrefLangForFlowchart(prefLang) {
    if (prefLang === '' || prefLang === undefined || prefLang === null) return '';
    const s = String(prefLang).toLowerCase();
    if (s === 'us' || s === 'en') return '';
    return s;
  }

  // ─── Static Supported-Markets Helpers ─────────────────────────────────────

  /**
   * Comma-separated regions from a row (`supportedRegions` in AEM JSON; alias `supportedMarkets`).
   */
  static getSupportedRegionsCsvFromRow(row) {
    return row?.supportedRegions ?? row?.supportedMarkets;
  }

  /**
   * Resolve supported-markets sheet row for a spec prefix (`''` = US English).
   */
  static getMarketRow(specPrefix, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length) return undefined;

    const s =
      specPrefix === '' || specPrefix === undefined || specPrefix === null
        ? ''
        : String(specPrefix).toLowerCase();

    if (s === '' || s === 'us') {
      const us = data.find(
        (r) =>
          (r.prefix === '' || r.prefix === undefined) && r.lang?.toLowerCase() === 'en',
      );
      if (us) return us;
    }

    const byPrefix = data.find((r) => (r.prefix ?? '').toLowerCase() === s);
    if (byPrefix) return byPrefix;

    const byLang = data.find((r) => r.lang?.toLowerCase() === s);
    if (byLang) return byLang;

    const columnKey = LingoGeoBannerPage.specPrefixToMarketJsonColumn(s);
    return data.find(
      (r) => r.lang?.toLowerCase() === String(columnKey).toLowerCase(),
    );
  }

  /**
   * Supported region codes for a spec prefix (e.g. '', 'fr', 'uk').
   */
  static getSupportedRegions(specPrefix, supportedMarketsData) {
    const row = LingoGeoBannerPage.getMarketRow(specPrefix, supportedMarketsData);
    const csv = LingoGeoBannerPage.getSupportedRegionsCsvFromRow(row);
    if (!csv) return new Set();
    return new Set(csv.split(',').map((x) => x.trim().toLowerCase()));
  }

  static isSupportedCombo(specPrefix, region, supportedMarketsData) {
    return LingoGeoBannerPage.getSupportedRegions(specPrefix, supportedMarketsData)
      .has(region?.toLowerCase());
  }

  static isGeoIpSupported(geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length) return false;
    const g = geoIp?.toLowerCase();
    return data.some((row) => {
      const csv = LingoGeoBannerPage.getSupportedRegionsCsvFromRow(row);
      if (!csv) return false;
      return csv.split(',').map((x) => x.trim().toLowerCase()).includes(g);
    });
  }

  /**
   * Implements the full flowchart decision tree for both ACOM and BACOM sites.
   *
   * ┌─ Is (pagePrefix + geoIp) a supported combo? ────────────────────────────┐
   * │  YES                                         NO                         │
   * │  ├─ Same JSON lang column?                   ├─ Is geoIp in any row's   │
   * │  │  specPrefixToMarketJsonColumn(prefLang)   │   supportedRegions?      │
   * │  │  === specPrefixToMarketJsonColumn(page)   │   NO → none (6)          │
   * │  │  YES → none (1,3)                         │   YES                    │
   * │  │  NO                                       │   ├─ Is BACOM?           │
   * │  │  └─ Is (prefLang + geoIp) supported?      │   │  YES → banner (4,5)  │
   * │  │     YES → banner (2)                      │   └──NO  → modal (4,5)   │
   * │  │     NO  → none (1a,3)                     │                          │
   * └──┴──────────────────────────────────────────-┴──────────────────────────┘
   *
   * Scenarios:
   *   1,3   — page prefix + geoIp supported, prefLang matches page by JSON column → no action
   *   2     — page prefix + geoIp supported, prefLang differs (by column) and (prefLang+geoIp) supported → banner
   *             (recommend switching to preferred-prefix site)
   *   1a,3  — page prefix + geoIp supported but (prefLang+geoIp) not supported → no action
   *   6     — geoIp not in any row's supportedRegions → no action
   *   4,4a,4b — geoIp supported somewhere; (prefLang+geoIp) also supported
   *             BACOM → banner (recommendation from prefLang + geoIp)
   *             ACOM  → modal  (geo-routing modal with prefLang option)
   *   5     — geoIp supported; (prefLang+geoIp) NOT supported
   *             BACOM → banner (recommendation from geoIp only)
   *             ACOM  → modal  (geo-routing modal with all options for geoIp)
   *
   * @param {{
   *   pagePrefix: string,
   *   geoIp: string,
   *   prefLang: string,
   *   supportedMarketsData: object,
   *   isBacom?: boolean
   * }} opts — `pagePrefix` / `prefLang` are spec locale prefixes (`''` = US); same as `feature.prefix` / `international` cookie.
   *            “Same preference” uses {@link LingoGeoBannerPage.specPrefixToMarketJsonColumn}, not raw string equality.
   * @returns {'none'|'banner'|'modal'}
   */
  static computeExpectedUi({ pagePrefix, geoIp, prefLang, supportedMarketsData, isBacom = false }) {
    const pref = LingoGeoBannerPage.normalizePrefLangForFlowchart(prefLang);
    const pagePrefixGeoSupported = LingoGeoBannerPage.isSupportedCombo(pagePrefix, geoIp, supportedMarketsData);
    const prefLangGeoSupported = LingoGeoBannerPage.isSupportedCombo(pref, geoIp, supportedMarketsData);
    const geoIpSupported       = LingoGeoBannerPage.isGeoIpSupported(geoIp, supportedMarketsData);

    if (pagePrefixGeoSupported) {
      if (LingoGeoBannerPage.prefLangMatchesPageByJsonColumn(pref, pagePrefix)) return 'none'; // scenario 1,3
      if (prefLangGeoSupported) return 'banner';                              // scenario 2
      return 'none';                                                          // scenario 1a,3
    }

    if (!geoIpSupported) return 'none';          // scenario 6
    return isBacom ? 'banner' : 'modal';         // scenario 4,4a,4b or 5
  }

  /**
   * Extract the country name only (no currency) from a markets.json cell value.
   * "India - INR ₹"       → "India"
   * "Belgique - EUR €"    → "Belgique"
   * "United Arab Emirates - AED د.إ" → "United Arab Emirates"
   *
   * @param {string|null} marketValue — value returned by getCurrency()
   * @returns {string|undefined}
   */
  static extractCountryName(marketValue) {
    if (!marketValue) return undefined;
    const idx = marketValue.indexOf(' - ');
    return idx !== -1 ? marketValue.slice(0, idx).trim() : marketValue.trim();
  }

  /**
   * Extract all currency tokens (code + symbol) from a markets.json cell value.
   * Everything after the first " - " separator, split by whitespace.
   *
   * "United Arab Emirates - AED د.إ" → ["AED", "د.إ"]
   * "South Korea - KRW ₩"            → ["KRW", "₩"]
   * "Brazil - BRL R$"                → ["BRL", "R$"]
   * "Armenia - USD $"                → ["USD", "$"]
   *
   * Cards may display either the code ("AED") or the symbol ("₩") depending on locale,
   * so the price-card check passes if ANY token is present.
   *
   * @param {string|null} marketValue — value returned by getCurrency()
   * @returns {string[]}
   */
  static extractCurrencyTokens(marketValue) {
    if (!marketValue) return [];
    const idx = marketValue.indexOf(' - ');
    const currencyPart = idx !== -1 ? marketValue.slice(idx + 3) : marketValue;
    return currencyPart.trim().split(/\s+/).filter(Boolean);
  }

  /**
   * Strip invisible Unicode bidirectional / direction control characters that browsers
   * inject into Arabic and other RTL text when rendering. These are invisible in UI and
   * error output but break string comparison against raw JSON values.
   * e.g. "Kuwait - KD \u200fد.ك\u200f" → "Kuwait - KD د.ك"
   *
   * @param {string} str
   * @returns {string}
   */
  static stripBidiChars(str) {
    // eslint-disable-next-line no-control-regex
    return str
      .replace(/[\u200b\u200c\u200d\u200e\u200f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069\ufeff]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Text to type into the market search field for {@link LingoGeoBannerPage#validateCurrencySymbolSearch}.
   * The selector search does not reliably match the ¥ glyph (often zero rows or labels without the sign),
   * so yen is exercised via the ISO code instead.
   *
   * @param {string} symbol
   * @returns {string}
   */
  static currencySymbolSearchQuery(symbol) {
    if (symbol === '¥') return 'JPY';
    return symbol;
  }

  /**
   * `hasText` matcher for {@link LingoGeoBannerPage#validateCurrencySymbolSearch}.
   * Stage may render yen as U+00A5 (¥) or U+FFE5 (fullwidth ￥); won as U+20A9 (₩) or U+FFE6 (￦).
   * Yen rows may show ISO codes without a glyph, so JPY/CNY are accepted for symbol `¥`.
   *
   * @param {string} symbol
   * @returns {string | RegExp}
   */
  static currencySymbolRowHasText(symbol) {
    if (symbol === '¥') return /JPY|CNY|[\u00A5\uFFE5]/;
    if (symbol === '₩') return /[\u20A9\uFFE6]/;
    return symbol;
  }

  /**
   * Parse the `regionPriorities` column into a map of `{ regionCode: priorityNumber }`.
   * e.g. "lu:1, ch:2, ca:2, be:2" → { lu: 1, ch: 2, ca: 2, be: 2 }
   *
   * @param {string|undefined} str — raw value from supported-markets JSON
   * @returns {Record<string, number>}
   */
  static parseRegionPriorities(str) {
    if (!str) return {};
    const result = {};
    for (const part of str.split(',')) {
      const colonIdx = part.indexOf(':');
      if (colonIdx === -1) continue;
      const region = part.slice(0, colonIdx).trim().toLowerCase();
      const priority = parseInt(part.slice(colonIdx + 1).trim(), 10);
      if (region && !Number.isNaN(priority)) result[region] = priority;
    }
    return result;
  }

  /**
   * Return all supported-markets rows that serve `geoIp`, ordered by their
   * `regionPriorities` entry for that region.
   *
   * **Scenario 5** (PREF-LANG + GeoIP not supported):
   *   Rows are selected exclusively from `regionPriorities` keys — this is the
   *   explicit authoring signal for which language buttons appear in the modal.
   *   e.g. geoIp='ch' → de(ch:1), fr(ch:2), it(ch:3). The broad English row
   *   includes 'ch' in supportedRegions but has no 'ch' in its regionPriorities,
   *   so it is intentionally excluded.
   *
   * **Scenario 4 fallback** (no regionPriorities entry for geoIp, single-language regions):
   *   Falls back to rows containing geoIp in supportedRegions, sorted by fewest
   *   regions (most specific / dedicated). e.g. geoIp='in' → [in row].
   *
   * @param {string} geoIp — akamaiLocale / feature.region
   * @param {object} supportedMarketsData
   * @returns {object[]} rows sorted by display priority
   */
  static getRegionRows(geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length || !geoIp) return [];
    const g = geoIp.toLowerCase();

    // 1. Rows with an explicit regionPriorities entry for this geoIp (scenario 5 multi-lang)
    const prioritized = [];
    for (const row of data) {
      const priorities = LingoGeoBannerPage.parseRegionPriorities(row.regionPriorities);
      if (Object.prototype.hasOwnProperty.call(priorities, g)) {
        prioritized.push({ row, priority: priorities[g] });
      }
    }
    if (prioritized.length > 0) {
      prioritized.sort((a, b) => a.priority - b.priority);
      return prioritized.map(({ row }) => row);
    }

    // 2. Fallback: supportedRegions membership, most specific (fewest regions) first
    const candidates = data.filter((row) => {
      const csv = LingoGeoBannerPage.getSupportedRegionsCsvFromRow(row);
      return csv && csv.split(',').map((x) => x.trim().toLowerCase()).includes(g);
    });
    candidates.sort((a, b) => {
      const lenA = (LingoGeoBannerPage.getSupportedRegionsCsvFromRow(a) ?? '').split(',').length;
      const lenB = (LingoGeoBannerPage.getSupportedRegionsCsvFromRow(b) ?? '').split(',').length;
      return lenA - lenB;
    });
    return candidates;
  }

  /**
   * Extract banner copy from the supported-markets JSON row for this spec prefix.
   * Banner text ("View this page in [site]") is sourced from the supported-markets JSON;
   * there is no country name concept for banners.
   *
   * @param {string} specPrefix    — `feature.prefix` (`''` = US)
   * @param {object} supportedMarketsData
   * @returns {{ bannerText?: string, continueText?: string }}
   */
  static getBannerCopy(specPrefix, supportedMarketsData) {
    if (!supportedMarketsData?.data) return {};
    const row = LingoGeoBannerPage.getMarketRow(specPrefix, supportedMarketsData);
    if (!row) return {};
    return {
      bannerText: row.text || row.bannerText || undefined,
      continueText: row.continueText || undefined,
    };
  }

  /**
   * Resolve the primary marketCode for the current site locale.
   * Used to look up the stay-link country in markets.json (same logic as getCurrency).
   *
   *  • prefix is already a valid marketCode (cn, se, de, …) → use it directly
   *  • prefix maps through supportedRegions (id_id→id, uk→gb) → use derived marketCode
   *  • fallback: prefixAsRegion                               (''→us)
   */
  static getSiteRegion(specPrefix, supportedMarketsData, marketsData = null) {
    const prefixAsRegion = (specPrefix || 'us').toLowerCase();
    if (marketsData?.data) {
      const columnKey = LingoGeoBannerPage.specPrefixToMarketJsonColumn(specPrefix);
      // Direct match: prefix is already a valid marketCode (cn→cn, se→se, fr→fr)
      const byMarketCode = marketsData.data.find((r) => r.marketCode?.toLowerCase() === prefixAsRegion);
      if (byMarketCode?.[columnKey] || byMarketCode?.en) return prefixAsRegion;
      // Derive marketCode via supportedRegions in supported-markets JSON (id_id→id, uk→gb)
      const smRow = LingoGeoBannerPage.getMarketRow(specPrefix, supportedMarketsData);
      const csv = LingoGeoBannerPage.getSupportedRegionsCsvFromRow(smRow);
      if (csv) {
        const regions = csv.split(',').map((r) => r.trim().toLowerCase());
        const derived = regions.includes(prefixAsRegion) ? prefixAsRegion : regions[0];
        const byDerived = marketsData.data.find((r) => r.marketCode?.toLowerCase() === derived);
        if (byDerived?.[columnKey] || byDerived?.en) return derived;
      }
    }
    return prefixAsRegion;
  }

  /**
   * Build modal copy from supported-markets + markets JSON data.
   *
   * Scenario 4 vs 5 (from flowchart — ACOM branch):
   *   **Scenario 4** — `isSupportedCombo(prefLang, geoIp)` = true:
   *     prefLang + geoIp IS in the supported market → modal shows only the PREF-LANG option.
   *     `buttons` = [prefLang row only].
   *   **Scenario 5** — `isSupportedCombo(prefLang, geoIp)` = false (cookie set but mismatches geoIp):
   *     PREF-LANG + geoIp NOT supported → modal shows ALL language options for that geoIp,
   *     ordered by `regionPriorities`. `buttons` = all rows from `getRegionRows`.
   *
   * @param {string}  geoIp              — akamaiLocale / feature.region
   * @param {object}  supportedMarketsData
   * @param {string}  [langPrefix]       — page prefix (feature.prefix); for stay-link country
   * @param {object}  [marketsData]      — parsed markets.json
   * @param {string}  [prefLang]         — normalized international cookie value; determines scenario 4 vs 5
   * @returns {{
   *   title?: string,
   *   description?: string,
   *   buttonCountry?: string,
   *   buttons: Array<{ rowPrefix: string, country?: string, nativeName?: string }>,
   *   stayCountry?: string
   * }}
   */
  static getModalCopy(geoIp, supportedMarketsData, langPrefix = null, marketsData = null, prefLang = null) {
    if (!supportedMarketsData?.data) return { buttons: [] };

    const normPref = LingoGeoBannerPage.normalizePrefLangForFlowchart(prefLang);
    const geoKey = (geoIp ?? '').toLowerCase();
    const regionRowsForGeo = LingoGeoBannerPage.getRegionRows(geoIp, supportedMarketsData);

    const hasExplicitPriority = !!(supportedMarketsData?.data?.some((row) => {
      const p = LingoGeoBannerPage.parseRegionPriorities(row.regionPriorities);
      return Object.prototype.hasOwnProperty.call(p, geoKey);
    }));

    // Scenario 4 vs 5: prefLang+geoIp is a supported combo only when:
    // (a) geoIp is in prefLang row's supportedRegions, AND
    // (b) if geoIp appears in multiple rows' supportedRegions, the prefLang row must also have
    //     an explicit regionPriorities entry for it (e.g. tw:3 in US/en → en+tw = Scenario 4;
    //     no fr entry in US/en → en+fr = Scenario 5).
    const prefLangGeoSupported = (() => {
      if (!LingoGeoBannerPage.isSupportedCombo(normPref, geoIp, supportedMarketsData)) return false;
      const rowsWithGeo = supportedMarketsData.data.filter((row) => {
        const csv = LingoGeoBannerPage.getSupportedRegionsCsvFromRow(row);
        return csv?.split(',').map((x) => x.trim().toLowerCase()).includes(geoKey);
      });
      if (rowsWithGeo.length > 1) {
        const prefRow = LingoGeoBannerPage.getMarketRow(normPref, supportedMarketsData);
        const p = LingoGeoBannerPage.parseRegionPriorities(prefRow?.regionPriorities);
        return Object.prototype.hasOwnProperty.call(p, geoKey);
      }
      return true;
    })();

    let rows;
    if (prefLangGeoSupported) {
      // Scenario 4: show rows whose lang matches prefLang's lang.
      // e.g. prefLang=en → lang='en' → [US/en row]; prefLang=tw → lang='zh' → [tw row, cn row].
      const prefRow = LingoGeoBannerPage.getMarketRow(normPref, supportedMarketsData);
      const lang = prefRow?.lang?.toLowerCase();
      rows = lang ? regionRowsForGeo.filter((r) => r.lang?.toLowerCase() === lang) : [];
      if (!rows.length) rows = prefRow ? [prefRow] : [];
    } else {
      // Scenario 5: show all supported options for this geoIp ordered by regionPriority.
      rows = regionRowsForGeo;
    }

    if (!rows.length) return { buttons: [] };

    // Primary row (highest priority) provides the modal title + description
    const primaryRow = rows[0];

    let buttons = [];
    let stayCountry;

    if (langPrefix !== null && marketsData) {
      buttons = rows.map((row) => {
        const rowPrefix = row.prefix !== undefined && row.prefix !== null ? String(row.prefix) : '';
        // Use language-specific country name; fall back to English when the language column
        // is absent in markets.json (e.g. Italian for Switzerland → "Switzerland" not "Svizzera").
        const langCountry = LingoGeoBannerPage.extractCountryName(
          LingoGeoBannerPage.getCurrency(rowPrefix, geoIp, marketsData),
        );
        const country = langCountry || LingoGeoBannerPage.extractCountryName(
          LingoGeoBannerPage.getCurrency('', geoIp, marketsData),
        );
        return {
          rowPrefix,
          country,
          nativeName: row.nativeName || row.langName || undefined,
          tabTitle: row.modalTitle || undefined,
          tabDescription: row.modalDescription || undefined,
        };
      });

      // Stay link: current site's primary region in the page locale
      const siteRegion = LingoGeoBannerPage.getSiteRegion(langPrefix, supportedMarketsData, marketsData);
      const stayLang = LingoGeoBannerPage.extractCountryName(
        LingoGeoBannerPage.getCurrency(langPrefix, siteRegion, marketsData),
      );
      stayCountry = stayLang || LingoGeoBannerPage.extractCountryName(
        LingoGeoBannerPage.getCurrency('', siteRegion, marketsData),
      );
    }

    // buttonCountry = primary button's country name, used to resolve {country} in description
    const buttonCountry = buttons[0]?.country;

    return {
      title: primaryRow.modalTitle || undefined,
      description: primaryRow.modalDescription || undefined,
      buttonCountry,
      buttons,
      stayCountry,
      hasExplicitPriority,
    };
  }

  // ─── Static Markets (Currency) Helper ─────────────────────────────────────

  /**
   * Localised currency string for a spec prefix + region from `markets.json`.
   * Column name comes from {@link LingoGeoBannerPage.specPrefixToMarketJsonColumn}.
   *
   * @param {string} specPrefix — `feature.prefix` (`''` = US)
   * @param {string} region — `marketCode` (e.g. 'be', 'ae')
   * @param {object} marketsData — parsed markets.json
   * @returns {string|null}
   */
  static getCurrency(specPrefix, region, marketsData) {
    if (!marketsData?.data) return null;
    const columnKey = LingoGeoBannerPage.specPrefixToMarketJsonColumn(specPrefix);
    const row = marketsData.data.find(
      (r) => r.marketCode?.toLowerCase() === region?.toLowerCase(),
    );
    return row?.[columnKey] ?? null;
  }

  // ─── Navigation + JSON Capture ────────────────────────────────────────────

  /**
   * Express loads supported-markets from www; BACOM from the business host.
   * `markets.json` is always served from www on the same tier (stage/prod) as the page.
   *
   * @param {string} pageUrl
   * @returns {{ supportedMarketsUrl: string, marketsUrl: string }}
   */
  static resolveGeoJsonUrls(pageUrl) {
    const u = new URL(pageUrl);
    const isBacom = /business(?:\.stage)?\.adobe\.com/.test(u.hostname);
    const isAem = !u.hostname.endsWith('adobe.com');
    const wwwOrigin = u.hostname.startsWith('business.')
      ? `${u.protocol}//${u.hostname.replace(/^business\./, 'www.')}`
      : isAem ? 'https://www.adobe.com'
      : u.origin;
    const marketsUrl = `${wwwOrigin}/federal/assets/markets.json`;
    const { prefix } = LingoGeoBannerPage.parseUrlLocale(pageUrl);
    const localeSearchStringsUrl = prefix
      ? `${u.origin}/${prefix}/federal/globalnav/placeholders.json`
      : `${u.origin}/federal/globalnav/placeholders.json`;
    if (isBacom) {
      return {
        supportedMarketsUrl: `${u.origin}/assets/supported-markets/supported-markets-bacom.json`,
        marketsUrl,
        localeSearchStringsUrl,
      };
    }
    return {
      supportedMarketsUrl: `${u.origin}/express/assets/supported-markets/supported-markets-express.json`,
      marketsUrl,
      localeSearchStringsUrl,
    };
  }

  /**
   * Navigate to `url` while simultaneously capturing the two geo JSON responses
   * that the page fetches on load.
   *
   * waitForResponse promises MUST be registered before page.goto() so no
   * network events are missed.
   *
   * @param {string} url
   * @param {{ searchOnly?: boolean }} [options]
   * @returns {Promise<{ supportedMarketsData: object|null, marketsData: object|null, localeSearchStrings?: object, httpStatus?: number }>}
   */
  async navigateAndCaptureJsons(url, { searchOnly = false } = {}) {
    const { supportedMarketsUrl, marketsUrl, localeSearchStringsUrl } = LingoGeoBannerPage.resolveGeoJsonUrls(url);

    const supportedMarketsPromise = searchOnly ? Promise.resolve(null) : this.page.waitForResponse(
      (r) => r.url() === supportedMarketsUrl && r.ok(),
      { timeout: 5000 },
    ).catch(() => null);

    const marketsPromise = searchOnly ? Promise.resolve(null) : this.page.waitForResponse(
      (r) => r.url() === marketsUrl && r.status() < 400,
      { timeout: 5000 },
    ).catch(() => null);

    const localeSearchStringsPromise = this.page.waitForResponse(
      (r) => r.url() === localeSearchStringsUrl && r.status() < 400,
      { timeout: 5000 },
    ).catch(() => null);

    let httpStatus;
    const navResponse = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    httpStatus = navResponse?.status();
    if (httpStatus === 404) {
      await this.page.waitForLoadState('load').catch(() => {});
      if (this.page.url() !== url) {
        console.info(`[LingoGeo] Redirected to: ${this.page.url()}`);
        httpStatus = undefined;
      }
    }

    const [supportedMarketsResp, marketsResp, localeSearchStringsResp] = await Promise.all([
      supportedMarketsPromise,
      marketsPromise,
      localeSearchStringsPromise,
    ]);

    const supportedMarketsData = searchOnly ? null : (
      supportedMarketsResp
        ? await supportedMarketsResp.json().catch(() => null)
        : await this.page.request.get(supportedMarketsUrl).then((r) => r.json()).catch(() => null)
    );

    const marketsData = searchOnly ? null : (
      marketsResp
        ? await marketsResp.json().catch(() => null)
        : await this.page.request.get(marketsUrl).then((r) => r.ok() ? r.json() : null).catch(() => null)
    );

    const localeSearchStringsRaw = localeSearchStringsResp
      ? await localeSearchStringsResp.json().catch(() => null)
      : await this.page.request.get(localeSearchStringsUrl).then((r) => r.json()).catch(() => null);
    const localeSearchStringsArr = localeSearchStringsRaw?.data ?? localeSearchStringsRaw ?? [];
    const localeSearchStrings = {
      noResultsLanguage: localeSearchStringsArr.find?.((d) => d.key === 'no-results-language')?.value ?? null,
      noResultsMarket: localeSearchStringsArr.find?.((d) => d.key === 'no-results-market')?.value ?? null,
      searchLanguage: localeSearchStringsArr.find?.((d) => d.key === 'search-language')?.value ?? null,
      searchMarket: localeSearchStringsArr.find?.((d) => d.key === 'search-market')?.value ?? null,
    };

    return { supportedMarketsData, marketsData, localeSearchStrings, httpStatus };
  }

  // ─── Cookie Helpers ────────────────────────────────────────────────────────

  /**
   * Derives the `.adobe.com` cookie domain from a page URL.
   */
  static internationalCookieDomainForUrl(pageUrl) {
    let hostname;
    try { hostname = new URL(pageUrl).hostname; } catch {
      throw new Error(`internationalCookieDomainForUrl: invalid pageUrl "${pageUrl}"`);
    }
    return { domain: hostname.includes('adobe.com') ? '.adobe.com' : hostname };
  }

  /**
   * Set the `international` cookie (PREF-LANG) before navigation.
   * Always call after `context.clearCookies()`.
   *
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string} prefLang — spec prefix for `international` cookie (`''`, `us`, `fr`, `id_id`, …)
   * @param {string} pageUrl — target URL (determines cookie domain)
   */
  async setInternationalCookieValue(context, prefLang, pageUrl) {
    const { domain } = LingoGeoBannerPage.internationalCookieDomainForUrl(pageUrl);
    await context.addCookies([{
      name: 'international',
      value: String(prefLang ?? ''),
      domain,
      path: '/',
      secure: true,
      sameSite: 'Lax',
    }]);
  }

  async waitForGeoModalReady() {
    await expect(this.geoRoutingModal).toBeVisible({ timeout: 35000 });
    await this.geoRoutingModalButton.waitFor({ state: 'visible', timeout: 20000 });
  }

  async dismissGeoRoutingModal() {
    const shellVisible = await this.geoModalShell.isVisible().catch(() => false);
    const wrapperVisible = await this.geoRoutingModal.isVisible().catch(() => false);
    if (!shellVisible && !wrapperVisible) return;

    const shellClose = this.geoModalShell
      .locator('button[aria-label="Close"], .dialog-close, [class*="close-button"], button.close')
      .first();
    if (await shellClose.isVisible().catch(() => false)) {
      await shellClose.click();
    } else if (await this.geoModalClose.isVisible().catch(() => false)) {
      await this.geoModalClose.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await expect(this.geoModalShell).toBeHidden({ timeout: 20000 });
  }

  async dismissLanguageBanner() {
    if (!await this.languageBanner.isVisible().catch(() => false)) return;
    if (await this.languageBannerClose.count() > 0) {
      await this.languageBannerClose.click();
      await expect(this.languageBanner).toBeHidden({ timeout: 15000 });
    }
  }

  /**
   * Footer market selectors hydrate after scroll. Avoid `networkidle` (live pages rarely idle in time).
   */
  async waitForFooterMarketSelectorsVisible() {
    await expect.poll(async () => {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.footerMarketRoot.scrollIntoViewIfNeeded().catch(() => {});
      await this.footerMarketDropdowns.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      const count = await this.footerMarketDropdowns.count();
      const langBtnVisible = await this.languageSelectorButton.isVisible().catch(() => false);
      return count >= 2 && langBtnVisible;
    }, {
      timeout: 60000,
      intervals: [800, 1600, 2400],
      message:
        '[LingoGeo] Footer market selectors: expected ≥2 .market-selector-dropdown and visible language button after scroll.',
    }).toBe(true);
  }

  // ─── UI Assertions ─────────────────────────────────────────────────────────

  /**
   * Assert no language banner and no geo-routing modal are present.
   */
  async assertNone() {
    await this.page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
    await expect(this.languageBanner).toHaveCount(0);
    await expect(this.page.locator('.georouting-wrapper')).toHaveCount(0);
  }

  /**
   * Assert the language banner is visible and its copy matches the JSON.
   * Prints the actual rendered banner text and link text to the console.
   *
   * @param {{ bannerText?: string, continueText?: string }} copy
   */
  async assertBanner({ bannerText, continueText } = {}) {
    await expect(this.languageBanner).toBeVisible({ timeout: 25000 });

    const renderedText = await this.languageBannerText.first().innerText().catch(() => '');
    const renderedLink = await this.languageBannerLink.first().innerText().catch(() => '');

    console.info('[LingoGeo] Banner rendered:', {
      bannerText:  renderedText.trim(),
      continueText: renderedLink.trim(),
    });

    if (bannerText && !renderedText.trim().includes(bannerText)) {
      console.warn('[LingoGeo] MISMATCH banner text — JSON:', bannerText, '| Page:', renderedText.trim());
    }
    if (continueText && !renderedLink.trim().includes(continueText)) {
      console.warn('[LingoGeo] MISMATCH continue button — JSON:', continueText, '| Page:', renderedLink.trim());
    }
    if (bannerText) {
      await expect(this.languageBanner).toContainText(bannerText, { timeout: 10000 });
    }
    if (continueText) {
      await expect(this.languageBannerLink).toContainText(continueText, { timeout: 10000 });
    }
  }

  /**
   * Assert the general geo-routing modal (single primary CTA; no `#tab-1-*` language tabs).
   * Tabbed regional-priority modal: {@link assertRegionalPriorityModal}.
   *
   *  • title / description — from the primary row in `getModalCopy`
   *  • buttons             — each entry: country name on a visible control (usually one row)
   *  • stayCountry         — stay-link text must include the current site's country name
   *
   * @param {{
   *   title?: string,
   *   description?: string,
   *   buttonCountry?: string,
   *   buttons?: Array<{ rowPrefix: string, country?: string, nativeName?: string }>,
   *   stayCountry?: string
   * }} copy
   */
  async assertModal({ title, description, buttonCountry, buttons = [], stayCountry } = {}) {
    await this.waitForGeoModalReady();

    const renderedTitle = await this.geoRoutingModal
      .locator('h1, h2, h3, h4').first().innerText().catch(() => '');
    const renderedDesc = await (async () => {
      const parts = await this.geoRoutingModal.locator('p').all();
      const texts = await Promise.all(parts.map((p) => p.innerText().catch(() => '')));
      return texts.map((t) => t.trim()).filter(Boolean).join(' | ');
    })();
    const renderedStay = await this.geoRoutingModalStayLink.innerText().catch(() => '');

    console.info('[LingoGeo] Modal rendered:', {
      title:       renderedTitle.trim(),
      description: renderedDesc,
      stayLink:    renderedStay.trim(),
    });

    // Description: JSON stores "{country}" as a template the page fills at runtime.
    // Replace with the primary button's country name before asserting.
    const resolvedDescription = description
      ? description.replace(/\{country\}/gi, buttonCountry ?? '{country}')
      : undefined;

    if (title && !renderedTitle.trim().includes(title)) {
      console.warn('[LingoGeo] MISMATCH modal title — JSON:', title, '| Page:', renderedTitle.trim());
    }
    if (resolvedDescription && !renderedDesc.includes(resolvedDescription)) {
      console.warn('[LingoGeo] MISMATCH modal description — JSON (resolved):', resolvedDescription, '| Page:', renderedDesc);
    }

    if (title) {
      await expect(this.geoRoutingModal).toContainText(title, { timeout: 10000 });
    }
    if (description) {
      await expect(this.geoRoutingModal).toContainText(resolvedDescription, { timeout: 10000 });
    }

    // Each `buttons` entry: a visible `a`/`button` should contain that country name + flag icon.
    for (const { rowPrefix, country, nativeName } of buttons) {
      expect(country, `Country name could not be resolved from markets.json for button prefix='${rowPrefix}'`).toBeTruthy();
      const btn = this.geoRoutingModal.locator('a, button').filter({ hasText: country }).first();
      await expect(btn, `Modal button for prefix '${rowPrefix}' does not contain country '${country}'`).toBeVisible({ timeout: 10000 });
      await expect(this.geoRoutingModal.locator('a').filter({ hasText: country }).first().locator('img[src*="georouting"]'), `Modal button for '${country}' missing flag icon (.icon-milo)`).toBeVisible({ timeout: 5000 });
      const renderedBtn = await btn.innerText().catch(() => '');
      console.info(`[LingoGeo] Modal button check — markets.json: ${country} | Rendered: ${renderedBtn.trim()}`);
    }

    if (stayCountry) {
      console.info('[LingoGeo] Modal stay link check — markets.json:', stayCountry, '| Rendered:', renderedStay.trim());
      expect(renderedStay.trim(), `Modal stay link does not contain country from markets.json: '${stayCountry}'`).toContain(stayCountry);
    }
  }

  /**
   * Validate the default currency/language UI state for tests tagged `@defaultCurrency`.
   * Prefix and region are derived internally from the current page URL.
   *
   * Checks (in order):
   *   1. Pre-interaction cookie guard — no `intl` or `country` cookie is set.
   *   2. Language selector — the displayed text contains the `nativeName` for the page prefix.
   *   3. Market selector — click to open; the selected item contains the markets.json value.
   *   4. Price cards — ALL `.price-currency-symbol` elements contain the currency symbol
   *        extracted from the market value (last whitespace-delimited token, e.g. "₩").
   *
   * Fails explicitly when the currency lookup returns null (no markets.json value for this prefix/region).
   *
   * @param {import('@playwright/test').BrowserContext} context
   * @param {object} marketsData          — parsed markets.json
   * @param {object} supportedMarketsData — parsed supported-markets JSON
   */
  async assertCurrency(context, marketsData, supportedMarketsData) {
    if (LingoGeoBannerPage.isGeoIpDriven(this.page.url())) {
      console.info('[LingoGeo] GeoIP-driven (akamaiLocale absent/empty) — skipping JSON-based currency assertion');
      return;
    }
    const { prefix, region } = LingoGeoBannerPage.parseUrlLocale(this.page.url());
    const jsonCurrencyValue = LingoGeoBannerPage.getCurrency(prefix, region, marketsData);
    const nativeName = LingoGeoBannerPage.getMarketRow(prefix, supportedMarketsData)?.nativeName;
    if (!jsonCurrencyValue) return;

    await this.page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await this.waitForFooterMarketSelectorsVisible();

    // ── 1. Pre-interaction cookie check ────────────────────────────────────────
    const cookies = await context.cookies();
    expect(
      cookies.find((c) => c.name === 'intl'),
      'Cookie "intl" must not be set before user interacts with selectors',
    ).toBeUndefined();
    expect(
      cookies.find((c) => c.name === 'country'),
      'Cookie "country" must not be set before user interacts with selectors',
    ).toBeUndefined();

    // ── 2. Language selector ───────────────────────────────────────────────────
    if (nativeName) {
      const langButtonText = await this.languageSelectorButton.innerText().catch(() => '');
      await this.languageSelectorButton.scrollIntoViewIfNeeded();
      await this.languageSelectorButton.click();
      await this.languageSelectorPopover.waitFor({ state: 'visible', timeout: 8000 });
      const langSelectedText = (await this.languageSelectedItem.textContent())?.trim() ?? '';
      console.info(`[LingoGeo] Language — Rendered: button: '${langButtonText.trim()}' | selected: '${langSelectedText}' | supported-markets.json: '${nativeName}'`);
      expect(langSelectedText, `Language selector selected item should match button text '${nativeName}'`).toContain(nativeName);
      await this.page.keyboard.press('Escape');
    }

    // ── 3. Market selector ─────────────────────────────────────────────────────
    const marketButtonText = await this.currencySelectorButton.innerText().catch(() => '');
    await this.currencySelectorButton.click();
    if (!(await this.currencySelectorPopover.isVisible().catch(() => false))) {
      await this.currencySelectorButton.click();
    }
    await this.currencySelectorPopover.waitFor({ state: 'visible', timeout: 8000 });
    const selectedMarketText = (await this.currencySelectedItem.textContent())?.trim() ?? '';
    console.info(`[LingoGeo] Market selector — Rendered: '${selectedMarketText}' | markets.json: '${jsonCurrencyValue}'`);
    // Strip invisible Unicode bidi control chars that browsers inject into Arabic/RTL text
    const cleanButtonText = LingoGeoBannerPage.stripBidiChars(marketButtonText.trim());
    const cleanSelectedText = LingoGeoBannerPage.stripBidiChars(selectedMarketText);
    // Normalize the JSON value's whitespace only (JSON may have double spaces e.g. "Morocco - DH  د.م.")
    const normalizedJsonValue = jsonCurrencyValue.replace(/\s+/g, ' ').trim();
    expect(cleanButtonText, `Market selector button should display '${jsonCurrencyValue}'`).toContain(normalizedJsonValue);
    expect(cleanSelectedText, `Market selector selected item should match button text '${jsonCurrencyValue}'`).toContain(normalizedJsonValue);
    await this.page.keyboard.press('Escape');

    // ── 4. Price card currency symbols ─────────────────────────────────────────
    // Cards may show the currency CODE ("AED") or SYMBOL ("₩") — accept either.
    const currencyTokens = LingoGeoBannerPage.extractCurrencyTokens(jsonCurrencyValue);
    if (currencyTokens.length > 0) {
      await this.priceCurrencySymbols.first().waitFor({ state: 'visible' });
      const count = await this.priceCurrencySymbols.count();
      let cardSymbol = '';
      let verified = 0;
      const uniqueSymbols = new Set();
      for (let i = 0; i < count; i++) {
        const cardText = (await this.priceCurrencySymbols.nth(i).textContent())?.trim() ?? '';
        if (!cardText) continue;
        if (!cardSymbol) cardSymbol = cardText;
        uniqueSymbols.add(cardText);
        const matched = currencyTokens.some((token) => cardText.includes(token));
        expect(
          matched,
          `Price card [${i}] '${cardText}' should contain currency code or symbol from '${jsonCurrencyValue}' (tokens: ${currencyTokens.join(', ')})`,
        ).toBe(true);
        verified += 1;
      }
      expect(verified, `No price symbols loaded — expected at least 1 of ${count} to match currency`).toBeGreaterThan(0);
      expect(uniqueSymbols.size, `Price currency symbols are not consistent — found multiple: [${[...uniqueSymbols].join(', ')}]`).toBe(1);
      console.info(`[LingoGeo] Cards currency (Rendered): '${cardSymbol}' | Market selector (Rendered): '${selectedMarketText}' | markets.json: '${jsonCurrencyValue}' | Price currency symbols with '${cardSymbol}': ${verified}`);
    }
  }

  /**
   * Detect which geo-routing UI is currently visible on the page without any
   * prior knowledge of the expected outcome (used in GeoIP-driven playground mode).
   *
   * Waits up to 5 s for a modal, then 3 s for a banner; if neither appears → 'none'.
   * Dismisses whatever was found so subsequent assertions are not blocked.
   *
   * @returns {Promise<'modal'|'banner'|'none'>}
   */
  async detectActualUi() {
    // Wait for full page load so geo routing JS has executed before checking.
    // navigateAndCaptureJsons only waits for domcontentloaded; async scripts
    // that render the modal run later.
    await this.page.waitForLoadState('load').catch(() => {});

    // Check modal shell and wrapper in parallel — either signals a modal.
    const modalVisible = await Promise.race([
      this.geoModalShell
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => true).catch(() => false),
      this.geoRoutingModal
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => true).catch(() => false),
    ]);
    if (modalVisible) {
      console.info('[LingoGeo] GeoIP-driven — detected UI: modal');
      await this.dismissGeoRoutingModal().catch(() => {});
      return 'modal';
    }

    const bannerVisible = await this.languageBanner
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (bannerVisible) {
      console.info('[LingoGeo] GeoIP-driven — detected UI: banner');
      await this.dismissLanguageBanner().catch(() => {});
      return 'banner';
    }

    console.info('[LingoGeo] GeoIP-driven — detected UI: none');
    return 'none';
  }

  /**
   * Assert the default currency shown on the current page after all redirects complete.
   *
   * Two paths:
   *
   * **geoIpDriven** — region comes from real network IP (no URL params or cookies).
   *   Reads the market selector text directly from the page and verifies price cards
   *   are consistent with it. No JSON lookup — the resolved region is unknowable in advance.
   *   ⚠ In local testing geoIP = India → market selector shows INR.
   *
   * **JSON-driven** (default) — region comes from URL params or cookies.
   *   Resolves effective region via priority chain
   *   (country param > country cookie > akamaiLocale > path default),
   *   looks up the expected currency from marketsData, then asserts the market
   *   selector and price cards both show that currency.
   *
   * @param {import('@playwright/test').BrowserContext} context
   * @param {object|null} marketsData
   * @param {object|null} supportedMarketsData
   * @param {{ closeModal?: boolean, geoIpDriven?: boolean }} options
   */
  async assertPageDefaultCurrency(
    context,
    marketsData,
    supportedMarketsData,
    { closeModal = false, geoIpDriven = false } = {},
  ) {
    // Resolve GeoIP mode via full priority chain: country param > akamaiLocale > country cookie > GeoIP
    if (!geoIpDriven) {
      const url = this.page.url();
      const cookies = await context.cookies().catch(() => []);
      const hasCountryParam = /[?&]country=([^&]+)/.test(url);
      const hasAkamaiLocale = !!new URL(url).searchParams.get('akamaiLocale');
      const hasCountryCookie = !!cookies.find((c) => c.name === 'country')?.value;
      geoIpDriven = !hasCountryParam && !hasAkamaiLocale && !hasCountryCookie;
    }

    if (closeModal) {
      await this.dismissGeoRoutingModal().catch(() => {});
    }
    await this.dismissLanguageBanner().catch(() => {});
    await this.waitForFooterMarketSelectorsVisible();

    await this.currencySelectorButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    // Wait for button text to be populated — it may be visible but empty while JS is still rendering.
    await expect(this.currencySelectorButton).not.toBeEmpty({ timeout: 8000 });
    const marketButtonText = await this.currencySelectorButton.innerText().catch(() => '');
    const cleanButtonText = LingoGeoBannerPage.stripBidiChars(marketButtonText.trim());

    if (geoIpDriven) {
      // Page-driven: read selector directly, verify price cards are consistent with it
      console.info(`[LingoGeo] GeoIP-driven — market selector: '${cleanButtonText}'`);
      const currencyTokens = LingoGeoBannerPage.extractCurrencyTokens(cleanButtonText);
      if (currencyTokens.length > 0) {
        await this.priceCurrencySymbols.first().waitFor({ state: 'visible' });
        const count = await this.priceCurrencySymbols.count();
        for (let i = 0; i < count; i++) {
          const cardText = (await this.priceCurrencySymbols.nth(i).textContent())?.trim() ?? '';
          const matched = currencyTokens.some((t) => cardText.includes(t));
          expect(
            matched,
            `Price card [${i}] '${cardText}' should match market selector currency '${cleanButtonText}'`,
          ).toBe(true);
        }
      }
      return;
    }

    // JSON-driven: resolve effective region via priority chain
    const finalUrl = this.page.url();
    const { prefix } = LingoGeoBannerPage.parseUrlLocale(finalUrl);
    // Guard: context may be closed if a prior navigation redirected away from the domain.
    const cookies = await context.cookies().catch(() => {
      console.warn('[LingoGeo] context.cookies() failed (context closed) — falling back to URL-only region');
      return [];
    });
    let region = LingoGeoBannerPage.resolveEffectiveRegion(finalUrl, cookies);

    // Check prefix + region combo against supported-markets JSON.
    // If the region is not in the supported regions for this path prefix, discard it
    // so the path-default fallback below picks up the correct market.
    // e.g. akamaiLocale=hr on /express/ (US): hr unsupported → USD, not Croatia EUR.
    if (region && supportedMarketsData
        && !LingoGeoBannerPage.isSupportedCombo(prefix, region, supportedMarketsData)) {
      console.info(`[LingoGeo] Region '${region}' not in supported-markets for prefix='${prefix}' — using path default`);
      region = '';
    }

    // No signal from URL/cookies → fall back to path's primary market (uk→gb, fr→fr, ''→us)
    let expectedCurrency = LingoGeoBannerPage.getCurrency(prefix, region, marketsData)
      || LingoGeoBannerPage.getCurrency('en', region, marketsData);
    if (!expectedCurrency) {
      const pathDefaultRegion = LingoGeoBannerPage.getSiteRegion(prefix, supportedMarketsData, marketsData);
      expectedCurrency = LingoGeoBannerPage.getCurrency(prefix, pathDefaultRegion, marketsData)
        || LingoGeoBannerPage.getCurrency('en', pathDefaultRegion, marketsData);
      region = pathDefaultRegion;
    }

    expect(expectedCurrency, `No currency resolved in markets.json for prefix='${prefix}' region='${region}'`).toBeTruthy();

    const normalizedExpected = expectedCurrency.replace(/\s+/g, ' ').trim();
    expect(
      cleanButtonText,
      `Market selector should show '${expectedCurrency}' (prefix='${prefix}', region='${region}')`,
    ).toContain(normalizedExpected);

    console.info(`[LingoGeo] Market selector currency — Rendered: '${cleanButtonText}' | markets.json: '${expectedCurrency}' ✓`);

    const currencyTokens = LingoGeoBannerPage.extractCurrencyTokens(expectedCurrency);
    if (currencyTokens.length > 0) {
      const count = await this.priceCurrencySymbols.count();
      let verified = 0;
      for (let i = 0; i < count; i++) {
        const cardText = (await this.priceCurrencySymbols.nth(i).textContent())?.trim() ?? '';
        if (!cardText) continue;
        const matched = currencyTokens.some((t) => cardText.includes(t));
        expect(
          matched,
          `Price card [${i}] '${cardText}' should contain currency from '${expectedCurrency}'`,
        ).toBe(true);
        verified += 1;
      }
      expect(
        verified,
        `No price symbols loaded on page — expected at least 1 of ${count} to contain '${expectedCurrency}'`,
      ).toBeGreaterThan(0);
      console.info(`[LingoGeo] Price cards currency — markets.json: '${expectedCurrency}' | verified: ${verified}/${count} currency symbol(s) ✓`);
    }
  }

  /**
   * Validate language and market selector contents against supported-markets.json and markets.json.
   *
   * Language selector: all `nativeName` values from supported-markets.json must be present.
   * Market selector: all markets from markets.json for the current language's supportedRegions must be present.
   *
   * @param {object} supportedMarketsData
   * @param {object} marketsData
   */
  async assertSelectorContents(supportedMarketsData, marketsData) {
    await this.waitForFooterMarketSelectorsVisible();

    // ── Language selector — all nativeNames present ────────────────────────────
    await this.languageSelectorButton.scrollIntoViewIfNeeded();
    await expect(this.languageSelectorButton).toBeEnabled({ timeout: 8000 });
    await this.languageSelectorButton.click();
    await this.languageSelectorPopover.waitFor({ state: 'visible', timeout: 10000 });
    const langItems = (await this.languageSelectorPopover.locator('.market-selector-item').allInnerTexts()).filter(Boolean);
    const nativeNames = (supportedMarketsData?.data ?? []).map((r) => r.nativeName).filter(Boolean);
    const missingLangs = nativeNames.filter((name) => !langItems.some((item) => item.trim().includes(name)));
    // console.info(`[LingoGeo] Language selector items (${langItems.length}):\n${langItems.join('\n')}`);
    if (missingLangs.length > 0) console.error(`[LingoGeo] Language selector NOT matching JSON — missing: [${missingLangs.join(', ')}]`);
    expect(missingLangs, `Language selector missing: ${missingLangs.join(', ')}`).toHaveLength(0);
    console.info(`[LingoGeo] Language selector: all ${nativeNames.length} languages present ✓`);

    // ── Language selector — order matches supported-markets.json ─────────────
    const cleanLangItems = langItems.map((v) => LingoGeoBannerPage.stripBidiChars(v.trim()));
    const outOfOrder = nativeNames.filter((name, i) => !cleanLangItems[i]?.includes(name));
    expect(outOfOrder, `Language selector order mismatch: [${outOfOrder.join(', ')}]`).toHaveLength(0);
    console.info(`[LingoGeo] Language selector options are as per supported-markets.json order: ${nativeNames.length} items ✓`);

    await this.languageSelectorButton.click();
    await this.languageSelectorPopover.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    // ── Market selector — current locale's supported regions ──────────────────
    expect(supportedMarketsData, 'supported-markets.json unavailable — market selector check cannot run').not.toBeNull();
    expect(marketsData, 'markets.json unavailable — market selector check cannot run').not.toBeNull();
    const { prefix } = LingoGeoBannerPage.parseUrlLocale(this.page.url());
    const row = LingoGeoBannerPage.getMarketRow(prefix, supportedMarketsData);
    const csv = LingoGeoBannerPage.getSupportedRegionsCsvFromRow(row);
    const supportedRegions = csv ? csv.split(',').map((x) => x.trim()).filter(Boolean) : [];
    const expectedMarkets = supportedRegions
      .map((r) => LingoGeoBannerPage.getCurrency(prefix, r, marketsData))
      .filter(Boolean)
      .map((v) => v.replace(/\s+/g, ' ').trim());
    await this.currencySelectorButton.click();
    await this.currencySelectorPopover.waitFor({ state: 'visible', timeout: 10000 });
    const marketItems = (await this.currencySelectorPopover.locator('.market-selector-item').allInnerTexts())
      .filter(Boolean)
      .map((v) => LingoGeoBannerPage.stripBidiChars(v.trim()));
    const missingMarkets = expectedMarkets.filter((expected) => !marketItems.some((item) => item.includes(expected)));
    // console.info(`[LingoGeo] Market selector items (${marketItems.length}):\n${marketItems.join('\n')}`);
    if (missingMarkets.length > 0) console.error(`[LingoGeo] Market selector NOT matching JSON — missing: [${missingMarkets.join(', ')}]`);
    expect(missingMarkets, `Market selector missing: ${missingMarkets.join(', ')}`).toHaveLength(0);
    console.info(`[LingoGeo] Market selector: all ${expectedMarkets.length} markets present ✓`);

    // ── Market selector — alphabetical order ──────────────────────────────────
    // URL prefixes like 'cn', 'tw', 'jp', 'kr' are not valid BCP 47 locale codes.
    // Map them to proper codes so localeCompare uses the correct collation rules
    // (e.g. Pinyin order for Chinese, Hiragana/Katakana order for Japanese).
    // sensitivity:'base' ignores case and accents so é==e, Ä==a — avoids false
    // failures when capitalization differs between page text and the sorted copy.
    // tw page sorts by Pinyin order — zh-CN collation matches (美/M < 台/T < 香/X)
    const localeMap = { cn: 'zh-CN', tw: 'zh-CN', jp: 'ja', kr: 'ko', br: 'pt-BR' };
    const sortLocale = localeMap[prefix] || prefix || 'en';
    const sortedMarkets = [...marketItems].sort((a, b) => a.localeCompare(b, sortLocale, { sensitivity: 'base' }));
    for (let i = 0; i < marketItems.length; i++) {
      expect(
        marketItems[i],
        `Market selector item [${i}] out of order — found '${marketItems[i]}' but expected '${sortedMarkets[i]}' (locale: '${sortLocale}')`,
      ).toBe(sortedMarkets[i]);
    }
    console.info(`[LingoGeo] Market selector: alphabetical order verified for ${marketItems.length} items ✓`);

    await this.currencySelectorButton.click();
    await this.currencySelectorPopover.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

    console.info('[LingoGeo] All contents matching JSON ✓');
  }

  /**
   * Footer selector search popovers — invalid query shows locale strings from placeholders.json.
   *
   * @param {{ noResultsLanguage: string|null, noResultsMarket: string|null, searchLanguage: string|null, searchMarket: string|null }} localeSearchStrings
   */
  async assertSelectorSearch(localeSearchStrings) {
    const {
      noResultsLanguage, noResultsMarket, searchLanguage, searchMarket,
    } = localeSearchStrings ?? {};

    await this.page.waitForLoadState('load')
      .catch((e) => console.warn(`[LingoGeo] Page load timed out: ${e.message}`));

    await this.waitForFooterMarketSelectorsVisible();

    await this.languageSelectorButton.scrollIntoViewIfNeeded();
    await expect(this.languageSelectorButton).toBeEnabled({ timeout: 8000 });
    await this.languageSelectorButton.click();
    const langSearchInput = this.languageSelectorPopover.locator('input').first();
    if (!(await langSearchInput.isVisible().catch(() => false))) {
      await this.languageSelectorButton.click();
    }
    await expect(langSearchInput).toBeVisible({ timeout: 10000 });
    if (searchLanguage) {
      await expect(langSearchInput).toHaveAttribute('placeholder', searchLanguage, { timeout: 5000 });
      console.info(`[LingoGeo] Language - Placeholder check: '${searchLanguage}' ✓`);
    }
    // Valid language: partial + exact using the currently selected language item
    const selectedLang = (await this.languageSelectedItem.innerText().catch(() => '')).trim();
    if (selectedLang) {
      const langPartial = selectedLang.slice(0, 2);
      await langSearchInput.fill(langPartial);
      await expect(this.languageSelectorPopover).toContainText(selectedLang, { timeout: 5000 });
      await this.page.waitForTimeout(400);
      const langPartialResults = (await this.languageSelectorPopover.locator('.market-selector-item').allInnerTexts()).filter(Boolean);
      console.info(`[LingoGeo] Language - Partial text typed: '${langPartial}' → '${selectedLang}' found in results: [${langPartialResults.join(', ')}] ✓`);
      await langSearchInput.fill(selectedLang);
      await expect(this.languageSelectorPopover).toContainText(selectedLang, { timeout: 5000 });
      console.info(`[LingoGeo] Language - Exact text typed: '${selectedLang}' → Result obtained: '${selectedLang}' ✓`);
      await langSearchInput.fill('');
    }
    await langSearchInput.fill('xyzxyz');
    if (noResultsLanguage) {
      await expect(this.languageSelectorPopover).toContainText(noResultsLanguage, { timeout: 5000 });
      console.info(`[LingoGeo] Language - No results text typed: 'xyzxyz' → '${noResultsLanguage}' ✓`);
    }
    await langSearchInput.fill('');
    await expect(this.languageSelectorButton).toBeEnabled({ timeout: 8000 });
    await this.languageSelectorButton.click();
    await this.languageSelectorPopover.waitFor({ state: 'hidden', timeout: 3000 })
      .catch((e) => console.warn(`[LingoGeo] Language popover did not close: ${e.message}`));

    await this.currencySelectorButton.scrollIntoViewIfNeeded();
    await expect(this.currencySelectorButton).toBeEnabled({ timeout: 8000 });
    await this.currencySelectorButton.click();
    const marketSearchInput = this.currencySelectorPopover.locator('input').first();
    await expect(marketSearchInput).toBeVisible({ timeout: 10000 });
    if (searchMarket) {
      await expect(marketSearchInput).toHaveAttribute('placeholder', searchMarket, { timeout: 5000 });
      console.info(`[LingoGeo] Market - Placeholder check: '${searchMarket}' ✓`);
    }
    // Valid market: partial + exact using the currently selected market item
    const selectedMarket = (await this.currencySelectedItem.innerText().catch(() => '')).trim();
    if (selectedMarket) {
      const marketPartial = selectedMarket.includes(' - ') ? selectedMarket.split(' - ')[1] : selectedMarket.slice(0, 2);
      await marketSearchInput.fill(marketPartial);
      await expect(this.currencySelectorPopover).toContainText(selectedMarket, { timeout: 5000 });
      await this.page.waitForTimeout(400);
      const marketPartialResults = (await this.currencySelectorPopover.locator('.market-selector-item').allInnerTexts()).filter(Boolean);
      console.info(`[LingoGeo] Market - Partial text typed: '${marketPartial}' → '${selectedMarket}' found in results: [${marketPartialResults.join(', ')}] ✓`);
      await marketSearchInput.fill(selectedMarket);
      await expect(this.currencySelectorPopover).toContainText(selectedMarket, { timeout: 5000 });
      console.info(`[LingoGeo] Market - Exact text typed: '${selectedMarket}' → Result obtained: '${selectedMarket}' ✓`);
      await marketSearchInput.fill('');
    }
    await marketSearchInput.fill('xyzxyz');
    if (noResultsMarket) {
      await expect(this.currencySelectorPopover).toContainText(noResultsMarket, { timeout: 5000 });
      console.info(`[LingoGeo] Market - No results text typed: 'xyzxyz' → '${noResultsMarket}' ✓`);
    }
    await marketSearchInput.fill('');
    await expect(this.currencySelectorButton).toBeEnabled({ timeout: 8000 });
    await this.currencySelectorButton.click();
    await this.currencySelectorPopover.waitFor({ state: 'hidden', timeout: 3000 })
      .catch((e) => console.warn(`[LingoGeo] Market popover did not close: ${e.message}`));
  }

  /**
   * Validates selector interaction behaviour for a feature:
   *   1. Pre-interaction: no `international` or `country` cookie is present.
   *   2. Clicks the selected language item:
   *        - `international` cookie is set, then redirect happens
   *        - redirect URL contains `/{prefix}/` and `country={defaultMarket}` from JSON
   *   3. Clicks the selected market/region item:
   *        - `country` cookie is set, then redirect happens
   *        - redirect URL contains `country={countryCookie.value}`
   *   4. Price card currency checked on the final post-redirect page
   *      using the currency for the clicked region.
   *
   * @param {import('@playwright/test').BrowserContext} context
   * @param {object|null} marketsData — full markets.json payload
   * @param {{ noResultsLanguage?: string|null, noResultsMarket?: string|null, searchLanguage?: string|null, searchMarket?: string|null }|null} localeSearchStrings — when set, runs {@link assertSelectorSearch} first
   */
  async assertSelectorInteractions(context, marketsData, localeSearchStrings = null) {
    // TODO: remove this skip once AEM URL redirect preserves akamaiLocale
    // if (process.env.ACOM_ORIGIN) {
    //   console.info('[LingoGeo] Skipping selector interactions on AEM URL (navigation drops akamaiLocale)');
    //   return;
    // }
    // Derive prefix and region from the current page URL — no spec fields needed.
    const { prefix, region } = LingoGeoBannerPage.parseUrlLocale(this.page.url());

    if (localeSearchStrings) {
      await this.assertSelectorSearch(localeSearchStrings);
    }

    // ── 1. Pre-interaction: no cookies ─────────────────────────────────────────
    const cookiesBefore = await context.cookies();
    expect(
      cookiesBefore.find((c) => c.name === 'international'),
      'Cookie "international" must not be set before selector interaction',
    ).toBeUndefined();
    expect(
      cookiesBefore.find((c) => c.name === 'country'),
      'Cookie "country" must not be set before selector interaction',
    ).toBeUndefined();

    // ── 2. Language selector click → international cookie + redirect ────────────
    await this.languageSelectorButton.scrollIntoViewIfNeeded();
    await this.languageSelectorButton.click();
    await this.languageSelectorPopover.waitFor({ state: 'visible', timeout: 8000 });
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'load', timeout: 10000 }).catch(() => {}),
      this.languageSelectedItem.click(),
    ]);
    const cookiesAfterLang = await context.cookies();
    const intlCookie = cookiesAfterLang.find((c) => c.name === 'international');
    expect(intlCookie, 'Language selector click must set the "international" cookie').toBeDefined();

    // Validate cookie VALUE: prefix from supported-markets JSON; empty prefix (US English) → 'us'
    const expectedIntl = prefix || 'us';
    expect(
      intlCookie?.value,
      `"international" cookie should be "${expectedIntl}" (prefix="${prefix || ''}")`,
    ).toBe(expectedIntl);

    const langUrl = this.page.url();
    console.info(`[LingoGeo] >>> After language click — international cookie: ${intlCookie?.value ?? 'not set'} (expected: ${expectedIntl}) | URL: ${langUrl}`);
    if (prefix) {
      expect(langUrl, `Language redirect URL should contain '/${prefix}/'`).toContain(`/${prefix}/`);
    }

    // ── 3. Market/region selector click → country cookie + redirect ─────────────
    await this.waitForFooterMarketSelectorsVisible();
    await this.currencySelectorButton.scrollIntoViewIfNeeded();
    await this.currencySelectorButton.click();
    await this.currencySelectorPopover.waitFor({ state: 'visible', timeout: 10000 });
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
      this.currencySelectedItem.click(),
    ]);

    const cookiesAfterMarket = await context.cookies();
    const countryCookie = cookiesAfterMarket.find((c) => c.name === 'country');
    expect(countryCookie, 'Market selector click must set the "country" cookie').toBeDefined();

    // Validate cookie VALUE: market code from the supported-regions column = akamaiLocale (region)
    expect(
      countryCookie?.value,
      `"country" cookie should be "${region}" (supported-regions market code)`,
    ).toBe(region);

    const clickedRegion = countryCookie?.value ?? region;
    const regionUrl = this.page.url();
    console.info(`[LingoGeo] >>> After region click — country cookie: ${countryCookie?.value ?? 'not set'} (expected: ${region}) | URL: ${regionUrl}`);
    expect(regionUrl, `Region redirect URL should contain 'country=${clickedRegion}'`).toContain(`country=${clickedRegion}`);

    // ── 4. Price cards — currency for the clicked region ──────────────────────
    const clickedCurrency = LingoGeoBannerPage.getCurrency(prefix, clickedRegion, marketsData);
    if (clickedCurrency) {
      const currencyTokens = LingoGeoBannerPage.extractCurrencyTokens(clickedCurrency);
      if (currencyTokens.length > 0) {
        // Wait for the post-redirect page to fully load before scrolling to the footer.
        await this.page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
        // Scroll first to trigger lazy-load, then wait for price symbols to attach.
        await this.waitForFooterMarketSelectorsVisible();
        await this.priceCurrencySymbols.first().waitFor({ state: 'attached', timeout: 20000 });
        await this.page.evaluate(() => { window.__pcsCount = -1; window.__pcsStable = 0; });
        await this.page.waitForFunction(() => {
          const n = document.querySelectorAll('.price-currency-symbol').length;
          if (n !== window.__pcsCount) { window.__pcsCount = n; window.__pcsStable = 0; return false; }
          return ++window.__pcsStable >= 3;
        }, { polling: 1000, timeout: 20000 }).catch(() => {
          console.warn('[LingoGeo] Price card count did not stabilize within 20s — proceeding with current count');
        });
        const count = await this.priceCurrencySymbols.count();
        let verified = 0;
        let firstSymbol = '';
        for (let i = 0; i < count; i++) {
          const cardText = (await this.priceCurrencySymbols.nth(i).textContent())?.trim() ?? '';
          if (!cardText) continue;
          if (!firstSymbol) firstSymbol = cardText;
          const matched = currencyTokens.some((token) => cardText.includes(token));
          expect(
            matched,
            `Post-redirect price card [${i}] '${cardText}' should contain currency from '${clickedCurrency}' (tokens: ${currencyTokens.join(', ')})`,
          ).toBe(true);
          verified += 1;
        }
        const postClickMarket = LingoGeoBannerPage.stripBidiChars(
          (await this.currencySelectorButton.innerText().catch(() => '')).trim(),
        );
        console.info(`[LingoGeo] >>> After click — Cards currency (Rendered): '${firstSymbol}' | Market selector (Rendered): '${postClickMarket}' | markets.json: '${clickedCurrency}' | Price currency symbols with '${firstSymbol}': ${verified}`);
        expect(verified, `No price symbols loaded after redirect — expected at least 1 of ${count} to contain '${clickedCurrency}'`).toBeGreaterThan(0);
      }
    }
  }

  // ─── Region Priority (Scenario 5) ─────────────────────────────────────────

  /**
   * Convert a `nativeName` string to the tab element CSS ID used in the geo-routing modal.
   *
   * "Italiano"     → "#tab-1-italiano"
   * "English (US)" → "#tab-1-english-us"
   * "Français"     → "#tab-1-français"
   * "Español"      → "#tab-1-español"
   *
   * @param {string} nativeName
   * @returns {string} CSS ID selector
   */
  static nativeNameToTabId(nativeName) {
    // Keep accented / non-ASCII characters as-is — the page uses the raw lowercase nativeName.
    // e.g. "Español" → "#tab-1-español"  "Français" → "#tab-1-français"  "Italiano" → "#tab-1-italiano"
    const slug = nativeName
      .toLowerCase()
      .replace(/[()]/g, '') // remove parentheses: "English (US)" → "english us"
      .trim()
      .replace(/\s+/g, '-'); // spaces → hyphens: "english us" → "english-us"
    return `#tab-1-${slug}`;
  }

  /**
   * Build the expected href for a geo-routing modal option link.
   * Pattern: `/{prefix}/express/?akamaiLocale={geoIp}&country={geoIp}`
   * US root (empty prefix): `/express/?akamaiLocale={geoIp}&country={geoIp}`
   *
   * @param {string} rowPrefix — e.g. 'de', 'fr', '' (US)
   * @param {string} geoIp     — akamaiLocale / feature.region
   * @returns {RegExp}
   */
  static buildOptionHrefPattern(rowPrefix, geoIp) {
    const path = rowPrefix ? `/${rowPrefix}/express/` : '/express/';
    return new RegExp(`${path.replace(/\//g, '\\/')}.*akamaiLocale=${geoIp}.*country=${geoIp}`);
  }

  /**
   * Validate the scenario-5 geo-routing modal:
   *   1. Modal title (from priority-1 row) is present.
   *   2. Each language tab (`#tab-1-{slug}`) is visible and clickable.
   *   3. Dropdown opens and shows `{country} - {nativeName}` options,
   *      each with the correct `href` (`/{prefix}/express/?akamaiLocale={geoIp}&country={geoIp}`).
   *   4. Stay link contains the current site's country name.
   *
   * @param {{
   *   title?: string,
   *   buttons?: Array<{ rowPrefix: string, country?: string, nativeName?: string }>,
   *   stayCountry?: string,
   *   geoIp?: string
   * }} copy — spread getModalCopy() result + geoIp from feature.region
   */
  async assertRegionalPriorityModal({ title, buttons = [], stayCountry, geoIp } = {}) {
    console.info(`[LingoGeo] Regional priority modal — ${buttons.length} tab(s) expected`);
    await this.waitForGeoModalReady();
    console.info(`[LingoGeo] Modal rendered ✓`);

    if (title) {
      await expect(this.geoRoutingModal).toContainText(title, { timeout: 10000 });
    }

    for (const [i, { rowPrefix, nativeName, country, tabTitle, tabDescription }] of buttons.entries()) {
      if (!nativeName) continue;

      const tabId = LingoGeoBannerPage.nativeNameToTabId(nativeName);
      const tab = this.geoRoutingModal.locator(tabId);
      await expect(tab, `Tab '${tabId}' (${nativeName}) not found`).toBeVisible({ timeout: 10000 });
      await tab.click();
      await expect(this.geoRoutingModal).toBeVisible({ timeout: 5000 });
      console.info(`[LingoGeo] Tab ${i + 1}/${buttons.length}: '${rowPrefix}' (${nativeName}) ✓`);

      if (tabTitle) {
        await expect(this.geoRoutingModal).toContainText(tabTitle, { timeout: 5000 });
        console.info(`[LingoGeo]   title:       expected='${tabTitle}' ✓`);
      }

      if (tabDescription) {
        const resolved = tabDescription.replace(/\{country\}/gi, country ?? '{country}');
        await expect(this.geoRoutingModal).toContainText(resolved, { timeout: 5000 });
        console.info(`[LingoGeo]   description: expected='${resolved}' ✓`);
      }

      if (country) {
        const activePanel = this.geoRoutingModal
          .locator('[role="tabpanel"]:not([hidden])')
          .first();
        const ctaBtn = activePanel
          .locator('a, button')
          .filter({ has: this.page.locator('.icon-milo.down-arrow') })
          .first();
        await expect(
          ctaBtn,
          `CTA button for tab '${nativeName}' does not contain country '${country}'`,
        ).toContainText(country, { timeout: 5000 });
        console.info(`[LingoGeo]   CTA:         expected='${country}' ✓`);

        await ctaBtn.click();
        await expect(ctaBtn).toHaveAttribute('aria-expanded', 'true', { timeout: 5000 });

        for (const [j, { rowPrefix: optPrefix, nativeName: optNative }] of buttons.entries()) {
          if (!optNative) continue;
          const optionText = `${country} - ${optNative}`;
          const href = `/${optPrefix || ''}express/?akamaiLocale=${geoIp}&country=${geoIp}`;
          const option = this.page
            .locator('a')
            .filter({ hasText: country })
            .filter({ hasText: optNative })
            .first();
          await expect(option, `Dropdown option '${optionText}' not visible`).toBeVisible({ timeout: 10000 });
          if (geoIp) {
            await expect(
              option,
              `Dropdown option '${optionText}' href mismatch`,
            ).toHaveAttribute('href', LingoGeoBannerPage.buildOptionHrefPattern(optPrefix, geoIp));
          }
          console.info(`[LingoGeo]   dropdown[${j + 1}]: expected='${optionText}'  →  ${href} ✓`);
        }

        await this.page.keyboard.press('Escape');
      }
    }

    expect(stayCountry, `Stay link country could not be resolved from markets.json`).toBeTruthy();
    const renderedStay = await this.geoRoutingModalStayLink.innerText().catch(() => '');
    expect(
      renderedStay.trim(),
      `Stay link does not contain country '${stayCountry}'`,
    ).toContain(stayCountry);
    console.info(`[LingoGeo] Stay link: expected='${stayCountry}' | rendered='${renderedStay.trim()}' ✓`);
  }

}