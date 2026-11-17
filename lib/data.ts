import { Produto, Catalogo } from './types'
import rawData from '../data/static-data.json'

type CatalogoFull = Catalogo & { total_produtos: number }

const data = rawData as { produtos: Produto[]; catalogos: CatalogoFull[] }
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

export function getCatalogos(): CatalogoFull[] {
  return data.catalogos
}

export function getCatalogoPorPasta(pasta: string): CatalogoFull | null {
  return data.catalogos.find(c => c.pasta === pasta) ?? null
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
