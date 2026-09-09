import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageZoom from '@/components/ImageZoom'
import FavShare from './FavShare'
import { getSession } from '@/lib/auth'
import { ShieldCheck } from 'lucide-react'

type ProdutoRow = Produto & { imagens: string; catalogo_pasta: string }

function getProduto(id: string): (Produto & { catalogo_pasta: string }) | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome, c.pasta as catalogo_pasta
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE p.id = ?
  `).get(id) as ProdutoRow | null
  if (!row) return null
  return { ...row, imagens: JSON.parse(row.imagens ?? '[]') }
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = getProduto(id)
  if (!produto) notFound()

  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  const fichaPublica = [
    { label: 'Material', value: produto.material },
    { label: 'Dimensões', value: produto.dimensoes },
    { label: 'Acabamento', value: produto.acabamento },
    { label: 'Cores disponíveis', value: produto.cores },
  ].filter(c => c.value)

  const fichaInterna = [
    { label: 'Fornecedor', value: produto.catalogo_nome },
    { label: 'Código do produto', value: produto.codigo },
    { label: 'Página no catálogo', value: produto.pagina ? `Pág. ${produto.pagina}` : null },
  ].filter(c => c.value)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-400 hover:text-gray-600">Início</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{produto.nome}</span>
      </div>

      {/* Layout: imagem à esquerda, info à direita */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">

        <ImageZoom
          src={produto.imagens[0] ?? null}
          alt={produto.nome}
          thumbnails={produto.imagens}
        />

        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{produto.nome}</h1>

          <FavShare produtoId={produto.id} />

          {produto.descricao && (
            <p className="text-gray-600 text-sm leading-relaxed">{produto.descricao}</p>
          )}

          {/* Ficha técnica pública */}
          {fichaPublica.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Ficha Técnica
              </h2>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {fichaPublica.map(({ label, value }) => (
                    <tr key={label} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-4 text-gray-400 font-medium w-44 align-top">{label}</td>
                      <td className="py-3 text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bloco interno — visível apenas para admin */}
          {isAdmin && fichaInterna.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                Dados internos
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {fichaInterna.map(({ label, value }) => (
                    <tr key={label} className="border-b border-amber-100 last:border-0">
                      <td className="py-2.5 pr-4 text-amber-600 font-medium w-44">{label}</td>
                      <td className="py-2.5 text-amber-900 font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {produto.texto_livre && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Informações adicionais
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {produto.texto_livre}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
