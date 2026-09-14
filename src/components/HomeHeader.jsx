import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Brand'
import { Avatar } from './UI'

/**
 * The bar at the top of Home.
 *
 * At rest it reads as a masthead: the mark and the wordmark together on the
 * left, the person's own face on the right. Once the page moves, the wordmark
 * detaches and slides to the centre, leaving the mark in the corner. So the
 * scrolled state is mark left, name centred, face right, and the thing that
 * tells you which app you are in survives the scroll.
 *
 * Only the wordmark moves, and it moves on a transform, so the mark never
 * shifts and the browser composites the travel without touching layout.
 */

/** Horizontal distance from an ancestor's left edge, ignoring any transform. */
function offsetWithin(el, ancestor) {
  let x = 0
  let node = el
  while (node && node !== ancestor) {
    x += node.offsetLeft
    node = node.offsetParent
  }
  return x
}

export function HomeHeader({ name, photo, profileTo, greeting }) {
  const bar = useRef(null)
  const logo = useRef(null)
  const [shift, setShift] = useState(0)
  const [condensed, setCondensed] = useState(false)

  useLayoutEffect(() => {
    const measure = () => {
      const word = logo.current?.querySelector('.logo__word')
      if (!bar.current || !word) return
      // offsetLeft and offsetWidth are layout values, so they report the
      // wordmark's resting position even while it is translated away.
      const from = offsetWithin(word, bar.current) + word.offsetWidth / 2
      setShift(Math.round(bar.current.offsetWidth / 2 - from))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [name])

  useEffect(() => {
    const scroller = bar.current?.closest('.shell__scroll')
    if (!scroller) return
    // A little hysteresis, so a header resting near the threshold cannot
    // flicker between the two states under a stationary finger.
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
        <span ref={logo} className="appbar__logo">
          <Logo size={30} wordStyle={{ transform: condensed ? `translateX(${shift}px)` : 'none' }} />
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
