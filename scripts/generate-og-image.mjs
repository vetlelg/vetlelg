import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

// Generate subtle bubble circles
function generateBubbles() {
  const bubbles = [];
  const positions = [
    { cx: 80, cy: 120, r: 18, opacity: 0.08 },
    { cx: 150, cy: 280, r: 12, opacity: 0.06 },
    { cx: 95, cy: 400, r: 8, opacity: 0.05 },
    { cx: 1100, cy: 150, r: 22, opacity: 0.07 },
    { cx: 1050, cy: 320, r: 10, opacity: 0.05 },
    { cx: 1130, cy: 480, r: 14, opacity: 0.04 },
    { cx: 300, cy: 80, r: 6, opacity: 0.06 },
    { cx: 900, cy: 100, r: 9, opacity: 0.07 },
    { cx: 200, cy: 500, r: 7, opacity: 0.04 },
    { cx: 1000, cy: 530, r: 5, opacity: 0.03 },
    { cx: 500, cy: 60, r: 10, opacity: 0.05 },
    { cx: 700, cy: 570, r: 6, opacity: 0.03 },
  ];
  for (const b of positions) {
    bubbles.push(
      `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="none" stroke="rgba(202,240,248,${b.opacity})" stroke-width="1.5"/>`
    );
  }
  return bubbles.join('\n    ');
}

// Generate marine snow dots
function generateMarineSnow() {
  const dots = [];
  const seed = [
    [60, 350], [180, 450], [320, 520], [440, 480], [560, 550],
    [680, 500], [800, 540], [920, 470], [1040, 510], [1140, 560],
    [130, 530], [250, 580], [370, 560], [490, 590], [610, 570],
    [730, 580], [850, 600], [970, 560], [1080, 590], [50, 580],
  ];
  for (const [x, y] of seed) {
    const r = 1 + Math.random() * 1.5;
    const opacity = 0.1 + Math.random() * 0.15;
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(202,240,248,${opacity.toFixed(2)})"/>`);
  }
  return dots.join('\n    ');
}

const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Deep-sea gradient matching the site zones -->
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0077B6"/>
      <stop offset="25%" stop-color="#023E8A"/>
      <stop offset="50%" stop-color="#03045E"/>
      <stop offset="75%" stop-color="#0A0A2A"/>
      <stop offset="100%" stop-color="#050510"/>
    </linearGradient>

    <!-- Subtle caustic light overlay at top -->
    <radialGradient id="caustic1" cx="0.35" cy="0.1" r="0.5">
      <stop offset="0%" stop-color="rgba(144,224,239,0.12)"/>
      <stop offset="100%" stop-color="rgba(144,224,239,0)"/>
    </radialGradient>
    <radialGradient id="caustic2" cx="0.7" cy="0.15" r="0.4">
      <stop offset="0%" stop-color="rgba(202,240,248,0.08)"/>
      <stop offset="100%" stop-color="rgba(202,240,248,0)"/>
    </radialGradient>

    <!-- Bioluminescent glow at bottom -->
    <radialGradient id="biolum" cx="0.5" cy="0.85" r="0.3">
      <stop offset="0%" stop-color="rgba(0,245,212,0.06)"/>
      <stop offset="100%" stop-color="rgba(0,245,212,0)"/>
    </radialGradient>
  </defs>

  <!-- Background gradient -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Caustic light overlays -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#caustic1)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#caustic2)"/>

  <!-- Bioluminescent glow -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#biolum)"/>

  <!-- Bubbles -->
  ${generateBubbles()}

  <!-- Marine snow -->
  ${generateMarineSnow()}

  <!-- Depth indicator line on right side -->
  <line x1="1140" y1="80" x2="1140" y2="550" stroke="rgba(202,240,248,0.12)" stroke-width="1"/>
  <line x1="1135" y1="80" x2="1145" y2="80" stroke="rgba(202,240,248,0.2)" stroke-width="1"/>
  <line x1="1135" y1="550" x2="1145" y2="550" stroke="rgba(202,240,248,0.2)" stroke-width="1"/>
  <text x="1140" y="70" fill="rgba(202,240,248,0.25)" font-family="monospace" font-size="11" text-anchor="middle">0m</text>
  <text x="1140" y="575" fill="rgba(202,240,248,0.25)" font-family="monospace" font-size="11" text-anchor="middle">11,000m</text>

  <!-- Main text content -->
  <text x="600" y="240" fill="#E0F7FA" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-size="56" font-weight="700" text-anchor="middle" letter-spacing="1">
    Vetle Larsen Gundersen
  </text>

  <text x="600" y="300" fill="rgba(224,247,250,0.6)" font-family="'Inter', 'Segoe UI', sans-serif" font-size="24" font-weight="400" text-anchor="middle" letter-spacing="2">
    Software Developer
  </text>

  <!-- Depth label -->
  <text x="600" y="370" fill="rgba(202,240,248,0.3)" font-family="monospace" font-size="14" text-anchor="middle" letter-spacing="3">
    A DEEP-SEA DESCENT THROUGH CODE
  </text>

  <!-- Zone accent dots (representing the depth journey) -->
  <circle cx="480" cy="420" r="4" fill="#CAF0F8" opacity="0.5"/>
  <circle cx="520" cy="420" r="4" fill="#90E0EF" opacity="0.5"/>
  <circle cx="560" cy="420" r="4" fill="#7B2FBE" opacity="0.5"/>
  <circle cx="600" cy="420" r="4" fill="#00F5D4" opacity="0.5"/>
  <circle cx="640" cy="420" r="4" fill="#F72585" opacity="0.5"/>

  <!-- Connecting line between dots -->
  <line x1="484" y1="420" x2="636" y2="420" stroke="rgba(224,247,250,0.15)" stroke-width="1"/>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ quality: 90, compressionLevel: 6 })
  .toFile('public/og-image.png');

const stats = await sharp('public/og-image.png').metadata();
console.log(`Generated og-image.png: ${stats.width}x${stats.height}, ${stats.size ? (stats.size / 1024).toFixed(1) + 'KB' : 'check file size'}`);
