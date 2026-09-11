# Bargad

A local two-sided learning network for India, built as an academic Service Design + Product Design prototype.

A teacher says **“Open to Teach.”** A family says **“Looking for a Teacher.”** Bargad helps the two
sides discover each other on subject, class, board, locality, availability, fee and current capacity,
then hands the relationship over. Contact happens through a **structured request** that the other side
accepts, declines or asks about. Nothing private moves before that.

All people, requirements, reviews and messages are fictional.

---

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

Open **http://localhost:5173**

The dev server runs with `--host`, so it also prints a second address like
`http://192.168.x.x:5173`. That is the one to open on a phone connected to the same Wi-Fi.

### Production build

```bash
npm run build
```

```bash
npm run preview
```

The service worker precache is generated at build time, so `preview` is the closest thing to the
real installed app.

### Regenerate app icons

```bash
npm run icons
```

---

## What is where

```
src/
  data/seed.js          Fictional demo dataset: teachers, requirements, reviews, seeded activity
  store/AppContext.jsx  All state: profiles, intent, request lifecycle, threads (localStorage)
  lib/utils.js          Distance, explainable fit scoring, filters, formatting
  styles/               tokens.css → base.css → components.css (the design system)
  components/           UI primitives, cards, request lifecycle, tab bar, brand marks
  screens/              One file per screen
```

State lives on the device only. **Profile → Reset the prototype** clears it.

The demo data is seeded in two real places: Dehradun (eight localities, where the primary research
was done) and Delhi NCR (four). Testers recognise where they are, and locality filtering is visibly
doing something. Bargad itself is not tied to a city; every screen reads the city off the locality
record in `seed.js`.

---

## Design system

Palette, typography, shape and motion rules live in [DESIGN.md](DESIGN.md). The short version:
five committed colours on a cream ground, each owning one product state; no borders anywhere
except the focus ring; Bricolage Grotesque for headings, Plus Jakarta Sans for everything a user
reads or acts on.

Teacher portraits are Pexels photographs stored in `public/portraits/` (free licence, no
attribution required) so the installed PWA works offline. Each falls back to an initials tile if
the file is missing.

## Notes

- Two accounts can exist on one device (teacher and family). Switch between them from **Profile → This device**.
- Where the flow needs the *other* person to act, a clearly labelled **prototype control**
  (“Reply as Ananya”) stands in for them. It is marked as such in the UI rather than pretending to be real.
- Verification is shown as an honest state: documents *seen*, not independently verified. There is no
  fake “100% verified” claim anywhere.
- **Teachers never pay.** No listing fee, no charge to view a requirement, no charge to reply, no
  commission. The teacher profile states this outright. Bargad is ad-supported; one honest,
  labelled sponsored slot appears in Find Teachers so the business model is visible in the product
  rather than hidden in a deck.
- No payments, no paid leads, no per-request charges, no AI matching. Those are deliberate exclusions.
