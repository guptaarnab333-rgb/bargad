import { Fragment, useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { BOARDS, CLASSES, LOCALITIES, SUBJECTS, TEACHERS } from '../data/seed'
import { TeacherCard } from '../components/Cards'
import { Button, Chip, Empty, FilterRow, OptionGroup, Promo, Sheet, TopBar } from '../components/UI'
import { IcSliders } from '../components/Icons'
import { filterTeachers, inr, localityName, modesFor, scoreTeacherForRequirement } from '../lib/utils'

const SORTS = [
  { id: 'fit', label: 'Best fit' },
  { id: 'near', label: 'Nearest' },
  { id: 'fee', label: 'Lowest fee' },
  { id: 'rating', label: 'Best rated' },
]

export default function FamilyDiscover() {
  const { state } = useApp()
  const f = state.family
  const [subject, setSubject] = useState(f.subjects[0] ?? null)
  const [sort, setSort] = useState('fit')
  const [open, setOpen] = useState(false)
  const [adv, setAdv] = useState({
    classLevel: f.classLevel,
    board: null,
    mode: null,
    locality: null,
    maxFee: null,
    openOnly: true,
  })

  const results = useMemo(() => {
    const base = filterTeachers(TEACHERS, { ...adv, subject })
    const scored = base.map((t) => ({ t, ...scoreTeacherForRequirement(t, f) }))
    const by = {
      fit: (a, b) => b.score - a.score,
      near: (a, b) => (a.km ?? 99) - (b.km ?? 99),
      fee: (a, b) => a.t.fee - b.t.fee,
      rating: (a, b) => b.t.rating - a.t.rating,
    }[sort]
    return scored.sort(by)
  }, [subject, adv, sort, f])

  const activeCount =
    Object.entries(adv).filter(([k, v]) => (k === 'openOnly' ? v === false : !!v)).length

  return (
    <>
      <TopBar
        title="Find Teachers"
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
          {results.length === 1 ? 'teacher' : 'teachers'}
          {adv.openOnly ? ' able to take students' : ''} · sorted by{' '}
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
                    emoji="📗"
                    title="Oxford Class 10 board companion"
                    body="Solved papers for CBSE and ICSE. Delivered anywhere in India."
                  />
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <Empty
            doodle="globe"
            title="Nobody matches all of that"
            body="Try removing a filter. Budget and locality are usually the two that cut the list down hardest."
            action={
              <Button
                variant="quiet"
                onClick={() =>
                  setAdv({
                    classLevel: null,
                    board: null,
                    mode: null,
                    locality: null,
                    maxFee: null,
                    openOnly: true,
                  })
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
        subtitle="Teachers who cannot take a student are hidden by default."
        footer={
          <>
            <Button
              variant="quiet"
              onClick={() =>
                setAdv({
                  classLevel: null,
                  board: null,
                  mode: null,
                  locality: null,
                  maxFee: null,
                  openOnly: true,
                })
              }
            >
              Clear
            </Button>
            <Button block onClick={() => setOpen(false)}>
              Show {results.length} {results.length === 1 ? 'teacher' : 'teachers'}
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
            Monthly fee up to {adv.maxFee ? inr(adv.maxFee) : 'any'}
          </span>
          <input
            className="range"
            type="range"
            min="1500"
            max="12000"
            step="250"
            value={adv.maxFee ?? 12000}
            onChange={(e) =>
              setAdv((s) => ({
                ...s,
                maxFee: +e.target.value >= 12000 ? null : +e.target.value,
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
              <span className="h3">Only show teachers with room</span>
              <p className="sm" style={{ marginTop: 3 }}>
                Hides anyone marked currently full.
              </p>
            </div>
            <Chip tone={adv.openOnly ? 'green' : undefined}>{adv.openOnly ? 'On' : 'Off'}</Chip>
          </div>
        </button>
      </Sheet>
    </>
  )
}
