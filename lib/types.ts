export interface Catalogo {
  id: number
  nome: string
  pasta: string
  ano: number | null
  total_produtos: number
}

export interface Produto {
  id: number
  catalogo_id: number
  catalogo_nome: string
  codigo: string | null
  nome: string
  descricao: string | null
  material: string | null
  dimensoes: string | null
  acabamento: string | null
  cores: string | null
  preco_min: number | null
  preco_max: number | null
  pagina: number | null
  texto_livre: string | null
  imagens: string[]
}

export interface Favorito {
  id: number
  produto_id: number
  criado_em: string
  produto?: Produto
}
