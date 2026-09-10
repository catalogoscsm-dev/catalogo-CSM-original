import { getDb } from '@/lib/db'
import { Produto } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImageZoom from '@/components/ImageZoom'
import FavShare from './FavShare'
import FichaTecnica from '@/components/FichaTecnica'
import DimensoesDisplay from '@/components/DimensoesDisplay'
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

export async function generateStaticParams() {
  const db = getDb()
  const rows = db.prepare('SELECT id FROM produtos').all() as { id: number }[]
  return rows.map(r => ({ id: String(r.id) }))
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produto = getProduto(id)
  if (!produto) notFound()

  const isAdmin = false

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
    <div className="produto-fullbleed animate-fade-in">
      <div className="produto-grid">

        {/* ── Imagem (sticky no desktop, normal no mobile) ── */}
        <div className="produto-img-col">
          <ImageZoom
            src={produto.imagens[0] ?? null}
            alt={produto.nome}
            thumbnails={produto.imagens}
            fullHeight
          />
        </div>

        {/* ── Informações ── */}
        <div className="produto-info-col">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/" className="hover:underline hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}>
              Início
            </Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span style={{ color: 'var(--text-primary)' }}>{produto.nome}</span>
          </div>

          {/* Badge + Nome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {produto.descricao && produto.descricao.trim().length > 1 && (
              <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>
                {produto.descricao}
              </span>
            )}
            <h1 className="font-display" style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}>
              {produto.nome}
            </h1>
          </div>

          <FavShare produtoId={produto.id} />

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Ficha técnica + dimensões */}
          {(fichaPublica.length > 0 || temDimensoes || temAcabamento) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {fichaPublica.length > 0 && (
                <>
                  <h2 className="text-xs uppercase tracking-[0.2em] font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>
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
            <div className="rounded-xl p-5 space-y-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}>
                <ShieldCheck className="w-4 h-4" />
                Dados internos
              </div>
              {fichaInterna.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="text-xs w-36 shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {produto.texto_livre && (
            <div className="rounded-xl p-5 space-y-2"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="text-xs uppercase tracking-[0.2em] font-semibold"
                style={{ color: 'var(--text-secondary)' }}>
                Observações
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                {produto.texto_livre}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
