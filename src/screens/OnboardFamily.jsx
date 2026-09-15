import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocalityPicker } from '../components/LocalityPicker'
import { BOARDS, BUDGET_CAP, CLASSES, FORMATS, LOCALITIES, SLOTS } from '../data/seed'
import { Button, Field, OptionGroup, Progress, SubjectPicker, TopBar } from '../components/UI'
import { useApp } from '../store/AppContext'
import { useThemeColor } from '../lib/useThemeColor'
import Doodle from '../components/Doodle'
import { budgetLabel, inr, isNoBudgetLimit, modesFor } from '../lib/utils'

const STEPS = 4

export default function OnboardFamily() {
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()
  const account = state.account
  useThemeColor('--bg')
  const [step, setStep] = useState(1)
  const [d, setD] = useState({
    parentName: '',
    learner: '',
    classLevel: '',
    board: '',
    subjects: [],
    locality: '',
    modes: [],
    slots: [],
    budgetMax: 4000,
    formats: ['one'],
    need: '',
    looking: true,
    posted: 'Just now',
    responses: 0,
  })

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }))

  /**
   * What each step still needs, in the user's words. A dead disabled button
   * that never says why is the fastest way to strand someone, so the button
   * always works and tells you what is missing instead.
   */
  const missing = {
    1: [
      [d.parentName.trim().length > 1, "the parent's name"],
      [d.learner.trim().length > 0, "the student's name"],
    ],
    2: [
      [!!d.classLevel, 'the class'],
      [!!d.board, 'the board'],
      [d.subjects.length > 0, 'at least one subject'],
    ],
    3: [
      [!!d.locality, 'your area'],
      [d.modes.length > 0, 'how classes happen'],
      [d.slots.length > 0, 'when they are free'],
      [d.formats.length > 0, 'a class format'],
    ],
    4: [],
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
    dispatch({ type: 'SAVE_FAMILY', data: d })
    toast('Your requirement is live', 'green')
    // Ask for an account where the answer matters: there is finally something
    // worth keeping, and losing it to a cleared browser is the real risk.
    nav(account ? '/f' : '/auth?next=/f', { replace: true })
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
        <Doodle name="globe" size={120} weight={1.2} className="wdood wdood--2" />
      </div>
      <TopBar
        title="What you need"
        back
        onBack={() => (step === 1 ? nav('/welcome') : go(step - 1))}
      />
      <Progress step={step} total={STEPS} />

      <div className="page" key={step}>
        {step === 1 && (
          <>
            <h1 className="h1">Who is this for?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Teachers never see your child’s name until you accept.
            </p>
            <Field label="Parent's name">
              <input
                className="input"
                value={d.parentName}
                onChange={(e) => set('parentName', e.target.value)}
                placeholder="Anil Gusain"
                autoFocus
              />
            </Field>
            <Field
              label="Student's name"
              hint="Shared only after you accept a teacher."
            >
              <input
                className="input"
                value={d.learner}
                onChange={(e) => set('learner', e.target.value)}
                placeholder="Riya"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="h1">What do they need?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Teachers read this to decide if they can help.
            </p>
            <Field group label="Class">
              <OptionGroup
                options={CLASSES}
                value={d.classLevel}
                onChange={(v) => set('classLevel', v)}
                allowOther
                otherPlaceholder="Nursery"
              />
            </Field>
            <Field group label="Board">
              <OptionGroup
                options={BOARDS}
                value={d.board}
                onChange={(v) => set('board', v)}
                allowOther
                otherPlaceholder="Bihar Board"
              />
            </Field>
            <Field group label="Subjects">
              <SubjectPicker
                value={d.subjects}
                onChange={(v) => set('subjects', v)}
                custom={d.customSubjects}
                onCustomChange={(m) => set('customSubjects', m)}
              />
            </Field>
            <Field
              label="What is going wrong"
              hint="Teachers read this first."
            >
              <textarea
                className="textarea"
                value={d.need}
                onChange={(e) => set('need', e.target.value)}
                placeholder="Fine with algebra, loses marks in geometry. Boards in February."
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="h1">Where and when?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Only your area is shown, never your address.
            </p>
            <Field group label="Your area">
              <LocalityPicker
                value={d.locality}
                coords={d.coords}
                onChange={(id, coords) => setD((x) => ({ ...x, locality: id, coords }))}
              />
            </Field>
            <Field group label="How classes happen">
              <OptionGroup
                options={modesFor('family')}
                value={d.modes}
                onChange={(v) => set('modes', v)}
                multi
                wide
              />
            </Field>
            <Field group label="When they are free">
              <OptionGroup
                options={SLOTS}
                value={d.slots}
                onChange={(v) => set('slots', v)}
                multi
                wide
              />
            </Field>
            <Field group label="Class format" hint="Either, or both.">
              <OptionGroup
                options={FORMATS}
                value={d.formats}
                onChange={(v) => set('formats', v)}
                multi
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="h1">Your monthly budget</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Teachers show their fees, so nobody wastes time.
            </p>
            <Field label="Monthly budget">
              <div
                className="h1"
                style={{ margin: '2px 0 14px', fontSize: '1.9rem', color: 'var(--indigo-ink)' }}
              >
                {budgetLabel(d.budgetMax)}
                {!isNoBudgetLimit(d.budgetMax) && (
                  <span
                    className="sm"
                    style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-ui)' }}
                  >
                    {' '}
                    / month
                  </span>
                )}
              </div>
              {/* One slider, not two. Nobody has a minimum they are willing to
                  pay, so a floor only ever excluded teachers who were cheaper
                  than expected. */}
              <input
                className="range"
                type="range"
                min="1000"
                max={BUDGET_CAP}
                step="100"
                value={d.budgetMax}
                onChange={(e) => set('budgetMax', +e.target.value)}
              />
              <span className="xs" style={{ display: 'block', marginTop: 6 }}>
                Slide to the end for no limit.
              </span>
            </Field>
            <div className="notice notice--indigo" style={{ marginTop: 8 }}>
              <span style={{ flex: 'none', fontSize: 17 }}>🪢</span>
              <span>
                Nearby teachers can offer to teach. You choose who to accept.
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
          {step === STEPS ? 'Start looking' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
