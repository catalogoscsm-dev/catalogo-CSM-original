import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageZoom from '@/components/ImageZoom'
import FavShare from './FavShare'
import FichaTecnica from '@/components/FichaTecnica'
import DimensoesDisplay from '@/components/DimensoesDisplay'
import { getSession } from '@/lib/auth'
import { ShieldCheck, ChevronRight } from 'lucide-react'

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
  ].filter(c => c.value && c.value.trim().length > 1)

  const temDimensoes = produto.dimensoes && produto.dimensoes.trim().length > 1
  const temAcabamento = produto.acabamento && produto.acabamento.trim().length > 1

  const fichaInterna = [
    { label: 'Fornecedor', value: produto.catalogo_nome },
    { label: 'Código do produto', value: produto.codigo },
    { label: 'Página no catálogo', value: produto.pagina ? `Pág. ${produto.pagina}` : null },
  ].filter(c => c.value)

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
        <Link href="/" className="hover:underline transition-colors" style={{ color: 'var(--bronze)' }}>Início</Link>
        <ChevronRight className="w-3 h-3" />
        <span style={{ color: 'var(--charcoal)' }}>{produto.nome}</span>
      </div>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">

        {/* Coluna esquerda — zoom */}
        <div className="animate-fade-up">
          <ImageZoom
            src={produto.imagens[0] ?? null}
            alt={produto.nome}
            thumbnails={produto.imagens}
          />
        </div>

        {/* Coluna direita */}
        <div className="space-y-8 animate-fade-up delay-200">

          {/* Badge categoria + Nome */}
          <div className="space-y-3">
            {produto.descricao && produto.descricao.trim().length > 1 && (
              <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: 'rgba(140,110,24,0.1)', color: 'var(--bronze)' }}>
                {produto.descricao}
              </span>
            )}
            <h1 className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: 'var(--charcoal)' }}>
              {produto.nome}
            </h1>
          </div>

          <FavShare produtoId={produto.id} />

          {/* Divisor dourado */}
          <div className="h-px" style={{ background: 'linear-gradient(90deg, var(--bronze-pale), transparent)' }} />

          {/* Ficha Técnica */}
          {(fichaPublica.length > 0 || temDimensoes || temAcabamento) && (
            <div className="space-y-6">
              {fichaPublica.length > 0 && (
                <>
                  <h2 className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: 'var(--muted)' }}>
                    Ficha Técnica
                  </h2>
                  <FichaTecnica items={fichaPublica as { label: string; value: string }[]} />
                </>
              )}

              <DimensoesDisplay
                raw={temDimensoes ? produto.dimensoes : null}
                acabamento={temAcabamento ? produto.acabamento : null}
              />
            </div>
          )}

          {/* Dados internos admin */}
          {isAdmin && fichaInterna.length > 0 && (
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: 'linear-gradient(135deg, rgba(184,151,58,0.08), rgba(212,184,106,0.10))',
                border: '1px solid rgba(184,151,58,0.25)' }}>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--bronze)' }}>
                <ShieldCheck className="w-4 h-4" />
                Dados internos
              </div>
              {fichaInterna.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-xs w-36 shrink-0" style={{ color: 'var(--bronze-light)' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {produto.texto_livre && (
            <div className="rounded-2xl p-5 space-y-2"
              style={{ background: 'rgba(247,244,240,0.8)', border: '1px solid var(--border)' }}>
              <h2 className="text-xs uppercase tracking-[0.25em] font-medium" style={{ color: 'var(--muted)' }}>
                Observações
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--charcoal)' }}>
                {produto.texto_livre}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
