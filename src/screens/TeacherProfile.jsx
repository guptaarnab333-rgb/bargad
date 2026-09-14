import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { AGE_BANDS, BOARDS, CAPACITY, CLASSES, SLOTS } from '../data/seed'
import { Avatar, Button, Chip, Field, KV, OptionGroup, SectionHead, Sheet, SubjectPicker, TopBar } from '../components/UI'
import { CapacityChip } from '../components/Cards'
import { IcArrow, IcCheck, IcInfo, IcShield, IcSwap } from '../components/Icons'
import { cityName, inr, localityName, modeLabel, modesFor, slotLabel, subjectsInCategory, teachesRange } from '../lib/utils'

export default function TeacherProfile() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const t = state.teacher
  const [sheet, setSheet] = useState(null)

  const save = (data) => {
    dispatch({ type: 'SAVE_TEACHER', data })
    toast('Profile updated')
  }

  const activeCount = state.threads.filter((x) => x.withRequirement && x.active).length

  return (
    <>
      <TopBar title="Profile" />

      <div className="page" style={{ paddingTop: 4 }}>
        {/* ---- Identity ---- */}
        <div className="u-row" style={{ gap: 16, alignItems: 'flex-start' }}>
          <Avatar name={t.name} size={96} />
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
          title="Your availability"
          action={
            <button className="sechead__link" onClick={() => setSheet('avail')}>
              Edit
            </button>
          }
        />
        <KV
          items={[
            { k: 'Status', v: CAPACITY[t.capacity].label },
            { k: 'Seats open', v: t.capacity === 'full' ? '0' : `${t.seatsLeft}` },
            { k: 'When', v: t.slots.map(slotLabel).join(' · ') },
            { k: 'Travels up to', v: `${t.radiusKm} km` },
            { k: 'How', v: t.modes.map((m) => modeLabel(m, 'teacher')).join(' · ') },
            { k: 'Format', v: t.formats.includes('group') ? 'One-to-one + group' : 'One-to-one' },
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
                Families see whether a teacher has shown ID and qualification documents.
              </p>
            </div>
          </div>
          <Button
            block
            variant="quiet"
            style={{ marginTop: 14 }}
            onClick={() => toast('Document upload is out of scope for this prototype')}
          >
            Upload ID and documents
          </Button>
          <p className="xs" style={{ marginTop: 12, lineHeight: 1.5 }}>
            Bargad records that a document was seen. It does not confirm degrees with
            institutions and does not run police checks, and it says so on your public profile
            rather than implying more.
          </p>
        </div>

        {/* ---- Privacy ---- */}
        <SectionHead title="What families can see" />
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
        <SectionHead title="What Bargad costs you" />
        <div className="card card--green">
          <p className="h1" style={{ fontSize: '2rem', color: 'var(--green-ink)' }}>
            Nothing.
          </p>
          <ul style={{ display: 'grid', gap: 9, marginTop: 14 }}>
            {[
              'No charge to list your profile',
              'No charge to see a family’s requirement',
              'No charge to reply, ever',
              'No commission on your fee',
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
            Families pay you directly, outside the app. Bargad pays for itself with advertising, so
            no teacher is ever ranked higher for spending money.
          </p>
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
                {state.family ? 'Switch to your family account' : 'Set up a family account'}
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
          <span>
            Prototype: everything is stored on this device only. Nothing is sent anywhere.
          </span>
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

      {/* ---- Availability sheet ---- */}
      <Sheet
        open={sheet === 'avail'}
        onClose={() => setSheet(null)}
        title="Your availability"
        subtitle="This is what decides whether families can find and contact you."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <Field label="Current status">
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
          <Field label={`Seats open: ${t.seatsLeft}`}>
            <input
              className="range"
              type="range"
              min="1"
              max="10"
              value={t.seatsLeft}
              onChange={(e) => dispatch({ type: 'SET_SEATS', seats: +e.target.value })}
            />
          </Field>
        )}
        <Field label="When you teach">
          <OptionGroup
            options={SLOTS}
            value={t.slots}
            onChange={(v) => save({ slots: v })}
            multi
            wide
          />
        </Field>
        <Field label="How you teach">
          <OptionGroup options={modesFor('teacher')} value={t.modes} onChange={(v) => save({ modes: v })} multi wide />
        </Field>
        <Field
          label={`How far you travel: ${t.radiusKm} km`}
          hint="Families beyond this still see you, ranked lower."
        >
          <input
            className="range"
            type="range"
            min="1"
            max="15"
            value={t.radiusKm}
            onChange={(e) => save({ radiusKm: +e.target.value })}
          />
        </Field>
        <div style={{ height: 16 }} />
      </Sheet>

      {/* ---- Fee sheet ---- */}
      <Sheet
        open={sheet === 'fee'}
        onClose={() => setSheet(null)}
        title="What you teach"
        subtitle="Families search by exactly this. Your fee is shown openly, and only you change it."
        footer={
          <Button block onClick={() => setSheet(null)}>
            Done
          </Button>
        }
      >
        <Field label="Subjects">
          <SubjectPicker
            value={t.subjects}
            onChange={(v) => save({ subjects: v })}
            custom={t.customSubjects}
            onCustomChange={(m) => save({ customSubjects: m })}
          />
        </Field>
        {subjectsInCategory(t.subjects, 'academic', t.customSubjects).length > 0 && (
          <Field label="Classes">
            <OptionGroup
              options={CLASSES}
              value={t.classes}
              onChange={(v) => save({ classes: v })}
              multi
            />
          </Field>
        )}
        {subjectsInCategory(t.subjects, 'activity', t.customSubjects).length > 0 && (
          <Field label="Age groups" hint="Who you take for the activities you chose.">
            <OptionGroup
              options={AGE_BANDS}
              value={t.ageBands || []}
              onChange={(v) => save({ ageBands: v })}
              multi
            />
          </Field>
        )}
        {subjectsInCategory(t.subjects, 'academic', t.customSubjects).length > 0 && (
          <Field label="Boards">
            <OptionGroup
              options={BOARDS}
              value={t.boards}
              onChange={(v) => save({ boards: v })}
              multi
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
          onChange={(e) => save({ fee: +e.target.value })}
        />
        <div className="notice" style={{ margin: '18px 0 24px' }}>
          <IcInfo size={18} />
          <span>
            Bargad takes nothing from this. Families pay you directly, outside the app.
          </span>
        </div>
      </Sheet>
    </>
  )
}
