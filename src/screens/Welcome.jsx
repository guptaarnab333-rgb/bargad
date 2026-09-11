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
    body: 'Set your subjects, your area and your fee. Choose which families to answer.',
    cls: 'rolecard--teach',
    doodle: 'book',
  },
  {
    id: 'family',
    title: 'I am looking for a teacher',
    body: 'Say what your child needs. See teachers who are actually free right now.',
    cls: 'rolecard--find',
    doodle: 'globe',
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
          <h1 className="display welcome__head">
            Teachers and families
            <br />
            <em>find each other</em> here.
          </h1>
          <p className="welcome__sub">A local learning network, anywhere in India.</p>
        </div>

        <div className="welcome__choice">
          <p className="welcome__prompt">Which are you?</p>
          {ROLES.map(({ id, title, body, cls, doodle }) => (
            <button key={id} className={`rolecard ${cls}`} onClick={() => go(id)}>
              <Doodle name={doodle} size={86} weight={1.6} className="rolecard__art" />
              <span className="rolecard__title">{title}</span>
              <span className="rolecard__body">{body}</span>
            </button>
          ))}

          {(state.teacher || state.family) && (
            <p className="xs" style={{ textAlign: 'center', marginTop: 4 }}>
              You already have {state.teacher && state.family ? 'both profiles' : 'a profile'} on
              this device. Pick one to continue.
            </p>
          )}
        </div>

        <div className="welcome__foot">
          <p className="welcome__note">
            <strong>Free for everyone.</strong> Teachers are never charged to reply, families are
            never charged to message. Bargad is paid for by advertising.
          </p>
          <p className="welcome__note">
            <strong>No cold messages.</strong> Phone numbers and addresses stay hidden until both
            sides agree to connect.
          </p>
          <p className="xs" style={{ textAlign: 'center' }}>
            Academic prototype · All people and data are fictional
          </p>
        </div>
      </div>
    </div>
  )
}
