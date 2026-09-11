import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Button, Chip, Field, OptionGroup, Sheet, TopBar } from '../components/UI'
import { IcCal, IcCheck, IcPin, IcSend } from '../components/Icons'
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
  const [demo, setDemo] = useState({ day: DAYS[0], time: TIMES[1], where: '' })

  const base = role === 'teacher' ? '/t' : '/f'
  const who = th
    ? role === 'teacher'
      ? requirementById(th.withRequirement)
      : teacherById(th.withId)
    : null
  const name = role === 'teacher' ? who?.family : who?.name

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
          <span className="u-row" style={{ gap: 10 }}>
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
          </span>
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
                  <div className="notice notice--orange" style={{ marginTop: 14, background: 'rgba(255,255,255,.6)' }}>
                    <IcPin size={18} />
                    <span className="sm">
                      You can share the exact address in this chat now that a demo is fixed.
                    </span>
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
