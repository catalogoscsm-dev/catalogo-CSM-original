'use client'

import { useState, useEffect, useRef } from 'react'
import { X, FileDown, User, Briefcase, ChevronRight, Loader2, CheckCircle2, Tag } from 'lucide-react'
import { Produto } from '@/lib/types'

const LS_VENDEDOR  = 'csm_vendedor'
const LS_CLIENTES  = 'csm_clientes_hist'
const LS_CONDICOES = 'csm_condicoes'

interface Vendedor   { nome: string; cargo: string; telefone: string; email: string }
interface Cliente    { nome: string; empresa: string; telefone: string; email: string; notas: string }
interface Condicoes  { preco: string; pagamento: string; prazo: string }

const VENDEDOR_VAZIO:  Vendedor  = { nome: '', cargo: '', telefone: '', email: '' }
const CLIENTE_VAZIO:   Cliente   = { nome: '', empresa: '', telefone: '', email: '', notas: '' }
const CONDICOES_VAZIO: Condicoes = { preco: '', pagamento: '', prazo: '' }

function getLS<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback }
}

interface Props {
  produtos: Produto[]
  onClose: () => void
}

export default function GerarPDFModal({ produtos, onClose }: Props) {
  const [tab,          setTab]          = useState<'vendedor' | 'cliente' | 'condicoes'>('vendedor')
  const [vendedor,     setVendedor]     = useState<Vendedor>(VENDEDOR_VAZIO)
  const [cliente,      setCliente]      = useState<Cliente>(CLIENTE_VAZIO)
  const [condicoes,    setCondicoes]    = useState<Condicoes>(CONDICOES_VAZIO)
  const [salvarVend,   setSalvarVend]   = useState(true)
  const [incluirCliente, setIncluirCliente] = useState(false)
  const [status,       setStatus]       = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errMsg,       setErrMsg]       = useState('')
  const [closing,      setClosing]      = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Carrega dados salvos
  useEffect(() => {
    const v = getLS<Vendedor>(LS_VENDEDOR, VENDEDOR_VAZIO)
    if (v.nome) setVendedor(v)
    const c = getLS<Condicoes>(LS_CONDICOES, CONDICOES_VAZIO)
    if (c.preco || c.pagamento || c.prazo) setCondicoes(c)
  }, [])

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 220)
  }

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === backdropRef.current) handleClose()
  }

  async function gerarPDF() {
    if (!vendedor.nome.trim()) { setTab('vendedor'); return }
    setStatus('loading')
    setErrMsg('')

    if (salvarVend) localStorage.setItem(LS_VENDEDOR, JSON.stringify(vendedor))
    localStorage.setItem(LS_CONDICOES, JSON.stringify(condicoes))

    // Salva cliente no histórico local (opcional)
    if (incluirCliente && cliente.nome.trim()) {
      const hist = getLS<Cliente[]>(LS_CLIENTES, [])
      const updated = [{ ...cliente, _at: Date.now() }, ...hist.filter(c => c.nome !== cliente.nome)].slice(0, 50)
      localStorage.setItem(LS_CLIENTES, JSON.stringify(updated))
    }

    try {
      const res = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoIds: produtos.map(p => p.id),
          vendedor: {
            nome:     vendedor.nome.trim(),
            cargo:    vendedor.cargo.trim()    || undefined,
            telefone: vendedor.telefone.trim() || undefined,
            email:    vendedor.email.trim()    || undefined,
          },
          cliente: (incluirCliente && cliente.nome.trim()) ? {
            nome:     cliente.nome.trim(),
            empresa:  cliente.empresa.trim()  || undefined,
            telefone: cliente.telefone.trim() || undefined,
            email:    cliente.email.trim()    || undefined,
            notas:    cliente.notas.trim()    || undefined,
          } : null,
          condicoes: (condicoes.preco.trim() || condicoes.pagamento.trim() || condicoes.prazo.trim()) ? {
            preco:     condicoes.preco.trim()     || undefined,
            pagamento: condicoes.pagamento.trim() || undefined,
            prazo:     condicoes.prazo.trim()     || undefined,
          } : null,
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Erro ${res.status}`)
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `selecao-csm-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
      setTimeout(handleClose, 1800)
    } catch (e: unknown) {
      setStatus('error')
      setErrMsg(e instanceof Error ? e.message : 'Erro desconhecido')
    }
  }

  const podeGerar = vendedor.nome.trim().length > 0 && status !== 'loading'

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: closing ? 'fadeOut 0.22s ease forwards' : 'fadeIn 0.22s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes fadeOut { from { opacity:1 } to { opacity:0 } }
        @keyframes slideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes slideDown { from { transform:translateY(0);opacity:1 } to { transform:translateY(20px);opacity:0 } }
        .pdf-input {
          width: 100%; padding: 0.6rem 0.75rem; border-radius: 10px; font-size: 0.9rem;
          background: var(--d); border: 1px solid var(--h); color: var(--f);
          outline: none; transition: border-color 0.15s;
        }
        .pdf-input:focus { border-color: var(--gold-accent, #B8973A); }
        .pdf-input::placeholder { color: var(--g); }
        .pdf-tab-btn {
          flex: 1; padding: 0.6rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600;
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          transition: all 0.15s; cursor: pointer; border: none;
        }
        .pdf-tab-active  { background: var(--c); color: var(--f); border: 1px solid var(--h); }
        .pdf-tab-inactive { background: transparent; color: var(--g); }
        .pdf-tab-inactive:hover { background: var(--d); color: var(--f); }
        .pdf-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; color: var(--g); margin-bottom: 5px; text-transform: uppercase; }
        .pdf-row { display: flex; gap: 10px; }
        .pdf-row > * { flex: 1; }
        .pdf-check-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .pdf-check-row input { width: 15px; height: 15px; accent-color: var(--gold-accent, #B8973A); cursor: pointer; }
        .pdf-check-row span { font-size: 0.82rem; color: var(--g); }
      `}</style>

      <div
        style={{
          background: 'var(--a)',
          border: '1px solid var(--h)',
          borderRadius: 20,
          width: '100%', maxWidth: 520,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          animation: closing ? 'slideDown 0.22s ease forwards' : 'slideUp 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem 1rem',
          borderBottom: '1px solid var(--h)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #8C6E18, #B8973A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(140,110,24,0.35)',
            }}>
              <FileDown style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--f)', fontSize: '0.95rem', marginBottom: 1 }}>
                Gerar PDF de Seleção
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--g)' }}>
                {produtos.length} produto{produtos.length !== 1 ? 's' : ''} selecionado{produtos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'var(--c)', color: 'var(--g)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: 6 }}>
          <button className={`pdf-tab-btn ${tab === 'vendedor' ? 'pdf-tab-active' : 'pdf-tab-inactive'}`} onClick={() => setTab('vendedor')}>
            <User style={{ width: 14, height: 14 }} /> Vendedor
          </button>
          <button className={`pdf-tab-btn ${tab === 'cliente' ? 'pdf-tab-active' : 'pdf-tab-inactive'}`} onClick={() => setTab('cliente')}>
            <Briefcase style={{ width: 14, height: 14 }} /> Cliente
            <span style={{
              fontSize: '0.65rem', padding: '1px 6px', borderRadius: 20,
              background: 'var(--d)', color: 'var(--g)',
            }}>opcional</span>
          </button>
          <button className={`pdf-tab-btn ${tab === 'condicoes' ? 'pdf-tab-active' : 'pdf-tab-inactive'}`} onClick={() => setTab('condicoes')}>
            <Tag style={{ width: 14, height: 14 }} /> Condições
            <span style={{
              fontSize: '0.65rem', padding: '1px 6px', borderRadius: 20,
              background: 'var(--d)', color: 'var(--g)',
            }}>opcional</span>
          </button>
        </div>

        {/* Corpo */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

          {tab === 'condicoes' ? (
            <>
              <p style={{ fontSize: '0.8rem', color: 'var(--g)', margin: 0 }}>
                Condições que aparecerão em cada página de produto. Deixe em branco para omitir.
              </p>
              <div>
                <p className="pdf-label">Preço / faixa de preço</p>
                <input
                  className="pdf-input"
                  placeholder="Ex: R$ 2.800 ou R$ 2.400 – R$ 3.200"
                  value={condicoes.preco}
                  onChange={e => setCondicoes(c => ({ ...c, preco: e.target.value }))}
                  autoFocus={tab === 'condicoes'}
                />
              </div>
              <div>
                <p className="pdf-label">Condição de pagamento</p>
                <input
                  className="pdf-input"
                  placeholder="Ex: 30/60/90 dias ou à vista com 5% desconto"
                  value={condicoes.pagamento}
                  onChange={e => setCondicoes(c => ({ ...c, pagamento: e.target.value }))}
                />
              </div>
              <div>
                <p className="pdf-label">Prazo de entrega</p>
                <input
                  className="pdf-input"
                  placeholder="Ex: 45 dias úteis após confirmação"
                  value={condicoes.prazo}
                  onChange={e => setCondicoes(c => ({ ...c, prazo: e.target.value }))}
                />
              </div>
            </>
          ) : tab === 'vendedor' ? (
            <>
              <div>
                <p className="pdf-label">Nome *</p>
                <input
                  className="pdf-input"
                  placeholder="Seu nome completo"
                  value={vendedor.nome}
                  onChange={e => setVendedor(v => ({ ...v, nome: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <p className="pdf-label">Cargo</p>
                <input
                  className="pdf-input"
                  placeholder="Ex: Consultor de Vendas"
                  value={vendedor.cargo}
                  onChange={e => setVendedor(v => ({ ...v, cargo: e.target.value }))}
                />
              </div>
              <div className="pdf-row">
                <div>
                  <p className="pdf-label">Telefone</p>
                  <input
                    className="pdf-input"
                    placeholder="(19) 99900-0000"
                    value={vendedor.telefone}
                    onChange={e => setVendedor(v => ({ ...v, telefone: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="pdf-label">E-mail</p>
                  <input
                    className="pdf-input"
                    placeholder="vendedor@csm.com"
                    value={vendedor.email}
                    onChange={e => setVendedor(v => ({ ...v, email: e.target.value }))}
                  />
                </div>
              </div>

              <label className="pdf-check-row">
                <input
                  type="checkbox"
                  checked={salvarVend}
                  onChange={e => setSalvarVend(e.target.checked)}
                />
                <span>Salvar dados do vendedor neste dispositivo</span>
              </label>

              {/* Próximo → Cliente */}
              <button
                onClick={() => setTab('cliente')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '0.6rem', borderRadius: 10,
                  background: 'var(--d)', border: '1px solid var(--h)',
                  color: 'var(--g)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Adicionar dados do cliente <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </>
          ) : (
            <>
              <label className="pdf-check-row">
                <input
                  type="checkbox"
                  checked={incluirCliente}
                  onChange={e => setIncluirCliente(e.target.checked)}
                />
                <span>Incluir página do cliente no PDF</span>
              </label>

              <div style={{ opacity: incluirCliente ? 1 : 0.4, pointerEvents: incluirCliente ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div className="pdf-row">
                  <div>
                    <p className="pdf-label">Nome do cliente</p>
                    <input
                      className="pdf-input"
                      placeholder="Nome completo"
                      value={cliente.nome}
                      onChange={e => setCliente(c => ({ ...c, nome: e.target.value }))}
                    />
                  </div>
                  <div>
                    <p className="pdf-label">Empresa</p>
                    <input
                      className="pdf-input"
                      placeholder="Nome da empresa"
                      value={cliente.empresa}
                      onChange={e => setCliente(c => ({ ...c, empresa: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="pdf-row">
                  <div>
                    <p className="pdf-label">Telefone</p>
                    <input
                      className="pdf-input"
                      placeholder="(19) 99900-0000"
                      value={cliente.telefone}
                      onChange={e => setCliente(c => ({ ...c, telefone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <p className="pdf-label">E-mail</p>
                    <input
                      className="pdf-input"
                      placeholder="email@cliente.com"
                      value={cliente.email}
                      onChange={e => setCliente(c => ({ ...c, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <p className="pdf-label">Observações</p>
                  <textarea
                    className="pdf-input"
                    placeholder="Preferências, prazo, ambiente..."
                    rows={3}
                    value={cliente.notas}
                    onChange={e => setCliente(c => ({ ...c, notas: e.target.value }))}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem 1.25rem',
          borderTop: '1px solid var(--h)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {status === 'error' && (
            <p style={{ fontSize: '0.8rem', color: '#f87171', textAlign: 'center' }}>
              {errMsg || 'Não foi possível gerar o PDF. Verifique se o servidor está a correr.'}
            </p>
          )}

          <button
            onClick={gerarPDF}
            disabled={!podeGerar}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '0.8rem 1.5rem', borderRadius: 12, border: 'none',
              cursor: podeGerar ? 'pointer' : 'not-allowed',
              fontWeight: 700, fontSize: '0.9rem',
              background: status === 'done'
                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                : podeGerar
                  ? 'linear-gradient(135deg, #8C6E18, #B8973A)'
                  : 'var(--d)',
              color: podeGerar ? '#fff' : 'var(--g)',
              boxShadow: podeGerar && status !== 'done' ? '0 4px 20px rgba(140,110,24,0.4)' : 'none',
              transition: 'all 0.2s',
              opacity: !podeGerar ? 0.6 : 1,
            }}
          >
            {status === 'loading' && <Loader2 style={{ width: 17, height: 17, animation: 'spin 1s linear infinite' }} />}
            {status === 'done'    && <CheckCircle2 style={{ width: 17, height: 17 }} />}
            {status === 'error'   && <FileDown style={{ width: 17, height: 17 }} />}
            {status === 'idle'    && <FileDown style={{ width: 17, height: 17 }} />}

            {status === 'loading' ? 'A gerar PDF…'
              : status === 'done' ? 'PDF baixado!'
              : !vendedor.nome.trim() ? 'Preencha o nome do vendedor'
              : `Gerar PDF com ${produtos.length} produto${produtos.length !== 1 ? 's' : ''}`}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    </div>
  )
}
