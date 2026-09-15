import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { SEED_ACTIVITY } from '../data/seed'
import { dayLabel, requirementById, teacherById, timeLabel, uid, nowTime } from '../lib/utils'

const KEY = 'bargad.v1'

/* How long the other side takes to answer. Long enough that someone plainly
   read the request, short enough that nobody demonstrating this has to fill
   the silence. A labelled "reply as them" button used to stand here, and it
   told every tester they were looking at a puppet. */
const REPLY_AFTER_MS = 30000

/* A demo proposal is a smaller question than a request, and the person who
   sent it is usually still looking at the chat, so the answer comes sooner. */
const CONFIRM_AFTER_MS = 20000

/** The other side agreeing to the day and time that were proposed. */
function demoConfirmation(th) {
  const who = th.withId ? teacherById(th.withId)?.name : requirementById(th.withRequirement)?.family
  const name = (who ?? 'They').split(' ')[0]
  /* Where the class happens is the other side's call. They were offered a set
     of places and they answer with one of them. */
  const where = (th.demo?.wheres ?? [])[0] ?? null
  return { type: 'CONFIRM_DEMO', threadId: th.id, where, notify: `${name} confirmed the demo.` }
}

/** The other side saying yes, in their own words. */
function acceptance(req) {
  const mine = req.from === 'me-teacher'
  const who = mine ? requirementById(req.toRequirement)?.family : teacherById(req.toTeacher)?.name
  const name = who ?? 'They'
  return {
    type: 'RESOLVE_REQUEST',
    id: req.id,
    outcome: 'accepted',
    sysText: mine
      ? `${name} accepted your offer. Chat is open.`
      : `${name} accepted your request. Chat is open.`,
    firstMessage: mine
      ? 'Thank you for offering. Could we do a demo class first?'
      : 'Happy to help. Shall we fix a demo class this week?',
    notify: `${name.split(' ')[0]} accepted. Open the chat.`,
  }
}

const emptyState = {
  bootstrapped: false,
  introSeen: false,
  account: null,
  theme: 'light',
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
    // `skin` was the old two-designs experiment. Anything saved with it
    // opens in light, which is what it was already looking at.
    const { skin, ...parsed } = JSON.parse(raw)
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

    case 'SET_THEME':
      return { ...state, theme: a.theme }

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
        // When the other side will answer. An absolute moment, so it survives
        // a reload and a walk around the rest of the app.
        replyAt: Date.now() + REPLY_AFTER_MS,
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
        replyAt: Date.now() + REPLY_AFTER_MS,
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
              // Answered, so the scheduled answer is spent.
              replyAt: null,
              clarifyNote: a.note ?? r.clarifyNote,
              declineReason: a.reason ?? r.declineReason,
              events: [...r.events, { k: a.outcome, t: 'Just now' }],
            }
          : r
      )

      let threads = state.threads
      let toasts = state.toasts
      if (a.outcome === 'accepted') {
        const req = state.requests.find((r) => r.id === a.id)
        const already = state.threads.some((t) => t.requestId === a.id)
        if (req && !already) {
          const id = uid('th')
          const messages = [
            {
              id: uid('m'),
              sys: true,
              text: a.sysText ?? 'Request accepted. Chat is open.',
              t: 'Just now',
            },
          ]
          // Someone who says yes usually says something with it.
          if (a.firstMessage) {
            messages.push({ id: uid('m'), them: true, text: a.firstMessage, t: nowTime() })
          }
          threads = [
            {
              id,
              requestId: req.id,
              withId: req.toTeacher ?? null,
              withRequirement: req.toRequirement ?? req.fromFamily ?? null,
              messages,
              demo: null,
              active: false,
              unread: !!a.notify,
            },
            ...state.threads,
          ]
          /* An answer that lands while the user is on another screen has to
             announce itself, and has to be the way into the chat it opened. */
          if (a.notify) {
            const base = req.from === 'me-teacher' ? '/t' : '/f'
            toasts = [
              ...toasts,
              { id: uid('t'), text: a.notify, tone: 'green', to: `${base}/messages/${id}` },
            ]
          }
        }
      }
      return { ...state, requests, threads, toasts }
    }

    case 'SEEN_THREAD':
      return {
        ...state,
        threads: state.threads.map((t) => (t.id === a.id ? { ...t, unread: false } : t)),
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
                demo: {
                  ...a.demo,
                  status: 'proposed',
                  by: a.by,
                  // The other side reads it and answers, exactly as they
                  // answered the request that opened this chat.
                  confirmAt: Date.now() + CONFIRM_AFTER_MS,
                  reminded: false,
                },
                messages: [
                  ...t.messages,
                  {
                    id: uid('m'),
                    sys: true,
                    // No place in the line: each side words the same place
                    // differently, and a chat message is read by both.
                    text: `Demo proposed: ${dayLabel(a.demo.date)}, ${timeLabel(a.demo.time)}.`,
                    t: 'Just now',
                  },
                ],
              }
            : t
        ),
      }
    case 'CONFIRM_DEMO': {
      const target = state.threads.find((t) => t.id === a.threadId)
      const toasts =
        a.notify && target
          ? [
              ...state.toasts,
              {
                id: uid('t'),
                text: a.notify,
                tone: 'green',
                to: `${target.withId ? '/f' : '/t'}/messages/${target.id}`,
              },
            ]
          : state.toasts
      return {
        ...state,
        toasts,
        threads: state.threads.map((t) =>
          t.id === a.threadId
            ? {
                ...t,
                demo: {
                  ...t.demo,
                  status: 'confirmed',
                  confirmAt: null,
                  where: a.where ?? t.demo?.where ?? (t.demo?.wheres ?? [])[0] ?? null,
                },
                messages: [
                  ...t.messages,
                  {
                    id: uid('m'),
                    sys: true,
                    text: 'Demo confirmed. You can share your address now.',
                    t: 'Just now',
                  },
                ],
              }
            : t
        ),
      }
    }

    /* The reminder promise is shown once, the first time the person is in the
       chat after it is confirmed, and then never nags again. */
    case 'ACK_DEMO_REMINDER':
      return {
        ...state,
        threads: state.threads.map((t) =>
          t.id === a.threadId ? { ...t, demo: { ...t.demo, reminded: true } } : t
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
                    text: 'Tuition started. Fees and scheduling are between you two now.',
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
    case 'TOAST': {
      /* A continuous control fires per step of a drag. Without this, one slide
         of the budget slider stacked a dozen identical confirmations down the
         screen. The same sentence twice is never more informative than once,
         so the standing one has its life extended instead. */
      const already = state.toasts.some((t) => t.text === a.text)
      if (already) return state
      return {
        ...state,
        toasts: [...state.toasts, { id: uid('t'), text: a.text, tone: a.tone }],
      }
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

  // Auto-dismiss toasts. One you are meant to tap gets longer to be tapped.
  useEffect(() => {
    state.toasts.forEach((t) => {
      if (timers.current[t.id]) return
      timers.current[t.id] = setTimeout(
        () => {
          dispatch({ type: 'UNTOAST', id: t.id })
          delete timers.current[t.id]
        },
        t.to ? 7000 : 3200
      )
    })
  }, [state.toasts])

  /* Every request still waiting owes an answer at a known moment. That moment
     is absolute and lives on the request itself, so rescheduling from it is
     idempotent, and the reply survives a reload, a role switch, or a walk
     around the rest of the app.

     The timers belong to this effect and are torn down with it. Holding them
     in a ref looked tidier and was wrong: StrictMode remounts effects in
     development, the teardown cancelled every timer, and the ref still held
     the dead handles, so nothing was ever rescheduled and no reply arrived. */
  useEffect(() => {
    const handles = state.requests
      .filter((r) => r.status === 'pending' && r.replyAt)
      .map((r) =>
        setTimeout(() => dispatch(acceptance(r)), Math.max(0, r.replyAt - Date.now()))
      )
    return () => handles.forEach(clearTimeout)
  }, [state.requests])

  // A proposed demo is answered the same way, from its own absolute moment.
  useEffect(() => {
    const handles = state.threads
      .filter((t) => t.demo?.status === 'proposed' && t.demo.confirmAt)
      .map((t) =>
        setTimeout(() => dispatch(demoConfirmation(t)), Math.max(0, t.demo.confirmAt - Date.now()))
      )
    return () => handles.forEach(clearTimeout)
  }, [state.threads])

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
