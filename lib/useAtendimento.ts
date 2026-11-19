'use client'

import { useEffect, useState } from 'react'
import { capturarToken, dadosVendedor, WHATSAPP_RECEPCAO } from './leads'

export interface Atendimento {
  token: string | null
  nome: string | null
  whatsapp: string
  carregando: boolean
}

/**
 * Captura o token de ?v= (persistindo em localStorage) e resolve nome e
 * whatsapp do vendedor via RPC dados_vendedor (uma chamada, resultado memoizado).
 * whatsapp cai automaticamente para o número da loja se o vendedor não tiver
 * cadastrado o seu ou se não houver token.
 */
export function useAtendimento(): Atendimento {
  const [token, setToken]     = useState<string | null>(null)
  const [nome, setNome]       = useState<string | null>(null)
  const [whatsapp, setWhatsapp] = useState<string>(WHATSAPP_RECEPCAO)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const t = capturarToken()
    setToken(t)
    if (!t) {
      setCarregando(false)
      return
    }
    let ativo = true
    dadosVendedor(t).then(d => {
      if (!ativo) return
      setNome(d.nome)
      setWhatsapp(d.whatsapp)
      setCarregando(false)
    })
    return () => { ativo = false }
  }, [])

  return { token, nome, whatsapp, carregando }
}
