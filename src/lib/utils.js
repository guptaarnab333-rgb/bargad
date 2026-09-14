import {
  BUDGET_CAP,
  LOCALITIES,
  TEACHERS,
  REQUIREMENTS,
  SLOTS,
  MODES,
  SUBJECT_CATEGORY,
  distanceKm,
} from '../data/seed'

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

/** Mode wording is role-specific. Say whose screen it is being read on. */
export const modeLabel = (id, role) =>
  MODES.find((m) => m.id === id)?.[role === 'family' ? 'family' : 'teacher'] ?? id

/** MODES shaped for OptionGroup and FilterRow, worded for one side. */
export const modesFor = (role) => MODES.map((m) => ({ ...m, label: modeLabel(m.id, role) }))

export const modesLine = (modes = []) => modes.map(modeShort).join(' + ')

export const classRange = (classes = []) => {
  if (!classes.length) return ''
  const nums = classes.map((c) => parseInt(c.replace(/\D/g, ''), 10)).sort((a, b) => a - b)
  return nums.length === 1 ? `Class ${nums[0]}` : `Classes ${nums[0]}–${nums[nums.length - 1]}`
}

export const teacherById = (id) => TEACHERS.find((t) => t.id === id)
export const requirementById = (id) => REQUIREMENTS.find((r) => r.id === id)

export const distanceFrom = (fromLocality, toLocality) => distanceKm(fromLocality, toLocality)

export const distLabel = (km) =>
  km == null ? '' : km < 1 ? 'Under 1 km away' : `${km} km away`

/** Overlap helper used everywhere fit is computed. */
const overlap = (a = [], b = []) => a.filter((x) => b.includes(x))

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
  if (teacher.classes.includes(req.classLevel)) {
    score += 20
    reasons.push(`Takes ${req.classLevel}`)
  }
  if (teacher.boards.length && teacher.boards.includes(req.board)) {
    score += 10
    reasons.push(`${req.board} board`)
  }

  const km = distanceFrom(req.locality, teacher.locality)
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
  if (teacher.formats.includes(req.format)) score += 5

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
  if (teacher.classes.includes(req.classLevel)) {
    score += 20
    reasons.push(req.classLevel)
  }
  if (teacher.boards.length && teacher.boards.includes(req.board)) {
    score += 10
    reasons.push(req.board)
  }

  const km = distanceFrom(teacher.locality, req.locality)
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

/** Reusable predicate so Discover filters and Home suggestions stay consistent. */
export function filterTeachers(list, f) {
  return list.filter((t) => {
    if (f.subject && !t.subjects.includes(f.subject)) return false
    if (f.classLevel && !t.classes.includes(f.classLevel)) return false
    if (f.board && t.boards.length && !t.boards.includes(f.board)) return false
    if (f.mode && !t.modes.includes(f.mode)) return false
    if (f.locality && t.locality !== f.locality) return false
    if (f.maxFee && t.fee > f.maxFee) return false
    if (f.openOnly && t.capacity === 'full') return false
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
    if (f.format && r.format !== f.format) return false
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
