import { Suspense } from 'react'
import { getProdutos, getDestaques } from '@/lib/data'
import ProductsView from '@/components/ProductsView'
import CarrosselDestaques from '@/components/CarrosselDestaques'

export default function Home() {
  const produtos   = getProdutos()
  const destaques  = getDestaques()
  return (
    <Suspense>
      <CarrosselDestaques produtos={destaques} />

      {/* ── Separador ── */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 h-px" style={{ background: 'var(--h)' }} />
        <span
          style={{
            fontFamily:    'var(--n)',
            fontSize:      '10px',
            fontWeight:    500,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color:         'var(--g)',
            opacity:       0.6,
            whiteSpace:    'nowrap',
          }}
        >
          {produtos.length.toLocaleString('pt-BR')} produtos disponíveis
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--h)' }} />
      </div>

      <ProductsView produtos={produtos} total={produtos.length} />
    </Suspense>
  )
}
