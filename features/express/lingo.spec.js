/** 
 * ACOM Express geo — `features` (no `international` cookie; default PREF = us).
 *
 * `@express-lingo-geo-suite` TCIDs are sequential: **0–129** (`features`), **131N1–157NB1** (`currencyNegativeFeatures`),
 * **158P1–175P18** (pref cookie), **176M1–193M18** (modal), **194S1–198S5** (scenario 5), **199B3–200B5** (BACOM),
 * **201S6** (scenario 6), **202SR1–205SR4** (search).
 *
 * Flowchart (`LingoGeoBannerPage.computeExpectedUi`): `uiExpectation: 'none'` rows are scenarios
 * (1,3), (1a,3), or (6). Scenario **(6)** with geo absent from supported-markets is **201S6** in
 * `scenario6UnsupportedGeoFeatures`. From tcid 94 onward, `uiExpectation: 'banner'` is scenario (2).
 * Geo modal (4,4a,4b, 5 on ACOM) is covered in `modalFeatures`, not here.
 */

const jsonSnapshotFeature = {
  tcid: 'JS1',
  name: '@express-geo-json-snapshot',
  path: '/express/?akamaiLocale=us&mep=off',
  tags: '@jsonSnapshot',
};

const selectorContentsFeatures = [
  { tcid: 'SC1',  name: '@express-geo-contents-us',    path: '/express/?akamaiLocale=us&mep=off&languageBanner=off',       tags: '@express-lingo-geo-suite @selectorContents @smoke' },
  { tcid: 'SC2',  name: '@express-geo-contents-uk',    path: '/uk/express/?akamaiLocale=gb&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC3',  name: '@express-geo-contents-in',    path: '/in/express/?akamaiLocale=in&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC4',  name: '@express-geo-contents-fr',    path: '/fr/express/?akamaiLocale=fr&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents @smoke' },
  { tcid: 'SC5',  name: '@express-geo-contents-de',    path: '/de/express/?akamaiLocale=de&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC6',  name: '@express-geo-contents-jp',    path: '/jp/express/?akamaiLocale=jp&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC7',  name: '@express-geo-contents-es',    path: '/es/express/?akamaiLocale=es&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC8',  name: '@express-geo-contents-kr',    path: '/kr/express/?akamaiLocale=kr&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC9',  name: '@express-geo-contents-it',    path: '/it/express/?akamaiLocale=it&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC10', name: '@express-geo-contents-br',    path: '/br/express/?akamaiLocale=br&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC11', name: '@express-geo-contents-nl',    path: '/nl/express/?akamaiLocale=nL&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC12', name: '@express-geo-contents-tw',    path: '/tw/express/?akamaiLocale=tw&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC13', name: '@express-geo-contents-cn',    path: '/cn/express/?akamaiLocale=us&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC14', name: '@express-geo-contents-dk',    path: '/dk/express/?akamaiLocale=dk&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC15', name: '@express-geo-contents-fi',    path: '/fi/express/?akamaiLocale=fi&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC16', name: '@express-geo-contents-no',    path: '/no/express/?akamaiLocale=no&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC17', name: '@express-geo-contents-se',    path: '/se/express/?akamaiLocale=se&mep=off&languageBanner=off',    tags: '@express-lingo-geo-suite @selectorContents' },
  { tcid: 'SC18', name: '@express-geo-contents-id_id', path: '/id_id/express/?akamaiLocale=id&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @selectorContents' },
];

const features = [

    {
      tcid: '0',
      name: '@express-geo-us-ae',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ae&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ae @defaultCurrency @smoke',
    },
    {
      tcid: '1',
      name: '@express-geo-us-am',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=am&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-am @defaultCurrency @smoke',
    },
    {
      tcid: '2',
      name: '@express-geo-us-ar',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ar&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ar @defaultCurrency',
    },
    {
      tcid: '3',
      name: '@express-geo-us-at',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=at&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-at @defaultCurrency',
    },
    {
      tcid: '4',
      name: '@express-geo-us-au',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=au&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-au @defaultCurrency',
    },
    {
      tcid: '5',
      name: '@express-geo-us-az',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=az&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-az @defaultCurrency',
    },
    {
      tcid: '6',
      name: '@express-geo-us-be',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=be&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-be @defaultCurrency',
    },
    {
      tcid: '7',
      name: '@express-geo-us-bg',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=bg&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-bg @defaultCurrency',
    },
    {
      tcid: '8',
      name: '@express-geo-us-bh',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=bh&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-bh @defaultCurrency',
    },
    {
      tcid: '9',
      name: '@express-geo-us-bo',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=bo&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-bo @defaultCurrency',
    },
    {
      tcid: '10',
      name: '@express-geo-us-br',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=br&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-br @defaultCurrency',
    },
    {
      tcid: '11',
      name: '@express-geo-us-ca',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ca&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ca @defaultCurrency @smoke',
    },
    {
      tcid: '12',
      name: '@express-geo-us-ch',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ch&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ch @defaultCurrency',
    },
    {
      tcid: '13',
      name: '@express-geo-us-cl',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=cl&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-cl @defaultCurrency',
    },
    {
      tcid: '14',
      name: '@express-geo-us-co',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=co&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-co @defaultCurrency',
    },
    {
      tcid: '15',
      name: '@express-geo-us-cr',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=cr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-cr @defaultCurrency',
    },
    {
      tcid: '16',
      name: '@express-geo-us-cy',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=cy&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-cy @defaultCurrency',
    },
    {
      tcid: '17',
      name: '@express-geo-us-cz',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=cz&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-cz @defaultCurrency',
    },
    {
      tcid: '18',
      name: '@express-geo-us-de',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=de&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-de @defaultCurrency',
    },
    {
      tcid: '19',
      name: '@express-geo-us-dk',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=dk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-dk @defaultCurrency',
    },
    {
      tcid: '20',
      name: '@express-geo-us-do',
      uiExpectation: 'none',
      path: '/express/pricing?akamaiLocale=do&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-do @defaultCurrency',
    },
    {
      tcid: '21',
      name: '@express-geo-us-dz',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=dz&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-dz @defaultCurrency',
    },
    {
      tcid: '22',
      name: '@express-geo-us-ec',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ec&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ec @defaultCurrency',
    },
    {
      tcid: '23',
      name: '@express-geo-us-ee',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ee&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ee @defaultCurrency',
    },
    {
      tcid: '24',
      name: '@express-geo-us-eg',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=eg&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-eg @defaultCurrency',
    },
    {
      tcid: '25',
      name: '@express-geo-us-es',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=es&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-es @defaultCurrency',
    },
    {
      tcid: '26',
      name: '@express-geo-us-fi',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=fi&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-fi @defaultCurrency',
    },
    {
      tcid: '27',
      name: '@express-geo-us-fr',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=fr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-fr @defaultCurrency',
    },
    {
      tcid: '28',
      name: '@express-geo-us-gb',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=gb&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-gb @defaultCurrency',
    },
    {
      tcid: '29',
      name: '@express-geo-us-ge',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ge&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ge @defaultCurrency',
    },
    {
      tcid: '30',
      name: '@express-geo-us-gr',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=gr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-gr @defaultCurrency',
    },
    {
      tcid: '31',
      name: '@express-geo-us-gt',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=gt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-gt @defaultCurrency',
    },
    {
      tcid: '32',
      name: '@express-geo-us-hk',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=hk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-hk @defaultCurrency',
    },
    {
      tcid: '33',
      name: '@express-geo-us-hu',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=hu&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-hu @defaultCurrency',
    },
    {
      tcid: '34',
      name: '@express-geo-us-id',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=id&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-id @defaultCurrency',
    },
    {
      tcid: '35',
      name: '@express-geo-us-ie',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ie&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ie @defaultCurrency',
    },
    {
      tcid: '36',
      name: '@express-geo-us-il',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=il&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-il @defaultCurrency',
    },
    {
      tcid: '37',
      name: '@express-geo-us-in',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=in&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-in @defaultCurrency',
    },
    {
      tcid: '38',
      name: '@express-geo-us-it',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=it&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-it @defaultCurrency',
    },
    {
      tcid: '39',
      name: '@express-geo-us-jo',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=jo&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-jo @defaultCurrency',
    },
    {
      tcid: '40',
      name: '@express-geo-us-jp',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=jp&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-jp @defaultCurrency',
    },
    {
      tcid: '41',
      name: '@express-geo-us-ke',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ke&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ke @defaultCurrency',
    },
    {
      tcid: '42',
      name: '@express-geo-us-kg',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=kg&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-kg @defaultCurrency',
    },
    {
      tcid: '43',
      name: '@express-geo-us-kw',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=kw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-kw @defaultCurrency',
    },
    {
      tcid: '44',
      name: '@express-geo-us-kz',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=kz&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-kz @defaultCurrency',
    },
    {
      tcid: '45',
      name: '@express-geo-us-lb',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=lb&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-lb @defaultCurrency',
    },
    {
      tcid: '46',
      name: '@express-geo-us-lk',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=lk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-lk @defaultCurrency',
    },
    {
      tcid: '47',
      name: '@express-geo-us-lt',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=lt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-lt @defaultCurrency',
    },
    {
      tcid: '48',
      name: '@express-geo-us-lu',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=lu&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-lu @defaultCurrency',
    },
    {
      tcid: '49',
      name: '@express-geo-us-lv',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=lv&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-lv @defaultCurrency',
    },
    {
      tcid: '50',
      name: '@express-geo-us-ma',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ma&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ma @defaultCurrency',
    },
    {
      tcid: '51',
      name: '@express-geo-us-md',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=md&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-md @defaultCurrency',
    },
    {
      tcid: '52',
      name: '@express-geo-us-mo',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=mo&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-mo @defaultCurrency',
    },
    {
      tcid: '53',
      name: '@express-geo-us-mt',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=mt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-mt @defaultCurrency',
    },
    {
      tcid: '54',
      name: '@express-geo-us-mu',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=mu&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-mu @defaultCurrency',
    },
    {
      tcid: '55',
      name: '@express-geo-us-mx',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=mx&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-mx @defaultCurrency',
    },
    {
      tcid: '56',
      name: '@express-geo-us-my',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=my&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-my @defaultCurrency',
    },
    {
      tcid: '57',
      name: '@express-geo-us-ng',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ng&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ng @defaultCurrency',
    },
    {
      tcid: '58',
      name: '@express-geo-us-nl',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=nl&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-nl @defaultCurrency',
    },
    {
      tcid: '59',
      name: '@express-geo-us-no',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=no&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-no @defaultCurrency',
    },
    {
      tcid: '60',
      name: '@express-geo-us-nz',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=nz&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-nz @defaultCurrency',
    },
    {
      tcid: '61',
      name: '@express-geo-us-om',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=om&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-om @defaultCurrency',
    },
    {
      tcid: '62',
      name: '@express-geo-us-pa',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=pa&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-pa @defaultCurrency',
    },
    {
      tcid: '63',
      name: '@express-geo-us-pe',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=pe&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-pe @defaultCurrency',
    },
    {
      tcid: '64',
      name: '@express-geo-us-ph',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ph&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ph @defaultCurrency',
    },
    {
      tcid: '65',
      name: '@express-geo-us-pl',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=pl&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-pl @defaultCurrency',
    },
    {
      tcid: '66',
      name: '@express-geo-us-pt',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=pt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-pt @defaultCurrency',
    },
    {
      tcid: '67',
      name: '@express-geo-us-py',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=py&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-py @defaultCurrency',
    },
    {
      tcid: '68',
      name: '@express-geo-us-qa',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=qa&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-qa @defaultCurrency',
    },
    {
      tcid: '69',
      name: '@express-geo-us-ro',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ro&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ro @defaultCurrency',
    },
    {
      tcid: '70',
      name: '@express-geo-us-sa',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=sa&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-sa @defaultCurrency',
    },
    {
      tcid: '71',
      name: '@express-geo-us-se',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=se&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-se @defaultCurrency',
    },
    {
      tcid: '72',
      name: '@express-geo-us-sg',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=sg&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-sg @defaultCurrency',
    },
    {
      tcid: '73',
      name: '@express-geo-us-si',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=si&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-si @defaultCurrency',
    },
    {
      tcid: '74',
      name: '@express-geo-us-sk',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=sk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-sk @defaultCurrency',
    },
    {
      tcid: '75',
      name: '@express-geo-us-sv',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=sv&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-sv @defaultCurrency',
    },
    {
      tcid: '76',
      name: '@express-geo-us-th',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=th&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-th @defaultCurrency',
    },
    {
      tcid: '77',
      name: '@express-geo-us-tj',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=tj&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-tj @defaultCurrency',
    },
    {
      tcid: '78',
      name: '@express-geo-us-tm',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=tm&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-tm @defaultCurrency',
    },
    {
      tcid: '79',
      name: '@express-geo-us-tr',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=tr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-tr @defaultCurrency',
    },
    {
      tcid: '80',
      name: '@express-geo-us-tt',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=tt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-tt @defaultCurrency',
    },
    {
      tcid: '81',
      name: '@express-geo-us-tw',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=tw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-tw @defaultCurrency',
    },
    {
      tcid: '82',
      name: '@express-geo-us-ua',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ua&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ua @defaultCurrency',
    },
    {
      tcid: '83',
      name: '@express-geo-us-us',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=us&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-us @defaultCurrency',
    },
    {
      tcid: '84',
      name: '@express-geo-us-uy',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=uy&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-uy @defaultCurrency',
    },
    {
      tcid: '85',
      name: '@express-geo-us-uz',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=uz&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-uz @defaultCurrency',
    },
    {
      tcid: '86',
      name: '@express-geo-us-ve',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=ve&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-ve @defaultCurrency',
    },
    {
      tcid: '87',
      name: '@express-geo-us-vn',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=vn&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-vn @defaultCurrency',
    },
    {
      tcid: '88',
      name: '@express-geo-us-za',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=za&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-za @defaultCurrency',
    },
    {
      tcid: '89',
      name: '@express-geo-uk-gb',
      uiExpectation: 'none',
      path: '/uk/express/?akamaiLocale=gb&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-gb @defaultCurrency',
    },
    {
      tcid: '90',
      name: '@express-geo-in-in',
      uiExpectation: 'none',
      path: '/in/express/?akamaiLocale=in&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-en @express-geo-english-in @defaultCurrency',
    },
    // ACOM flowchart (2): language banner — page+geo supported; default PREF vs page differs by JSON lang column; (pref+geo) supported.
    {
      tcid: '91',
      name: '@express-geo-fr-be',
      uiExpectation: 'banner',
      path: '/fr/express/?akamaiLocale=be&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-fr @express-geo-french-be @defaultCurrency @smoke',
    },
    {
      tcid: '92',
      name: '@express-geo-fr-ca',
      uiExpectation: 'banner',
      path: '/fr/express/?akamaiLocale=ca&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-fr @express-geo-french-ca @defaultCurrency @smoke',
    },
    {
      tcid: '93',
      name: '@express-geo-fr-fr',
      uiExpectation: 'banner',
      path: '/fr/express/?akamaiLocale=fr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-fr @express-geo-french-fr @defaultCurrency @smoke',
    },
    {
      tcid: '94',
      name: '@express-geo-fr-ch',
      uiExpectation: 'banner',
      path: '/fr/express/?akamaiLocale=ch&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-fr @express-geo-french-ch @defaultCurrency',
    },
    {
      tcid: '95',
      name: '@express-geo-fr-lu',
      uiExpectation: 'banner',
      path: '/fr/express/?akamaiLocale=lu&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-fr @express-geo-french-lu @defaultCurrency',
    },
    {
      tcid: '96',
      name: '@express-geo-de-at',
      uiExpectation: 'banner',
      path: '/de/express/?akamaiLocale=at&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-de @express-geo-german-at @defaultCurrency',
    },
    {
      tcid: '97',
      name: '@express-geo-de-de',
      uiExpectation: 'banner',
      path: '/de/express/?akamaiLocale=de&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-de @express-geo-german-de @defaultCurrency @smoke',
    },
    {
      tcid: '98',
      name: '@express-geo-de-lu',
      uiExpectation: 'banner',
      path: '/de/express/?akamaiLocale=lu&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-de @express-geo-german-lu @defaultCurrency',
    },
    {
      tcid: '99',
      name: '@express-geo-de-ch',
      uiExpectation: 'banner',
      path: '/de/express/?akamaiLocale=ch&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-de @express-geo-german-ch @defaultCurrency',
    },
    {
      tcid: '100',
      name: '@express-geo-ja-jp',
      uiExpectation: 'banner',
      path: '/jp/express/?akamaiLocale=jp&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-ja @express-geo-japanese-jp @defaultCurrency @smoke',
    },
    {
      tcid: '101',
      name: '@express-geo-es-ar',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=ar&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-ar @defaultCurrency',
    },
    {
      tcid: '102',
      name: '@express-geo-es-cl',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=cl&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-cl @defaultCurrency',
    },
    {
      tcid: '103',
      name: '@express-geo-es-co',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=co&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-co @defaultCurrency',
    },
    {
      tcid: '104',
      name: '@express-geo-es-cr',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=cr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-cr @defaultCurrency',
    },
    {
      tcid: '105',
      name: '@express-geo-es-ec',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=ec&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-ec @defaultCurrency',
    },
    {
      tcid: '106',
      name: '@express-geo-es-es',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=es&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-es @defaultCurrency @smoke',
    },
    {
      tcid: '107',
      name: '@express-geo-es-gt',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=gt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-gt @defaultCurrency',
    },
    {
      tcid: '108',
      name: '@express-geo-es-mx',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=mx&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-mx @defaultCurrency',
    },
    {
      tcid: '109',
      name: '@express-geo-es-pe',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=pe&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-pe @defaultCurrency',
    },
    {
      tcid: '110',
      name: '@express-geo-es-us',
      uiExpectation: 'banner',
      path: '/es/express/?akamaiLocale=us&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-es @express-geo-spanish-us @defaultCurrency',
    },
    {
      tcid: '111',
      name: '@express-geo-kr-kr',
      uiExpectation: 'none',
      path: '/kr/express/?akamaiLocale=kr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-kr @express-geo-korean-kr @defaultCurrency @smoke',
    },
    {
      tcid: '112',
      name: '@express-geo-it-it',
      uiExpectation: 'banner',
      path: '/it/express/?akamaiLocale=it&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-it @express-geo-italian-it @defaultCurrency',
    },
    {
      tcid: '113',
      name: '@express-geo-it-ch',
      uiExpectation: 'banner',
      path: '/it/express/?akamaiLocale=ch&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-it @express-geo-italian-ch @defaultCurrency',
    },
    {
      tcid: '114',
      name: '@express-geo-pt-br',
      uiExpectation: 'banner',
      path: '/br/express/?akamaiLocale=br&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-pt @express-geo-portuguese-br @defaultCurrency @smoke',
    },
    {
      tcid: '115',
      name: '@express-geo-pt-pt',
      uiExpectation: 'banner',
      path: '/br/express/?akamaiLocale=pt&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-pt @express-geo-portuguese-pt @defaultCurrency',
    },
    {
      tcid: '116',
      name: '@express-geo-nl-be',
      uiExpectation: 'banner',
      path: '/nl/express/?akamaiLocale=be&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-nl @express-geo-dutch-be @defaultCurrency @smoke',
    },
    {
      tcid: '117',
      name: '@express-geo-nl-nl',
      uiExpectation: 'banner',
      path: '/nl/express/?akamaiLocale=nl&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-nl @express-geo-dutch-nl @defaultCurrency',
    },
    {
      tcid: '118',
      name: '@express-geo-zh-hk',
      uiExpectation: 'banner',
      path: '/tw/express/?akamaiLocale=hk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-zh-hk @express-geo-chinese-hk @defaultCurrency @smoke',
    },
    {
      tcid: '119',
      name: '@express-geo-tw-tw',
      uiExpectation: 'banner',
      path: '/tw/express/?akamaiLocale=tw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-zh-hk @express-geo-chinese-tw @defaultCurrency',
    },
    {
      tcid: '120',
      name: '@express-geo-tw-us',
      uiExpectation: 'banner',
      path: '/tw/express/?akamaiLocale=us&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-zh-hk @express-geo-chinese-tw @defaultCurrency',
    },

    {
      tcid: '121',
      name: '@express-geo-cn-hk',
      uiExpectation: 'banner',
      path: '/cn/express/?akamaiLocale=hk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-zh-cn @express-geo-chinese-cn @defaultCurrency',
    },
    {
      tcid: '122',
      name: '@express-geo-cn-tw',
      uiExpectation: 'banner',
      path: '/cn/express/?akamaiLocale=tw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-zh-cn @express-geo-chinese-cn @defaultCurrency',
    },
    {
      tcid: '123',
      name: '@express-geo-cn-us',
      uiExpectation: 'banner',
      path: '/cn/express/?akamaiLocale=us&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-zh-cn @express-geo-chinese-cn @defaultCurrency @smoke',
    },

    {
      tcid: '124',
      name: '@express-geo-dk-dk',
      uiExpectation: 'banner',
      path: '/dk/express/?akamaiLocale=dk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-none @express-geo-language-da @express-geo-danish-dk @defaultCurrency',
    },
    {
      tcid: '125',
      name: '@express-geo-fi-fi',
      uiExpectation: 'banner',
      path: '/fi/express/?akamaiLocale=fi&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-fi @express-geo-finnish-fi @defaultCurrency',
    },
    {
      tcid: '126',
      name: '@express-geo-no-no',
      uiExpectation: 'banner',
      path: '/no/express/?akamaiLocale=no&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-no @express-geo-norwegian-no @defaultCurrency @smoke',
    },
    {
      tcid: '127',
      name: '@express-geo-se-se',
      uiExpectation: 'banner',
      path: '/se/express/?akamaiLocale=se&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-sv @express-geo-swedish-sv @defaultCurrency',
    },
    {
      tcid: '128',
      name: '@express-geo-se-fi',
      uiExpectation: 'banner',
      path: '/se/express/?akamaiLocale=fi&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-sv @express-geo-swedish-sv @defaultCurrency',
    },

    {
      tcid: '129',
      name: '@express-geo-id-id',
      uiExpectation: 'banner',
      path: '/id_id/express/?akamaiLocale=id&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-surface-banner @express-geo-language-id @express-geo-indonesian-id @defaultCurrency @smoke',
    },
];

// ─── Default Currency — Negative / Priority Scenarios ────────────────────────

/**
 * Priority chain for resolving the effective region:
 *   country URL param  >  country cookie  >  akamaiLocale  >  path default
 *
 * Suite TCIDs: **131N1** … **157NB1** (sequential base + **N** + scenario id).
 *
 * N1  : No URL params — region comes from user's real geoIP/VPN (non-deterministic in CI).
 *        ⚠ In local testing geoIP = India → market selector shows INR.
 * N2  : 404 page (unsupported locale) — no market/region selector present at all.
 * N3  : Unsupported prefix → server redirects to US; currency from redirected URL.
 * N4  : akamaiLocale not in US supported regions → falls back to US default (USD).
 * N5  : akamaiLocale not in IT supported regions → falls back to IT default (EUR).
 * N6  : Invalid akamaiLocale → falls back to path's default currency.
 * N7  : Sub-region paths → server rewrites to parent locale; currency from final URL.
 * N8  : Click a different language in selector; currency verified on redirected page.
 * N9  : country param only → country param determines region (no akamaiLocale).
 * N10 : country param + akamaiLocale → country param wins.
 * N11 : country cookie + country param → country param wins over cookie.
 */
const currencyNegativeFeatures = [

  // ── N1: No URL params — geoIP decides region ────────────────────────────────
  {
    tcid: '131N1',
    name: '@currency-geo-ip-no-params-us',
    path: '/express/?mep=off',
    closeModal: true,
    geoIpDriven: true,
    tags: '@express-lingo-geo-suite @currency-negative @currency-geo-ip @smoke',
  },

  // ── N2: 404 page — no market/region selector ────────────────────────────────
  {
    tcid: '132N2',
    name: '@currency-404-gh-ar',
    path: '/gh/express/?akamaiLocale=ar&mep=off',
    skipCurrencyCheck: true,
    tags: '@express-lingo-geo-suite @currency-negative @currency-404 @smoke',
  },

  // ── N3: Unsupported prefix → redirect to US ─────────────────────────────────
  {
    tcid: '133N3',
    name: '@currency-redirect-unsupported-prefix-mena-ar',
    path: '/mena_ar/express/?akamaiLocale=ar&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-redirect @smoke',
  },

  // ── N4–N6: Unsupported / invalid akamaiLocale → path default ────────────────
  {
    tcid: '134N4',
    name: '@currency-us-unsupported-region-tn',
    path: '/express/?akamaiLocale=tn&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-unsupported-region @smoke',
  },
  {
    tcid: '135N5',
    name: '@currency-it-unsupported-region-nl',
    path: '/it/express/?akamaiLocale=nl&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-unsupported-region @smoke',
  },
  {
    tcid: '136N6',
    name: '@currency-id-id-invalid-akamai-xyz',
    path: '/id_id/express/?akamaiLocale=xyz&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-invalid-akamai @smoke',
  },

  // ── N7: Sub-region paths → redirect to parent locale ────────────────────────
  // French sub-regions → /fr/express/
  {
    tcid: '137N7a',
    name: '@currency-subregion-lu-fr',
    path: '/lu_fr/express/?akamaiLocale=lu&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-fr @smoke',
  },
  {
    tcid: '138N7b',
    name: '@currency-subregion-ch-fr',
    path: '/ch_fr/express/?akamaiLocale=ch&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-fr @smoke',
  },
  {
    tcid: '139N7c',
    name: '@currency-subregion-be-fr',
    path: '/be_fr/express/?akamaiLocale=be&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-fr @smoke',
  },
  {
    tcid: '140N7d',
    name: '@currency-subregion-ca-fr',
    path: '/ca_fr/express/?akamaiLocale=ca&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-fr @smoke',
  },
  // Italian sub-regions → /it/express/
  {
    tcid: '141N7e',
    name: '@currency-subregion-ch-it',
    path: '/ch_it/express/?akamaiLocale=ch&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-it @smoke',
  },
  {
    tcid: '142N7f',
    name: '@currency-subregion-sm-it',
    path: '/sm/express/?akamaiLocale=sm&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-it @smoke',
  },
  // German sub-regions → /de/express/
  {
    tcid: '143N7g',
    name: '@currency-subregion-ch-de',
    path: '/ch_de/express/?akamaiLocale=ch&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-de @smoke',
  },
  {
    tcid: '144N7h',
    name: '@currency-subregion-lu-de',
    path: '/lu_de/express/?akamaiLocale=lu&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-de @smoke',
  },
  // Dutch sub-regions → /nl/express/
  {
    tcid: '145N7i',
    name: '@currency-subregion-be-nl',
    path: '/be_nl/express/?akamaiLocale=be&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-nl @smoke',
  },
  {
    tcid: '146N7j',
    name: '@currency-subregion-be-to-nl',
    path: '/be/express/?akamaiLocale=nl&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-nl @smoke',
  },
  // Spanish sub-regions → /es/express/
  {
    tcid: '147N7k',
    name: '@currency-subregion-pe-es',
    path: '/pe/express/?akamaiLocale=es&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-subregion @currency-subregion-es @smoke',
  },

  //AkamaiLOcale is empty
  {
    tcid: '148N',
    name: '@currency-subregion-uy-es',
    path: '/express/?akamaiLocale=&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-akamaiLocale-empty @smoke',
  },

  // ── N8: Click different language — currency verified on redirected page ──────
  // nl/be → click fr; since be is supported in fr, currency = fr + be
  {
    tcid: '149N8',
    name: '@currency-nl-be-click-fr-lang',
    path: '/nl/express/?akamaiLocale=be&mep=off',
    clickLangPrefix: 'fr',
    tags: '@express-lingo-geo-suite @currency-negative @currency-click-lang @smoke',
  }, 

  // ── N9–N11: country param / cookie priority checks ───────────────────────────
  // N9: country param only — no akamaiLocale
  {
    tcid: '150N9',
    name: '@currency-country-param-ae',
    path: '/express/?country=ae&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-country-param @smoke',
  },
  // N10: country param > akamaiLocale — country=ae wins over akamaiLocale=fr
  {
    tcid: '151N10',
    name: '@currency-country-param-over-akamai',
    path: '/express/?akamaiLocale=fr&country=ae&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-country-param @smoke',
  },
  // N11: country param > country cookie — param country=fr wins over pre-set cookie country=ae
  {
    tcid: '152N11',
    name: '@currency-country-param-over-cookie',
    path: '/express/?akamaiLocale=ae&country=fr&mep=off',
    countryCookie: 'ae',
    tags: '@express-lingo-geo-suite @currency-negative @currency-country-param @smoke',
  },

  // ── N12: international cookie does NOT persist for currency across path changes ─
  // Flow: navigate to /nl/be → click fr language → international=fr cookie set,
  // redirect to /fr/express/ → then navigate to /de/express/.
  // Currency must be de path default (EUR). The international cookie only controls
  // language routing, NOT the currency priority chain.
  {
    tcid: '153N12',
    name: '@currency-intl-cookie-change-path-de',
    path: '/nl/express/?akamaiLocale=be&mep=off',
    clickLangPrefix: 'fr',
    thenNavigateTo: '/de/express/?mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-intl-cookie @smoke',
  },

  // ── N13: country cookie persists for currency across path changes ─────────────
  // Flow: navigate to /express/?akamaiLocale=ae → click UAE in market selector →
  // country=ae cookie set, redirect → then navigate to /fr/express/.
  // Currency must be AED (country cookie wins over fr path default).
  {
    tcid: '154N13',
    name: '@currency-country-cookie-persists-fr',
    path: '/express/?akamaiLocale=ae&mep=off',
    clickMarketCode: 'ae',
    thenNavigateTo: '/fr/express/?mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-country-cookie @smoke',
  },
  //No akamaiLocale set but country cookkie is set
  {
    tcid: '154N13b',
    name: '@currency-country-cookie-jp-no-akamai',
    path: '/express/?mep=off',
    countryCookie: 'jp',
    tags: '@express-lingo-geo-suite @currency-negative @currency-country-cookie-no-akamai @smoke',
  },


  // ── N14: akamaiLocale=KR on US path → KRW ────────────────────────────────────
  // akamaiLocale=KR is a valid supported region; currency must resolve to KRW.
  {
    tcid: '155N14',
    name: '@currency-akamai-kr-us-path',
    path: '/express/?akamaiLocale=KR&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-akamai-region @smoke',
  },

  // ── N15: country=BE param on nl path → Belgium currency ──────────────────────
  // country param wins over akamaiLocale; currency must resolve to BE in Dutch locale.
  {
    tcid: '156N15',
    name: '@currency-country-param-be-nl-path',
    path: '/nl/express/?country=BE&mep=off',
    tags: '@express-lingo-geo-suite @currency-negative @currency-country-param @smoke',
  },

  

  // ── NB1: BACOM page — no market/currency selector expected ───────────────────
  // BACOM (business.stage.adobe.com) does not render a market selector; assert it is absent.
  {
    tcid: '157NB1',
    name: '@currency-no-market-selector-bacom',
    path: '/products/brand-concierge.html?mep=off',
    skipCurrencyCheck: true,
    tags: '@express-lingo-geo-suite @bacom @currency-negative @bacom-no-market-selector @smoke',
  },
];

/**
 * PREF-cookie smoke: **18 TCIDs (158P1–175P18)** — `international` = `prefLang` before load.
 * Each row reuses a `features` path where `LingoGeoBannerPage.computeExpectedUi` → `'banner'` (language banner), using live JSON.
 * Preference vs page is matched by `markets.json` language column (`specPrefixToMarketJsonColumn`), not raw prefix equality.
 * `uk` / `in` / `cn`: for these prefs the chosen paths still yield **none** (no banner / no geo modal). Rows still set `international` to exercise the cookie.
 *
 * Flowchart: rows with `uiExpectation: 'banner'` align with scenario **(2)**; `'none'` rows are **(1,3)** or **(1a,3)** once the cookie is applied (same decision tree as `computeExpectedUi`).
 */
const prefCookieBannerFeatures = [
    {
      tcid: '158P1',
      name: '@express-geo-fr-be @pref-intl-us',
      uiExpectation: 'banner',
      path: '/fr/express/?akamaiLocale=be&mep=off',
      prefLangCookie: '',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-us @express-geo-surface-banner @smoke',
    },
    //Since for UK and IN the prefLang=PageLang there is no banner possibility with cookie set. 
   /* {
      tcid: '159P2',
      name: '@express-geo-pref-intl-uk @pref-intl-uk',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=be&mep=off',
      prefLangCookie: 'uk',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @express-geo-pref-lang-uk @express-geo-surface-none',
    },
    {
      tcid: '160P3',
      name: '@express-geo-pref-intl-in @pref-intl-in',
      uiExpectation: 'none',
      path: '/express/?akamaiLocale=it&mep=off',
      prefLangCookie: 'in',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @express-geo-pref-lang-in @express-geo-surface-none',
    },*/
    {
      tcid: '161P4',
      name: '@express-geo-us-be @pref-intl-fr',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=be&mep=off',
      prefLangCookie: 'fr',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency  @express-geo-pref-lang-fr @express-geo-surface-banner @smoke',
    },
    {
      tcid: '162P5',
      name: '@express-geo-us-at @pref-intl-de',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=at&mep=off',
      prefLangCookie: 'de',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-de @express-geo-surface-banner',
    },
    {
      tcid: '163P6',
      name: '@express-geo-us-jp @pref-intl-jp',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=jp&mep=off',
      prefLangCookie: 'jp',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-jp @express-geo-surface-banner',
    },
    {
      tcid: '164P7',
      name: '@express-geo-us-ar @pref-intl-es',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=ar&mep=off',
      prefLangCookie: 'es',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-es @express-geo-surface-banner',
    },
    //Since kr is not supported in US , Kr banner is not seen
    /*{
      tcid: '165P8',
      name: '@express-geo-us-kr @pref-intl-kr',
      uiExpectation: 'modal',
      path: '/express/?akamaiLocale=kr&mep=off',
      prefLangCookie: 'kr',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-kr @express-geo-surface-none @smoke',
    },*/
    {
      tcid: '166P9',
      name: '@express-geo-us-ch @pref-intl-it',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=ch&mep=off',
      prefLangCookie: 'it',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-it @express-geo-surface-banner @smoke',
    },
    {
      tcid: '167P10',
      name: '@express-geo-us-br @pref-intl-br',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=br&mep=off',
      prefLangCookie: 'br',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-br @express-geo-surface-banner',
    },
    {
      tcid: '168P11',
      name: '@express-geo-us-be @pref-intl-nl',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=be&mep=off',
      prefLangCookie: 'nl',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-nl @express-geo-surface-banner',
    },
    {
      tcid: '169P12',
      name: '@express-geo-us-hk @pref-intl-tw',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=hk&mep=off',
      prefLangCookie: 'tw',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-tw @express-geo-surface-banner',
    },
    {
      tcid: '170P13',
      name: '@express-geo-pref-intl-cn @pref-intl-cn',
      uiExpectation: 'none',
      path: '/fr/express/?akamaiLocale=be&mep=off',
      prefLangCookie: 'cn',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-cn @express-geo-surface-none @smoke',
    },
    {
      tcid: '171P14',
      name: '@express-geo-us-dk @pref-intl-dk',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=dk&mep=off',
      prefLangCookie: 'dk',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency @express-geo-pref-lang-dk @express-geo-surface-banner',
    },
    {
      tcid: '172P15',
      name: '@express-geo-us-fi @pref-intl-fi',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=fi&mep=off',
      prefLangCookie: 'fi',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency  @express-geo-pref-lang-fi @express-geo-surface-banner',
    },
    {
      tcid: '173P16',
      name: '@express-geo-us-no @pref-intl-no',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=no&mep=off',
      prefLangCookie: 'no',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency  @express-geo-pref-lang-no @express-geo-surface-banner @smoke',
    },
    {
      tcid: '174P17',
      name: '@express-geo-us-se @pref-intl-se',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=se&mep=off',
      prefLangCookie: 'se',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency  @express-geo-pref-lang-se @express-geo-surface-banner',
    },
    {
      tcid: '175P18',
      name: '@express-geo-us-id @pref-intl-id_id',
      uiExpectation: 'banner',
      path: '/express/?akamaiLocale=id&mep=off',
      prefLangCookie: 'id_id',
      tags:
        '@express-lingo-geo-suite @express-geo-pref-banner @defaultCurrency  @express-geo-pref-lang-id_id @express-geo-surface-banner',
    },
];

/**
 * Modal smoke: **18 TCIDs (176M1–193M18)** — geo modal (no `international` cookie in this suite). Flowchart → `modal` (default PREF = us, BACOM false); verified by
 * `node scripts/verify-lingo-geo-banner-spec.mjs --verify-modal`.
 *
 * | TCID | prefix (empty = US) | region | Notes |
 * |------|------------------------|--------|--------|
 * | 176M1 | (empty) | cn | Root EN + China geo; `skipIntegration` — geo modal unreliable on stage for this URL |
 * | 177M2 | uk | in | |
 * | 178M3 | in | jp | English IN site + JP geo (India locale uses `jp` probe) |
 * | 179M4–187M12 | fr, de, jp, es, kr, it, br, nl, tw | in | |
 * | 188M13 | cn | jp | |
 * | 189M14–193M18 | dk, fi, no, se, id_id | in | |
 *
 * Geo probes use `akamaiLocale=in` where India is outside that locale’s supported list; single-market
 * locales `in` / `cn` use `jp` where noted. Paths are path-only (`/{locale}/express/?akamaiLocale={region}`; US home `/express/?akamaiLocale=…`); tests resolve stage/prod.
 *
 * Flowchart: ACOM **(4,4a,4b)** and **(5)** → `modal` (BACOM would be banner for the same tree). `skipIntegration` on **176M1** when stage is flaky.
 */
const modalFeatures = [
    {
      tcid: '176M1',
      name: '@express-geo-modal-us-kr',
      uiExpectation: 'modal',
      path: '/express/?akamaiLocale=kr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-us @smoke',
    },
    //scenario 4a in flow chart
    {
      tcid: '177M2',
      name: '@express-geo-modal-uk-in',
      uiExpectation: 'modal',
      path: '/uk/express/?akamaiLocale=in&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-uk',
    },
    {
      tcid: '178M3',
      name: '@express-geo-modal-in-jp',
      uiExpectation: 'modal',
      path: '/in/express/?akamaiLocale=jp&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-in',
    },
    {
      tcid: '179M4',
      name: '@express-geo-modal-fr-kr',
      uiExpectation: 'modal',
      path: '/fr/express/?akamaiLocale=kr&mep=off',
      prefLangCookie: 'kr',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-fr @smoke',
    },
    {
      tcid: '180M5',
      name: '@express-geo-modal-de-it',
      uiExpectation: 'modal',
      path: '/de/express/?akamaiLocale=it&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-de',
    },
    {
      tcid: '181M6',
      name: '@express-geo-modal-jp-fr',
      uiExpectation: 'modal',
      path: '/jp/express/?akamaiLocale=fr&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-jp',
    },
    {
      tcid: '182M7',
      name: '@express-geo-modal-es-id',
      uiExpectation: 'modal',
      path: '/es/express/?akamaiLocale=id&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-es @smoke',
    },
    {
      tcid: '183M8',
      name: '@express-geo-modal-kr-fi',
      uiExpectation: 'modal',
      path: '/kr/express/?akamaiLocale=fi&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-kr',
    },
    {
      tcid: '184M9',
      name: '@express-geo-modal-it-br',
      uiExpectation: 'modal',
      path: '/it/express/?akamaiLocale=br&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-it',
    },
    {
      tcid: '185M10',
      name: '@express-geo-modal-br-dk',
      uiExpectation: 'modal',
      path: '/br/express/?akamaiLocale=dk&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-br',
    },
    {
      tcid: '186M11',
      name: '@express-geo-modal-nl-in',
      uiExpectation: 'modal',
      path: '/nl/express/?akamaiLocale=in&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-nl @smoke',
    },
    {
      tcid: '187M12',
      name: '@express-geo-modal-tw-es',
      uiExpectation: 'modal',
      path: '/tw/express/?akamaiLocale=es&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-tw',
    },
    {
      tcid: '188M13',
      name: '@express-geo-modal-cn-jp',
      uiExpectation: 'modal',
      path: '/cn/express/?akamaiLocale=jp&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-cn',
    },
    {
      tcid: '189M14',
      name: '@express-geo-modal-dk-no',
      uiExpectation: 'modal',
      prefLangCookie:'no',
      path: '/dk/express/?akamaiLocale=no&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-dk @smoke',
    },
    {
      tcid: '190M15',
      name: '@express-geo-modal-fi-in',
      uiExpectation: 'modal',
      prefLangCookie: 'in',
      path: '/fi/express/?akamaiLocale=in&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-fi',
    },
    {
      tcid: '191M16',
      name: '@express-geo-modal-no-se',
      uiExpectation: 'modal',
      path: '/no/express/?akamaiLocale=se&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-no',
    },
    {
      tcid: '192M17',
      name: '@express-geo-modal-se-tw',
      uiExpectation: 'modal',
      path: '/se/express/?akamaiLocale=tw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-se @smoke',
    },
    {
      tcid: '193M18',
      name: '@express-geo-modal-id_id-gb',
      uiExpectation: 'modal',
      path: '/id_id/express/?akamaiLocale=gb&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-lang-id_id',
    },
    {
      tcid: '193M19',
      name: '@express-geo-modal-ZhLang',
      uiExpectation: 'modal',
      prefLangCookie:'tw',
      path: '/se/express/?akamaiLocale=tw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-modal @express-geo-surface-modal @express-geo-modal-Zh-lang @smoke',
    },
];

/**
 * ACOM scenario **5** — Site & GeoIP NOT supported; PREF-LANG & GeoIP NOT supported;
 * GeoIP IS in the supported market → modal shows ALL language options for that GeoIP,
 * ordered by  in supported-markets-express.json.
 *
 * Conditions:  cookie IS set, prefLang does NOT support geoIp, page does NOT support geoIp.
 *
 * | tcid | page | geoIp | prefLang | regionPriorities buttons (in order) |
 * |------|------|-------|----------|-------------------------------------|
 * | 194S1 | /jp  | lu    | kr       | /fr (1), /de (2), / (3)             |
 * | 195S2 | /jp  | ch    | kr       | /de (1), /fr (2), /it (3)           |
 * | 196S3 | /jp  | be    | kr       | / (1), /fr (2), /nl (3)             |
 * | 197S4 | /jp  | ca    | kr       | / (1), /fr (2)                      |
 * | 198S5 | /kr  | us    | fr       | KR site + US geo (see tags `@express-geo-scenario5-us`) |
 */
const scenario5RegionalPrioritiesFeatures = [
    {
      tcid: '194S1',
      name: '@express-geo-scenario5-jp-lu',
      prefLangCookie: 'kr',
      uiExpectation: 'modal',
      path: '/jp/express/?akamaiLocale=lu&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-scenario5 @express-geo-surface-modal @express-geo-scenario5-lu @smoke',
    },
    {
      tcid: '195S2',
      name: '@express-geo-scenario5-jp-ch',
      prefLangCookie: 'kr',
      uiExpectation: 'modal',
      path: '/jp/express/?akamaiLocale=ch&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-scenario5 @express-geo-surface-modal @express-geo-scenario5-ch',
    },
    {
      tcid: '196S3',
      name: '@express-geo-scenario5-jp-be',
      prefLangCookie: 'kr',
      uiExpectation: 'modal',
      path: '/jp/express/?akamaiLocale=be&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-scenario5 @express-geo-surface-modal @express-geo-scenario5-be',
    },
    {
      tcid: '197S4',
      name: '@express-geo-scenario5-jp-ca',
      prefLangCookie: 'kr',
      uiExpectation: 'modal',
      path: '/jp/express/?akamaiLocale=ca&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-scenario5 @express-geo-surface-modal @express-geo-scenario5-ca @smoke',
    },
    {
      tcid: '198S5',
      name: '@express-geo-scenario5-kr-us',
      prefLangCookie: 'fr',
      uiExpectation: 'modal',
      path: '/kr/express/?akamaiLocale=us&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-scenario5 @express-geo-surface-modal @express-geo-scenario5-us @smoke',
    },
    {
      tcid: '199S6',
      name: '@express-geo-scenario5-jp-tw',
      prefLangCookie: 'kr',
      uiExpectation: 'modal',
      path: '/jp/express/?akamaiLocale=tw&mep=off',
      tags: '@express-lingo-geo-suite @express-geo-scenario5 @express-geo-surface-modal @express-geo-scenario5-tw @smoke',
    },
];


/**
 * BACOM (`business.stage.adobe.com`) geo scenarios — isBacom:true routes through
 * the BACOM branch of computeExpectedUi (banner instead of modal for scenarios 4/5).
 * Uses supported-markets-bacom.json, not the Express JSON.
 *
 * B3 — Scenario 3 (No Action):
 *   PREF=CA, Site=/fr, GeoIP=FR.
 *   Page+GeoIP IS a supported combo (FR in FR row) but PREF(CA)+GeoIP is NOT → no action.
 *
 * B5 — Scenario 5 (Banner):
 *   PREF=LU, Site=/jp, GeoIP=JP.
 *   Page+GeoIP NOT supported (JP site doesn’t serve JP geo in BACOM JSON),
 *   GeoIP IS supported elsewhere → banner, recommendation=/fr (LU → FR row).
 */
const bacomFeatures = [
    {
      tcid: '199B3',
      name: '@bacom-geo-fr-ca-none',
      uiExpectation: 'none',
      isBacom: true,
      prefLangCookie: 'ca',
      path: '/fr/products/brand-concierge.html?akamaiLocale=fr&mep=off',
      tags: '@express-lingo-geo-suite @bacom @bacom-geo-surface-none @smoke',
    },
    {
      tcid: '200B5',
      name: '@bacom-geo-jp-kr-banner',
      uiExpectation: 'banner',
      isBacom: true,
      prefLangCookie: 'lu',
      path: '/kr/products/brand-concierge.html?akamaiLocale=jp&mep=off',
      tags: '@express-lingo-geo-suite @bacom @bacom-geo-surface-banner @smoke',
    },
];

const scenario6UnsupportedGeoFeatures = [
    {
      tcid: '201S6',
      name: '@express-geo-scenario-6-fr-fj',
      uiExpectation: 'none',
      path: '/fr/express/?akamaiLocale=fj&mep=off',
      verifyGeoIpNotInSupportedMarketsJson: true,
      tags:
        '@express-lingo-geo-suite @express-geo-surface-none @express-geo-scenario-6 @express-geo-geoip-not-in-json @express-geo-language-fr @express-geo-french-fj @smoke',
    },
];



/**
 * Footer selector search placeholders — mirrors **modalFeatures** URLs + `mep=off`.
 */
const searchFeatures = [
    { tcid: '202SR1', name: '@express-geo-search-us-jo', path: '/express/?akamaiLocale=jo&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search @smoke' },
    { tcid: '202SR2', name: '@express-geo-search-uk-gb', path: '/uk/express/?akamaiLocale=gb&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR3', name: '@express-geo-search-in-in', path: '/in/express/?akamaiLocale=in&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR4', name: '@express-geo-search-fr-fr', path: '/fr/express/?akamaiLocale=fr&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search @smoke' },
    { tcid: '202SR5', name: '@express-geo-search-de-de', path: '/de/express/?akamaiLocale=de&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR6', name: '@express-geo-search-jp-jp', path: '/jp/express/?akamaiLocale=jp&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR7', name: '@express-geo-search-es-es', path: '/es/express/?akamaiLocale=es&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search @smoke' },
    { tcid: '202SR8', name: '@express-geo-search-kr-kr', path: '/kr/express/?akamaiLocale=kr&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR9', name: '@express-geo-search-it-it', path: '/it/express/?akamaiLocale=it&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR10', name: '@express-geo-search-br-br', path: '/br/express/?akamaiLocale=br&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR11', name: '@express-geo-search-nl-nl', path: '/nl/express/?akamaiLocale=nl&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search @smoke' },
    { tcid: '202SR12', name: '@express-geo-search-tw-tw', path: '/tw/express/?akamaiLocale=tw&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR13', name: '@express-geo-search-cn-us', path: '/cn/express/?akamaiLocale=us&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR14', name: '@express-geo-search-dk-dk', path: '/dk/express/?akamaiLocale=dk&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search @smoke' },
    { tcid: '202SR15', name: '@express-geo-search-fi-fi', path: '/fi/express/?akamaiLocale=fi&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR16', name: '@express-geo-search-no-no', path: '/no/express/?akamaiLocale=no&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR17', name: '@express-geo-search-se-se', path: '/se/express/?akamaiLocale=se&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
    { tcid: '202SR18', name: '@express-geo-search-id_id-id', path: '/id_id/express/?akamaiLocale=id&mep=off&languageBanner=off', tags: '@express-lingo-geo-suite @search' },
];

/**
 * ── Playground / Custom Test ─────────────────────────────────────────────
 * Fill in the fields you need, leave the rest as-is.
 * Run with: npx playwright test --config=playwright.express.config.js --grep "@custom"
 *
 * The test auto-routes based on what is set:
 *   • path is required — test is skipped when empty
 *   • prefLangCookie  → sets `international` cookie before load
 *   • countryCookie   → sets `country` cookie before navigation (negative scenario priority)
 *   • uiExpectation   → optional cross-check against flowchart ('none'|'banner'|'modal')
 *                        leave empty to trust the flowchart result
 *   • Default currency is always asserted after the UI check (skipped automatically for BACOM URLs)
 *   • BACOM is auto-detected from the URL — no isBacom field needed
 */
const customFeature = {
  tcid: 'C1',
  name: '@custom-playground',
  path: 'https://www.stage.adobe.com/in/express/?akamaiLocale=fr',               // required — leave empty to skip // add with akamaiLocale
  uiExpectation: 'none',      // optional: 'none' | 'banner' | 'modal'
  prefLangCookie: 'kr',     // sets `international` cookie before load
  countryCookie: 'ch',      // sets `country` cookie before navigation
  tags: '@custom',
};

module.exports = {
  name: 'express-lingo-geo-banner',
  jsonSnapshotFeature,
  selectorContentsFeatures,
  features,
  currencyNegativeFeatures,
  prefCookieBannerFeatures,
  modalFeatures,
  scenario5RegionalPrioritiesFeatures,
  bacomFeatures,
  scenario6UnsupportedGeoFeatures,
  searchFeatures,
  customFeature,
};


