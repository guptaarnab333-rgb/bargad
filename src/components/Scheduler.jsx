import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, dateFromISO, isoDate } from '../lib/utils'
import { IcArrow } from './Icons'

/**
 * Picking when the demo class happens.
 *
 * This used to be four hardcoded phrases ("This Saturday", "Next Tuesday") and
 * four hardcoded times, which is fine for a screenshot and useless the moment
 * someone wants a real day. Both controls here answer the question the way
 * every calendar and alarm app already taught people to answer it, so nobody
 * has to learn this screen.
 */

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Monday-first index for a JS day number. */
const mondayFirst = (jsDay) => (jsDay + 6) % 7

/* ---------------- Day ---------------- */

export function DayPicker({ value, onChange }) {
  const today = isoDate()
  const tomorrow = addDays(today, 1)
  const [cursor, setCursor] = useState(() => {
    const d = dateFromISO(value || today)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const grid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1)
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
    const lead = mondayFirst(first.getDay())
    const cells = Array.from({ length: lead }, () => null)
    for (let d = 1; d <= days; d++) cells.push(isoDate(new Date(cursor.y, cursor.m, d)))
    return cells
  }, [cursor])

  const step = (n) => {
    const d = new Date(cursor.y, cursor.m + n, 1)
    setCursor({ y: d.getFullYear(), m: d.getMonth() })
  }

  // Nobody schedules a demo for last week, and this month is the earliest
  // month worth showing.
  const atFloor = cursor.y === new Date().getFullYear() && cursor.m === new Date().getMonth()

  return (
    <div className="daypick">
      <div className="daypick__quick">
        {[
          ['Today', today],
          ['Tomorrow', tomorrow],
        ].map(([label, iso]) => (
          <button
            key={iso}
            type="button"
            className="opt"
            aria-pressed={value === iso}
            onClick={() => onChange(iso)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="cal">
        <div className="cal__head">
          <button
            type="button"
            className="cal__nav"
            onClick={() => step(-1)}
            disabled={atFloor}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="cal__month">
            {MONTHS[cursor.m]} {cursor.y}
          </span>
          <button type="button" className="cal__nav" onClick={() => step(1)} aria-label="Next month">
            ›
          </button>
        </div>

        <div className="cal__grid cal__grid--dow" aria-hidden="true">
          {DOW.map((d, i) => (
            <span key={i} className="cal__dow">
              {d}
            </span>
          ))}
        </div>

        <div className="cal__grid">
          {grid.map((iso, i) =>
            iso ? (
              <button
                key={iso}
                type="button"
                className="cal__day"
                aria-pressed={value === iso}
                aria-label={iso}
                disabled={iso < today}
                onClick={() => onChange(iso)}
              >
                {dateFromISO(iso).getDate()}
                {iso === today && <i className="cal__today" />}
              </button>
            ) : (
              <span key={`pad${i}`} />
            )
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Time ---------------- */

/**
 * The time, as a set of wheels.
 *
 * A clock face was here first and it was the wrong instrument: it is quick for
 * an hour and slow for a minute, and it is not what anybody's phone taught them
 * to expect when setting a time. This is the alarm-clock picker, so the gesture
 * is already in everyone's thumbs.
 */
const ITEM = 40
const ROWS_EACH_SIDE = 2

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const MERIDIEM = ['AM', 'PM']

function Wheel({ items, index, onIndex, label, wide = false }) {
  const ref = useRef(null)
  const settling = useRef(null)
  /* While a finger is on the wheel the scroll position is the truth. Writing
     to scrollTop then would fight the user mid-flick. */
  const live = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || live.current) return
    const top = index * ITEM
    if (Math.abs(el.scrollTop - top) > 1) el.scrollTop = top
  }, [index])

  const onScroll = () => {
    live.current = true
    clearTimeout(settling.current)
    // Read the wheel once it has come to rest, not on every frame of the flick.
    settling.current = setTimeout(() => {
      live.current = false
      const el = ref.current
      if (!el) return
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM)))
      if (i !== index) onIndex(i)
    }, 130)
  }

  return (
    <div
      ref={ref}
      className={`wheel${wide ? ' wheel--wide' : ''}`}
      onScroll={onScroll}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          onIndex(Math.min(items.length - 1, index + 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          onIndex(Math.max(0, index - 1))
        }
      }}
    >
      <span className="wheel__pad" />
      {items.map((it, i) => (
        <button
          type="button"
          key={it}
          className={`wheel__item${i === index ? ' wheel__item--on' : ''}`}
          role="option"
          aria-selected={i === index}
          onClick={() => onIndex(i)}
        >
          {it}
        </button>
      ))}
      <span className="wheel__pad" />
    </div>
  )
}

export function TimeWheel({ value, onChange }) {
  const [h24, min] = String(value || '16:00').split(':').map(Number)
  const pm = h24 >= 12
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12

  const emit = (h12, m, isPm) => {
    const h = (h12 % 12) + (isPm ? 12 : 0)
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  return (
    <div className="wheels" style={{ '--wheel-row': `${ITEM}px`, '--wheel-pad': `${ITEM * ROWS_EACH_SIDE}px` }}>
      <span className="wheels__band" aria-hidden="true" />
      <Wheel items={HOURS} index={hour12 - 1} onIndex={(i) => emit(i + 1, min, pm)} label="Hour" />
      <Wheel items={MINUTES} index={min} onIndex={(i) => emit(hour12, i, pm)} label="Minutes" />
      <Wheel
        items={MERIDIEM}
        index={pm ? 1 : 0}
        onIndex={(i) => emit(hour12, min, i === 1)}
        label="Morning or afternoon"
        wide
      />
    </div>
  )
}

/* ---------------- A choice you can see without opening it ---------------- */

/**
 * Day and Time sit in rows that state their current answer and open on tap.
 *
 * Expanded, the calendar alone filled the sheet: there was no sign that Time
 * and Where existed below it, and since all three start pre-filled, Propose
 * looked ready when nothing had actually been decided. Collapsed rows put every
 * answer on one screen, so the defaults are visible choices rather than hidden
 * ones, and the things still to decide are obviously there.
 */
export function PickerRow({ label, value, open, onToggle, children }) {
  return (
    <div className={`prow${open ? ' prow--open' : ''}`}>
      <button type="button" className="prow__head" aria-expanded={open} onClick={onToggle}>
        <span className="prow__label">{label}</span>
        <span className="prow__value">{value}</span>
        <span className="prow__chev" aria-hidden="true">
          <IcArrow size={18} />
        </span>
      </button>
      {open && <div className="prow__body">{children}</div>}
    </div>
  )
}
