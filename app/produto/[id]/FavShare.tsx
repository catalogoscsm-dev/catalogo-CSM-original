'use client'

import { Heart, Share2 } from 'lucide-react'
import { useState, useEffect } from 'react'

const WA_PHONE = '5519990034068'

const LS_KEY = 'csm_favoritos'

function getFavs(): number[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function saveFavs(ids: number[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids))
}

export default function FavShare({ produtoId, nomeProduto }: { produtoId: number; nomeProduto: string }) {
  const [isFav, setIsFav]         = useState(false)
  const [animating, setAnimating] = useState(false)
  const [copied, setCopied]       = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [waHref, setWaHref]       = useState('')

  useEffect(() => {
    setMounted(true)
    setIsFav(getFavs().includes(produtoId))
    const msg = encodeURIComponent(
      `Olá! 👋 Encontrei este produto no Catálogo CSM e tenho muito interesse:\n\n` +
      `✨ *${nomeProduto}*\n\n` +
      `🔗 ${window.location.href}\n\n` +
      `Podem me dar mais informações? Adoraria saber mais detalhes sobre ele! 😊`
    )
    setWaHref(`https://wa.me/${WA_PHONE}?text=${msg}`)
  }, [produtoId, nomeProduto])

  function toggleFav() {
    const favs = getFavs()
    const next = isFav ? favs.filter(id => id !== produtoId) : [...favs, produtoId]
    saveFavs(next)
    setIsFav(!isFav)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)
  }

  async function compartilhar() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        @keyframes heartPop {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.5); }
          65%  { transform: scale(0.88); }
          85%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes heartGlow {
          0%   { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0.5); }
          50%  { box-shadow: 0 0 0 10px rgba(251, 113, 133, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 113, 133, 0); }
        }
        .heart-pop  { animation: heartPop 0.55s cubic-bezier(.36,.07,.19,.97) forwards; }
        .heart-glow { animation: heartGlow 0.6s ease-out forwards; }
      `}</style>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={toggleFav}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${animating ? 'heart-glow' : ''}`}
          style={{
            background: isFav ? 'rgba(251,113,133,0.12)' : 'var(--surface)',
            border: `1px solid ${isFav ? 'rgba(251,113,133,0.45)' : 'var(--border)'}`,
            color: isFav ? '#fb7185' : 'var(--text-secondary)',
            boxShadow: isFav ? '0 0 16px rgba(251,113,133,0.12)' : 'none',
          }}
        >
          <span className={animating ? 'heart-pop' : ''} style={{ display: 'flex' }}>
            <Heart className="w-4 h-4 transition-all duration-300" fill={isFav ? 'currentColor' : 'none'} />
          </span>
          {isFav ? 'Salvo' : 'Favoritar'}
        </button>

        <button
          onClick={compartilhar}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-75 active:scale-95"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <Share2 className="w-4 h-4" />
          {copied ? 'Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 18px rgba(37,211,102,0.35)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Tenho interesse neste produto
        </a>
      )}
    </>
  )
}
