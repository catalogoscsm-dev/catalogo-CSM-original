'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Loader2, CheckCircle2, User, Phone } from 'lucide-react'
import { Produto } from '@/lib/types'
import { useAtendimento } from '@/lib/useAtendimento'
import { registrarLead, type LeadItem } from '@/lib/leads'

type Status = 'idle' | 'enviando' | 'sucesso' | 'erro'

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
  const { token, nome: nomeVendedor, carregando } = useAtendimento()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [honeypot, setHoneypot] = useState('') // campo "site" — invisível
  const [status, setStatus] = useState<Status>('idle')
  const [msgErro, setMsgErro] = useState('')

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

  const card: React.CSSProperties = {
    background: 'var(--a)',
    border: '1px solid var(--h)',
    borderRadius: '16px',
    padding: '20px 22px',
  }

  if (status === 'sucesso') {
    return (
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px' }}>
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
