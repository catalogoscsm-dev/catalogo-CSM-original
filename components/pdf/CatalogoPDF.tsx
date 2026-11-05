import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet,
} from '@react-pdf/renderer'

// Fontes built-in do @react-pdf/renderer (sem dependência externa):
// Display/títulos → Times-Roman / Times-Bold / Times-Italic
// Interface/labels → Helvetica / Helvetica-Bold

// ── Paleta CSM ───────────────────────────────────────────────────────────────
const C = {
  dark:    '#110D08',
  dark2:   '#1E1610',
  dark3:   '#271C13',
  cream:   '#FAF8F3',
  cream2:  '#F0EBE0',
  cream3:  '#E5DDD0',
  text:    '#1C1916',
  muted:   '#7A7470',
  gold:    '#8C6E18',
  gold2:   '#B8973A',
  gold3:   '#C4924A',
  border:  'rgba(0,0,0,0.08)',
  white:   '#FFFFFF',
}

// ── Dimensões A4 (pts) ────────────────────────────────────────────────────────
const A4W = 595.28
const A4H = 841.89

const s = StyleSheet.create({
  // Páginas
  pageCover: {
    width: A4W, height: A4H,
    backgroundColor: '#1A1816',
  },
  pageCoverContent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 90,
    paddingBottom: 50,
    paddingHorizontal: 60,
  },
  pageClient: {
    width: A4W, height: A4H,
    backgroundColor: C.cream,
    flexDirection: 'column',
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 70,
  },
  pageProduct: {
    width: A4W, height: A4H,
    backgroundColor: C.cream,
    flexDirection: 'column',
  },

  // Cover — logo
  coverLogo: { width: 220, height: 'auto', marginBottom: 24, objectFit: 'contain' },
  coverLogoPlaceholder: {
    width: 220, height: 60, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  coverLogoText: { fontFamily: 'Helvetica-Bold', fontSize: 26, color: C.cream, letterSpacing: 4 },
  coverLine: { width: '100%', height: 1, backgroundColor: C.gold2, marginBottom: 32 },
  coverTag: {
    fontFamily: 'Helvetica-Bold', fontSize: 7.5,
    color: C.gold2, letterSpacing: 3.5,
    textTransform: 'uppercase', marginBottom: 20,
  },
  // nome do cliente em destaque (quando há cliente)
  coverClientPara: {
    fontFamily: 'Helvetica', fontSize: 8,
    color: C.muted, letterSpacing: 2, marginBottom: 10,
    textTransform: 'uppercase',
  },
  coverClientName: {
    fontFamily: 'Times-Bold', fontSize: 30,
    color: C.cream, textAlign: 'center',
    letterSpacing: 0.5, lineHeight: 1.2, marginBottom: 6,
  },
  coverClientCompany: {
    fontFamily: 'Helvetica', fontSize: 10,
    color: C.muted, textAlign: 'center', letterSpacing: 0.5,
    marginBottom: 20,
  },
  // sem cliente: título editorial
  coverEditorial: {
    fontFamily: 'Times-Roman', fontSize: 26,
    color: C.cream, textAlign: 'center',
    letterSpacing: 2, marginBottom: 20,
  },
  // ornamento + contagem de produtos
  coverOrnSep: { width: 40, height: 1, backgroundColor: C.gold, marginBottom: 14 },
  coverCount: {
    fontFamily: 'Helvetica', fontSize: 8.5,
    color: C.muted, letterSpacing: 2,
    textTransform: 'uppercase',
  },
  coverCenter: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  coverDate: { fontFamily: 'Helvetica', fontSize: 9, color: C.muted, marginBottom: 24, letterSpacing: 0.5 },
  coverSellerBox: {
    width: '100%',
    borderTopWidth: 1, borderTopColor: C.gold,
    paddingTop: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  coverSellerLabel: { fontFamily: 'Helvetica', fontSize: 7, color: C.muted, letterSpacing: 1, marginBottom: 5 },
  coverSellerName: { fontFamily: 'Times-Bold', fontSize: 14, color: C.cream, marginBottom: 3 },
  coverSellerRole: { fontFamily: 'Helvetica', fontSize: 8, color: C.muted },
  coverSellerContact: { flexDirection: 'column', alignItems: 'flex-end', gap: 3 },
  coverContactLine: { fontFamily: 'Helvetica', fontSize: 9, color: C.gold2 },

  // Client page
  clientAccent: {
    position: 'absolute', top: 0, left: 0,
    width: 5, height: A4H, backgroundColor: C.gold2,
  },
  clientLabel: { fontFamily: 'Helvetica', fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10 },
  clientName: { fontFamily: 'Times-Bold', fontSize: 34, color: C.text, marginBottom: 8 },
  clientCompany: { fontFamily: 'Helvetica', fontSize: 13, color: C.muted, marginBottom: 32 },
  clientSep: { width: 60, height: 1.5, backgroundColor: C.gold2, marginBottom: 32 },
  clientGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  clientField: { flexDirection: 'column', minWidth: 180 },
  clientFieldLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.gold, letterSpacing: 1.5, marginBottom: 4 },
  clientFieldValue: { fontFamily: 'Helvetica', fontSize: 11, color: C.text },
  clientNotes: { marginTop: 32, flexDirection: 'column' },
  clientNotesLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.gold, letterSpacing: 1.5, marginBottom: 8 },
  clientNotesText: { fontFamily: 'Helvetica', fontSize: 10, color: C.muted, lineHeight: 1.6 },
  clientPageNum: { position: 'absolute', bottom: 30, right: 60, fontFamily: 'Helvetica', fontSize: 8, color: C.muted },
  clientPageLabel: { position: 'absolute', bottom: 30, left: 70, fontFamily: 'Helvetica', fontSize: 8, color: C.muted, letterSpacing: 1 },

  // Product page — 1 imagem
  productImageZone: {
    width: '100%', height: 380,
    backgroundColor: C.cream,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 48, paddingTop: 28, paddingBottom: 16,
  },
  productImage: { maxWidth: '100%', maxHeight: 320, objectFit: 'contain' },

  // Product page — 2 imagens (lado a lado)
  productImageDual: {
    flexDirection: 'row', width: '100%', height: 320,
    backgroundColor: C.cream,
  },
  productImageSide: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 18,
  },
  productImageSideRight: {
    borderLeftWidth: 1, borderLeftColor: C.cream3,
  },
  productImageDualImg: { maxWidth: '100%', maxHeight: 280, objectFit: 'contain' },

  productGoldLine: { width: A4W, height: 1.5, backgroundColor: C.gold2 },
  productInfoZone: {
    flex: 1,
    paddingHorizontal: 48, paddingTop: 18, paddingBottom: 48,
    flexDirection: 'column',
  },
  productTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  productName: { fontFamily: 'Times-Bold', fontSize: 22, color: C.text, flex: 1, marginRight: 12 },
  productCatalogBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    backgroundColor: C.cream3, borderRadius: 4,
  },
  productCatalogText: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.muted, letterSpacing: 0.5 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginBottom: 10 },
  productFieldWrap: { width: '50%', paddingRight: 12, marginBottom: 9 },
  productFieldLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.gold, letterSpacing: 1.5, marginBottom: 3 },
  productFieldValue: { fontFamily: 'Helvetica', fontSize: 9.5, color: C.text, lineHeight: 1.4 },
  productDescLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: C.gold, letterSpacing: 1.5, marginBottom: 4 },
  productDesc: { fontFamily: 'Helvetica', fontSize: 9, color: C.muted, lineHeight: 1.6, marginBottom: 10 },

  // Condições comerciais (bloco no fundo da info zone)
  condicoesBox: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.cream3,
    flexDirection: 'row', flexWrap: 'wrap', gap: 0,
  },
  condicoesLabel: { fontFamily: 'Helvetica-Bold', fontSize: 6.5, color: C.gold, letterSpacing: 1.5, marginBottom: 3 },
  condicoesValue: { fontFamily: 'Helvetica', fontSize: 9, color: C.text },
  condicoesField: { width: '33.33%', paddingRight: 10 },

  productFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 32,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 48,
    borderTopWidth: 1, borderTopColor: C.cream3,
  },
  footerLeft: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.muted, letterSpacing: 1 },
  footerRight: { fontFamily: 'Helvetica', fontSize: 7.5, color: C.muted },
  footerPageNum: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: C.gold },
})

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PDFVendedor {
  nome: string
  cargo?: string
  telefone?: string
  email?: string
}

export interface PDFCliente {
  nome: string
  empresa?: string
  telefone?: string
  email?: string
  notas?: string
}

export interface PDFCondicoes {
  preco?: string
  pagamento?: string
  prazo?: string
}

interface ProdutoPDF {
  id: number
  nome: string
  catalogo_nome?: string
  dimensoes?: string | null
  material?: string | null
  acabamento?: string | null
  cores?: string | null
  codigo?: string | null
  texto_livre?: string | null   // campo correto para descrição livre
  preco_min?: number | null
  preco_max?: number | null
  imgB64?: string | null
  img2B64?: string | null       // segunda foto (ambient/detalhe)
}

interface Props {
  produtos: ProdutoPDF[]
  vendedor: PDFVendedor
  cliente?: PDFCliente | null
  condicoes?: PDFCondicoes | null
  logo?: string | null
  data: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPreco(min: number | null | undefined, max: number | null | undefined): string | null {
  if (!min && !max) return null
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`
  return fmt(min ?? max!)
}

// Material com 1 letra (ex: "P","G","M") são códigos de tamanho — ocultar
function materialValido(v: string | null | undefined): string | null {
  if (!v) return null
  const limpo = v.trim()
  if (/^[A-Za-z]$/.test(limpo)) return null   // letra única = código de tamanho
  return limpo
}

function ProdutoPage({ p, index, total, vendedor, condicoes }: {
  p: ProdutoPDF
  index: number
  total: number
  vendedor: PDFVendedor
  condicoes?: PDFCondicoes | null
}) {
  const temImg2 = !!p.img2B64
  const pageNum = index + 1

  const precoStr = condicoes?.preco || formatPreco(p.preco_min, p.preco_max)

  const campos: { label: string; value: string | null }[] = [
    { label: 'DIMENSÕES',  value: p.dimensoes ?? null },
    { label: 'MATERIAL',   value: materialValido(p.material) },
    { label: 'ACABAMENTO', value: p.acabamento ?? null },
    { label: 'CORES',      value: p.cores ?? null },
    { label: 'CÓDIGO',     value: p.codigo ?? null },
  ].filter((c): c is { label: string; value: string } => !!c.value)

  const temCondicoes = !!(precoStr || condicoes?.pagamento || condicoes?.prazo)

  return (
    <Page size="A4" style={s.pageProduct}>

      {/* ── Zona de imagens ── */}
      {temImg2 ? (
        <View style={s.productImageDual}>
          <View style={s.productImageSide}>
            {p.imgB64
              ? <Image src={p.imgB64} style={s.productImageDualImg} />
              : <View style={{ width: 180, height: 180, backgroundColor: C.cream3 }} />}
          </View>
          <View style={[s.productImageSide, s.productImageSideRight]}>
            <Image src={p.img2B64!} style={s.productImageDualImg} />
          </View>
        </View>
      ) : (
        <View style={s.productImageZone}>
          {p.imgB64
            ? <Image src={p.imgB64} style={s.productImage} />
            : <View style={{ width: 180, height: 180, backgroundColor: C.cream3, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: C.muted }}>Sem imagem</Text>
              </View>}
        </View>
      )}

      {/* Linha dourada */}
      <View style={s.productGoldLine} />

      {/* ── Zona de informação ── */}
      <View style={s.productInfoZone}>

        {/* Nome + catálogo */}
        <View style={s.productTopRow}>
          <Text style={s.productName}>{p.nome}</Text>
          {p.catalogo_nome && (
            <View style={s.productCatalogBadge}>
              <Text style={s.productCatalogText}>{p.catalogo_nome}</Text>
            </View>
          )}
        </View>

        {/* Campos técnicos */}
        {campos.length > 0 && (
          <View style={s.productGrid}>
            {campos.map(c => (
              <View key={c.label} style={s.productFieldWrap}>
                <Text style={s.productFieldLabel}>{c.label}</Text>
                <Text style={s.productFieldValue}>{c.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Descrição livre (texto_livre) — oculta se vazia */}
        {!!p.texto_livre?.trim() && (
          <View style={{ marginBottom: 10 }}>
            <Text style={s.productDescLabel}>DESCRIÇÃO</Text>
            <Text style={s.productDesc}>{p.texto_livre.trim()}</Text>
          </View>
        )}

        {/* Condições comerciais — ocultas se todas vazias */}
        {temCondicoes && (
          <View style={s.condicoesBox}>
            {precoStr && (
              <View style={s.condicoesField}>
                <Text style={s.condicoesLabel}>PREÇO</Text>
                <Text style={s.condicoesValue}>{precoStr}</Text>
              </View>
            )}
            {condicoes?.pagamento && (
              <View style={s.condicoesField}>
                <Text style={s.condicoesLabel}>PAGAMENTO</Text>
                <Text style={s.condicoesValue}>{condicoes.pagamento}</Text>
              </View>
            )}
            {condicoes?.prazo && (
              <View style={s.condicoesField}>
                <Text style={s.condicoesLabel}>PRAZO DE ENTREGA</Text>
                <Text style={s.condicoesValue}>{condicoes.prazo}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Rodapé */}
      <View style={s.productFooter}>
        <Text style={s.footerLeft}>CATÁLOGO CSM</Text>
        <Text style={s.footerRight}>
          {vendedor.nome}{vendedor.telefone ? `  ·  ${vendedor.telefone}` : ''}
          {'    '}
          <Text style={s.footerPageNum}>{pageNum}/{total}</Text>
        </Text>
      </View>
    </Page>
  )
}

// ── Documento ─────────────────────────────────────────────────────────────────
export default function CatalogoPDF({ produtos, vendedor, cliente, condicoes, logo, data }: Props) {
  const total = produtos.length

  return (
    <Document
      title="Seleção de Produtos — Catálogo CSM"
      author={vendedor.nome}
      creator="Catálogo CSM"
    >
      {/* ── CAPA ── */}
      <Page size="A4" style={s.pageCover}>
        {/* Conteúdo da capa */}
        <View style={s.pageCoverContent}>
          {/* Logo */}
          {logo ? (
            <Image src={logo} style={s.coverLogo} />
          ) : (
            <View style={s.coverLogoPlaceholder}>
              <Text style={s.coverLogoText}>CSM</Text>
            </View>
          )}

          {/* Linha dourada */}
          <View style={s.coverLine} />

          {/* Centro */}
          <View style={s.coverCenter}>
            <Text style={s.coverTag}>Seleção de Produtos</Text>

            {cliente?.nome ? (
              <>
                <Text style={s.coverClientPara}>Para</Text>
                <Text style={s.coverClientName}>{cliente.nome}</Text>
                {cliente.empresa && (
                  <Text style={s.coverClientCompany}>{cliente.empresa}</Text>
                )}
              </>
            ) : (
              <Text style={s.coverEditorial}>Proposta Exclusiva</Text>
            )}

            <View style={s.coverOrnSep} />
            <Text style={s.coverCount}>
              {String(total).padStart(2, '0')} {total === 1 ? 'produto selecionado' : 'produtos selecionados'}
            </Text>
          </View>

          {/* Data */}
          <Text style={s.coverDate}>{data}</Text>

          {/* Vendedor */}
          <View style={s.coverSellerBox}>
            <View>
              <Text style={s.coverSellerLabel}>PREPARADO POR</Text>
              <Text style={s.coverSellerName}>{vendedor.nome}</Text>
              {vendedor.cargo && <Text style={s.coverSellerRole}>{vendedor.cargo}</Text>}
            </View>
            <View style={s.coverSellerContact}>
              {vendedor.telefone && <Text style={s.coverContactLine}>{vendedor.telefone}</Text>}
              {vendedor.email    && <Text style={s.coverContactLine}>{vendedor.email}</Text>}
            </View>
          </View>
        </View>
      </Page>

      {/* ── FICHA DO CLIENTE (opcional) ── */}
      {cliente?.nome && (
        <Page size="A4" style={s.pageClient}>
          <View style={s.clientAccent} />

          <Text style={s.clientLabel}>PROPOSTA PARA</Text>
          <Text style={s.clientName}>{cliente.nome}</Text>
          {cliente.empresa && <Text style={s.clientCompany}>{cliente.empresa}</Text>}
          <View style={s.clientSep} />

          <View style={s.clientGrid}>
            {cliente.telefone && (
              <View style={s.clientField}>
                <Text style={s.clientFieldLabel}>TELEFONE</Text>
                <Text style={s.clientFieldValue}>{cliente.telefone}</Text>
              </View>
            )}
            {cliente.email && (
              <View style={s.clientField}>
                <Text style={s.clientFieldLabel}>E-MAIL</Text>
                <Text style={s.clientFieldValue}>{cliente.email}</Text>
              </View>
            )}
            <View style={s.clientField}>
              <Text style={s.clientFieldLabel}>DATA</Text>
              <Text style={s.clientFieldValue}>{data}</Text>
            </View>
            <View style={s.clientField}>
              <Text style={s.clientFieldLabel}>VENDEDOR RESPONSÁVEL</Text>
              <Text style={s.clientFieldValue}>{vendedor.nome}</Text>
            </View>
          </View>

          {cliente.notas && (
            <View style={s.clientNotes}>
              <Text style={s.clientNotesLabel}>OBSERVAÇÕES</Text>
              <Text style={s.clientNotesText}>{cliente.notas}</Text>
            </View>
          )}

          <Text style={s.clientPageLabel}>CATÁLOGO CSM</Text>
          <Text style={s.clientPageNum}>—</Text>
        </Page>
      )}

      {/* ── PRODUTOS ── */}
      {produtos.map((p, i) => (
        <ProdutoPage key={p.id} p={p} index={i} total={total} vendedor={vendedor} condicoes={condicoes} />
      ))}
    </Document>
  )
}
