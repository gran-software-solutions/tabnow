---
name: TabNow
description: A calm, precise keyboard tool. The real extension panel, shown large on a quiet white page.
colors:
  ink: "#14171d"
  muted: "#5f6672"
  note: "#6b7280"
  faint: "#9ba1ac"
  line: "#e4e7ec"
  paper: "#ffffff"
  hit-blue: "#1f5fd6"
  ink-night: "#eceef2"
  muted-night: "#a0a7b4"
  note-night: "#8c94a3"
  faint-night: "#6d7585"
  line-night: "#2c313b"
  paper-night: "#161920"
  panel-night: "#1b1f27"
  hit-blue-night: "#9cbcff"
typography:
  display:
    fontFamily: "Instrument Serif, serif"
    fontSize: "96px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.015em"
  hero:
    fontFamily: "Instrument Serif, serif"
    fontSize: "80px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.6
  code:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.86em"
    fontWeight: 500
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  panel: "16px"
  panel-big: "20px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "28px"
  xl: "64px"
  section: "120px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.hit-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "38px"
    padding: "0 16px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "38px"
    padding: "0 16px"
  button-closing:
    backgroundColor: "{colors.hit-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    height: "60px"
    padding: "0 34px"
  keycap:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "11px"
    height: "52px"
    padding: "0 14px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel-big}"
    width: "760px"
  panel-row-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.hit-blue}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  tab-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "58px"
    width: "168px"
---

# Design System: TabNow

## Overview

**Creative North Star: "The Desk Under Glass"**

The page is a white desk with one real instrument on it: the extension's own search panel, scaled up and left to run. Nothing on the page explains that the panel does not already show. Headlines are large Instrument Serif set on a plain surface; everything that behaves like software (nav, buttons, key caps, panels) is IBM Plex and uses the exact light and dark colour sets from the extension's stylesheet. The page is built from four centred moments, each one headline, one line of copy, one panel.

The mood is light, clean, calm, precise: keyboard-tool restraint. Density is low and vertical rhythm is generous (120px above and 128px below each moment). One accent blue carries every "this is selected, this is a match" signal and is used on a small share of any view. Motion is slow and settled, not bouncy: cards drift in over 0.9s, rows rise 8px.

The brand commitment from PRODUCT.md is binding here: Instrument Serif headlines with IBM Plex Sans and Plex Mono, the extension's palette with accent #1f5fd6 (dark #9cbcff), and a rejection of generic "AI-made" looks.

**Key Characteristics:**
- White page, one blue accent, hairline borders instead of fills.
- The product UI is the illustration; mock panels share the real extension's parts and values.
- Serif italic in the accent blue marks the one emphasised word of a headline.
- Light and dark are equal citizens, switched with a data attribute and a 0.5s colour cross-fade.
- Large radii on panels (16 to 20px), small on controls (6 to 10px).

## Colors

A near-monochrome cool grey scale plus a single blue. Light and dark are two complete sets of the same roles.

### Primary
- **Hit Blue** (`colors.hit-blue`, dark `colors.hit-blue-night`): selection, matched letters, links of intent, focus ring, primary buttons, serif-italic emphasis, the caret, the window badge on favicons. In dark it flips to a pale periwinkle and button text becomes the page colour.

### Neutral
- **Ink** (`colors.ink` / `colors.ink-night`): text and the foreground for derived tints (hover fills are 4% of ink, code chips 6%, kbd 7%).
- **Muted** (`colors.muted` / `colors.muted-night`): sub-copy, nav links, captions, placeholder.
- **Note** (`colors.note` / `colors.note-night`): small annotations (scope menu hints, URLs in the browser mock, "optional" tags).
- **Faint** (`colors.faint` / `colors.faint-night`): URL paths in result rows.
- **Line** (`colors.line` / `colors.line-night`): every border, ghost-button outline, divider, and the source of the alternating band tint.
- **Paper** (`colors.paper`, dark page `colors.paper-night`): the page. In dark, raised surfaces (panels, cards, key caps) use `colors.panel-night`, one step lighter than the page; in light they are the same white.

### Named Rules
**The One Blue Rule.** Blue means "selected or matched" and nothing else. Do not use it for decoration, section colour, or illustration.

**The Extension Parity Rule.** Colour values for light and dark are copied from the extension's own stylesheet and stay in lockstep with it. Change them there first.

**The Tint, Not Fill Rule.** Hover, selection, highlight, band and code backgrounds are the foreground or blue mixed into transparent (4 to 38%), never a new hex.

## Typography

**Display Font:** Instrument Serif (400, with italic), self-hosted, with generic serif fallback
**Body / UI Font:** IBM Plex Sans (400 to 600), self-hosted, with system-ui
**Mono Font:** IBM Plex Mono (400, 500), for code chips and scope letters

**Character:** a literary serif for the few big words and a plain engineered sans for everything that acts like software. Weight stays light; hierarchy comes from size and colour, not boldness.

### Hierarchy
- **Display** (400, 96px, 1.0, -0.015em): moment headlines and the privacy question. Drops to 52px under 900px.
- **Hero** (400, 80px, 1.0, -0.01em): the page h1. Drops to 44px under 900px.
- **Lead** (400, 21 to 22px, 1.45, muted): the one-sentence line under a headline, max 760px, balanced wrap.
- **Title** (400, 18px in the large panel, 14 to 13.5px in small panels): result titles.
- **Body** (400, 16px, 1.6): running text and the permission list.
- **Label** (500, 14px): nav, buttons, captions, legal h2 at 20px.
- **Code** (500, 0.86em Plex Mono, on a 6% ink chip, 6px radius): shortcuts and scopes in copy.
- Steps use a 40px italic serif numeral in muted ink.

### Named Rules
**The Two Voices Rule.** Serif is for headlines and step numerals only. Anything interactive, however large, is Plex.

**The Italic Accent Rule.** At most one italic blue word per headline.

## Layout

A single centred column: `max-width 1120px`, 40px side padding (20px under 900px). Each moment is centred text over a centred stage with 64px between copy and stage. Alternate moments sit on a faint band (the line colour at 38% over the page). The hero is a fixed 900px stage where the headline overlays a desk of absolutely placed tab cards and a 600px panel. Two-up grids (day and night scenes, permissions) use 28px or 80px gutters; the key strip is six columns; steps are three columns with 56px gaps. Everything collapses to one column (keys to two) at 900px, nav links hide, and the large panels go full width. Desktop first; the page is written for a keyboard visitor.

## Elevation & Depth

Hairline-first with a whisper of shadow. Borders are drawn as `inset 0 0 0 1px var(--line)` box-shadows so geometry never shifts. Raised panels add a very low, wide shadow; there is no hard or offset shadow on surfaces. In dark mode the resting shadow token is transparent and depth comes from the lighter panel colour.

### Shadow Vocabulary
- **Card rest** (`0 1px 3px var(--shadow)`): tab cards on the desk (shadow token is 5% ink).
- **Panel** (`inset 0 0 0 1px var(--line), 0 6px 24px var(--shadow)`): the hero panel; focus adds a 3px blue ring at 12%.
- **Big panel** (`inset 0 0 0 1px var(--line), 0 24px 60px rgb(15 20 30 / .07)`): the large demo panel and browser mock (dark: .35 black).
- **Lift** (`0 10px 26px rgb(15 20 30 / .12)` plus a 3px blue ring at 16%): a hovered or active card, raised 7px.
- **Key cap edge** (`inset 0 0 0 1px var(--line), 0 3px 0 var(--line)`): the one deliberate hard edge, a physical keycap underside that depresses 3px on press.

### Named Rules
**The Hairline Rule.** Borders are inset 1px line-colour rings, not CSS borders, except dividers inside panels (`--hair`, 7% ink).

**The Keycap Only Rule.** A hard bottom edge belongs to key caps and nothing else.

## Shapes

Soft but not round. Panels 16px (large 20px), scope menu 14px, canvases 18px, cards 10px, buttons and rows 8px, chips and focus ring 6px, favicons 4 to 5px, key caps 11 to 12px, closing button 14px. Pills and circles appear only for the rank badge. Tab strips round only their top corners (10px). Window badge on a favicon is a small blue window glyph with a ring in the surface colour.

## Components

### Buttons
- **Shape:** 8px radius, 38px high, 16px side padding, Plex 500 at 14px, no wrap.
- **Primary:** Hit Blue fill, white text (page colour in dark). Hover brightens 6%; active presses 1px down and dims 3%.
- **Ghost:** transparent with a 1px line ring, ink text; hover adds a 4% ink tint.
- **Closing:** the same button at 60px high, 34px padding, 19px text, 14px radius, once, at the end.
- **Theme switch:** 34px square ghost with sun and moon glyphs cross-rotating and fading over .4 to .5s.

### Key caps
- 52px (strip) or 56px (press demo) tall, 11 to 12px radius, surface fill, line ring and 3px underside; hover lifts 1px, pressed state drops 3px. Inline `kbd` is smaller: 20 to 24px, 6px radius, 7% ink tint, no underside.

### Search panel (signature)
- Surface fill, 20px radius at large size. Query row: 28px light-weight text, 26px magnifier, blue caret that blinks after typed text, result count right-aligned in muted tabular numerals. Divider at `--hair`.
- Rows: 12px by 18px padding, 8px radius, favicon tile, title over host (host at ink 78%, path in faint). Active row is a 12% blue tint with blue title and a visible arrow; matched letters sit on a 28% blue mark, semibold. Rows enter with 8px rise and fade.
- Footer: key hints in muted at 14px with small kbd chips. Under glass it uses background alpha and blur from the options sliders.

### Tab cards (hero desk)
- 168 by 58px, 10px radius, line ring, 1px/3px shadow, favicon tile and two-line title/host. Dimmed cards drop to 30% opacity and desaturate. Selected gets a blue border and 3px blue halo; a small round rank badge sits at the top-left corner. Positions are set by script; cards settle in over .9s with the house easing.

### Scopes menu
- 360px, 14px radius, rows with a Plex Mono 600 scope letter and a note-coloured description right-aligned; active row takes the blue tint.

### Browser mock
- 860px, 16px radius, tab strip tinted from the line colour, active tab joins the surface; page area crossfades between pages (.16s out, .45s in).

### Option sliders
- Label, tabular value, native range tinted with the ink colour (`accent-color`), three in a row plus a reset button.

### Permissions list
- Two columns of rows separated by a top line; a 120px bold label and a muted explanation, optional items flagged with a small note-coloured line.

### Scene backdrops
- The day and night scenes paint third-party-looking pages (Slides, YouTube, Gmail, GitHub) in their own literal colours. These are illustration, not tokens of this system.

### Motion
- House easing `cubic-bezier(.22, .7, .2, 1)` for rises and card moves (.4 to 1s). Colour changes are .15 to .5s ease. Scroll-reveal is a 26px rise over 1s, armed by script only for blocks below the fold. Under `prefers-reduced-motion` smooth scroll and card transitions are off.

## Do's and Don'ts

### Do:
- **Do** show the real panel parts (query row, rows, footer, kbd chips) wherever a feature is explained.
- **Do** keep light and dark values identical to the extension's stylesheet and test both themes.
- **Do** build borders as inset 1px rings in the line colour.
- **Do** keep copy short and plain, with one lead sentence under a headline.
- **Do** keep a 2px blue focus outline with 2px offset on every interactive element.
- **Do** give every moving element a reduced-motion path.

### Don't:
- **Don't** add a second accent colour, gradients, or colour for decoration.
- **Don't** use serif for buttons, labels, or panel text.
- **Don't** put hard or offset shadows on anything except key caps.
- **Don't** add testimonials, counts, ratings or benchmarks; none exist.
- **Don't** drift toward generic AI-made looks: no glow blobs, gradient headlines, or icon-in-circle feature grids.

Not canonized: the third-party backdrop colours in the day and night scenes; the single `--shadow: transparent` dark token (dark depth is carried by surface colour, not a rule to extend); ad hoc one-off pixel sizes inside the mock pages.
