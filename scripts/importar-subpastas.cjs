/**
 * importar-subpastas.cjs
 * Lê cada subpasta de "imagens dos produtos" da pasta com acento (onde o usuário salva),
 * copia as imagens para public/, atualiza o banco e faz merge de "Mesa & Cadeira X".
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const CATALOG_PASTA  = 'Aco Mobilia 2025-7'
const SRC_BASE       = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\Aço Mobilia 2025-7\\imagens dos produtos'
const PUBLIC_BASE    = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)
const IMG_EXTS       = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif'])

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!cat) { console.error('Catálogo não encontrado'); process.exit(1) }

// ── Ordena: pag (sem recorte) → recortes → outros → gemini (último)
function sortImages(files) {
  const rank = f => {
    const l = f.toLowerCase()
    if (l.includes('gemini'))                      return 3
    if (l.includes('recorte'))                     return 1
    if (/pag[\s_-]*\d+/.test(l) || l.startsWith('pag')) return 0
    return 2
  }
  return [...files].sort((a, b) => {
    const dr = rank(a) - rank(b)
    if (dr !== 0) return dr
    return a.localeCompare(b)
  })
}

// ── Copia arquivo para public e retorna URL
function copyAndUrl(srcDir, subpasta, filename) {
  const destDir = path.join(PUBLIC_BASE, subpasta)
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(path.join(srcDir, filename), path.join(destDir, filename))
  return `/imagens/${encodeURIComponent(CATALOG_PASTA)}/${encodeURIComponent(subpasta)}/${encodeURIComponent(filename)}`
}

// ── Lê produto(s) do banco correspondentes ao nome da pasta
function findProducts(nomePasta) {
  // Caso "Mesa & Cadeira X" — busca cadeira e mesa separadas
  const mcMatch = nomePasta.match(/^Mesa\s*&\s*Cadeira\s+(.+)$/i)
  if (mcMatch) {
    const base = mcMatch[1].trim()
    const cadeira = db.prepare(
      "SELECT * FROM produtos WHERE catalogo_id = ? AND nome LIKE ? LIMIT 1"
    ).get(cat.id, `%Cadeira ${base}%`)
    const mesa = db.prepare(
      "SELECT * FROM produtos WHERE catalogo_id = ? AND nome LIKE ? LIMIT 1"
    ).get(cat.id, `%Mesa ${base}%`)
    return { tipo: 'merge', nome: nomePasta, cadeira, mesa }
  }

  // Busca direta pelo nome da pasta
  const direto = db.prepare(
    "SELECT * FROM produtos WHERE catalogo_id = ? AND nome LIKE ? LIMIT 1"
  ).get(cat.id, `%${nomePasta}%`)
  return { tipo: 'simples', produto: direto }
}

// ── Processa cada subpasta
const subpastas = fs.readdirSync(SRC_BASE, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

let totalAtualizados = 0

for (const subpasta of subpastas) {
  const srcDir = path.join(SRC_BASE, subpasta)
  const arquivos = fs.readdirSync(srcDir)
    .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))

  if (arquivos.length === 0) continue

  const ordenados = sortImages(arquivos)
  const { tipo, ...info } = findProducts(subpasta)

  if (tipo === 'merge') {
    const { nome, cadeira, mesa } = info
    if (!cadeira && !mesa) {
      console.warn(`  [${subpasta}] Nenhum produto encontrado no banco. Pulando.`)
      continue
    }

    // Copiar imagens
    const urls = ordenados.map(f => copyAndUrl(srcDir, subpasta, f))

    // Produto principal: a cadeira (ou o que existir)
    const principal = cadeira ?? mesa
    const outroId   = cadeira && mesa ? mesa.id : null

    // Renomear para "Mesa & Cadeira X" e atribuir imagens
    db.prepare('UPDATE produtos SET nome = ?, imagens = ? WHERE id = ?')
      .run(nome, JSON.stringify(urls), principal.id)

    // Apagar o produto duplicado
    if (outroId) db.prepare('DELETE FROM produtos WHERE id = ?').run(outroId)

    console.log(`  ✓ [merge] "${nome}" — ${urls.length} imagem(ns)`)
    urls.forEach((u, i) => console.log(`      ${i + 1}. ${decodeURIComponent(u.split('/').pop())}`))
    totalAtualizados++

  } else {
    const { produto } = info
    if (!produto) {
      console.warn(`  [${subpasta}] Produto não encontrado. Pulando.`)
      continue
    }

    const urls = ordenados.map(f => copyAndUrl(srcDir, subpasta, f))
    db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')
      .run(JSON.stringify(urls), produto.id)

    console.log(`  ✓ "${produto.nome}" — ${urls.length} imagem(ns)`)
    urls.forEach((u, i) => console.log(`      ${i + 1}. ${decodeURIComponent(u.split('/').pop())}`))
    totalAtualizados++
  }
}

console.log(`\n${totalAtualizados} produto(s) atualizados.`)
db.close()
