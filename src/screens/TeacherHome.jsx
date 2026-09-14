import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { CAPACITY, REQUIREMENTS } from '../data/seed'
import { RequirementCard, RequestCard } from '../components/Cards'
import { Button, Chip, Sheet, OptionGroup, SectionHead, Avatar } from '../components/UI'
import { BannerDoodle, Logo } from '../components/Brand'
import { IcArrow, IcSliders } from '../components/Icons'
import { greeting, inr, localityName, requirementById, scoreRequirementForTeacher, slotShort, teachesRange } from '../lib/utils'

export default function TeacherHome() {
  const { state, dispatch, toast } = useApp()
  const t = state.teacher
  const nav = useNavigate()
  const [editing, setEditing] = useState(false)

  const respondedTo = state.requests
    .filter((r) => r.from === 'me-teacher')
    .map((r) => r.toRequirement)

  const matches = useMemo(() => {
    return REQUIREMENTS.filter((r) => !respondedTo.includes(r.id))
      .map((r) => ({ r, ...scoreRequirementForTeacher(r, t) }))
      .filter((x) => x.score >= 55)
      .sort((a, b) => b.score - a.score)
  }, [t, respondedTo.join()])

  const incoming = state.requests.filter(
    (r) => r.direction === 'received' && r.status === 'pending'
  )
  const live = state.threads.filter((th) => th.withRequirement)

  const cap = CAPACITY[t.capacity] ?? CAPACITY.open
  const bannerClass =
    t.capacity === 'open'
      ? 'intent--green'
      : t.capacity === 'limited'
        ? 'intent--orange'
        : 'intent--off'
  const isOn = t.capacity === 'open' || t.capacity === 'limited'

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--safe-t) + 20px)' }}>
      <div className="u-spread" style={{ marginBottom: 22 }}>
        <Logo size={30} />
        <Link to="/t/profile">
          <Avatar name={t.name} size={44} />
        </Link>
      </div>

      <p className="eyebrow">{greeting()}</p>
      <h1 className="h1" style={{ marginTop: 4 }}>
        {t.name.split(' ')[0]}
      </h1>

      {/* ---- Intent banner: the product's centre of gravity ---- */}
      <div className={`intent ${bannerClass}`} style={{ marginTop: 18 }}>
        <span style={{ color: `var(--)` }}>
          <BannerDoodle name="book" />
        </span>
        <div style={{ position: 'relative' }}>
          <span className="intent__label" style={{ color: `var(--)` }}>
            <span className={`dot${t.capacity === 'open' ? ' dot--pulse' : ''}`} />
            Your status
          </span>
          <h2 className="intent__title">{cap.label}</h2>
          <p className="intent__sub">
            {t.subjects.join(', ')} · {teachesRange(t)}
            <br />
            {localityName(t.locality)} · {t.slots.map(slotShort).join(', ')} · {inr(t.fee)}/month
          </p>
          <div className="intent__foot">
            <span className="sm strong">
              {isOn
                ? `${t.seatsLeft} ${t.seatsLeft === 1 ? 'seat' : 'seats'} open`
                : 'Hidden from new requests'}
            </span>
            <Button size="sm" variant="quiet" onClick={() => setEditing(true)}>
              <IcSliders size={16} />
              Change
            </Button>
          </div>
        </div>
      </div>

      {/* ---- Matched requirements ---- */}
      {isOn ? (
        <>
          <SectionHead
            title={
              matches.length
                ? `${matches.length} ${matches.length === 1 ? 'family is' : 'families are'} looking for what you teach`
                : 'Nothing matching right now'
            }
            action={
              matches.length > 2 ? (
                <Link to="/t/discover" className="sechead__link">
                  See all
                </Link>
              ) : null
            }
          />
          {matches.length ? (
            <div className="cardlist">
              {matches.slice(0, 3).map(({ r, reasons, km }) => (
                <RequirementCard
                  key={r.id}
                  req={r}
                  km={km}
                  reasons={reasons}
                  to={`/t/requirement/${r.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="notice">
              <span style={{ flex: 'none', fontSize: 17 }}>🌱</span>
              <span>
                No family nearby is asking for {t.subjects.join(' or ')} at your class levels
                today. Widening your travel radius in Profile usually helps.
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="notice" style={{ marginTop: 26 }}>
          <span style={{ flex: 'none', fontSize: 17 }}>🔕</span>
          <span>
            You are marked as <strong className="strong">{cap.label.toLowerCase()}</strong>, so
            families are not sending you requests. Turn yourself back on whenever you have room.
          </span>
        </div>
      )}

      {/* ---- Requests waiting ---- */}
      {incoming.length > 0 && (
        <>
          <SectionHead
            title="Waiting for your reply"
            action={
              <Link to="/t/requests" className="sechead__link">
                All requests
              </Link>
            }
          />
          <div className="cardlist">
            {incoming.slice(0, 2).map((req) => {
              const r = requirementById(req.fromFamily)
              if (!r) return null
              return (
                <RequestCard
                  key={req.id}
                  to="/t/requests"
                  avatarName={r.family}
                  title={`${r.subjects.join(' & ')} · ${r.classLevel}`}
                  sub={`${r.family} · ${localityName(r.locality)}`}
                  meta={`Received ${req.createdAt} · replies expected within 48 hours`}
                  status="pending"
                />
              )
            })}
          </div>
        </>
      )}

      {/* ---- Running ---- */}
      {live.length > 0 && (
        <>
          <SectionHead title="Your connections" />
          <div className="cardlist">
            {live.map((th) => {
              const r = requirementById(th.withRequirement)
              return (
                <Link key={th.id} to={`/t/messages/${th.id}`} className="card">
                  <div className="u-row" style={{ gap: 14 }}>
                    <Avatar name={r?.family ?? 'Family'} size={44} />
                    <div className="u-grow">
                      <span className="h3">{r?.family}</span>
                      <p className="sm u-truncate">
                        {th.active
                          ? 'Tuition running'
                          : th.demo?.status === 'confirmed'
                            ? `Demo confirmed · ${th.demo.day}`
                            : th.messages[th.messages.length - 1]?.text}
                      </p>
                    </div>
                    <IcArrow size={18} />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* ---- Capacity sheet ---- */}
      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Are you taking students?"
        subtitle="Families only see teachers who can actually accept them."
        footer={
          <Button block onClick={() => setEditing(false)}>
            Done
          </Button>
        }
      >
        <OptionGroup
          options={[
            { id: 'open', label: 'Open to Teach' },
            { id: 'limited', label: 'Limited availability' },
            { id: 'full', label: 'Currently full' },
            { id: 'paused', label: 'Not looking right now' },
          ]}
          value={t.capacity}
          onChange={(v) => {
            dispatch({ type: 'SET_CAPACITY', capacity: v })
            toast(`You are now “${CAPACITY[v].label}”`)
          }}
          wide
        />
        {(t.capacity === 'open' || t.capacity === 'limited') && (
          <div style={{ marginTop: 22 }}>
            <span className="field__label">Seats you can take: {t.seatsLeft}</span>
            <input
              className="range"
              type="range"
              min="1"
              max="10"
              value={t.seatsLeft}
              onChange={(e) => dispatch({ type: 'SET_SEATS', seats: +e.target.value })}
            />
          </div>
        )}
        <div className="notice" style={{ margin: '18px 0 24px' }}>
          <span style={{ flex: 'none', fontSize: 17 }}>⚖️</span>
          <span>
            Marking yourself full does not hurt your profile. It moves you down in discovery so
            families stop sending requests you would have to refuse.
          </span>
        </div>
      </Sheet>
    </div>
  )
}
