'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, Rows3 } from 'lucide-react'
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

/* ── Card horizontal (modo lista) ── */
function ListCard({ produto }: { produto: Produto }) {
  const imgs = produto.imagens ?? []
  const categoria = produto.descricao?.trim() || produto.catalogo_nome || ''

  const [imgIdx, setImgIdx]   = useState(0)
  const [fading, setFading]   = useState(false)
  const [hovered, setHovered] = useState(false)
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null)
  const idxRef                = useRef(0)

  // Pré-carrega imagens ao entrar no hover
  useEffect(() => {
    if (!hovered || imgs.length <= 1) return
    imgs.slice(1).forEach(src => { fetch(src).catch(() => {}) })
  }, [hovered]) // eslint-disable-line react-hooks/exhaustive-deps

  // Ciclo automático de imagens no hover
  useEffect(() => {
    if (!hovered || imgs.length <= 1) return
    idxRef.current = imgIdx
    intervalRef.current = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % imgs.length
        setImgIdx(idxRef.current)
        setTimeout(() => setFading(false), 80)
      }, 320)
    }, 2200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [hovered, imgs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset ao sair do hover
  useEffect(() => {
    if (!hovered) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setFading(true)
      setTimeout(() => { setImgIdx(0); idxRef.current = 0; setFading(false) }, 300)
    }
  }, [hovered])

  return (
    <Link href={`/produto/${produto.id}`} className="block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="list-card rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-xl"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 240,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* ── Lado da imagem ── */}
        <div className="relative" style={{ background: '#F5F2EE', minHeight: 280 }}>
          {/* Badge categoria */}
          {categoria && (
            <span style={{
              position: 'absolute', top: 14, left: 14, zIndex: 2,
              background: 'rgba(20,18,16,0.82)', color: '#fff',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
              textTransform: 'uppercase', padding: '4px 10px', borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}>
              {categoria}
            </span>
          )}

          {/* Thumbnails no topo direito se tiver mais de 1 */}
          {imgs.length > 1 && (
            <div style={{
              position: 'absolute', top: 12, right: 12, zIndex: 2,
              display: 'flex', gap: 4,
            }}>
              {imgs.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  onClick={e => { e.preventDefault(); setImgIdx(i) }}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: i === imgIdx ? '2px solid #8C6E18' : '2px solid rgba(255,255,255,0.6)',
                    overflow: 'hidden', background: '#fff', flexShrink: 0,
                    opacity: i === imgIdx ? 1 : 0.65,
                    transition: 'all 0.15s',
                  }}
                >
                  <Image src={src} alt="" width={28} height={28} unoptimized className="object-contain w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {imgs[imgIdx] ? (
            <div style={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.32s ease' }}>
              <Image
                key={imgIdx}
                src={imgs[imgIdx]}
                alt={produto.nome}
                fill
                unoptimized
                className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ padding: '1rem' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#bbb', minHeight: 280 }}>
              sem imagem
            </div>
          )}
        </div>

        {/* ── Lado da info ── */}
        <div className="flex flex-col justify-center px-8 py-6 gap-3" style={{ background: 'var(--bg)' }}>
          <div className="space-y-2">
            {produto.catalogo_nome && (
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                {produto.catalogo_nome}
              </p>
            )}
            <h2 className="font-display" style={{
              fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: 'var(--text-primary)',
            }}>
              {produto.nome}
            </h2>
          </div>

          {(produto.material || produto.dimensoes) && (
            <div className="space-y-1">
              {produto.material && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{produto.material}</p>
              )}
              {produto.dimensoes && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.65 }}>{produto.dimensoes}</p>
              )}
            </div>
          )}

          <span className="ver-produto-btn">
            Ver produto completo →
          </span>
        </div>
      </div>
    </Link>
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

  const [view, setView] = useState<'grid' | 'list'>(() => {
    if (typeof window === 'undefined') return 'grid'
    return (localStorage.getItem('csm_view') as 'grid' | 'list') ?? 'grid'
  })

  function changeView(v: 'grid' | 'list') {
    setView(v)
    localStorage.setItem('csm_view', v)
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

        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
          <button
            onClick={() => changeView('grid')}
            title="Grade"
            className="w-8 h-7 rounded-md flex items-center justify-center transition-all duration-200"
            style={{
              background: view === 'grid' ? 'var(--surface-hover)' : 'transparent',
              color: view === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => changeView('list')}
            title="Lista"
            className="w-8 h-7 rounded-md flex items-center justify-center transition-all duration-200"
            style={{
              background: view === 'list' ? 'var(--surface-hover)' : 'transparent',
              color: view === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <Rows3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── GRADE ── */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <ProductCard produto={p} />
            </div>
          ))}
        </div>
      )}

      {/* ── LISTA ── */}
      {view === 'list' && (
        <div className="flex flex-col gap-4">
          {filtered.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}>
              <ListCard produto={p} />
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-24">
          <p className="text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>
            {query ? `Nenhum resultado para "${query}"` : 'Nenhum produto ainda'}
          </p>
        </div>
      )}
    </div>
  )
}
