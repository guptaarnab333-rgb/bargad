import sharp from 'sharp'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const OUT = 'public/icons'
mkdirSync(OUT, { recursive: true })

/* The Bargad mark, authored in Figma (file Rx7z6ddx, node 51:1371) and used
   verbatim. Never redraw it here.

   The crop used to be written out as literal numbers, tuned to the old mark,
   which was 1.82:1 wide. When the mark was replaced with the tree and pencil,
   nearly square, nothing here knew: the icons kept the old artwork and the old
   frame, and the home screen carried a logo the app had stopped using. The
   viewBox is read from the file now, so the source of truth is the source. */
const SRC = 'src/assets/bargad-mark.svg'
const raw = readFileSync(SRC, 'utf8')

const vb = (raw.match(/viewBox="([-\d.\s]+)"/) || [])[1]
if (!vb) throw new Error(`${SRC}: no viewBox to read the crop from`)
const [vx, vy, vw, vh] = vb.trim().split(/\s+/).map(Number)
if (!vw || !vh) throw new Error(`${SRC}: viewBox "${vb}" has no size`)

const markBody = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

/* Paper, matching the light ground the mark sits on in the app. */
const BG = '#f4f6f7'
/* The pencil tip reads currentColor so it can be chalk on the blackboard. A
   PNG has no context to inherit from, so the ink is stated here instead of
   letting it fall back to pure black. */
const INK = '#212328'

/**
 * Fit the mark inside a square of `size * scale`, whatever shape it is.
 * The old version scaled by width alone, which only looked right while the
 * mark was wider than it was tall.
 */
const svg = (size, radius, scale) => {
  const box = size * scale
  const ratio = vw / vh
  const w = ratio >= 1 ? box : box * ratio
  const h = ratio >= 1 ? box / ratio : box
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
    <svg x="${(size - w) / 2}" y="${(size - h) / 2}" width="${w}" height="${h}"
         viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" color="${INK}">
      ${markBody}
    </svg>
  </svg>`
}

const jobs = [
  ['icon-192.png', 192, 42, 0.74],
  ['icon-512.png', 512, 112, 0.74],
  ['icon-maskable-512.png', 512, 0, 0.58], // full bleed + generous safe zone
  ['apple-touch-icon.png', 180, 0, 0.74], // iOS applies its own mask
]

for (const [name, size, radius, scale] of jobs) {
  await sharp(Buffer.from(svg(size, radius, scale))).png().toFile(`${OUT}/${name}`)
  console.log('✓', name, `${size}×${size}`)
}

/* The favicon used to be a second, hand-inlined copy of the mark, which is why
   it went stale too. It is written from the same source as the PNGs now. */
writeFileSync('public/favicon.svg', `${svg(64, 14, 0.74)}\n`)
console.log('✓ favicon.svg 64×64')
