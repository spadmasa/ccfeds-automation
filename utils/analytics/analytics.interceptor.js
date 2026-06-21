// Intercepts Adobe AEP Web SDK collect calls fired from the nav.
// Usage: call start() in beforeEach, stop() in afterEach.

export class AnalyticsInterceptor {
  constructor(page) {
    this.page = page;
    this._handler = null;
  }

  start() {
    this._handler = (route) => route.fulfill({ status: 200, body: '' });
    this.page.route(/\/collect\?.*configId=/, this._handler);
  }

  stop() {
    if (this._handler) {
      this.page.unroute(/\/collect\?.*configId=/, this._handler).catch(() => {});
      this._handler = null;
    }
  }
}

// Pre-set OneTrust consent cookies so analytics fires without the cookie banner blocking it.
// Call this before page.goto() so the cookies are present on the first request.
export async function setConsentCookies(page, domain) {
  const consentValue = [
    'isGpcEnabled=0',
    'datestamp=Mon+Jan+01+2024',
    'version=202209.1.0',
    'isIABGlobal=false',
    'hosts=',
    'consentId=automation',
    'interactionCount=2',
    'landingPath=NotLandingPage',
    'groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1',
    'AwaitingReconsent=false',
  ].join('&');

  await page.context().addCookies([
    { name: 'OptanonConsent',        value: consentValue,             domain: `.${domain}`, path: '/', secure: true },
    { name: 'OptanonAlertBoxClosed', value: new Date().toISOString(), domain: `.${domain}`, path: '/', secure: true },
  ]);
}
