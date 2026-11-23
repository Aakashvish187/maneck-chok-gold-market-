import puppeteer from 'puppeteer-core';
import lighthouse from 'lighthouse';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:4173';
const VIEWPORTS = [320, 360, 390, 412, 768, 1280];
const PAGES = ['/', '/collections', '/product/SJ-NK-001', '/about', '/contact', '/admin'];

async function main() {
  console.log('=== MULTI-VIEWPORT & RESPONSIVE AUDIT ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--remote-debugging-port=9222'],
  });

  const page = await browser.newPage();

  // Emulate touch & Fast 4G + 4x CPU slowdown on mobile
  const client = await page.createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150, // Fast 4G
    downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8, // 750 Kbps
  });

  const overflowResults = [];
  const errors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console error on ${page.url()}: ${msg.text()}`);
    }
  });

  for (const width of VIEWPORTS) {
    const isMobile = width < 768;
    const height = isMobile ? 844 : 900;
    await page.setViewport({ width, height, isMobile, hasTouch: isMobile });

    console.log(`\nTesting Viewport: ${width}px x ${height}px (Mobile: ${isMobile})`);

    for (const route of PAGES) {
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 300));

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const bodyWidth = document.body.scrollWidth;
        const hasOverflow = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;
        return {
          hasOverflow,
          docWidth,
          winWidth,
          bodyWidth,
        };
      });

      if (overflow.hasOverflow) {
        overflowResults.push({ width, route, ...overflow });
        console.error(`  [FAIL] Horizontal scroll detected on ${route} at ${width}px! (Doc: ${overflow.docWidth}px, Win: ${overflow.winWidth}px)`);
      } else {
        console.log(`  [PASS] ${route} - No horizontal overflow (width: ${overflow.winWidth}px)`);
      }

      // Viewport-specific assertions
      if (route === '/' && isMobile) {
        // Verify bottom bar is visible
        const bottomNavVisible = await page.$eval('nav[aria-label="Mobile thumb navigation"]', (el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        console.log(`    -> Mobile bottom bar visible: ${bottomNavVisible}`);
      }

      if (route === '/collections' && isMobile) {
        // Verify wholesaler stacked view exists
        const stackedWholesaler = await page.$('div.space-y-2\\.5.sm\\:hidden');
        console.log(`    -> Wholesaler mobile stacked layout present: ${stackedWholesaler !== null}`);
      }

      if (route === '/product/SJ-NK-001' && isMobile) {
        // Scroll down to test sticky WhatsApp bar appearance
        await page.evaluate(() => window.scrollTo(0, 700));
        await new Promise((r) => setTimeout(r, 400));
        const stickyBar = await page.$('div[aria-label="Sticky WhatsApp action"]');
        console.log(`    -> Sticky WhatsApp action appeared on scroll: ${stickyBar !== null}`);
      }
    }
  }

  await browser.close();

  console.log('\n=== RUNNING LIGHTHOUSE AUDITS ===\n');

  // Run Lighthouse on Home
  console.log('Running Lighthouse on Home (Mobile)...');
  const homeLh = await lighthouse(`${BASE_URL}/`, {
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2.75 },
    chromeFlags: ['--headless=new', '--no-sandbox'],
  });

  const homeScores = {
    performance: Math.round(homeLh.lhr.categories.performance.score * 100),
    accessibility: Math.round(homeLh.lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(homeLh.lhr.categories['best-practices'].score * 100),
    seo: Math.round(homeLh.lhr.categories.seo.score * 100),
    lcp: homeLh.lhr.audits['largest-contentful-paint'].displayValue,
    cls: homeLh.lhr.audits['cumulative-layout-shift'].displayValue,
  };
  console.log('Home Page Lighthouse Scores:', homeScores);

  // Run Lighthouse on Product page
  console.log('\nRunning Lighthouse on Product Page (Mobile)...');
  const prodLh = await lighthouse(`${BASE_URL}/product/SJ-NK-001`, {
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2.75 },
    chromeFlags: ['--headless=new', '--no-sandbox'],
  });

  const prodScores = {
    performance: Math.round(prodLh.lhr.categories.performance.score * 100),
    accessibility: Math.round(prodLh.lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(prodLh.lhr.categories['best-practices'].score * 100),
    seo: Math.round(prodLh.lhr.categories.seo.score * 100),
    lcp: prodLh.lhr.audits['largest-contentful-paint'].displayValue,
    cls: prodLh.lhr.audits['cumulative-layout-shift'].displayValue,
  };
  console.log('Product Page Lighthouse Scores:', prodScores);

  console.log('\n=== SUMMARY ===');
  console.log(`Horizontal overflow failures: ${overflowResults.length}`);
  console.log(`Console errors: ${errors.length}`);
}

main().catch((err) => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
