import { Produto, Catalogo } from './types'
import rawData from '../data/static-data.json'

type ProdutoFull = Produto & { catalogo_nome: string; catalogo_pasta: string }
type CatalogoFull = Catalogo & { total_produtos: number }

const data = rawData as { produtos: ProdutoFull[]; catalogos: CatalogoFull[] }

export function getProdutos(): ProdutoFull[] {
  return data.produtos
}

export function getProduto(id: number | string): ProdutoFull | null {
  return data.produtos.find(p => p.id === Number(id)) ?? null
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
