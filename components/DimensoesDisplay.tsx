// ─── tipos ───────────────────────────────────────────────────────────────────

interface Cell  { label: string; val: string }
interface Row   { size: string | null; cells: Cell[] }
interface Table { cols: string[]; rows: Row[] }

// ─── mapa de abreviações → rótulos legíveis ──────────────────────────────────

const LABEL: Record<string, string> = {
  L: 'Largura', P: 'Prof.', A: 'Altura', H: 'Altura',
  C: 'Compr.', Ø: 'Diâm.', ALCANCE: 'Alcance',
}
const POSITIONAL = ['L', 'P', 'H'] // colunas inferidas por posição quando sem prefixo

// ─── parser A: "P-115CMX45CMXH.70CM" / "P-Ø45CMXH.50CM" ────────────────────

function parseFormatA(raw: string): Row | null {
  const sizeM = raw.match(/^([A-Z]+)-(.+)$/i)
  const size  = sizeM ? sizeM[1].toUpperCase() : null
  const body  = sizeM ? sizeM[2] : raw

  const tokens = body.split(/[Xx×]/i).map(t => t.trim())
  const cells: Cell[] = []

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]

    // Ø45CM  ou  Ø45
    const mDiam = tok.match(/^Ø\s*(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mDiam) { cells.push({ label: 'Diâm.', val: mDiam[1].replace('/', '/') }); continue }

    // H.70CM  /  A.80CM  /  H.65CM/92CM
    const mDot = tok.match(/^([A-Z])\.(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mDot) { cells.push({ label: LABEL[mDot[1].toUpperCase()] ?? mDot[1].toUpperCase(), val: mDot[2] }); continue }

    // 115CM  /  45CM  /  65/92CM
    const mNum = tok.match(/^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mNum) {
      const key = POSITIONAL[i] ?? `D${i + 1}`
      cells.push({ label: LABEL[key] ?? key, val: mNum[1] })
      continue
    }
  }

  return cells.length > 0 ? { size, cells } : null
}

// ─── parser B: "L 65 x P 65 x A 85 cm" ─────────────────────────────────────

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

// ─── parser C: "H 175 cm / Alcance 90 cm" ───────────────────────────────────

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

// ─── parse principal: tenta os três formatos ─────────────────────────────────

function parseAll(raw: string): Table | null {
  const variants = raw.split('|').map(s => s.trim()).filter(Boolean)

  // Formato B ou C tem apenas 1 variant sem pipe
  if (variants.length === 1) {
    const rowB = parseFormatB(variants[0])
    if (rowB) return { cols: rowB.cells.map(c => c.label), rows: [rowB] }
    const rowC = parseFormatC(variants[0])
    if (rowC) return { cols: rowC.cells.map(c => c.label), rows: [rowC] }
  }

  // Formato A: múltiplos variants separados por |
  const rows: Row[] = []
  for (const v of variants) {
    const row = parseFormatA(v)
    if (!row) return null
    rows.push(row)
  }

  // Deriva colunas da primeira linha (mais completa)
  const cols = rows.reduce((best, r) => r.cells.length > best.length ? r.cells.map(c => c.label) : best, [] as string[])
  return { cols, rows }
}

// ─── componente ──────────────────────────────────────────────────────────────

export default function DimensoesDisplay({ raw, acabamento }: { raw?: string | null; acabamento?: string | null }) {
  const table = raw && raw.trim().length > 1 ? parseAll(raw) : null
  const cores = acabamento
    ? acabamento.split(/[+,/]/).map(s => s.trim()).filter(Boolean)
    : []

  const titleStyle: React.CSSProperties = {
    color: 'var(--bronze)', fontWeight: 700,
    fontSize: '0.72rem', letterSpacing: '0.18em',
    textTransform: 'uppercase', margin: 0,
  }
  const thStyle: React.CSSProperties = {
    padding: '9px 14px', textAlign: 'left',
    color: 'var(--bronze)', fontWeight: 700,
    fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase',
  }
  const tdVal: React.CSSProperties = {
    padding: '11px 14px', fontWeight: 500,
    fontSize: '0.875rem', color: 'var(--bronze)',
  }
  const tdSize: React.CSSProperties = {
    padding: '11px 14px', fontWeight: 700,
    fontSize: '0.875rem', color: 'var(--charcoal)',
  }

  const temSize = table?.rows.some(r => r.size !== null) ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Dimensões */}
      {table ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={titleStyle}>Dimensões</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'rgba(140,110,24,0.09)' }}>
                {temSize && <th style={{ ...thStyle, width: '22%' }}>Tamanho</th>}
                {table.cols.map(col => <th key={col} style={thStyle}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {temSize && <td style={tdSize}>{row.size ?? '—'}</td>}
                  {table.cols.map(col => {
                    const cell = row.cells.find(c => c.label === col)
                    return (
                      <td key={col} style={tdVal}>
                        {cell ? `${cell.val}cm` : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : raw && raw.trim().length > 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={titleStyle}>Dimensões</p>
          <p style={{ color: 'var(--charcoal)', fontSize: '0.875rem', margin: 0 }}>
            {raw.replace(/CM/gi, 'cm').replace(/[Xx]/g, ' × ')}
          </p>
        </div>
      ) : null}

      {/* Acabamentos / Cores */}
      {cores.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={titleStyle}>Acabamentos / Cores</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {cores.map((cor, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--charcoal)' }}>
                <span style={{
                  width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--border)', border: '1.5px solid var(--muted)',
                }} />
                {cor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
