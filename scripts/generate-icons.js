import sharp from 'sharp';
import { copyFile } from 'node:fs/promises';

const source = 'public/icons/icon-source.svg';
await copyFile(source, 'public/favicon.svg');
for (const [name, size] of [
  ['pwa-192x192', 192], ['pwa-512x512', 512], ['apple-touch-icon', 180],
]) {
  await sharp(source).resize(size, size).png().toFile(`public/${name}.png`);
}
await sharp(source).resize(384, 384).extend({
  top: 64, bottom: 64, left: 64, right: 64, background: '#0ea5e9',
}).flatten({ background: '#0ea5e9' }).png().toFile('public/pwa-512x512-maskable.png');
