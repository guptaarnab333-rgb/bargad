import sharp from 'sharp'
import { mkdirSync, readFileSync } from 'node:fs'

const OUT = 'public/icons'
mkdirSync(OUT, { recursive: true })

/* The Bargad mark, authored in Figma (file Rx7z6ddx, page "Bargad Logo",
   frame "Final logo") and used verbatim. Never redraw it here. */
const raw = readFileSync('src/assets/bargad-mark.svg', 'utf8')
const markBody = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

const VB = { x: 30, y: 90, w: 269, h: 148 }
const BG = '#F5F1EA' // paper, matching the light ground the logo was designed on

// scale = how much of the canvas width the mark occupies (maskable needs a safe zone)
const svg = (size, radius, scale) => {
  const w = size * scale
  const h = w * (VB.h / VB.w)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
    <svg x="${(size - w) / 2}" y="${(size - h) / 2}" width="${w}" height="${h}"
         viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet">
      ${markBody}
    </svg>
  </svg>`
}

const jobs = [
  ['icon-192.png', 192, 42, 0.82],
  ['icon-512.png', 512, 112, 0.82],
  ['icon-maskable-512.png', 512, 0, 0.6], // full bleed + generous safe zone
  ['apple-touch-icon.png', 180, 0, 0.8], // iOS applies its own mask
]

for (const [name, size, radius, scale] of jobs) {
  await sharp(Buffer.from(svg(size, radius, scale))).png().toFile(`${OUT}/${name}`)
  console.log('✓', name, `${size}×${size}`)
}
