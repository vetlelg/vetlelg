# CLAUDE.md — Deep Sea Dev Portfolio

## Concept
A developer portfolio styled as a deep-sea descent. Scrolling down moves through
ocean depth zones, from bright surface water to pitch-black abyss. Each zone
contains a portfolio section. Three.js provides underwater atmosphere (particles,
light effects). GSAP ScrollTrigger drives all scroll-based transitions.

Single page, vertical scroll, no routing.

## Tech stack
- Vite + React 18 (functional components, hooks)
- Three.js via @react-three/fiber + @react-three/drei
- GSAP + ScrollTrigger (register once in App.jsx)
- Plain CSS with custom properties
- JavaScript (no TypeScript)

## Depth zones

The page background transitions smoothly between these colors as you scroll.
Each zone has an accent color for highlights, glows, and interactive states.

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
- This gives a deep-water glassmorphism feel

## Section content

Each section should have a title and a small depth label in mono (e.g. "1,000m — Twilight Zone").

- **Hero:** Full viewport. Name, subtitle, animated "scroll to descend" indicator. Three.js caustic light effect behind the text.
- **Experience:** Work history timeline. Cards with company, role, dates, description. Stagger animation on scroll. Ambient floating particles fitting the sunlight zone.
- **Education:** Degrees and certifications. Cards with institution, degree, year, highlights. Floating bioluminescent elements fitting the twilight zone.
- **Projects:** Grid of project cards (2 cols desktop, 1 mobile). Each card: title, description, tech tags, live link, GitHub link. Styled as deep-sea "specimen cards." Bioluminescent particle field for the midnight zone.
- **Contact:** Centered. "Send a transmission" heading. Email link as a glowing button. Social links. "Back to surface" link. Sparse drifting embers for the abyss zone.

A fixed depth indicator on the right edge of the viewport showing current depth in meters (0–11,000m), mapped from scroll position, in mono font, is a nice touch — include it if it works well.

## Data files
Create `src/data/experience.js`, `education.js`, `projects.js` exporting arrays
of objects with realistic placeholder content. All sections render from these files,
never hardcoded in components.

## Conventions
- One component per file, default export
- useRef for GSAP targets, never animate via React state
- useEffect cleanup for every GSAP timeline, ScrollTrigger, and Three.js resource
- Use instanced meshes for particle systems (not individual meshes per particle)
- Suspense boundary with fallback around every R3F Canvas
- Three.js canvases: pointer-events: none, sit behind content via z-index
- Respect `prefers-reduced-motion` — disable GSAP and Three.js animation
- Responsive at 480px, 768px, 1440px
- Commit format: `feat(section): description`

## Commands
```bash
npm run dev      # localhost:5173
npm run build    # production build
npm run preview  # preview build
```

## Quality gates
1. `npm run build` passes with zero errors
2. No console errors or warnings
3. No horizontal scroll at any breakpoint
4. Scroll animations work in both directions
5. Three.js canvases don't block text selection or links
6. Background color transition is smooth and continuous between zones
