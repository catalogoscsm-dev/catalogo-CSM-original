'use client'

interface Item { label: string; value: string }

export default function FichaTecnica({ items }: { items: Item[] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {items.map(({ label, value }, i) => (
        <div
          key={label}
          className="flex items-start gap-4 px-5 py-3.5"
          style={{
            background: i % 2 === 0 ? 'transparent' : 'var(--surface-hover)',
            borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <span className="text-xs font-semibold w-36 shrink-0 pt-0.5 uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
