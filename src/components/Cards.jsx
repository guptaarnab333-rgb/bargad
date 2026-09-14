import { Link } from 'react-router-dom'
import { Avatar, Chip, Stars } from './UI'
import { IcClock, IcPeople, IcPin, IcShield } from './Icons'
import { CAPACITY } from '../data/seed'
import { budgetUpTo, distLabel, inr, localityName, modesLine, slotShort, STATUS_META, teachesRange } from '../lib/utils'

/* Capacity is shown wherever a teacher appears. It answers
   "why am I contacting someone who cannot take my child?" */
export function CapacityChip({ capacity, seatsLeft, onTint = false }) {
  const c = CAPACITY[capacity] ?? CAPACITY.open
  const label =
    capacity === 'open' && seatsLeft
      ? `Open to Teach · ${seatsLeft} ${seatsLeft === 1 ? 'seat' : 'seats'}`
      : capacity === 'limited'
        ? `Limited · ${seatsLeft ?? 1} seat left`
        : c.label
  return (
    <Chip tone={c.tone || undefined} onTint={!c.tone && onTint}>
      <span className={`dot${capacity === 'open' ? ' dot--pulse' : ''}`} />
      {label}
    </Chip>
  )
}

export function VerifiedChip({ verified = [] }) {
  if (!verified.length) return null
  const hasQual = verified.includes('qualification')
  return (
    <Chip tone="indigo" title="Prototype verification state">
      <IcShield size={13} />
      {hasQual ? 'ID + documents seen' : 'ID checked'}
    </Chip>
  )
}

/* ---------------- Teacher card ---------------- */
export function TeacherCard({ teacher: t, to, reasons = [], km, compact = false }) {
  return (
    <Link to={to} className="card">
      <div className="u-row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={t.name} photo={t.photo} size={compact ? 44 : 56} />
        <div className="u-grow">
          <div className="u-spread" style={{ gap: 10, alignItems: 'flex-start' }}>
            <div className="tcard__name u-grow">{t.name}</div>
            <div className="tcard__price">
              {inr(t.fee)}
              <span>per month</span>
            </div>
          </div>
          <div className="tcard__meta">
            {t.subjects.join(', ')} · {teachesRange(t)}
          </div>
          <div className="tcard__meta u-row" style={{ gap: 5, marginTop: 3 }}>
            <IcPin size={13} />
            <span className="u-truncate">
              {localityName(t.locality)}
              {km != null && ` · ${distLabel(km)}`}
            </span>
          </div>
        </div>
      </div>

      {reasons.length > 0 && (
        <div className="u-wrap" style={{ marginTop: 14 }}>
          {reasons.map((r) => (
            <Chip key={r} tone="indigo">
              {r}
            </Chip>
          ))}
        </div>
      )}

      <div className="tcard__foot">
        <CapacityChip capacity={t.capacity} seatsLeft={t.seatsLeft} />
        <span className="xs u-row" style={{ gap: 5 }}>
          <Stars value={t.rating} size={12} />
          <span className="num strong">{t.rating}</span>
          <span>({t.reviewCount})</span>
        </span>
      </div>
    </Link>
  )
}

/* ---------------- Requirement card ---------------- */
export function RequirementCard({ req, to, reasons = [], km, hot = false }) {
  return (
    <Link to={to} className={`rcard${hot ? ' rcard--hot' : ''}`}>
      <div className="u-spread" style={{ gap: 12, alignItems: 'flex-start' }}>
        <div className="rcard__q u-grow">
          {req.subjects.join(' & ')}
          <br />
          {req.classLevel} · {req.board}
        </div>
        <div className="tcard__price">
          {budgetUpTo(req.budgetMax)}
          <span>budget / month</span>
        </div>
      </div>

      <div className="u-wrap" style={{ marginTop: 14 }}>
        <Chip onTint>
          <IcPin size={12} />
          {localityName(req.locality)}
          {km != null ? ` · ${km} km` : ''}
        </Chip>
        <Chip onTint>
          <IcClock size={12} />
          {req.slots.map(slotShort).join(', ')}
        </Chip>
        <Chip onTint>
          {req.format === 'group' ? <IcPeople size={12} /> : null}
          {req.format === 'group' ? 'Small group' : 'One-to-one'} · {modesLine(req.modes)}
        </Chip>
      </div>

      {req.need && <p className="rcard__need">{req.need}</p>}

      {reasons.length > 0 && (
        <div className="u-wrap" style={{ marginTop: 12 }}>
          {reasons.map((r) => (
            <Chip key={r} tone="ink">
              {r}
            </Chip>
          ))}
        </div>
      )}

      <div className="rcard__foot">
        <span className="xs strong">Posted {req.posted}</span>
        <span className="xs" style={{ color: 'var(--ink-2)' }}>
          {req.responses} {req.responses === 1 ? 'teacher has' : 'teachers have'} responded
        </span>
      </div>
    </Link>
  )
}

/* ---------------- Request card ---------------- */
export function RequestCard({ title, sub, status, meta, to, avatarName, avatarPhoto, footer }) {
  const s = STATUS_META[status] ?? STATUS_META.pending
  const inner = (
    <>
      <div className="u-row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <Avatar name={avatarName} photo={avatarPhoto} size={44} />
        <div className="u-grow">
          <div className="u-spread" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span className="h3 u-grow">{title}</span>
            <Chip tone={s.tone || undefined}>{s.label}</Chip>
          </div>
          <p className="sm" style={{ marginTop: 3 }}>
            {sub}
          </p>
          {meta && (
            <p className="xs" style={{ marginTop: 6 }}>
              {meta}
            </p>
          )}
        </div>
      </div>
      {footer}
    </>
  )
  return to ? (
    <Link to={to} className="card">
      {inner}
    </Link>
  ) : (
    <div className="card">{inner}</div>
  )
}
