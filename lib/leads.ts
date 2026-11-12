// Integração de leads via Supabase (REST/RPC) — 100% client-side.
// Compatível com export estático (GitHub Pages): usa somente chaves públicas
// NEXT_PUBLIC_*, inlinadas no build. NUNCA use aqui a service/secret key.

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' // chave publishable (anon)

export const LS_TOKEN_KEY = 'csm_vendedor_token'

export function leadsConfigurado(): boolean {
  return !!SUPABASE_URL && !!SUPABASE_KEY
}

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  }
}

/** Item público enviado no lead — sem fornecedor, marca interna ou preço. */
export interface LeadItem {
  produto_id: number
  nome: string
  url: string
}

/**
 * Captura o token de ?v=TOKEN (se presente) e persiste em localStorage para
 * manter o atendimento entre páginas. Retorna o token efetivo (URL ou salvo).
 */
export function capturarToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const url = new URLSearchParams(window.location.search).get('v')
    if (url && url.trim()) {
      localStorage.setItem(LS_TOKEN_KEY, url.trim())
      return url.trim()
    }
    const salvo = localStorage.getItem(LS_TOKEN_KEY)
    return salvo && salvo.trim() ? salvo.trim() : null
  } catch {
    return null
  }
}

// Memo por token: evita chamadas repetidas à RPC quando badge e formulário
// consultam o nome do vendedor na mesma página.
const nomeCache = new Map<string, Promise<string | null>>()

/**
 * Resolve o nome do vendedor a partir do token.
 * POST {URL}/rest/v1/rpc/nome_vendedor  body { p_token }.
 * Retorna o nome (string) ou null se o token for inválido / não configurado.
 */
export function nomeVendedor(token: string): Promise<string | null> {
  if (!leadsConfigurado() || !token) return Promise.resolve(null)
  const cached = nomeCache.get(token)
  if (cached) return cached

  const p = (async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/nome_vendedor`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ p_token: token }),
      })
      if (!res.ok) return null
      const data = await res.json()
      // A função pode retornar uma string (nome) ou um objeto { nome }.
      const nome = typeof data === 'string' ? data : (data?.nome ?? null)
      return nome && String(nome).trim() ? String(nome).trim() : null
    } catch (e) {
      console.error('[leads] nome_vendedor falhou:', e)
      return null
    }
  })()

  nomeCache.set(token, p)
  return p
}

export type RegistrarResultado =
  | { ok: true }
  | { ok: false; motivo: 'limite' | 'generico' }

/**
 * Registra o lead.
 * POST {URL}/rest/v1/rpc/registrar_lead com
 * { p_token, p_nome, p_telefone, p_consentimento, p_itens, p_hp }.
 */
export async function registrarLead(params: {
  token: string
  nome: string
  telefone: string
  consentimento: boolean
  itens: LeadItem[]
  honeypot: string
}): Promise<RegistrarResultado> {
  const body = {
    p_token: params.token,
    p_nome: params.nome,
    p_telefone: params.telefone,
    p_consentimento: params.consentimento,
    p_itens: params.itens,
    p_hp: params.honeypot,
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/registrar_lead`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    })
    if (res.ok) return { ok: true }

    const texto = await res.text()
    console.error('[leads] registrar_lead erro:', res.status, texto)
    const limite = /limite excedido/i.test(texto) || res.status === 429
    return { ok: false, motivo: limite ? 'limite' : 'generico' }
  } catch (e) {
    console.error('[leads] registrar_lead exceção:', e)
    return { ok: false, motivo: 'generico' }
  }
}
