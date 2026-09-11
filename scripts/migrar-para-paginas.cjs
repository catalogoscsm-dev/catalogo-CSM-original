/**
 * migrar-para-paginas.cjs
 * Renomeia pastas de "imagens dos produtos" de nome-do-produto para pag XX.
 * Também move arquivos em public/ e atualiza URLs no banco.
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const CATALOG_PASTA = 'Aco Mobilia 2025-7'
const SRC_BASE      = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\Aço Mobilia 2025-7\\imagens dos produtos'
const PUBLIC_BASE   = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)

// Mapeamento manual: nome da pasta atual → número da página
// (cada produto usa a página onde aparece como produto principal)
const MAPA = {
  'Mesa & Cadeira Athenas':          4,
  'Mesa & Cadeira Santorini':        6,
  'Cadeira Atrani Tapeçada':         8,
  'Mesa Capri':                     10,
  'Mesa Siena':                     12,
  'Cadeira Luxor':                  14,
  'Mesa Louvre':                    14,
  'Cadeira Ágatha':                 16,
  'Mesa Milão':                     16,
  'Cadeira Madrid':                 18,
  'Mesa Amalfi':                    18,
  'Cadeira Milão':                  20,
  'Cadeira Belagio':                22,
  'Cadeira Caribe':                 24,
  'Mesa Topazio':                   26,
  'Poltrona Madrid':                30,
  'Mesa Madrid':                    32,
  'Poltrona Luxor':                 36,
  'Mesa Milão Office':              40,
  'Cadeira Bora Bora Corda Náutica':42,
  'Mesa Moorea':                    42,
  'Cadeira Bora Bora':              44,
  'Mesa Taiti':                     44,
  'Banqueta Athenas Alta':          46,
  'Banqueta Athenas Baixa':         46,
  'Banqueta Caribe Alta':           48,
  'Banqueta Caribe Baixa':          48,
  'Bistrô Capri':                   48,
  'Banqueta Belagio Alta':          50,
  'Banqueta Belagio Baixa':         50,
  'Bistrô Maupiti':                 50,
  'Mesa Canto Anaa':                53,
  'Mesa Centro Raiatea':            53,
  'Poltrona Polinésia Corda Náutica':54,
  'Mesa Centro Ostuni':             55,
  'Mesa de Centro Atlas':           56,
  'Mesa Canto Sicilia':             57,
  'Mesa Canto Athenas':             57,
  'Aparador Athenas':               58,
  'Aparador Milão':                 59,
  'Aparador Louvre':                60,
}

// Páginas ambientes sem pasta própria ainda
const PAGINAS_AMBIENTE = [28, 30, 34, 38]

const pad = n => `pag ${String(n).padStart(2, '0')}`

// ── 1. Renomear/mesclar pastas de origem ──────────────────────────────────
console.log('\n── Renomeando pastas de origem ──')
const feitos = new Set()
for (const [nome, pag] of Object.entries(MAPA)) {
  const srcDir  = path.join(SRC_BASE, nome)
  const destDir = path.join(SRC_BASE, pad(pag))
  if (!fs.existsSync(srcDir)) { console.log(`  [skip] "${nome}" não existe`); continue }

  fs.mkdirSync(destDir, { recursive: true })

  // Move arquivos da pasta antiga para a nova
  const arquivos = fs.readdirSync(srcDir)
  for (const f of arquivos) {
    const src  = path.join(srcDir, f)
    const dest = path.join(destDir, f)
    if (!fs.existsSync(dest)) fs.renameSync(src, dest)
    else console.log(`  [dup] ${f} já existe em ${pad(pag)}, ignorando`)
  }
  fs.rmdirSync(srcDir)
  if (!feitos.has(pag)) { console.log(`  ✓ "${nome}" → ${pad(pag)}`); feitos.add(pag) }
  else                    console.log(`  ✓ "${nome}" mesclado em ${pad(pag)}`)
}

// ── 2. Criar pastas para páginas ambiente ─────────────────────────────────
for (const pag of PAGINAS_AMBIENTE) {
  const dir = path.join(SRC_BASE, pad(pag))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`  + Criada pasta ambiente: ${pad(pag)}`)
  }
}

// ── 3. Renomear pastas em public/ e atualizar URLs no banco ───────────────
console.log('\n── Atualizando public/ e banco ──')
const produtosComImagens = db.prepare(
  "SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? AND imagens != '[]' AND imagens IS NOT NULL"
).all(cat.id)

for (const prod of produtosComImagens) {
  const imgs = JSON.parse(prod.imagens)
  if (!imgs.length) continue

  // Descobre pasta antiga a partir da primeira URL
  // Formato: /imagens/Aco%20Mobilia%202025-7/PASTA/arquivo
  const firstUrl   = imgs[0]
  const parts      = firstUrl.split('/')
  const oldPasta   = decodeURIComponent(parts[3])        // ex: "Mesa & Cadeira Athenas"
  const pagNum     = prod.pagina
  const newPasta   = pad(pagNum)

  if (oldPasta === newPasta) { console.log(`  [ok] "${prod.nome}" já usa ${newPasta}`); continue }

  const oldPublic = path.join(PUBLIC_BASE, oldPasta)
  const newPublic = path.join(PUBLIC_BASE, newPasta)

  // Move arquivos em public/
  if (fs.existsSync(oldPublic)) {
    fs.mkdirSync(newPublic, { recursive: true })
    for (const f of fs.readdirSync(oldPublic)) {
      const src  = path.join(oldPublic, f)
      const dest = path.join(newPublic, f)
      if (!fs.existsSync(dest)) fs.renameSync(src, dest)
    }
    fs.rmdirSync(oldPublic)
    console.log(`  ✓ public/ "${oldPasta}" → "${newPasta}"`)
  }

  // Atualiza URLs no banco
  const novasUrls = imgs.map(u => {
    const p = u.split('/')
    p[3] = encodeURIComponent(newPasta)
    return p.join('/')
  })
  db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(novasUrls), prod.id)
  console.log(`  ✓ DB "${prod.nome}" URLs atualizadas`)
}

db.close()
console.log('\nMigração concluída.')
