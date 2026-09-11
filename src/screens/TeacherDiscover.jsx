import { useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { BOARDS, CLASSES, FORMATS, LOCALITIES, REQUIREMENTS, SUBJECTS } from '../data/seed'
import { RequirementCard } from '../components/Cards'
import { Button, Empty, FilterRow, OptionGroup, Sheet, TopBar } from '../components/UI'
import { IcSliders } from '../components/Icons'
import { filterRequirements, modesFor, scoreRequirementForTeacher } from '../lib/utils'

const SORTS = [
  { id: 'fit', label: 'Best fit' },
  { id: 'near', label: 'Nearest' },
  { id: 'new', label: 'Newest' },
  { id: 'pay', label: 'Highest budget' },
]

export default function TeacherDiscover() {
  const { state } = useApp()
  const t = state.teacher
  const [subject, setSubject] = useState(t.subjects[0] ?? null)
  const [sort, setSort] = useState('fit')
  const [open, setOpen] = useState(false)
  const [adv, setAdv] = useState({
    classLevel: null,
    board: null,
    mode: null,
    locality: null,
    format: null,
  })

  const responded = state.requests
    .filter((r) => r.from === 'me-teacher')
    .map((r) => r.toRequirement)

  const results = useMemo(() => {
    const base = filterRequirements(REQUIREMENTS, { ...adv, subject })
    const scored = base.map((r) => ({
      r,
      ...scoreRequirementForTeacher(r, t),
      done: responded.includes(r.id),
    }))
    const by = {
      fit: (a, b) => b.score - a.score,
      near: (a, b) => (a.km ?? 99) - (b.km ?? 99),
      new: (a, b) => a.r.posted.length - b.r.posted.length,
      pay: (a, b) => b.r.budgetMax - a.r.budgetMax,
    }[sort]
    return scored.sort(by)
  }, [subject, adv, sort, t, responded.join()])

  const activeCount = Object.values(adv).filter(Boolean).length

  return (
    <>
      <TopBar
        title="Find Students"
        right={
          <button
            className={`iconbtn${activeCount ? ' iconbtn--on' : ''}`}
            onClick={() => setOpen(true)}
            aria-label="Filters"
          >
            <IcSliders size={19} />
          </button>
        }
      />

      <FilterRow options={SUBJECTS} value={subject} onChange={setSubject} allLabel="All subjects" />
      <div className="u-scroll-x" style={{ padding: '10px 20px 4px' }}>
        {SORTS.map((s) => (
          <button
            key={s.id}
            className="fchip"
            aria-pressed={sort === s.id}
            onClick={() => setSort(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="page" style={{ paddingTop: 16 }}>
        <p className="sm" style={{ marginBottom: 14 }}>
          <span className="strong">{results.length}</span>{' '}
          {results.length === 1 ? 'family' : 'families'} looking · you choose who to answer, and
          it costs nothing to reply.
        </p>

        {results.length ? (
          <div className="cardlist">
            {results.map(({ r, reasons, km, done }) => (
              <div key={r.id} style={done ? { opacity: 0.5 } : undefined}>
                <RequirementCard
                  req={r}
                  km={km}
                  reasons={done ? ['Already responded'] : sort === 'fit' ? reasons : []}
                  to={`/t/requirement/${r.id}`}
                  tone={sort === 'fit' && reasons.length >= 3 ? 'clay' : ''}
                />
              </div>
            ))}
          </div>
        ) : (
          <Empty
            doodle="beaker"
            title="No requirements match that"
            body="Families post through the day. Clearing a filter or two usually brings a few back."
            action={
              <Button
                variant="quiet"
                onClick={() =>
                  setAdv({ classLevel: null, board: null, mode: null, locality: null, format: null })
                }
              >
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Narrow it down"
        subtitle="Only what you can genuinely take on. Replying to everything helps nobody."
        footer={
          <>
            <Button
              variant="quiet"
              onClick={() =>
                setAdv({ classLevel: null, board: null, mode: null, locality: null, format: null })
              }
            >
              Clear
            </Button>
            <Button block onClick={() => setOpen(false)}>
              Show {results.length}
            </Button>
          </>
        }
      >
        <div className="field">
          <span className="field__label">Class</span>
          <OptionGroup
            options={CLASSES}
            value={adv.classLevel}
            onChange={(v) => setAdv((s) => ({ ...s, classLevel: s.classLevel === v ? null : v }))}
          />
        </div>
        <div className="field">
          <span className="field__label">Board</span>
          <OptionGroup
            options={BOARDS}
            value={adv.board}
            onChange={(v) => setAdv((s) => ({ ...s, board: s.board === v ? null : v }))}
          />
        </div>
        <div className="field">
          <span className="field__label">Mode</span>
          <OptionGroup
            options={modesFor('teacher')}
            value={adv.mode}
            onChange={(v) => setAdv((s) => ({ ...s, mode: s.mode === v ? null : v }))}
            wide
          />
        </div>
        <div className="field">
          <span className="field__label">Format</span>
          <OptionGroup
            options={FORMATS}
            value={adv.format}
            onChange={(v) => setAdv((s) => ({ ...s, format: s.format === v ? null : v }))}
          />
        </div>
        <div className="field" style={{ marginBottom: 24 }}>
          <span className="field__label">Area</span>
          <OptionGroup
            options={LOCALITIES.map((l) => ({ id: l.id, label: l.name }))}
            value={adv.locality}
            onChange={(v) => setAdv((s) => ({ ...s, locality: s.locality === v ? null : v }))}
          />
        </div>
      </Sheet>
    </>
  )
}
