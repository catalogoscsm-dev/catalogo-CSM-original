import { Produto, Catalogo } from './types'
import rawData from '../data/static-data.json'

type ProdutoFull = Produto & { catalogo_nome: string; catalogo_pasta: string }
type CatalogoFull = Catalogo & { total_produtos: number }

const data = rawData as { produtos: ProdutoFull[]; catalogos: CatalogoFull[] }
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function withBase(p: ProdutoFull): ProdutoFull {
  if (!BASE || !p.imagens?.length) return p
  return { ...p, imagens: p.imagens.map(img => `${BASE}${img}`) }
}

export function getProdutos(): ProdutoFull[] {
  const all = data.produtos.map(withBase)
  return [...all.filter(p => p.catalogo_pasta === 'Aco Mobilia 2025-7'), ...all.filter(p => p.catalogo_pasta !== 'Aco Mobilia 2025-7')]
}

export function getProduto(id: number | string): ProdutoFull | null {
  const p = data.produtos.find(p => p.id === Number(id))
  return p ? withBase(p) : null
}

export function getCatalogos(): CatalogoFull[] {
  return data.catalogos
}

export function getCatalogoPorPasta(pasta: string): CatalogoFull | null {
  return data.catalogos.find(c => c.pasta === pasta) ?? null
}

export function getProdutosPorCatalogo(pasta: string): ProdutoFull[] {
  return data.produtos.filter(p => p.catalogo_pasta === pasta)
}
