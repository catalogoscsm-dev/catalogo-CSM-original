'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  speed?: number
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function ParallaxLayer({ speed = 0.08, children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number

    function tick() {
      if (!ref.current) return
      const offset = -(window.scrollY * speed)
      ref.current.style.transform = `translateY(${offset}px)`
    }

    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', ...style }}>
      {children}
    </div>
  )
}
