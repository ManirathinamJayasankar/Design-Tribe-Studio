const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('/Users/mj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

// Derived assets only: retain dimensions, alpha and lossless pixel data.
async function main() {
  const sources = ['index.html', 'about.html', 'impact.html', 'contact.html',
    ...fs.readdirSync('src').filter(f => /\.(css|js)$/.test(f)).map(f => `src/${f}`)];
  const refs = new Set();
  for (const f of sources) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/assets\/[^"'\)\n<>]+?\.(?:svg|png|jpe?g|webp)/gi)) {
      refs.add(decodeURIComponent(m[0]).slice(1));
    }
  }
  fs.mkdirSync('assets/optimized', { recursive: true });
  const results = [];
  for (const input of refs) {
    if (!fs.existsSync(input) || input.startsWith('assets/optimized/')) continue;
    const original = fs.readFileSync(input);
    if (original.length < 100000) continue;
    const svg = input.endsWith('.svg');
    let output;
    if (svg) {
      let text = original.toString();
      const matches = [...text.matchAll(/data:image\/(?:png|jpeg|jpg);base64,([A-Za-z0-9+/=\s]+)/g)];
      if (!matches.length) continue; // Logos and pure vector artwork stay vectors.
      for (const m of matches) {
        const bytes = Buffer.from(m[1], 'base64');
        const optimized = await sharp(bytes).webp({ lossless: true, effort: 6 }).toBuffer();
        if (optimized.length < bytes.length) text = text.replace(m[0], `data:image/webp;base64,${optimized.toString('base64')}`);
      }
      output = Buffer.from(text);
    } else {
      output = await sharp(original).rotate().webp({ lossless: true, effort: 6 }).toBuffer();
    }
    if (output.length >= original.length * .95) continue;
    const hash = crypto.createHash('sha256').update(input).digest('hex').slice(0, 10);
    const destination = `assets/optimized/${hash}.${svg ? 'svg' : 'webp'}`;
    fs.writeFileSync(destination, output);
    results.push({ input, destination, before: original.length, after: output.length });
    console.log(`${input}: ${(original.length/1048576).toFixed(2)} → ${(output.length/1048576).toFixed(2)} MB`);
  }
  fs.writeFileSync('work/image-optimization-report.json', JSON.stringify(results, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
