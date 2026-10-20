# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
People who live in the browser with dozens to hundreds of tabs: developers, consultants, researchers, project managers. Keyboard-heavy, used to command palettes (VS Code, Raycast, Spotlight). They lose time hunting for the right tab. They reach the landing page from LinkedIn, X or Reddit posts and decide in seconds on a desktop browser.
(Source: website/dummies/BRIEF.md, extension/store/listing.md. Desktop first is a client decision.)

## Product Purpose
TabNow is a Chromium extension that finds any open tab in a few keystrokes: open the overlay, type a few letters, press Enter. Success on the landing page is a visitor trying the live playground, then installing from the Chrome Web Store.

## Positioning
Fuzzy finder for open tabs across every window, with no network requests at all: no account, no analytics, no server, nothing leaves the browser. Plain JS, no dependencies, open source (MIT). A competitor with a cloud, an account or telemetry cannot truthfully claim this.

## Operating Context
Chrome 121+ and other Chromium browsers (Edge, Brave, Opera, Vivaldi, Arc). Opens with Alt+E (Cmd+E on a Mac); Alt+Z jumps to the previous tab; scopes /t /b /h for tabs, bookmarks, history (off by default, browser asks permission); Ctrl+Backspace closes a tab; Alt+T switches light and dark; options set opacity, blur, size and keys.

## Capabilities and Constraints
- Most recently used first, previous tab preselected. Space-separated words must all match; domain ranks above title above rest of URL; matched letters highlighted.
- Tabs from other windows get a window badge on the favicon.
- Panel is frosted glass over the current page; opacity 60-100 %, blur 0-40 px.
- Install: Chrome Web Store (README links it). Source on GitHub: gran-software-solutions/tabnow.
- Promotion only on LinkedIn, X and Reddit. Never Hacker News / Show HN.
- ASSUMPTION: BRIEF.md still says Ctrl+E; the README, store listing and privacy text say Alt+E. The newer sources win.

## Brand Commitments
- Made by GRAN Software Solutions GmbH (https://www.gransoftware.de).
- Client decisions (binding): light, clean, calm, precise. Hates generic "AI-made" looks. Instrument Serif headlines with IBM Plex Sans / Plex Mono. The extension's own light and dark palette with accent blue #1f5fd6 (dark #9cbcff).
- Approved parts to keep: the hero with the self-typing "gh pr" demo and tab cards; the "Try it here." playground using the real extension UI (including the Day and night sliders and their Slides / YouTube talk scenes); the four moments; privacy; keys; install.
- Voice: short, plain, confident, a little dry. No hype words. Show, don't tell.

## Evidence on Hand
- Real extension UI and matcher (extension/search.css, fuzzy.js) reused in the playground.
- Made-up demo tabs only. No testimonials, user counts, ratings or benchmarks exist; do not invent any.

## Product Principles
1. The demo carries the page; the visitor should type into the real thing within seconds.
2. Say only what is true and checkable: privacy claims mirror PRIVACY.md and the store listing.
3. Calm and precise over loud: keyboard-tool restraint, no decoration that does not explain.
4. Desktop first; the keyboard is the product.
5. Plain words for a non-programmer reader where possible.

## Accessibility & Inclusion
No product-specific standard recorded. ASSUMPTION: aim at WCAG AA contrast, visible focus, and reduced-motion respect for the self-typing demo.

## Open decisions
- Interview not held: no live human and no question tool in this run. Every fact above is inferred from BRIEF.md, listing.md, README.md, PRIVACY.md and the client decisions in the task, and the items marked ASSUMPTION are unconfirmed.
