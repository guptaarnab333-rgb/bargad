import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOARDS, CLASSES, LOCALITIES, SLOTS, SUBJECTS, FORMATS } from '../data/seed'
import { Button, Field, OptionGroup, Progress, TopBar } from '../components/UI'
import { useApp } from '../store/AppContext'
import Doodle from '../components/Doodle'
import { inr, modesFor } from '../lib/utils'

const STEPS = 5

export default function OnboardTeacher() {
  const nav = useNavigate()
  const { dispatch, toast } = useApp()
  const [step, setStep] = useState(1)
  const [d, setD] = useState({
    name: '',
    intro: '',
    qualification: '',
    experience: 3,
    subjects: [],
    classes: [],
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
  const missing = {
    1: [
      [d.name.trim().length > 1, 'your name'],
      [d.qualification.trim().length > 1, 'your highest qualification'],
    ],
    2: [
      [d.subjects.length > 0, 'at least one subject'],
      [d.classes.length > 0, 'at least one class'],
      [d.boards.length > 0, 'at least one board'],
    ],
    3: [
      [!!d.locality, 'your locality'],
      [d.modes.length > 0, 'how you teach'],
    ],
    4: [
      [d.slots.length > 0, 'when you are free'],
      [d.formats.length > 0, 'one-to-one, small group, or both'],
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

  const next = () => {
    if (missing.length) return setShowMissing(true)
    if (step < STEPS) return go(step + 1)
    dispatch({ type: 'SAVE_TEACHER', data: d })
    toast('Your teaching profile is live', 'green')
    nav('/t', { replace: true })
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
        title="Set up your profile"
        back
        onBack={() => (step === 1 ? nav('/welcome') : go(step - 1))}
      />
      <Progress step={step} total={STEPS} />

      <div className="page" key={step}>
        {step === 1 && (
          <>
            <h1 className="h1">Who are you?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Families see this first. Write it the way you would say it, not like a CV.
            </p>
            <Field label="Full name">
              <input
                className="input"
                value={d.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Ananya Rawat"
                autoFocus
              />
            </Field>
            <Field label="Highest qualification">
              <input
                className="input"
                value={d.qualification}
                onChange={(e) => set('qualification', e.target.value)}
                placeholder="e.g. M.Sc Mathematics, Doon University"
              />
            </Field>
            <Field label={`Years of teaching experience: ${d.experience}`}>
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
              label="A short introduction"
              hint="Two or three sentences. What is it actually like to be taught by you?"
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
              This is what families search by, so only pick what you would genuinely take on.
            </p>
            <Field label="Subjects">
              <OptionGroup
                options={SUBJECTS}
                value={d.subjects}
                onChange={(v) => set('subjects', v)}
                multi
              />
            </Field>
            <Field label="Classes">
              <OptionGroup
                options={CLASSES}
                value={d.classes}
                onChange={(v) => set('classes', v)}
                multi
              />
            </Field>
            <Field label="Boards">
              <OptionGroup
                options={BOARDS}
                value={d.boards}
                onChange={(v) => set('boards', v)}
                multi
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="h1">Where do you teach?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Only your locality is ever shown publicly, never your address.
            </p>
            <Field label="Your locality">
              <select
                className="select"
                value={d.locality}
                onChange={(e) => set('locality', e.target.value)}
              >
                <option value="">Choose an area</option>
                {LOCALITIES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="How you teach">
              <OptionGroup
                options={modesFor('teacher')}
                value={d.modes}
                onChange={(v) => set('modes', v)}
                multi
                wide
              />
            </Field>
            <Field
              label={`How far will you travel: ${d.radiusKm} km`}
              hint="Families outside this will still see you, but you will be ranked lower for them."
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
            <h1 className="h1">When, and for how much?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              Your fee is yours to set and it is shown openly. Families can talk to you about it
              in chat, once you have both agreed to connect.
            </p>
            <Field label="Availability">
              <OptionGroup
                options={SLOTS}
                value={d.slots}
                onChange={(v) => set('slots', v)}
                multi
                wide
              />
            </Field>
            <Field label="Format">
              <OptionGroup
                options={FORMATS}
                value={d.formats}
                onChange={(v) => set('formats', v)}
                multi
              />
            </Field>
            <Field label="Monthly fee" hint="Per student, per month, for your usual weekly pattern.">
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
            <h1 className="h1">Are you taking students right now?</h1>
            <p className="body" style={{ marginTop: 8, marginBottom: 26 }}>
              This is the switch that matters. You can change it any time. When you are full,
              families stop seeing you at the top and stop sending requests you cannot accept.
            </p>
            <Field label="Your current state">
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
              <Field label={`How many new students can you take: ${d.seatsLeft}`}>
                <input
                  className="range"
                  type="range"
                  min="1"
                  max="10"
                  value={d.seatsLeft}
                  onChange={(e) => set('seatsLeft', +e.target.value)}
                />
              </Field>
            )}
            <div className="notice" style={{ marginTop: 8 }}>
              <span style={{ flex: 'none', fontSize: 17 }}>🔒</span>
              <span>
                Your phone number and address are never shown on your profile. They stay private
                until you accept a request.
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
          {step === STEPS ? 'Go live on Bargad' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
