# TODO.md — Deep Sea Dev Portfolio

> Read this first every session. Pick the top incomplete task. Update with an X before exiting.

- [x] **Update CLAUDE.md**
Make sure claude.md is up to date. Also review it and use your own judgement if something should change.
_Done when: CLAUDE.md is updated, reviewed and potential changes has been made._

- [x] **Implement school of fish model**
Replace the school of fish in the sunlight section with "C:\repos\vetlelg\public\models\fishschool.glb" and implement this in the sunlight section. Add effects if you think it will make it look better.
_Done when: The school of fish glb model has been implemented and it looks good._

- [x] **Implement anglerfish**
Replace the anglerfish in the abyssal zone with "C:\repos\vetlelg\public\models\anglerfish.glb" and implement it. Add effects if you think it will make it look better, to match the theme in the abyssal zone.
_Done when: The anglerfish glb model has been implemented and it looks good._

- [x] **Fix uncollapsed projects in midnight section**
The uncollapsed projects in the midnight section is impossible to see. They have the same opacity as the other projects when they have been uncollapsed. Should be completely visible, just like all the other projects.
_Done when: Uncollapsed projects are completely visible and looks good._

- [x] **Change hero section layout**
The layout in the hero section now looks very symmetrical with a big headline with my name. The name should change to Vetle L. Gundersen. The layout should change. It should look more like a profile view, with the profile picture on the left and the text and information on the right. Or whatever looks good, but something like that.
_Done when: The layout looks more like a profile layout and looks good._

- [x] **Reconsider transparent glb models**
Reconsider if this is the best looking approach. It could be, or maybe not. Use your own judgement.
_Done when: You have made a decision and it looks good._
_Decision: Transparent Fresnel rim approach is correct — matches the deep-sea theme with graduated visibility by depth. Tuned whale and fish school parameters (slightly higher opacity, wider/softer rim, more emissive glow) to better reflect their brighter depth zones. Anglerfish left as-is for its dedicated task._

- [x] **Anglerfish improvements**
Anglerfish is too big. The glowing lure is also not in front of it at the correct position. Maybe the glowing lure should light up its face and the rest of the body should be less visible / shadowy. Like how an anglerfish would look like in reality.
_Done when: Improvements has been made and it looks good._
_Changes: Reduced scale 0.8→0.4. Lure now attached to body head (offset + wobble) instead of orbiting independently. Point light at lure (intensity 2-6, distance 1.5, decay 3) illuminates face; zero emissive so unlit body stays dark. Subtler Fresnel rim (power 3.5, intensity 0.06). Body drifts on own path with gentle 3-axis rotation. Mobile X-drift narrowed. Merged AnglerBody+AnglerLure into single Anglerfish component._

- [x] **School of fish improvements**
School of fish movement animation suddenly resets and the fish appear out of nowhere. Not exactly sure how this should be solved. School of fish should be visible on mobile.
_Done when: Problem is fixed._
_Changes: Fixed animation reset by using local time accumulation (delta-based) instead of clock.elapsedTime — immune to FrameloopControl pause/resume. Stripped position tracks from GLB animation clips to prevent loop-induced teleportation while keeping swimming rotation/morph animations. Enabled fish school on mobile with reduced scale (3.5) and drift range (1.5)._

- [x] **Whale improvements**
I want it to look like the whale is swimming more in the background. Maybe add some blur or similar effects / depth of field. Or make it very slightly smaller.
_Done when: Improvement has been made and it looks good._
_Changes: Pushed whale z-position -2 units further from camera for physical depth separation. Scale 0.6→0.8 partially compensates (appears ~15% smaller via perspective). Reduced opacity (0.2→0.13), emissive intensity (0.35→0.12), Fresnel rim (0.8→0.3 at power 3.0), and point light (0.4→0.08) for an ethereal distant silhouette. Wake bubbles faded to match. Wider x-sweep (3.2→3.5) for natural background motion._

- [x] **Suggest visual improvements**
Suggest visual improvements. Add tasks to this list. Don't do anything crazy. Just do things that you are fairly certain will look better.
_Done when: All the visual improvement tasks are done._

  - [x] **Enhance zone depth labels** — increase font-size from 0.75rem to 0.85rem and opacity from `--text-dim` (0.3) to 0.5, making the thematic depth indicators more readable
  - [x] **Add lift effect to card hovers** — add `transform: translateY(-2px)` on hover to experience, education, and project cards for a consistent floating feel
  - [x] **Scale social icons on hover** — contact social links only change color; adding `transform: scale(1.15)` makes them feel more interactive
  - [x] **Improve footer presence** — increase footer text from 0.65rem to 0.7rem and add a subtle top gradient separator for visual closure
  - [x] **Add glow to navbar active links** — active nav links are colored but have no glow; adding a subtle text-shadow matching the zone accent ties the nav into the theme

- [] **Suggest technical debt improvements**
Suggest technical debt improvements. Add tasks to this list.
_Done when: All the technical debt tasks are done._

- [] **Suggest performance improvements**
Suggest performance improvements, without making the visuals worse. Add tasks to this list.
_Done when: All the performance improvement tasks are done and visuals look just as good or better._
