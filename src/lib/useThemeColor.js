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
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    if (!value) return
    const previous = meta.getAttribute('content')
    meta.setAttribute('content', value)
    return () => meta.setAttribute('content', previous)
  }, [token])
}
