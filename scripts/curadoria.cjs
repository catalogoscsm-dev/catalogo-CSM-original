/**
 * curadoria.cjs
 * Abre abas do Brave para cada produto recém-inserido, facilitando revisão visual.
 *
 * Modos de uso:
 *   node scripts/curadoria.cjs --catalogo "ARMIL COMPLETO 2024"
 *   node scripts/curadoria.cjs --horas 2
 *   node scripts/curadoria.cjs --catalogo "ARMIL COMPLETO 2024" --horas 4
 *   node scripts/curadoria.cjs --ids 101,102,103
 *
 * Opções:
 *   --catalogo <nome>   Filtra por catálogo (coluna pasta)
 *   --horas <N>         Apenas produtos inseridos nas últimas N horas (default: sem limite)
 *   --ids <id,id,...>   Lista de IDs específicos
 *   --limite <N>        Máximo de abas (default: 30)
 *   --base-url <url>    Base URL do site (default: http://localhost:3000)
 *   --prod              Atalho para usar a URL de produção do Vercel
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const { execSync, spawn } = require('child_process')

// ── Lê ADMIN_SECRET do .env.local ────────────────────────────────────────────

function readAdminSecret() {
  const envPath = path.join(__dirname, '..', '.env.local')
  try {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const m = line.match(/^ADMIN_SECRET=(.+)$/)
      if (m) return m[1].trim()
    }
  } catch {}
  return null
}

const ADMIN_SECRET = readAdminSecret()

const DB_PATH    = path.join(__dirname, '..', 'database', 'catalogo.db')
const PROD_URL   = 'https://catalogo-csm.vercel.app'
const LOCAL_URL  = 'http://localhost:3000'

// ── Parse args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const get  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null }
const has  = (flag) => args.includes(flag)

const catalogoNome = get('--catalogo')
const horas        = get('--horas')   ? Number(get('--horas'))   : null
const idsArg       = get('--ids')     ? get('--ids').split(',').map(Number) : null
const limite       = get('--limite')  ? Number(get('--limite'))  : 30
const baseUrl      = has('--prod')    ? PROD_URL : (get('--base-url') ?? LOCAL_URL)

if (!catalogoNome && !horas && !idsArg) {
  console.error(`
Uso: node scripts/curadoria.cjs [opções]

  --catalogo <nome>   Produtos de um catálogo específico
  --horas <N>         Produtos inseridos nas últimas N horas
  --ids <id,id,...>   IDs específicos
  --limite <N>        Máximo de abas abertas (default: 30)
  --base-url <url>    URL base (default: http://localhost:3000)
  --prod              Usa a URL de produção do Vercel

Exemplos:
  node scripts/curadoria.cjs --catalogo "ARMIL COMPLETO 2024"
  node scripts/curadoria.cjs --horas 2
  node scripts/curadoria.cjs --catalogo "SIER 2025" --horas 6 --prod
`)
  process.exit(1)
}

// ── Consulta banco ────────────────────────────────────────────────────────────

const db = new Database(DB_PATH, { readonly: true })

let query = `
  SELECT p.id, p.nome, p.pagina, c.pasta AS catalogo
  FROM produtos p
  JOIN catalogos c ON c.id = p.catalogo_id
  WHERE 1=1
`
const params = []

if (idsArg) {
  query += ` AND p.id IN (${idsArg.map(() => '?').join(',')})`
  params.push(...idsArg)
} else {
  if (catalogoNome) {
    query += ` AND c.pasta = ?`
    params.push(catalogoNome)
  }
  if (horas) {
    query += ` AND p.criado_em >= datetime('now', ? || ' hours')`
    params.push(`-${horas}`)
  }
}

query += ` ORDER BY p.id DESC`

const produtos = db.prepare(query).all(...params)
db.close()

if (produtos.length === 0) {
  console.log('\nNenhum produto encontrado com os filtros informados.\n')
  process.exit(0)
}

const total    = produtos.length
const cortados = Math.max(0, total - limite)
const abrir    = produtos.slice(0, limite)

console.log(`\n── Curadoria ──────────────────────────────────────`)
if (catalogoNome) console.log(`Catálogo : ${catalogoNome}`)
if (horas)        console.log(`Período  : últimas ${horas}h`)
console.log(`Produtos : ${total} encontrados`)
if (cortados > 0) console.log(`Limite   : abrindo ${limite} abas (${cortados} omitidos — use --limite para aumentar)`)
console.log(`Base URL : ${baseUrl}`)
console.log(`───────────────────────────────────────────────────\n`)

abrir.forEach((p, i) => {
  const pag = p.pagina ? `  [pág ${p.pagina}]` : ''
  console.log(`  ${String(i + 1).padStart(3)}. #${p.id}  ${p.nome}${pag}`)
})
console.log()

// ── Encontra Brave ────────────────────────────────────────────────────────────

const bravePaths = [
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe')
    : null,
].filter(Boolean)

let bravePath = null
for (const p of bravePaths) {
  try {
    const { existsSync } = require('fs')
    if (existsSync(p)) { bravePath = p; break }
  } catch {}
}

// ── Abre as abas ──────────────────────────────────────────────────────────────

const isLocal = baseUrl.startsWith('http://localhost') || baseUrl.startsWith('http://127.0.0.1')

const produtoUrls = abrir.map(p => `${baseUrl}/produto/${p.id}`)

// Em localhost: abre a página de login como 1º tab.
// Os tabs de produto são abertos em seguida mas o Brave os carrega lazy —
// quando você clicar neles já estarão com o cookie de admin setado.
const urls = isLocal
  ? [`${baseUrl}/admin/login`, ...produtoUrls]
  : produtoUrls

if (isLocal) {
  console.log(`Admin : tab 1 = login admin — faça login e depois navegue pelos produtos\n`)
}

if (bravePath) {
  console.log(`Abrindo ${urls.length} abas no Brave...\n`)
  spawn(bravePath, ['--new-window', ...urls], { detached: true, stdio: 'ignore' }).unref()
} else {
  console.log('Brave não encontrado — abrindo no navegador padrão...\n')
  for (const url of urls) {
    try { execSync(`start "" "${url}"`, { shell: true }) } catch {}
  }
}

console.log('Pronto! Confira as abas abertas.\n')
