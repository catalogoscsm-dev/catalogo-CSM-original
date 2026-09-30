'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Produto } from '@/lib/types'
import { Heart, X, History, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

const LS_FAV       = 'csm_favoritos'
const LS_REMOVIDOS = 'csm_removidos'
const LS_VISTOS    = 'csm_visualizados'
const WA_PHONE     = '5519990034068'
const MAX_HIST     = 50

interface HistEntry { id: number; at: number }

function getLS<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') } catch { return fallback }
}

function buildWaHref(produtos: Produto[], origin: string) {
  const lista = produtos
    .map((p, i) => `${i + 1}. *${p.nome}*\n   🔗 ${origin}/produto/${p.id}`)
    .join('\n\n')
  const msg =
    `Olá! 👋 Selecionei ${produtos.length} produto(s) no Catálogo CSM que me encantaram e gostaria de saber mais:\n\n` +
    `${lista}\n\n` +
    `Podem me ajudar com informações, disponibilidade e condições? 😊✨`
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1)  return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d} dia${d > 1 ? 's' : ''}`
}

function WaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function HistItem({ produto, at, action, isFav, onAction, onClose }: {
  produto: Produto
  at: number
  action: 'restaurar' | 'favoritar'
  isFav: boolean
  onAction: () => void
  onClose: () => void
}) {
  const img = produto.imagens?.[0] ?? null
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-[var(--surface-hover)]">
      <Link href={`/produto/${produto.id}`} onClick={onClose} className="shrink-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
          {img && <img src={img} alt={produto.nome} className="w-full h-full object-contain" />}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/produto/${produto.id}`} onClick={onClose} className="hover:underline">
          <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {produto.nome}
          </p>
        </Link>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{timeAgo(at)}</p>
      </div>

      <button
        onClick={onAction}
        disabled={isFav}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-default"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      >
        {isFav
          ? <Heart className="w-3.5 h-3.5" fill="currentColor" style={{ color: '#fb7185' }} />
          : <RotateCcw className="w-3.5 h-3.5" />}
        {isFav ? 'Salvo' : action === 'restaurar' ? 'Restaurar' : 'Favoritar'}
      </button>
    </div>
  )
}

export default function FavoritosClient({ todos }: { todos: Produto[] }) {
  const [favIds, setFavIds]           = useState<number[]>([])
  const [removidos, setRemovidosList] = useState<HistEntry[]>([])
  const [vistos, setVistos]           = useState<HistEntry[]>([])
  const [mounted, setMounted]         = useState(false)
  const [waHref, setWaHref]           = useState('')
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [closing, setClosing]         = useState(false)
  const [removingId, setRemovingId]   = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    setFavIds(getLS(LS_FAV, []))
    setRemovidosList(getLS(LS_REMOVIDOS, []))
    setVistos(getLS(LS_VISTOS, []))
  }, [])

  useEffect(() => {
    if (!mounted) return
    const produtos = todos.filter(p => favIds.includes(p.id))
    setWaHref(produtos.length ? buildWaHref(produtos, window.location.origin) : '')
  }, [favIds, mounted, todos])

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  function openDrawer()  { setClosing(false); setDrawerOpen(true) }
  function closeDrawer() {
    setClosing(true)
    setTimeout(() => { setDrawerOpen(false); setClosing(false) }, 300)
  }

  function remover(id: number) {
    setRemovingId(id)
    setTimeout(() => {
      const prev: HistEntry[] = getLS(LS_REMOVIDOS, [])
      const updated = [{ id, at: Date.now() }, ...prev.filter(e => e.id !== id)].slice(0, MAX_HIST)
      localStorage.setItem(LS_REMOVIDOS, JSON.stringify(updated))
      setRemovidosList(updated)

      const next = favIds.filter(f => f !== id)
      setFavIds(next)
      localStorage.setItem(LS_FAV, JSON.stringify(next))
      setRemovingId(null)
    }, 380)
  }

  function restaurar(id: number) {
    if (favIds.includes(id)) return
    const next = [...favIds, id]
    setFavIds(next)
    localStorage.setItem(LS_FAV, JSON.stringify(next))
    const updated = removidos.filter(e => e.id !== id)
    setRemovidosList(updated)
    localStorage.setItem(LS_REMOVIDOS, JSON.stringify(updated))
  }

  function favoritar(id: number) {
    if (favIds.includes(id)) return
    const next = [...favIds, id]
    setFavIds(next)
    localStorage.setItem(LS_FAV, JSON.stringify(next))
  }

  const produtos = todos.filter(p => favIds.includes(p.id))

  const histRemovidos = removidos
    .map(e => ({ ...e, produto: todos.find(p => p.id === e.id) }))
    .filter((e): e is typeof e & { produto: Produto } => !!e.produto)

  const histVistos = vistos
    .filter(e => !favIds.includes(e.id))
    .map(e => ({ ...e, produto: todos.find(p => p.id === e.id) }))
    .filter((e): e is typeof e & { produto: Produto } => !!e.produto)

  const totalHist = histRemovidos.length + histVistos.length

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display" style={{ color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 400 }}>Favoritos</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {mounted ? `${produtos.length} produto(s) salvos` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {mounted && totalHist > 0 && (
              <button
                onClick={openDrawer}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-80"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <History className="w-4 h-4" />
                Histórico
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text-primary)' }}>
                  {totalHist}
                </span>
              </button>
            )}

            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] shrink-0"
                style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 18px rgba(37,211,102,0.35)' }}
              >
                <WaIcon />
                Enviar lista pelo WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Empty state */}
        {mounted && produtos.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum produto favoritado ainda.</p>
          </div>
        )}

        {/* Favorites grid */}
        {produtos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {produtos.map((p, i) => {
              const isRemoving = removingId === p.id
              return (
                <div
                  key={p.id}
                  className={`relative ${isRemoving ? 'fav-removing' : 'animate-fade-up'}`}
                  style={isRemoving ? {} : { animationDelay: `${i * 0.04}s`, opacity: 0 }}
                >
                  <ProductCard produto={p} favorito onToggleFavorito={remover} />
                  <button
                    onClick={() => remover(p.id)}
                    title="Remover dos favoritos"
                    className="absolute top-2 left-2 z-30 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.6)', boxShadow: '0 1px 6px rgba(0,0,0,0.3)' }}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Drawer backdrop + panel */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className={closing ? 'hist-backdrop-close' : 'hist-backdrop'}
            onClick={closeDrawer}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Drawer panel */}
          <div
            className={closing ? 'hist-drawer-close' : 'hist-drawer'}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
              width: 'min(440px, 92vw)',
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-12px 0 48px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
              style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Histórico</span>
                <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                  {totalHist}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Removed section */}
            {histRemovidos.length > 0 && (
              <div>
                <p className="px-6 pt-5 pb-2 text-xs uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--text-secondary)' }}>
                  Removidos dos favoritos
                </p>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {histRemovidos.map(({ produto, at }) => (
                    <HistItem
                      key={produto.id}
                      produto={produto}
                      at={at}
                      action="restaurar"
                      isFav={favIds.includes(produto.id)}
                      onAction={() => restaurar(produto.id)}
                      onClose={closeDrawer}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Visited section */}
            {histVistos.length > 0 && (
              <div style={{ borderTop: histRemovidos.length ? '1px solid var(--border)' : undefined }}>
                <p className="px-6 pt-5 pb-2 text-xs uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--text-secondary)' }}>
                  Visitados recentemente
                </p>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {histVistos.map(({ produto, at }) => (
                    <HistItem
                      key={produto.id}
                      produto={produto}
                      at={at}
                      action="favoritar"
                      isFav={favIds.includes(produto.id)}
                      onAction={() => favoritar(produto.id)}
                      onClose={closeDrawer}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
