import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Button, Chip, CONTACT_FIELDS, ContactFields, Field, OptionGroup, Sheet, TopBar } from '../components/UI'
import { IcCal, IcCheck, IcPin, IcSend } from '../components/Icons'
import { Link } from 'react-router-dom'
import { DayPicker, PickerRow, TimeWheel } from '../components/Scheduler'
import { dayLabel, dayLong, defaultDemoSlot, demoWhen, isPastSlot, isoDate, localityName, requirementById, teacherById, timeLabel } from '../lib/utils'

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
  const [demo, setDemo] = useState(() => ({ ...defaultDemoSlot(), wheres: ['home'] }))
  // Which row is open. One at a time, and none to begin with, so the sheet
  // opens showing every answer rather than one huge calendar.
  const [openRow, setOpenRow] = useState(null)

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

  // Being here is what reads it, so the tab bar badge clears on arrival.
  useEffect(() => {
    if (th?.unread) dispatch({ type: 'SEEN_THREAD', id: th.id })
  }, [th?.id, th?.unread])

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

  /* A place is stored as an id, never as a sentence, because the two sides
     word the same place differently: one person's "At my place" is the other
     person's "At your place". Storing the proposer's wording showed the other
     side a sentence written from the wrong chair. */
  const placeName = (id) => whereOptions.find((w) => w.id === id)?.label ?? id
  const placeLine = (d) =>
    d?.where ? placeName(d.where) : (d?.wheres ?? []).map(placeName).join(' or ')

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

  const ackReminder = () => dispatch({ type: 'ACK_DEMO_REMINDER', threadId: th.id })

  const propose = () => {
    if (!demo.wheres.length) return toast('Choose at least one place')
    /* The calendar disables past days but the wheel cannot know the hour, so
       today plus an hour gone by was a proposal for a class in the past. */
    if (isPastSlot(demo.date, demo.time)) return toast('Pick a time still ahead')
    dispatch({ type: 'PROPOSE_DEMO', threadId: th.id, by: role, demo })
    setProposing(false)
    toast('Demo proposed')
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
            Contact details are yours to share. Bargad shares nothing.
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
                    ? 'Demo confirmed'
                    : th.demo.status === 'done'
                      ? 'Demo done'
                      : 'Demo proposed'}
                </span>
                {th.demo.status === 'confirmed' && (
                  <Chip tone="indigo">
                    <IcCheck size={12} />
                    Set
                  </Chip>
                )}
              </div>
              <p className="body" style={{ marginTop: 10, color: 'var(--ink)' }}>
                {demoWhen(th.demo)}
                <br />
                {placeLine(th.demo)}
              </p>
              {/* Confirming is the other person's move. When they are the one
                  waiting on you, you get the button; when you are waiting on
                  them, you get the truth instead of a button that pretends. */}
              {th.demo.status === 'proposed' && th.demo.by === role && (
                <div style={{ marginTop: 14 }}>
                  <Button block variant="quiet" size="sm" onClick={() => setProposing(true)}>
                    Suggest another
                  </Button>
                  <p className="xs" style={{ textAlign: 'center', marginTop: 10 }}>
                    Waiting for them to confirm.
                  </p>
                </div>
              )}
              {th.demo.status === 'proposed' && th.demo.by !== role && (
                <div className="u-row" style={{ gap: 10, marginTop: 14 }}>
                  <Button block variant="quiet" size="sm" onClick={() => setProposing(true)}>
                    Suggest another
                  </Button>
                  <Button
                    block
                    size="sm"
                    onClick={() => dispatch({ type: 'CONFIRM_DEMO', threadId: th.id })}
                  >
                    Confirm
                  </Button>
                </div>
              )}
              {th.demo.status === 'confirmed' && !th.active && (
                <>
                  <div className="sharerow">
                    <span className="sm" style={{ display: 'block', marginBottom: 8 }}>
                      Demo is fixed. Share what they need.
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
                    Start tuition
                  </Button>
                </>
              )}
            </div>
          )}

          {th.active && (
            <div className="chatcard" style={{ background: 'var(--green-t)' }}>
              <span className="h3">Tuition is running</span>
              <p className="sm" style={{ marginTop: 8, color: 'var(--ink-2)' }}>
                Fees and timings are between you two now.
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
            onClick={() => {
              setOpenRow(null)
              setProposing(true)
            }}
          >
            <IcCal size={19} />
          </button>
        )}
        <textarea
          className="composer__input"
          rows={1}
          value={text}
          placeholder="Message"
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
        subtitle="Saved on this device. Never shown on your profile."
        footer={
          <Button block onClick={saveAndShare} aria-disabled={!(entry[asking] ?? '').trim()}>
            Save and send
          </Button>
        }
      >
        {asking && <ContactFields value={entry} onChange={setEntry} only={asking} />}
      </Sheet>

      {/* ---- Confirmed, and what Bargad does next ---- */}
      <Sheet
        open={th.demo?.status === 'confirmed' && !th.demo?.reminded}
        onClose={ackReminder}
        title="Demo confirmed"
        subtitle={`${dayLong(th.demo?.date)}, ${timeLabel(th.demo?.time)}`}
        footer={
          <Button block onClick={ackReminder}>
            Got it
          </Button>
        }
      >
        <div className="card card--sunk">
          <p className="eyebrow">Where</p>
          <p className="h3" style={{ marginTop: 6 }}>
            {placeLine(th.demo)}
          </p>
        </div>
        <div className="notice notice--green" style={{ margin: '14px 0 24px' }}>
          <IcCal size={19} />
          <span>Bargad will remind you both a day before.</span>
        </div>
      </Sheet>

      {/* ---- Propose demo ---- */}
      <Sheet
        open={proposing}
        onClose={() => {
          setOpenRow(null)
          setProposing(false)
        }}
        title="Propose a demo"
        subtitle="One free class before either side commits."
        footer={
          <Button block onClick={propose}>
            Propose
          </Button>
        }
      >
        <PickerRow
          label="Day"
          value={dayLabel(demo.date)}
          open={openRow === 'day'}
          onToggle={() => setOpenRow((o) => (o === 'day' ? null : 'day'))}
        >
          {/* Picking a day answers the question, so the row folds itself away
              and Time and Where come back into view. Leaving a whole calendar
              open after the one tap that finished with it is what buried the
              rest of the sheet in the first place. */}
          <DayPicker
            value={demo.date}
            onChange={(v) => {
              setDemo((s) => ({ ...s, date: v }))
              setOpenRow(null)
            }}
          />
        </PickerRow>
        <PickerRow
          label="Time"
          value={timeLabel(demo.time)}
          open={openRow === 'time'}
          onToggle={() => setOpenRow((o) => (o === 'time' ? null : 'time'))}
        >
          <TimeWheel value={demo.time} onChange={(v) => setDemo((s) => ({ ...s, time: v }))} />
        </PickerRow>
        <Field
          group
          label="Where"
          hint="Offer any that work. They pick one."
        >
          <OptionGroup
            options={whereOptions}
            value={demo.wheres}
            onChange={(v) => setDemo((s) => ({ ...s, wheres: v }))}
            multi
            wide
          />
        </Field>
        <div className="notice" style={{ marginBottom: 24 }}>
          <span style={{ flex: 'none', fontSize: 17 }}>🤝</span>
          <span>
            Bargad takes no fee for the demo or after.
          </span>
        </div>
      </Sheet>
    </>
  )
}
