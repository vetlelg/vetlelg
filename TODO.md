# TODO.md — Deep Sea Dev Portfolio

> Read this first every session. Pick the top incomplete task. Update before exiting.

## Phase 1: Foundation

- [x] **1.1 Setup and zone background system**
  Add Google Fonts to index.html. Set up CSS custom properties in index.css
  from CLAUDE.md. Global reset. Register ScrollTrigger in App.jsx.
  Implement the background color transition: the page should smoothly
  gradient through all five zone colors as you scroll. Create placeholder
  sections (one per zone, 100vh each) so scrolling works.
  _Done when: `npm run dev` shows a page that transitions through all zone colors on scroll._

- [x] **1.2 Navbar and depth indicator**
  Fixed navbar: name/logo left, section links right. Starts transparent,
  gains a dark blur on scroll. Smooth-scroll links to each section.
  Mobile hamburger at < 768px. Depth indicator on the right edge of
  the viewport showing scroll-mapped depth in meters.
  _Done when: nav links scroll correctly, depth reads 0m at top and ~11,000m at bottom._

## Phase 2: Sections

- [x] **2.1 Hero section**
  Full viewport. Name, subtitle, scroll-to-descend indicator with a
  gentle animation. A Three.js scene behind the text providing a caustic
  light effect or shimmering water surface — something that says "ocean
  surface" without being heavy. Canvas behind text, pointer-events none.
  _Done when: hero renders with visible Three.js atmosphere, text is readable, 60fps._

- [x] **2.2 Data files**
  Create src/data/experience.js (3 entries), education.js (2 entries),
  projects.js (4 entries) with realistic placeholder content. Each exports
  an array of objects with all the fields the sections will need.
  _Done when: all three files import cleanly and contain complete placeholder data._

- [ ] **2.3 Experience section**
  Work history section in the sunlight zone. Timeline or structured layout
  showing role, company, dates, and description for each entry. Cards use
  the glassmorphism style. GSAP scroll animation to reveal entries.
  Include a Three.js particle element that fits the sunlight zone — something
  light, organic, ambient. Data from experience.js.
  _Done when: section renders from data, animates on scroll, particles work, responsive._

- [ ] **2.4 Education section**
  Credentials section in the twilight zone. Cards for each degree with
  institution, degree, year, highlights. GSAP scroll reveal. Include a
  Three.js element fitting the twilight zone — darker, bioluminescent,
  something with purple/violet glow. Data from education.js.
  _Done when: section renders from data, animates on scroll, Three.js element works, responsive._

- [ ] **2.5 Projects section**
  Project showcase in the midnight zone. Grid layout (2 cols desktop,
  1 mobile). Each card: title, description, tech tags, links to live site
  and GitHub. Styled as specimen cards or deep-sea research records.
  Hover: accent glow. GSAP stagger animation. Include a Three.js particle
  field — dense, dark, with the occasional bioluminescent flash.
  Data from projects.js.
  _Done when: grid renders from data, hover states work, links clickable, particles work, responsive._

- [ ] **2.6 Contact section**
  Contact section in the abyss zone. "Send a transmission" or similar
  heading. Email link as a glowing accent button. Social icon links
  (GitHub, LinkedIn — inline SVG, no icon library). "Back to surface"
  link that scrolls to top. GSAP entrance animation. A subtle Three.js
  element — sparse, dim, end-of-the-line atmosphere. Footer with copyright.
  _Done when: email works, social links open in new tab, back-to-top scrolls up, responsive._

## Phase 3: Polish and ship

- [ ] **3.1 Integration and transitions**
  Scroll the full page top to bottom and back. Fix any hard cuts between
  zones — backgrounds, particle scenes, and content should blend smoothly.
  Three.js canvases should fade at zone boundaries, not pop in/out.
  Verify all GSAP animations reverse correctly on scroll-up.
  _Done when: full-page scroll feels like one continuous descent, no jarring transitions._

- [ ] **3.2 Responsive and accessibility**
  Test at 480px, 768px, 1440px. Fix overflow, text sizing, grid layouts.
  Reduce Three.js complexity on mobile if needed. Add aria-labels to
  interactive elements. Keyboard navigation. prefers-reduced-motion support.
  Skip-to-content link.
  _Done when: no horizontal scroll at any width, tab navigation works, reduced motion works._

- [ ] **3.3 Performance and final polish**
  `npm run build` — check bundle size (aim for < 500KB gzipped). Verify
  Three.js cleanup (dispose calls, no memory leaks on repeated scroll).
  Add Suspense fallbacks for Three.js scenes. Favicon. Consistent spacing.
  Make it feel finished.
  _Done when: build passes, Lighthouse performance > 80, feels complete._

- [ ] **3.4 Deploy**
  Production build. Deploy to Vercel, Netlify, or GitHub Pages. Verify
  everything works in the deployed version.
  _Done when: live URL works with no console errors._

---

## Discovered issues


## Completed

- **1.1 Setup and zone background system** — 2026-06-15
- **1.2 Navbar and depth indicator** — 2026-06-15
- **2.1 Hero section** — 2026-06-15
- **2.2 Data files** — 2026-06-15
