import Doodle from './Doodle'
import markSvg from '../assets/bargad-mark.svg?raw'

/**
 * The Bargad mark: two braided hands clasping.
 * Authored in Figma (file Rx7z6ddx, page "Bargad Logo", frame "Final logo")
 * and used verbatim. Do not redraw it here.
 */
const MARK = markSvg
  .replace(/\s(width|height)="[^"]*"/g, '')
  .replace('<svg ', '<svg class="mark__svg" preserveAspectRatio="xMidYMid meet" ')

const RATIO = 269 / 148

export function BargadMark({ size = 34, className = '' }) {
  return (
    <span
      className={`mark ${className}`}
      style={{ width: size * RATIO, height: size }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: MARK }}
    />
  )
}

export function Logo({ size = 34, showWord = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <BargadMark size={size * 0.82} />
      {showWord && (
        <span
          className="logo__word"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: size * 0.53,
            letterSpacing: '-0.045em',
          }}
        >
          Bargad
        </span>
      )}
    </span>
  )
}

/**
 * Background motif on an intent banner. A doodle, sized large and set faint,
 * so it reads as texture rather than an icon competing with the status.
 */
export function BannerDoodle({ name }) {
  return (
    <span className="intent__motif">
      <Doodle name={name} size="100%" weight={1.3} />
    </span>
  )
}

/**
 * Welcome composition: the palette reference's flat shapes, each holding one
 * doodle. Four shapes, four things the product connects.
 */
export function DoodleStack() {
  return (
    <div
      className="dstack"
      role="img"
      aria-label="A teacher, a lesson, a place and a student"
    >
      <div className="dtile dtile--arch">
        <Doodle name="book" size={64} weight={1.5} />
      </div>
      <div className="dstack__col">
        <div className="dtile dtile--pill" style={{ flex: 1 }}>
          <Doodle name="pencil" size={40} weight={1.5} />
        </div>
        <div className="dtile dtile--circle">
          <Doodle name="globe" size={42} weight={1.5} />
        </div>
      </div>
      <div className="dtile dtile--block">
        <Doodle name="plane" size={84} weight={1.6} />
      </div>
    </div>
  )
}
