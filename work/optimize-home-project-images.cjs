const fs = require('fs');
const sharp = require('/Users/mj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

// Flatten photo exports while retaining the SVG's crop, corners and overlay.
// Decode embedded WebP to PNG first because librsvg does not render WebP images.
async function main() {
  const exports = [['de0e358c77', 'wareiq-home', 800, [800, 1600]], ['97c11bc5a4', 'integritty-home', 800, [800, 1600]], ['dde83936d2', 'contact-cta', 1600, [800, 1600, 2400]]];
  for (const [source, name, originalWidth, widths] of exports) {
    if (process.argv[2] && process.argv[2] !== name) continue;
    let svg = fs.readFileSync(`assets/optimized/${source}.svg`, 'utf8');
    for (const match of [...svg.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)]) {
      const png = await sharp(Buffer.from(match[1], 'base64')).png().toBuffer();
      svg = svg.replace(match[0], `data:image/png;base64,${png.toString('base64')}`);
    }
    for (const width of widths) {
      const image = sharp(Buffer.from(svg), { density: 72 * width / originalWidth, unlimited: true });
      const stats = await image.clone().stats();
      if (stats.entropy < 2) throw new Error(`Unexpected blank rendering: ${name}`);
      const destination = `assets/optimized/${name}-${width}.webp`;
      await image.webp({ lossless: true, effort: 6 }).toFile(destination);
      console.log(destination, fs.statSync(destination).size);
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
