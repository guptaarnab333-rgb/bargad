import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Button, Chip, Empty, Segmented, TopBar } from '../components/UI'
import { RespondSheet, SimulateBar, Timeline } from '../components/RequestBits'
import { IcQuestion } from '../components/Icons'
import { inr, localityName, STATUS_META, teacherById } from '../lib/utils'

export default function FamilyRequests() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const [tab, setTab] = useState('open')
  const [respondTo, setRespondTo] = useState(null)

  const mine = state.requests.filter((r) => r.from === 'me-family')
  // An accepted request is the most live thing a family has, so it belongs in
  // "In progress", not filed away.
  const openOnes = mine.filter((r) =>
    ['pending', 'clarify', 'accepted', 'active'].includes(r.status)
  )
  const settled = mine.filter((r) => ['declined', 'expired'].includes(r.status))
  const list = tab === 'open' ? openOnes : settled
  const awaiting = mine.filter((r) => ['pending', 'clarify'].includes(r.status)).length

  const resolve = (outcome, extra) => {
    const req = respondTo
    const t = teacherById(req.toTeacher)
    dispatch({
      type: 'RESOLVE_REQUEST',
      id: req.id,
      outcome,
      note: extra.note,
      reason: extra.reason,
      sysText: `${t.name} accepted your request. You can now message each other.`,
    })
    setRespondTo(null)
    toast(
      outcome === 'accepted'
        ? `${t.name.split(' ')[0]} accepted, chat is open`
        : outcome === 'clarify'
          ? `${t.name.split(' ')[0]} asked you a question`
          : `${t.name.split(' ')[0]} declined`,
      outcome === 'accepted' ? 'green' : outcome === 'declined' ? 'blush' : undefined
    )
  }

  const threadFor = (reqId) => state.threads.find((t) => t.requestId === reqId)

  return (
    <>
      <TopBar title="My Requests" />
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
            title={tab === 'open' ? 'No requests out there yet' : 'Nothing closed yet'}
            body={
              tab === 'open'
                ? 'When you send a request to a teacher, you can follow it here: sent, accepted, declined or expired.'
                : 'Requests that were declined or expired without a reply collect here.'
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

                  {/* Their question, if any */}
                  {req.status === 'clarify' && req.clarifyNote && (
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
                    </div>
                  )}

                  {req.status === 'declined' && req.declineReason && (
                    <p className="sm" style={{ marginTop: 12 }}>
                      Reason given: <strong className="strong">{req.declineReason}</strong>
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
                          dispatch({
                            type: 'RESOLVE_REQUEST',
                            id: req.id,
                            outcome: 'accepted',
                            sysText: `${t.name} accepted your request. You can now message each other.`,
                          })
                          toast('Answered, chat is open', 'green')
                        }}
                      >
                        Answer in chat
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

                  {/* Prototype: act as the teacher so both sides can be shown */}
                  {req.status === 'pending' && (
                    <SimulateBar
                      label={`Reply as ${t.name.split(' ')[0]}`}
                      onClick={() => setRespondTo(req)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RespondSheet
        open={!!respondTo}
        onClose={() => setRespondTo(null)}
        who={respondTo ? teacherById(respondTo.toTeacher)?.name : ''}
        onResolve={resolve}
        asOther
      />
    </>
  )
}
