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

- [x] **2.3 Experience section**
  Work history section in the sunlight zone. Timeline or structured layout
  showing role, company, dates, and description for each entry. Cards use
  the glassmorphism style. GSAP scroll animation to reveal entries.
  Include a Three.js particle element that fits the sunlight zone — something
  light, organic, ambient. Data from experience.js.
  _Done when: section renders from data, animates on scroll, particles work, responsive._

- [x] **2.4 Education section**
  Credentials section in the twilight zone. Cards for each degree with
  institution, degree, year, highlights. GSAP scroll reveal. Include a
  Three.js element fitting the twilight zone — darker, bioluminescent,
  something with purple/violet glow. Data from education.js.
  _Done when: section renders from data, animates on scroll, Three.js element works, responsive._

- [x] **2.5 Projects section**
  Project showcase in the midnight zone. Grid layout (2 cols desktop,
  1 mobile). Each card: title, description, tech tags, links to live site
  and GitHub. Styled as specimen cards or deep-sea research records.
  Hover: accent glow. GSAP stagger animation. Include a Three.js particle
  field — dense, dark, with the occasional bioluminescent flash.
  Data from projects.js.
  _Done when: grid renders from data, hover states work, links clickable, particles work, responsive._

- [x] **2.6 Contact section**
  Contact section in the abyss zone. "Send a transmission" or similar
  heading. Email link as a glowing accent button. Social icon links
  (GitHub, LinkedIn — inline SVG, no icon library). "Back to surface"
  link that scrolls to top. GSAP entrance animation. A subtle Three.js
  element — sparse, dim, end-of-the-line atmosphere. Footer with copyright.
  _Done when: email works, social links open in new tab, back-to-top scrolls up, responsive._

## Phase 3: Polish and ship

- [x] **3.1 Integration and transitions**
  Scroll the full page top to bottom and back. Fix any hard cuts between
  zones — backgrounds, particle scenes, and content should blend smoothly.
  Three.js canvases should fade at zone boundaries, not pop in/out.
  Verify all GSAP animations reverse correctly on scroll-up.
  _Done when: full-page scroll feels like one continuous descent, no jarring transitions._

- [x] **3.2 Responsive and accessibility**
  Test at 480px, 768px, 1440px. Fix overflow, text sizing, grid layouts.
  Reduce Three.js complexity on mobile if needed. Add aria-labels to
  interactive elements. Keyboard navigation. prefers-reduced-motion support.
  Skip-to-content link.
  _Done when: no horizontal scroll at any width, tab navigation works, reduced motion works._

- [x] **3.3 Performance and final polish**
  `npm run build` — check bundle size (aim for < 500KB gzipped). Verify
  Three.js cleanup (dispose calls, no memory leaks on repeated scroll).
  Add Suspense fallbacks for Three.js scenes. Favicon. Consistent spacing.
  Make it feel finished.
  _Done when: build passes, Lighthouse performance > 80, feels complete._

- [x] **3.4 Deploy**
  Production build. Deploy to Vercel, Netlify, or GitHub Pages. Verify
  everything works in the deployed version.
  _Done when: live URL works with no console errors._

---

## Discovered issues
- [x] When loading the page, the background is white first before it turns blue. It looks clunky when reloading or loading the page.

- [x] The right bar showing depth moves with the meter number gaining width. It looks strange that the width changes when the number increases.

- [x] Possibly add more effects or improve the existing one to make it clearer that this is actually water / the ocean. Maybe the hero should actually start above water? I'm not sure. But I think there's potential to make the effects more fancy.

- [x] The navbar is a bit too distinct from the rest of the page when scrolling, especially in the beginning at the lighter parts of the page. Potentially change or remove the navbar. Do what you think looks better.

- [x] Review everything and suggest improvements / more discovered issues to fix

- [x] Contact section email uses work address (`vetle.larsen.gundersen@decisive.no`). This is a personal portfolio — should use a personal email address instead.

- [x] No Open Graph / Twitter Card meta tags in `index.html`. The site won't preview well when shared on social media (e.g. LinkedIn, Twitter/X). Add `og:title`, `og:description`, `og:image`, and `twitter:card` tags.

- [x] No active state on navbar links to indicate which section is currently in view. Add scroll-based highlighting (IntersectionObserver or ScrollTrigger) to show the current section in the nav.

- [x] Bundle is 1,212KB (346KB gzipped) and Vite warns about chunk size. Code-split Three.js scenes with `React.lazy()` + dynamic `import()` so the initial bundle is lighter and canvases load on demand.

- [x] `SunlightParticles` and `TwilightParticles` are missing `depthWrite={false}` on their material, while `HeroCaustics` Bubbles has it. This inconsistency could cause z-ordering artifacts with transparent particles. Add `depthWrite={false}` to all particle materials for consistency.

- [x] `public/icons.svg` contains unused social icons (Bluesky, Discord, X/Twitter). Either add these as additional social links in the Contact section or remove the unused file.

- [x] Hero section is a bit too bright. The text, github and linkedin links are not very visible. The education text in the hero section is weirdly placed. I don't know if this text or the links are necessary. Fix it, remove them or make other improvements to the hero section so it looks good.

- [x] All the entries in database.js has to be included in the content of the portfolio. The content within each entry can be adjusted to fit to the page and make it look good.

- [x] Jellyfish in the twilight zone — A procedural jellyfish (dome + sinusoidal tentacle curves) drifting slowly through
  the education section would be a signature visual. Right now every zone is "spheres but different color." One
  recognizable creature breaks the pattern and gives the twilight zone real identity.

- [x] Marine snow — Thousands of tiny falling specks (a single Points geometry, very cheap to render) layered across the
  deeper zones. Real deep ocean has this constant gentle snowfall of organic matter. It adds atmosphere and depth that
  the current sparse particles miss.

- [x] Angler fish lure in the abyss — A single bright point light with a subtle sway in the contact section, illuminating
  nearby particles as it passes. Iconic deep-sea imagery, and it gives the abyss zone a focal point instead of just
  sparse dots.

- [] Fog progression — Three.js fog that gets denser as you scroll deeper. Simple to add, reinforces the depth narrative
  physically rather than just through color.

- [] Fix the nav bar menu on smaller screens

- [] Make sure the portfolio looks good on (almost) all screen sizes

- [] Review everything and suggest discovered issues (and improvements to the page). If you find any, add them to this document

## Completed

- **1.1 Setup and zone background system** — 2026-06-15
- **1.2 Navbar and depth indicator** — 2026-06-15
- **2.1 Hero section** — 2026-06-15
- **2.2 Data files** — 2026-06-15
- **2.3 Experience section** — 2026-06-15
- **2.4 Education section** — 2026-06-15
- **2.5 Projects section** — 2026-06-15
- **2.6 Contact section** — 2026-06-15
- **3.1 Integration and transitions** — 2026-06-15
- **3.2 Responsive and accessibility** — 2026-06-15
- **3.3 Performance and final polish** — 2026-06-15
- **3.4 Deploy** — 2026-06-15
- **Fix white flash on page load** — 2026-06-16
- **Fix depth indicator width shifting** — 2026-06-16
- **Enhanced hero ocean effects (god rays + bubbles)** — 2026-06-16
- **Fix navbar too distinct from page** — 2026-06-16
- **Review everything and suggest improvements** — 2026-06-16
- **Fix contact email to personal address** — 2026-06-16
- **Add Open Graph / Twitter Card meta tags** — 2026-06-16
- **Add active state highlighting to navbar links** — 2026-06-16
- **Code-split Three.js scenes with React.lazy()** — 2026-06-16
- **Add depthWrite={false} to all particle materials** — 2026-06-16
- **Remove unused public/icons.svg** — 2026-06-16
- **Fix hero section brightness and readability** — 2026-06-16
- **Include all database.js entries in portfolio** — 2026-06-16
- **Jellyfish in the twilight zone** — 2026-06-16
- **Marine snow particle overlay** — 2026-06-16
- **Angler fish lure in the abyss** — 2026-06-16
