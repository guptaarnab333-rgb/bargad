import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocalityPicker } from '../components/LocalityPicker'
import { AGE_BANDS, BOARDS, CLASSES, FORMATS, LOCALITIES, SEATS_CAP, SLOTS } from '../data/seed'
import { Button, Field, OptionGroup, Progress, SubjectPicker, TopBar } from '../components/UI'
import { useApp } from '../store/AppContext'
import { useThemeColor } from '../lib/useThemeColor'
import Doodle from '../components/Doodle'
import { inr, modesFor, seatsLabel, subjectsInCategory } from '../lib/utils'

const STEPS = 5

export default function OnboardTeacher() {
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()
  const account = state.account
  useThemeColor('--bg')
  const [step, setStep] = useState(1)
  const [d, setD] = useState({
    name: '',
    intro: '',
    qualification: '',
    experience: 3,
    subjects: [],
    classes: [],
    ageBands: [],
    boards: [],
    modes: [],
    locality: '',
    radiusKm: 5,
    slots: [],
    fee: 3500,
    formats: ['one'],
    capacity: 'open',
    seatsLeft: 2,
    verified: [],
    rating: null,
    reviewCount: 0,
    studentsTaught: 0,
    joined: 'Today',
  })

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }))

  /**
   * What each step still needs, in the user's words. A dead disabled button
   * that never says why is the fastest way to strand someone, so the button
   * always works and tells you what is missing instead.
   */
  const teachesAcademic =
    subjectsInCategory(d.subjects, 'academic', d.customSubjects).length > 0
  const teachesActivity =
    subjectsInCategory(d.subjects, 'activity', d.customSubjects).length > 0

  const missing = {
    1: [
      [d.name.trim().length > 1, 'your name'],
      [d.qualification.trim().length > 1, 'your qualification'],
    ],
    2: [
      [d.subjects.length > 0, 'at least one subject'],
      // Academic teaching is measured in classes, an activity in age groups.
      // Whichever half they are in, they must answer that half's question.
      [!teachesAcademic || d.classes.length > 0, 'at least one class'],
      [!teachesActivity || d.ageBands.length > 0, 'at least one age group'],
      // Boards only apply to academic teaching. Asking a guitar teacher for a
      // board would strand them on a requirement they cannot meet.
      [!teachesAcademic || d.boards.length > 0, 'at least one board'],
    ],
    3: [
      [!!d.locality, 'your area'],
      [d.modes.length > 0, 'how you teach'],
    ],
    4: [
      [d.slots.length > 0, 'when you are free'],
      [d.formats.length > 0, 'a class format'],
    ],
    5: [],
  }[step]
    .filter(([ok]) => !ok)
    .map(([, label]) => label)

  const [showMissing, setShowMissing] = useState(false)

  const go = (n) => {
    setShowMissing(false)
    setStep(n)
  }

  /* A step is not a route, so the app's ScrollReset never sees it. Without
     this the next step inherits the last one's scroll position, clamped to
     whatever the shorter page allows, and its first field renders sliced in
     half under the sticky top bar. */
  useEffect(() => {
    document.querySelector('.shell__scroll')?.scrollTo({ top: 0 })
  }, [step])


  const next = () => {
    if (missing.length) return setShowMissing(true)
    if (step < STEPS) return go(step + 1)
    dispatch({ type: 'SAVE_TEACHER', data: d })
    toast('Your profile is live', 'green')
    nav(account ? '/t' : '/auth?next=/t', { replace: true })
  }

  const listMissing = (items) =>
    items.length === 1
      ? items[0]
      : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]

  return (
    <div className="shell__scroll onboard">
      <div className="onboard__bg" aria-hidden="true">
        <span className="blob blob--a" />
        <span className="blob blob--b" />
        <span className="burst" />
        <Doodle name="book" size={120} weight={1.2} className="wdood wdood--2" />
      </div>
      <TopBar
        title="Your profile"
        back
        onBack={() => (step === 1 ? nav('/welcome') : go(step - 1))}
      />
      <Progress step={step} total={STEPS} />

      <div className="page" key={step}>
        {step === 1 && (
          <>
            <h1 className="h1">Who are you?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Families see this first, so write it the way you speak.
            </p>
            <Field label="Full name">
              <input
                className="input"
                value={d.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ananya Rawat"
                autoFocus
              />
            </Field>
            <Field label="Highest qualification">
              <input
                className="input"
                value={d.qualification}
                onChange={(e) => set('qualification', e.target.value)}
                placeholder="M.Sc Mathematics, Doon University"
              />
            </Field>
            <Field label={`Experience: ${d.experience} years`}>
              <input
                className="range"
                type="range"
                min="0"
                max="30"
                value={d.experience}
                onChange={(e) => set('experience', +e.target.value)}
              />
            </Field>
            <Field
              label="Short introduction"
              hint="What is a class with you like?"
            >
              <textarea
                className="textarea"
                value={d.intro}
                onChange={(e) => set('intro', e.target.value)}
                placeholder="I teach Maths slowly, with a lot of rough paper…"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="h1">What do you teach?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Families search by this, so pick only what you will take.
            </p>
            <Field group label="Subjects">
              <SubjectPicker
                value={d.subjects}
                onChange={(v) => set('subjects', v)}
                custom={d.customSubjects}
                onCustomChange={(m) => set('customSubjects', m)}
              />
            </Field>
            {teachesAcademic && (
              <Field group label="Classes">
                <OptionGroup
                  options={CLASSES}
                  value={d.classes}
                  onChange={(v) => set('classes', v)}
                  multi
                  allowOther
                  otherPlaceholder="Nursery"
                />
              </Field>
            )}
            {teachesActivity && (
              <Field group label="Age groups" hint="For the activities you picked.">
                <OptionGroup
                  options={AGE_BANDS}
                  value={d.ageBands}
                  onChange={(v) => set('ageBands', v)}
                  multi
                />
              </Field>
            )}
            {teachesAcademic && (
              <Field group label="Boards">
                <OptionGroup
                  options={BOARDS}
                  value={d.boards}
                  onChange={(v) => set('boards', v)}
                  multi
                  allowOther
                  otherPlaceholder="Bihar Board"
                />
              </Field>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="h1">Where do you teach?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Only your area is shown, never your address.
            </p>
            <Field group label="Your area">
              <LocalityPicker
                value={d.locality}
                coords={d.coords}
                radiusKm={d.radiusKm}
                onChange={(id, coords) => setD((x) => ({ ...x, locality: id, coords }))}
              />
            </Field>
            <Field group label="How you teach">
              <OptionGroup
                options={modesFor('teacher')}
                value={d.modes}
                onChange={(v) => set('modes', v)}
                multi
                wide
              />
            </Field>
            <Field
              label={`Travel radius: ${d.radiusKm} km`}
              hint="Families further away still see you, ranked lower."
            >
              <input
                className="range"
                type="range"
                min="1"
                max="15"
                value={d.radiusKm}
                onChange={(e) => set('radiusKm', +e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="h1">When and how much</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              You set your fee, and it is shown openly.
            </p>
            <Field group label="Availability">
              <OptionGroup
                options={SLOTS}
                value={d.slots}
                onChange={(v) => set('slots', v)}
                multi
                wide
              />
            </Field>
            <Field group label="Format">
              <OptionGroup
                options={FORMATS}
                value={d.formats}
                onChange={(v) => set('formats', v)}
                multi
              />
            </Field>
            <Field label="Monthly fee" hint="Per student, per month.">
              <div
                className="h1"
                style={{ margin: '2px 0 10px', fontSize: '2rem', color: 'var(--indigo-ink)' }}
              >
                {inr(d.fee)}
                <span
                  className="sm"
                  style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-ui)' }}
                >
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
                value={d.fee}
                onChange={(e) => set('fee', +e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="h1">Taking students now?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              When you are full, families stop sending requests.
            </p>
            <Field group label="Your status">
              <OptionGroup
                options={[
                  { id: 'open', label: 'Open to Teach' },
                  { id: 'limited', label: 'Limited availability' },
                  { id: 'full', label: 'Currently full' },
                  { id: 'paused', label: 'Not looking right now' },
                ]}
                value={d.capacity}
                onChange={(v) => set('capacity', v)}
                wide
              />
            </Field>
            {(d.capacity === 'open' || d.capacity === 'limited') && (
              <Field label={`Seats open: ${seatsLabel(d.seatsLeft)}`}>
                <input
                  className="range"
                  type="range"
                  min="1"
                  max={SEATS_CAP}
                  value={d.seatsLeft}
                  onChange={(e) => set('seatsLeft', +e.target.value)}
                />
              </Field>
            )}
            <div className="notice" style={{ marginTop: 8 }}>
              <span style={{ flex: 'none', fontSize: 17 }}>🔒</span>
              <span>
                Your number and address stay private until you accept a request.
              </span>
            </div>
          </>
        )}

        {showMissing && missing.length > 0 && (
          <div
            className="notice notice--orange"
            role="alert"
            id="onboard-missing"
            style={{ marginTop: 24 }}
          >
            <span>
              Still needed: <strong>{listMissing(missing)}</strong>.
            </span>
          </div>
        )}

        <Button
          block
          onClick={next}
          aria-disabled={missing.length > 0}
          aria-describedby={showMissing && missing.length ? 'onboard-missing' : undefined}
          style={{ marginTop: showMissing && missing.length ? 12 : 28 }}
        >
          {step === STEPS ? 'Go live' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
