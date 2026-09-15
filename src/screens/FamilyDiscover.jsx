import { Fragment, useEffect, useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { AGE_BANDS, BOARDS, BUDGET_CAP, CATEGORIES, CLASSES, LOCALITIES, TEACHERS } from '../data/seed'
import { TeacherCard } from '../components/Cards'
import { Button, Chip, Empty, OptionGroup, Promo, SearchBar, Segmented, Sheet, TopBar, Understood } from '../components/UI'
import { budgetLabel, filterTeachers, inr, localityName, modesFor, parseSearch, scoreTeacherForRequirement, subjectCategory } from '../lib/utils'

const SORTS = [
  { id: 'fit', label: 'Best fit' },
  { id: 'near', label: 'Nearest' },
  { id: 'fee', label: 'Lowest fee' },
  { id: 'rating', label: 'Best rated' },
]

export default function FamilyDiscover() {
  const { state } = useApp()
  const f = state.family
  const [category, setCategory] = useState('academic')
  const [q, setQ] = useState('')
  // Chips the user struck out. Kept as keys rather than rewriting their words,
  // so the sentence they typed stays intact in the box.
  const [dropped, setDropped] = useState([])
  const [sort, setSort] = useState('fit')
  const [open, setOpen] = useState(false)
  const [adv, setAdv] = useState({
    classLevel: f.classLevel,
    board: null,
    mode: null,
    locality: null,
    maxFee: f.budgetMax ?? null,
    openOnly: true,
    ageBand: null,
  })

  const parsed = useMemo(() => parseSearch(q), [q])
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
     nothing under Academics, so switching drops whichever no longer applies. */
  const switchCategory = (c) => {
    setCategory(c)
    setAdv((s) => ({ ...s, classLevel: null, board: null, ageBand: null }))
  }

  const results = useMemo(() => {
    // What was typed wins over what was set, because it is the more recent and
    // more deliberate statement of the same intent.
    const base = filterTeachers(TEACHERS, {
      ...adv,
      category,
      subject: live.subject ?? null,
      locality: live.locality ?? adv.locality,
      city: live.city ?? null,
      board: live.board ?? adv.board,
      classLevel: live.classLevel ?? adv.classLevel,
      mode: live.mode ?? adv.mode,
      maxFee: live.maxFee ?? adv.maxFee,
      slot: live.slot ?? null,
      text: live.text,
    })
    const scored = base.map((t) => ({ t, ...scoreTeacherForRequirement(t, f) }))
    const by = {
      fit: (a, b) => b.score - a.score,
      near: (a, b) => (a.km ?? 99) - (b.km ?? 99),
      fee: (a, b) => a.t.fee - b.t.fee,
      rating: (a, b) => b.t.rating - a.t.rating,
    }[sort]
    return scored.sort(by)
  }, [live, adv, category, sort, f])

  const activeCount =
    Object.entries(adv).filter(([k, v]) => (k === 'openOnly' ? v === false : !!v)).length

  return (
    <>
      <TopBar title="Find Teachers" />

      <SearchBar
        value={q}
        onChange={(v) => {
          setQ(v)
          setDropped([])
        }}
        placeholder="Maths teacher under 3000"
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
          {results.length === 1 ? 'teacher' : 'teachers'}
          {adv.openOnly ? ' with room' : ''} ·{' '}
          {SORTS.find((s) => s.id === sort).label.toLowerCase()}
        </p>

        {results.length ? (
          <div className="cardlist">
            {results.map(({ t, reasons, km }, i) => (
              <Fragment key={t.id}>
                <TeacherCard
                  teacher={t}
                  km={km}
                  reasons={sort === 'fit' ? reasons : []}
                  to={`/f/teacher/${t.id}`}
                />
                {/* Bargad is free on both sides; advertising is what pays for it.
                    One honest, labelled slot keeps that visible in the product. */}
                {i === 2 && (
                  <Promo
                    doodle="book"
                    title="Class 10 board companion"
                    body="Solved papers for CBSE and ICSE."
                  />
                )}
                {i === 7 && (
                  <Promo
                    doodle="pencil"
                    title="Doon Stationers"
                    body="Geometry boxes and lab records, across Dehradun."
                  />
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <Empty
            doodle="globe"
            title="No matches"
            body="Budget and area cut the list down hardest."
            action={
              <Button
                variant="quiet"
                onClick={() => {
                  setAdv({
                    classLevel: null,
                    board: null,
                    mode: null,
                    locality: null,
                    maxFee: null,
                    openOnly: true,
                  })
                  setQ('')
                  setDropped([])
                }}
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
        subtitle="Teachers with no room are hidden by default."
        footer={
          <>
            <Button
              variant="quiet"
              onClick={() => {
                setAdv({
                  classLevel: null,
                  board: null,
                  mode: null,
                  locality: null,
                  maxFee: null,
                  openOnly: true,
                })
                setQ('')
                setDropped([])
              }}
            >
              Clear
            </Button>
            <Button block onClick={() => setOpen(false)}>
              Show {results.length} {results.length === 1 ? 'teacher' : 'teachers'}
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
          <span className="field__label">How classes happen</span>
          <OptionGroup
            options={modesFor('family')}
            value={adv.mode}
            onChange={(v) => setAdv((s) => ({ ...s, mode: s.mode === v ? null : v }))}
            wide
          />
        </div>
        <div className="field">
          <span className="field__label">Area</span>
          <OptionGroup
            options={LOCALITIES.map((l) => ({ id: l.id, label: l.name }))}
            value={adv.locality}
            onChange={(v) => setAdv((s) => ({ ...s, locality: s.locality === v ? null : v }))}
          />
        </div>
        <div className="field">
          <span className="field__label">
            Monthly fee: {budgetLabel(adv.maxFee)}
          </span>
          <input
            className="range"
            type="range"
            min="1500"
            max={BUDGET_CAP}
            step="250"
            value={adv.maxFee ?? BUDGET_CAP}
            onChange={(e) =>
              setAdv((s) => ({
                ...s,
                maxFee: +e.target.value >= BUDGET_CAP ? null : +e.target.value,
              }))
            }
          />
        </div>
        <button
          className="card"
          style={{ marginBottom: 24, width: '100%', textAlign: 'left' }}
          onClick={() => setAdv((s) => ({ ...s, openOnly: !s.openOnly }))}
        >
          <div className="u-spread" style={{ gap: 12 }}>
            <div className="u-grow">
              <span className="h3">Only teachers with room</span>
              <p className="sm" style={{ marginTop: 3 }}>
                Hides anyone marked full.
              </p>
            </div>
            <Chip tone={adv.openOnly ? 'green' : undefined}>{adv.openOnly ? 'On' : 'Off'}</Chip>
          </div>
        </button>
      </Sheet>
    </>
  )
}
