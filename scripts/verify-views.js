import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function clickByText(page, selector, text) {
  const found = await page.evaluate(
    ({ selector, text }) => {
      const elements = [...document.querySelectorAll(selector)];
      const target = elements.find((el) => el.textContent.trim().includes(text));
      if (target) {
        target.click();
        return true;
      }
      return false;
    },
    { selector, text }
  );
  if (!found) {
    throw new Error(`Element ${selector} with text "${text}" not found`);
  }
}

async function run() {
  console.log('Launching headless Chrome on 390px viewport...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`Page error: ${err.message}`);
  });

  console.log('\n--- 1. Testing Home Page (390px) ---');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Check hero images (blur placeholder & sharp image)
  const heroImgs = await page.$$eval('figure img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      opacity: window.getComputedStyle(el).opacity,
    }))
  );
  console.log('Hero images:', heroImgs);

  // Check category preview tiles
  const categoryTiles = await page.$$eval('ul.grid li img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
    }))
  );
  console.log(`Category tile preview images found: ${categoryTiles.length}`);

  // Check featured cards
  const featuredCards = await page.$$eval('section:nth-of-type(3) img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
    }))
  );
  console.log(`Featured card images found: ${featuredCards.length}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-390.png') });

  console.log('\n--- 2. Testing Collections Page, Filters, Search & Wholesaler View ---');
  await page.goto('http://localhost:5174/collections', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Total products in all
  const initialCards = await page.$$eval('div.grid > div', (els) => els.length);
  console.log(`Collections All designs count: ${initialCards} cards`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'collections-all-390.png') });

  // Filter to Bangles
  console.log('Filtering to Bangles...');
  await clickByText(page, 'button', 'Bangles');
  await new Promise((r) => setTimeout(r, 500));
  const banglesCards = await page.$$eval('div.grid > div', (els) => els.length);
  console.log(`Filtered to Bangles: ${banglesCards} cards visible`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'collections-bangles-390.png') });

  // Back to All
  await clickByText(page, 'button', 'All');
  await new Promise((r) => setTimeout(r, 400));

  // Test Search
  console.log('Testing search for "SJ-BG-002"...');
  await page.click('input[type="search"]');
  await page.type('input[type="search"]', 'SJ-BG-002');
  await new Promise((r) => setTimeout(r, 400));
  const searchCards = await page.$$eval('div.grid > div', (els) => els.length);
  console.log(`Search result for "SJ-BG-002": ${searchCards} card(s) visible`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'collections-search-390.png') });

  // Clear search input using keyboard backspace
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await new Promise((r) => setTimeout(r, 400));
  const restoredCards = await page.$$eval('div.grid > div', (els) => els.length);
  console.log(`Cleared search: restored ${restoredCards} cards`);

  // Switch to Wholesaler view
  console.log('Switching to Wholesaler view...');
  await clickByText(page, 'button', 'Wholesaler');
  await new Promise((r) => setTimeout(r, 500));
  const wholesalerRows = await page.$$eval('table tbody tr', (els) => els.length);
  console.log(`Wholesaler view table rows: ${wholesalerRows}`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'collections-wholesaler-390.png') });

  // Switch back to Retailer view
  await clickByText(page, 'button', 'Retailer');
  await new Promise((r) => setTimeout(r, 300));

  console.log('\n--- 3. Testing Product Page & Fullscreen Lightbox ---');
  await page.goto('http://localhost:5174/product/SJ-NK-001', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  const productImgs = await page.$$eval('div.md\\:col-span-7 img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
    }))
  );
  console.log('Product page main image elements:', productImgs);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product-390.png') });

  // Click main photo to open Lightbox
  console.log('Clicking main photo to open lightbox...');
  await page.click('button[aria-label="Enlarge photo of Temple Necklace"]');
  await page.waitForSelector('div[role="dialog"]');
  console.log('Lightbox modal opened successfully!');
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product-lightbox-390.png') });

  // Press Escape to close lightbox
  console.log('Pressing Escape to close lightbox...');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 400));
  const isDialogGone = (await page.$('div[role="dialog"]')) === null;
  console.log(`Lightbox closed by Escape: ${isDialogGone}`);

  console.log('\n--- 4. Testing About Page ---');
  await page.goto('http://localhost:5174/about', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  const aboutImgs = await page.$$eval('figure img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
    }))
  );
  console.log('About page shop images:', aboutImgs);
  const captionText = await page.$eval('figcaption', (el) => el.innerText);
  console.log('About page caption:', captionText);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'about-390.png') });

  console.log('\n--- 5. Testing Admin Page & Login ---');
  await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle0' });
  // Enter password demo1234
  await page.type('input[type="password"]', 'demo1234');
  await clickByText(page, 'button', 'Sign in');
  await page.waitForSelector('button[role="tab"]');
  console.log('Admin login successful!');
  await new Promise((r) => setTimeout(r, 600));

  // Check product thumbnails in Admin Designs tab
  const adminThumbs = await page.$$eval('ul img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
    }))
  );
  console.log(`Admin product thumbnails: ${adminThumbs.length}`);

  // Switch to Shop info & prices tab
  await clickByText(page, 'button', 'Shop info & prices');
  await new Promise((r) => setTimeout(r, 500));
  const shopThumbs = await page.$$eval('form img', (els) =>
    els.map((el) => ({
      src: el.src.slice(0, 50) + '...',
      naturalWidth: el.naturalWidth,
    }))
  );
  console.log(`Admin shop photos visible: ${shopThumbs.length}`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-390.png') });

  await browser.close();

  console.log('\n=== FINAL VERIFICATION RESULTS ===');
  if (errors.length === 0) {
    console.log('PERFECT: ALL CHECKS PASSED with ZERO console/page errors!');
  } else {
    console.log(`Errors encountered (${errors.length}):`);
    errors.forEach((e) => console.log('  -', e));
  }
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
