import { Suspense } from 'react'
import { getProdutos } from '@/lib/data'
import ProductsView from '@/components/ProductsView'

export default function Home() {
  const produtos = getProdutos()
  return (
    <Suspense>
      <ProductsView produtos={produtos} total={produtos.length} />
    </Suspense>
  )
}
