import { requireAdmin } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import ImageZoom from '@/components/ImageZoom'

type ProdutoRow = Produto & { imagens: string; catalogo_pasta: string }

function getProduto(id: string): (Produto & { catalogo_pasta: string }) | null {
  const db = getDb()
  const row = db.prepare(`
    SELECT p.*, c.nome as catalogo_nome, c.pasta as catalogo_pasta, c.ano as catalogo_ano
    FROM produtos p
    JOIN catalogos c ON p.catalogo_id = c.id
    WHERE p.id = ?
  `).get(id) as ProdutoRow | null
  if (!row) return null
  return { ...row, imagens: JSON.parse(row.imagens ?? '[]') }
}

export async function generateStaticParams() { return [{ id: '0' }] }

export default async function AdminProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin().catch(() => null)
  if (!session) redirect('/admin/login')

  const { id } = await params
  const produto = getProduto(id)
  if (!produto) notFound()

  const fichaPublica = [
    { label: 'Material', value: produto.material },
    { label: 'Dimensões', value: produto.dimensoes },
    { label: 'Acabamento', value: produto.acabamento },
    { label: 'Cores disponíveis', value: produto.cores },
  ].filter(c => c.value)

  const fichaInterna = [
    { label: 'Fornecedor', value: produto.catalogo_nome },
    { label: 'Catálogo (pasta)', value: produto.catalogo_pasta },
    { label: 'Código do produto', value: produto.codigo },
    { label: 'Página no catálogo', value: produto.pagina ? `Pág. ${produto.pagina}` : null },
  ].filter(c => c.value)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link
            href={`/admin/catalogo/${encodeURIComponent(produto.catalogo_pasta)}`}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-gray-900 truncate">{produto.nome}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">interno</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Imagem com zoom */}
          <ImageZoom
            src={produto.imagens[0] ?? null}
            alt={produto.nome}
            thumbnails={produto.imagens}
          />

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{produto.nome}</h1>
              {produto.descricao && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{produto.descricao}</p>
              )}
            </div>

            {/* Ficha interna — dados confidenciais */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                Dados internos (não visíveis ao público)
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

            {/* Ficha pública */}
            {fichaPublica.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                  Ficha Técnica (pública)
                </h2>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {fichaPublica.map(({ label, value }) => (
                      <tr key={label} className="border-b border-gray-100 last:border-0">
                        <td className="py-2.5 pr-4 text-gray-400 font-medium w-44">{label}</td>
                        <td className="py-2.5 text-gray-800">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {produto.texto_livre && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Observações
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {produto.texto_livre}
                </p>
              </div>
            )}

            <Link
              href={`/produto/${produto.id}`}
              className="inline-block text-xs text-blue-500 hover:underline"
              target="_blank"
            >
              Ver versão pública deste produto →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
