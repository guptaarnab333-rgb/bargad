/**
 * Hand-drawn doodles from the Educational Doodles Pack (Figma community file),
 * exported as SVG and committed to src/assets/doodles.
 *
 * The exported files are used verbatim apart from three mechanical fixes:
 *   stroke="black"              -> currentColor, so a doodle takes its context's colour
 *   preserveAspectRatio="none"  -> removed, so nothing is stretched
 *   width/height attributes     -> removed, so CSS controls the size
 * Nothing here is redrawn by hand.
 */
const FILES = import.meta.glob('../assets/doodles/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const DOODLES = Object.fromEntries(
  Object.entries(FILES).map(([path, raw]) => {
    const name = path.split('/').pop().replace('.svg', '')
    const vb = (raw.match(/viewBox="([\d.\s-]+)"/) || [])[1]
    const [, , w, h] = vb ? vb.split(/\s+/).map(Number) : [0, 0, 1, 1]
    const svg = raw
      /* The pack ships every stroke as literal black. This line is what lets a
         doodle take the colour of whatever it is drawn on, and it is why one
         set of files serves both boards: dark marker on the whiteboard, chalk
         on the blackboard. The comment at the top of this file described it
         long before the code did, and until now every doodle rendered pure
         black. That only ever looked right because the light theme's ink is
         nearly black too; on the blackboard they were invisible. */
      .replace(/stroke="(black|#000|#000000)"/gi, 'stroke="currentColor"')
      .replace(/\spreserveAspectRatio="none"/, '')
      .replace(/\s(width|height)="[^"]*"/g, '')
      .replace('<svg ', '<svg class="doodle__svg" ')
    return [name, { svg, ratio: w && h ? w / h : 1 }]
  })
)

export const DOODLE_NAMES = Object.keys(DOODLES)

/**
 * @param {string} name    one of DOODLE_NAMES
 * @param {number|string} size  px along the doodle's longest edge, or a CSS length
 * @param {number} weight  stroke width in screen px (non-scaling), ~1.2–1.8 reads best
 */
export default function Doodle({ name, size = 80, weight = 1.4, className = '', style }) {
  const d = DOODLES[name]
  if (!d) return null

  // Fit the natural aspect ratio inside a `size` box so nothing distorts.
  const numeric = typeof size === 'number'
  const box = numeric
    ? d.ratio >= 1
      ? { width: size, height: Math.round(size / d.ratio) }
      : { width: Math.round(size * d.ratio), height: size }
    : { width: size, height: size }

  return (
    <span
      className={`doodle ${className}`}
      style={{ ...box, '--doodle-weight': weight, ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: d.svg }}
    />
  )
}
