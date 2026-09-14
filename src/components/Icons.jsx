const S = ({ children, size = 22, fill = 'none', sw = 1.9, ...p }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    {children}
  </svg>
)

export const IcHome = (p) => (
  <S {...p}>
    <path d="M3 10.4 12 3.5l9 6.9" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M9.7 20v-5.4h4.6V20" />
  </S>
)

export const IcSearch = (p) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </S>
)

export const IcRequests = (p) => (
  <S {...p}>
    <path d="M4 6.5h11" />
    <path d="M4 12h16" />
    <path d="M4 17.5h11" />
    <path d="m17 4 3 2.5-3 2.5" />
    <path d="m7 15-3 2.5L7 20" />
  </S>
)

export const IcChat = (p) => (
  <S {...p}>
    <path d="M20.5 12c0 4.1-3.8 7.4-8.5 7.4a9.9 9.9 0 0 1-2.6-.34L4.5 20.5l1.1-3.5A7 7 0 0 1 3.5 12C3.5 7.9 7.3 4.6 12 4.6s8.5 3.3 8.5 7.4Z" />
  </S>
)

export const IcUser = (p) => (
  <S {...p}>
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
  </S>
)

export const IcPin = (p) => (
  <S {...p} sw={1.8}>
    <path d="M12 21s7-5.4 7-10.6A7 7 0 0 0 5 10.4C5 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.4" r="2.5" />
  </S>
)

export const IcClock = (p) => (
  <S {...p} sw={1.8}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.4V12l3 1.8" />
  </S>
)

export const IcRupee = (p) => (
  <S {...p} sw={1.8}>
    <path d="M7 5h10M7 9.2h10M15.6 5c0 3.4-2.2 4.2-5 4.2H7l7.5 9.8" />
  </S>
)

export const IcCheck = (p) => (
  <S {...p} sw={2.4}>
    <path d="m5 12.6 4.6 4.4L19 6.6" />
  </S>
)

export const IcX = (p) => (
  <S {...p} sw={2.2}>
    <path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6" />
  </S>
)

export const IcBack = (p) => (
  <S {...p} sw={2.1}>
    <path d="M14.5 5 7.8 12l6.7 7" />
  </S>
)

export const IcArrow = (p) => (
  <S {...p} sw={2.1}>
    <path d="M5 12h13" />
    <path d="m12.6 6 6 6-6 6" />
  </S>
)

export const IcQuestion = (p) => (
  <S {...p} sw={1.9}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.5v.4" />
    <path d="M12 16.9h.01" strokeWidth="2.4" />
  </S>
)

export const IcLock = (p) => (
  <S {...p} sw={1.8}>
    <rect x="4.8" y="10.4" width="14.4" height="9.4" rx="3" />
    <path d="M8.4 10.4V7.9a3.6 3.6 0 0 1 7.2 0v2.5" />
  </S>
)

export const IcShield = (p) => (
  <S {...p} sw={1.8}>
    <path d="M12 3.2 5 6v5.6c0 4.2 2.9 7.6 7 9.2 4.1-1.6 7-5 7-9.2V6l-7-2.8Z" />
    <path d="m9.2 11.9 2 2 3.6-3.8" strokeWidth="2" />
  </S>
)

export const IcSend = (p) => (
  <S {...p} sw={1.9}>
    <path d="M4.6 11.6 20 4.4l-7 15.4-2.2-6.6-6.2-1.6Z" />
    <path d="m10.8 13.2 3.5-3.5" />
  </S>
)

export const IcCal = (p) => (
  <S {...p} sw={1.8}>
    <rect x="3.8" y="5.4" width="16.4" height="14.4" rx="3.4" />
    <path d="M3.8 10h16.4M8.4 3.4v3.6M15.6 3.4v3.6" />
  </S>
)

export const IcBook = (p) => (
  <S {...p} sw={1.8}>
    <path d="M4.4 5.2A2.4 2.4 0 0 1 6.8 4H12v15.4H6.8a2.4 2.4 0 0 0-2.4 1.2V5.2Z" />
    <path d="M19.6 5.2A2.4 2.4 0 0 0 17.2 4H12v15.4h5.2a2.4 2.4 0 0 1 2.4 1.2V5.2Z" />
  </S>
)

export const IcStar = ({ size = 14, filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="m12 3.6 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8L12 3.6Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
)

export const IcSliders = (p) => (
  <S {...p} sw={1.9}>
    <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
    <circle cx="16" cy="8" r="2.2" />
    <circle cx="10" cy="16" r="2.2" />
  </S>
)

export const IcSwap = (p) => (
  <S {...p} sw={1.9}>
    <path d="M4 8.5h13l-3.2-3.3" />
    <path d="M20 15.5H7l3.2 3.3" />
  </S>
)

export const IcSparkle = (p) => (
  <S {...p} sw={1.7}>
    <path d="m12 4 1.6 4.6L18 10l-4.4 1.4L12 16l-1.6-4.6L6 10l4.4-1.4L12 4Z" />
    <path d="M18.5 16.5 19 18l1.5.5L19 19l-.5 1.5L18 19l-1.5-.5L18 18l.5-1.5Z" />
  </S>
)

export const IcInfo = (p) => (
  <S {...p} sw={1.9}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11.2v5" />
    <path d="M12 7.9h.01" strokeWidth="2.4" />
  </S>
)

export const IcPeople = (p) => (
  <S {...p} sw={1.8}>
    <circle cx="9.2" cy="8.4" r="3.2" />
    <path d="M3.6 19.4a5.8 5.8 0 0 1 11.2 0" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M17.4 14.6a5.8 5.8 0 0 1 3 4.8" />
  </S>
)

export const IcCamera = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
)
