import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { SLOTS } from '../data/seed'
import { Avatar, Button, Chip, Field, KV, OptionGroup, Sheet, TopBar } from '../components/UI'
import { IcCheck, IcInfo, IcLock, IcPin, IcX } from '../components/Icons'
import { asList, budgetLabel, budgetUpTo, distanceFrom, distLabel, formatLabel, formatsOf, inr, localityName, modeLabel, modesFor, requirementById, scoreRequirementForTeacher, shares, slotLabel } from '../lib/utils'

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

  /* Both sides can do more than one arrangement, so an offer starts from
     everything they already share rather than from one arbitrary pick. */
  const sharedModes = t.modes.filter((m) => (r?.modes ?? []).includes(m))
  const sharedFormats = asList(t.formats).filter((x) => formatsOf(r).includes(x))
  const [payload, setPayload] = useState({
    modes: sharedModes.length ? sharedModes : t.modes.slice(0, 1),
    slots: t.slots.filter((s) => r?.slots.includes(s)),
    fee: t.fee,
    formats: sharedFormats.length ? sharedFormats : asList(t.formats).slice(0, 1),
    note: '',
  })

  if (!r) return null
  const set = (k, v) => setPayload((s) => ({ ...s, [k]: v }))

  const send = () => {
    dispatch({ type: 'SEND_RESPONSE', requirementId: r.id, payload })
    setOffering(false)
    toast('Offer sent', 'green')
    nav('/t/requests')
  }

  // Honest, explainable fit: the product never hides why something is shown.
  const checks = [
    ['Subject', r.subjects.some((s) => t.subjects.includes(s))],
    ['Class level', t.classes.includes(r.classLevel)],
    ['Board', t.boards.includes(r.board)],
    ['In your travel radius', km != null && km <= t.radiusKm],
    ['Times overlap', t.slots.some((s) => r.slots.includes(s))],
    ['Fee fits their budget', t.fee <= r.budgetMax],
    ['Format you offer', shares(t.formats, formatsOf(r))],
  ]
  const met = checks.filter(([, v]) => v).length

  return (
    <>
      <TopBar title="" back />

      <div className="page" style={{ paddingTop: 4 }}>
        <p className="eyebrow">A family needs</p>
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
          <Chip>{formatLabel(formatsOf(r))}</Chip>
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
              <p className="xs">Parent · {localityName(r.locality)}</p>
            </div>
          </div>
        </div>

        {/* ---- Their terms ---- */}
        <h2 className="h2" style={{ marginTop: 28, marginBottom: 12 }}>
          What they want
        </h2>
        <KV
          items={[
            { k: 'Budget', v: `${budgetUpTo(r.budgetMax)}/mo` },
            { k: 'Your fee', v: `${inr(t.fee)}/mo` },
            { k: 'Mode', v: r.modes.map((m) => modeLabel(m, 'teacher')).join(' · ') },
            { k: 'Format', v: formatLabel(formatsOf(r)) },
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
            <span className="h3">Why you see this</span>
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
            This is a requirement, not a child. Names appear only if they accept you.
          </span>
        </div>

        <div style={{ marginTop: 26 }}>
          {already ? (
            <Button block variant="quiet" onClick={() => nav('/t/requests')}>
              See your offer
            </Button>
          ) : (
            <>
              <Button block onClick={() => setOffering(true)}>
                Offer to teach
              </Button>
              <p className="xs" style={{ textAlign: 'center', marginTop: 10 }}>
                Always free to reply.
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
        subtitle="They can accept, decline or ask a question."
        footer={
          <Button
            block
            aria-disabled={!payload.modes.length || !payload.formats.length}
            onClick={() =>
              !payload.modes.length
                ? toast('Choose how you would teach')
                : !payload.formats.length
                  ? toast('Choose a class format')
                  : send()
            }
          >
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
            Your profile, area and fee. Not your address.
          </p>
        </div>

        {/* Your profile is what families search by, not a cage. Filtering
            these three down to it meant a family could ask for a Sunday and you
            had no way to say yes without going to Profile and editing your
            availability first. The fee below already lets you make a one-off
            exception for one family; so do these. */}
        <Field group label="How you teach" hint="Pick any you can do for them.">
          <OptionGroup
            options={modesFor('teacher')}
            value={payload.modes}
            onChange={(v) => set('modes', v)}
            multi
            wide
          />
        </Field>

        <Field group label="Format" hint="Pick any you can do for them.">
          <OptionGroup
            options={[
              { id: 'one', label: 'One-to-one' },
              { id: 'group', label: 'Small group' },
            ]}
            value={payload.formats}
            onChange={(v) => set('formats', v)}
            multi
          />
        </Field>

        <Field group label="Times you offer" hint={`They are free: ${r.slots.map(slotLabel).join(', ')}`}>
          <OptionGroup
            options={SLOTS}
            value={payload.slots}
            onChange={(v) => set('slots', v)}
            multi
            wide
          />
        </Field>

        <Field
          label={`Your fee: ${inr(payload.fee)}/month`}
          hint={`They can pay ${budgetLabel(r.budgetMax)}. You can offer differently.`}
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
          label="Short note"
          hint="How would you approach this?"
        >
          <textarea
            className="textarea"
            value={payload.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder={`I have taught ${r.classLevel} ${r.board} ${r.subjects[0]} for years…`}
          />
        </Field>

        {payload.fee > r.budgetMax && (
          <div className="notice" style={{ marginBottom: 24 }}>
            <IcInfo size={18} />
            <span>
              Above their budget. Say so now, not after a demo.
            </span>
          </div>
        )}
      </Sheet>
    </>
  )
}
