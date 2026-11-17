import { getCatalogos, getCatalogoPorPasta } from '@/lib/data'
import { notFound, redirect } from 'next/navigation'

export async function generateStaticParams() {
  return getCatalogos().map(c => ({ marca: encodeURIComponent(c.pasta) }))
}

export default async function CatalogoPage({ params }: { params: Promise<{ marca: string }> }) {
  // TODO: re-implementar via Supabase (filtro por catalogo_id + auth de vendedor)
  const { marca } = await params
  const catalogo = getCatalogoPorPasta(decodeURIComponent(marca))
  if (!catalogo) notFound()
  redirect('/')
}
