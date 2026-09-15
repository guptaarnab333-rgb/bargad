import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Button, Chip, Empty, Field, Segmented, Sheet, TopBar } from '../components/UI'
import { Timeline } from '../components/RequestBits'
import { IcQuestion } from '../components/Icons'
import { inr, localityName, STATUS_META, teacherById } from '../lib/utils'

export default function FamilyRequests() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const [tab, setTab] = useState('open')
  // The request whose question is being answered, and the answer so far.
  const [answering, setAnswering] = useState(null)
  const [answer, setAnswer] = useState('')

  const mine = state.requests.filter((r) => r.from === 'me-family')
  // An accepted request is the most live thing a family has, so it belongs in
  // "In progress", not filed away.
  const openOnes = mine.filter((r) =>
    ['pending', 'clarify', 'accepted', 'active'].includes(r.status)
  )
  const settled = mine.filter((r) => ['declined', 'expired'].includes(r.status))
  const list = tab === 'open' ? openOnes : settled
  const awaiting = mine.filter((r) => ['pending', 'clarify'].includes(r.status)).length

  const threadFor = (reqId) => state.threads.find((t) => t.requestId === reqId)

  return (
    <>
      <TopBar title="Requests" />
      <div style={{ padding: '4px 20px 8px' }}>
        <Segmented
          items={[
            { id: 'open', label: 'In progress', count: awaiting },
            { id: 'past', label: 'Closed', count: 0 },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="page" style={{ paddingTop: 12 }}>
        {list.length === 0 ? (
          <Empty
            doodle="plane"
            title={tab === 'open' ? 'No requests yet' : 'Nothing closed yet'}
            body={
              tab === 'open'
                ? 'Requests you send appear here.'
                : 'Declined and expired requests collect here.'
            }
            action={
              tab === 'open' ? (
                <Link to="/f/discover" className="btn btn--quiet">
                  Find teachers
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="cardlist">
            {list.map((req) => {
              const t = teacherById(req.toTeacher)
              if (!t) return null
              const s = STATUS_META[req.status]
              const th = threadFor(req.id)
              return (
                <div key={req.id} className="card">
                  <div className="u-row" style={{ gap: 14, alignItems: 'flex-start' }}>
                    <Avatar name={t.name} photo={t.photo} size={56} />
                    <div className="u-grow">
                      <div className="u-spread" style={{ gap: 10, alignItems: 'flex-start' }}>
                        <Link to={`/f/teacher/${t.id}`} className="h3 u-grow">
                          {t.name}
                        </Link>
                        <Chip tone={s.tone}>{s.label}</Chip>
                      </div>
                      <p className="sm" style={{ marginTop: 3 }}>
                        {t.subjects.join(', ')} · {localityName(t.locality)} · {inr(t.fee)}/mo
                      </p>
                    </div>
                  </div>

                  {/* Their question, and your answer once you have given one */}
                  {req.clarifyNote && (
                    <div
                      className="card card--sunk"
                      style={{ background: 'var(--indigo-t)', marginTop: 14, padding: 16 }}
                    >
                      <p className="eyebrow u-row" style={{ gap: 6, color: 'var(--indigo-ink)' }}>
                        <IcQuestion size={13} />
                        {t.name.split(' ')[0]} asked
                      </p>
                      <p className="body" style={{ marginTop: 7, color: 'var(--ink)' }}>
                        “{req.clarifyNote}”
                      </p>
                      {req.answerNote && (
                        <>
                          <p className="eyebrow" style={{ marginTop: 14 }}>You answered</p>
                          <p className="body" style={{ marginTop: 5, color: 'var(--ink)' }}>
                            “{req.answerNote}”
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {req.status === 'declined' && req.declineReason && (
                    <p className="sm" style={{ marginTop: 12 }}>
                      Reason: <strong className="strong">{req.declineReason}</strong>
                    </p>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <Timeline events={req.events} status={req.status} />
                  </div>

                  {/* Actions */}
                  {req.status === 'accepted' && th && (
                    <Button
                      block
                      style={{ marginTop: 16 }}
                      onClick={() => nav(`/f/messages/${th.id}`)}
                    >
                      Open chat
                    </Button>
                  )}
                  {req.status === 'clarify' && th == null && (
                    <div className="u-row" style={{ gap: 10, marginTop: 16 }}>
                      <Button
                        block
                        variant="quiet"
                        onClick={() =>
                          dispatch({ type: 'WITHDRAW_REQUEST', id: req.id }) ||
                          toast('Request withdrawn')
                        }
                      >
                        Withdraw
                      </Button>
                      <Button
                        block
                        onClick={() => {
                          setAnswer('')
                          setAnswering(req)
                        }}
                      >
                        Answer
                      </Button>
                    </div>
                  )}
                  {req.status === 'declined' && (
                    <Link
                      to="/f/discover"
                      className="btn btn--quiet btn--block"
                      style={{ marginTop: 16 }}
                    >
                      Find someone else
                    </Link>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ---- Answering their question ---- */}
      <Sheet
        open={!!answering}
        onClose={() => setAnswering(null)}
        title="Answer their question"
        subtitle="They decide once they have read it."
        footer={
          <Button
            block
            aria-disabled={!answer.trim()}
            onClick={() => {
              if (!answer.trim()) return toast('Write your answer first')
              dispatch({ type: 'ANSWER_CLARIFY', id: answering.id, note: answer.trim() })
              setAnswering(null)
              toast('Answer sent', 'green')
            }}
          >
            Send answer
          </Button>
        }
      >
        {answering?.clarifyNote && (
          <div className="notice notice--indigo" style={{ marginBottom: 18 }}>
            <IcQuestion size={18} />
            <span>{answering.clarifyNote}</span>
          </div>
        )}
        <Field label="Your answer" hint="No contact details are shared.">
          <textarea
            className="textarea"
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Sunday mornings work for us."
          />
        </Field>
      </Sheet>
    </>
  )
}
