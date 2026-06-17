import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export default function FrameloopControl({ sectionId, margin = '300px 0px' }) {
  const set = useThree((s) => s.set)

  useEffect(() => {
    const el = document.getElementById(sectionId)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        set({ frameloop: entry.isIntersecting ? 'always' : 'never' })
      },
      { rootMargin: margin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionId, margin, set])

  return null
}
