import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { MODES, SLOTS } from '../data/seed'
import { Avatar, Button, Chip, Field, KV, OptionGroup, Sheet, TopBar } from '../components/UI'
import { IcCheck, IcInfo, IcLock, IcPin, IcX } from '../components/Icons'
import {
  distanceFrom,
  distLabel,
  inr,
  localityName,
  modeLabel,
  requirementById,
  scoreRequirementForTeacher,
  slotLabel,
} from '../lib/utils'

export default function RequirementDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()
  const r = requirementById(id)
  const t = state.teacher
  const [offering, setOffering] = useState(false)

  const already = state.requests.find((q) => q.from === 'me-teacher' && q.toRequirement === id)
  const km = distanceFrom(t.locality, r?.locality)
  const fit = scoreRequirementForTeacher(r ?? {}, t)

  const [payload, setPayload] = useState({
    mode: t.modes.find((m) => r?.modes.includes(m)) ?? t.modes[0],
    slots: t.slots.filter((s) => r?.slots.includes(s)),
    fee: t.fee,
    format: r?.format ?? 'one',
    note: '',
  })

  if (!r) return null
  const set = (k, v) => setPayload((s) => ({ ...s, [k]: v }))

  const send = () => {
    dispatch({ type: 'SEND_RESPONSE', requirementId: r.id, payload })
    setOffering(false)
    toast('Your offer has been sent', 'green')
    nav('/t/requests')
  }

  // Honest, explainable fit: the product never hides why something is shown.
  const checks = [
    ['Subject', r.subjects.some((s) => t.subjects.includes(s))],
    ['Class level', t.classes.includes(r.classLevel)],
    ['Board', t.boards.includes(r.board)],
    ['Within your travel radius', km != null && km <= t.radiusKm],
    ['Time overlap', t.slots.some((s) => r.slots.includes(s))],
    ['Your fee is inside their budget', t.fee <= r.budgetMax],
    ['Format you offer', t.formats.includes(r.format)],
  ]
  const met = checks.filter(([, v]) => v).length

  return (
    <>
      <TopBar title="" back />

      <div className="page" style={{ paddingTop: 4 }}>
        <p className="eyebrow">A family is looking for</p>
        <h1 className="display" style={{ marginTop: 8, fontSize: '2rem' }}>
          {r.subjects.join(' & ')}
          <br />
          <em>
            {r.classLevel} · {r.board}
          </em>
        </h1>

        <div className="u-wrap" style={{ marginTop: 16 }}>
          <Chip tone="indigo">
            <IcPin size={12} />
            {localityName(r.locality)} · {distLabel(km)}
          </Chip>
          <Chip>{r.format === 'group' ? 'Small group' : 'One-to-one'}</Chip>
          <Chip>Posted {r.posted}</Chip>
        </div>

        {/* ---- What they wrote ---- */}
        <div className="card card--sunk" style={{ background: 'var(--indigo-t)', marginTop: 20 }}>
          <p className="eyebrow" style={{ color: 'var(--indigo-ink)' }}>
            In their words
          </p>
          <p className="body" style={{ marginTop: 8, color: 'var(--ink)' }}>
            “{r.need}”
          </p>
          <div
            className="u-row"
            style={{
              gap: 10,
              marginTop: 16,
                          }}
          >
            <Avatar name={r.family} size={44} />
            <div className="u-grow">
              <span className="strong">{r.family}</span>
              <p className="xs">Parent · joined via {localityName(r.locality)}</p>
            </div>
          </div>
        </div>

        {/* ---- Their terms ---- */}
        <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>
          What they are asking for
        </h2>
        <KV
          items={[
            { k: 'Budget', v: `${inr(r.budgetMin)}–${inr(r.budgetMax)}/mo` },
            { k: 'Your fee', v: `${inr(t.fee)}/mo` },
            { k: 'Mode', v: r.modes.map((m) => modeLabel(m)).join(' · ') },
            { k: 'Format', v: r.format === 'group' ? 'Small group' : 'One-to-one' },
            { k: 'When', v: r.slots.map(slotLabel).join(' · ') },
            {
              k: 'Responses so far',
              v: `${r.responses} ${r.responses === 1 ? 'teacher' : 'teachers'}`,
            },
          ]}
        />

        {/* ---- Explainable fit ---- */}
        <div className="card" style={{ marginTop: 18 }}>
          <div className="u-spread">
            <span className="h3">Why you are seeing this</span>
            <Chip tone={met >= 6 ? "green" : met >= 4 ? "orange" : ""}>
              {met} of {checks.length}
            </Chip>
          </div>
          <ul style={{ marginTop: 14, display: 'grid', gap: 9 }}>
            {checks.map(([label, ok]) => (
              <li key={label} className="u-row" style={{ gap: 10 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                    background: ok ? 'var(--green-t)' : 'var(--sunk)',
                    color: ok ? 'var(--green-ink)' : 'var(--ink-4)',
                  }}
                >
                  {ok ? <IcCheck size={12} /> : <IcX size={11} />}
                </span>
                <span className="sm" style={{ color: ok ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="notice notice--orange" style={{ marginTop: 18 }}>
          <IcLock size={19} />
          <span className="sm">
            You are seeing a requirement, not a child. The learner’s name, the family’s address
            and their number appear only if they accept you.
          </span>
        </div>

        <div style={{ marginTop: 26 }}>
          {already ? (
            <Button block variant="quiet" onClick={() => nav('/t/requests')}>
              You have already responded. See it
            </Button>
          ) : (
            <>
              <Button block onClick={() => setOffering(true)}>
                Offer to teach
              </Button>
              <p className="xs" style={{ textAlign: 'center', marginTop: 10 }}>
                Free. Bargad never charges you to reply to a family.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ---- Structured response ---- */}
      <Sheet
        open={offering}
        onClose={() => setOffering(false)}
        title={`Offer to teach ${r.subjects.join(' & ')}`}
        subtitle="Say exactly what you can do. They accept, decline, or ask you a question."
        footer={
          <Button block onClick={send}>
            Send offer
          </Button>
        }
      >
        <div className="card card--sunk" style={{ marginBottom: 20 }}>
          <p className="eyebrow">They will see</p>
          <p className="h3" style={{ marginTop: 6 }}>
            {t.name} · {t.qualification}
          </p>
          <p className="xs" style={{ marginTop: 6 }}>
            Your public profile, locality and fee, not your address or phone number.
          </p>
        </div>

        <Field label="How you would teach">
          <OptionGroup
            options={MODES.filter((m) => t.modes.includes(m.id))}
            value={payload.mode}
            onChange={(v) => set('mode', v)}
            wide
          />
        </Field>

        <Field label="Format">
          <OptionGroup
            options={[
              { id: 'one', label: 'One-to-one' },
              { id: 'group', label: 'Small group' },
            ].filter((o) => t.formats.includes(o.id))}
            value={payload.format}
            onChange={(v) => set('format', v)}
          />
        </Field>

        <Field label="Times you can offer">
          <OptionGroup
            options={SLOTS.filter((s) => t.slots.includes(s.id))}
            value={payload.slots}
            onChange={(v) => set('slots', v)}
            multi
            wide
          />
        </Field>

        <Field
          label={`Your fee for this: ${inr(payload.fee)}/month`}
          hint={`Their budget is ${inr(r.budgetMin)}–${inr(r.budgetMax)}. You can offer a different fee for this family.`}
        >
          <input
            className="range"
            type="range"
            min="1000"
            max="12000"
            step="100"
            value={payload.fee}
            onChange={(e) => set('fee', +e.target.value)}
          />
        </Field>

        <Field
          label="A short note"
          hint="One or two lines about how you would approach what they described."
        >
          <textarea
            className="textarea"
            value={payload.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder={`I have taught ${r.classLevel} ${r.board} ${r.subjects[0]} for several years…`}
          />
        </Field>

        {payload.fee > r.budgetMax && (
          <div className="notice" style={{ marginBottom: 24 }}>
            <IcInfo size={18} />
            <span>
              Your fee is above their stated budget. Being upfront now is better than after a
              demo class. Many families will still say yes if you explain why.
            </span>
          </div>
        )}
      </Sheet>
    </>
  )
}
