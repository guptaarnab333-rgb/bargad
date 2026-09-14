import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { AGE_BANDS, BOARDS, CATEGORIES, CLASSES, FORMATS, LOCALITIES, REQUIREMENTS } from '../data/seed'
import { RequirementCard } from '../components/Cards'
import { Button, Empty, OptionGroup, SearchBar, Segmented, Sheet, TopBar, Understood } from '../components/UI'
import { filterRequirements, modesFor, parseSearch, scoreRequirementForTeacher, subjectCategory } from '../lib/utils'

const SORTS = [
  { id: 'fit', label: 'Best fit' },
  { id: 'near', label: 'Nearest' },
  { id: 'new', label: 'Newest' },
  { id: 'pay', label: 'Highest budget' },
]

export default function TeacherDiscover() {
  const { state } = useApp()
  const t = state.teacher
  const [category, setCategory] = useState('academic')
  const [q, setQ] = useState('')
  const [dropped, setDropped] = useState([])
  const [sort, setSort] = useState('fit')
  const [open, setOpen] = useState(false)
  const [adv, setAdv] = useState({
    classLevel: null,
    board: null,
    mode: null,
    locality: null,
    format: null,
    ageBand: null,
  })

  const responded = state.requests
    .filter((r) => r.from === 'me-teacher')
    .map((r) => r.toRequirement)

  const parsed = useMemo(() => parseSearch(q), [q])
  // Searching "guitar" while Academics is showing would return nothing, so the
  // named subject decides the half rather than contradicting it.
  useEffect(() => {
    if (!parsed.subject) return
    const c = subjectCategory(parsed.subject)
    if (c !== category) switchCategory(c)
  }, [parsed.subject])
  const chips = parsed.chips.filter((c) => !dropped.includes(c.k))
  const live = useMemo(() => {
    const out = {}
    for (const c of chips) out[c.k] = parsed[c.k]
    if (!dropped.includes('text')) out.text = parsed.text
    return out
  }, [parsed, dropped])

  /* Class and board mean nothing under Activities, and an age group means
     nothing under Academics, so switching drops whichever no longer applies.
     Leaving them set returns zero results and looks like a broken switch. */
  const switchCategory = (c) => {
    setCategory(c)
    setAdv((s) => ({ ...s, classLevel: null, board: null, ageBand: null }))
  }

  const results = useMemo(() => {
    const base = filterRequirements(REQUIREMENTS, {
      ...adv,
      category,
      subject: live.subject ?? null,
      locality: live.locality ?? adv.locality,
      city: live.city ?? null,
      board: live.board ?? adv.board,
      classLevel: live.classLevel ?? adv.classLevel,
      mode: live.mode ?? adv.mode,
      text: live.text,
    })
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
  }, [live, adv, category, sort, t, responded.join()])

  const activeCount = Object.values(adv).filter(Boolean).length

  return (
    <>
      <TopBar title="Find Students" />

      <SearchBar
        value={q}
        onChange={(v) => { setQ(v); setDropped([]) }}
        placeholder="Try: class 9 maths in Dalanwala"
        onFilters={() => setOpen(true)}
        activeCount={activeCount}
      />
      <div className="catrow">
        <Segmented items={CATEGORIES} value={category} onChange={switchCategory} />
      </div>
      <Understood chips={chips} onRemove={(k) => setDropped((d) => [...d, k])} />
      <div className="u-scroll-x chiprow">
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
        {category === 'academic' ? (
          <>
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
          </>
        ) : (
          /* An activity has no syllabus year and no board. Asking for either
             would be a question from the wrong half of the network. */
          <div className="field">
            <span className="field__label">Age group</span>
            <OptionGroup
              options={AGE_BANDS}
              value={adv.ageBand}
              onChange={(v) => setAdv((s) => ({ ...s, ageBand: s.ageBand === v ? null : v }))}
            />
          </div>
        )}
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
