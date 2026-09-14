import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LOCALITIES, localityById } from '../data/seed'
import { nearestLocality } from '../lib/utils'
import { Button, Sheet } from './UI'

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
    const m = L.map(host.current, { zoomControl: false, attributionControl: true })
    m.setView([start.lat, start.lng], 12)
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

  // Follow the current pick, wherever it came from: the map, a pill, or search.
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
 * Area, chosen three ways: tap a pill, search by name, or drop a pin.
 *
 * A dropped pin is kept as real coordinates AND snapped to the nearest named
 * area. The name is what the other side sees and what the filters compare, so
 * nothing downstream has to learn about coordinates; the coordinates only make
 * the distance honest, instead of measuring between two neighbourhood centres.
 */
export function LocalityPicker({ value, coords, onChange, radiusKm }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState(null)

  const cities = useMemo(() => {
    const by = new Map()
    for (const l of LOCALITIES) {
      if (!by.has(l.city)) by.set(l.city, [])
      by.get(l.city).push(l)
    }
    return [...by.entries()]
  }, [])

  const current = coords ?? localityById(value) ?? LOCALITIES[0]
  const start = draft ?? current
  const snapped = draft ? nearestLocality(draft.lat, draft.lng) : value
  const snappedName = localityById(snapped)?.name

  const hits = q.trim()
    ? LOCALITIES.filter((l) =>
        `${l.name} ${l.city}`.toLowerCase().includes(q.trim().toLowerCase())
      )
    : []

  const confirm = () => {
    if (draft) onChange(nearestLocality(draft.lat, draft.lng), draft)
    setOpen(false)
    setDraft(null)
    setQ('')
  }

  return (
    <>
      <div className="optgrid">
        {cities.map(([city, list]) => (
          <span key={city} className="lpick__city">
            <span className="lpick__cityname">{city}</span>
            {list.map((l) => (
              <button
                key={l.id}
                type="button"
                className="opt"
                aria-pressed={value === l.id}
                onClick={() => onChange(l.id, null)}
              >
                {l.name}
              </button>
            ))}
          </span>
        ))}
      </div>
      <button type="button" className="opt opt--add" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>
        Choose on the map
      </button>

      <Sheet
        open={open}
        onClose={() => {
          setOpen(false)
          setDraft(null)
          setQ('')
        }}
        title="Where are you?"
        subtitle="Drop a pin for an exact distance. Only the area name is ever shown to anyone else."
        footer={
          <Button block onClick={confirm} aria-disabled={!draft}>
            {draft ? `Use ${snappedName}` : 'Tap the map to place a pin'}
          </Button>
        }
      >
        <input
          className="input"
          placeholder="Search an area"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        {hits.length > 0 && (
          <div className="optgrid" style={{ marginBottom: 12 }}>
            {hits.map((l) => (
              <button
                key={l.id}
                type="button"
                className="opt"
                onClick={() => {
                  setDraft({ lat: l.lat, lng: l.lng })
                  setQ('')
                }}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
        {q.trim() && hits.length === 0 && (
          <p className="xs" style={{ marginBottom: 12 }}>
            No area by that name. Drop a pin on the map instead.
          </p>
        )}
        <MapCanvas start={start} radiusKm={radiusKm} onPick={setDraft} />
        <p className="xs" style={{ marginTop: 10 }}>
          {draft
            ? `Nearest area: ${snappedName}. That is the name teachers and families see.`
            : 'Tap anywhere, or tap one of the marked areas.'}
        </p>
      </Sheet>
    </>
  )
}
