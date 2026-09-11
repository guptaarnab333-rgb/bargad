import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IcBack, IcCheck, IcStar, IcX } from './Icons'
import Doodle from './Doodle'
import { initials, tintFor } from '../lib/utils'

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
   Photograph in the signature arch shape, with an initials
   fallback if the file is missing or the network is down. */
export function Avatar({ name = '', size = 44, shape = 'arch', photo, className = '' }) {
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
    <div className="u-scroll-x" style={{ padding: '2px 20px' }}>
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
