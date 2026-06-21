// FEDs LNav locale master list.
// Add/remove entries here — all feds-lnav tests and the Allure dashboard pick this up automatically.
// dir:'rtl' marks Arabic and Hebrew markets (triggers RTL-specific assertions).
// Pages that return 404 are recorded as SKIPPED with the HTTP status shown in the dashboard.

export const fedsLnavLocales = [
  // ── US base ────────────────────────────────────────────────────────────────
  { code: 'us',      prefix: '/',         name: 'United States',        lang: 'en', dir: 'ltr' },

  // ── English variants ───────────────────────────────────────────────────────
  { code: 'il_en',   prefix: '/il_en/',   name: 'Israel English',       lang: 'en', dir: 'ltr' },
  { code: 'ae_en',   prefix: '/ae_en/',   name: 'UAE English',          lang: 'en', dir: 'ltr' },
  { code: 'sa_en',   prefix: '/sa_en/',   name: 'Saudi Arabia English', lang: 'en', dir: 'ltr' },
  { code: 'vn_en',   prefix: '/vn_en/',   name: 'Vietnam English',      lang: 'en', dir: 'ltr' },
  { code: 'cis_en',  prefix: '/cis_en/',  name: 'CIS English',          lang: 'en', dir: 'ltr' },
  { code: 'ca',      prefix: '/ca/',      name: 'Canada English',       lang: 'en', dir: 'ltr' },
  { code: 'mena_en', prefix: '/mena_en/', name: 'MENA English',         lang: 'en', dir: 'ltr' },
  { code: 'th_en',   prefix: '/th_en/',   name: 'Thailand English',     lang: 'en', dir: 'ltr' },
  { code: 'ph_en',   prefix: '/ph_en/',   name: 'Philippines English',  lang: 'en', dir: 'ltr' },
  { code: 'id_en',   prefix: '/id_en/',   name: 'Indonesia English',    lang: 'en', dir: 'ltr' },

  // ── Tier 1 English-speaking ────────────────────────────────────────────────
  { code: 'uk',      prefix: '/uk/',      name: 'United Kingdom',       lang: 'en', dir: 'ltr' },
  { code: 'au',      prefix: '/au/',      name: 'Australia',            lang: 'en', dir: 'ltr' },
  { code: 'africa',  prefix: '/africa/',  name: 'Africa',               lang: 'en', dir: 'ltr' },
  { code: 'be_en',   prefix: '/be_en/',   name: 'Belgium English',      lang: 'en', dir: 'ltr' },
  { code: 'gr_en',   prefix: '/gr_en/',   name: 'Greece English',       lang: 'en', dir: 'ltr' },
  { code: 'hk_en',   prefix: '/hk_en/',   name: 'Hong Kong English',    lang: 'en', dir: 'ltr' },
  { code: 'ie',      prefix: '/ie/',      name: 'Ireland',              lang: 'en', dir: 'ltr' },
  { code: 'in',      prefix: '/in/',      name: 'India English',        lang: 'en', dir: 'ltr' },
  { code: 'lu_en',   prefix: '/lu_en/',   name: 'Luxembourg English',   lang: 'en', dir: 'ltr' },
  { code: 'nz',      prefix: '/nz/',      name: 'New Zealand',          lang: 'en', dir: 'ltr' },
  { code: 'sg',      prefix: '/sg/',      name: 'Singapore',            lang: 'en', dir: 'ltr' },
  { code: 'my_en',   prefix: '/my_en/',   name: 'Malaysia English',     lang: 'en', dir: 'ltr' },
  { code: 'ng',      prefix: '/ng/',      name: 'Nigeria',              lang: 'en', dir: 'ltr' },
  { code: 'qa_en',   prefix: '/qa_en/',   name: 'Qatar English',        lang: 'en', dir: 'ltr' },
  { code: 'eg_en',   prefix: '/eg_en/',   name: 'Egypt English',        lang: 'en', dir: 'ltr' },
  { code: 'za',      prefix: '/za/',      name: 'South Africa',         lang: 'en', dir: 'ltr' },
  { code: 'kw_en',   prefix: '/kw_en/',   name: 'Kuwait English',       lang: 'en', dir: 'ltr' },

  // ── German ─────────────────────────────────────────────────────────────────
  { code: 'de',      prefix: '/de/',      name: 'Germany',              lang: 'de', dir: 'ltr' },
  { code: 'lu_de',   prefix: '/lu_de/',   name: 'Luxembourg German',    lang: 'de', dir: 'ltr' },
  { code: 'ch_de',   prefix: '/ch_de/',   name: 'Switzerland German',   lang: 'de', dir: 'ltr' },
  { code: 'at',      prefix: '/at/',      name: 'Austria',              lang: 'de', dir: 'ltr' },

  // ── French ─────────────────────────────────────────────────────────────────
  { code: 'fr',      prefix: '/fr/',      name: 'France',               lang: 'fr', dir: 'ltr' },
  { code: 'be_fr',   prefix: '/be_fr/',   name: 'Belgium French',       lang: 'fr', dir: 'ltr' },
  { code: 'ch_fr',   prefix: '/ch_fr/',   name: 'Switzerland French',   lang: 'fr', dir: 'ltr' },
  { code: 'lu_fr',   prefix: '/lu_fr/',   name: 'Luxembourg French',    lang: 'fr', dir: 'ltr' },
  { code: 'ca_fr',   prefix: '/ca_fr/',   name: 'Canada French',        lang: 'fr', dir: 'ltr' },

  // ── Japanese ───────────────────────────────────────────────────────────────
  { code: 'jp',      prefix: '/jp/',      name: 'Japan',                lang: 'ja', dir: 'ltr' },

  // ── Arabic (RTL) ───────────────────────────────────────────────────────────
  { code: 'mena_ar', prefix: '/mena_ar/', name: 'MENA Arabic',          lang: 'ar', dir: 'rtl' },
  { code: 'sa_ar',   prefix: '/sa_ar/',   name: 'Saudi Arabia Arabic',  lang: 'ar', dir: 'rtl' },
  { code: 'ae_ar',   prefix: '/ae_ar/',   name: 'UAE Arabic',           lang: 'ar', dir: 'rtl' },
  { code: 'qa_ar',   prefix: '/qa_ar/',   name: 'Qatar Arabic',         lang: 'ar', dir: 'rtl' },
  { code: 'kw_ar',   prefix: '/kw_ar/',   name: 'Kuwait Arabic',        lang: 'ar', dir: 'rtl' },
  { code: 'eg_ar',   prefix: '/eg_ar/',   name: 'Egypt Arabic',         lang: 'ar', dir: 'rtl' },

  // ── Hebrew (RTL) ───────────────────────────────────────────────────────────
  { code: 'il_he',   prefix: '/il_he/',   name: 'Israel Hebrew',        lang: 'he', dir: 'rtl' },

  // ── European ───────────────────────────────────────────────────────────────
  { code: 'bg',      prefix: '/bg/',      name: 'Bulgaria',             lang: 'bg', dir: 'ltr' },
  { code: 'cz',      prefix: '/cz/',      name: 'Czech Republic',       lang: 'cs', dir: 'ltr' },
  { code: 'dk',      prefix: '/dk/',      name: 'Denmark',              lang: 'da', dir: 'ltr' },
  { code: 'es',      prefix: '/es/',      name: 'Spain',                lang: 'es', dir: 'ltr' },
  { code: 'ee',      prefix: '/ee/',      name: 'Estonia',              lang: 'et', dir: 'ltr' },
  { code: 'fi',      prefix: '/fi/',      name: 'Finland',              lang: 'fi', dir: 'ltr' },
  { code: 'gr_el',   prefix: '/gr_el/',   name: 'Greece Greek',         lang: 'el', dir: 'ltr' },
  { code: 'hu',      prefix: '/hu/',      name: 'Hungary',              lang: 'hu', dir: 'ltr' },
  { code: 'it',      prefix: '/it/',      name: 'Italy',                lang: 'it', dir: 'ltr' },
  { code: 'ch_it',   prefix: '/ch_it/',   name: 'Switzerland Italian',  lang: 'it', dir: 'ltr' },
  { code: 'kr',      prefix: '/kr/',      name: 'Korea',                lang: 'ko', dir: 'ltr' },
  { code: 'lt',      prefix: '/lt/',      name: 'Lithuania',            lang: 'lt', dir: 'ltr' },
  { code: 'lv',      prefix: '/lv/',      name: 'Latvia',               lang: 'lv', dir: 'ltr' },
  { code: 'nl',      prefix: '/nl/',      name: 'Netherlands',          lang: 'nl', dir: 'ltr' },
  { code: 'be_nl',   prefix: '/be_nl/',   name: 'Belgium Dutch',        lang: 'nl', dir: 'ltr' },
  { code: 'no',      prefix: '/no/',      name: 'Norway',               lang: 'no', dir: 'ltr' },
  { code: 'pl',      prefix: '/pl/',      name: 'Poland',               lang: 'pl', dir: 'ltr' },
  { code: 'pt',      prefix: '/pt/',      name: 'Portugal',             lang: 'pt', dir: 'ltr' },
  { code: 'br',      prefix: '/br/',      name: 'Brazil',               lang: 'pt', dir: 'ltr' },
  { code: 'ro',      prefix: '/ro/',      name: 'Romania',              lang: 'ro', dir: 'ltr' },
  { code: 'ru',      prefix: '/ru/',      name: 'Russia',               lang: 'ru', dir: 'ltr' },
  { code: 'cis_ru',  prefix: '/cis_ru/',  name: 'CIS Russian',          lang: 'ru', dir: 'ltr' },
  { code: 'sk',      prefix: '/sk/',      name: 'Slovakia',             lang: 'sk', dir: 'ltr' },
  { code: 'si',      prefix: '/si/',      name: 'Slovenia',             lang: 'sl', dir: 'ltr' },
  { code: 'se',      prefix: '/se/',      name: 'Sweden',               lang: 'sv', dir: 'ltr' },
  { code: 'tr',      prefix: '/tr/',      name: 'Turkey',               lang: 'tr', dir: 'ltr' },
  { code: 'ua',      prefix: '/ua/',      name: 'Ukraine',              lang: 'uk', dir: 'ltr' },

  // ── Spanish LATAM ──────────────────────────────────────────────────────────
  { code: 'ar',      prefix: '/ar/',      name: 'Argentina',            lang: 'es', dir: 'ltr' },
  { code: 'la',      prefix: '/la/',      name: 'Latin America',        lang: 'es', dir: 'ltr' },
  { code: 'mx',      prefix: '/mx/',      name: 'Mexico',               lang: 'es', dir: 'ltr' },
  { code: 'pe',      prefix: '/pe/',      name: 'Peru',                 lang: 'es', dir: 'ltr' },
  { code: 'cl',      prefix: '/cl/',      name: 'Chile',                lang: 'es', dir: 'ltr' },
  { code: 'co',      prefix: '/co/',      name: 'Colombia',             lang: 'es', dir: 'ltr' },
  { code: 'cr',      prefix: '/cr/',      name: 'Costa Rica',           lang: 'es', dir: 'ltr' },
  { code: 'ec',      prefix: '/ec/',      name: 'Ecuador',              lang: 'es', dir: 'ltr' },
  { code: 'gt',      prefix: '/gt/',      name: 'Guatemala',            lang: 'es', dir: 'ltr' },
  { code: 'pr',      prefix: '/pr/',      name: 'Puerto Rico',          lang: 'es', dir: 'ltr' },

  // ── APAC ───────────────────────────────────────────────────────────────────
  { code: 'cn',      prefix: '/cn/',      name: 'China',                lang: 'zh', dir: 'ltr' },
  { code: 'tw',      prefix: '/tw/',      name: 'Taiwan',               lang: 'zh', dir: 'ltr' },
  { code: 'hk_zh',   prefix: '/hk_zh/',   name: 'Hong Kong Chinese',    lang: 'zh', dir: 'ltr' },
  { code: 'th_th',   prefix: '/th_th/',   name: 'Thailand Thai',        lang: 'th', dir: 'ltr' },
  { code: 'ph_fil',  prefix: '/ph_fil/',  name: 'Philippines Filipino', lang: 'fil', dir: 'ltr' },
  { code: 'id_id',   prefix: '/id_id/',   name: 'Indonesia Indonesian', lang: 'id',  dir: 'ltr' },
  { code: 'my_ms',   prefix: '/my_ms/',   name: 'Malaysia Malay',       lang: 'ms',  dir: 'ltr' },
  { code: 'vn_vi',   prefix: '/vn_vi/',   name: 'Vietnam Vietnamese',   lang: 'vi',  dir: 'ltr' },
  { code: 'in_hi',   prefix: '/in_hi/',   name: 'India Hindi',          lang: 'hi',  dir: 'ltr' },
];

export const chinaLocales = ['cn'];
export const rtlLocales = fedsLnavLocales.filter((l) => l.dir === 'rtl').map((l) => l.code);
