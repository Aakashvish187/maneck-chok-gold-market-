import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
process.env.CHROME_PATH = CHROME_PATH;

const BASE_URL = 'http://localhost:4173';

async function auditUrl(url, label) {
  console.log(`\nLaunching Chrome for Lighthouse audit on ${label} (${url})...`);
  const chrome = await chromeLauncher.launch({
    chromePath: CHROME_PATH,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  console.log(`Chrome launched on port ${chrome.port}`);

  const options = {
    port: chrome.port,
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 2.75,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1.6 * 1024,
      uploadThroughputKbps: 750,
      cpuSlowdownMultiplier: 4,
    },
  };

  const runnerResult = await lighthouse(url, options);
  await chrome.kill();

  const lhr = runnerResult.lhr;
  const scores = {
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    lcp: lhr.audits['largest-contentful-paint'].displayValue,
    fcp: lhr.audits['first-contentful-paint'].displayValue,
    cls: lhr.audits['cumulative-layout-shift'].displayValue,
  };

  console.log(`\n=== LIGHTHOUSE SCORES FOR ${label} ===`);
  console.log(`Performance:    ${scores.performance}`);
  console.log(`Accessibility:  ${scores.accessibility}`);
  console.log(`Best Practices: ${scores.bestPractices}`);
  console.log(`SEO:            ${scores.seo}`);
  console.log(`LCP:            ${scores.lcp}`);
  console.log(`FCP:            ${scores.fcp}`);
  console.log(`CLS:            ${scores.cls}`);

  return scores;
}

async function run() {
  const homeScores = await auditUrl(`${BASE_URL}/`, 'Home Page');
  const prodScores = await auditUrl(`${BASE_URL}/product/SJ-NK-001`, 'Product Page');

  console.log('\n=== FINAL SUMMARY ===');
  console.log('Home:', homeScores);
  console.log('Product:', prodScores);
}

run().catch((err) => {
  console.error('Lighthouse audit failed:', err);
  process.exit(1);
});
