---
target: landing page
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/dod/me/gran/projects/extensions/tabnow/website/src/pages/[...locale]/index.astro"
target_fingerprint: "sha256:273009d8efb11c5af82ec284af4de8fb762847c123fb1992076efe59a2af812e"
target_path: /home/dod/me/gran/projects/extensions/tabnow/website/src/pages/[...locale]/index.astro
timestamp: 2026-10-20T15-25-12Z
slug: website-src-pages-locale-index-astro
---
Method: dual-agent (A: design review sub-agent a74239c818a90a221 · B: detector + browser sub-agent a59532bc87a71ae78), isolated; B's output was read only after A returned.

# Critique: TabNow landing page (http://127.0.0.1:4340, 1440x900, Persuade mode)

## Design Health Score (7 and 10 n/a for a landing page)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | System status | 3 | Live counts and selection are clear; playground hint is small, a click-then-Space two-step |
| 2 | Match with real world | 3 | Realistic mock tabs/pages; playground opens with Space, product uses Alt+E |
| 3 | User control | 3 | Esc, Reset, theme toggle; hero demo cannot be paused |
| 4 | Consistency | 3 | One panel UI reused; key notation mixed (prose vs key caps) |
| 5 | Error prevention | 3 | Playground shows bookmarks/history without the opt-in the page says is needed |
| 6 | Recognition | 3 | Panel footer shows its keys; "Back and forth" is a static dummy page |
| 7 | Flexibility | n/a | Landing page |
| 8 | Minimalist design | 3 | Calm; hero has ~30 ghost cards, "Dark/Light" pills overlap scene content |
| 9 | Error recovery | 3 | "No tabs match." state exists |
| 10 | Help | n/a | Landing page |
| **Total** | | **24/32** | Good (75%) |

## Design specificity verdict
LLM assessment: partly authored. The hero typing demo, the playground (real panel inside a fake browser with a real matcher) and Day and night could not belong to another product. The scaffolding between them is category default: seven centered serif headings with a blue italic last word, grey subtitle, centered widget, alternating bands.

Deterministic scan: `detect` found 1 `side-tab` (Playground.astro:359, the nested-comment indent line in the mock Reddit thread): false positive. Browser overlay (injection succeeded): 47 hits. `low-contrast` 29 (mostly imitated Slack/GitHub/Figma/YouTube mock-ups, plus a few real ones: faint grey on white 2.6:1), `italic-serif-display` 7 (the approved Instrument Serif italic accent, a deliberate client choice: accepted), `nested-cards` 6 and tiny text 4 (mock-ups), `skipped-heading` 1 (h1 then h3 in Privacy: real).

Agreement: both found low contrast on small grey text. The detector missed the hierarchy and playground-entry problems; the review missed the heading order.

## Overall impression
Trustworthy and calm, and you can type into the real thing within seconds. Biggest opportunity: the middle sections repeat one template, so the page has no rhythm beyond the demos.

## What's working
1. Playground: fake Chrome window around the real panel, real switching. Proof no competitor shows.
2. Day and night: same panel over Slides (light) and a YouTube talk (dark) with live sliders; the glass effect is shown honestly.
3. Voice and restraint: short plain headlines, no hype, true privacy claim.

## Priority issues
- [P1] Hero ghost cards (about 30) compete with headline and demo. Suggested: /impeccable quieter (Hero.astro, demo.js).
- [P1] Middle sections are one repeated template (centered serif + blue italic + grey line + widget); "Back and forth" is static. Redesign-sized, out of polish scope. Suggested: /impeccable layout, /impeccable animate.
- [P1] Playground entry is hidden and teaches Space, not Alt+E; hint tooltip sits on page content. Suggested: /impeccable clarify, harden. Polish action: Alt+E (Cmd+E) also opens it when the window has focus.
- [P2] Small grey text below AA (hero hint, subtitles on grey bands, install step numerals, optional labels, Dark/Light pills); heading order h1 to h3 in Privacy. Suggested: /impeccable polish.
- [P2] Playground contradicts the privacy story (bookmarks/history shown without opt-in) and the Figma mock shows a "Pro 19 EUR" price card. Content decision: suggested only.
- [P2] Ending is flat: permission table and three install steps. Suggested: /impeccable shape, delight (not polish scope).

## Persona red flags
- Alex (keyboard power user): presses Alt+E on arrival and nothing happens until a click; only Space works in the playground; the key list is near the bottom.
- Jordan (first-timer): "fuzzy finder" and "scopes" are not explained in plain words; the ghost cards read as decoration.
- Sam (accessibility): cards animate continuously, grey 11-13 px labels, playground hint is visual only.

## Minor observations
Dark/Light pills overlap scene content; "How it works" links to the playground (over-promises); mock Gmail address differs between hero and playground; smooth scrolling ignores reduced-motion; Mac note repeats three times; footer links have no context.

## Questions to consider
What if the page were one long tab strip? Would anyone miss 26 of the 30 ghost cards? Why does the keyboard product start its demo with a mouse click?

## Suggested copy changes (not made)
- Hero subtitle: "Find any open tab in a few keystrokes. Press Alt+E, type a few letters, hit Enter." (drop "fuzzy finder" from the first line; show the Mac key once).
- "How it works" button to "Try it below"; drop the grey "try it below" next to the key caps.
- Playground line: "Press Alt+E, or click Open TabNow. Installed, it works on any page."
- Back and forth: "Alt+Z flips to the tab you were just on. Press it again to flip back."
- Privacy label: "Permissions, and why".
- Install steps: one line, "Add it from the Chrome Web Store, then press Alt+E on any page."
- Use one made-up email address in all mocks; remove the "Pro 19 EUR" card from the Figma mock; say that the playground has bookmarks and history switched on.
