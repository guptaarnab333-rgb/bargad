import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { AGE_BANDS, BOARDS, CAPACITY, CLASSES, SEATS_CAP, SLOTS } from '../data/seed'
import { Avatar, AvatarInput, Button, CONTACT_FIELDS, Chip, ContactFields, Field, KV, OptionGroup, SectionHead, Segmented, Sheet, SubjectPicker, TopBar } from '../components/UI'
import { CapacityChip } from '../components/Cards'
import { IcArrow, IcCheck, IcInfo, IcLock, IcShield, IcSwap } from '../components/Icons'
import { cityName, formatLabel, inr, localityName, modeLabel, modesFor, seatsLabel, slotLabel, subjectsInCategory, teachesRange } from '../lib/utils'

export default function TeacherProfile() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const t = state.teacher
  const [sheet, setSheet] = useState(null)

  const save = (data) => {
    dispatch({ type: 'SAVE_TEACHER', data })
    toast('Profile updated')
  }
  /* Sliders and text fields report themselves as you move or type them, so
     they save without a confirmation. Only discrete choices announce. */
  const saveQuiet = (data) => dispatch({ type: 'SAVE_TEACHER', data })

  const activeCount = state.threads.filter((x) => x.withRequirement && x.active).length

  return (
    <>
      <TopBar title="Profile" />

      <div className="page" style={{ paddingTop: 4 }}>
        {/* ---- Identity ---- */}
        <div className="u-row" style={{ gap: 16, alignItems: 'flex-start' }}>
          <AvatarInput
            name={t.name}
            photo={t.photo}
            onChange={(p) => save({ photo: p })}
          />
          <div className="u-grow" style={{ paddingTop: 4 }}>
            <h1 className="h1">{t.name}</h1>
            <p className="sm" style={{ marginTop: 4 }}>
              {t.subjects.join(', ')} · {teachesRange(t)}
            </p>
            <p className="sm" style={{ marginTop: 2 }}>
              {localityName(t.locality)}, {cityName(t.locality)}
            </p>
          </div>
        </div>

        <div className="u-wrap" style={{ marginTop: 16 }}>
          <CapacityChip capacity={t.capacity} seatsLeft={t.seatsLeft} />
          <Chip>{t.experience} yrs experience</Chip>
          <Chip tone="indigo">{inr(t.fee)}/month</Chip>
        </div>

        {t.intro && (
          <p className="body" style={{ marginTop: 18, color: 'var(--ink)' }}>
            {t.intro}
          </p>
        )}

        {/* ---- Live counters ---- */}
        <div className="card card--sunk" style={{ marginTop: 20, padding: 0 }}>
          <div className="u-row">
            <div className="stat">
              <div className="stat__n num">
                {state.requests.filter((r) => r.direction === 'received').length}
              </div>
              <div className="stat__l">Requests</div>
            </div>
            <div className="stat">
              <div className="stat__n num">{state.threads.filter((x) => x.withRequirement).length}</div>
              <div className="stat__l">Connections</div>
            </div>
            <div className="stat">
              <div className="stat__n num">{activeCount}</div>
              <div className="stat__l">Teaching now</div>
            </div>
          </div>
        </div>

        {/* ---- Availability ---- */}
        <SectionHead
          title="Availability"
          action={
            <button className="sechead__link" onClick={() => setSheet('avail')}>
              Edit
            </button>
          }
        />
        <KV
          items={[
            { k: 'Status', v: CAPACITY[t.capacity].label },
            { k: 'Seats open', v: t.capacity === 'full' ? '0' : seatsLabel(t.seatsLeft) },
            { k: 'When', v: t.slots.map(slotLabel).join(' · ') },
            { k: 'Travels up to', v: `${t.radiusKm} km` },
            { k: 'How', v: t.modes.map((m) => modeLabel(m, 'teacher')).join(' · ') },
            { k: 'Format', v: formatLabel(t.formats) },
          ]}
        />

        {/* ---- Teaching ---- */}
        <SectionHead
          title="What you teach"
          action={
            <button className="sechead__link" onClick={() => setSheet('fee')}>
              Edit
            </button>
          }
        />
        <KV
          items={[
            { k: 'Subjects', v: t.subjects.join(', ') },
            { k: t.classes?.length ? 'Classes' : 'Age groups', v: teachesRange(t) },
            ...(t.boards.length ? [{ k: 'Boards', v: t.boards.join(', ') }] : []),
            { k: 'Monthly fee', v: inr(t.fee) },
            { k: 'Qualification', v: t.qualification },
            { k: 'Experience', v: `${t.experience} years` },
          ]}
        />

        {/* ---- Verification, honest ---- */}
        <SectionHead title="Verification" />
        <div className="card">
          <div className="u-row" style={{ gap: 12 }}>
            <IcShield size={20} />
            <div className="u-grow">
              <span className="h3">Not yet submitted</span>
              <p className="sm" style={{ marginTop: 3 }}>
                Families see which documents you have shown.
              </p>
            </div>
          </div>
          <Button
            block
            variant="quiet"
            style={{ marginTop: 14 }}
            onClick={() => toast('Not in this prototype')}
          >
            Upload documents
          </Button>
          <p className="xs" style={{ marginTop: 12, lineHeight: 1.5 }}>
            Bargad records that a document was seen, nothing more. Your profile says exactly
            that.
          </p>
        </div>

        {/* ---- Privacy ---- */}
        <SectionHead title="What families see" />
        <div className="card">
          <ul style={{ display: 'grid', gap: 12 }}>
            {[
              ['Your name, subjects, classes and fee', true],
              ['Your locality, not your address', true],
              ['Your availability and current capacity', true],
              ['Your phone number', false],
              ['Your exact address', false],
            ].map(([label, shown]) => (
              <li key={label} className="u-spread" style={{ gap: 12 }}>
                <span className="sm" style={{ color: shown ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {label}
                </span>
                <Chip tone={shown ? 'green' : ''}>{shown ? 'Shown' : 'Private'}</Chip>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- The money question, answered plainly ---- */}
        <SectionHead title="What this costs you" />
        <div className="card card--green">
          <p className="h1" style={{ fontSize: '2rem', color: 'var(--green-ink)' }}>
            Nothing.
          </p>
          <ul style={{ display: 'grid', gap: 9, marginTop: 14 }}>
            {[
              'No listing fee',
              'No charge to view requirements',
              'No charge to reply',
              'No commission',
            ].map((line) => (
              <li key={line} className="u-row" style={{ gap: 10 }}>
                <IcCheck size={16} style={{ color: 'var(--green-ink)', flex: 'none' }} />
                <span className="sm" style={{ color: 'var(--ink)' }}>
                  {line}
                </span>
              </li>
            ))}
          </ul>
          <p className="xs" style={{ marginTop: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Families pay you directly. Advertising pays for Bargad, so nobody buys ranking.
          </p>
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
                nav('/auth?next=/t/profile')
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
          items={CONTACT_FIELDS.map((f) => ({
            k: f.label,
            v: t.contact?.[f.k] || 'Not added',
          }))}
        />
        <div className="notice" style={{ marginTop: 12 }}>
          <IcLock size={18} />
          <span>
            Never shown on your profile. Saving makes sharing one tap.
          </span>
        </div>

        {/* ---- Device / prototype controls ---- */}
        <SectionHead title="This device" />
        <button className="card" style={{ width: '100%' }} onClick={() => nav('/f')}>
          <div className="u-row" style={{ gap: 12 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'var(--indigo-t)',
                color: 'var(--indigo-ink)',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <IcSwap size={19} />
            </span>
            <div className="u-grow">
              <span className="h3">
                {state.family ? 'Switch to family account' : 'Set up family account'}
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
          <span>
            Prototype: everything stays on this device.
          </span>
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
        <ContactFields
          value={t.contact ?? {}}
          onChange={(v) => saveQuiet({ contact: v })}
        />
      </Sheet>

      {/* ---- Availability sheet ---- */}
      <Sheet
        open={sheet === 'avail'}
        onClose={() => setSheet(null)}
        title="Availability"
        subtitle="This decides whether families can find you."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <Field group label="Current status">
          <OptionGroup
            options={[
              { id: 'open', label: 'Open to Teach' },
              { id: 'limited', label: 'Limited availability' },
              { id: 'full', label: 'Currently full' },
              { id: 'paused', label: 'Not looking right now' },
            ]}
            value={t.capacity}
            onChange={(v) => dispatch({ type: 'SET_CAPACITY', capacity: v })}
            wide
          />
        </Field>
        {t.capacity !== 'full' && t.capacity !== 'paused' && (
          <Field label={`Seats open: ${seatsLabel(t.seatsLeft)}`}>
            <input
              className="range"
              type="range"
              min="1"
              max={SEATS_CAP}
              value={t.seatsLeft}
              onChange={(e) => dispatch({ type: 'SET_SEATS', seats: +e.target.value })}
            />
          </Field>
        )}
        <Field group label="When you teach">
          <OptionGroup
            options={SLOTS}
            value={t.slots}
            onChange={(v) => save({ slots: v })}
            multi
            wide
          />
        </Field>
        <Field group label="How you teach">
          <OptionGroup options={modesFor('teacher')} value={t.modes} onChange={(v) => save({ modes: v })} multi wide />
        </Field>
        <Field
          label={`Travel radius: ${t.radiusKm} km`}
          hint="Families beyond this still see you, ranked lower."
        >
          <input
            className="range"
            type="range"
            min="1"
            max="15"
            value={t.radiusKm}
            onChange={(e) => saveQuiet({ radiusKm: +e.target.value })}
          />
        </Field>
        <div style={{ height: 16 }} />
      </Sheet>

      {/* ---- Fee sheet ---- */}
      <Sheet
        open={sheet === 'fee'}
        onClose={() => setSheet(null)}
        title="What you teach"
        subtitle="Families search by exactly this."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <Field group label="Subjects">
          <SubjectPicker
            value={t.subjects}
            onChange={(v) => save({ subjects: v })}
            custom={t.customSubjects}
            onCustomChange={(m) => save({ customSubjects: m })}
          />
        </Field>
        {subjectsInCategory(t.subjects, 'academic', t.customSubjects).length > 0 && (
          <Field group label="Classes">
            <OptionGroup
              options={CLASSES}
              value={t.classes}
              onChange={(v) => save({ classes: v })}
              multi
              allowOther
              otherPlaceholder="Nursery"
            />
          </Field>
        )}
        {subjectsInCategory(t.subjects, 'activity', t.customSubjects).length > 0 && (
          <Field group label="Age groups" hint="For the activities you picked.">
            <OptionGroup
              options={AGE_BANDS}
              value={t.ageBands || []}
              onChange={(v) => save({ ageBands: v })}
              multi
            />
          </Field>
        )}
        {subjectsInCategory(t.subjects, 'academic', t.customSubjects).length > 0 && (
          <Field group label="Boards">
            <OptionGroup
              options={BOARDS}
              value={t.boards}
              onChange={(v) => save({ boards: v })}
              multi
              allowOther
              otherPlaceholder="Bihar Board"
            />
          </Field>
        )}
        <span className="field__label" style={{ display: 'block', marginTop: 18 }}>
          Monthly fee
        </span>
        <div className="h1" style={{ fontSize: '2.4rem', color: 'var(--indigo-ink)', margin: '4px 0 14px' }}>
          {inr(t.fee)}
          <span className="sm" style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-ui)' }}>
            {' '}
            / month
          </span>
        </div>
        <input
          className="range"
          type="range"
          min="1000"
          max="12000"
          step="100"
          value={t.fee}
          onChange={(e) => saveQuiet({ fee: +e.target.value })}
        />
        <div className="notice" style={{ margin: '18px 0 24px' }}>
          <IcInfo size={18} />
          <span>
            Bargad takes nothing. Families pay you directly.
          </span>
        </div>
      </Sheet>
    </>
  )
}
