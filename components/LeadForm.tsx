'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Loader2, CheckCircle2, User, Phone } from 'lucide-react'
import { Produto } from '@/lib/types'
import { useAtendimento } from '@/lib/useAtendimento'
import { registrarLead, WHATSAPP_RECEPCAO, type LeadItem } from '@/lib/leads'

type Status = 'idle' | 'enviando' | 'sucesso' | 'erro'
type StatusPdf = 'idle' | 'gerando' | 'erro'

const PDF_ATIVO = process.env.NEXT_PUBLIC_PROPOSTA_PDF === '1'

function imagemParaPdf(basePath: string, imagem: string): string {
  const prefixado = imagem.startsWith(basePath) ? imagem : `${basePath}${imagem}`
  return prefixado.startsWith('/') ? prefixado : `/${prefixado}`
}

function formatarTelefoneVendedor(whatsapp: string): string {
  // "5519992936703" → "(19) 99293-6703"
  const d = whatsapp.replace(/\D/g, '')
  const local = d.startsWith('55') ? d.slice(2) : d
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  return local
}

function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d.length ? `(${d}` : ''
  if (d.length <= 7)  return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

/**
 * Formulário de envio da seleção de favoritos ao vendedor.
 * Só aparece quando há um token de vendedor válido (nome resolvido via RPC).
 * Monta os itens com dados exclusivamente públicos: produto_id, nome e url relativa.
 */
export default function LeadForm({ produtos }: { produtos: Produto[] }) {
  const { token, nome: nomeVendedor, whatsapp, carregando } = useAtendimento()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [honeypot, setHoneypot] = useState('') // campo "site" — invisível
  const [status, setStatus] = useState<Status>('idle')
  const [msgErro, setMsgErro] = useState('')
  const [statusPdf, setStatusPdf] = useState<StatusPdf>('idle')

  // Sem token válido → não exibe formulário de envio.
  if (carregando || !token || !nomeVendedor) return null

  const podeEnviar =
    nome.trim().length > 0 &&
    telefone.replace(/\D/g, '').length >= 10 &&
    consentimento &&
    status !== 'enviando'

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!podeEnviar || !token) return
    setStatus('enviando')
    setMsgErro('')

    const itens: LeadItem[] = produtos.map(p => ({
      produto_id: p.id,
      nome: p.nome,
      url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/produto/${p.id}`,
    }))

    const r = await registrarLead({
      token,
      nome: nome.trim(),
      telefone: telefone.trim(),
      consentimento,
      itens,
      honeypot,
    })

    if (r.ok) {
      setStatus('sucesso')
    } else {
      setStatus('erro')
      setMsgErro(
        r.motivo === 'limite'
          ? 'Muitas tentativas, tente mais tarde'
          : 'Não foi possível enviar',
      )
    }
  }

  async function gerarPdf() {
    if (statusPdf === 'gerando') return
    setStatusPdf('gerando')
    try {
      const { gerarPropostaPdf } = await import('@/lib/proposta-pdf')
      const { produtoParaPdf, carregarAssets, entregarPdf } = await import('@/lib/proposta-browser')

      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/catalogo-CSM-original'
      const isVendedorProprio = whatsapp !== WHATSAPP_RECEPCAO
      const vendedor = {
        nome: nomeVendedor!,
        telefone: isVendedorProprio ? formatarTelefoneVendedor(whatsapp) : undefined,
        whatsapp: isVendedorProprio ? whatsapp : undefined,
      }

      const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

      const prods = await Promise.all(
        produtos.map(p => produtoParaPdf({
          nome: p.nome,
          dimensoes: p.dimensoes ?? undefined,
          material: p.material ?? undefined,
          descricao: p.descricao ?? undefined,
          linha: p.texto_livre ?? undefined,
        }, p.imagens[0] ? imagemParaPdf(basePath, p.imagens[0]) : undefined))
      )

      const assets = await carregarAssets(`${basePath}/proposta`)

      const dados = {
        tipo: 'selecao' as const,
        vendedor,
        cliente: {
          nome: nome.trim() || undefined,
          telefone: telefone.trim() || undefined,
        },
        produtos: prods,
        data: hoje,
        assets,
      }

      const { pdf } = await gerarPropostaPdf(dados)
      await entregarPdf(pdf, 'selecao-csm.pdf')
      setStatusPdf('idle')
    } catch {
      setStatusPdf('erro')
    }
  }

  const card: React.CSSProperties = {
    background: 'var(--a)',
    border: '1px solid var(--h)',
    borderRadius: '16px',
    padding: '20px 22px',
  }

  if (status === 'sucesso') {
    const linhasMsg = [
      nomeVendedor ? `Olá, ${nomeVendedor}!` : 'Olá!',
      nome.trim() ? `Me chamo ${nome.trim()}.` : null,
      'Acabei de enviar minha seleção pelo Catálogo Digital CSM.',
      produtos.length > 0
        ? `Produtos escolhidos: ${produtos.map(p => p.nome).join(', ')}.`
        : null,
    ].filter((l): l is string => l !== null).join('\n')

    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <CheckCircle2 size={22} style={{ color: '#22c55e', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--f)' }}>
              Pronto! Seu vendedor vai entrar em contato
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--g)' }}>
              Atendimento: {nomeVendedor}
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(linhasMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '12px', borderRadius: '12px',
            background: '#25D366', color: '#fff',
            fontSize: '14px', fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 18px rgba(37,211,102,0.35)',
            boxSizing: 'border-box',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Continuar no WhatsApp
        </a>

        {PDF_ATIVO && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={gerarPdf}
              disabled={statusPdf === 'gerando'}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--h)',
                cursor: statusPdf === 'gerando' ? 'not-allowed' : 'pointer',
                background: 'var(--c)', color: 'var(--f)',
                fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxSizing: 'border-box',
              }}
            >
              {statusPdf === 'gerando' ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Gerando...
                </>
              ) : (
                'Baixar minha seleção (PDF)'
              )}
            </button>
            {statusPdf === 'erro' && (
              <p style={{ margin: 0, fontSize: '12px', color: '#fb7185', textAlign: 'center' }}>
                Não foi possível gerar o PDF. Tente novamente.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    background: 'var(--c)', border: '1px solid var(--h)',
    borderRadius: '10px', color: 'var(--f)', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--g)',
    display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px',
  }

  return (
    <form onSubmit={enviar} style={card}>
      <h2 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 600, color: 'var(--f)' }}>
        Enviar minha seleção ao vendedor
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--g)' }}>
        {produtos.length} produto{produtos.length !== 1 ? 's' : ''} · Atendimento: {nomeVendedor}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle} htmlFor="lead-nome">
            <User size={14} /> Nome
          </label>
          <input
            id="lead-nome"
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="lead-tel">
            <Phone size={14} /> Telefone
          </label>
          <input
            id="lead-tel"
            type="tel"
            inputMode="tel"
            value={telefone}
            onChange={e => setTelefone(maskPhone(e.target.value))}
            placeholder="(19) 99999-0000"
            style={inputStyle}
          />
        </div>

        {/* Honeypot — invisível para humanos, preenchido por bots */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          <label htmlFor="site">Site</label>
          <input
            id="site"
            name="site"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--g)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={consentimento}
            onChange={e => setConsentimento(e.target.checked)}
            style={{ marginTop: '2px', flexShrink: 0 }}
          />
          <span>
            Autorizo o contato da CSM Decor sobre estes produtos
            {' · '}
            <Link href="/privacidade" style={{ color: 'var(--accent, #B8973A)', textDecoration: 'underline' }}>
              Privacidade
            </Link>
          </span>
        </label>

        {status === 'erro' && (
          <p style={{ margin: 0, fontSize: '13px', color: '#fb7185', fontWeight: 500 }}>
            {msgErro}
          </p>
        )}

        <button
          type="submit"
          disabled={!podeEnviar}
          style={{
            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
            cursor: podeEnviar ? 'pointer' : 'not-allowed',
            background: podeEnviar ? 'linear-gradient(135deg, #8C6E18, #B8973A)' : 'var(--c)',
            color: podeEnviar ? '#fff' : 'var(--g)',
            fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: podeEnviar ? '0 4px 18px rgba(140,110,24,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {status === 'enviando'
            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={16} />}
          {status === 'enviando' ? 'Enviando...' : 'Enviar minha seleção ao vendedor'}
        </button>
      </div>
    </form>
  )
}
