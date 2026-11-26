import { parseAll, formatarDimensoesCruas } from '@/lib/dimensoes'

// ─── Mapa de cores para acabamentos de móveis ────────────────────────────────
const COLOR_MAP: { keywords: string[]; color: string }[] = [
  { keywords: ['branco', 'white', 'off-white', 'offwhite'],       color: '#F5F5F0' },
  { keywords: ['preto', 'black', 'ebano', 'ebony'],               color: '#1A1A1A' },
  { keywords: ['grafite', 'graphite', 'antracite'],               color: '#4A4A4A' },
  { keywords: ['cinza', 'grey', 'gray', 'chumbo'],                color: '#8A8A8A' },
  { keywords: ['champagne', 'champaign'],                         color: '#E8D5A3' },
  { keywords: ['dourado', 'gold', 'golden', 'ouro'],              color: '#C9A84C' },
  { keywords: ['cobre', 'copper'],                                color: '#B87333' },
  { keywords: ['prata', 'silver', 'cromado', 'chrome'],          color: '#C0C0C0' },
  { keywords: ['bronze'],                                         color: '#8C6239' },
  { keywords: ['noce', 'nogueira', 'walnut'],                     color: '#5C3A1E' },
  { keywords: ['carvalho', 'oak'],                                color: '#C4956A' },
  { keywords: ['teca', 'teak'],                                   color: '#9E6B4A' },
  { keywords: ['freijo', 'freijó', 'louro', 'jequitiba', 'jequitibá'], color: '#B08060' },
  { keywords: ['amêndoa', 'amendoa', 'almond'],                  color: '#E8D5B0' },
  { keywords: ['areia', 'sand', 'bege', 'beige'],                color: '#C8B89A' },
  { keywords: ['natural', 'naturale', 'natura'],                 color: '#D4B896' },
  { keywords: ['linho', 'linen'],                                 color: '#EAD9C0' },
  { keywords: ['caramelo', 'caramel', 'mel'],                    color: '#C17F3C' },
  { keywords: ['terracota', 'terra'],                             color: '#C4622D' },
  { keywords: ['vinho', 'wine', 'bordeaux', 'marsala'],          color: '#6B2737' },
  { keywords: ['azul', 'blue', 'navy', 'marinho'],               color: '#2C4A6E' },
  { keywords: ['verde', 'green', 'oliva', 'olive'],              color: '#4A5E3A' },
  { keywords: ['musgo', 'moss'],                                  color: '#5C6B3A' },
  { keywords: ['marrom', 'brown', 'tabaco', 'tobacco'],          color: '#6B4226' },
  { keywords: ['fog', 'névoa'],                                   color: '#B0C4D0' },
  { keywords: ['midnight', 'meia-noite'],                        color: '#1C2B3A' },
  { keywords: ['lacgiandula', 'giandula', 'gianduia'],           color: '#D4C4A0' },
  { keywords: ['rosa', 'pink', 'blush'],                         color: '#E8B4A0' },
  { keywords: ['roxo', 'purple', 'lilas', 'lilás'],              color: '#7B5EA7' },
  { keywords: ['fendi'],                                         color: '#C8B89A' },
  { keywords: ['relva'],                                         color: '#4A7C59' },
  { keywords: ['titanium', 'titânio'],                           color: '#8D8D8D' },
  { keywords: ['black camurça', 'camurça'],                      color: '#2A2A2A' },
]

function getSwatchColor(name: string): string | null {
  const lower = name.toLowerCase().trim()
  for (const entry of COLOR_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.color
  }
  return null
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function DimensoesDisplay({ raw, acabamento }: { raw?: string | null; acabamento?: string | null }) {
  const table = raw && raw.trim().length > 1 ? parseAll(raw) : null
  // Se o acabamento tem padrão "Descrição: Cor1, Cor2", extrai só as cores
  const acabamentoNorm = (() => {
    if (!acabamento) return null
    const colonIdx = acabamento.indexOf(':')
    if (colonIdx !== -1) return acabamento.slice(colonIdx + 1).trim()
    return acabamento
  })()
  const cores = acabamentoNorm
    ? acabamentoNorm.split(/[+,/]/).map(s => s.trim()).filter(Boolean)
    : []

  const sectionLabel: React.CSSProperties = {
    color: 'var(--g)',
    fontWeight: 600,
    fontSize: '0.68rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    margin: 0,
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 14px',
    textAlign: 'left',
    color: 'var(--g)',
    fontWeight: 600,
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }

  const tdSize: React.CSSProperties = {
    padding: '11px 14px',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--f)',
  }

  const tdVal: React.CSSProperties = {
    padding: '11px 14px',
    fontWeight: 400,
    fontSize: '0.875rem',
    color: 'var(--f)',
  }

  const temSize = table?.rows.some(r => r.size !== null) ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Dimensões */}
      {table ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={sectionLabel}>Dimensões</p>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--h)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: 'var(--d)' }}>
                  {temSize && <th style={{ ...thStyle, width: '22%' }}>Tamanho</th>}
                  {table.cols.map(col => <th key={col} style={thStyle}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: i < table.rows.length - 1 ? '1px solid var(--h)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'var(--d)',
                  }}>
                    {temSize && <td style={tdSize}>{row.size ?? '—'}</td>}
                    {table.cols.map(col => {
                      const cell = row.cells.find(c => c.label === col)
                      return <td key={col} style={tdVal}>{cell ? (/^\d/.test(cell.val) ? `${cell.val}cm` : cell.val) : '—'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : raw && raw.trim().length > 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={sectionLabel}>Dimensões</p>
          <p style={{ color: 'var(--f)', fontSize: '0.875rem', margin: 0 }}>
            {formatarDimensoesCruas(raw)}
          </p>
        </div>
      ) : null}

      {/* Acabamentos / Cores com swatches */}
      {cores.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={sectionLabel}>Acabamentos / Cores</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {cores.map((cor, i) => {
              const swatchColor = getSwatchColor(cor)
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '6px 12px 6px 8px',
                  borderRadius: '999px',
                  background: 'var(--d)',
                  border: '1px solid var(--h)',
                }}>
                  {/* Swatch */}
                  <span style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: swatchColor ?? 'var(--h)',
                    border: '1.5px solid rgba(128,128,128,0.25)',
                    boxShadow: swatchColor ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--f)', fontWeight: 500 }}>
                    {cor}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
