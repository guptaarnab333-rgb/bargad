import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LOCALITIES, localityById } from '../data/seed'
import { nearestLocality } from '../lib/utils'
import { Button, Sheet } from './UI'
import { IcPin, IcSearch } from './Icons'

/* Leaflet's default marker is a PNG resolved from its own stylesheet, which
   bundlers rewrite and then fail to find. Circles are drawn by Leaflet itself,
   so there is no asset to lose, and they suit a locality better than a pin
   anyway: what we know is an area, not a doorstep. */
const DOT = { radius: 5, weight: 0, fillColor: '#5248f8', fillOpacity: 0.45 }
const PICKED = { radius: 10, weight: 3, color: '#ffffff', fillColor: '#0dab76', fillOpacity: 1 }

function MapCanvas({ start, radiusKm, onPick }) {
  const host = useRef(null)
  const map = useRef(null)
  const pin = useRef(null)
  const ring = useRef(null)
  // The click handler changes on every render; the map is built once. A ref
  // keeps the map wired to the current handler without rebuilding it.
  const pick = useRef(onPick)
  pick.current = onPick

  useEffect(() => {
    if (!host.current || map.current) return
    const m = L.map(host.current, { zoomControl: false })
    m.setView([start.lat, start.lng], 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(m)
    L.control.zoom({ position: 'bottomright' }).addTo(m)

    for (const l of LOCALITIES) {
      L.circleMarker([l.lat, l.lng], DOT)
        .addTo(m)
        .bindTooltip(l.name, { direction: 'top' })
        .on('click', () => pick.current({ lat: l.lat, lng: l.lng }))
    }
    pin.current = L.circleMarker([start.lat, start.lng], PICKED).addTo(m)
    m.on('click', (e) => pick.current({ lat: e.latlng.lat, lng: e.latlng.lng }))
    map.current = m

    // The sheet animates in, so the map is measured while it is still off
    // screen and renders as a grey box until it is told to measure again.
    const t = setTimeout(() => m.invalidateSize(), 360)
    return () => {
      clearTimeout(t)
      m.remove()
      map.current = null
    }
  }, [])

  // Follow the current pick, wherever it came from: the map, search, or GPS.
  useEffect(() => {
    if (!map.current || !pin.current) return
    pin.current.setLatLng([start.lat, start.lng])
    map.current.panTo([start.lat, start.lng])
    if (ring.current) ring.current.remove()
    ring.current = radiusKm
      ? L.circle([start.lat, start.lng], {
          radius: radiusKm * 1000,
          weight: 1.5,
          color: '#0dab76',
          fillColor: '#0dab76',
          fillOpacity: 0.08,
        }).addTo(map.current)
      : null
  }, [start.lat, start.lng, radiusKm])

  return <div ref={host} className="lmap" />
}

/**
 * One field, the way a food app does it: tap it, type, or drop a pin.
 *
 * There is no grid of areas. A list of twelve is fine to scroll and hopeless at
 * a hundred, and the question "where are you" is one people answer by typing or
 * by pointing, never by reading every option.
 *
 * A pin is kept as real coordinates AND snapped to the nearest named area. The
 * name is what the other side sees and what the filters compare, so nothing
 * downstream has to learn about coordinates; the coordinates only make the
 * distance honest.
 */
export function LocalityPicker({ value, coords, onChange, radiusKm }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState(null)
  const [locating, setLocating] = useState(false)
  const [problem, setProblem] = useState('')

  const chosen = localityById(value)
  const current = coords ?? chosen ?? LOCALITIES[0]
  const start = draft ?? current
  const snapped = draft ? nearestLocality(draft.lat, draft.lng) : value
  const snappedName = localityById(snapped)?.name

  const searching = q.trim().length > 0
  const hits = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return LOCALITIES.filter((l) => `${l.name} ${l.city}`.toLowerCase().includes(term))
  }, [q])

  const locate = () => {
    if (!navigator.geolocation) return setProblem('This device cannot share a location.')
    setLocating(true)
    setProblem('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraft({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocating(false)
        setProblem('Could not read your location. Search or drop a pin instead.')
      },
      { timeout: 8000 }
    )
  }

  const close = () => {
    setOpen(false)
    setDraft(null)
    setQ('')
    setProblem('')
  }
  const confirm = () => {
    if (draft) onChange(nearestLocality(draft.lat, draft.lng), draft)
    close()
  }

  return (
    <>
      <button type="button" className="lpick__field" onClick={() => setOpen(true)}>
        <IcSearch size={17} />
        <span className={chosen ? 'lpick__value' : 'lpick__ph'}>
          {chosen ? `${chosen.name}, ${chosen.city}` : 'Search your area'}
        </span>
        {chosen && <span className="lpick__change">Change</span>}
      </button>

      <Sheet
        open={open}
        onClose={close}
        title="Where are you?"
        subtitle="Only the area name is ever shown to anyone else."
        footer={
          <Button block onClick={confirm} aria-disabled={!draft}>
            {draft ? `Confirm ${snappedName}` : 'Pick a spot to continue'}
          </Button>
        }
      >
        <input
          className="input"
          autoFocus
          placeholder="Search for an area or city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button type="button" className="lpick__gps" onClick={locate} disabled={locating}>
          <IcPin size={16} />
          {locating ? 'Finding you…' : 'Use my current location'}
        </button>
        {problem && (
          <p className="xs" style={{ color: 'var(--blush-ink)', marginTop: 6 }}>
            {problem}
          </p>
        )}

        {searching && hits.length > 0 && (
          <ul className="lpick__list">
            {hits.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className="lpick__row"
                  onClick={() => {
                    setDraft({ lat: l.lat, lng: l.lng })
                    setQ('')
                  }}
                >
                  <IcPin size={15} />
                  <span>
                    <strong>{l.name}</strong>
                    <span className="lpick__city">{l.city}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {searching && hits.length === 0 && (
          <p className="xs" style={{ margin: '12px 0' }}>
            No area by that name. Drop a pin on the map instead.
          </p>
        )}

        <MapCanvas start={start} radiusKm={radiusKm} onPick={setDraft} />
        <p className="xs" style={{ marginTop: 10 }}>
          {draft
            ? `Nearest area: ${snappedName}. That is the name teachers and families see.`
            : 'Tap the map to drop a pin anywhere.'}
        </p>
      </Sheet>
    </>
  )
}
