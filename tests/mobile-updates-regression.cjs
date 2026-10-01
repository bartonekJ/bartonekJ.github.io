const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const siteRoot = path.resolve(__dirname, '..');
const previewDir = path.resolve(siteRoot, '_preview');

const cards = Array.from({ length: 5 }, (_, index) => `
  <a class="home-update-card${index ? ' home-update-card--text' : ''}" href="#update-${index + 1}">
    <div class="home-update-copy">
      <span class="home-update-meta"><b>JB_Drill</b><span>Feature</span><time>Oct ${index + 1}</time></span>
      <h3>${index === 0 ? 'A practical hockey workflow on every screen' : `Update number ${index + 1}`}</h3>
      <p>${index === 0 ? 'A longer summary verifies that mobile cards can grow and wrap without clipping their content.' : 'A compact update summary for carousel layout verification.'}</p>
      <span class="home-update-link">Read update <span aria-hidden="true">→</span></span>
    </div>
    ${index === 0 ? '<img src="/assets/updates/jbdrillheroart500x250.jpg" alt="" width="640" height="360">' : ''}
  </a>`).join('');

const dots = Array.from({ length: 5 }, (_, index) =>
  `<button type="button" data-updates-dot="${index}" aria-label="Show update ${index + 1}"${index === 0 ? ' aria-current="true"' : ''}></button>`
).join('');

const carouselFixture = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="/styles.css?v=test">
</head><body>
  <main><section class="hero hero--with-updates" aria-labelledby="hero-title">
    <div class="hero-copy"><p class="eyebrow">SPORTS TECHNOLOGY</p><h1 id="hero-title"><span class="heading-light">Tools that make</span><br><span class="heading-accent">good work flow.</span></h1><p class="hero-lead">A real homepage-sized introduction.</p></div>
    <div class="hero-visual" aria-hidden="true"></div>
    <section class="home-updates is-carousel" aria-labelledby="latest-updates-title" data-updates-carousel data-update-count="5">
      <div class="home-updates-heading"><p class="eyebrow">WHAT'S NEW</p><h2 id="latest-updates-title">Latest from byBartonek</h2>
        <div class="home-updates-controls"><button type="button" data-updates-previous aria-label="Previous update">←</button><div class="home-updates-dots" aria-label="Select update">${dots}</div><button type="button" data-updates-next aria-label="Next update">→</button></div>
      </div>
      <div class="home-updates-rail"><div class="home-updates-viewport"><div class="home-updates-track">${cards}</div></div></div>
    </section>
  </section></main>
  <script src="/updates-carousel.js?v=test"></script>
</body></html>`;

const tableFixture = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="/updates.css?v=test">
  <style>@media (max-width: 900px) { .fixture-list { display: none; } }</style>
</head><body class="docs-body updates-body">
  <main><div class="updates-layout"><aside class="updates-list-panel fixture-list" aria-hidden="true"></aside><article class="update-article"><div class="update-prose">
    <h2>CMS table preview</h2>
    <table>
      <thead><tr><th>Feature</th><th>Android tablet</th><th>Windows desktop</th><th>Additional notes</th></tr></thead>
      <tbody>
        <tr><td>Formation animation workflow</td><td>Touch-first editing with pressure-sensitive drawing</td><td>Mouse and keyboard editing</td><td>Long descriptions must wrap vertically instead of widening the table.</td></tr>
        <tr><td>Documentation</td><td colspan="2"><a href="https://bybartonek.com/jb-drill/features/formation-animation-workflow">https://bybartonek.com/jb-drill/features/formation-animation-workflow</a></td><td>Available on both platforms.</td></tr>
      </tbody>
    </table>
  </div></article></div></main>
  <script src="/updates-content.js?v=test"></script>
</body></html>`;

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.ttf')) return 'font/ttf';
  return 'application/octet-stream';
}

async function startServer() {
  const server = http.createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname === '/carousel-fixture/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(carouselFixture);
      return;
    }
    if (pathname === '/table-fixture/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(tableFixture);
      return;
    }
    try {
      const filePath = path.resolve(siteRoot, `.${pathname}`);
      if (!filePath.startsWith(`${siteRoot}${path.sep}`)) throw new Error('Invalid path');
      const body = await fs.readFile(filePath);
      response.writeHead(200, { 'content-type': contentType(filePath) });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

async function verifyCarousel(browser, baseUrl, viewport, screenshotName) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`${baseUrl}/carousel-fixture/`);
  await page.waitForFunction(() => document.querySelectorAll('.home-updates-track > .home-update-card').length > 5);

  const mobile = viewport.width <= 760;
  assert.equal(await page.locator('.home-updates').evaluate((element) => getComputedStyle(element).display !== 'none'), true);
  assert.equal(await page.locator('.home-updates-track > .home-update-card:not([aria-hidden])').count(), mobile ? 1 : 3);
  assert.equal(await noHorizontalOverflow(page), true);

  if (mobile) {
    const controlSizes = await page.locator('.home-updates-controls > button').evaluateAll((buttons) =>
      buttons.map((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height }))
    );
    assert(controlSizes.every(({ width, height }) => width >= 44 && height >= 44));
    await page.screenshot({ path: path.join(previewDir, screenshotName), fullPage: true });
    await page.locator('[data-updates-next]').click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator('[data-updates-dot="1"]').getAttribute('aria-current'), 'true');
    assert.equal(await page.locator('.home-updates-track > .home-update-card:not([aria-hidden])').count(), 1);
  }

  if (!mobile) await page.screenshot({ path: path.join(previewDir, screenshotName), fullPage: true });
  assert.deepEqual(errors, []);
  await page.close();
}

async function verifyTable(browser, baseUrl, viewport, screenshotName) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`${baseUrl}/table-fixture/`);
  await page.locator('.update-table-scroll').waitFor();
  assert.equal(await noHorizontalOverflow(page), true);

  if (viewport.width <= 760) {
    const dimensions = await page.locator('.update-table-scroll').evaluate((wrapper) => {
      const table = wrapper.querySelector('table');
      const cells = [...table.querySelectorAll('th, td')];
      return {
        wrapperClientWidth: wrapper.clientWidth,
        wrapperScrollWidth: wrapper.scrollWidth,
        tableWidth: table.getBoundingClientRect().width,
        overflowingCells: cells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
        tallestCell: Math.max(...cells.map((cell) => cell.getBoundingClientRect().height))
      };
    });
    assert(dimensions.wrapperScrollWidth <= dimensions.wrapperClientWidth + 1);
    assert(dimensions.tableWidth <= dimensions.wrapperClientWidth + 1);
    assert.equal(dimensions.overflowingCells, 0);
    assert(dimensions.tallestCell >= 70);
  }

  await page.screenshot({ path: path.join(previewDir, screenshotName), fullPage: true });
  assert.deepEqual(errors, []);
  await page.close();
}

(async () => {
  const { server, baseUrl } = await startServer();
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  const executablePath = candidates.find(existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });

  try {
    await verifyCarousel(browser, baseUrl, { width: 1440, height: 900 }, 'updates-carousel-desktop.png');
    await verifyCarousel(browser, baseUrl, { width: 390, height: 844 }, 'updates-carousel-mobile-390.png');
    await verifyCarousel(browser, baseUrl, { width: 360, height: 800 }, 'updates-carousel-mobile-360.png');
    await verifyTable(browser, baseUrl, { width: 1440, height: 900 }, 'updates-table-desktop.png');
    await verifyTable(browser, baseUrl, { width: 390, height: 844 }, 'updates-table-mobile-390.png');
    await verifyTable(browser, baseUrl, { width: 360, height: 800 }, 'updates-table-mobile-360.png');
    console.log('PASS mobile updates carousel and CMS-style responsive tables');
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
