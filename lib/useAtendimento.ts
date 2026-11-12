'use client'

import { useEffect, useState } from 'react'
import { capturarToken, nomeVendedor } from './leads'

export interface Atendimento {
  token: string | null
  nome: string | null
  carregando: boolean
}

/**
 * Captura o token de ?v= (persistindo em localStorage) e resolve o nome do
 * vendedor via RPC. Compartilhado pelo badge "Atendimento" e pelo formulário
 * de envio de leads — o resultado é memoizado por token em lib/leads.
 *
 * Token válido = a RPC retornou um nome. Sem nome, o formulário não deve aparecer.
 */
export function useAtendimento(): Atendimento {
  const [token, setToken] = useState<string | null>(null)
  const [nome, setNome] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const t = capturarToken()
    setToken(t)
    if (!t) {
      setCarregando(false)
      return
    }
    let ativo = true
    nomeVendedor(t).then(n => {
      if (!ativo) return
      setNome(n)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [])

  return { token, nome, carregando }
}
