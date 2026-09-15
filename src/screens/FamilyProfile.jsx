import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { BOARDS, BUDGET_CAP, CLASSES, FORMATS, LOCALITIES, SLOTS } from '../data/seed'
import { Avatar, AvatarInput, Button, CONTACT_FIELDS, Chip, ContactFields, Field, KV, OptionGroup, SectionHead, Segmented, Sheet, SubjectPicker, Switch, TopBar } from '../components/UI'
import { IcArrow, IcInfo, IcLock, IcSwap } from '../components/Icons'
import { budgetLabel, budgetUpTo, cityName, formatLabel, formatsOf, inr, localityName, modeLabel, modesFor, slotLabel } from '../lib/utils'

export default function FamilyProfile() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const f = state.family
  const [sheet, setSheet] = useState(null)

  const save = (data) => {
    dispatch({ type: 'SAVE_FAMILY', data })
    toast('Requirement updated')
  }
  /* Sliders and text fields report themselves as you move or type them, so
     they save without a confirmation. Only discrete choices announce. */
  const saveQuiet = (data) => dispatch({ type: 'SAVE_FAMILY', data })

  const sent = state.requests.filter((r) => r.from === 'me-family')

  return (
    <>
      <TopBar title="Profile" />

      <div className="page" style={{ paddingTop: 4 }}>
        {/* ---- Identity ---- */}
        <div className="u-row" style={{ gap: 16, alignItems: 'flex-start' }}>
          <AvatarInput
            name={f.parentName}
            photo={f.photo}
            onChange={(p) => save({ photo: p })}
          />
          <div className="u-grow" style={{ paddingTop: 4 }}>
            <h1 className="h1">{f.parentName}</h1>
            <p className="sm" style={{ marginTop: 4 }}>
              Parent · {localityName(f.locality)}, {cityName(f.locality)}
            </p>
            <div className="u-wrap" style={{ marginTop: 10 }}>
              <Chip tone={f.looking ? 'indigo' : ''}>
                <span className={`dot${f.looking ? ' dot--pulse' : ''}`} />
                {f.looking ? 'Looking for a Teacher' : 'Search paused'}
              </Chip>
            </div>
          </div>
        </div>

        {/* ---- Learner ---- */}
        <SectionHead title="The learner" />
        <div className="card">
          <div className="u-row" style={{ gap: 14 }}>
            <Avatar name={f.learner} size={56} />
            <div className="u-grow">
              <span className="h3">{f.learner}</span>
              <p className="sm" style={{ marginTop: 2 }}>
                {f.classLevel} · {f.board}
              </p>
            </div>
          </div>
          <div className="notice notice--orange" style={{ marginTop: 16 }}>
            <IcLock size={19} />
            <span className="sm">
              Teachers see <strong className="strong">{f.classLevel} · {f.board}</strong> and
              your area. Not {f.learner}’s name, until you accept.
            </span>
          </div>
        </div>

        {/* ---- Requirement ---- */}
        <SectionHead
          title="What you need"
          action={
            <button className="sechead__link" onClick={() => setSheet('req')}>
              Edit
            </button>
          }
        />
        <KV
          items={[
            { k: 'Subjects', v: f.subjects.join(', ') },
            { k: 'Class', v: f.classLevel },
            { k: 'Board', v: f.board },
            { k: 'Budget', v: budgetUpTo(f.budgetMax) },
            { k: 'Mode', v: f.modes.map((m) => modeLabel(m, 'family')).join(' · ') },
            { k: 'Format', v: formatLabel(formatsOf(f)) },
            { k: 'When', v: f.slots.map(slotLabel).join(' · ') },
            { k: 'Area', v: localityName(f.locality) },
          ]}
        />

        {f.need && (
          <div className="card card--sunk" style={{ marginTop: 12 }}>
            <p className="eyebrow">What you told teachers</p>
            <p className="body" style={{ marginTop: 7, color: 'var(--ink)' }}>
              “{f.need}”
            </p>
          </div>
        )}

        {/* ---- Intent ---- */}
        <SectionHead title="Your intent" />
        <div className="card">
          <div className="u-spread" style={{ gap: 14 }}>
            <div className="u-grow">
              <span className="h3">Looking for a Teacher</span>
              <p className="sm" style={{ marginTop: 3 }}>
                {f.looking
                  ? 'Teachers nearby can see this and offer.'
                  : 'Hidden. You can still browse and send requests.'}
              </p>
            </div>
            <Switch
              checked={!!f.looking}
              label="Looking for a teacher"
              onChange={(v) => {
                dispatch({ type: 'SET_LOOKING', looking: v })
                toast(v ? 'Teachers can see this' : 'Search paused')
              }}
            />
          </div>
        </div>

        {/* ---- Counters ---- */}
        <div className="card card--sunk" style={{ marginTop: 14, padding: 0 }}>
          <div className="u-row">
            <div className="stat">
              <div className="stat__n num">{sent.length}</div>
              <div className="stat__l">Requests sent</div>
            </div>
            <div className="stat">
              <div className="stat__n num">{state.threads.filter((t) => t.withId).length}</div>
              <div className="stat__l">Connections</div>
            </div>
            <div className="stat">
              <div className="stat__n num">
                {state.threads.filter((t) => t.withId && t.active).length}
              </div>
              <div className="stat__l">Tuition running</div>
            </div>
          </div>
        </div>

        {/* ---- Appearance: one design, two grounds ---- */}
        <SectionHead title="Appearance" />
        <div className="card">
          <span className="h3">Light or dark</span>
          <p className="sm" style={{ marginTop: 6 }}>
            Instant, and changes nothing else.
          </p>
          <div style={{ marginTop: 12 }}>
            <Segmented
              items={[
                { id: 'light', label: 'Light' },
                { id: 'dark', label: 'Dark' },
              ]}
              value={state.theme ?? 'light'}
              onChange={(v) => dispatch({ type: 'SET_THEME', theme: v })}
            />
          </div>
        </div>

        {/* ---- Account ---- */}
        <SectionHead title="Account" />
        <div className="card">
          <span className="h3">{state.account ? state.account.value : 'No account yet'}</span>
          <p className="sm" style={{ marginTop: 6 }}>
            {state.account
              ? 'Your profile follows you to any phone.'
              : 'Without one, everything is lost if this browser clears.'}
          </p>
          <Button
            block
            variant={state.account ? 'ghost' : 'sunk'}
            size="sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              if (state.account) {
                dispatch({ type: 'SIGN_OUT' })
                toast('Signed out')
              } else {
                nav('/auth?next=/f/profile')
              }
            }}
          >
            {state.account ? 'Sign out' : 'Add account'}
          </Button>
        </div>

        {/* ---- Contact details, private until shared ---- */}
        <SectionHead
          title="Contact details"
          action={
            <button className="sechead__link" onClick={() => setSheet('contact')}>
              Edit
            </button>
          }
        />
        <KV
          items={CONTACT_FIELDS.map((fl) => ({
            k: fl.label,
            v: f.contact?.[fl.k] || 'Not added',
          }))}
        />
        <div className="notice" style={{ marginTop: 12 }}>
          <IcLock size={18} />
          <span>
            Never shown on your profile. Saving makes sharing one tap.
          </span>
        </div>

        {/* ---- Device ---- */}
        <SectionHead title="This device" />
        <button className="card" style={{ width: '100%' }} onClick={() => nav('/t')}>
          <div className="u-row" style={{ gap: 12 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'var(--green-t)',
                color: 'var(--green-ink)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <IcSwap size={19} />
            </span>
            <div className="u-grow">
              <span className="h3">
                {state.teacher ? 'Switch to teacher account' : 'Set up teacher account'}
              </span>
              <p className="sm" style={{ marginTop: 2 }}>
                See the other side.
              </p>
            </div>
            <IcArrow size={18} />
          </div>
        </button>

        <button
          className="card"
          style={{ width: '100%', marginTop: 10 }}
          onClick={() => nav('/intro')}
        >
          <div className="u-row" style={{ gap: 12 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'var(--orange-t)',
                color: 'var(--orange-ink)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <IcInfo size={19} />
            </span>
            <div className="u-grow">
              <span className="h3">How Bargad works</span>
              <p className="sm" style={{ marginTop: 2 }}>
                Replay the three intro screens.
              </p>
            </div>
            <IcArrow size={18} />
          </div>
        </button>

        <div className="notice" style={{ marginTop: 14 }}>
          <IcInfo size={18} />
          <span>Prototype: everything stays on this device.</span>
        </div>

        <Button
          block
          variant="ghost"
          style={{ marginTop: 12, color: 'var(--blush-ink)' }}
          /* A prototype gets reset constantly, and there is nothing here worth
             protecting: the data is fictional and the demo is one tap away
             from being rebuilt. A confirmation step would only be friction. */
          onClick={() => {
            dispatch({ type: 'RESET' })
            nav('/', { replace: true })
          }}
        >
          Reset the prototype
        </Button>
      </div>

      {/* ---- Contact sheet ---- */}
      <Sheet
        open={sheet === 'contact'}
        onClose={() => setSheet(null)}
        title="Contact details"
        subtitle="Shared only when you tap to share."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <ContactFields value={f.contact ?? {}} onChange={(v) => saveQuiet({ contact: v })} />
      </Sheet>

      {/* ---- Edit requirement ---- */}
      <Sheet
        open={sheet === 'req'}
        onClose={() => setSheet(null)}
        title="What you need"
        subtitle="Teachers read this before offering."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <Field group label="Subjects">
          <SubjectPicker
            value={f.subjects}
            onChange={(v) => save({ subjects: v })}
            custom={f.customSubjects}
            onCustomChange={(m) => save({ customSubjects: m })}
          />
        </Field>
        <Field group label="Class">
          <OptionGroup
            options={CLASSES}
            value={f.classLevel}
            onChange={(v) => save({ classLevel: v })}
            allowOther
            otherPlaceholder="Nursery"
          />
        </Field>
        <Field group label="Board">
          <OptionGroup
            options={BOARDS}
            value={f.board}
            onChange={(v) => save({ board: v })}
            allowOther
            otherPlaceholder="Bihar Board"
          />
        </Field>
        <Field label="Area">
          <select
            className="select"
            value={f.locality}
            onChange={(e) => save({ locality: e.target.value })}
          >
            {LOCALITIES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
        <Field group label="Mode">
          <OptionGroup options={modesFor('family')} value={f.modes} onChange={(v) => save({ modes: v })} multi wide />
        </Field>
        <Field group label="When">
          <OptionGroup options={SLOTS} value={f.slots} onChange={(v) => save({ slots: v })} multi wide />
        </Field>
        <Field group label="Format">
          <OptionGroup
            options={FORMATS}
            value={formatsOf(f)}
            onChange={(v) => save({ formats: v })}
            multi
          />
        </Field>
        <Field label={`Monthly budget: ${budgetLabel(f.budgetMax)}`}>
          <input
            className="range"
            type="range"
            min="1000"
            max={BUDGET_CAP}
            step="100"
            value={f.budgetMax}
            onChange={(e) => saveQuiet({ budgetMax: +e.target.value })}
          />
          <span className="xs" style={{ display: 'block', marginTop: 6 }}>
            Slide to the end for no limit.
          </span>
        </Field>
        <Field label="What is going wrong">
          {/* The same field as onboarding, so the same example. A different one
              here would read as a different question. */}
          <textarea
            className="textarea"
            value={f.need}
            onChange={(e) => saveQuiet({ need: e.target.value })}
            placeholder="Fine with algebra, loses marks in geometry. Boards in February."
          />
        </Field>
        <div style={{ height: 16 }} />
      </Sheet>
    </>
  )
}
