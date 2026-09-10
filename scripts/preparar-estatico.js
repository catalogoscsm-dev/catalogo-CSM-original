/**
 * preparar-estatico.js
 *
 * Prepara o catálogo para exportação estática (GitHub Pages).
 *
 * O que faz:
 *  1. Copia todas as imagens de "catalogos separados/{cat}/imagens dos produtos/"
 *     para "public/imagens/{cat}/"
 *  2. Atualiza os paths no banco de dados de:
 *       /api/imagem/{catalog}/imagens%20dos%20produtos/{file}
 *     para:
 *       /imagens/{catalog}/{file}
 *
 * Uso:
 *   node scripts/preparar-estatico.js
 *
 * Rode antes de: npm run build
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const DB_PATH        = path.join(__dirname, '..', 'database', 'catalogo.db')
const BASE_CATALOGOS = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados'
const PUBLIC_IMAGENS = path.join(__dirname, '..', 'public', 'imagens')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// Extrai catalog e filename de URLs no formato antigo (/api/imagem/...) e novo (/imagens/...)
function parseUrl(url) {
  // Novo formato: /imagens/{catalog}/{filename}
  const mNew = url.match(/^\/imagens\/([^/]+)\/(.+)$/)
  if (mNew) return { catalog: decodeURIComponent(mNew[1]), filename: decodeURIComponent(mNew[2]), isNew: true }

  // Formato antigo: /api/imagem/{catalog}/imagens%20dos%20produtos/{filename}
  const mOld = url.match(/^\/api\/imagem\/([^/]+)\/imagens%20dos%20produtos\/(.+)$/)
  if (mOld) return { catalog: decodeURIComponent(mOld[1]), filename: decodeURIComponent(mOld[2]), isNew: false }

  return null
}

function buildNewPath(catalog, filename) {
  return `/imagens/${encodeURIComponent(catalog)}/${encodeURIComponent(filename)}`
}

console.log('\n── Preparando site estático ──────────────────────────────\n')

const rows = db.prepare("SELECT id, imagens FROM produtos WHERE imagens != '[]'").all()

let copiedFiles = 0
let skippedFiles = 0
let updatedRows  = 0

const updateStmt = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')

const doWork = db.transaction(() => {
  for (const row of rows) {
    let imgs
    try { imgs = JSON.parse(row.imagens) } catch { continue }

    let changed = false
    const newImgs = imgs.map(url => {
      const parsed = parseUrl(url)
      if (!parsed) return url

      const { catalog, filename, isNew } = parsed

      // Copiar arquivo se ainda não estiver em public/imagens/
      const srcPath  = path.join(BASE_CATALOGOS, catalog, 'imagens dos produtos', filename)
      const destDir  = path.join(PUBLIC_IMAGENS, catalog)
      const destPath = path.join(destDir, filename)

      if (!fs.existsSync(destPath)) {
        if (fs.existsSync(srcPath)) {
          fs.mkdirSync(destDir, { recursive: true })
          fs.copyFileSync(srcPath, destPath)
          copiedFiles++
        }
      } else {
        skippedFiles++
      }

      // Atualizar path para o novo formato
      const newPath = buildNewPath(catalog, filename)
      if (!isNew) changed = true
      return newPath
    })

    if (changed) {
      updateStmt.run(JSON.stringify(newImgs), row.id)
      updatedRows++
    }
  }
})

doWork()

console.log(`✓ Imagens copiadas  : ${copiedFiles}`)
console.log(`✓ Já existiam       : ${skippedFiles}`)
console.log(`✓ Produtos atualizados no banco: ${updatedRows}`)
console.log('\nAgora rode: npm run build\n')
