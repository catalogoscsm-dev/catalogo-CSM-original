/**
 * extrair-paginas-pdf.js
 * Extrai páginas de um PDF e salva nas pastas pag XX do catálogo correspondente.
 *
 * Uso:
 *   node scripts/extrair-paginas-pdf.js "NOME DA PASTA DO CATALOGO"
 *
 * Exemplos:
 *   node scripts/extrair-paginas-pdf.js "ALUMINAS 2024"
 *   node scripts/extrair-paginas-pdf.js "ARMIL COMPLETO 2024"
 *
 * O script:
 *   1. Lê o PDF da pasta do catálogo
 *   2. Para cada página que tem produto no banco, salva a imagem em pag XX/a.jpg
 *   3. Não sobrescreve imagens que já existem (usa --force para forçar)
 *
 * Flags:
 *   --force      Sobrescreve imagens já existentes
 *   --dpi 150    Resolução da imagem (padrão: 150 DPI — boa qualidade, tamanho razoável)
 *   --todas      Extrai todas as páginas, mesmo sem produto no banco
 */

const fs       = require('fs')
const path     = require('path')
const Database = require('better-sqlite3')

const { BASE_CATALOGOS } = require('./config.cjs')
const DB_PATH = path.join(__dirname, '..', 'database', 'catalogo.db')

const args        = process.argv.slice(2)
const catalogName = args.find(a => !a.startsWith('--'))
const forceFlag   = args.includes('--force')
const todasFlag   = args.includes('--todas')
const dpiArg      = args.indexOf('--dpi')
const DPI         = dpiArg !== -1 ? parseInt(args[dpiArg + 1]) : 150

if (!catalogName) {
  console.error('Uso: node scripts/extrair-paginas-pdf.js "NOME DO CATALOGO"')
  process.exit(1)
}

async function main() {
  // ── Verifica catálogo no banco ───────────────────────────────────────────
  const db  = new Database(DB_PATH)
  const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(catalogName)
  if (!cat) {
    console.error(`Catálogo "${catalogName}" não encontrado no banco.`)
    db.close(); process.exit(1)
  }

  const produtos = db.prepare('SELECT DISTINCT pagina FROM produtos WHERE catalogo_id = ?').all(cat.id)
  const paginasComProduto = new Set(produtos.map(p => p.pagina))
  console.log(`Catálogo: ${catalogName} | Páginas com produto: ${paginasComProduto.size}`)
  db.close()

  // ── Encontra o PDF ───────────────────────────────────────────────────────
  const pastaPath = path.join(BASE_CATALOGOS, catalogName)
  const pdfs = fs.readdirSync(pastaPath).filter(f => f.toLowerCase().endsWith('.pdf'))
  if (!pdfs.length) { console.error('Nenhum PDF encontrado na pasta.'); process.exit(1) }
  const pdfPath = path.join(pastaPath, pdfs[0])
  console.log(`PDF: ${pdfs[0]}`)

  // ── Carrega pdfjs (ES module via dynamic import) ─────────────────────────
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerPath = path.resolve(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath.replace(/\\/g, '/')}`
  const { createCanvas } = require('@napi-rs/canvas')

  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const pdfDoc = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise
  const totalPages = pdfDoc.numPages
  console.log(`Total de páginas no PDF: ${totalPages}\n`)

  const imgBase = path.join(pastaPath, 'imagens dos produtos')
  let extraidas = 0
  let puladas   = 0

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const temProduto = paginasComProduto.has(pageNum)
    if (!temProduto && !todasFlag) continue

    const pastaDestino = path.join(imgBase, `pag ${String(pageNum).padStart(2, '0')}`)
    // Nome único por página: "pag 08.jpg" → identificado como capa pelo importar
    const arquivoDestino = path.join(pastaDestino, `pag ${String(pageNum).padStart(2, '0')}.jpg`)

    if (fs.existsSync(arquivoDestino) && !forceFlag) {
      process.stdout.write(`  [pag ${String(pageNum).padStart(3)}] já existe — pulando\n`)
      puladas++
      continue
    }

    process.stdout.write(`  [pag ${String(pageNum).padStart(3)}] extraindo...`)

    const page     = await pdfDoc.getPage(pageNum)
    const scale    = DPI / 72  // PDF nativo é 72 DPI
    const viewport = page.getViewport({ scale })

    const canvas  = createCanvas(Math.round(viewport.width), Math.round(viewport.height))
    const context = canvas.getContext('2d')

    // Fundo branco
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    await page.render({
      canvasContext: context,
      viewport,
    }).promise

    fs.mkdirSync(pastaDestino, { recursive: true })
    const jpegBuffer = canvas.toBuffer('image/jpeg', { quality: 90 })
    fs.writeFileSync(arquivoDestino, jpegBuffer)
    page.cleanup()

    console.log(` ✓ (${canvas.width}x${canvas.height}px)`)
    extraidas++
  }

  console.log(`\n✓ ${extraidas} página(s) extraída(s) | ${puladas} já existiam`)
  console.log(`\nPróximo passo:`)
  console.log(`  node scripts/importar-${catalogName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')}.cjs`)
}

main().catch(e => { console.error('\nErro:', e.message); process.exit(1) })
