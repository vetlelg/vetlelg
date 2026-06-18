# TODO.md — Deep Sea Dev Portfolio

> Read this first every session. Pick the top incomplete task. Update with an X before exiting.

- [x] **Angler fish silhouette in the abyss**
  The angler fish should be more visible. Maybe generate a GLB asset. Match the theme in the abyss.
  _Done when: a subtle fish is visible near the lure, doesn't overpower the scene._

- [x] **Hero section redesign**
  Hero section shouldn't have skills. Should have title, about paragraph and profile picture. Make sure the profile picture fits in the underwater scene.
  _Done when: hero feels like a strong first impression, text is readable, nothing clutters._

- [x] **Project section structure**
   Collapsable project section is not visible, too vague. The squid changes size when it uncollapsed/collapsed. It also looks strange that the abyss section moves with the uncollapse/collapse - I'm not sure if it's possible/easy to solve that part.
  _Done when: Projects are collapsable and it looks and functions well._

- [x] **Performance improvements**
	Review code and look for performance improvements. Add the tasks to this list.
  - [x] Pause off-screen Three.js canvases — use IntersectionObserver + R3F frameloop control to stop GPU rendering when sections aren't visible. Also pause GodRays when fully faded out.
  - [x] Pause CursorBubbles animation loop when no bubbles are on screen (currently runs requestAnimationFrame continuously)
  - [x] Debounce CursorBubbles canvas resize handler to prevent GPU buffer reallocation on every resize event
  - [x] Cache DOM queries in scroll handlers — CursorBubbles and Navbar now query section elements once at mount instead of on every scroll event
  - [x] Pause MarineSnow canvas when above education zone — snow is invisible above education, so skip GPU rendering entirely
  - [x] Skip CursorBubbles on touch-only devices — no mouse cursor means no bubbles, so avoid mounting the canvas and scroll listeners

- [x] **Technical debt**
	Review code and look for technical debt. Add the tasks to this list.
  - [x] Fix 63 ESLint errors: move Math.random() particle initialization from useMemo to module scope (AbyssParticles, MidnightParticles, SunlightParticles, TwilightParticles, MarineSnow)
  - [x] Move inline zone-title color styles to CSS classes (ExperienceSection, EducationSection, ProjectsSection, ContactSection)
  - [x] Clean up uncaptured setTimeout in ProjectsSection toggleArchive

- [x] **Bug fixes**
	Review code and look for bugs. Add the tasks to this list.
  - [x] CursorBubbles color doesn't update on initial load if page is scrolled — bubbles always start as surface accent
  - [x] ContactSection footer year is hardcoded to 2026 — should use current year dynamically
  - [x] CursorBubbles can spawn past MAX_BUBBLES limit — spawn loop doesn't re-check limit per bubble
  - [x] GodRays scrollFade starts at 1.0 — rays flash at full intensity if page loads scrolled past hero

- [] **Visual improvements**
	Review project and look for visual improvements. Don't do anything drastic and very risky. Add the tasks to this list.
  - [x] DepthIndicator marker color interpolates through zone accent colors as you scroll — currently always white
  - [x] Section headings get a subtle text-shadow glow matching their zone accent color
  - [x] Contact social icons larger (24px → 32px) with better hit targets on mobile
  - [x] "Back to surface" link gets an upward chevron animation
  - [] Navbar active link gets a subtle underline indicator

- [] **Update CLAUDE.md**
	Update CLAUDE.md to document the current state of the project. It may be other changes done previously as well.

  
