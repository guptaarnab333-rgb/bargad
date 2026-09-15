import { useNavigate } from 'react-router-dom'
import { Logo } from '../components/Brand'
import Doodle from '../components/Doodle'
import { useApp } from '../store/AppContext'

/**
 * The whole point of this screen is one choice. So the choice is the biggest
 * thing on it, and the decoration sits behind it in light tints rather than
 * pushing the two options down the page.
 */
const ROLES = [
  {
    id: 'teacher',
    title: 'I teach',
    body: 'Set your subjects, area and fee.',
    cls: 'rolecard--teach',
  },
  {
    id: 'family',
    title: 'I need a teacher',
    body: 'Tell us what your child needs.',
    cls: 'rolecard--find',
  },
]

export default function Welcome() {
  const nav = useNavigate()
  const { state } = useApp()

  const go = (role) => {
    const done = role === 'teacher' ? state.teacher : state.family
    nav(done ? (role === 'teacher' ? '/t' : '/f') : `/onboard/${role}`)
  }

  return (
    <div className="shell__scroll">
      <div className="welcome">
        {/* Background only. Nothing in here competes with the choice. */}
        <div className="welcome__bg" aria-hidden="true">
          <span className="blob blob--a" />
          <span className="blob blob--b" />
          <span className="burst" />
          <Doodle name="pencil" size={92} weight={1.2} className="wdood wdood--1" />
          <Doodle name="beaker" size={104} weight={1.2} className="wdood wdood--2" />
          <Doodle name="plane" size={78} weight={1.2} className="wdood wdood--3" />
        </div>

        <div className="welcome__top">
          <Logo size={38} />
          {/* No hardcoded break. At this size the line cannot hold "Teachers
              and families" on one row at 375px, so a forced break produced a
              stranded middle line. Letting the browser balance it is the only
              way the bigger size reads as a block rather than as a mistake. */}
          <h1 className="display welcome__head">
            Teachers and families connect <em>directly</em>.
          </h1>
          <p className="welcome__sub">Local tuition, anywhere in India.</p>
        </div>

        <div className="welcome__choice">
          {ROLES.map(({ id, title, body, cls }) => (
            <div key={id} className="rolepick">
              <button className={`rolecard ${cls}`} onClick={() => go(id)}>
                {title}
              </button>
              <span className="rolecard__body">{body}</span>
            </div>
          ))}

          {(state.teacher || state.family) && (
            <p className="xs" style={{ textAlign: 'center', marginTop: 14 }}>
              Already set up on this device. Pick one.
            </p>
          )}
        </div>

        <div className="welcome__foot">
          <button className="welcome__login" onClick={() => nav('/auth?mode=login')}>
            Already here? <strong>Log in</strong>
          </button>
          <p className="xs" style={{ textAlign: 'center' }}>
            Prototype · People and data are fictional
          </p>
        </div>
      </div>
    </div>
  )
}
