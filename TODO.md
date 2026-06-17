# TODO.md — Deep Sea Dev Portfolio

> Read this first every session. Pick the top incomplete task. Update before exiting.

## Effects

- [x] **Schooling fish in the sunlight zone**
  SunlightParticles is the weakest zone — just floating spheres while every other
  zone has a distinctive creature (jellyfish, squid, angler fish). Add a small school
  of procedural fish (elongated shapes with tail oscillation) that move together with
  simple flocking behavior. Keep the existing particles as ambient plankton alongside
  the fish. The sunlight zone is where schools of fish actually live — this gives
  the zone real identity.
  _Done when: fish school drifts organically through the experience section, instanced mesh, 60fps on desktop._

- [x] **Zone-colored cursor bubbles**
  CursorBubbles currently uses a fixed light blue color regardless of scroll position.
  Shift the bubble color to match the current zone's accent color as you scroll
  (surface cyan → sunlight blue → twilight purple → midnight teal → abyss pink).
  Read scroll position and interpolate between zone accent colors.
  _Done when: cursor bubbles smoothly shift color as you scroll through zones._

- [x] **Fading god rays into the experience zone**
  The hero's caustic god rays stop abruptly at the section boundary because the
  canvas is position-absolute within the hero. Add a separate, much dimmer god ray
  element (a simple gradient overlay or minimal shader) that appears in the top
  portion of the experience section and fades to nothing by mid-section. This
  bridges the visual transition from bright surface to darker water.
  _Done when: faint light shafts are visible at the top of the experience section and fade out smoothly._

- [x] **Angler fish silhouette in the abyss**
  The angler fish is currently just a glowing sphere (the lure) — the most iconic
  deep-sea creature is unrecognizable. Add a faint body silhouette behind the lure:
  a dark, barely-visible shape (simple geometry — elongated body, hint of a jaw)
  that becomes visible only when the lure's glow illuminates it. The body should
  feel like you're catching a glimpse of something huge in the dark.
  _Done when: a subtle fish shape is occasionally visible near the lure, doesn't overpower the scene._

## Layout & design

- [ ] **Hero section redesign**
  The hero is name + subtitle + scroll indicator — functional but forgettable.
  This is the first impression. Improve it with some combination of:
  - A brief tagline or one-liner below "Software Developer" that adds personality
  - Key competencies or tech displayed as subtle data readouts in mono font
    (e.g. "Kotlin / Spring / React" faintly visible, fitting the underwater HUD feel)
  - Better vertical rhythm — the name and subtitle are vertically centered but
    the scroll indicator floats at the bottom, leaving a lot of dead space
  Keep the existing Three.js caustics. Don't make the text compete with the effect.
  _Done when: hero feels like a strong first impression, text is readable, nothing clutters._

- [ ] **Project section structure**
  13 project cards shown at once overwhelm the section. Restructure: show 4–6
  featured/recent projects prominently, then a "More projects" toggle or collapsible
  section for the rest. The featured projects should be the strongest ones
  (bachelor's project, NAV, iipax Case, web applications). Older/simpler projects
  (Snake, Fountain of Objects) can be in the collapsed section.
  _Done when: projects section has a clear hierarchy, featured cards are prominent, remaining are accessible but not dominant._

- [ ] **Project card hover interaction**
  Improve card hover states to fit the deep-sea specimen theme. The cards already
  have SPECIMEN-001 / CATALOGUED labels. On hover: animate the border with a scan-line
  effect or a sweeping light, brighten the specimen ID, make tech tags pulse slightly.
  Keep it subtle — the effect should feel like a research station scanning a specimen,
  not a flashy UI component.
  _Done when: hover states feel thematic and polished, don't distract from readability._

## Backlog

Ideas not yet prioritized. Pull from here when the above is done.

- Water surface refraction at the top of the hero — a rippling distortion effect
  suggesting the surface above (risky — hero already has a lot going on, easy to
  overdo; requires careful subtlety)
- Parallax depth layers for particles (foreground/midground/background at different
  speeds) — adds depth but high implementation complexity for subtle payoff
- Animated page transitions for initial load (a "diving in" animation)
- Sound design — optional ambient ocean sounds that deepen as you scroll
- Easter egg at the very bottom (deep sea creature, pressure reading, etc.)
- Animated SVG section dividers (wave patterns between zones)
- "Currently working on" indicator on the most recent project card
- Preloader / loading screen with a diving animation while Three.js initializes
- Subtle text distortion — 1-2px wobble on text as if seen through water (CSS animation)
- Bioluminescence flashes near viewport edges during fast scrolling
