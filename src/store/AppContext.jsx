import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { SEED_ACTIVITY } from '../data/seed'
import { uid, nowTime } from '../lib/utils'

const KEY = 'bargad.v1'

const emptyState = {
  bootstrapped: false,
  introSeen: false,
  account: null,
  role: null, // 'teacher' | 'family'
  teacher: null,
  family: null,
  requests: [],
  threads: [],
  toasts: [],
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw)
    return { ...emptyState, ...parsed, toasts: [] }
  } catch {
    return emptyState
  }
}

const AppCtx = createContext(null)

function reducer(state, a) {
  switch (a.type) {
    case 'SEEN_INTRO':
      return { ...state, introSeen: true }

    /* Designed, not implemented: the account is what an identity WOULD hang
       off. Nothing is verified and nothing leaves the device. */
    case 'SET_ACCOUNT':
      return { ...state, account: { method: a.method, value: a.value } }
    case 'SIGN_OUT':
      return { ...state, account: null }
    case 'SET_ROLE':
      return { ...state, role: a.role }

    /* ---------- onboarding / profile ---------- */
    case 'SAVE_TEACHER': {
      const isNew = !state.teacher
      const teacher = { id: 'me-teacher', ...(state.teacher || {}), ...a.data }
      return {
        ...state,
        teacher,
        bootstrapped: true,
        role: 'teacher',
        // Seed in-flight activity the first time so the prototype never opens empty
        requests: isNew
          ? [...state.requests, ...SEED_ACTIVITY.teacher.requests]
          : state.requests,
        threads: isNew ? [...state.threads, ...SEED_ACTIVITY.teacher.threads] : state.threads,
      }
    }
    case 'SAVE_FAMILY': {
      const isNew = !state.family
      const family = { id: 'me-family', ...(state.family || {}), ...a.data }
      return {
        ...state,
        family,
        bootstrapped: true,
        role: 'family',
        requests: isNew ? [...state.requests, ...SEED_ACTIVITY.family.requests] : state.requests,
        threads: isNew ? [...state.threads, ...SEED_ACTIVITY.family.threads] : state.threads,
      }
    }

    /* ---------- intent ---------- */
    case 'SET_CAPACITY':
      return { ...state, teacher: { ...state.teacher, capacity: a.capacity } }
    case 'SET_SEATS':
      return { ...state, teacher: { ...state.teacher, seatsLeft: a.seats } }
    case 'SET_LOOKING':
      return { ...state, family: { ...state.family, looking: a.looking } }

    /* ---------- requests ---------- */
    case 'SEND_REQUEST': {
      // family -> teacher
      const req = {
        id: uid('req'),
        direction: 'sent',
        from: 'me-family',
        toTeacher: a.teacherId,
        status: 'pending',
        createdAt: 'Just now',
        payload: a.payload,
        events: [{ k: 'sent', t: 'Just now' }],
      }
      return { ...state, requests: [req, ...state.requests] }
    }
    case 'SEND_RESPONSE': {
      // teacher -> family requirement
      const req = {
        id: uid('req'),
        direction: 'sent',
        from: 'me-teacher',
        toRequirement: a.requirementId,
        status: 'pending',
        createdAt: 'Just now',
        payload: a.payload,
        events: [{ k: 'sent', t: 'Just now' }],
      }
      return { ...state, requests: [req, ...state.requests] }
    }

    case 'RESOLVE_REQUEST': {
      // outcome: 'accepted' | 'declined' | 'clarify'
      const requests = state.requests.map((r) =>
        r.id === a.id
          ? {
              ...r,
              status: a.outcome,
              clarifyNote: a.note ?? r.clarifyNote,
              declineReason: a.reason ?? r.declineReason,
              events: [...r.events, { k: a.outcome, t: 'Just now' }],
            }
          : r
      )

      let threads = state.threads
      if (a.outcome === 'accepted') {
        const req = state.requests.find((r) => r.id === a.id)
        const already = state.threads.some((t) => t.requestId === a.id)
        if (req && !already) {
          threads = [
            {
              id: uid('th'),
              requestId: req.id,
              withId: req.toTeacher ?? null,
              withRequirement: req.toRequirement ?? req.fromFamily ?? null,
              messages: [
                {
                  id: uid('m'),
                  sys: true,
                  text: a.sysText ?? 'Request accepted. You can now message each other.',
                  t: 'Just now',
                },
              ],
              demo: null,
              active: false,
            },
            ...state.threads,
          ]
        }
      }
      return { ...state, requests, threads }
    }

    case 'WITHDRAW_REQUEST':
      return { ...state, requests: state.requests.filter((r) => r.id !== a.id) }

    /* ---------- chat ---------- */
    case 'SEND_MESSAGE':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === a.threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  { id: uid('m'), them: false, text: a.text, t: nowTime() },
                ],
              }
            : t
        ),
      }
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === a.threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  { id: uid('m'), them: true, text: a.text, t: nowTime() },
                ],
              }
            : t
        ),
      }

    /* ---------- demo & tuition ---------- */
    case 'PROPOSE_DEMO':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === a.threadId
            ? {
                ...t,
                demo: { ...a.demo, status: 'proposed', by: a.by },
                messages: [
                  ...t.messages,
                  {
                    id: uid('m'),
                    sys: true,
                    text: `Demo class proposed for ${a.demo.day}, ${a.demo.time}, ${a.demo.where}.`,
                    t: 'Just now',
                  },
                ],
              }
            : t
        ),
      }
    case 'CONFIRM_DEMO':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === a.threadId
            ? {
                ...t,
                demo: { ...t.demo, status: 'confirmed' },
                messages: [
                  ...t.messages,
                  {
                    id: uid('m'),
                    sys: true,
                    text: 'Demo class confirmed. Exact address can now be shared in this chat.',
                    t: 'Just now',
                  },
                ],
              }
            : t
        ),
      }
    case 'START_TUITION':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === a.threadId
            ? {
                ...t,
                active: true,
                demo: t.demo ? { ...t.demo, status: 'done' } : null,
                messages: [
                  ...t.messages,
                  {
                    id: uid('m'),
                    sys: true,
                    text: 'Tuition started. Bargad steps back from here: fees and scheduling are between the two of you.',
                    t: 'Just now',
                  },
                ],
              }
            : t
        ),
        requests: state.requests.map((r) =>
          r.id === a.requestId
            ? { ...r, status: 'active', events: [...r.events, { k: 'active', t: 'Just now' }] }
            : r
        ),
      }

    /* ---------- toasts ---------- */
    case 'TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: uid('t'), text: a.text, tone: a.tone }],
      }
    case 'UNTOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== a.id) }

    case 'RESET':
      return { ...emptyState }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const timers = useRef({})

  useEffect(() => {
    const { toasts, ...persist } = state
    try {
      localStorage.setItem(KEY, JSON.stringify(persist))
    } catch {
      /* storage can be unavailable in private mode; the prototype still works */
    }
  }, [state])

  // Auto-dismiss toasts
  useEffect(() => {
    state.toasts.forEach((t) => {
      if (timers.current[t.id]) return
      timers.current[t.id] = setTimeout(() => {
        dispatch({ type: 'UNTOAST', id: t.id })
        delete timers.current[t.id]
      }, 3200)
    })
  }, [state.toasts])

  const value = useMemo(() => {
    const toast = (text, tone) => dispatch({ type: 'TOAST', text, tone })
    return { state, dispatch, toast }
  }, [state])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export const useApp = () => {
  const v = useContext(AppCtx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}
