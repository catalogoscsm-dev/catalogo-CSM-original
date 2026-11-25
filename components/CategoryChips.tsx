'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  categorias: string[]
  ativa: string | null
  onSelect: (cat: string | null) => void
}

const PASSO = 300

export default function CategoryChips({ categorias, ativa, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, moved: false, x: 0, left: 0 })
  const [esq, setEsq] = useState(false)
  const [dir, setDir] = useState(false)

  const atualizar = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEsq(el.scrollLeft > 4)
    setDir(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    atualizar()
    el.addEventListener('scroll', atualizar, { passive: true })
    window.addEventListener('resize', atualizar)
    const ro = new ResizeObserver(atualizar)
    ro.observe(el)
    // roda do mouse: vertical -> horizontal, só com o ponteiro sobre a barra
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const indo = e.deltaY > 0
      if ((indo && el.scrollLeft >= max - 1) || (!indo && el.scrollLeft <= 0)) return // na ponta: deixa a página rolar
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('scroll', atualizar)
      window.removeEventListener('resize', atualizar)
      el.removeEventListener('wheel', onWheel)
      ro.disconnect()
    }
  }, [atualizar, categorias.length])

  // chip selecionado fica visível
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('[data-ativo="true"]')
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [ativa])

  function rolar(sentido: 1 | -1) {
    ref.current?.scrollBy({ left: sentido * PASSO, behavior: 'smooth' })
  }

  // arrastar com o mouse (toque continua com o scroll nativo)
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return
    drag.current = { down: true, moved: false, x: e.clientX, left: ref.current.scrollLeft }
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current
    if (!d.down || !ref.current) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 4) d.moved = true
    if (d.moved) ref.current.scrollLeft = d.left - dx
  }
  function fimArraste() {
    drag.current.down = false
    setTimeout(() => { drag.current.moved = false }, 0)
  }

  const seta = (lado: 'l' | 'r'): React.CSSProperties => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [lado === 'l' ? 'left' : 'right']: 0,
    width: 26, height: 26, borderRadius: 999, zIndex: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--c)', border: '1px solid var(--h)', color: 'var(--f)', cursor: 'pointer',
  })
  const fade = (lado: 'l' | 'r'): React.CSSProperties => ({
    position: 'absolute', top: 0, bottom: 0, width: 56, zIndex: 1, pointerEvents: 'none',
    [lado === 'l' ? 'left' : 'right']: 0,
    background: `linear-gradient(to ${lado === 'l' ? 'right' : 'left'}, var(--a) 35%, transparent)`,
  })

  return (
    <div className="relative">
      {esq && <div style={fade('l')} />}
      {dir && <div style={fade('r')} />}
      {esq && <button type="button" aria-label="Categorias anteriores" onClick={() => rolar(-1)} style={seta('l')}><ChevronLeft className="w-4 h-4" /></button>}
      {dir && <button type="button" aria-label="Mais categorias" onClick={() => rolar(1)} style={seta('r')}><ChevronRight className="w-4 h-4" /></button>}
      <div
        ref={ref}
        className="cat-chips flex gap-2 pb-0.5"
        style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth', cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={fimArraste}
        onPointerLeave={fimArraste}
        onClickCapture={e => { if (drag.current.moved) { e.stopPropagation(); e.preventDefault() } }}
      >
        <style>{`div.cat-chips::-webkit-scrollbar{display:none}`}</style>
        {[null, ...categorias].map(cat => {
          const ativo = ativa === cat
          return (
            <button
              key={cat ?? '__todos'}
              data-ativo={ativo}
              onClick={() => onSelect(cat)}
              className="flex-shrink-0 transition-all duration-200 hover:scale-[1.03] active:scale-95"
              style={{
                fontSize:      '11px',
                fontWeight:    ativo ? 600 : 500,
                fontFamily:    'var(--n)',
                letterSpacing: '.06em',
                padding:       '5px 14px',
                borderRadius:  999,
                border:        ativo ? '1px solid var(--ticker-text)' : '1px solid var(--h)',
                background:    ativo ? 'var(--ticker-text)' : 'var(--c)',
                color:         ativo ? '#fff' : 'var(--g)',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
              }}
            >
              {cat ?? 'Todos'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
