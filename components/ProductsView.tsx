'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, RectangleHorizontal, X, ChevronRight } from 'lucide-react'
import { Produto } from '@/lib/types'
import ProductCard from './ProductCard'
import Link from 'next/link'
import Image from 'next/image'

function normalizeStr(s: string): string {
  let n = s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (n.length > 3 && n.endsWith('s')) n = n.slice(0, -1)
  return n
}

interface Props {
  produtos: Produto[]
  total: number
}

/* ── Card individual no modo scroll ── */
function FocusCard({ produto, onClose }: { produto: Produto; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = produto.imagens ?? []

  return (
    <div
      style={{
        height: '100dvh',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        display: 'grid',
        gridTemplateColumns: 'clamp(300px, 50%, 640px) 1fr',
        background: 'var(--bg, #0a0a12)',
      }}
      className="focus-card"
    >
      {/* Imagem */}
      <div className="relative" style={{ background: '#f5f4f0' }}>
        {imgs[imgIdx] ? (
          <Image
            key={imgIdx}
            src={imgs[imgIdx]}
            alt={produto.nome}
            fill
            unoptimized
            className="object-contain"
            style={{ padding: '2rem' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: '#aaa' }}>
            sem imagem
          </div>
        )}

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 px-4 flex-wrap">
            {imgs.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                style={{
                  width: 48, height: 48,
                  border: i === imgIdx ? '2px solid #7c3aed' : '2px solid rgba(0,0,0,0.12)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  opacity: i === imgIdx ? 1 : 0.55,
                  background: '#fff',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <Image src={src} alt="" width={48} height={48} unoptimized className="object-contain w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between p-10 overflow-y-auto" style={{ color: 'var(--text-primary)' }}>
        <div className="space-y-6">
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" /> Voltar à grade
          </button>

          <div className="space-y-2 pt-4">
            {produto.catalogo_nome && (
              <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                {produto.catalogo_nome}
              </p>
            )}
            <h2 className="font-display" style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontWeight: 400,
              lineHeight: 1.1,
            }}>
              {produto.nome}
            </h2>
            {produto.descricao && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.descricao}</p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            {produto.material && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Material</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.material}</p>
              </div>
            )}
            {produto.dimensoes && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Dimensões</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.dimensoes}</p>
              </div>
            )}
            {produto.acabamento && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>Acabamentos</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.acabamento}</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 space-y-3">
          <Link
            href={`/produto/${produto.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'var(--accent, #7c3aed)', color: '#fff' }}
          >
            Ver produto completo
            <ChevronRight className="w-4 h-4" />
          </Link>
          <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.35 }}>
            Role para ver o próximo produto
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Overlay de foco com scroll-snap ── */
function FocusOverlay({ produtos, startIdx, onClose }: {
  produtos: Produto[]
  startIdx: number
  onClose: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(startIdx)

  // Scroll até o produto inicial
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = startIdx * window.innerHeight
  }, [startIdx])

  // Bloqueia scroll do body enquanto overlay está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard ESC para fechar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Atualiza contador conforme scroll
  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollTop / window.innerHeight)
    setCurrent(Math.min(idx, produtos.length - 1))
  }, [produtos.length])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      {/* Container com scroll-snap */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {produtos.map(p => (
          <FocusCard key={p.id} produto={p} onClose={onClose} />
        ))}
      </div>

      {/* Contador */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        fontSize: 12,
        padding: '4px 12px',
        borderRadius: 999,
        pointerEvents: 'none',
        zIndex: 101,
      }}>
        {current + 1} / {produtos.length}
      </div>
    </div>
  )
}

/* ── Componente principal ── */
export default function ProductsView({ produtos, total }: Props) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const filtered = useMemo(() => {
    if (!query.trim()) return produtos
    const nq = normalizeStr(query)
    return produtos.filter(p => {
      const haystack = [p.nome, p.material, p.descricao, p.texto_livre, p.acabamento]
        .filter(Boolean).join(' ')
      return normalizeStr(haystack).includes(nq)
    })
  }, [produtos, query])

  const [view, setView] = useState<'grid' | 'focus'>('grid')
  const [focusStart, setFocusStart] = useState(0)

  function openFocus(idx = 0) {
    setFocusStart(idx)
    setView('focus')
  }

  return (
    <>
      {/* Overlay foco */}
      {view === 'focus' && filtered.length > 0 && (
        <FocusOverlay
          produtos={filtered}
          startIdx={focusStart}
          onClose={() => setView('grid')}
        />
      )}

      <div className="space-y-4">
        {/* Barra de controle */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {query
              ? <><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{query}"</span> — {filtered.length} resultado(s)</>
              : <>{total} produto(s)</>}
          </p>

          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2, rgba(0,0,0,0.05))' }}>
            <button
              onClick={() => setView('grid')}
              title="Grade"
              className="w-8 h-7 rounded-md flex items-center justify-center transition-all duration-200"
              style={{
                background: view === 'grid' ? 'var(--surface-3, rgba(0,0,0,0.1))' : 'transparent',
                color: view === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openFocus(0)}
              title="Ver um por vez"
              className="w-8 h-7 rounded-md flex items-center justify-center transition-all duration-200"
              style={{
                background: view === 'focus' ? 'var(--surface-3, rgba(0,0,0,0.1))' : 'transparent',
                color: view === 'focus' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grade */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.04}s`, opacity: 0, cursor: 'pointer' }}
              onClick={() => openFocus(i)}
            >
              <ProductCard produto={p} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>
              {query ? `Nenhum resultado para "${query}"` : 'Nenhum produto ainda'}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
