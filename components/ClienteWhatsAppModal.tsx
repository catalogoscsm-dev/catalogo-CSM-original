'use client'

import { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, User, Phone, Building2, Mail, StickyNote, Loader2 } from 'lucide-react'
import { Produto } from '@/lib/types'
import { type Vendedora, WHATSAPP_PADRAO } from '@/lib/vendedores'

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK ?? ''

interface Props {
  produtos: Produto[]
  vendedora: Vendedora | null
  onClose: () => void
}

interface ClienteForm {
  nome: string
  telefone: string
  empresa: string
  email: string
  observacoes: string
}

const VAZIO: ClienteForm = { nome: '', telefone: '', empresa: '', email: '', observacoes: '' }

function buildWaMsg(produtos: Produto[], cliente: ClienteForm, vendedora: Vendedora | null, origin: string) {
  const lista = produtos
    .map((p, i) => `${i + 1}. *${p.nome}*\n   🔗 ${origin}/produto/${p.id}`)
    .join('\n\n')
  const saudacao = vendedora ? `Olá, ${vendedora.nome}!` : 'Olá!'
  return (
    `${saudacao} 👋 Me chamo *${cliente.nome}*` +
    (cliente.telefone ? ` — fone: ${cliente.telefone}` : '') +
    (cliente.empresa  ? ` | ${cliente.empresa}` : '') +
    `.\n\n` +
    `Selecionei ${produtos.length} produto(s) no Catálogo CSM:\n\n` +
    `${lista}\n\n` +
    (cliente.observacoes ? `📝 ${cliente.observacoes}\n\n` : '') +
    `Poderia me ajudar com informações e condições? 😊✨`
  )
}

async function salvarNaPlanilha(produtos: Produto[], cliente: ClienteForm, vendedora: Vendedora | null) {
  if (!SHEETS_URL) return
  const payload = {
    vendedora:   vendedora?.nome ?? 'Sem vínculo',
    nomeCliente: cliente.nome,
    telefone:    cliente.telefone,
    empresa:     cliente.empresa,
    email:       cliente.email,
    observacoes: cliente.observacoes,
    produtos:    produtos.map(p => p.nome).join(', '),
    quantidade:  produtos.length,
    data:        new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  }
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch { /* silencioso — não bloqueia o fluxo */ }
}

export default function ClienteWhatsAppModal({ produtos, vendedora, onClose }: Props) {
  const [form,    setForm]    = useState<ClienteForm>(VAZIO)
  const [status,  setStatus]  = useState<'idle' | 'sending'>('idle')
  const [closing, setClosing] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Foca o primeiro campo ao abrir
  const nomeRef = useRef<HTMLInputElement>(null)
  useEffect(() => { setTimeout(() => nomeRef.current?.focus(), 80) }, [])

  function set(field: keyof ClienteForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function maskPhone(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2)  return digits.length ? `(${digits}` : ''
    if (digits.length <= 7)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`
    if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
  }

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 220)
  }

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) handleClose()
  }

  const podeEnviar = form.nome.trim().length > 0 && form.telefone.trim().length > 0 && status === 'idle'

  async function enviar() {
    if (!podeEnviar) return
    setStatus('sending')
    await salvarNaPlanilha(produtos, form, vendedora)
    const phone = vendedora?.whatsapp ?? WHATSAPP_PADRAO
    const msg   = buildWaMsg(produtos, form, vendedora, window.location.origin)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    handleClose()
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && podeEnviar) enviar()
    if (e.key === 'Escape') handleClose()
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      onKeyDown={handleKey}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: closing ? '_bc 0.22s ease forwards' : '_bp 0.22s ease forwards',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '460px',
          background: 'var(--a)',
          border: '1px solid var(--h)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: closing ? '_hc 0.22s ease forwards' : '_hd 0.22s ease forwards',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--h)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'rgba(37,211,102,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageCircle size={16} style={{ color: '#25D366' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--f)', margin: 0 }}>
                Enviar pelo WhatsApp
              </p>
              <p style={{ fontSize: '12px', color: 'var(--g)', margin: 0 }}>
                {produtos.length} produto{produtos.length !== 1 ? 's' : ''} selecionado{produtos.length !== 1 ? 's' : ''}
                {vendedora ? ` · ${vendedora.nome}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--c)', border: '1px solid var(--h)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--g)', transition: 'opacity 0.15s',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Nome — obrigatório */}
          <Field
            icon={<User size={14} />}
            label="Nome completo"
            required
            placeholder="Seu nome"
            value={form.nome}
            onChange={v => set('nome', v)}
            inputRef={nomeRef}
          />

          {/* Telefone — obrigatório */}
          <Field
            icon={<Phone size={14} />}
            label="Telefone / WhatsApp"
            required
            placeholder="(19) 99999-0000"
            value={form.telefone}
            onChange={v => set('telefone', maskPhone(v))}
            type="tel"
          />

          <div style={{ height: '1px', background: 'var(--h)', margin: '2px 0' }} />

          {/* Empresa — opcional */}
          <Field
            icon={<Building2 size={14} />}
            label="Empresa"
            placeholder="Nome da empresa (opcional)"
            value={form.empresa}
            onChange={v => set('empresa', v)}
          />

          {/* E-mail — opcional */}
          <Field
            icon={<Mail size={14} />}
            label="E-mail"
            placeholder="email@exemplo.com (opcional)"
            value={form.email}
            onChange={v => set('email', v)}
            type="email"
          />

          {/* Observações — opcional */}
          <FieldArea
            icon={<StickyNote size={14} />}
            label="Observações"
            placeholder="Preferências, prazo, ambiente... (opcional)"
            value={form.observacoes}
            onChange={v => set('observacoes', v)}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '0 24px 20px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {!podeEnviar && form.nome.trim().length === 0 && (
            <p style={{ fontSize: '11px', color: 'var(--g)', textAlign: 'center', margin: '0 0 4px' }}>
              Preencha nome e telefone para continuar
            </p>
          )}
          <button
            onClick={enviar}
            disabled={!podeEnviar}
            style={{
              width: '100%', padding: '13px',
              borderRadius: '12px', border: 'none', cursor: podeEnviar ? 'pointer' : 'not-allowed',
              background: podeEnviar ? '#25D366' : 'var(--c)',
              color: podeEnviar ? '#fff' : 'var(--g)',
              fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: podeEnviar ? '0 4px 18px rgba(37,211,102,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {status === 'sending'
              ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              : <MessageCircle size={16} />}
            {status === 'sending' ? 'Abrindo WhatsApp...' : 'Enviar lista pelo WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, label, required, placeholder, value, onChange, type = 'text', inputRef }: {
  icon: React.ReactNode
  label: string
  required?: boolean
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--g)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        <span style={{ color: 'var(--accent, #B8973A)', opacity: 0.8 }}>{icon}</span>
        {label}
        {required && <span style={{ color: '#fb7185', fontSize: '10px' }}>*</span>}
      </label>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px',
          background: 'var(--c)', border: '1px solid var(--h)',
          borderRadius: '10px', color: 'var(--f)', fontSize: '14px',
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent, #B8973A)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--h)' }}
      />
    </div>
  )
}

function FieldArea({ icon, label, placeholder, value, onChange }: {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--g)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        <span style={{ color: 'var(--accent, #B8973A)', opacity: 0.8 }}>{icon}</span>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%', padding: '10px 12px',
          background: 'var(--c)', border: '1px solid var(--h)',
          borderRadius: '10px', color: 'var(--f)', fontSize: '14px',
          outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          fontFamily: 'inherit', transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent, #B8973A)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--h)' }}
      />
    </div>
  )
}
