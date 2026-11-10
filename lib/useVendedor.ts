'use client'

import { useEffect, useState } from 'react'
import { getVendedora, type Vendedora } from './vendedores'

// sessionStorage — isolado por aba, não vaza entre tabs
const SS_KEY = 'csm_vendedora_sessao'

export function useVendedor() {
  const [vendedora, setVendedora] = useState<Vendedora | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const codigoUrl = params.get('v')

    if (codigoUrl) {
      const encontrada = getVendedora(codigoUrl)
      if (encontrada) {
        sessionStorage.setItem(SS_KEY, JSON.stringify(encontrada))
        setVendedora(encontrada)
        window.dispatchEvent(new CustomEvent('csm:favoritos-updated'))
        return
      }
    }

    // Sem ?v= na URL — tenta recuperar da sessão desta aba
    try {
      const salva = sessionStorage.getItem(SS_KEY)
      if (salva) setVendedora(JSON.parse(salva))
    } catch { /* noop */ }
  }, [])

  return vendedora
}

export function getVendedoraSessao(): Vendedora | null {
  if (typeof window === 'undefined') return null
  try {
    const salva = sessionStorage.getItem(SS_KEY)
    return salva ? JSON.parse(salva) : null
  } catch { return null }
}

/** Chave de favoritos isolada por vendedora — ex: csm_favoritos_ana */
export function getFavKey(): string {
  try {
    const salva = sessionStorage.getItem(SS_KEY)
    const v = salva ? JSON.parse(salva) : null
    return v?.codigo ? `csm_favoritos_${v.codigo}` : 'csm_favoritos'
  } catch { return 'csm_favoritos' }
}
