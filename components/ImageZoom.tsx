'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'

interface Props {
  src: string | null
  alt: string
  thumbnails?: string[]
}

const ZOOM_FACTOR = 3

export default function ImageZoom({ src, alt, thumbnails = [] }: Props) {
  const [active, setActive] = useState(src)
  const [zooming, setZooming] = useState(false)
  const [lens, setLens] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const isCropped = active === src

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = imageRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setLens({ x, y })
  }, [])

  return (
    <div className="space-y-3">
      <div
        ref={imageRef}
        className="relative aspect-[4/3] bg-white rounded-2xl overflow-visible border border-gray-200 cursor-crosshair select-none"
        onMouseEnter={() => active && setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          {active ? (
            <>
              <Image
                src={active}
                alt={alt}
                fill
                className="object-contain pointer-events-none"
                priority
              />
              {zooming && (
                <div
                  className="absolute w-24 h-24 border-2 border-blue-400 rounded-full pointer-events-none"
                  style={{
                    left: `${lens.x}%`,
                    top: `${lens.y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(59,130,246,0.06)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.03)',
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
              <Package className="w-20 h-20" />
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        {active && (
          <div
            className={`absolute top-0 left-[calc(100%+16px)] w-80 h-full rounded-2xl border border-blue-200 shadow-2xl overflow-hidden pointer-events-none transition-opacity duration-150 z-50 ${
              zooming ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${active})`,
              backgroundSize: `${ZOOM_FACTOR * 100}%`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `${lens.x}% ${lens.y}%`,
            }}
          />
        )}
      </div>

      {thumbnails.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {thumbnails.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(img)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                active === img ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={img}
                alt={`${alt} ${i + 1}`}
                fill
                className={i === 0 ? 'object-contain bg-white' : 'object-cover'}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
