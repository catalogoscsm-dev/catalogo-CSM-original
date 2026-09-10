import { getProdutos } from '@/lib/data'
import FavoritosClient from './FavoritosClient'

export default function FavoritosPage() {
  const todos = getProdutos()
  return <FavoritosClient todos={todos} />
}
