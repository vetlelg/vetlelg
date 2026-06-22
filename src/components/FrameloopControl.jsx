import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export default function FrameloopControl({ sectionId, margin = '300px 0px' }) {
  const set = useThree((s) => s.set)
  const clock = useThree((s) => s.clock)

  useEffect(() => {
    const el = document.getElementById(sectionId)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset oldTime so the first delta after resuming is near-zero,
          // preventing animations and positions from jumping forward.
          clock.oldTime = performance.now()
          set({ frameloop: 'always' })
        } else {
          set({ frameloop: 'never' })
        }
      },
      { rootMargin: margin }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      set({ frameloop: 'always' })
    }
  }, [sectionId, margin, set, clock])

  return null
}
