interface Cell  { label: string; val: string }
interface Row   { size: string | null; cells: Cell[] }
interface Table { cols: string[]; rows: Row[] }

const LABEL: Record<string, string> = {
  L: 'Largura', P: 'Prof.', A: 'Altura', H: 'Altura',
  C: 'Compr.', Ø: 'Diâm.', ALCANCE: 'Alcance',
}
const POSITIONAL = ['L', 'P', 'H']

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
]

function getSwatchColor(name: string): string | null {
  const lower = name.toLowerCase().trim()
  for (const entry of COLOR_MAP) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.color
  }
  return null
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseFormatA(raw: string): Row | null {
  const sizeM = raw.match(/^([A-Z]+)-(.+)$/i)
  const size  = sizeM ? sizeM[1].toUpperCase() : null
  const body  = sizeM ? sizeM[2] : raw
  const tokens = body.split(/[Xx×]/i).map(t => t.trim())
  const cells: Cell[] = []
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    const mDiam = tok.match(/^Ø\s*(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mDiam) { cells.push({ label: 'Diâm.', val: mDiam[1] }); continue }
    const mDot = tok.match(/^([A-Z])\.(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mDot) { cells.push({ label: LABEL[mDot[1].toUpperCase()] ?? mDot[1].toUpperCase(), val: mDot[2] }); continue }
    const mNum = tok.match(/^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mNum) {
      const key = POSITIONAL[i] ?? `D${i + 1}`
      cells.push({ label: LABEL[key] ?? key, val: mNum[1] })
      continue
    }
  }
  return cells.length > 0 ? { size, cells } : null
}

function parseFormatB(raw: string): Row | null {
  const parts = raw.split(/\s+x\s+/i)
  if (parts.length < 2) return null
  const cells: Cell[] = []
  for (const p of parts) {
    const m = p.trim().match(/^([A-ZÀ-Ú][A-Za-zÀ-Ú]*(?:\s+[A-Za-zÀ-Ú]+)*)\s+(\d+(?:[.,]\d+)?)(?:\s*cm)?$/i)
    if (!m) return null
    const key = m[1].trim().toUpperCase()
    cells.push({ label: LABEL[key] ?? m[1].trim(), val: m[2] })
  }
  return cells.length > 0 ? { size: null, cells } : null
}

function parseFormatC(raw: string): Row | null {
  const parts = raw.split('/').map(s => s.trim())
  if (parts.length < 2) return null
  const cells: Cell[] = []
  for (const p of parts) {
    const m = p.match(/^([A-ZÀ-Ú][A-Za-zÀ-Ú]*(?:\s+[A-Za-zÀ-Ú]+)*)\s+(\d+(?:[.,]\d+)?)\s*cm$/i)
    if (!m) return null
    const key = m[1].trim().toUpperCase()
    cells.push({ label: LABEL[key] ?? m[1].trim(), val: m[2] })
  }
  return cells.length > 0 ? { size: null, cells } : null
}

function parseAll(raw: string): Table | null {
  const variants = raw.split('|').map(s => s.trim()).filter(Boolean)
  if (variants.length === 1) {
    const rowB = parseFormatB(variants[0])
    if (rowB) return { cols: rowB.cells.map(c => c.label), rows: [rowB] }
    const rowC = parseFormatC(variants[0])
    if (rowC) return { cols: rowC.cells.map(c => c.label), rows: [rowC] }
  }
  const rows: Row[] = []
  for (const v of variants) {
    const row = parseFormatA(v)
    if (!row) return null
    rows.push(row)
  }
  const cols = rows.reduce((best, r) => r.cells.length > best.length ? r.cells.map(c => c.label) : best, [] as string[])
  return { cols, rows }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function DimensoesDisplay({ raw, acabamento }: { raw?: string | null; acabamento?: string | null }) {
  const table = raw && raw.trim().length > 1 ? parseAll(raw) : null
  const cores = acabamento
    ? acabamento.split(/[+,/]/).map(s => s.trim()).filter(Boolean)
    : []

  const sectionLabel: React.CSSProperties = {
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.68rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    margin: 0,
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 14px',
    textAlign: 'left',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }

  const tdSize: React.CSSProperties = {
    padding: '11px 14px',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
  }

  const tdVal: React.CSSProperties = {
    padding: '11px 14px',
    fontWeight: 400,
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
  }

  const temSize = table?.rows.some(r => r.size !== null) ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Dimensões */}
      {table ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={sectionLabel}>Dimensões</p>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: 'var(--surface-hover)' }}>
                  {temSize && <th style={{ ...thStyle, width: '22%' }}>Tamanho</th>}
                  {table.cols.map(col => <th key={col} style={thStyle}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: i < table.rows.length - 1 ? '1px solid var(--border)' : 'none',
                    background: i % 2 === 0 ? 'transparent' : 'var(--surface-hover)',
                  }}>
                    {temSize && <td style={tdSize}>{row.size ?? '—'}</td>}
                    {table.cols.map(col => {
                      const cell = row.cells.find(c => c.label === col)
                      return <td key={col} style={tdVal}>{cell ? `${cell.val}cm` : '—'}</td>
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
          <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', margin: 0 }}>
            {raw.replace(/CM/gi, 'cm').replace(/[Xx]/g, ' × ')}
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
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                }}>
                  {/* Swatch */}
                  <span style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: swatchColor ?? 'var(--border)',
                    border: '1.5px solid rgba(128,128,128,0.25)',
                    boxShadow: swatchColor ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
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
