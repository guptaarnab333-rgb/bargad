import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Brand'
import Doodle from '../components/Doodle'
import { Button } from '../components/UI'
import { useApp } from '../store/AppContext'

/**
 * Three screens, one idea each. Bargad's difference is a mechanism, not a
 * feature, so a parent who lands straight on a list of tutors will assume it
 * works like every other tutor site. This is the only place that gets said.
 * Skippable, shown once on a new device, and replayable from Profile.
 */
const SLIDES = [
  {
    doodle: 'plane',
    tint: 'intro--green',
    title: 'Nobody stands in between',
    body: 'No bureau taking your first month’s fee. No charge for a teacher to reply to you. You find each other and deal with each other directly.',
  },
  {
    doodle: 'book',
    tint: 'intro--indigo',
    title: 'Both sides choose',
    body: 'Teachers decide which families to answer. Families decide which teacher to accept. Nobody here is a lead being sold to someone.',
  },
  {
    doodle: 'globe',
    tint: 'intro--orange',
    title: 'Teachers near you, who are actually free',
    body: 'See who teaches your child’s class in your area, what they charge, and whether they have room right now, before you message anyone.',
  },
]

export default function Intro() {
  const nav = useNavigate()
  const { state, dispatch } = useApp()
  const [i, setI] = useState(0)
  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  // Replayed from Profile once an account exists: send the user back to it
  // rather than dropping them into a role choice they already made.
  const { role, teacher, family } = state
  const home =
    role === 'teacher' && teacher ? '/t' : role === 'family' && family ? '/f' : null

  const finish = () => {
    dispatch({ type: 'SEEN_INTRO' })
    nav(home ?? '/welcome', { replace: true })
  }

  return (
    <div className="shell__scroll">
      <div className={`intro ${slide.tint}`}>
        <div className="intro__top">
          <Logo size={30} />
          <button className="intro__skip" onClick={finish}>
            {home ? 'Close' : 'Skip'}
          </button>
        </div>

        <div className="intro__art" key={i}>
          <Doodle name={slide.doodle} size={150} weight={1.5} />
        </div>

        <div className="intro__copy" key={`c${i}`}>
          <h1 className="intro__title">{slide.title}</h1>
          <p className="intro__body">{slide.body}</p>
        </div>

        <div className="intro__foot">
          <div className="intro__dots" role="tablist" aria-label="Introduction">
            {SLIDES.map((s, n) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={n === i}
                aria-label={`Step ${n + 1}: ${s.title}`}
                className={`intro__dot${n === i ? ' intro__dot--on' : ''}`}
                onClick={() => setI(n)}
              />
            ))}
          </div>
          <Button block onClick={() => (last ? finish() : setI(i + 1))}>
            {last ? (home ? 'Back to Bargad' : 'Get started') : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
