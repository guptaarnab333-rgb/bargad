import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { IcChat, IcHome, IcRequests, IcSearch, IcUser } from './Icons'

/* Tab labels stay short so the row never wraps; the screen's own top bar
   carries the full "Find Students" / "Find Teachers" title. */
const LABELS = {
  teacher: { discover: 'Students', requests: 'Requests' },
  family: { discover: 'Teachers', requests: 'Requests' },
}

export default function TabBar({ role, badges = {} }) {
  const base = role === 'teacher' ? '/t' : '/f'
  const L = LABELS[role]

  /* One marker that travels, rather than a background fading out under one tab
     and in under another. Two fades read as two events; a thing that moves
     reads as the same thing arriving somewhere else, which is what happened.

     It is measured from the DOM rather than computed from an index, because
     NavLink already decides which tab is current and the tabs are not all the
     same width once their names are in them. */
  const bar = useRef(null)
  const { pathname } = useLocation()
  const [marker, setMarker] = useState(null)

  const place = useCallback(() => {
    const on = bar.current?.querySelector('.tab[aria-current="page"]')
    setMarker(on ? { x: on.offsetLeft, w: on.offsetWidth } : null)
  }, [])

  // Layout, not effect: the marker must be in position on the paint that shows
  // the new screen, or it visibly jumps first and slides second.
  useLayoutEffect(place, [pathname, role, place])

  useLayoutEffect(() => {
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [place])

  const tabs = [
    { to: base, end: true, label: 'Home', Icon: IcHome },
    { to: `${base}/discover`, label: L.discover, Icon: IcSearch },
    { to: `${base}/requests`, label: L.requests, Icon: IcRequests, badge: badges.requests },
    { to: `${base}/messages`, label: 'Messages', Icon: IcChat, badge: badges.messages },
    { to: `${base}/profile`, label: 'Profile', Icon: IcUser },
  ]

  return (
    <nav className="tabbar" aria-label="Main" ref={bar}>
      {marker && (
        <span
          className="tabbar__marker"
          aria-hidden="true"
          style={{ transform: `translateX(${marker.x}px)`, width: marker.w }}
        />
      )}
      {tabs.map(({ to, end, label, Icon, badge }) => (
        <NavLink key={to} to={to} end={end} className="tab">
          {({ isActive }) => (
            <>
              <span className="tab__icon">
                <Icon size={22} sw={isActive ? 2.3 : 1.8} />
                {badge > 0 && <span className="tab__badge num">{badge}</span>}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
