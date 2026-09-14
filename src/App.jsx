import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from './store/AppContext'
import { useThemeColor } from './lib/useThemeColor'
import { Toasts } from './components/UI'
import TabBar from './components/TabBar'

import Auth from './screens/Auth'
import Intro from './screens/Intro'
import Welcome from './screens/Welcome'
import OnboardTeacher from './screens/OnboardTeacher'
import OnboardFamily from './screens/OnboardFamily'
import TeacherHome from './screens/TeacherHome'
import TeacherDiscover from './screens/TeacherDiscover'
import RequirementDetail from './screens/RequirementDetail'
import TeacherRequests from './screens/TeacherRequests'
import TeacherProfile from './screens/TeacherProfile'
import FamilyHome from './screens/FamilyHome'
import FamilyDiscover from './screens/FamilyDiscover'
import TeacherDetail from './screens/TeacherDetail'
import FamilyRequests from './screens/FamilyRequests'
import FamilyProfile from './screens/FamilyProfile'
import Messages from './screens/Messages'
import Thread from './screens/Thread'

/* Scroll the inner shell (not the window) on navigation */
function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.shell__scroll')?.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

/** Role-aware shell with bottom navigation. */
/* One attribute on <html> swaps the entire surface language. Keeping both in
   the build means comparing them is a tap, and going back is not a revert. */
function SkinSwitch() {
  const { state } = useApp()
  useEffect(() => {
    const el = document.documentElement
    if (state.skin === 'soft') el.setAttribute('data-skin', 'soft')
    else el.removeAttribute('data-skin')
  }, [state.skin])
  return null
}

function RoleLayout({ role, children }) {
  const { state } = useApp()
  // The tab bar is the bottom-most surface on every role screen.
  useThemeColor('--surface')
  // Badge only what genuinely needs the user's attention: a request they must
  // answer, or a question asked of them.
  const mine = state.requests.filter((r) =>
    role === 'teacher'
      ? r.toTeacher === 'me-teacher' || r.from === 'me-teacher'
      : r.from === 'me-family'
  )
  const badges = {
    requests: mine.filter((r) =>
      role === 'teacher'
        ? r.direction === 'received' && r.status === 'pending'
        : r.status === 'clarify'
    ).length,
  }
  return (
    <>
      <div className="shell__scroll">{children}</div>
      <TabBar role={role} badges={badges} />
    </>
  )
}

export default function App() {
  const { state } = useApp()
  const { teacher, family, role } = state

  const needsOnboard = (r) => (r === 'teacher' ? !teacher : !family)

  const guard = (r, el) =>
    needsOnboard(r) ? <Navigate to={`/onboard/${r}`} replace /> : <RoleLayout role={r}>{el}</RoleLayout>

  return (
    <div className="deskframe">
      <div className="shell">
        <ScrollReset />
        <SkinSwitch />
        <Routes>
          <Route
            path="/"
            element={
              role && !needsOnboard(role) ? (
                <Navigate to={role === 'teacher' ? '/t' : '/f'} replace />
              ) : state.introSeen || teacher || family ? (
                <Navigate to="/welcome" replace />
              ) : (
                <Navigate to="/intro" replace />
              )
            }
          />
          <Route path="/intro" element={<Intro />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboard/teacher" element={<OnboardTeacher />} />
          <Route path="/onboard/family" element={<OnboardFamily />} />

          {/* Teacher */}
          <Route path="/t" element={guard('teacher', <TeacherHome />)} />
          <Route path="/t/discover" element={guard('teacher', <TeacherDiscover />)} />
          <Route path="/t/requirement/:id" element={guard('teacher', <RequirementDetail />)} />
          <Route path="/t/requests" element={guard('teacher', <TeacherRequests />)} />
          <Route path="/t/messages" element={guard('teacher', <Messages role="teacher" />)} />
          <Route path="/t/profile" element={guard('teacher', <TeacherProfile />)} />
          <Route path="/t/messages/:id" element={<Thread role="teacher" />} />

          {/* Family */}
          <Route path="/f" element={guard('family', <FamilyHome />)} />
          <Route path="/f/discover" element={guard('family', <FamilyDiscover />)} />
          <Route path="/f/teacher/:id" element={guard('family', <TeacherDetail />)} />
          <Route path="/f/requests" element={guard('family', <FamilyRequests />)} />
          <Route path="/f/messages" element={guard('family', <Messages role="family" />)} />
          <Route path="/f/profile" element={guard('family', <FamilyProfile />)} />
          <Route path="/f/messages/:id" element={<Thread role="family" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toasts toasts={state.toasts} />
      </div>
    </div>
  )
}
