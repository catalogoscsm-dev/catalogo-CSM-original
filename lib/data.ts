import { Produto } from './types'
import rawData from '../data/static-data.json'

const data = rawData as { produtos: Produto[] }
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function withBase(p: Produto): Produto {
  if (!BASE || !p.imagens?.length) return p
  return { ...p, imagens: p.imagens.map(img => `${BASE}${img}`) }
}

export function getProdutos(): Produto[] {
  // TODO: restore Aprimore/ALUMINAS pinning once catalogo_id is available via Supabase
  return data.produtos.filter(p => p.imagens.length > 0).map(withBase)
}

export function getProduto(id: number | string): Produto | null {
  const p = data.produtos.find(p => p.id === Number(id))
  return p ? withBase(p) : null
}

export function getDestaques(): Produto[] {
  const comImagem = data.produtos
    .filter(p => p.imagens && p.imagens.length > 0)
    .map(withBase)
  const selecionados: Produto[] = []
  for (let i = 0; i < comImagem.length; i += 4) {
    selecionados.push(comImagem[i])
    if (selecionados.length >= 16) break
  }
  return selecionados
}
