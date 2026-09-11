const fs = require('fs');
const sharp = require('/Users/mj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

// Preserve the Figma photo crop; Integritty's supplied export includes its overlay.
async function main() {
  for (const name of ['pb', 'prometric', 'wareiq', 'integritty']) {
    let input = name === 'integritty'
      ? fs.readFileSync('assets/Integritty Image_impact.svg', 'utf8')
      : fs.readFileSync(`/private/tmp/impact-${name}.png`);
    if (typeof input === 'string') {
      for (const match of [...input.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)]) {
        const png = await sharp(Buffer.from(match[1], 'base64')).png().toBuffer();
        input = input.replace(match[0], `data:image/png;base64,${png.toString('base64')}`);
      }
      input = Buffer.from(input);
    }
    for (const width of [792, 1584]) {
      const photo = sharp(input, { unlimited: true, ...(name === 'integritty' ? { density: 72 * width / 792 } : {}) })
        .resize(width, Math.round(width * 388 / 792), { fit: 'fill' });
      if ((await photo.clone().stats()).entropy < 2) throw new Error(`Blank image: ${name}`);
      const output = `assets/optimized/impact-${name}-${width}.webp`;
      await photo.webp({ lossless: true, effort: 6 }).toFile(output);
      console.log(output, fs.statSync(output).size);
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
