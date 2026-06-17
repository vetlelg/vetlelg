# CLAUDE.md — Deep Sea Dev Portfolio

## Concept
A developer portfolio styled as a deep-sea descent. Scrolling down moves through
ocean depth zones, from bright surface water to pitch-black abyss. Each zone
contains a portfolio section. Three.js provides underwater atmosphere (particles,
creatures, light effects). GSAP ScrollTrigger drives all scroll-based transitions.

Single page, vertical scroll, no routing.

## Tech stack
- Vite + React 19 (functional components, hooks)
- Three.js via @react-three/fiber + @react-three/drei + @react-three/postprocessing
- GSAP + ScrollTrigger (registered once in App.jsx)
- Plain CSS with custom properties
- JavaScript (no TypeScript)

## Repository & deployment
- GitHub: github.com/vetlelg/vetlelg
- Future deployment: Azure via GitHub Actions (not yet set up)
- OG meta tags currently point to `vetlelg.github.io/vetlelg/` — update when domain changes

## Depth zones

The page background transitions smoothly between these colors as you scroll
(interpolation in App.jsx). Each zone has an accent color for highlights, glows,
and interactive states.

| Zone | Section | Background gradient | Accent |
|------|---------|-------------------|--------|
| Surface | Hero | `#0077B6` → `#023E8A` | `#CAF0F8` |
| Sunlight | Experience | `#023E8A` → `#03045E` | `#90E0EF` |
| Twilight | Education | `#03045E` → `#0A0A2A` | `#7B2FBE` |
| Midnight | Projects | `#0A0A2A` → `#050510` | `#00F5D4` |
| Abyss | Contact | `#050510` → `#000000` | `#F72585` |

## Design tokens (index.css)
```css
:root {
  --color-surface: #0077B6;
  --color-sunlight: #023E8A;
  --color-twilight: #03045E;
  --color-midnight: #0A0A2A;
  --color-abyss: #050510;

  --accent-surface: #CAF0F8;
  --accent-sunlight: #90E0EF;
  --accent-twilight: #7B2FBE;
  --accent-midnight: #00F5D4;
  --accent-abyss: #F72585;

  --text-primary: #E0F7FA;
  --text-secondary: rgba(224, 247, 250, 0.6);
  --text-dim: rgba(224, 247, 250, 0.3);

  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --card-radius: 12px;
}
```

All colors via custom properties — never hardcode hex in component CSS.

## Typography
- **Space Grotesk** — headings, hero name, zone labels
- **Inter** — body text, descriptions
- **JetBrains Mono** — depth labels, tech tags, data-style readouts
- All text is light on dark. No dark-on-light anywhere.

## Card style
Used for experience entries, education entries, project cards:
- `background: rgba(255, 255, 255, 0.03)` + `backdrop-filter: blur(8px)`
- `border: 1px solid rgba(255, 255, 255, 0.06)`
- On hover: border shifts to zone accent color, subtle glow
- Deep-water glassmorphism feel

## Component map

### Layout & navigation
| Component | File | Role |
|-----------|------|------|
| App | `App.jsx` | Root. Registers ScrollTrigger, drives background color interpolation, renders all zones |
| Navbar | `Navbar.jsx` | Fixed nav with scroll-hide, mobile hamburger, active section highlighting |
| DepthIndicator | `DepthIndicator.jsx` | Fixed right-edge depth meter (0–11,000m) mapped to scroll position |

### Sections (one per depth zone)
| Component | File | Three.js scene |
|-----------|------|----------------|
| HeroSection | `HeroSection.jsx` | HeroCaustics (lazy) — custom caustic shader + god rays + instanced bubbles + Bloom |
| ExperienceSection | `ExperienceSection.jsx` | SunlightParticles — instanced floating spheres + FishSchool (instanced ShapeGeometry fish with Boids flocking) |
| EducationSection | `EducationSection.jsx` | TwilightParticles — bioluminescent particles + procedural Jellyfish (lathe geometry, sinusoidal tentacles) + Bloom |
| ProjectsSection | `ProjectsSection.jsx` | MidnightParticles — flashing bioluminescent particles + procedural Squid + Bloom |
| ContactSection | `ContactSection.jsx` | AbyssParticles — angler fish lure (pulse glow) + AnglerBody silhouette (ShapeGeometry, proximity-driven visibility) + instanced particles + Bloom |

### Global effects (fixed, always visible)
| Component | File | Role |
|-----------|------|------|
| MarineSnow | `MarineSnow.jsx` | Lazy-loaded. Thousands of falling Points, fades in from education zone. Includes Three.js FogExp2 that increases with scroll depth |
| DepthFog | `DepthFog.jsx` | CSS radial-gradient overlay that darkens viewport edges as you scroll deeper |
| CursorBubbles | `CursorBubbles.jsx` | 2D Canvas — small bubbles trail the mouse cursor |

### Data
All section content lives in `src/data/` and is imported by sections — never hardcoded.
- `experience.js` — work history entries
- `education.js` — degrees and certifications
- `projects.js` — project cards with tech tags, years, organizations

## Section content

Each section has a title and a depth label in mono (e.g. "1,000m — Twilight Zone").

- **Hero:** Full viewport. Coordinate readout (lat/long/depth in mono), name, subtitle ("Software Developer"), thin divider, tagline, tech readouts (Kotlin/Spring/React/Docker/PostgreSQL in mono), "scroll to descend" indicator. All in one content flow (no absolute positioning). HeroCaustics behind the text provides caustic light patterns and god rays. Staggered GSAP entrance animations.
- **Experience:** Work history timeline. Glassmorphism cards with company, role, dates, description. GSAP stagger reveal on scroll.
- **Education:** Degrees and certifications. Cards with institution, degree, year, highlights. Procedural jellyfish drifting through the scene.
- **Projects:** Grid of project cards (2 cols desktop, 1 mobile). Each card: title, year/org context line, description, tech tags, GitHub link. Styled as deep-sea specimen cards with a procedural squid.
- **Contact:** Centered. "Send a Transmission" heading. Email button. GitHub + LinkedIn social links (inline SVG). "Back to surface" scroll-to-top. Angler fish lure as focal point.

## Conventions
- One component per file, default export
- useRef for GSAP targets, never animate via React state
- useEffect cleanup for every GSAP timeline, ScrollTrigger, and Three.js resource
- Use instanced meshes for particle systems (not individual meshes per particle)
- Suspense boundary with fallback around every R3F Canvas
- Three.js canvases: pointer-events: none, sit behind content via z-index
- Three.js scenes are lazy-loaded with `React.lazy()` + dynamic `import()`
- All particle/transparent materials use `depthWrite={false}` and `toneMapped={false}`
- Respect `prefers-reduced-motion` — return null from Three.js components, disable GSAP animations
- Mobile: reduce particle counts, lower DPR to 1
- Responsive breakpoints: 480px, 768px, 1440px
- Commit format: `feat(section): description` or `fix(section): description`

## Commands
```bash
npm run dev      # localhost:5173
npm run build    # production build
npm run preview  # preview build
npm run lint     # eslint
```

## Quality gates
1. `npm run build` passes with zero errors
2. No console errors or warnings
3. No horizontal scroll at any breakpoint
4. Scroll animations work in both directions
5. Three.js canvases don't block text selection or links
6. Background color transition is smooth and continuous between zones
7. All Three.js effects respect prefers-reduced-motion
8. Text remains readable over all effects and fog overlays
