// Parser de dimensões — FONTE ÚNICA usada pelo site (DimensoesDisplay) e pelos scripts (validar-dimensoes.cjs, importar-*.cjs, export-data).
// Use somente sintaxe apagável (sem enum/namespace) para rodar direto no Node via type-stripping.
export interface Cell  { label: string; val: string }
export interface Row   { size: string | null; cells: Cell[] }
export interface Table { cols: string[]; rows: Row[] }

const LABEL: Record<string, string> = {
  L: 'Largura', P: 'Prof.', A: 'Altura', H: 'Altura',
  C: 'Compr.', Ø: 'Diâm.', ALCANCE: 'Alcance',
}
const POSITIONAL = ['L', 'P', 'H']

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseFormatA(raw: string): Row | null {
  const sizeM = raw.match(/^([A-Z0-9]+)-(.+)$/i)
  const hasSizeLetter = sizeM ? /[A-Za-z]/.test(sizeM[1]) : false
  const size  = hasSizeLetter ? sizeM![1] : null
  const body  = hasSizeLetter ? sizeM![2] : raw
  // Medidas rotuladas COLADAS, sem "x" entre elas (ex.: L200A90P45CM) → separa antes de cada letra+número
  const GLUED = /^(?:[A-ZØ]\s*\d+(?:[.,]\d+)?(?:-\d+(?:[.,]\d+)?)?){2,}(?:CM)?$/i
  const tokens = body.split(/[Xx×]/i).map(t => t.trim())
    .flatMap(t => GLUED.test(t) ? t.split(/(?=[A-ZØ]\s*\d)/i).map(x => x.trim()) : [t])
  const cells: Cell[] = []
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    const mDiam = tok.match(/^Ø\s*(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mDiam) { cells.push({ label: 'Diâm.', val: mDiam[1] }); continue }
    const mDot = tok.match(/^([A-Z])\.(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(?:CM)?$/i)
    if (mDot) { cells.push({ label: LABEL[mDot[1].toUpperCase()] ?? mDot[1].toUpperCase(), val: mDot[2] }); continue }
    // L179, A77, P44cm — letra colada no número (ex: L179xA77xP44cm)
    // aceita espaço ("L 266") e faixa ("L 207-514")
    const mLabeled = tok.match(/^([A-ZÀ-Ú])\s*(\d+(?:[.,]\d+)?(?:[\/-]\d+(?:[.,]\d+)?)?)\s*(?:CM)?$/i)
    if (mLabeled) { cells.push({ label: LABEL[mLabeled[1].toUpperCase()] ?? mLabeled[1].toUpperCase(), val: mLabeled[2] }); continue }
    const mNum = tok.match(/^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)\s*(?:CM)?$/i)
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

// Formato D: "A: 0,78m | L: 0,56m | P: 0,53m | Assento: 0,44m | Estrutura: Metalão 10x30"
function parseFormatD(variants: string[]): Table | null {
  const cells: Cell[] = []
  for (const v of variants) {
    const m = v.match(/^([A-Za-zÀ-úØ]+(?:\s+[A-Za-zÀ-úØ]+)*)\s*:\s*(.+)$/i)
    if (!m) return null
    const key = m[1].trim().toUpperCase()
    const rawVal = m[2].trim()
    const numM = rawVal.match(/^([0-9,.]+)\s*(m|cm)?$/i)
    let val: string
    if (numM) {
      const num = numM[1].replace(',', '.')
      const unit = (numM[2] ?? '').toLowerCase()
      val = unit === 'm' ? String(Math.round(parseFloat(num) * 100)) : num
    } else {
      val = rawVal
    }
    cells.push({ label: LABEL[key] ?? m[1].trim(), val })
  }
  if (cells.length === 0) return null
  return { cols: cells.map(c => c.label), rows: [{ size: null, cells }] }
}

// Formato E — cobre todos os casos de mesas com múltiplos tamanhos:
//   NxN puro:              "1,10x2,70m | 1,00x2,20m | A: 0,76m | Estrutura: X"
//   NxN com descritor:     "0,50x0,50m redonda | 0,44x0,40m redonda | Estrutura: X"
//   NxN com parêntese:     "0,70x1,21m (A: 0,34m) | 0,42x0,73m (A: 0,29m) | Estrutura: X"
//   Variantes de forma:    "1,20x2,70m | Redonda: 1,50m | Redonda: 1,30m | A: 0,76m"
function parseFormatE(variants: string[]): Table | null {
  if (!variants.some(v => /^\d/.test(v))) return null

  // Parse um valor numérico, ignorando palavras descritivas no final ("redonda", "quadrada"…)
  const parseNum = (s: string, fallbackUnit = ''): string | null => {
    const clean = s.trim().replace(/\s+[a-záàãâéêíóôõúüç]+$/i, '').trim()
    const m = clean.match(/^([0-9,.]+)\s*(m|cm)?$/i)
    if (!m) return null
    const n = m[1].replace(',', '.')
    const u = m[2] ? m[2].toLowerCase() : fallbackUnit
    return u === 'm' ? String(Math.round(parseFloat(n) * 100)) : n
  }

  // Descobre a unidade da última parte de um NxN, ignorando palavras descritivas
  const getUnit = (s: string): string => {
    const clean = s.trim().replace(/\s+[a-záàãâéêíóôõúüç]+$/i, '').trim()
    return clean.match(/^[0-9,.]+\s*(m|cm)$/i)?.[1]?.toLowerCase() ?? ''
  }

  // Classifica variantes rotuladas: chaves de dimensão → coluna fixa; formas nomeadas → linha extra
  const fixedCells: Cell[] = []
  const shapeRows: { label: string; val: string }[] = []

  for (const v of variants) {
    if (/^\d/.test(v)) continue
    const m = v.match(/^([A-Za-zÀ-úØ]+(?:\s+[A-Za-zÀ-úØ]+)*)\s*:\s*(.+)$/i)
    if (!m) return null
    const key = m[1].trim().toUpperCase()
    const rawVal = m[2].trim()
    const num = parseNum(rawVal)
    if (key in LABEL || !num) {
      fixedCells.push({ label: LABEL[key] ?? m[1].trim(), val: num ?? rawVal })
    } else {
      shapeRows.push({ label: m[1].trim(), val: num })
    }
  }

  // Linhas NxN, com suporte a parêntese de altura: "0,70x1,21m (A: 0,34m)"
  const rows: Row[] = []
  for (const v of variants) {
    if (!/^\d/.test(v)) continue
    const parenM = v.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/)
    const sizeStr = parenM ? parenM[1].trim() : v.trim()
    const parenCells: Cell[] = []
    if (parenM) {
      for (const part of parenM[2].split(/[,;]/)) {
        const pm = part.trim().match(/^([A-Za-zÀ-úØ]+)\s*:\s*([0-9,.]+)\s*(m|cm)?$/i)
        if (pm) {
          const n = pm[2].replace(',', '.')
          const u = (pm[3] ?? '').toLowerCase()
          parenCells.push({ label: LABEL[pm[1].toUpperCase()] ?? pm[1].trim(), val: u === 'm' ? String(Math.round(parseFloat(n) * 100)) : n })
        }
      }
    }
    const parts = sizeStr.split(/\s*[x×]\s*/i)
    if (parts.length < 2) return null
    const lastUnit = getUnit(parts[parts.length - 1])
    const v1 = parseNum(parts[0], lastUnit)
    const v2 = parseNum(parts[parts.length - 1], lastUnit)
    if (!v1 || !v2) return null
    rows.push({ size: null, cells: [{ label: 'Largura', val: v1 }, { label: 'Compr.', val: v2 }, ...parenCells, ...fixedCells] })
  }

  // Linhas de forma nomeada (Redonda, Quadrada…)
  for (const sr of shapeRows) {
    rows.push({ size: sr.label, cells: [{ label: 'Diâm./Lado', val: sr.val }, ...fixedCells] })
  }

  if (rows.length === 0) return null

  const PREF = ['Largura', 'Compr.', 'Diâm./Lado', 'Altura']
  const allCols: string[] = []
  for (const row of rows) for (const cell of row.cells) if (!allCols.includes(cell.label)) allCols.push(cell.label)
  const cols = [...PREF.filter(c => allCols.includes(c)), ...allCols.filter(c => !PREF.includes(c))]
  return { cols, rows }
}

export function parseAll(raw: string): Table | null {
  const variants = raw.split('|').map(s => s.trim()).filter(Boolean)
  if (variants.length === 1) {
    const rowB = parseFormatB(variants[0])
    if (rowB) return { cols: rowB.cells.map(c => c.label), rows: [rowB] }
    const rowC = parseFormatC(variants[0])
    if (rowC) return { cols: rowC.cells.map(c => c.label), rows: [rowC] }
  }
  // Tenta formato D: "LABEL: valor_com_unidade | ..."
  const tableD = parseFormatD(variants)
  if (tableD) return tableD
  const tableE = parseFormatE(variants)
  if (tableE) return tableE
  const rows: Row[] = []
  for (const v of variants) {
    const row = parseFormatA(v)
    if (!row) return null
    rows.push(row)
  }
  const cols = rows.reduce((best, r) => r.cells.length > best.length ? r.cells.map(c => c.label) : best, [] as string[])
  return { cols, rows }
}


// Texto cru exibido quando a string NÃO é reconhecida: só troca "x" por "×" entre medidas (nunca dentro de palavras como "Baixo")
export function formatarDimensoesCruas(raw: string): string {
  return raw.replace(/CM/gi, 'cm').replace(/(?<=\d|cm)\s*[xX]\s*(?=[A-Za-zØ]?\s*\d)/g, ' × ')
}

// Classifica a string de dimensões: 'ok' (vira tabela), 'vazio', 'descritivo' (texto sem dígitos, ex.: "Modular") ou 'invalido'
export function statusDimensoes(raw?: string | null): 'ok' | 'vazio' | 'descritivo' | 'invalido' {
  if (!raw || raw.trim().length <= 1) return 'vazio'
  if (parseAll(raw)) return 'ok'
  return /\d/.test(raw) ? 'invalido' : 'descritivo'
}
