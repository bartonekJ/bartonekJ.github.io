const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const siteRoot = path.resolve(__dirname, '..');
const previewDir = path.resolve(__dirname, '../_preview');

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function startServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const filePath = path.resolve(siteRoot, `.${relativePath}`);
      if (!filePath.startsWith(`${siteRoot}${path.sep}`)) throw new Error('Invalid path');
      const body = await fs.readFile(filePath);
      response.writeHead(200, { 'content-type': contentType(filePath) });
      response.end(body);
    } catch (error) {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

(async () => {
  const { server, baseUrl } = await startServer();
  const browserCandidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  const executablePath = browserCandidates.find(existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.route('https://www.googletagmanager.com/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });

    await page.goto(`${baseUrl}/jb-drill/download/`);
    const banner = page.locator('.measurement-consent');
    await assert.doesNotReject(() => banner.waitFor({ state: 'visible' }));

    const initialCommands = await page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)));
    assert.equal(initialCommands[0][0], 'consent');
    assert.equal(initialCommands[0][1], 'default');
    assert.equal(initialCommands[0][2].ad_storage, 'denied');
    assert(initialCommands.some((entry) => entry[0] === 'config' && entry[1] === 'AW-18439118692'));

    const microsoftStoreLink = page.locator('[data-ms-store-link]');
    const microsoftWebFallback = page.locator('[data-ms-store-web-fallback]');
    assert.equal(await microsoftStoreLink.getAttribute('href'), 'ms-windows-store://pdp/?ProductId=9NFF5QHLBM3B');
    assert.equal(await microsoftStoreLink.getAttribute('target'), null);
    assert.equal(await microsoftWebFallback.isVisible(), true);
    assert.equal(await microsoftWebFallback.getAttribute('href'), 'https://apps.microsoft.com/detail/9NFF5QHLBM3B?cid=bybartonek');

    await page.evaluate(() => {
      const link = document.querySelector('[data-google-ads-conversion="store-outbound"]');
      link.addEventListener('click', (event) => event.preventDefault(), { once: true });
      link.click();
    });
    const { conversion, callbackType } = await page.evaluate(() => {
      const entry = window.dataLayer.map((item) => Array.from(item)).find((item) => item[0] === 'event' && item[1] === 'conversion');
      return { conversion: entry, callbackType: typeof entry[2].event_callback };
    });
    assert.equal(conversion[2].send_to, 'AW-18439118692/Uw6hCNDh5YwdEOS-uthE');
    assert.equal(conversion[2].currency, 'CZK');
    assert.equal(callbackType, 'function');

    const conversionCountBeforeStoreChecks = await page.evaluate(() => window.dataLayer
      .map((item) => Array.from(item))
      .filter((item) => item[0] === 'event' && item[1] === 'conversion').length);
    await page.evaluate(() => {
      const links = [
        document.querySelector('[data-ms-store-link]'),
        document.querySelector('[data-ms-store-web-fallback]')
      ];
      for (const link of links) {
        link.addEventListener('click', (event) => event.preventDefault(), { once: true });
        link.click();
      }
    });
    const storeConversions = await page.evaluate(() => window.dataLayer
      .map((item) => Array.from(item))
      .filter((item) => item[0] === 'event' && item[1] === 'conversion'));
    assert.equal(storeConversions.length, conversionCountBeforeStoreChecks + 2);
    assert(storeConversions.slice(-2).every((entry) => entry[2].send_to === 'AW-18439118692/Uw6hCNDh5YwdEOS-uthE'));

    await page.locator('[data-google-ads-consent="granted"]').click();
    assert.equal(await banner.isHidden(), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('bybartonek-google-ads-consent')), 'granted');

    await page.reload();
    assert.equal(await banner.isHidden(), true);
    const reloadedCommands = await page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)));
    assert(reloadedCommands.some((entry) => entry[0] === 'consent' && entry[1] === 'update' && entry[2].ad_storage === 'granted'));

    await page.locator('[data-google-ads-consent-settings]').click();
    await assert.doesNotReject(() => banner.waitFor({ state: 'visible' }));
    await page.screenshot({ path: path.join(previewDir, 'google-ads-consent-desktop.png'), fullPage: true });

    await page.evaluate(() => localStorage.clear());
    await page.goto(`${baseUrl}/jb-drill/`);
    const overviewBanner = page.locator('.measurement-consent');
    await assert.doesNotReject(() => overviewBanner.waitFor({ state: 'visible' }));
    assert.equal(await page.locator('[data-google-ads-consent-settings]').count(), 1);
    assert.equal(await page.locator('[data-google-ads-conversion="store-outbound"]').count(), 0);
    const overviewCommands = await page.evaluate(() => window.dataLayer.map((entry) => Array.from(entry)));
    assert(overviewCommands.some((entry) => entry[0] === 'config' && entry[1] === 'AW-18439118692'));

    const updatesTemplate = await fs.readFile(path.join(siteRoot, '_includes', 'updates-document.html'), 'utf8');
    assert(updatesTemplate.includes("gtag('config', 'AW-18439118692')"));
    assert(updatesTemplate.includes("'/google-ads.js?v=20261001-2'"));

    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 390, height: 844 });
    await mobile.goto(`${baseUrl}/jb-drill/download/`);
    await mobile.screenshot({ path: path.join(previewDir, 'store-links-windows-mobile.png'), fullPage: false });
    await mobile.locator('[data-google-ads-consent-settings]').click();
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await mobile.screenshot({ path: path.join(previewDir, 'google-ads-consent-mobile.png'), fullPage: false });

    await page.goto(`${baseUrl}/privacy/#advertising-measurement`);
    assert.equal(await page.locator('#advertising-measurement').count(), 1);

    const nonWindowsContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36'
    });
    await nonWindowsContext.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgentData', {
        configurable: true,
        value: { platform: 'Android' }
      });
    });
    const nonWindowsPage = await nonWindowsContext.newPage();
    await nonWindowsPage.route('https://www.googletagmanager.com/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });
    await nonWindowsPage.goto(`${baseUrl}/jb-drill/download/`);
    assert.equal(await nonWindowsPage.locator('[data-ms-store-link]').getAttribute('href'), 'https://apps.microsoft.com/detail/9NFF5QHLBM3B?cid=bybartonek');
    assert.equal(await nonWindowsPage.locator('[data-ms-store-link]').getAttribute('target'), '_blank');
    assert.equal(await nonWindowsPage.locator('[data-ms-store-web-fallback]').isHidden(), true);
    await nonWindowsPage.screenshot({ path: path.join(previewDir, 'store-links-android-mobile.png'), fullPage: false });
    await nonWindowsContext.close();

    assert.deepEqual(consoleErrors, []);
    console.log('PASS Google Ads tag and store links: campaign pages, consent, outbound conversion, Windows Store app launch, web fallback and responsive banner');
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
