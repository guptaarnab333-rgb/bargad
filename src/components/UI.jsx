import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IcBack, IcCheck, IcStar, IcX } from './Icons'
import Doodle from './Doodle'
import { initials, subjectCategory, tintFor } from '../lib/utils'
import { ACADEMIC_SUBJECTS, ACTIVITY_SUBJECTS, CATEGORIES, SUBJECTS } from '../data/seed'

/* ---------------- Button ----------------
   Solid pill, label only. No icon token, no arrow. */
export function Button({
  children,
  variant = 'primary',
  size,
  block = false,
  className = '',
  ...p
}) {
  const cls = [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    // Not-ready: muted, but still tappable, and tapping says what is missing.
    p['aria-disabled'] === true && 'btn--waiting',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} {...p}>
      {children}
    </button>
  )
}

/* ---------------- Chip ---------------- */
export function Chip({ tone, children, lg, onTint, className = '', ...p }) {
  const cls = ['chip', tone && `chip--${tone}`, lg && 'chip--lg', onTint && 'chip--onTint', className]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls} {...p}>
      {children}
    </span>
  )
}

/* ---------------- Avatar ----------------
   Round, with an initials fallback if the file is missing or the network is
   down. The arch shape from the reference poster survives on the welcome tiles,
   but on a face it read as a headstone. */
export function Avatar({ name = '', size = 44, shape = 'round', photo, className = '' }) {
  const [failed, setFailed] = useState(false)
  const showPhoto = photo && !failed
  const cls = [
    'avatar',
    `avatar--${size}`,
    shape === 'arch' && 'avatar--arch',
    shape === 'round' && 'avatar--round',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls} style={showPhoto ? undefined : { background: tintFor(name) }}>
      {showPhoto ? (
        <img src={photo} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  )
}

/* ---------------- Top bar ---------------- */
export function TopBar({ title, back, right, onBack }) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      {back && (
        <button
          className="iconbtn"
          aria-label="Go back"
          onClick={() => (onBack ? onBack() : nav(-1))}
        >
          <IcBack size={20} />
        </button>
      )}
      <span className="topbar__title u-grow u-truncate">{title}</span>
      {right}
    </header>
  )
}

/* ---------------- Segmented control ---------------- */
export function Segmented({ items, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={value === it.id}
          className="seg__item"
          onClick={() => onChange(it.id)}
        >
          {it.label}
          {it.count > 0 && <span className="seg__count num">{it.count}</span>}
        </button>
      ))}
    </div>
  )
}

/* ---------------- Switch ---------------- */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      className="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    />
  )
}

/* ---------------- Fields ---------------- */
export function Field({ label, hint, children }) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}

export function OptionGroup({ options, value, onChange, multi = false, wide = false }) {
  const isOn = (v) => (multi ? (value || []).includes(v) : value === v)
  const toggle = (v) => {
    if (!multi) return onChange(v)
    const cur = value || []
    onChange(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }
  return (
    <div className="optgrid">
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.id
        const lbl = typeof o === 'string' ? o : o.label
        return (
          <button
            key={val}
            type="button"
            className={`opt${wide ? ' opt--wide' : ''}`}
            aria-pressed={isOn(val)}
            onClick={() => toggle(val)}
          >
            {lbl}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Filter chip row ---------------- */
export function FilterRow({ options, value, onChange, allLabel = 'All' }) {
  return (
    <div className="u-scroll-x chiprow chiprow--tight">
      <button className="fchip" aria-pressed={!value} onClick={() => onChange(null)}>
        {allLabel}
      </button>
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.id
        const lbl = typeof o === 'string' ? o : o.label
        return (
          <button
            key={val}
            className="fchip"
            aria-pressed={value === val}
            onClick={() => onChange(value === val ? null : val)}
          >
            {lbl}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Subject picker ----------------
   Thirty-three subjects in one grid is a wall, and finding a Maths tutor is a
   different errand from finding a guitar teacher, so the list sits behind a
   switch that shows at most eighteen at a time.

   Anything a person types in is kept on their own profile and never written
   into the shared catalogue, otherwise the taxonomy fragments into "maths",
   "Maths" and "Mathematics" within a week. A typed name that already exists is
   quietly resolved to the real entry instead of creating a duplicate. */
export function SubjectPicker({ value = [], onChange, custom = {}, onCustomChange }) {
  const [cat, setCat] = useState('academic')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  const listed = cat === 'academic' ? ACADEMIC_SUBJECTS : ACTIVITY_SUBJECTS
  const mine = Object.keys(custom).filter((s) => custom[s] === cat)
  const options = [...listed, ...mine]
  // Selected subjects that live on the other tab, so nothing a user picked can
  // silently disappear when they switch.
  const elsewhere = value.filter((s) => subjectCategory(s, custom) !== cat)
  const otherCat = cat === 'academic' ? 'activity' : 'academic'
  const otherLabel = CATEGORIES.find((c) => c.id === otherCat)?.label

  const toggle = (s) =>
    onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s])

  const commit = () => {
    const clean = draft.trim().replace(/\s+/g, ' ').slice(0, 28)
    if (!clean) return setAdding(false)
    const known = SUBJECTS.find((s) => s.toLowerCase() === clean.toLowerCase())
    const name = known ?? clean.replace(/\b\w/g, (c) => c.toUpperCase())
    if (!known && custom[name] == null) onCustomChange?.({ ...custom, [name]: cat })
    if (!value.includes(name)) onChange([...value, name])
    if (known) setCat(subjectCategory(known, custom))
    setDraft('')
    setAdding(false)
  }

  return (
    <div className="picker">
      <Segmented items={CATEGORIES} value={cat} onChange={setCat} />
      <div className="optgrid" style={{ marginTop: 12 }}>
        {options.map((s) => (
          <button
            key={s}
            type="button"
            className="opt"
            aria-pressed={value.includes(s)}
            onClick={() => toggle(s)}
          >
            {s}
          </button>
        ))}
        {!adding && (
          <button type="button" className="opt opt--add" onClick={() => setAdding(true)}>
            + Something else
          </button>
        )}
      </div>

      {adding && (
        <div className="picker__add">
          <input
            className="input"
            autoFocus
            maxLength={28}
            placeholder={cat === 'academic' ? 'e.g. Statistics' : 'e.g. Bharatanatyam'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { setDraft(''); setAdding(false) }
            }}
          />
          <Button size="sm" onClick={commit}>Add</Button>
        </div>
      )}

      {elsewhere.length > 0 && (
        <button type="button" className="picker__other" onClick={() => setCat(otherCat)}>
          Also chosen in {otherLabel}: <strong>{elsewhere.join(', ')}</strong>
        </button>
      )}
    </div>
  )
}

/* ---------------- Sheet ---------------- */
export function Sheet({ open, onClose, title, subtitle, children, footer }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <span className="sheet__grab" />
        <div className="sheet__head">
          <div className="u-grow">
            <h2 className="h2">{title}</h2>
            {subtitle && (
              <p className="sm" style={{ marginTop: 5 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button className="iconbtn iconbtn--plain" onClick={onClose} aria-label="Close">
            <IcX size={20} />
          </button>
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__foot">{footer}</div>}
      </div>
    </>
  )
}

/* ---------------- Empty state ---------------- */
export function Empty({ title, body, action, doodle = 'globe' }) {
  return (
    <div className="empty">
      <Doodle name={doodle} size={96} weight={1.4} className="empty__art" style={{ color: 'var(--ink-4)' }} />
      <h3 className="h3">{title}</h3>
      {body && (
        <p className="body" style={{ maxWidth: 290 }}>
          {body}
        </p>
      )}
      {action}
    </div>
  )
}

/* ---------------- Toasts ---------------- */
export function Toasts({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toastwrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.tone ? ` toast--${t.tone}` : ''}`} role="status">
          <IcCheck size={17} />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Stars ---------------- */
export function Stars({ value = 5, size = 13 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IcStar key={i} size={size} filled={i <= Math.round(value)} />
      ))}
    </span>
  )
}

/* ---------------- Key–value grid ---------------- */
export function KV({ items, tone = '' }) {
  return (
    <dl className={`kv${tone ? ` kv--${tone}` : ''}`}>
      {items.map((it) => (
        <div key={it.k} style={it.wide ? { gridColumn: '1 / -1' } : undefined}>
          <dt>{it.k}</dt>
          <dd>{it.v}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ---------------- Progress ---------------- */
export function Progress({ step, total }) {
  return (
    <div className="progress" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`progress__seg${i < step ? ' progress__seg--on' : ''}`}>
          <i />
        </span>
      ))}
    </div>
  )
}

/* ---------------- Section head ---------------- */
export function SectionHead({ title, meta, action }) {
  return (
    <div className="sechead">
      <h2 className="h2">{title}</h2>
      {action ?? (meta && <span className="sm">{meta}</span>)}
    </div>
  )
}

/* ---------------- Sponsored slot ----------------
   Bargad is free on both sides; advertising is how it pays for
   itself. Showing one honest, labelled slot keeps the business
   model visible in the product rather than hidden in a deck. */
export function Promo({ doodle = 'book', title, body, cta }) {
  return (
    <div className="promo">
      <span className="promo__art">
        <Doodle name={doodle} size={32} weight={1.6} style={{ color: 'var(--orange-ink)' }} />
      </span>
      <div className="u-grow">
        <span className="promo__tag">Sponsored</span>
        <p className="h3" style={{ marginTop: 3 }}>
          {title}
        </p>
        <p className="sm" style={{ marginTop: 3 }}>
          {body}
        </p>
      </div>
      {cta && (
        <Button size="sm" variant="sunk" onClick={cta.onClick}>
          {cta.label}
        </Button>
      )}
    </div>
  )
}
