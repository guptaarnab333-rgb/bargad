import { NavLink } from 'react-router-dom'
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

  const tabs = [
    { to: base, end: true, label: 'Home', Icon: IcHome },
    { to: `${base}/discover`, label: L.discover, Icon: IcSearch },
    { to: `${base}/requests`, label: L.requests, Icon: IcRequests, badge: badges.requests },
    { to: `${base}/messages`, label: 'Messages', Icon: IcChat, badge: badges.messages },
    { to: `${base}/profile`, label: 'Profile', Icon: IcUser },
  ]

  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map(({ to, end, label, Icon, badge }) => (
        <NavLink key={to} to={to} end={end} className="tab">
          {({ isActive }) => (
            <>
              <span className="tab__icon">
                <Icon size={23} sw={isActive ? 2.3 : 1.8} />
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
