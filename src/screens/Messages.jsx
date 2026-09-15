import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Avatar, Chip, Empty, TopBar } from '../components/UI'
import { dayLabel, localityName, requirementById, teacherById } from '../lib/utils'

export default function Messages({ role }) {
  const { state } = useApp()
  const base = role === 'teacher' ? '/t' : '/f'

  const threads = state.threads.filter((t) =>
    role === 'teacher' ? !!t.withRequirement : !!t.withId
  )

  return (
    <>
      <TopBar title="Messages" />
      <div className="page" style={{ paddingTop: 8 }}>
        <p className="sm" style={{ marginBottom: 16 }}>
          Chats open after both sides agree.
        </p>

        {threads.length === 0 ? (
          <Empty
            doodle="plane"
            title="No chats yet"
            body="Accepted requests open a chat here."
            action={
              <Link to={`${base}/requests`} className="btn btn--quiet">
                See requests
              </Link>
            }
          />
        ) : (
          <div className="cardlist">
            {threads.map((th) => {
              const who =
                role === 'teacher'
                  ? requirementById(th.withRequirement)
                  : teacherById(th.withId)
              const name = role === 'teacher' ? who?.family : who?.name
              const last = th.messages[th.messages.length - 1]
              const sub =
                role === 'teacher'
                  ? `${who?.subjects.join(', ')} · ${who?.classLevel}`
                  : `${who?.subjects.join(', ')} · ${localityName(who?.locality)}`

              return (
                <Link key={th.id} to={`${base}/messages/${th.id}`} className="card">
                  <div className="u-row" style={{ gap: 14, alignItems: 'flex-start' }}>
                    <Avatar name={name ?? '—'} photo={role === 'family' ? who?.photo : undefined} size={56} />
                    <div className="u-grow">
                      <div className="u-spread" style={{ gap: 8, alignItems: 'flex-start' }}>
                        <span className="h3 u-grow u-truncate">{name}</span>
                        <span className="xs" style={{ flex: 'none' }}>
                          {last?.t}
                        </span>
                      </div>
                      <p className="xs" style={{ marginTop: 1 }}>
                        {sub}
                      </p>
                      <p
                        className="sm"
                        style={{
                          marginTop: 7,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {last?.text}
                      </p>
                      {(th.active || th.demo) && (
                        <div className="u-wrap" style={{ marginTop: 10 }}>
                          {th.active ? (
                            <Chip tone="green">
                              <span className="dot" />
                              Tuition running
                            </Chip>
                          ) : (
                            <Chip tone="indigo">
                              {th.demo.status === 'confirmed'
                                ? `Demo confirmed · ${dayLabel(th.demo.date)}`
                                : 'Demo proposed'}
                            </Chip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
