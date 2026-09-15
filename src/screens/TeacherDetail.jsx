import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { REVIEWS, SLOTS } from '../data/seed'
import { Avatar, Button, Chip, KV, Sheet, Stars, TopBar, Field, OptionGroup } from '../components/UI'
import { CapacityChip, VerifiedChip } from '../components/Cards'
import { IcCheck, IcInfo, IcLock, IcPin, IcShield } from '../components/Icons'
import { avgScore, budgetLabel, distanceFrom, distLabel, formatLabel, inr, localityName, modeLabel, modesFor, slotLabel, teacherById, teachesRange } from '../lib/utils'

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

  /* Start from everything the two sides already have in common rather than
     from one arbitrary pick, and let either side be dropped. */
  const sharedModes = (t?.modes ?? []).filter((m) => f.modes.includes(m))
  const [payload, setPayload] = useState({
    classLevel: f.classLevel,
    board: f.board,
    subjects: f.subjects.filter((s) => t?.subjects.includes(s)),
    modes: sharedModes.length ? sharedModes : (t?.modes ?? []).slice(0, 1),
    slots: f.slots.filter((s) => t?.slots.includes(s)),
    budgetMax: f.budgetMax,
    note: f.need,
  })

  /* An id that no longer resolves used to render an empty page with a tab bar
     and no way back. Every other screen in the app returns you somewhere. */
  useEffect(() => {
    if (!t) nav('/f/discover', { replace: true })
  }, [t])

  if (!t) return null

  const canRequest = t.capacity !== 'full' && t.capacity !== 'paused'

  const send = () => {
    dispatch({ type: 'SEND_REQUEST', teacherId: t.id, payload })
    setSending(false)
    toast('Request sent', 'green')
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
              {t.subjects.join(', ')} · {teachesRange(t)}
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
              Set by {t.name.split(' ')[0]}. Discuss it in chat.
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
          Details
        </h2>
        <KV
          items={[
            { k: 'Qualification', v: t.qualification, wide: true },
            { k: 'Experience', v: `${t.experience} years` },
            { k: 'Boards', v: t.boards.join(', ') },
            { k: t.classes?.length ? 'Classes' : 'Age groups', v: teachesRange(t) },
            { k: 'How classes happen', v: t.modes.map((m) => modeLabel(m, 'family')).join(' · ') },
            { k: 'Format', v: formatLabel(t.formats) },
            { k: 'Available', v: t.slots.map(slotLabel).join(' · ') },
            { k: 'Travels up to', v: `${t.radiusKm} km` },
            { k: 'Students taught', v: `${t.studentsTaught}` },
            { k: 'Replies in', v: `${t.responseHrs} hours` },
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
              ['Qualification seen', t.verified.includes('qualification')],
              ['Verified with the university', false],
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
            Bargad has seen these documents, not confirmed them. Meet before you decide.
          </p>
        </div>

        {/* ---- Reviews ---- */}
        {reviews.length > 0 && (
          <>
            <h2 className="h2" style={{ marginTop: 28, marginBottom: 4 }}>
              After tuition ended
            </h2>
            <p className="sm" style={{ marginBottom: 14 }}>
              Written only after tuition ends.
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
            <strong className="strong">Nothing private here.</strong> A chat opens only if{' '}
            {t.name.split(' ')[0]} accepts.
          </span>
        </div>

        {/* ---- CTA ---- */}
        <div style={{ marginTop: 26 }}>
          {already ? (
            <Button block variant="quiet" onClick={() => nav('/f/requests')}>
              See your request
            </Button>
          ) : canRequest ? (
            <Button block onClick={() => setSending(true)}>
              Send request
            </Button>
          ) : (
            <>
              <Button block variant="quiet" disabled>
                {t.name.split(' ')[0]} is currently full
              </Button>
              <p className="xs" style={{ textAlign: 'center', marginTop: 10 }}>
                Full teachers are shown, but not contactable.
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
        subtitle="Filled in from your requirement. Change anything."
        footer={
          <Button
            block
            onClick={() =>
              !payload.subjects.length
                ? toast('Choose at least one subject')
                : !payload.modes.length
                  ? toast('Choose how classes happen')
                  : send()
            }
            aria-disabled={!payload.subjects.length || !payload.modes.length}
          >
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
            Not {f.learner}’s name, your address or your number.
          </p>
        </div>

        <Field group label="Subjects">
          <OptionGroup
            options={t.subjects}
            value={payload.subjects}
            onChange={(v) => set('subjects', v)}
            multi
          />
        </Field>

        <Field group label="How classes happen" hint="Pick any that suit you.">
          <OptionGroup
            options={modesFor('family').filter((m) => t.modes.includes(m.id))}
            value={payload.modes}
            onChange={(v) => set('modes', v)}
            multi
            wide
          />
        </Field>

        <Field group label="When suits you" hint={`${t.name.split(' ')[0]} is free: ${t.slots.map(slotLabel).join(', ')}`}>
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
          hint="Teachers read this first."
        >
          {/* This starts filled from the requirement, but a family that left
              that blank met an empty box with nothing telling them it wanted
              writing. The example does that job; the hint alone did not. */}
          <textarea
            className="textarea"
            value={payload.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="Boards in February. Loses marks in geometry."
          />
        </Field>

        <div className="notice" style={{ marginBottom: 24 }}>
          <IcInfo size={18} />
          <span>
            <strong className="strong">{inr(t.fee)}/month</strong> against your budget of{' '}
            {budgetLabel(f.budgetMax)}.{' '}
            {t.fee > f.budgetMax
              ? 'Above your range. Say so now, not after a demo.'
              : 'That fits.'}
          </span>
        </div>
      </Sheet>
    </>
  )
}
