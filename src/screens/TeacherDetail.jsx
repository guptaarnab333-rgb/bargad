import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { REVIEWS, SLOTS } from '../data/seed'
import { Avatar, Button, Chip, KV, Sheet, Stars, TopBar, Field, OptionGroup } from '../components/UI'
import { CapacityChip, VerifiedChip } from '../components/Cards'
import { IcCheck, IcInfo, IcLock, IcPin, IcShield } from '../components/Icons'
import {
  avgScore,
  classRange,
  distanceFrom,
  distLabel,
  inr,
  localityName,
  modeLabel,
  modesFor,
  slotLabel,
  teacherById,
} from '../lib/utils'

export default function TeacherDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()
  const t = teacherById(id)
  const f = state.family
  const [sending, setSending] = useState(false)

  const already = state.requests.find((r) => r.from === 'me-family' && r.toTeacher === id)
  const reviews = REVIEWS[id] ?? []
  const avg = avgScore(reviews)
  const km = distanceFrom(f.locality, t?.locality)

  const [payload, setPayload] = useState({
    classLevel: f.classLevel,
    board: f.board,
    subjects: f.subjects.filter((s) => t?.subjects.includes(s)),
    mode: t?.modes.find((m) => f.modes.includes(m)) ?? t?.modes[0],
    slots: f.slots.filter((s) => t?.slots.includes(s)),
    budgetMin: f.budgetMin,
    budgetMax: f.budgetMax,
    note: f.need,
  })

  if (!t) return null

  const canRequest = t.capacity !== 'full' && t.capacity !== 'paused'

  const send = () => {
    dispatch({ type: 'SEND_REQUEST', teacherId: t.id, payload })
    setSending(false)
    toast('Request sent. You will hear back soon', 'green')
    nav('/f/requests')
  }

  const set = (k, v) => setPayload((s) => ({ ...s, [k]: v }))

  return (
    <>
      <TopBar title="" back />

      <div className="page" style={{ paddingTop: 4 }}>
        {/* ---- Identity ---- */}
        <div className="u-row" style={{ gap: 16, alignItems: 'flex-start' }}>
          <Avatar name={t.name} photo={t.photo} size={96} />
          <div className="u-grow" style={{ paddingTop: 4 }}>
            <h1 className="h1">{t.name}</h1>
            <p className="sm" style={{ marginTop: 4 }}>
              {t.subjects.join(', ')} · {classRange(t.classes)}
            </p>
            <p className="sm u-row" style={{ gap: 5, marginTop: 5 }}>
              <IcPin size={13} />
              {localityName(t.locality)} · {distLabel(km)}
            </p>
          </div>
        </div>

        <div className="u-wrap" style={{ marginTop: 16 }}>
          <CapacityChip capacity={t.capacity} seatsLeft={t.seatsLeft} />
          <VerifiedChip verified={t.verified} />
          {t.rating && (
            <Chip>
              <Stars value={t.rating} size={12} />
              <span className="num">{t.rating}</span> · {t.reviewCount} reviews
            </Chip>
          )}
        </div>

        {/* ---- Fee, stated openly ---- */}
        <div
          className="card card--sunk"
          style={{ background: 'var(--orange-t)', marginTop: 18 }}
        >
          <div className="u-spread">
            <div>
              <p className="eyebrow" style={{ color: 'var(--orange-ink)' }}>
                Monthly fee
              </p>
              <p
                className="h1"
                style={{ fontSize: '1.9rem', marginTop: 4, color: 'var(--orange-ink)' }}
              >
                {inr(t.fee)}
              </p>
            </div>
            <p className="sm" style={{ maxWidth: '16ch', textAlign: 'right', color: 'var(--orange-ink)' }}>
              Set by {t.name.split(' ')[0]}. Talk about it in chat once you connect.
            </p>
          </div>
        </div>

        {t.intro && (
          <p className="body" style={{ marginTop: 22, color: 'var(--ink)' }}>
            {t.intro}
          </p>
        )}

        {/* ---- Facts ---- */}
        <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>
          The details
        </h2>
        <KV
          items={[
            { k: 'Qualification', v: t.qualification, wide: true },
            { k: 'Experience', v: `${t.experience} years` },
            { k: 'Boards', v: t.boards.join(', ') },
            { k: 'Classes', v: classRange(t.classes) },
            { k: 'How classes happen', v: t.modes.map((m) => modeLabel(m, 'family')).join(' · ') },
            { k: 'Format', v: t.formats.includes('group') ? 'One-to-one or group' : 'One-to-one' },
            { k: 'Available', v: t.slots.map(slotLabel).join(' · ') },
            { k: 'Travels up to', v: `${t.radiusKm} km` },
            { k: 'Students taught', v: `${t.studentsTaught}` },
            { k: 'Usually replies in', v: `${t.responseHrs} hours` },
          ]}
        />

        {/* ---- Verification, honestly framed ---- */}
        <div className="card" style={{ marginTop: 18 }}>
          <div className="u-row" style={{ gap: 12 }}>
            <IcShield size={20} />
            <span className="h3 u-grow">What Bargad has checked</span>
          </div>
          <ul style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {[
              ['Government ID seen', t.verified.includes('id')],
              ['Qualification document seen', t.verified.includes('qualification')],
              ['Independently verified with the university', false],
              ['Police background check', false],
            ].map(([label, done]) => (
              <li key={label} className="u-row" style={{ gap: 10 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                    background: done ? 'var(--green-t)' : 'var(--sunk)',
                    color: done ? 'var(--green-ink)' : 'var(--ink-4)',
                  }}
                >
                  {done ? <IcCheck size={12} /> : <span style={{ fontSize: 13 }}>–</span>}
                </span>
                <span className="sm" style={{ color: done ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="xs" style={{ marginTop: 14, lineHeight: 1.5 }}>
            Bargad has seen the documents a teacher uploaded. It has not confirmed them with any
            institution, and does not run background checks. Meet for a demo class before you
            decide.
          </p>
        </div>

        {/* ---- Reviews ---- */}
        {reviews.length > 0 && (
          <>
            <h2 className="h2" style={{ marginTop: 28, marginBottom: 4 }}>
              From families who finished
            </h2>
            <p className="sm" style={{ marginBottom: 14 }}>
              Reviews can only be written after a tuition relationship has ended.
            </p>
            {avg && (
              <div className="card card--sunk" style={{ marginBottom: 8 }}>
                <div className="u-row">
                  {[
                    ['Teaching', avg.teaching],
                    ['Knowledge', avg.knowledge],
                    ['Punctuality', avg.punctuality],
                    ['Communication', avg.communication],
                  ].map(([l, v]) => (
                    <div key={l} className="stat">
                      <div className="stat__n num">{v}</div>
                      <div className="stat__l">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reviews.map((r) => (
              <div key={r.by} className="review">
                <div className="u-spread">
                  <span className="strong">{r.by}</span>
                  <Stars value={r.scores.teaching} size={12} />
                </div>
                <p className="xs" style={{ marginTop: 2 }}>
                  {r.months} months of tuition · ended {r.when}
                </p>
                <p className="body" style={{ marginTop: 8 }}>
                  {r.text}
                </p>
              </div>
            ))}
          </>
        )}

        {/* ---- Privacy ---- */}
        <div className="notice notice--orange" style={{ marginTop: 24 }}>
          <IcLock size={19} />
          <span className="sm">
            <strong className="strong">Nothing private is shown here.</strong> No phone number,
            no address. If {t.name.split(' ')[0]} accepts your request, a private chat opens and
            you can share what you choose.
          </span>
        </div>

        {/* ---- CTA ---- */}
        <div style={{ marginTop: 26 }}>
          {already ? (
            <Button block variant="quiet" onClick={() => nav('/f/requests')}>
              You have already sent a request. See it
            </Button>
          ) : canRequest ? (
            <Button block onClick={() => setSending(true)}>
              Send a request
            </Button>
          ) : (
            <>
              <Button block variant="quiet" disabled>
                {t.name.split(' ')[0]} is currently full
              </Button>
              <p className="xs" style={{ textAlign: 'center', marginTop: 10 }}>
                Teachers who cannot take a student are shown, but not contactable, so you do not
                spend a week waiting for a no.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ---- Structured request ---- */}
      <Sheet
        open={sending}
        onClose={() => setSending(false)}
        title={`Request ${t.name.split(' ')[0]}`}
        subtitle="Already filled in from your requirement. Change anything that is different for this teacher."
        footer={
          <Button block onClick={send} disabled={!payload.subjects.length}>
            Send request
          </Button>
        }
      >
        <div className="card card--sunk" style={{ marginBottom: 20 }}>
          <p className="eyebrow">They will see</p>
          <p className="h3" style={{ marginTop: 6 }}>
            {f.classLevel} · {f.board} · {localityName(f.locality)}
          </p>
          <p className="xs" style={{ marginTop: 6 }}>
            Not {f.learner}’s full name, your address or your number. Those stay private unless
            you accept each other.
          </p>
        </div>

        <Field label="Subjects you need">
          <OptionGroup
            options={t.subjects}
            value={payload.subjects}
            onChange={(v) => set('subjects', v)}
            multi
          />
        </Field>

        <Field label="How should classes happen?">
          <OptionGroup
            options={modesFor('family').filter((m) => t.modes.includes(m.id))}
            value={payload.mode}
            onChange={(v) => set('mode', v)}
            wide
          />
        </Field>

        <Field label="When suits you?" hint={`${t.name.split(' ')[0]} is free: ${t.slots.map(slotLabel).join(', ')}`}>
          <OptionGroup
            options={SLOTS.filter((s) => t.slots.includes(s.id))}
            value={payload.slots}
            onChange={(v) => set('slots', v)}
            multi
            wide
          />
        </Field>

        <Field
          label="Anything they should know"
          hint="Teachers say this is the part they read first."
        >
          <textarea
            className="textarea"
            value={payload.note}
            onChange={(e) => set('note', e.target.value)}
          />
        </Field>

        <div className="notice" style={{ marginBottom: 24 }}>
          <IcInfo size={18} />
          <span>
            Their fee is <strong className="strong">{inr(t.fee)}/month</strong>; your budget is{' '}
            {inr(f.budgetMin)}–{inr(f.budgetMax)}.{' '}
            {t.fee > f.budgetMax
              ? 'That is above your range. Say so here rather than after a demo.'
              : 'That fits.'}
          </span>
        </div>
      </Sheet>
    </>
  )
}
