'use client'

import { useAtendimento } from '@/lib/useAtendimento'

/**
 * Mostra "Atendimento: <nome>" discretamente quando há um token de vendedor
 * válido (?v=TOKEN). Sem nome resolvido, não renderiza nada.
 */
export default function AtendimentoBadge() {
  const { nome } = useAtendimento()
  if (!nome) return null
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      style={{ marginTop: '0.25rem' }}
    >
      <span
        style={{
          fontSize: '12px',
          color: 'var(--g)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#22c55e',
            display: 'inline-block',
          }}
        />
        Atendimento: <strong style={{ color: 'var(--f)', fontWeight: 600 }}>{nome}</strong>
      </span>
    </div>
  )
}
