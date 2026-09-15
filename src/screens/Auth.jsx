import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Button, Field, TopBar } from '../components/UI'
import { IcCheck, IcInfo, IcLock } from '../components/Icons'
import Doodle from '../components/Doodle'

/**
 * The account, designed rather than built.
 *
 * Bargad keeps everything on the device, which is a real privacy position and a
 * real problem: change your phone and your profile, your requests and your
 * chats are gone. An account is the answer to that one question, so it is asked
 * where the answer matters, at the end of setting a profile up, when there is
 * finally something worth keeping.
 *
 * The code is not checked. This is a prototype and says so, in the same voice
 * the rest of the app uses for the other controls that stand in for a system
 * that is not here yet.
 */
const OTP_LENGTH = 6
const RESEND_SECONDS = 30

function OtpBoxes({ value, onChange }) {
  const refs = useRef([])
  const set = (i, ch) => {
    const next = value.split('')
    next[i] = ch
    onChange(next.join('').slice(0, OTP_LENGTH))
    if (ch && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus()
  }
  return (
    <div className="otp">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="otp__box"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] ?? ''}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          onPaste={(e) => {
            const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
            if (!digits) return
            e.preventDefault()
            onChange(digits)
            refs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus()
          }}
        />
      ))}
    </div>
  )
}

export default function Auth() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { state, dispatch, toast } = useApp()
  // Where to go once an account exists. Set by whoever sent the user here.
  const next = params.get('next') || '/'
  const returning = params.get('mode') === 'login'

  const [stage, setStage] = useState('choose')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [left, setLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (stage !== 'otp') return
    setLeft(RESEND_SECONDS)
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [stage])

  const finish = (method, value) => {
    dispatch({ type: 'SET_ACCOUNT', method, value })
    toast(returning ? 'Welcome back' : 'Account saved', 'green')
    nav(next, { replace: true })
  }

  const phoneOk = phone.replace(/\D/g, '').length === 10
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const back = () => {
    if (stage === 'choose') return nav(-1)
    setStage(stage === 'otp' ? 'phone' : 'choose')
  }

  return (
    <div className="shell__scroll">
      <TopBar back onBack={back} title={returning ? 'Log in' : 'Save your profile'} />
      <div className="page">
        {stage === 'choose' && (
          <>
            <div className="authart">
              <Doodle name="globe" size={96} weight={1.4} />
            </div>
            <h1 className="h1">{returning ? 'Welcome back' : 'Save your profile'}</h1>
            <p className="body" style={{ marginTop: 10, marginBottom: 24 }}>
              {returning
                ? 'Use the number or email you signed up with.'
                : 'Right now this lives only on this phone.'}
            </p>
            <Button block onClick={() => setStage('phone')}>
              Continue with phone
            </Button>
            <Button
              block
              variant="sunk"
              style={{ marginTop: 10 }}
              onClick={() => setStage('email')}
            >
              Continue with email
            </Button>
            <div className="notice" style={{ marginTop: 20 }}>
              <IcLock size={18} />
              <span>
                Never shown on your profile. Only used to sign you in.
              </span>
            </div>
            {!returning && (
              <Button
                block
                variant="ghost"
                style={{ marginTop: 8 }}
                onClick={() => nav(next, { replace: true })}
              >
                Not now
              </Button>
            )}
          </>
        )}

        {stage === 'phone' && (
          <>
            <h1 className="h1">Your phone number</h1>
            <p className="body" style={{ marginTop: 10, marginBottom: 24 }}>
              We will text you a six digit code.
            </p>
            <Field label="Phone number">
              <div className="phonerow">
                <span className="phonerow__cc">+91</span>
                <input
                  className="input"
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, '').slice(0, 11))}
                />
              </div>
            </Field>
            <Button
              block
              aria-disabled={!phoneOk}
              onClick={() => (phoneOk ? setStage('otp') : toast('Enter 10 digits'))}
            >
              Send code
            </Button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <h1 className="h1">Enter the code</h1>
            <p className="body" style={{ marginTop: 10, marginBottom: 24 }}>
              Sent to +91 {phone}.{' '}
              <button className="linkish" onClick={() => setStage('phone')}>
                Change
              </button>
            </p>
            <OtpBoxes value={code} onChange={setCode} />
            <p className="sm" style={{ margin: '16px 0 24px' }}>
              {left > 0 ? (
                <>Resend in {left}s</>
              ) : (
                <button className="linkish" onClick={() => setStage('otp')}>
                  Resend code
                </button>
              )}
            </p>
            <Button
              block
              aria-disabled={code.length !== OTP_LENGTH}
              onClick={() =>
                code.length === OTP_LENGTH
                  ? finish('phone', `+91 ${phone}`)
                  : toast('Enter all 6 digits')
              }
            >
              {returning ? 'Log in' : 'Save profile'}
            </Button>
            <div className="notice notice--orange" style={{ marginTop: 18 }}>
              <IcInfo size={18} />
              <span>
                Prototype: no SMS is sent. Any six digits work.
              </span>
            </div>
          </>
        )}

        {stage === 'email' && (
          <>
            <h1 className="h1">Your email address</h1>
            <p className="body" style={{ marginTop: 10, marginBottom: 24 }}>
              We will send a link that signs you in.
            </p>
            <Field label="Email">
              <input
                className="input"
                type="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button
              block
              aria-disabled={!emailOk}
              onClick={() => (emailOk ? setStage('sent') : toast('Enter a valid email'))}
            >
              Send link
            </Button>
          </>
        )}

        {stage === 'sent' && (
          <>
            <div className="authart">
              <Doodle name="plane" size={96} weight={1.4} />
            </div>
            <h1 className="h1">Check your email</h1>
            <p className="body" style={{ marginTop: 10, marginBottom: 24 }}>
              We sent a sign-in link to <strong>{email.trim()}</strong>.
            </p>
            <Button block onClick={() => finish('email', email.trim())}>
              <IcCheck size={16} />
              I opened it
            </Button>
            <div className="notice notice--orange" style={{ marginTop: 18 }}>
              <IcInfo size={18} />
              <span>
                Prototype: no email is sent. This stands in for the link.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
