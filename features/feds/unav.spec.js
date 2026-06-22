import { fedsLnavLocales } from '../../data/feds-lnav-locales.js';

export const UNAV_DEFAULT_PARAMS = 'mep=off&georouting=off';

// ── Pages to test ──────────────────────────────────────────────────────────
// US-form paths only — locale prefix is injected automatically per locale.
// helpx.adobe.com/support.html is excluded: different subdomain, prefix matrix does not apply.
export const unavPages = [
  { path: '/',                                                                    name: 'home',              clientId: 'homepage_milo' },
  { path: '/creativecloud.html',                                                  name: 'cc',                clientId: 'adobedotcom-cc' },
  { path: '/creativecloud/all-apps.html',                                         name: 'cc-all-apps',       clientId: 'adobedotcom-cc' },
  { path: '/creativecloud/business.html',                                         name: 'cc-business',       clientId: 'adobedotcom-cc' },
  { path: '/creativecloud/business/teams.html',                                   name: 'cc-business-teams', clientId: 'adobedotcom-cc' },
  { path: '/creativecloud/plans.html',                                            name: 'cc-plans',          clientId: 'adobedotcom-cc',        noAppSwitcher: true, slimFooter: true },
  { path: '/creativecloud/buy/students.html',                                     name: 'cc-students',       clientId: 'adobedotcom-cc' },
  { path: '/products/photoshop.html',                                             name: 'photoshop',         clientId: 'adobedotcom-cc' },
  { path: '/products/illustrator.html',                                           name: 'illustrator',       clientId: 'adobedotcom-cc' },
  //{ path: '/products/captivate/download-trial/try.html',                          name: 'captivate-trial',   clientId: 'trials1' },   sign in dependent
  { path: '/products/catalog.html#category=creativity-design',                    name: 'catalog',           clientId: 'adobedotcom-cc',  noAppSwitcher: true, slimFooter: true },
  { path: '/acrobat.html',                                                        name: 'acrobat',           clientId: 'acrobatmilo' },
  { path: '/acrobat/online.html',                                                 name: 'acrobat-online',    clientId: 'acrobatmilo',     slimFooter: true },
  { path: '/sign.html',                                                           name: 'sign',              clientId: 'acrobatmilo' },
  { path: '/express',                                                             name: 'express',           clientId: 'AdobeExpressWeb', marketSelector: true },
  { path: '/education.html',                                                      name: 'education',         clientId: 'acom-education' },
  { path: '/community',                                                           name: 'community',         clientId: 'community-acom-client' },
  { path: '/learn',                                                               name: 'learn',             clientId: 'CCHomeWeb1' },
  { path: '/genuine/dm-ses-lp.html?gid=IC_9RC4HL99FR&gtoken=f9874a45-9925-406a-8ca3-d9d824aab728', name: 'genuine', clientId: 'adobedotcom-cc' },
  //Helpx — different subdomain; stage: helpx.stage.adobe.com, prod: helpx.adobe.com
  { path: '/support.html',                                                        name: 'helpx',             clientId: 'AdobeSupport1', subdomain: 'helpx' },
];

// ── Locales to run ─────────────────────────────────────────────────────────
// Sourced from data/feds-lnav-locales.js — add/remove codes here only.
// 'ar' in the master list is Argentina; Arabic markets use ae_ar / mena_ar.
const LOCALE_CODES = [
  // US base
  'us',
  // Row 1 — core languages (zh_CN, zh_TW, cs_CZ, da_DK, nl_NL, fi_FI, hu_HU, it_IT, ja_JP, ko_KR,
  //          nb_NO, pl_PL, pt_BR, es_ES, es_MX, sv_SE, tr_TR, uk_UA, fr_FR, de_DE, sl_SI,
  //          es_LA, es_PE, es_CO, es_CR, es_EC)
  'cn', 'tw', 'cz', 'dk', 'nl', 'fi', 'hu', 'it', 'jp', 'kr',
  'no', 'pl', 'br', 'es', 'mx', 'se', 'tr', 'ua', 'fr', 'de',
  'si', 'la', 'pe', 'co', 'cr', 'ec',
  // Row 2 — English + Arabic variants + LATAM + APAC
  //         (en_GB, en_NZ, en_AU, en_CA, fr_CA, en_HK, en_IN, en_IE, ar_MENA, ar_EG, ar_KW, ar_QA,
  //          ae_ar, at, ar_SA, bg_BG, zh_HK, nl_BE, en_PH, es_AR, es_CL, es_PR, es_GT, th_TH, vn_VI)
  'uk', 'nz', 'au', 'ca', 'ca_fr', 'hk_en', 'in', 'ie',
  'mena_ar', 'eg_ar', 'kw_ar', 'qa_ar', 'ae_ar', 'at', 'sa_ar',
  'bg', 'hk_zh', 'be_nl', 'ph_en', 'ar', 'cl', 'pr', 'gt', 'th_th', 'vn_vi',
  // Row 3 — regional English + more
  //         (en_ID, en_VN, en_TH, en_CIS, en_IL, en_MENA, en_AE, en_SA, en_MY, en_SG, en_GR,
  //          en_ZA, en_NG, en_BE, en_LU, en_EG, en_KW, en_QA, en_Africa, ro_RO, cis_RU, sk_SK)
  'id_en', 'vn_en', 'th_en', 'cis_en', 'il_en', 'mena_en', 'ae_en', 'sa_en',
  'my_en', 'sg', 'gr_en', 'za', 'ng', 'be_en', 'lu_en', 'eg_en', 'kw_en', 'qa_en',
  'africa', 'ro', 'cis_ru', 'sk',
  // Row 4 — more European + APAC native languages
  //         (et_EE, fil_PH, fr_LU, fr_CH, fr_BE, de_LU, de_AT, de_CH, el_GR, he_IL, hi_IN,
  //          id_ID, it_CH, lv_LV, lt_LT, ms_MY, pt_PT)
  'ee', 'ph_fil', 'lu_fr', 'ch_fr', 'be_fr', 'lu_de', 'ch_de',
  'gr_el', 'il_he', 'in_hi', 'id_id', 'ch_it', 'lv', 'lt', 'my_ms', 'pt',
];

export const unavLocales = fedsLnavLocales.filter((l) => LOCALE_CODES.includes(l.code));

// ── Auto-generate one test entry per locale × page ────────────────────────
export const features = unavLocales.flatMap((locale) =>
  unavPages.map((page) => ({
    name: `@unav-${locale.code}-${page.name.toLowerCase().replace(/\s+/g, '-')}`,
    tags: `@unav @gnav @feds @smoke @${locale.code}`,
    path: `${locale.prefix.replace(/\/$/, '')}${page.path}`,
    locale: locale.code,
    localeName: locale.name,
    lang: locale.lang,
    pageName: page.name,
    clientId: page.clientId,
    dir: locale.dir,
    noAppSwitcher:   !!page.noAppSwitcher,
    slimFooter:      !!page.slimFooter,
    marketSelector:  !!page.marketSelector,
    subdomain:       page.subdomain ?? null,
  }))
);
