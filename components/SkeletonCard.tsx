export default function SkeletonCard() {
  return (
    <div className="_p" aria-hidden>
      {/* Área da imagem */}
      <div className="aspect-square _s" />

      {/* Área de texto */}
      <div className="p-3 space-y-2.5">
        <div className="_s h-4 rounded-md" style={{ width: '80%' }} />
        <div className="_s h-3 rounded-md" style={{ width: '55%' }} />
        <div className="_s h-3 rounded-md" style={{ width: '65%' }} />
      </div>
    </div>
  )
}
