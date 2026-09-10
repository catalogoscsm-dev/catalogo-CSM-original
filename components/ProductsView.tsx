'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, RectangleHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const [view, setView]         = useState<'grid' | 'focus'>('grid')
  const [idx, setIdx]           = useState(0)
  const [visible, setVisible]   = useState(true)
  const [imgIdx, setImgIdx]     = useState(0)
  const containerRef            = useRef<HTMLDivElement>(null)

  const produto = filtered[idx]
  const imgs    = produto?.imagens ?? []

  // Reset ao mudar busca
  useEffect(() => { setIdx(0); setImgIdx(0) }, [query])

  // Keyboard navigation
  useEffect(() => {
    if (view !== 'focus') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(-1)
      else if (e.key === 'Escape') setView('grid')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, idx, filtered.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function navigate(dir: 1 | -1) {
    setVisible(false)
    setTimeout(() => {
      setIdx(i => (i + dir + filtered.length) % filtered.length)
      setImgIdx(0)
      setVisible(true)
      containerRef.current?.focus()
    }, 220)
  }

  function switchView(v: 'grid' | 'focus') {
    setView(v)
    setIdx(0)
    setImgIdx(0)
  }

  return (
    <div className="space-y-4">

      {/* Barra de controle */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {query
            ? <><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{query}"</span> — {filtered.length} resultado(s)</>
            : <>{total} produto(s)</>}
        </p>

        {/* Toggle de visualização */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-2, rgba(255,255,255,0.06))' }}>
          <button
            onClick={() => switchView('grid')}
            title="Grade"
            className="w-8 h-7 rounded-md flex items-center justify-center transition-all duration-200"
            style={{
              background: view === 'grid' ? 'var(--surface-3, rgba(255,255,255,0.12))' : 'transparent',
              color: view === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => switchView('focus')}
            title="Foco (um por vez)"
            className="w-8 h-7 rounded-md flex items-center justify-center transition-all duration-200"
            style={{
              background: view === 'focus' ? 'var(--surface-3, rgba(255,255,255,0.12))' : 'transparent',
              color: view === 'focus' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <RectangleHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MODO GRADE ──────────────────────────────────────────────────── */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <ProductCard produto={p} />
            </div>
          ))}
        </div>
      )}

      {/* ── MODO FOCO ───────────────────────────────────────────────────── */}
      {view === 'focus' && filtered.length > 0 && produto && (
        <div className="flex flex-col items-center gap-6">

          {/* Card principal */}
          <div
            ref={containerRef}
            tabIndex={-1}
            className="w-full max-w-4xl outline-none"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--surface, #111120)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              {/* Imagem */}
              <div className="relative" style={{ aspectRatio: '1', background: '#ffffff' }}>
                {imgs[imgIdx] ? (
                  <Image
                    key={imgIdx}
                    src={imgs[imgIdx]}
                    alt={produto.nome}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--text-secondary)' }}>
                    sem imagem
                  </div>
                )}

                {/* Thumbnails das imagens (se tiver mais de 1) */}
                {imgs.length > 1 && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 px-4">
                    {imgs.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className="rounded-lg overflow-hidden transition-all duration-200"
                        style={{
                          width: 44, height: 44,
                          border: i === imgIdx ? '2px solid rgba(124,58,237,0.8)' : '2px solid rgba(255,255,255,0.15)',
                          opacity: i === imgIdx ? 1 : 0.6,
                          flexShrink: 0,
                          background: '#fff',
                        }}
                      >
                        <Image src={src} alt="" width={44} height={44} unoptimized className="object-contain w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-between p-8">
                <div className="space-y-5">
                  {produto.catalogo_nome && (
                    <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                      {produto.catalogo_nome}
                    </p>
                  )}

                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: 'var(--text-primary)',
                  }}>
                    {produto.nome}
                  </h2>

                  <div className="space-y-3 pt-2">
                    {produto.material && (
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>Material</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.material}</p>
                      </div>
                    )}
                    {produto.dimensoes && (
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>Dimensões</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.dimensoes}</p>
                      </div>
                    )}
                    {produto.acabamento && (
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>Acabamentos</p>
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{produto.acabamento}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <Link
                    href={`/produto/${produto.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: 'var(--accent, #7c3aed)', color: '#fff' }}
                  >
                    Ver produto completo
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.45 }}>
                    Use ← → para navegar · ESC para voltar à grade
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'var(--surface, rgba(255,255,255,0.05))', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <p className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)', minWidth: 64, textAlign: 'center' }}>
              {idx + 1} / {filtered.length}
            </p>

            <button
              onClick={() => navigate(1)}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'var(--surface, rgba(255,255,255,0.05))', color: 'var(--text-secondary)' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-24 space-y-3 animate-fade-in">
          <p className="text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>
            {query ? `Nenhum resultado para "${query}"` : 'Nenhum produto ainda'}
          </p>
        </div>
      )}
    </div>
  )
}
