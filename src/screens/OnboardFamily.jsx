import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocalityPicker } from '../components/LocalityPicker'
import { BOARDS, BUDGET_CAP, CLASSES, FORMATS, LOCALITIES, SLOTS } from '../data/seed'
import { Button, Field, OptionGroup, Progress, SubjectPicker, TopBar } from '../components/UI'
import { useApp } from '../store/AppContext'
import Doodle from '../components/Doodle'
import { budgetLabel, inr, isNoBudgetLimit, modesFor } from '../lib/utils'

const STEPS = 4

export default function OnboardFamily() {
  const nav = useNavigate()
  const { dispatch, toast } = useApp()
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
    format: 'one',
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
      [d.parentName.trim().length > 1, 'your name'],
      [d.learner.trim().length > 0, "your child's first name"],
    ],
    2: [
      [!!d.classLevel, 'the class'],
      [!!d.board, 'the board'],
      [d.subjects.length > 0, 'at least one subject'],
    ],
    3: [
      [!!d.locality, 'your locality'],
      [d.modes.length > 0, 'how classes should happen'],
      [d.slots.length > 0, 'when they are free'],
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

  const next = () => {
    if (missing.length) return setShowMissing(true)
    if (step < STEPS) return go(step + 1)
    dispatch({ type: 'SAVE_FAMILY', data: d })
    toast('You are now looking for a teacher', 'green')
    nav('/f', { replace: true })
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
        title="Tell us what you need"
        back
        onBack={() => (step === 1 ? nav('/welcome') : go(step - 1))}
      />
      <Progress step={step} total={STEPS} />

      <div className="page" key={step}>
        {step === 1 && (
          <>
            <h1 className="h1">Who is this for?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              You hold the account. Your child is a learner on it. Teachers never see their
              full name or contact details before you accept a connection.
            </p>
            <Field label="Your name">
              <input
                className="input"
                value={d.parentName}
                onChange={(e) => set('parentName', e.target.value)}
                placeholder="e.g. Anil Gusain"
                autoFocus
              />
            </Field>
            <Field
              label="Your child's first name"
              hint="Only shown to a teacher after you accept them. Teachers see “Class 10 · CBSE” until then."
            >
              <input
                className="input"
                value={d.learner}
                onChange={(e) => set('learner', e.target.value)}
                placeholder="e.g. Riya"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="h1">What do they need help with?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Be specific. Teachers use exactly this to decide whether they are the right
              person for your child.
            </p>
            <Field label="Class">
              <OptionGroup
                options={CLASSES}
                value={d.classLevel}
                onChange={(v) => set('classLevel', v)}
              />
            </Field>
            <Field label="Board">
              <OptionGroup options={BOARDS} value={d.board} onChange={(v) => set('board', v)} />
            </Field>
            <Field label="Subjects">
              <SubjectPicker
                value={d.subjects}
                onChange={(v) => set('subjects', v)}
                custom={d.customSubjects}
                onCustomChange={(m) => set('customSubjects', m)}
              />
            </Field>
            <Field
              label="What is actually going wrong?"
              hint="This is the part teachers read most carefully."
            >
              <textarea
                className="textarea"
                value={d.need}
                onChange={(e) => set('need', e.target.value)}
                placeholder="Boards in February. Comfortable with algebra but loses marks in geometry…"
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="h1">Where and when?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Only your locality is shown. Your address stays private until you have accepted a
              teacher and arranged a demo class.
            </p>
            <Field label="Your locality">
              <LocalityPicker
                value={d.locality}
                coords={d.coords}
                onChange={(id, coords) => setD((x) => ({ ...x, locality: id, coords }))}
              />
            </Field>
            <Field label="How should classes happen?">
              <OptionGroup
                options={modesFor('family')}
                value={d.modes}
                onChange={(v) => set('modes', v)}
                multi
                wide
              />
            </Field>
            <Field label="When are they free?">
              <OptionGroup
                options={SLOTS}
                value={d.slots}
                onChange={(v) => set('slots', v)}
                multi
                wide
              />
            </Field>
            <Field label="One-to-one or a small group?">
              <OptionGroup
                options={FORMATS}
                value={d.format}
                onChange={(v) => set('format', v)}
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="h1">What can you spend?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Teachers publish their monthly fee openly, so you will not waste time on people
              outside your range, and they will not waste time on requests they must refuse.
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
                The most you can pay each month. Slide to the end for no limit.
              </span>
            </Field>
            <div className="notice notice--indigo" style={{ marginTop: 8 }}>
              <span style={{ flex: 'none', fontSize: 17 }}>🪢</span>
              <span>
                Turning on <strong>Looking for a Teacher</strong> lets nearby teachers see this
                requirement and offer to teach. You still choose who to accept.
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
              Still needed on this step: <strong>{listMissing(missing)}</strong>.
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
