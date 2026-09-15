import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Button, Chip, Empty, KV, Segmented, TopBar } from '../components/UI'
import { RespondSheet, Timeline } from '../components/RequestBits'
import { IcPin, IcQuestion } from '../components/Icons'
import { budgetUpTo, distanceFrom, distLabel, formatLabel, formatsOf, inr, localityName, requirementById, slotShort, STATUS_META } from '../lib/utils'

export default function TeacherRequests() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const [tab, setTab] = useState('in')
  const [respondTo, setRespondTo] = useState(null)

  const incoming = state.requests.filter((r) => r.direction === 'received')
  const outgoing = state.requests.filter((r) => r.from === 'me-teacher')
  const list = tab === 'in' ? incoming : outgoing
  const waiting = incoming.filter((r) => r.status === 'pending').length

  const threadFor = (id) => state.threads.find((t) => t.requestId === id)

  const resolve = (outcome, extra) => {
    const req = respondTo
    const r = requirementById(req.fromFamily ?? req.toRequirement)
    dispatch({
      type: 'RESOLVE_REQUEST',
      id: req.id,
      outcome,
      note: extra.note,
      reason: extra.reason,
      sysText: `You accepted ${r?.family}. Chat is open.`,
    })
    setRespondTo(null)
    toast(
      outcome === 'accepted'
        ? 'Chat is open'
        : outcome === 'clarify'
          ? 'Question sent'
          : 'Declined',
      outcome === 'accepted' ? 'green' : outcome === 'declined' ? 'blush' : undefined
    )
  }

  return (
    <>
      <TopBar title="Requests" />
      <div style={{ padding: '4px 20px 8px' }}>
        <Segmented
          items={[
            { id: 'in', label: 'From families', count: waiting },
            { id: 'out', label: 'My offers', count: 0 },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="page" style={{ paddingTop: 12 }}>
        {tab === 'in' && waiting > 0 && (
          <p className="sm" style={{ marginBottom: 14 }}>
            <span className="strong">{waiting} waiting.</span> A clear no beats silence.
          </p>
        )}

        {list.length === 0 ? (
          <Empty
            doodle="plane"
            title={tab === 'in' ? 'No requests yet' : 'No offers yet'}
            body={
              tab === 'in'
                ? 'Stay Open to Teach to be found.'
                : 'Offers you send appear here.'
            }
            action={
              <Link to="/t/discover" className="btn btn--quiet">
                Find students
              </Link>
            }
          />
        ) : (
          <div className="cardlist">
            {list.map((req) => {
              const r = requirementById(req.fromFamily ?? req.toRequirement)
              if (!r) return null
              const s = STATUS_META[req.status]
              const th = threadFor(req.id)
              const km = distanceFrom(state.teacher.locality, r.locality)
              const isIncoming = req.direction === 'received'

              return (
                <div key={req.id} className="card">
                  <div className="u-row" style={{ gap: 14, alignItems: 'flex-start' }}>
                    <Avatar name={r.family} size={56} />
                    <div className="u-grow">
                      <div className="u-spread" style={{ gap: 10, alignItems: 'flex-start' }}>
                        <span className="h3 u-grow">
                          {r.subjects.join(' & ')} · {r.classLevel}
                        </span>
                        <Chip tone={s.tone}>{s.label}</Chip>
                      </div>
                      <p className="sm" style={{ marginTop: 3 }}>
                        {r.family} · {r.board}
                      </p>
                      <p className="sm u-row" style={{ gap: 5, marginTop: 4 }}>
                        <IcPin size={13} />
                        {localityName(r.locality)} · {distLabel(km)}
                      </p>
                    </div>
                  </div>

                  {isIncoming && req.status === 'pending' && (
                    <>
                      <div style={{ marginTop: 16 }}>
                        <KV
                          tone="blush"
                          items={[
                            { k: 'Their budget', v: budgetUpTo(r.budgetMax) },
                            { k: 'Your fee', v: `${inr(state.teacher.fee)}` },
                            { k: 'When', v: r.slots.map(slotShort).join(', ') },
                            {
                              k: 'Format',
                              v: formatLabel(formatsOf(r)),
                            },
                          ]}
                        />
                      </div>
                      <p className="rcard__need" style={{ marginTop: 14 }}>
                        {r.need}
                      </p>
                    </>
                  )}

                  {req.status === 'clarify' && req.clarifyNote && (
                    <div
                      className="card card--sunk"
                      style={{ background: 'var(--indigo-t)', marginTop: 14, padding: 16 }}
                    >
                      <p className="eyebrow u-row" style={{ gap: 6, color: 'var(--indigo-ink)' }}>
                        <IcQuestion size={13} />
                        Question asked
                      </p>
                      <p className="body" style={{ marginTop: 7, color: 'var(--ink)' }}>
                        “{req.clarifyNote}”
                      </p>
                    </div>
                  )}

                  {req.status === 'declined' && req.declineReason && (
                    <p className="sm" style={{ marginTop: 12 }}>
                      Reason: <strong className="strong">{req.declineReason}</strong>
                    </p>
                  )}

                  {req.status === 'expired' && (
                    <p className="sm" style={{ marginTop: 12 }}>
                      Expired after seven days with no reply.
                    </p>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <Timeline
                      events={req.events}
                      status={req.status}
                      awaiting={isIncoming ? 'you' : 'them'}
                    />
                  </div>

                  {/* Real decision: this is the teacher's own inbox */}
                  {isIncoming && req.status === 'pending' && (
                    <div className="u-row" style={{ gap: 10, marginTop: 16 }}>
                      <Button block variant="quiet" onClick={() => setRespondTo(req)}>
                        Decline or ask
                      </Button>
                      <Button
                        block
                        onClick={() => {
                          dispatch({
                            type: 'RESOLVE_REQUEST',
                            id: req.id,
                            outcome: 'accepted',
                            sysText: `You accepted ${r.family}. Chat is open.`,
                          })
                          toast('Chat is open', 'green')
                        }}
                      >
                        Accept
                      </Button>
                    </div>
                  )}

                  {req.status === 'accepted' && th && (
                    <Button
                      block
                      style={{ marginTop: 16 }}
                      onClick={() => nav(`/t/messages/${th.id}`)}
                    >
                      Open chat
                    </Button>
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
        who={respondTo ? requirementById(respondTo.fromFamily)?.family : ''}
        onResolve={resolve}
      />
    </>
  )
}
