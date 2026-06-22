# TODO.md — Deep Sea Dev Portfolio

> Read this first every session. Pick the top incomplete task. Update with an X before exiting.

- [x] **School of fish**
Reverted position-track stripping (restored original GLB animation). Added opacity fade near animation loop boundaries — fish and their point light fade to transparent before the position resets, then fade back in, hiding the teleport.

- [x] **Collapse-button in projects section**
Increased `margin-top` on `.projects__archive-toggle` from 3rem to 4.5rem, giving comfortable clearance between the last featured card and the button (especially on mobile where the overlap was most visible).

- [x] **Anglerfish light**
Moved lure/light offset from Z-axis (+0.5 towards camera) to X-axis (+0.6 east), matching the direction the fish faces. Reduced body opacity from 0.3 to 0.15 for a ghostlier deep-sea look while preserving face illumination from the lure's point light.

- [] **Suggest performance improvements**
Suggest performance improvements, without making the visuals worse. Add tasks to this list.
_Done when: All the performance improvement tasks are done and visuals look just as good or better._