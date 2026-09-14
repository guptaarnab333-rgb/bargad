import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Button, Chip, CONTACT_FIELDS, ContactFields, Field, OptionGroup, Sheet, TopBar } from '../components/UI'
import { IcCal, IcCheck, IcPin, IcSend } from '../components/Icons'
import { Link } from 'react-router-dom'
import { localityName, requirementById, teacherById } from '../lib/utils'

const DAYS = ['This Saturday', 'This Sunday', 'Next Tuesday', 'Next Thursday']
const TIMES = ['4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm']

/* A few grounded replies so the prototype feels alive without pretending to be AI. */
const REPLIES = [
  'That works for me. Shall we fix it?',
  'Noted. I will keep that in mind for the first class.',
  'Yes, that is fine. See you then.',
  'Understood. I usually start with a quick diagnostic so I know where to begin.',
]

export default function Thread({ role }) {
  const { id } = useParams()
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()
  const th = state.threads.find((t) => t.id === id)
  const endRef = useRef(null)
  const [text, setText] = useState('')
  const [proposing, setProposing] = useState(false)
  // Which detail the user is about to share but has not saved yet.
  const [asking, setAsking] = useState(null)
  const [entry, setEntry] = useState({})
  const [demo, setDemo] = useState({ day: DAYS[0], time: TIMES[1], where: '' })

  const base = role === 'teacher' ? '/t' : '/f'
  const me = role === 'teacher' ? state.teacher : state.family
  const contact = me?.contact ?? {}

  /* One tap when it is already saved, one field when it is not. Nothing is
     handed over until the person taps: this is a deliberate act, not a
     consequence of having filled a form weeks earlier. */
  const share = (f, valueOverride) => {
    const v = (valueOverride ?? contact[f.k] ?? '').trim()
    if (!v) return setAsking(f.k)
    dispatch({ type: 'SEND_MESSAGE', threadId: th.id, text: `${f.share}: ${v}` })
    toast(`${f.share} shared`, 'green')
  }
  const saveAndShare = () => {
    const f = CONTACT_FIELDS.find((x) => x.k === asking)
    const v = (entry[asking] ?? '').trim()
    if (!v) return
    const next = { ...contact, [asking]: v }
    dispatch({ type: role === 'teacher' ? 'SAVE_TEACHER' : 'SAVE_FAMILY', data: { contact: next } })
    share(f, v)
    setAsking(null)
    setEntry({})
  }
  const who = th
    ? role === 'teacher'
      ? requirementById(th.withRequirement)
      : teacherById(th.withId)
    : null
  const name = role === 'teacher' ? who?.family : who?.name
  // A teacher reads a family through their requirement, which is the only
  // profile a family has from the other side of the network.
  const whoHref =
    role === 'teacher' ? `/t/requirement/${th?.withRequirement}` : `/f/teacher/${th?.withId}`

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [th?.messages.length])

  useEffect(() => {
    if (!th && id) nav(`${base}/messages`, { replace: true })
  }, [th, id])

  if (!th || !who) return null

  const whereOptions =
    role === 'teacher'
      ? [
          { id: 'home', label: "At the student's home" },
          { id: 'mine', label: 'At my place' },
          { id: 'online', label: 'Online' },
        ]
      : [
          { id: 'home', label: 'At our home' },
          { id: 'mine', label: 'At your place' },
          { id: 'online', label: 'Online' },
        ]

  const send = () => {
    const v = text.trim()
    if (!v) return
    dispatch({ type: 'SEND_MESSAGE', threadId: th.id, text: v })
    setText('')
    setTimeout(() => {
      dispatch({
        type: 'RECEIVE_MESSAGE',
        threadId: th.id,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
      })
    }, 1400)
  }

  const propose = () => {
    const label = whereOptions.find((w) => w.id === (demo.where || 'home'))?.label ?? 'At home'
    dispatch({
      type: 'PROPOSE_DEMO',
      threadId: th.id,
      by: role,
      demo: { ...demo, where: label },
    })
    setProposing(false)
    toast('Demo class proposed')
  }

  return (
    <>
      <TopBar
        edge
        back
        onBack={() => nav(`${base}/messages`)}
        title={
          /* Tapping a name and photo that plainly belong to a person should
             open that person. It looked tappable and did nothing. */
          <Link className="u-row threadhead" style={{ gap: 10 }} to={whoHref}>
            <Avatar name={name ?? '—'} photo={role === 'family' ? who?.photo : undefined} size={44} />
            <span className="u-grow" style={{ minWidth: 0 }}>
              <span className="u-truncate" style={{ display: 'block' }}>
                {name}
              </span>
              <span
                className="xs u-truncate"
                style={{ display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 500 }}
              >
                {role === 'teacher'
                  ? `${who.classLevel} · ${localityName(who.locality)}`
                  : `${who.subjects.join(', ')} · ${localityName(who.locality)}`}
              </span>
            </span>
          </Link>
        }
      />

      <div className="shell__scroll">
        <div className="chat">
          <div className="chatsys">
            Contact details are yours to share. Bargad does not pass on numbers or addresses.
          </div>

          {th.messages.map((m) =>
            m.sys ? (
              <div key={m.id} className="chatsys">
                {m.text}
              </div>
            ) : (
              <div key={m.id} className={`bub ${m.them ? 'bub--them' : 'bub--me'}`}>
                {m.text}
                <span className="bub__time">{m.t}</span>
              </div>
            )
          )}

          {/* ---- Demo class card ---- */}
          {th.demo && (
            <div className="chatcard">
              <div className="u-row" style={{ gap: 10 }}>
                <IcCal size={19} />
                <span className="h3 u-grow">
                  {th.demo.status === 'confirmed'
                    ? 'Demo class confirmed'
                    : th.demo.status === 'done'
                      ? 'Demo class done'
                      : 'Demo class proposed'}
                </span>
                {th.demo.status === 'confirmed' && (
                  <Chip tone="indigo">
                    <IcCheck size={12} />
                    Set
                  </Chip>
                )}
              </div>
              <p className="body" style={{ marginTop: 10, color: 'var(--ink)' }}>
                {th.demo.day} · {th.demo.time}
                <br />
                {th.demo.where}
              </p>
              {th.demo.status === 'proposed' && (
                <div className="u-row" style={{ gap: 10, marginTop: 14 }}>
                  <Button
                    block
                    variant="quiet"
                    size="sm"
                    onClick={() => setProposing(true)}
                  >
                    Suggest another
                  </Button>
                  <Button
                    block
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'CONFIRM_DEMO', threadId: th.id })
                      toast('Demo confirmed', 'green')
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              )}
              {th.demo.status === 'confirmed' && !th.active && (
                <>
                  <div className="sharerow">
                    <span className="sm" style={{ display: 'block', marginBottom: 8 }}>
                      A demo is fixed, so you can hand over what they need to reach you.
                    </span>
                    <div className="u-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      {CONTACT_FIELDS.map((f) => (
                        <button key={f.k} className="fchip" onClick={() => share(f)}>
                          Share {f.share.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    block
                    size="sm"
                    style={{ marginTop: 12 }}
                    onClick={() => {
                      dispatch({ type: 'START_TUITION', threadId: th.id, requestId: th.requestId })
                      toast('Tuition started', 'green')
                    }}
                  >
                    The demo went well, start tuition
                  </Button>
                </>
              )}
            </div>
          )}

          {th.active && (
            <div className="chatcard" style={{ background: 'var(--green-t)' }}>
              <span className="h3">Tuition is running</span>
              <p className="sm" style={{ marginTop: 8, color: 'var(--ink-2)' }}>
                Bargad steps back from here. Fees, timings and everything else are between the
                two of you. When it ends, {role === 'teacher' ? 'the family' : 'you'} can leave a
                review.
              </p>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* ---- Composer ---- */}
      <div className="composer">
        {!th.demo && (
          <button
            className="iconbtn"
            aria-label="Propose a demo class"
            onClick={() => setProposing(true)}
          >
            <IcCal size={19} />
          </button>
        )}
        <textarea
          className="composer__input"
          rows={1}
          value={text}
          placeholder="Write a message…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button
          className={`iconbtn iconbtn--solid${text.trim() ? '' : ' iconbtn--waiting'}`}
          aria-label="Send"
          onClick={() => (text.trim() ? send() : toast('Write a message first.'))}
          aria-disabled={!text.trim()}
        >
          <IcSend size={19} />
        </button>
      </div>

      {/* ---- Save a detail, then send it ---- */}
      <Sheet
        open={!!asking}
        onClose={() => {
          setAsking(null)
          setEntry({})
        }}
        title={`Share your ${CONTACT_FIELDS.find((f) => f.k === asking)?.share.toLowerCase() ?? ''}`}
        subtitle="Saved on this device so the next time is one tap. Never shown on your profile."
        footer={
          <Button block onClick={saveAndShare} aria-disabled={!(entry[asking] ?? '').trim()}>
            Save and send
          </Button>
        }
      >
        {asking && <ContactFields value={entry} onChange={setEntry} only={asking} />}
      </Sheet>

      {/* ---- Propose demo ---- */}
      <Sheet
        open={proposing}
        onClose={() => setProposing(false)}
        title="Propose a demo class"
        subtitle="One free class so both sides can decide before committing to a month."
        footer={
          <Button block onClick={propose}>
            Propose it
          </Button>
        }
      >
        <Field label="Day">
          <OptionGroup options={DAYS} value={demo.day} onChange={(v) => setDemo((s) => ({ ...s, day: v }))} />
        </Field>
        <Field label="Time">
          <OptionGroup options={TIMES} value={demo.time} onChange={(v) => setDemo((s) => ({ ...s, time: v }))} />
        </Field>
        <Field
          label="Where"
          hint="The exact address is shared by you, in chat, only once a demo is confirmed."
        >
          <OptionGroup
            options={whereOptions}
            value={demo.where || 'home'}
            onChange={(v) => setDemo((s) => ({ ...s, where: v }))}
            wide
          />
        </Field>
        <div className="notice" style={{ marginBottom: 24 }}>
          <span style={{ flex: 'none', fontSize: 17 }}>🤝</span>
          <span>
            Bargad does not take a fee for the demo or for anything after it. What you agree is
            between the two of you.
          </span>
        </div>
      </Sheet>
    </>
  )
}
