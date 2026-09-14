import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { BOARDS, BUDGET_CAP, CLASSES, FORMATS, LOCALITIES, SLOTS } from '../data/seed'
import { Avatar, AvatarInput, Button, CONTACT_FIELDS, Chip, ContactFields, Field, KV, OptionGroup, SectionHead, Segmented, Sheet, SubjectPicker, Switch, TopBar } from '../components/UI'
import { IcArrow, IcInfo, IcLock, IcSwap } from '../components/Icons'
import { budgetLabel, budgetUpTo, cityName, inr, localityName, modeLabel, modesFor, slotLabel } from '../lib/utils'

export default function FamilyProfile() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const f = state.family
  const [sheet, setSheet] = useState(null)

  const save = (data) => {
    dispatch({ type: 'SAVE_FAMILY', data })
    toast('Requirement updated')
  }

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
              Teachers see <strong className="strong">“{f.classLevel} · {f.board}”</strong> and
              your locality. {f.learner}’s name reaches a teacher only when you accept them.
            </span>
          </div>
        </div>

        {/* ---- Requirement ---- */}
        <SectionHead
          title="What you are looking for"
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
            { k: 'Format', v: f.format === 'group' ? 'Small group' : 'One-to-one' },
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
                  ? 'Teachers nearby can see this requirement and offer to teach.'
                  : 'Hidden from teachers. You can still browse and send requests yourself.'}
              </p>
            </div>
            <Switch
              checked={!!f.looking}
              label="Looking for a teacher"
              onChange={(v) => {
                dispatch({ type: 'SET_LOOKING', looking: v })
                toast(v ? 'Teachers can see your requirement' : 'Your search is paused')
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

        {/* ---- Appearance: two complete designs, one build ---- */}
        <SectionHead title="Appearance" />
        <div className="card">
          <span className="h3">Design style</span>
          <p className="sm" style={{ marginTop: 6 }}>
            Both are complete. Switching is instant and changes nothing about how the app
            works, so either can be the one you keep.
          </p>
          <div style={{ marginTop: 12 }}>
            <Segmented
              items={[
                { id: 'original', label: 'Original' },
                { id: 'soft', label: 'Soft' },
              ]}
              value={state.skin ?? 'original'}
              onChange={(v) => dispatch({ type: 'SET_SKIN', skin: v })}
            />
          </div>
        </div>

        {/* ---- Account ---- */}
        <SectionHead title="Account" />
        <div className="card">
          <span className="h3">{state.account ? state.account.value : 'No account yet'}</span>
          <p className="sm" style={{ marginTop: 6 }}>
            {state.account
              ? 'Your profile comes back on any phone you log in from.'
              : 'Everything is on this device only. An account means it survives a new phone or a cleared browser.'}
          </p>
          <Button
            block
            variant={state.account ? 'ghost' : 'sunk'}
            size="sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              if (state.account) {
                dispatch({ type: 'SIGN_OUT' })
                toast('Signed out of this device')
              } else {
                nav('/auth?next=/f/profile')
              }
            }}
          >
            {state.account ? 'Sign out' : 'Add an account'}
          </Button>
        </div>

        {/* ---- Contact details, private until shared ---- */}
        <SectionHead
          title="Your contact details"
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
            Never shown on your profile and never used for matching. Saving them here only
            means that sharing one later is a single tap.
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
                {state.teacher ? 'Switch to your teacher account' : 'Set up a teacher account'}
              </span>
              <p className="sm" style={{ marginTop: 2 }}>
                See the other side of the same network.
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
              <span className="h3">What Bargad does differently</span>
              <p className="sm" style={{ marginTop: 2 }}>
                The three screens you saw when you first opened the app.
              </p>
            </div>
            <IcArrow size={18} />
          </div>
        </button>

        <div className="notice" style={{ marginTop: 14 }}>
          <IcInfo size={18} />
          <span>Prototype: everything stays on this device. Nothing is sent anywhere.</span>
        </div>

        <Button
          block
          variant="ghost"
          style={{ marginTop: 12, color: 'var(--blush-ink)' }}
          onClick={() => {
            if (confirm('Clear all prototype data on this device?')) {
              dispatch({ type: 'RESET' })
              nav('/', { replace: true })
            }
          }}
        >
          Reset the prototype
        </Button>
      </div>

      {/* ---- Contact sheet ---- */}
      <Sheet
        open={sheet === 'contact'}
        onClose={() => setSheet(null)}
        title="Your contact details"
        subtitle="Private. Shared only when you tap to share, after both sides have agreed to meet."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <ContactFields value={f.contact ?? {}} onChange={(v) => save({ contact: v })} />
      </Sheet>

      {/* ---- Edit requirement ---- */}
      <Sheet
        open={sheet === 'req'}
        onClose={() => setSheet(null)}
        title="What you are looking for"
        subtitle="Teachers read this before deciding whether to offer."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <Field label="Subjects">
          <SubjectPicker
            value={f.subjects}
            onChange={(v) => save({ subjects: v })}
            custom={f.customSubjects}
            onCustomChange={(m) => save({ customSubjects: m })}
          />
        </Field>
        <Field label="Class">
          <OptionGroup options={CLASSES} value={f.classLevel} onChange={(v) => save({ classLevel: v })} />
        </Field>
        <Field label="Board">
          <OptionGroup options={BOARDS} value={f.board} onChange={(v) => save({ board: v })} />
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
        <Field label="Mode">
          <OptionGroup options={modesFor('family')} value={f.modes} onChange={(v) => save({ modes: v })} multi wide />
        </Field>
        <Field label="When">
          <OptionGroup options={SLOTS} value={f.slots} onChange={(v) => save({ slots: v })} multi wide />
        </Field>
        <Field label="Format">
          <OptionGroup options={FORMATS} value={f.format} onChange={(v) => save({ format: v })} />
        </Field>
        <Field label={`Monthly budget: ${budgetLabel(f.budgetMax)}`}>
          <input
            className="range"
            type="range"
            min="1000"
            max={BUDGET_CAP}
            step="100"
            value={f.budgetMax}
            onChange={(e) => save({ budgetMax: +e.target.value })}
          />
          <span className="xs" style={{ display: 'block', marginTop: 6 }}>
            The most you can pay each month. Slide to the end for no limit.
          </span>
        </Field>
        <Field label="What is going wrong">
          <textarea
            className="textarea"
            value={f.need}
            onChange={(e) => save({ need: e.target.value })}
          />
        </Field>
        <div style={{ height: 16 }} />
      </Sheet>
    </>
  )
}
