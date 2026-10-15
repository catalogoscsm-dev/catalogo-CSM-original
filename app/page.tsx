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
      <ProductsView produtos={produtos} total={produtos.length} />
    </Suspense>
  )
}
