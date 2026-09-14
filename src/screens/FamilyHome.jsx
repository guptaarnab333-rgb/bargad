import { HomeHeader } from '../components/HomeHeader'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { TEACHERS } from '../data/seed'
import { TeacherCard, RequestCard } from '../components/Cards'
import { Avatar, Button, Sheet, SectionHead, Switch } from '../components/UI'
import { BannerDoodle, Logo } from '../components/Brand'
import { IcArrow, IcSliders } from '../components/Icons'
import { budgetUpTo, greeting, inr, localityName, scoreTeacherForRequirement, slotShort, teacherById } from '../lib/utils'

export default function FamilyHome() {
  const { state, dispatch, toast } = useApp()
  const f = state.family
  const [editing, setEditing] = useState(false)

  const requestedTo = state.requests
    .filter((r) => r.from === 'me-family')
    .map((r) => r.toTeacher)

  const matches = useMemo(() => {
    return TEACHERS.filter((t) => !requestedTo.includes(t.id))
      .map((t) => ({ t, ...scoreTeacherForRequirement(t, f) }))
      .filter((x) => x.score >= 70)
      .sort((a, b) => b.score - a.score)
  }, [f, requestedTo.join()])

  const pending = state.requests.filter(
    (r) => r.from === 'me-family' && (r.status === 'pending' || r.status === 'clarify')
  )
  const live = state.threads.filter((th) => th.withId)

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--safe-t) + 20px)' }}>
      <HomeHeader
        name={f.parentName}
        photo={f.photo}
        profileTo="/f/profile"
        greeting={greeting()}
      />

      {/* ---- Intent banner ---- */}
      <div
        className={`intent ${f.looking ? 'intent--indigo' : 'intent--off'}`}
        style={{ marginTop: 18 }}
      >
        <span style={{ color: f.looking ? 'var(--indigo-ink)' : 'var(--ink-3)' }}>
          <BannerDoodle name="globe" />
        </span>
        <div style={{ position: 'relative' }}>
          <span
            className="intent__label"
            style={{ color: f.looking ? 'var(--indigo-ink)' : 'var(--ink-3)' }}
          >
            <span className={`dot${f.looking ? ' dot--pulse' : ''}`} />
            {f.looking ? 'Looking for a Teacher' : 'Search paused'}
          </span>
          <h2 className="intent__title">
            {f.subjects.join(' & ')}
            <br />
            {f.classLevel}
          </h2>
          <p className="intent__sub">
            {f.board} · {localityName(f.locality)} · {f.slots.map(slotShort).join(', ')}
            <br />
            {budgetUpTo(f.budgetMax)}/month ·{' '}
            {f.format === 'group' ? 'Small group' : 'One-to-one'}
          </p>
          <div className="intent__foot">
            <span className="sm strong">
              {f.looking ? 'Teachers nearby can see this' : 'Hidden from teachers'}
            </span>
            <Button size="sm" variant="quiet" onClick={() => setEditing(true)}>
              <IcSliders size={16} />
              Change
            </Button>
          </div>
        </div>
      </div>

      {/* ---- Matched teachers ---- */}
      <SectionHead
        title={
          matches.length
            ? `${matches.length} ${matches.length === 1 ? 'teacher' : 'teachers'} near you can take ${f.learner}`
            : 'No close matches today'
        }
        action={
          matches.length > 3 ? (
            <Link to="/f/discover" className="sechead__link">
              See all
            </Link>
          ) : null
        }
      />
      {matches.length ? (
        <div className="cardlist">
          {matches.slice(0, 3).map(({ t, reasons, km }) => (
            <TeacherCard
              key={t.id}
              teacher={t}
              km={km}
              reasons={reasons}
              to={`/f/teacher/${t.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="notice">
          <span style={{ flex: 'none', fontSize: 17 }}>🌱</span>
          <span>
            Nobody open in {localityName(f.locality)} matches all of what you asked for. Try
            widening the budget or adding Online in Find Teachers.
          </span>
        </div>
      )}

      {/* ---- Requests in flight ---- */}
      {pending.length > 0 && (
        <>
          <SectionHead
            title="Your requests"
            action={
              <Link to="/f/requests" className="sechead__link">
                See all
              </Link>
            }
          />
          <div className="cardlist">
            {pending.slice(0, 2).map((req) => {
              const t = teacherById(req.toTeacher)
              if (!t) return null
              return (
                <RequestCard
                  key={req.id}
                  to="/f/requests"
                  avatarName={t.name}
                  title={t.name}
                  sub={`${t.subjects.join(', ')} · ${localityName(t.locality)}`}
                  meta={
                    req.status === 'clarify'
                      ? 'They asked you a question'
                      : `Sent ${req.createdAt} · usually replies in ${t.responseHrs}h`
                  }
                  status={req.status}
                />
              )
            })}
          </div>
        </>
      )}

      {/* ---- Connections ---- */}
      {live.length > 0 && (
        <>
          <SectionHead title="Your connections" />
          <div className="cardlist">
            {live.map((th) => {
              const t = teacherById(th.withId)
              return (
                <Link key={th.id} to={`/f/messages/${th.id}`} className="card">
                  <div className="u-row" style={{ gap: 14 }}>
                    <Avatar name={t?.name ?? 'Teacher'} photo={t?.photo} size={44} />
                    <div className="u-grow">
                      <span className="h3">{t?.name}</span>
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

      {/* ---- Intent sheet ---- */}
      <Sheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Looking for a teacher?"
        subtitle="When this is on, nearby teachers can see your requirement and offer to teach."
        footer={
          <Button block onClick={() => setEditing(false)}>
            Done
          </Button>
        }
      >
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="u-spread" style={{ gap: 14 }}>
            <div className="u-grow">
              <span className="h3">Looking for a Teacher</span>
              <p className="sm" style={{ marginTop: 3 }}>
                {f.looking
                  ? 'Teachers in your area can see this requirement.'
                  : 'Your requirement is hidden. You can still browse teachers.'}
              </p>
            </div>
            <Switch
              checked={!!f.looking}
              label="Looking for a teacher"
              onChange={(v) => {
                dispatch({ type: 'SET_LOOKING', looking: v })
                toast(v ? 'Teachers can now see your requirement' : 'Your search is paused')
              }}
            />
          </div>
        </div>
        <div className="notice" style={{ marginBottom: 24 }}>
          <span style={{ flex: 'none', fontSize: 17 }}>🔒</span>
          <span>
            Teachers see <strong className="strong">{f.classLevel} · {f.board}</strong> and your
            locality, never {f.learner}’s full name, your address or your phone number.
          </span>
        </div>
        <Link to="/f/profile" className="btn btn--quiet btn--block" style={{ marginBottom: 24 }}>
          Edit the requirement
        </Link>
      </Sheet>
    </div>
  )
}
