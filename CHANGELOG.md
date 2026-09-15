# Changelog

## Version 2

Version 1 was tested with real users. They named forty problems. Version 2 is
what those problems produced, plus what a design review and a code audit found
afterwards.

Three sources, kept separate on purpose, because they carry different weight:

- **Tested** comes from users handling V1.
- **Reviewed** comes from our own critique after testing.
- **Audited** comes from reading and driving the built prototype.

---

### Findability

**Tested.** There was no search bar on Find Teachers, only a row of subject
chips. The filter sections ran together and read as one filter. The filter panel
appeared to jump out. An "All subjects" chip read as "teachers who teach every
subject". Price was fixed once at signup, but a family may pay 2000 for one
subject and 3000 for another.

Search is now one field with the filter beside it, on both Discover screens.
Typing a sentence is read into subject, area, city, board, class, mode, time and
a fee cap, and what was understood comes back as chips you can strike out.
Filters moved into a sheet with separated, labelled sections. The fee slider
moved into that sheet. "All subjects" became an Academics / Activities switch.

The sheet had an entrance animation and no exit, so it vanished mid-air rather
than closing. It now closes as the reverse of opening.

A filter row makes people think in the system's categories. A search box lets
them ask in their own words, and showing the interpretation back keeps it
honest, which matters for a product whose pitch is that no opaque agency sits in
the middle.

### Onboarding

**Tested.** People did not know what to fill or how to proceed. Chip groups ran
together, so they thought they had chosen enough. The Continue button was always
dark, so it looked ready when it was not. Mandatory and optional fields looked
identical. The budget range was not understandable.

Continue now carries a visibly not-ready state, and tapping it says what is
missing in the user's own words: "Still needed: the class, the board and at
least one subject". The button is never dead, because a dead button that will
not say why is the fastest way to strand somebody.

Two budget sliders became one, with "Slide to the end for no limit". Nobody has
a minimum they are willing to pay; a floor only ever excluded teachers who were
cheaper than expected.

Each step scrolls back to the top. A step is not a route, so the app's scroll
reset never saw it, and the next step inherited the previous one's position and
rendered its first field sliced in half.

Still open: explicit required and optional marking.

### Point of view

**Tested.** In the family flow, "How should classes happen?" offered "At
student's home" and "At my place", which are the same place when a parent is
reading it. "Your name" was ambiguous, because a student might be holding the
phone.

Every mode is now worded for whoever is reading it. A family sees "At our home",
"At the teacher's place", "Online". A teacher sees "At the student's home", "At
my place", "Online". The fields became "Parent's name" then "Student's name".

One shared string serving two opposite roles is a service failure, not a
copywriting failure. It was the clearest evidence that the app had been written
from the builder's seat.

### Copy

**Tested.** Too much text. Six-word sentences that could be three.

Every user-facing string was rewritten to fixed limits: headlines 3 to 5 words,
body one sentence of at most 12 words, buttons 1 to 3 words. The rules live in
DESIGN.md under "Voice", so they are a system rather than a one-off pass.

Three kinds of text are allowed to break the limit, because the second sentence
carries a service commitment rather than an explanation: what Bargad has and has
not verified, what stays private until acceptance, and that neither side is
charged.

### Coverage

**Tested.** Very few subjects, many missing, no way to type your own. English
was the only language. Extracurricular activities were missing entirely.

Nine subjects became thirty-three, split into fifteen academic and eighteen
activities. Activities are not a filter buried inside academics; they are a
first-class half of the network, because finding a Maths tutor and finding a
guitar teacher are different errands. An activity is taught by age group and
never by syllabus year, so a guitar teacher is asked "8 to 10 year olds" and
never "Class 4", and is never asked for a school board at all.

Class and board accept typed values. India has around sixty boards and plenty of
children who are not in Class 1 to 12.

The part that matters: the escape hatch exists on **both** sides. If only
families can type "Bihar Board" and teachers cannot, the value can never match
anything. One-sided flexibility is no flexibility. What is typed becomes the
value itself, not a flag meaning "other", because a shared "Other" bucket would
have matched a Bihar family to an IB teacher and called it a result.

Still open: a real regional-language list.

### Identity

**Tested.** A user tapped their own name under "Good evening" expecting their
profile, and nothing happened. The card at the top of Home was ambiguous: mine
or a teacher's. Tapping a person's photo and name in a chat did nothing. The
profile cutout looked like a tombstone. Subjects and most other fields could not
be edited.

The greeting and name are now the link, alongside the avatar. The chat header
opens the other person, and on the teacher's side it opens the family's
requirement, which is the only profile a family has from across the network. The
Home banner states whose it is and who can see it. Avatars are round. The
profile edits subjects, classes, age groups, boards, fee, availability, travel
radius and a photo; V1 could edit availability and fee only.

People tap what looks like a person. Something that looks tappable and is not is
worse than something that clearly is not.

### The service after the match

**Tested.** How does the app know tuition actually started? Where do you
actually ask the question in "Question asked"?

The lifecycle is explicit and user-declared: request, optionally one question
before any chat opens, accept, a demo class proposed and confirmed, then "Start
tuition", which flips the relationship to running and drives "Tuition running"
in Messages and "Teaching now" on the profile.

Contact details are handed over by a deliberate tap, only after a demo is fixed,
and never automatically. Asking a question became its own route in the reply
sheet: "Ask something first, one question, no chat yet."

This is the part of a service that lives outside the app. Bargad does not
pretend to observe it. It asks.

### Bugs users met as broken screens

**Tested**, though never reported as bugs. They were reported as "Offer to teach
is not working", "the keyboard vanishes and I can only type one letter", and
"this search area renders half". Each was one cause:

- Every grouped field was wrapped in an HTML `<label>`, so a tap on the heading,
  the padding, or the gap between two chips forwarded the click to the first
  labelable descendant and silently changed the answer. Thirty-six fields.
- Sheets re-stole focus on every keystroke, so a textarea took one character at
  a time and the keyboard closed after each one.
- Onboarding steps inherited the previous step's scroll position.
- "Reset the prototype" used `window.confirm`, which the app's own webview
  suppresses, so it looked dead. Reset is now one tap and clears everything.

None of these were visible in a static design file. They appear only when a
prototype is real enough to be used wrongly.

---

### Reviewed: identity and system

**The mark.** The old logo did not read as teaching, and the name was not
carried by the mark at all. The new mark is a tree growing out of a pencil.
Bargad means banyan, so the mark now says the name: the pencil says learning,
the tree says the name and the idea of many families sheltering under one thing.

**Light and dark as two boards.** Not a metaphor added afterwards. The
Educational Doodles Pack the illustrations come from is published twice in its
source file, once as marker on white and once as chalk on black. The two themes
are the two boards. The doodles inherit `currentColor`, so not one was redrawn.

**Navigation** was rebuilt: icon over label, with one highlight that slides from
tab to tab. Two fades read as two events; one thing that moves reads as the same
thing arriving somewhere else.

**The prototype stopped puppeteering.** V1 had a labelled "Reply as Ananya"
control so a tester could play both sides, and it told every tester they were
looking at a puppet. The other side now answers by itself about thirty seconds
after a request and confirms a demo about twenty seconds after one is proposed,
with an in-app notification that opens the chat. One person on one device can
now experience a two-sided service.

**Demo scheduling** was rebuilt around what phones already taught people: Today
and Tomorrow chips, a calendar, and an alarm-style time wheel. Where to meet is
multi-select, so the proposer offers options and the other party chooses. Once
confirmed, Bargad promises to remind both sides a day before.

**Formats, modes and times are multi-select everywhere**, including on an offer,
so a teacher can make a one-off exception for one family without editing their
whole profile first.

**Area became a map**, with "Use my location", a search field and a travel
radius.

**The seed data moved from Kolkata to Dehradun and Delhi NCR**, so testers
recognise their own neighbourhoods. Part of why the feedback was so specific.

**The welcome screen** was stripped to one decision, centred, with both role
buttons in thumb reach.

---

### Audited: the dark theme

Five surfaces were painted with a literal white instead of a token. A literal
cannot flip, so on the board the white stayed white while the ink turned to
chalk. The place, time and format pills on a requirement card met their own
background at 1.05:1 and the family's note at 1.59:1. Both were invisible, and
they are the entire content of that card. The Decline button had the same fault
from the other end, pale pink on pale pink at 1.21:1.

The tints were muddy for a reason. Each had been made by pulling its light
counterpart down towards the board, which left all four within 1.05 to 1.16:1 of
the ground: nothing lifted off the board and every hue collapsed into the same
brown-grey. Chalk rubbed into a board is lighter than the board, never darker,
so they are built up from it now, at a uniform 1.55:1 lift and an even 32%
saturation. Raising them pushed `--ink-3` under 4.5:1, so that moved too.

The glare was the same mistake inverted: the fit chips were solid `--ink`, a
near-black pill in light that became a chalk-white slab at 13.64:1 on the board.
What sits on a tinted card is now the same board lifted, never a second colour.

Verified at 780 text elements across both themes, both roles and every route,
with translucency composited rather than compared to the nearest solid ancestor.
No pair below its threshold.

### Audited: eight logic bugs

- The family's reply button dispatched an acceptance **on the teacher's behalf**
  and wrote "<teacher> accepted your request" into the thread, when the teacher
  had only asked a question. Answering now returns the decision to the person
  who asked it, and they answer on their own timer like everywhere else.
- A demo could be scheduled **in the past**. The calendar disables past days but
  the wheel cannot know the hour, and the sheet always opened on today at four.
- Search read "sunday morning" as **weekday** mornings. It looked for the
  literal words "weekend" and "weekday", found neither, and defaulted. Day names
  work now, and an unknown half of the week guesses nothing.
- The time chip filtered nothing, on either side.
- The fee chip filtered nothing on the teacher's side.
- "Newest" sorted on `posted.length`, so "1 week ago" ranked newer than "5 hours
  ago".
- A stale teacher or requirement id rendered an empty page with no way back.
- One review missing a score printed `NaN` across the whole panel.

---

## Scope from here

**Flagged by users, not yet built**

- Swipeable onboarding, instead of pressing Continue.
- Explicit required and optional marking.
- A page-end signature line.
- The literal rename from "How should classes happen" to "Where".

**Coverage the country still needs**

- A real regional-language list: Urdu, Punjabi, Garhwali, Bengali, Tamil.
- A governed subject taxonomy with merging, so "maths", "Maths" and
  "Mathematics" do not fragment.
- Four listed boards against roughly sixty real ones.

**Stated in the product, not yet implemented**

- Verification is designed and honestly labelled, "documents seen, not
  confirmed", but not built. The single biggest trust gap.
- The demo reminder promises to notify both sides a day before. There is no
  scheduler, no push and no SMS.
- Lifetime "students taught" is demo data and does not increment.
- Accounts are designed, not real. Everything lives in browser storage, so
  clearing the browser loses the profile.

**Service questions still open**

- Safety and moderation: reporting, blocking, what happens when a demo goes
  wrong, and whether Bargad ever mediates.
- Reviews are written only after tuition ends, but nothing tells the app that it
  ended.
- Money never touches the platform by design. Worth defending, and worth asking
  what happens in a fee dispute.
- One family, several children. The model assumes one learner.
- A teacher running three batches cannot see them as batches.

**Craft**

- Search is rule-based and deterministic. Real language understanding is the
  obvious next step, though the current version has the virtue of showing its
  working.
- The mark merges into a blob at 16 and 24 pixels and needs a simplified
  small-size variant.
- Accessibility beyond colour: screen reader labelling, dynamic type and motion
  preferences are partly handled and not audited.

---

## Version 1

The first working build: two-sided discovery on subject, class, board,
locality, availability, fee and capacity; a structured request the other side
accepts, declines or asks about; a chat that opens only on acceptance; and
nothing private moving before that.
