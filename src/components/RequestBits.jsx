import { useState } from 'react'
import { Button, Field, OptionGroup, Sheet } from './UI'
import { useApp } from '../store/AppContext'
import { IcCheck, IcQuestion, IcX } from './Icons'

const STEP_LABELS = {
  sent: 'Sent',
  received: 'Received',
  clarify: 'Question asked',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  active: 'Tuition started',
}

/** The lifecycle, shown as a state the user can read at a glance. */
export function Timeline({ events = [], status, awaiting = 'them' }) {
  const future =
    status === 'pending'
      ? [
          {
            k: 'reply',
            label: awaiting === 'you' ? 'Your reply' : 'Their reply',
            hint: 'Expires in 7 days',
          },
        ]
      : status === 'accepted'
        ? [{ k: 'demo', label: 'Arrange a demo', hint: 'Agree a time in chat' }]
        : status === 'clarify'
          ? [
              {
                k: 'answer',
                label: awaiting === 'you' ? 'Their answer' : 'Your answer',
                hint: 'Expires in 7 days',
              },
            ]
          : []

  return (
    <div className="timeline">
      {events.map((e, i) => {
        const last = i === events.length - 1 && !future.length
        const stop = e.k === 'declined' || e.k === 'expired'
        return (
          <div
            key={i}
            className={`tl ${stop ? 'tl--stop' : last ? 'tl--now' : 'tl--done'}`}
          >
            <span className="tl__dot">
              {stop ? <IcX size={13} /> : <IcCheck size={13} />}
            </span>
            <div>
              <div className="tl__t">{STEP_LABELS[e.k] ?? e.k}</div>
              <div className="tl__d">{e.t}</div>
            </div>
          </div>
        )
      })}
      {future.map((fu) => (
        <div key={fu.k} className="tl tl--pending">
          <span className="tl__dot">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
          </span>
          <div>
            <div className="tl__t">{fu.label}</div>
            <div className="tl__d">{fu.hint}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The accept / decline / ask decision, and always the user's own. It used to
 * double as a stand-in for the other person; the other side answers by itself
 * now, so this is only ever a real decision on a request somebody sent you.
 */
export function RespondSheet({ open, onClose, who, onResolve }) {
  const { toast } = useApp()
  const [mode, setMode] = useState(null)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('Not able to take a new student')

  const close = () => {
    setMode(null)
    setNote('')
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={mode === 'clarify' ? 'Ask a question' : mode === 'declined' ? 'Decline' : `Reply to ${who}`}
      subtitle="Accepting opens a private chat."
      footer={
        mode === 'clarify' ? (
          <>
            <Button variant="quiet" onClick={() => setMode(null)}>
              Back
            </Button>
            <Button
              block
              aria-disabled={!note.trim()}
              onClick={() =>
                note.trim()
                  ? onResolve('clarify', { note })
                  : toast('Write your question first')
              }
            >
              Send question
            </Button>
          </>
        ) : mode === 'declined' ? (
          <>
            <Button variant="quiet" onClick={() => setMode(null)}>
              Back
            </Button>
            <Button block variant="blush" onClick={() => onResolve('declined', { reason })}>
              Decline
            </Button>
          </>
        ) : (
          <Button block onClick={() => onResolve('accepted', {})}>
            Accept
          </Button>
        )
      }
    >
      {mode === null && (
        <div className="cardlist" style={{ marginBottom: 24 }}>
          <button className="card" onClick={() => setMode('clarify')}>
            <div className="u-row" style={{ gap: 12 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'var(--indigo-t)',
                  color: 'var(--indigo-ink)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                <IcQuestion size={19} />
              </span>
              <div className="u-grow">
                <span className="h3">Ask something first</span>
                <p className="sm" style={{ marginTop: 2 }}>
                  One question, no chat yet.
                </p>
              </div>
            </div>
          </button>
          <button className="card" onClick={() => setMode('declined')}>
            <div className="u-row" style={{ gap: 12 }}>
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'var(--blush)',
                  color: 'var(--blush-ink)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                <IcX size={19} />
              </span>
              <div className="u-grow">
                <span className="h3">Decline</span>
                <p className="sm" style={{ marginTop: 2 }}>
                  A clear no beats silence.
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {mode === 'clarify' && (
        <Field
          label="Your question"
          hint="No contact details are shared."
        >
          <textarea
            className="textarea"
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Would Sunday mornings work instead?"
          />
        </Field>
      )}

      {mode === 'declined' && (
        <Field group label="Reason" hint="Shown to them.">
          <OptionGroup
            options={[
              'Not able to take a new student',
              'Area is too far',
              'Timings do not work',
              'Fee does not work',
              'Not the right subject or level',
            ]}
            value={reason}
            onChange={setReason}
            wide
          />
        </Field>
      )}
    </Sheet>
  )
}
