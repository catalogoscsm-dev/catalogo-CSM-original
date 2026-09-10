export default function SkeletonCard() {
  return (
    <div className="product-card" aria-hidden>
      {/* Área da imagem */}
      <div className="aspect-square skeleton" />

      {/* Área de texto */}
      <div className="p-3 space-y-2.5">
        <div className="skeleton h-4 rounded-md" style={{ width: '80%' }} />
        <div className="skeleton h-3 rounded-md" style={{ width: '55%' }} />
        <div className="skeleton h-3 rounded-md" style={{ width: '65%' }} />
      </div>
    </div>
  )
}
