# Design

## Visual Theme

Flat colour blocks on a warm ground. The reference is mid-century graphic poster work: saturated
shapes with hard edges, generous negative space, no outlines, no gradients, no glass. Separation
comes from **fill contrast and spacing**, never from a border.

Colour is not decoration here. Each of the four brand colours owns one product state, so a screen
reads as colourful *and* as information.

## Logo

Two ribbons clasp: each rises from its own side, crosses the other, and finishes on the far side.
It is a handshake and it is banyan aerial roots braiding, and the two colours are not arbitrary:
the green ribbon is the teacher side, the indigo is the family side, matching what those colours
mean everywhere else in the product.

Drawn in Figma (file `Rx7z6ddx`, page **Bargad Logo**, kept separate from the moodboard) and
exported verbatim into `src/assets/bargad-mark.svg` and `BargadMark` in `Brand.jsx`. Stroke
colours are driven by `--mark-a` / `--mark-b` so the mark works on light and dark grounds without
being redrawn.

Three lockups exist: stacked (mark, wordmark, tagline), horizontal (for the app header), and the
app icon (white and mint on `--green-deep`). Wordmark is Bricolage Grotesque ExtraBold at −4.5%
tracking; the tagline "Where learning finds its people." is Plus Jakarta Sans Medium.

The mark was chosen by testing three candidates at 120 / 48 / 24 / 16px. An arch read cleanly but
generically; a tight knot turned to mush below 48px; the crossing ribbons held their shape at
16px and were the only one that still said *two sides meeting* at that size.

## Color Palette

Five committed colours on a cream ground. Strategy: **Full palette**, four named roles, each used
deliberately.

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#272727` | Text, primary buttons, the near-black anchor |
| `--green` | `#0DAB76` | **Open to Teach** · accepted · tuition running |
| `--indigo` | `#5248F8` | **Looking for a Teacher** · family side · requirements |
| `--orange` | `#FFAC3E` | Limited availability · awaiting reply · needs attention |
| `--blush` | `#FDD5CE` | Warm surface tint, quiet blocks, declined |
| `--bg` | `#F5F1EA` | Page ground |
| `--surface` | `#FFFFFF` | Raised blocks |

Each hue has a `-ink` variant (`--green-ink`, `--orange-ink`, `--indigo`) for text placed on its own
tint, because the pure brand colours do not clear 4.5:1 on light backgrounds.

Ink ramp: `--ink` → `--ink-2` (#57534B) → `--ink-3` (#656158) → `--ink-4` (#8E897F). `--ink-3` was
solved for, not guessed: it clears 4.5:1 on every surface in the system, worst case 4.63:1 on the
indigo tint. Placeholders and inactive tab labels use `--ink-3`. `--ink-4` is decoration only
(switch track, sheet grab handle) and never carries text.

## Light and dark

One design, two grounds. Dark is not a second skin: it is the same components
reading a different set of tokens, swapped by `data-theme="dark"` on `<html>`.
Two rules decide every value in it.

**Ink and ground trade places.** Light is near-black ink on cream, with a raised
surface lighter than the page and a sunk one darker. Dark is near-white ink on a
warm near-black, and a raised surface is still lighter than the page. So
"raised" and "sunk" keep meaning the same thing in both.

**A brand colour used as a fill keeps its hue; used as text it flips.** A brand
fill stays the colour it is, so what prints on one reads `--on-brand`: white in
light, board-dark in dark, because chalk colours are pastels and white vanishes
on them. The colour-ink tokens (`--green-ink` and its siblings) are for text on
that colour's TINT, never on its fill. Putting one on a fill is how the Decline
button became pale pink on pale pink at 1.21:1.

**Chalk is lighter than the board.** A tint in light is its colour mixed towards
the page; in dark the instinct is to mix it towards the board, and that is
wrong. It leaves every tint within about 1.1:1 of the ground, so no card lifts
off the board and all four hues collapse into the same brown-grey. Dark tints
are built UP from the board instead: a uniform 1.55:1 lift at an even 32%
saturation, which is what lets the four read as one family and as four distinct
colours at once.

**A tint carries no second colour, only a lift.** What sits on a tinted card is
the same board raised: `--on-tint` for a quiet panel, `--on-tint-hi` for the
emphasised one, each with its own ink. Light lifts with white, dark lifts with
chalk dust, because a marker block on a whiteboard is ordinary and a chalk block
on a blackboard is a glare.

Anything painted on an ink block reads `--on-ink`, never `#fff`. Ink is the one
token that inverts, so a hardcoded white on it is a bug waiting for dark mode:
white text on a near-white button. The same trap caught the fit chips and the
requirement note, which were literal `rgba(255,255,255,…)` on a tint: the white
stayed put, the ink turned to chalk, and the two met at 1.05:1. If a surface is
themed, its colour is a token. No exceptions except the map, which is somebody
else's photograph.

**Every pair is measured, not eyeballed.** Body text clears 4.5:1 and large text
3:1 on the surface it actually sits on, composited through any translucency
above it. `--ink-3` is the binding case: it has to clear 4.5:1 on the board and
on all four tints, which is why raising the tints meant raising it too.

## Typography

Two families, split by job.

- **Bricolage Grotesque**: headings, intent titles, the wordmark. Weight 700–800, tracking −0.03em.
- **Plus Jakarta Sans**: everything a user reads or acts on: body, labels, buttons, prices, data.
  Tabular numerals on anything numeric.

Display type never appears in buttons, labels or data. Scale is a fixed rem ramp, not fluid clamps.

## Voice

Microcopy is written to fixed limits, not to taste.

- **Headlines**: 3 to 5 words.
- **Body under a headline**: one sentence, 12 words at most.
- **Buttons, chips, hints, placeholders**: 1 to 3 words. Verb plus object where there is an
  object ("Send request", "Start tuition"), a bare verb where there is not ("Accept",
  "Propose").
- **Tone**: professional, warm, plain. No marketing language, no exclamation marks, no em dashes.

Three kinds of text may run to two short sentences, because the second sentence carries a
commitment the product is built on, and cutting it would delete the promise rather than shorten
the copy:

- What Bargad has and has not verified.
- What stays private until a request is accepted.
- That neither side is ever charged.

Two deliberate exceptions to the word limits. Search placeholders teach the search grammar by
example ("Class 9 maths in Dalanwala"), and the onboarding "Still needed" line names every
missing field, because a button that refuses to say why is what stranded people in the first
place.

## Shape

Three shapes, borrowed from the reference and used consistently:

- **Block**: radius 20–28px. Cards, sheets, tinted panels.
- **Pill**: radius 999px. Buttons, chips, filter controls.
- **Arch**: `999px 999px 20px 20px`. Photo avatars and a few brand moments. This is the signature.

## Components

- **No borders anywhere.** Not on cards, inputs, chips, the tab bar or the top bar. A white block on
  a cream ground is already separated. Focus rings are the sole exception (accessibility).
- **Buttons**: solid pill, no icon token, no arrow. Label is verb + object.
- **Cards**: one level only. Never a card inside a card; nested content uses a tinted block.
- **Avatars**: photograph in an arch or circle, with an initials-on-tint fallback if the image fails.
- **States**: every interactive element has default / hover / focus / active / disabled.

## Motion

150–250ms, ease-out. Motion communicates state change only: sheets rising, toasts, switch throws,
capacity changes. **No page-load choreography, no staggered list entrances.** Everything respects
`prefers-reduced-motion`.

## Imagery

Two kinds, each with one job.

**Photographs** carry identity. Teacher portraits sit in the arch shape, cropped square with
`object-position: 50% 22%` so faces are not cut off. They appear only where a person is the
subject: profile headers, teacher cards, connections. Never as texture. Sourced from Pexels,
stored in `public/portraits/` so the installed PWA works offline, each with an initials fallback.

**Doodles** carry meaning where a photograph would be a lie. Hand-drawn line art from the
Educational Doodles Pack (Figma community file), exported as SVG to `src/assets/doodles/` and
inlined so they inherit `currentColor`. Five are in use, each assigned a fixed meaning:

| Doodle | Where | Why |
|---|---|---|
| Open book | Teacher intent banner, sponsored slot | Teaching |
| Globe | Family intent banner, no-teachers-found | Looking around you |
| Paper plane | No messages, no requests | A request in flight |
| Beaker | No requirements found | A subject |
| Pencil | Welcome composition | Writing |

The exports are used verbatim apart from three mechanical fixes: `stroke="black"` becomes
`currentColor`, `preserveAspectRatio="none"` is removed so nothing stretches, and width/height
attributes are dropped so CSS controls size. Strokes are drawn with `vector-effect:
non-scaling-stroke` at 1.3–1.6 screen px, because the pack draws at 2–4px on a large canvas and
that reads as blobby once scaled down. Nothing is redrawn by hand.

Not every node in the pack exports as a complete drawing: several doodles are assembled from
sibling vectors in Figma, so exporting one node gives a fragment. Anything with a single path was
checked by eye before use; the backpack and laptop were dropped for this reason.
