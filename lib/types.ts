// Public product type — only user-visible fields, no supplier identifiers.
export interface Produto {
  id: number
  nome: string
  descricao: string | null
  material: string | null
  dimensoes: string | null
  acabamento: string | null
  cores: string | null
  texto_livre: string | null
  categoria: string | null
  imagens: string[]
}

export interface Favorito {
  id: number
  produto_id: number
  criado_em: string
  produto?: Produto
}
