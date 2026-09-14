import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Brand'
import { Avatar } from './UI'

/**
 * The bar at the top of Home.
 *
 * At rest it reads as a masthead: the mark and the wordmark on the left, the
 * person's own face on the right. Once the page moves, the wordmark drops away
 * and the mark slides to the centre and stays there, so the thing that tells
 * you which app you are in survives the scroll. Instagram does this and it is
 * the reason you always know where you are.
 *
 * The slide is a transform, measured rather than guessed: the wordmark keeps
 * its space while fading, so the distance is whatever it takes to put the MARK
 * on the centre line, and the browser can composite it without touching layout.
 */
export function HomeHeader({ name, photo, profileTo, greeting }) {
  const bar = useRef(null)
  const logo = useRef(null)
  const [shift, setShift] = useState(0)
  const [condensed, setCondensed] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      const mark = logo.current?.querySelector('.mark')
      if (!bar.current || !mark) return
      const b = bar.current.getBoundingClientRect()
      const m = mark.getBoundingClientRect()
      // Distance from the mark's current centre to the bar's centre.
      setShift(Math.round(b.left + b.width / 2 - (m.left + m.width / 2)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const scroller = bar.current?.closest('.shell__scroll')
    if (!scroller) return
    // A little hysteresis, so a header that sits near the threshold cannot
    // flicker between the two states while a finger rests on the screen.
    const onScroll = () => {
      const y = scroller.scrollTop
      setCondensed((was) => (was ? y > 18 : y > 40))
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div ref={bar} className={`appbar${condensed ? ' appbar--in' : ''}`}>
        <span
          ref={logo}
          className="appbar__logo"
          style={{ transform: condensed ? `translateX(${shift}px)` : 'none' }}
        >
          <Logo size={30} />
        </span>
        <Link to={profileTo} className="appbar__me" aria-label="Your profile">
          <Avatar name={name} photo={photo} size={44} />
        </Link>
      </div>

      {/* The name was the thing people tapped expecting a profile, and it did
          nothing. It is the link now, along with the greeting above it. */}
      <Link to={profileTo} className="appbar__greet">
        <p className="eyebrow">{greeting}</p>
        <h1 className="h1" style={{ marginTop: 4 }}>
          {String(name).split(' ')[0]}
        </h1>
      </Link>
    </>
  )
}
