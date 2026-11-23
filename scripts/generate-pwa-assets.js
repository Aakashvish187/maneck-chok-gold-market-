import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ICONS_DIR = path.resolve('public/icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Simple elegant brass 'SJ' monogram on ivory/ink heritage background
const svgMonogram = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#F7F3EA"/>
  <rect x="24" y="24" width="464" height="464" fill="none" stroke="#24211E" stroke-width="6"/>
  <rect x="36" y="36" width="440" height="440" fill="none" stroke="#855F26" stroke-width="3"/>
  <!-- Decorative corner diamonds -->
  <polygon points="50,42 58,50 50,58 42,50" fill="#855F26"/>
  <polygon points="462,42 470,50 462,58 454,50" fill="#855F26"/>
  <polygon points="50,454 58,462 50,470 42,462" fill="#855F26"/>
  <polygon points="462,454 470,462 462,470 454,462" fill="#855F26"/>
  
  <!-- Monogram text -->
  <text x="256" y="295" font-family="'Cormorant Garamond', Georgia, serif" font-size="220" font-weight="600" fill="#612E32" text-anchor="middle" letter-spacing="4">SJ</text>
  <text x="256" y="360" font-family="'Inter', sans-serif" font-size="28" font-weight="500" fill="#855F26" text-anchor="middle" letter-spacing="8">SHREE</text>
  <line x1="160" y1="390" x2="352" y2="390" stroke="#855F26" stroke-width="2"/>
</svg>
`;

async function main() {
  const svgBuffer = Buffer.from(svgMonogram);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-512.png'));

  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public/apple-touch-icon.png'));

  console.log('PWA icons created successfully in public/icons and public/apple-touch-icon.png');
}

main().catch(console.error);

