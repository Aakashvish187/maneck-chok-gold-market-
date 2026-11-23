import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = path.resolve('photos');
const OUTPUT_DIR = path.resolve('public/photos');
const PLACEHOLDERS_FILE = path.resolve('src/data/photoPlaceholders.js');

const MAPPING = {
  // Gold Chains
  'Rope Chain': 'SJ-CH-001',
  'Box Chain': 'SJ-CH-002',
  'Curb Chain': 'SJ-CH-003',
  'Singapore Chain': 'SJ-CH-004',
  'Figaro Chain': 'SJ-CH-005',

  // Necklaces
  'Temple Necklace': 'SJ-NK-001',
  'Mango Mala': 'SJ-NK-002',
  'Layered Haar': 'SJ-NK-003',
  'Choker Set': 'SJ-NK-004',
  'Antique Finish Necklace': 'SJ-NK-005',

  // Bangles
  'Plain Kadli Bangle': 'SJ-BG-001',
  'Patla Bangle': 'SJ-BG-002',
  'Kada': 'SJ-BG-003',
  'Filigree Bangle': 'SJ-BG-004',
  'Carved Bangle': 'SJ-BG-005',

  // Rings
  'Solitaire-Style Ring': 'SJ-RG-001',
  'Signet Ring': 'SJ-RG-002',
  'Band Ring': 'SJ-RG-003',
  'Floral Ring': 'SJ-RG-004',
  'Cocktail Ring': 'SJ-RG-005',

  // Earrings
  'Jhumka': 'SJ-ER-001',
  'Stud Earrings': 'SJ-ER-002',
  'Chandbali': 'SJ-ER-003',
  'Drop Earrings': 'SJ-ER-004',
  'Hoop Earrings': 'SJ-ER-005',

  // Bridal Sets
  'Bridal Necklace Set': 'SJ-BR-001',
  'Rani Haar Set': 'SJ-BR-002',
  'Temple Bridal Set': 'SJ-BR-003',
  'Kundan-Style Set': 'SJ-BR-004',
  'Heritage Bridal Set': 'SJ-BR-005',

  // Other
  'hero photo': 'hero',
  'about page': 'about',
};

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(PHOTOS_DIR);
  console.log(`Found ${files.length} files in ${PHOTOS_DIR}`);

  const placeholders = {};
  const statsList = [];
  const unmatched = [];

  for (const filename of files) {
    if (filename === 'desktop.ini' || filename.startsWith('.')) continue;
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext).trim();
    const slug = MAPPING[basename];

    if (!slug) {
      unmatched.push(filename);
      console.warn(`[WARNING] No mapping found for: "${filename}"`);
      continue;
    }

    const inputPath = path.join(PHOTOS_DIR, filename);

    // 1. Copy original file to public/photos/<slug><ext>
    const copiedPath = path.join(OUTPUT_DIR, `${slug}${ext.toLowerCase()}`);
    fs.copyFileSync(inputPath, copiedPath);

    // If hero or about is .png, also write .jpg copy as requested in prompt:
    // '"hero photo" -> hero.jpg, "about page" -> about.jpg'
    if (slug === 'hero' || slug === 'about') {
      const jpgPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
      await sharp(inputPath).jpeg({ quality: 90 }).toFile(jpgPath);
    }

    // 2. Convert to WebP, max 1000px on long side (under 150KB), quality ~80
    const webpPath = path.join(OUTPUT_DIR, `${slug}.webp`);
    // Ensure all images are strictly under 150KB while maintaining high visual fidelity
    const maxSide = (slug === 'hero' || slug === 'about') ? 750 : 1000;
    const quality = (slug === 'hero' || slug === 'about') ? 78 : 80;

    await sharp(inputPath)
      .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(webpPath);

    // Responsive width variants for mobile: 400w and 800w
    const webp400Path = path.join(OUTPUT_DIR, `${slug}-400.webp`);
    await sharp(inputPath)
      .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(webp400Path);

    const webp800Path = path.join(OUTPUT_DIR, `${slug}-800.webp`);
    await sharp(inputPath)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(webp800Path);

    const stat = fs.statSync(webpPath);
    statsList.push({
      original: filename,
      slug,
      webpFile: `${slug}.webp`,
      sizeKB: (stat.size / 1024).toFixed(1),
      bytes: stat.size,
    });

    // 3. Create 24px blurred placeholder version
    const blurWebpPath = path.join(OUTPUT_DIR, `${slug}-blur.webp`);
    const blurBuffer = await sharp(inputPath)
      .resize({ width: 24, height: 24, fit: 'inside', withoutEnlargement: true })
      .blur(1.5)
      .webp({ quality: 60 })
      .toBuffer();

    fs.writeFileSync(blurWebpPath, blurBuffer);

    // Also store base64 data URI for instant zero-flash placeholder rendering
    const base64DataUri = `data:image/webp;base64,${blurBuffer.toString('base64')}`;
    placeholders[`/photos/${slug}.webp`] = base64DataUri;
    placeholders[slug] = base64DataUri;
  }

  // Write placeholders JS
  fs.writeFileSync(
    PLACEHOLDERS_FILE,
    `// Generated 24px blurred placeholder data URIs for blur-up loading\nexport const PHOTO_PLACEHOLDERS = ${JSON.stringify(
      placeholders,
      null,
      2
    )};\n`
  );

  console.log('\n=== OPTIMIZATION SUMMARY ===');
  console.log(`Successfully processed: ${statsList.length} files`);
  let totalBytes = 0;
  let maxKB = 0;
  for (const s of statsList) {
    console.log(`- ${s.original} -> ${s.webpFile} (${s.sizeKB} KB)`);
    totalBytes += s.bytes;
    if (parseFloat(s.sizeKB) > maxKB) maxKB = parseFloat(s.sizeKB);
  }
  console.log(`\nTotal WebP weight: ${(totalBytes / 1024).toFixed(1)} KB (avg ${(totalBytes / 1024 / statsList.length).toFixed(1)} KB)`);
  console.log(`Max single photo weight: ${maxKB} KB (Target: < 150 KB: ${maxKB < 150 ? 'PASSED' : 'FAILED'})`);

  if (unmatched.length > 0) {
    console.log('\nUnmatched files:');
    unmatched.forEach((f) => console.log(`  - ${f}`));
  } else {
    console.log('\nAll 32 files matched successfully! No unmatched photos.');
  }
}

main().catch((err) => {
  console.error('Error during photo optimization:', err);
  process.exit(1);
});
