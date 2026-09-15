import { AGE_BANDS, BOARDS, BUDGET_CAP, distanceKm, haversineKm, LOCALITIES, MODES, REQUIREMENTS, SEATS_CAP, SLOTS, SUBJECT_CATEGORY, SUBJECTS, TEACHERS } from '../data/seed'

export const uid = (p = 'x') => `${p}-${Math.random().toString(36).slice(2, 9)}`

export const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Deterministic warm tint per person so avatars feel designed, not random. */
const AVATAR_TINTS = [
  "var(--green-t)",
  "var(--indigo-t)",
  "var(--orange-t)",
  "var(--blush)",
  "var(--green-t2)",
  "var(--indigo-t2)",
]
export const tintFor = (key = '') => {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return AVATAR_TINTS[h % AVATAR_TINTS.length]
}

export const localityName = (id) => LOCALITIES.find((l) => l.id === id)?.name ?? '—'

/** City comes from the locality record, never hardcoded: Bargad is not one city. */
export const cityName = (id) => LOCALITIES.find((l) => l.id === id)?.city ?? ''

export const slotLabel = (id) => SLOTS.find((s) => s.id === id)?.label ?? id
export const slotShort = (id) => slotLabel(id).replace('Weekday ', 'Wkdy ').replace('Weekend ', 'Wknd ')
export const modeShort = (id) => MODES.find((m) => m.id === id)?.short ?? id

/* ---- When the demo class is ----
   A demo is stored as a plain calendar date ("2026-09-20") and a 24 hour time
   ("16:00"), never as a sentence. Those two survive a reload and sort, and
   every phrase a person reads is derived from them, so the chat, the card and
   the reminder can never drift apart. */
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MON_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Local calendar date as yyyy-mm-dd. Never toISOString, which is UTC and
    quietly moves the date backwards for anyone east of Greenwich. */
export const isoDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const dateFromISO = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export const addDays = (iso, n) => {
  const d = dateFromISO(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

/** "Today", "Tomorrow", or "Sat 20 Sep". */
export function dayLabel(iso) {
  if (!iso) return ''
  const today = isoDate()
  if (iso === today) return 'Today'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  const d = dateFromISO(iso)
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MON_SHORT[d.getMonth()]}`
}

/** "Saturday 20 September", where there is room to say it properly. */
export function dayLong(iso) {
  if (!iso) return ''
  const d = dateFromISO(iso)
  return `${DAY_LONG[d.getDay()]} ${d.getDate()} ${MON_LONG[d.getMonth()]}`
}

/** "4:00 pm" from "16:00". */
export function timeLabel(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number)
  if (Number.isNaN(h)) return ''
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m || 0).padStart(2, '0')} ${suffix}`
}

/** "Tomorrow · 4:00 pm", the one-line form used on cards and in lists. */
export const demoWhen = (demo) =>
  demo?.date ? `${dayLabel(demo.date)} · ${timeLabel(demo.time)}` : ''

/* ---- Subject categories ----
   `custom` is the map of subjects a person typed in themselves, kept on their
   own profile as { 'Bharatanatyam': 'activity' }. Anything nobody has
   classified falls back to academic, so a subject can never vanish from both
   tabs and become unreachable. */
export const subjectCategory = (name, custom) =>
  SUBJECT_CATEGORY[name] ?? custom?.[name] ?? 'academic'

export const subjectsInCategory = (list = [], category, custom) =>
  list.filter((s) => subjectCategory(s, custom) === category)

/* ---- Budget ----
   The family states one number: the most they can pay per month. At the top of
   the slider they are saying they have no ceiling, and every screen must word
   that the same way. */
export const isNoBudgetLimit = (v) => v == null || v >= BUDGET_CAP
export const budgetLabel = (v) => (isNoBudgetLimit(v) ? 'No upper limit' : inr(v))
export const budgetUpTo = (v) => (isNoBudgetLimit(v) ? 'Any budget' : `Up to ${inr(v)}`)

/* A slider has to stop somewhere, and a teacher with room for a whole batch
   should not be made to say they have exactly ten places. The top of the
   slider means "ten or more", the same way the top of the budget slider means
   "no limit". */
export const isMaxSeats = (v) => v >= SEATS_CAP
export const seatsLabel = (v) => (isMaxSeats(v) ? `${SEATS_CAP}+` : `${v}`)
export const seatsLine = (v) => `${seatsLabel(v)} ${v === 1 ? 'seat' : 'seats'}`

/** Mode wording is role-specific. Say whose screen it is being read on. */
export const modeLabel = (id, role) =>
  MODES.find((m) => m.id === id)?.[role === 'family' ? 'family' : 'teacher'] ?? id

/** MODES shaped for OptionGroup and FilterRow, worded for one side. */
export const modesFor = (role) => MODES.map((m) => ({ ...m, label: modeLabel(m.id, role) }))

export const modesLine = (modes = []) => modes.map(modeShort).join(' + ')

export const classRange = (classes = []) => {
  if (!classes.length) return ''
  /* A class someone typed in has no number to sort by. Folding it into the
     range printed "Classes NaN–12", so it is named alongside instead. */
  const numberOf = (c) => parseInt(String(c).replace(/\D/g, ''), 10)
  const nums = classes.map(numberOf).filter(Number.isFinite).sort((a, b) => a - b)
  const named = classes.filter((c) => !Number.isFinite(numberOf(c)))
  const range = !nums.length
    ? ''
    : nums.length === 1
      ? `Class ${nums[0]}`
      : `Classes ${nums[0]}–${nums[nums.length - 1]}`
  return [range, ...named].filter(Boolean).join(' · ')
}

/* ---- Age groups ---- */
export const ageBandForClass = (c) => AGE_BANDS.find((b) => b.classes.includes(c))?.id ?? null
export const ageBandLabel = (id) => AGE_BANDS.find((b) => b.id === id)?.label ?? id

export const ageRange = (bands = []) => {
  const picked = AGE_BANDS.filter((b) => bands.includes(b.id))
  if (!picked.length) return ''
  if (picked.length === 1) return picked[0].label
  // The low number of the first band and the HIGH number of the last. Gluing
  // the first number onto the last band's whole label gave "8–14–16 years",
  // which is three numbers for a two-ended range.
  const lo = picked[0].label.match(/\d+/)[0]
  const hiLabel = picked[picked.length - 1].label
  const hi = hiLabel.includes('+')
    ? `${hiLabel.match(/\d+/)[0]}+`
    : hiLabel.match(/(\d+)(?!.*\d)/)[1]
  return `${lo}–${hi} years`
}

/** What a teacher takes, worded for whichever half of the network they are in. */
export const teachesRange = (t) =>
  t?.classes?.length ? classRange(t.classes) : ageRange(t?.ageBands)

export const teacherById = (id) => TEACHERS.find((t) => t.id === id)
export const requirementById = (id) => REQUIREMENTS.find((r) => r.id === id)

export const distanceFrom = (fromLocality, toLocality) => distanceKm(fromLocality, toLocality)

/** Nearest named area to a dropped pin. The name is what everyone else sees. */
export const nearestLocality = (lat, lng) => {
  let best = null
  let bestD = Infinity
  for (const l of LOCALITIES) {
    const d = haversineKm({ lat, lng }, l)
    if (d != null && d < bestD) {
      bestD = d
      best = l.id
    }
  }
  return best
}

/* Two people who dropped pins get a real distance between those pins. Anyone
   still on a plain area gets the old centre-to-centre figure, which is why the
   copy has always called it indicative. */
export const distanceBetween = (a, b) =>
  a?.coords && b?.coords
    ? haversineKm(a.coords, b.coords)
    : distanceKm(a?.locality, b?.locality)

export const distLabel = (km) =>
  km == null ? '' : km < 1 ? 'Under 1 km away' : `${km} km away`

/** Overlap helper used everywhere fit is computed. */
const overlap = (a = [], b = []) => a.filter((x) => b.includes(x))

/* One value or many, always read as a list. A profile saved before a field
   became plural still holds a bare string, and nothing downstream should have
   to know which shape it is looking at. */
export const asList = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v])

/** The class formats on a teacher, a family or a requirement, however stored. */
export const formatsOf = (x) => asList(x?.formats ?? x?.format)

/** Do two sets of choices have anything in common? */
export const shares = (a, b) => overlap(asList(a), asList(b)).length > 0

/** One phrase for a set of formats, including the case where both are offered. */
export function formatLabel(v) {
  const list = asList(v)
  if (list.includes('one') && list.includes('group')) return 'One-to-one or group'
  if (list.includes('group')) return 'Small group'
  return 'One-to-one'
}

/* A teacher declares either classes or age groups depending on what they teach;
   a family only ever gives a class. The band is derived so a family is never
   asked the same question twice in two vocabularies. */
const matchesLevel = (teacher, req) => {
  if (teacher.classes?.includes(req.classLevel)) return true
  const band = ageBandForClass(req.classLevel)
  return !!(band && teacher.ageBands?.includes(band))
}
const levelReason = (teacher, req) =>
  teacher.classes?.includes(req.classLevel)
    ? `Takes ${req.classLevel}`
    : `Takes ${ageBandLabel(ageBandForClass(req.classLevel))}`

/**
 * Fit is explainable on purpose: Bargad shows *why* something is being
 * surfaced rather than acting as an opaque matchmaker.
 */
export function scoreTeacherForRequirement(teacher, req) {
  if (!req) return { score: 0, reasons: [] }
  const reasons = []
  let score = 0

  const subj = overlap(teacher.subjects, req.subjects)
  if (subj.length) {
    score += 40
    reasons.push(`Teaches ${subj.join(' & ')}`)
  }
  if (matchesLevel(teacher, req)) {
    score += 20
    reasons.push(levelReason(teacher, req))
  }
  if (teacher.boards.length && teacher.boards.includes(req.board)) {
    score += 10
    reasons.push(`${req.board} board`)
  }

  const km = distanceBetween(req, teacher)
  if (km != null && km <= teacher.radiusKm) {
    score += 15
    reasons.push(km < 1 ? 'In your area' : `${km} km away`)
  } else if (km != null && km <= teacher.radiusKm + 3) {
    score += 6
  }

  if (overlap(teacher.modes, req.modes).length) {
    score += 8
    reasons.push(modeShort(overlap(teacher.modes, req.modes)[0]))
  }
  if (overlap(teacher.slots, req.slots).length) {
    score += 10
    reasons.push(slotShort(overlap(teacher.slots, req.slots)[0]))
  }
  if (isNoBudgetLimit(req.budgetMax) || teacher.fee <= req.budgetMax) {
    score += 12
    reasons.push('Within your budget')
  }
  if (shares(teacher.formats, formatsOf(req))) score += 5

  // Capacity shapes discovery: a teacher who cannot take anyone should not
  // dominate results, even if they are a perfect subject match.
  if (teacher.capacity === 'full') score -= 45
  if (teacher.capacity === 'limited') score -= 6

  return { score, reasons: reasons.slice(0, 3), km }
}

export function scoreRequirementForTeacher(req, teacher) {
  if (!teacher) return { score: 0, reasons: [] }
  const reasons = []
  let score = 0

  const subj = overlap(teacher.subjects, req.subjects)
  if (subj.length) {
    score += 40
    reasons.push(`You teach ${subj.join(' & ')}`)
  }
  if (matchesLevel(teacher, req)) {
    score += 20
    reasons.push(levelReason(teacher, req))
  }
  if (teacher.boards.length && teacher.boards.includes(req.board)) {
    score += 10
    reasons.push(req.board)
  }

  const km = distanceBetween(teacher, req)
  if (km != null && km <= teacher.radiusKm) {
    score += 18
    reasons.push(km < 1 ? 'Your area' : `${km} km away`)
  }
  if (overlap(teacher.modes, req.modes).length) score += 8
  if (overlap(teacher.slots, req.slots).length) {
    score += 12
    reasons.push(slotShort(overlap(teacher.slots, req.slots)[0]))
  }
  if (isNoBudgetLimit(req.budgetMax) || teacher.fee <= req.budgetMax) {
    score += 14
    reasons.push('Within their budget')
  }

  return { score, reasons: reasons.slice(0, 3), km }
}

/* ------------------------------------------------------------------
   Search
   ------------------------------------------------------------------
   The interpretation is shown back to the user as chips they can remove,
   because a search that silently decides what you meant is the same opaque
   matchmaker this product exists to avoid. Everything it understands is a
   filter the user could have set by hand; the rest stays as free text.
   ------------------------------------------------------------------ */

/* What people actually type. Nobody searches for "Mathematics". */
const SYNONYMS = {
  'comp sci': 'Computer Science',
  'computer sci': 'Computer Science',
  'social science': 'History',
  maths: 'Mathematics',
  math: 'Mathematics',
  algebra: 'Mathematics',
  bio: 'Biology',
  chem: 'Chemistry',
  phy: 'Physics',
  cs: 'Computer Science',
  coding: 'Coding for Kids',
  evs: 'Environmental Science',
  eng: 'English',
  eco: 'Economics',
  accounts: 'Accountancy',
  dance: 'Classical Dance',
  singing: 'Vocal Music',
  music: 'Vocal Music',
  painting: 'Drawing and Painting',
  drawing: 'Drawing and Painting',
  art: 'Drawing and Painting',
  speaking: 'Public Speaking',
  writing: 'Creative Writing',
}

const STOPWORDS =
  /\b(a|an|the|for|my|me|near|nearby|around|in|at|who|that|can|teach|teaches|teacher|teachers|tutor|tutors|tuition|class|classes|child|kid|son|daughter|please|need|want|looking|find)\b/g

export function parseSearch(text) {
  let rest = ` ${(text || '').toLowerCase().replace(/\s+/g, ' ').trim()} `
  const out = {
    subject: null, locality: null, city: null, board: null, classLevel: null,
    maxFee: null, mode: null, slot: null, text: '',
  }
  const chips = []

  /* Remove a phrase if present, so it cannot also be matched as free text. */
  const eat = (phrase) => {
    const p = ` ${String(phrase).toLowerCase()} `
    const i = rest.indexOf(p)
    if (i === -1) return false
    rest = `${rest.slice(0, i)} ${rest.slice(i + p.length)}`
    return true
  }
  const eatRe = (re) => {
    const m = rest.match(re)
    if (!m) return null
    rest = rest.replace(m[0], ' ')
    return m
  }

  // Longest names first, so "Computer Science" is not eaten by "Science".
  for (const name of [...SUBJECTS].sort((a, b) => b.length - a.length)) {
    if (eat(name)) {
      out.subject = name
      chips.push({ k: 'subject', label: name })
      break
    }
  }
  if (!out.subject) {
    for (const word of Object.keys(SYNONYMS).sort((a, b) => b.length - a.length)) {
      if (eat(word)) {
        out.subject = SYNONYMS[word]
        chips.push({ k: 'subject', label: SYNONYMS[word] })
        break
      }
    }
  }

  // A neighbourhood is more specific than a city, so it wins. Matching the
  // city must NOT pick one arbitrary neighbourhood inside it.
  for (const l of [...LOCALITIES].sort((a, b) => b.name.length - a.name.length)) {
    if (eat(l.name)) {
      out.locality = l.id
      chips.push({ k: 'locality', label: `in ${l.name}` })
      break
    }
  }
  if (!out.locality) {
    for (const c of [...new Set(LOCALITIES.map((l) => l.city))].sort((a, b) => b.length - a.length)) {
      if (eat(c)) {
        out.city = c
        chips.push({ k: 'city', label: `in ${c}` })
        break
      }
    }
  }
  for (const b of BOARDS) {
    if (eat(b)) {
      out.board = b
      chips.push({ k: 'board', label: b })
      break
    }
  }

  const cls = eatRe(/\bclass (\d{1,2})\b/) || eatRe(/\b(\d{1,2})(?:st|nd|rd|th)\b/)
  if (cls) {
    const n = Number(cls[1])
    if (n >= 1 && n <= 12) {
      out.classLevel = `Class ${n}`
      chips.push({ k: 'classLevel', label: `Class ${n}` })
    }
  }

  const feeK = eatRe(/\b(?:under|below|upto|up to|less than|within|max)\s*₹?\s*(\d{1,2})\s*k\b/)
  const feeN = feeK || eatRe(/\b(?:under|below|upto|up to|less than|within|max)\s*₹?\s*(\d{3,5})\b/)
  if (feeN) {
    const v = feeK ? Number(feeK[1]) * 1000 : Number(feeN[1])
    if (v > 0) {
      out.maxFee = v
      chips.push({ k: 'maxFee', label: `under ${inr(v)}` })
    }
  }

  if (eat('online')) {
    out.mode = 'online'
    chips.push({ k: 'mode', label: 'Online' })
  } else if (eat('at home') || eat('home tuition') || eat('at our home')) {
    out.mode = 'home'
    chips.push({ k: 'mode', label: 'At our home' })
  }

  for (const sl of SLOTS) {
    if (eat(sl.label)) {
      out.slot = sl.id
      chips.push({ k: 'slot', label: sl.label })
      break
    }
  }
  if (!out.slot) {
    const w = eatRe(/\b(weekend|weekday)s?\b/)
    const t = eatRe(/\b(morning|afternoon|evening)s?\b/)
    if (w || t) {
      const part = t ? t[1] : 'evening'
      const when = w && w[1] === 'weekend' ? 'we' : 'wd'
      const id = `${when}-${part}`
      const known = SLOTS.find((x) => x.id === id) || SLOTS.find((x) => x.id.endsWith(part))
      if (known) {
        out.slot = known.id
        chips.push({ k: 'slot', label: known.label })
      }
    }
  }

  out.text = rest.replace(STOPWORDS, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  return { ...out, chips }
}

/** Reusable predicate so Discover filters and Home suggestions stay consistent. */
export function filterTeachers(list, f) {
  return list.filter((t) => {
    if (f.subject && !t.subjects.includes(f.subject)) return false
    if (f.classLevel && !matchesLevel(t, { classLevel: f.classLevel })) return false
    if (f.board && t.boards.length && !t.boards.includes(f.board)) return false
    if (f.mode && !t.modes.includes(f.mode)) return false
    if (f.locality && t.locality !== f.locality) return false
    if (f.city && cityName(t.locality) !== f.city) return false
    if (f.maxFee && t.fee > f.maxFee) return false
    // Academics and activities are separate halves of the network, not two
    // values of one filter: a family browsing guitar teachers should never be
    // shown a Maths tutor because the subject chip happened to be clear.
    if (f.category && !(t.subjects || []).some((x) => subjectCategory(x) === f.category))
      return false
    if (f.ageBand && !(t.ageBands || []).includes(f.ageBand)) return false
    if (f.openOnly && t.capacity === 'full') return false
    if (f.text) {
      const hay = `${t.name} ${t.headline} ${t.intro} ${t.qualification} ${t.subjects.join(' ')}`
        .toLowerCase()
      if (!f.text.split(' ').every((w) => hay.includes(w))) return false
    }
    return true
  })
}

export function filterRequirements(list, f) {
  return list.filter((r) => {
    if (f.subject && !r.subjects.includes(f.subject)) return false
    if (f.classLevel && r.classLevel !== f.classLevel) return false
    if (f.board && r.board !== f.board) return false
    if (f.mode && !r.modes.includes(f.mode)) return false
    if (f.locality && r.locality !== f.locality) return false
    if (f.city && cityName(r.locality) !== f.city) return false
    if (f.category && !(r.subjects || []).some((x) => subjectCategory(x) === f.category))
      return false
    // A family only ever gives a class, so the band is derived rather than asked.
    if (f.ageBand && ageBandForClass(r.classLevel) !== f.ageBand) return false
    if (f.format && !formatsOf(r).includes(f.format)) return false
    if (f.text) {
      const hay = `${r.family} ${r.need} ${r.subjects.join(' ')} ${r.classLevel} ${r.board}`.toLowerCase()
      if (!f.text.split(' ').every((w) => hay.includes(w))) return false
    }
    return true
  })
}

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Good evening'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const nowTime = () =>
  new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })

export const STATUS_META = {
  pending: { label: 'Awaiting reply', tone: 'orange' },
  sent: { label: 'Sent', tone: 'orange' },
  accepted: { label: 'Accepted', tone: 'green' },
  declined: { label: 'Declined', tone: 'blush' },
  clarify: { label: 'Question asked', tone: 'indigo' },
  expired: { label: 'Expired', tone: '' },
  active: { label: 'Tuition running', tone: 'green' },
}

export const avgScore = (reviews = []) => {
  if (!reviews.length) return null
  const keys = ['teaching', 'knowledge', 'punctuality', 'communication']
  const out = {}
  keys.forEach((k) => {
    out[k] = (reviews.reduce((s, r) => s + r.scores[k], 0) / reviews.length).toFixed(1)
  })
  return out
}
