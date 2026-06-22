# TODO.md — Deep Sea Dev Portfolio

> Read this first every session. Pick the top incomplete task. Update with an X before exiting.

- [x] **School of fish**
Reverted position-track stripping (restored original GLB animation). Added opacity fade near animation loop boundaries — fish and their point light fade to transparent before the position resets, then fade back in, hiding the teleport.

- [x] **Collapse-button in projects section**
Increased `margin-top` on `.projects__archive-toggle` from 3rem to 4.5rem, giving comfortable clearance between the last featured card and the button (especially on mobile where the overlap was most visible).

- [x] **Anglerfish light**
Moved lure/light offset from Z-axis (+0.5 towards camera) to X-axis (+0.6 east), matching the direction the fish faces. Reduced body opacity from 0.3 to 0.15 for a ghostlier deep-sea look while preserving face illumination from the lure's point light.

- [x] **Suggest performance improvements**
Audited the full codebase for performance. Key findings: GLB models total 12.2 MB uncompressed; the Three.js ecosystem bundles into a single 880 KB chunk; DepthIndicator recomputes a static gradient every scroll frame; mobile still runs Vignette + HueSaturation post-processing. Tasks added below.

- [x] **Compress GLB models**
Applied meshopt geometry compression + WebP texture compression via @gltf-transform/cli. Results: anglerfish 7.5 MB → 947 KB, fishschool 1.1 MB → 226 KB, whale 4.0 MB → 474 KB. Total 12.6 MB → 1.6 MB (87% reduction). drei's useGLTF handles meshopt decompression automatically.

- [] **Split vendor chunks in Vite**
The Three.js ecosystem (three + fiber + drei + postprocessing) is a single 880 KB chunk. Configure Vite manualChunks to split into three-core, drei, postprocessing, and gsap. Improves cache granularity and parallel loading.
_Done when: build produces separate vendor chunks, no build errors, site works normally._

- [] **DepthIndicator: compute track gradient once**
The track gradient is 5 fixed colors that never change, but it's recomputed on every scroll event. Set it once on mount.
_Done when: gradient set once in useEffect, scroll handler no longer touches trackRef._

- [] **Reduce mobile post-processing**
Skip Vignette and HueSaturation effects on mobile for TwilightParticles, MidnightParticles, and AbyssParticles. Bloom stays (core to the aesthetic). Saves GPU passes per frame on constrained devices.
_Done when: mobile scenes render without Vignette/HueSaturation, visuals still look good._

- [] **Preload GLB models**
Add useGLTF.preload() calls so fishschool.glb, anglerfish.glb, and whale.glb start downloading before the user scrolls to those sections.
_Done when: preload calls added, models load earlier in network waterfall._