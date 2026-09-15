import { useEffect } from 'react'

/**
 * iOS Safari tints its collapsed top and bottom toolbars with the page's
 * theme-color. One static colour therefore leaves a visible seam: a cream strip
 * under the white tab bar, and a cream strip under the intro's tinted screens.
 * Keep theme-color matched to whatever surface actually sits at the bottom of
 * the screen the user is on.
 *
 * Takes a custom-property name so the value can never drift from the palette.
 */
export function useThemeColor(token) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta || !token) return
    const root = document.documentElement
    const prevMeta = meta.getAttribute('content')
    const prevGround = root.style.getPropertyValue('--page-ground')

    const paint = () => {
      const value = getComputedStyle(root).getPropertyValue(token).trim()
      if (!value) return
      meta.setAttribute('content', value)
      /* theme-color alone was not enough. iOS 26 floats its bottom bar over the
         page and colours the strip behind it from the page's own backdrop, and
         the shell stops at 100dvh, so what showed through there was always
         body's --bg: a grey band under a green screen, on a phone, reading as
         the app failing to reach the bottom of the display.

         The value goes to a custom property rather than straight onto body,
         because on a wide screen body is the desk the phone sits on and must
         stay --frame. CSS decides where the ground applies; this only says
         what it currently is. */
      root.style.setProperty('--page-ground', value)
    }
    paint()

    /* A token name does not change when the board does, so React has no reason
       to re-run this, and the toolbars kept the light value after a switch to
       the blackboard until the next navigation. */
    const obs = new MutationObserver(paint)
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      obs.disconnect()
      meta.setAttribute('content', prevMeta)
      if (prevGround) root.style.setProperty('--page-ground', prevGround)
      else root.style.removeProperty('--page-ground')
    }
  }, [token])
}
