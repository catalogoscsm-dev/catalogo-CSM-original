/**
 * scan-pdfs.js
 * Varre todos os PDFs em BASE_CATALOGOS e classifica:
 *   RICO    → texto extraível suficiente para catalogar automaticamente
 *   PARCIAL → algum texto mas provavelmente insuficiente
 *   IMAGEM  → PDF baseado em imagem, precisa de OCR externo
 *   JÁ NO BANCO → catálogo já cadastrado, pula
 */
const fs      = require('fs')
const path    = require('path')
const pdf     = require('pdf-parse')
const Database = require('better-sqlite3')

const { BASE_CATALOGOS } = require('./config.cjs')
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const catalogosNoBanco = new Set(
  db.prepare('SELECT pasta FROM catalogos').all().map(r => r.pasta)
)
db.close()

const THRESHOLD_RICO    = 1500  // caracteres úteis mínimos para catalogação automática
const THRESHOLD_PARCIAL = 300

async function scanPdf(filePath) {
  const buffer = fs.readFileSync(filePath)
  try {
    const data = await pdf(buffer)
    const chars = data.text.replace(/\s+/g, ' ').trim().length
    return { pages: data.numpages, chars }
  } catch {
    return { pages: 0, chars: 0 }
  }
}

async function main() {
  const entradas = fs.readdirSync(BASE_CATALOGOS, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()

  const ricos    = []
  const parciais = []
  const imagem   = []
  const jaNoBanco = []

  console.log(`Varrendo ${entradas.length} pastas...\n`)

  for (const pasta of entradas) {
    if (pasta === 'Scripts') continue

    // já cadastrado?
    if (catalogosNoBanco.has(pasta)) {
      jaNoBanco.push(pasta)
      process.stdout.write(`  ✓ [JÁ NO BANCO] ${pasta}\n`)
      continue
    }

    const pastaPath = path.join(BASE_CATALOGOS, pasta)
    const pdfs = fs.readdirSync(pastaPath).filter(f => f.toLowerCase().endsWith('.pdf'))
    if (pdfs.length === 0) {
      imagem.push({ pasta, pages: 0, chars: 0, motivo: 'sem PDF' })
      process.stdout.write(`  ✗ [SEM PDF]     ${pasta}\n`)
      continue
    }

    const pdfPath = path.join(pastaPath, pdfs[0])
    const { pages, chars } = await scanPdf(pdfPath)

    if (chars >= THRESHOLD_RICO) {
      ricos.push({ pasta, pages, chars })
      process.stdout.write(`  ★ [RICO]        ${pasta} (${chars} chars, ${pages} págs)\n`)
    } else if (chars >= THRESHOLD_PARCIAL) {
      parciais.push({ pasta, pages, chars })
      process.stdout.write(`  ~ [PARCIAL]     ${pasta} (${chars} chars, ${pages} págs)\n`)
    } else {
      imagem.push({ pasta, pages, chars, motivo: 'imagem' })
      process.stdout.write(`  ✗ [IMAGEM]      ${pasta} (${chars} chars, ${pages} págs)\n`)
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`RESUMO`)
  console.log('═'.repeat(60))
  console.log(`  Já no banco:  ${jaNoBanco.length}`)
  console.log(`  Rico (auto):  ${ricos.length}`)
  console.log(`  Parcial:      ${parciais.length}`)
  console.log(`  Imagem (GPT): ${imagem.length}`)
  console.log('═'.repeat(60))

  console.log('\n★ PODEM SER CATALOGADOS AUTOMATICAMENTE:')
  ricos.forEach(r => console.log(`  • ${r.pasta}`))

  console.log('\n~ PARCIAIS (verificar manualmente):')
  parciais.forEach(r => console.log(`  • ${r.pasta} (${r.chars} chars)`))

  console.log('\n✗ PRECISAM DO GPT-4o (PDF imagem):')
  imagem.forEach(r => console.log(`  • ${r.pasta}`))

  // Salva resultado em JSON para referência
  fs.writeFileSync(
    path.join(__dirname, 'scan-resultado.json'),
    JSON.stringify({ ricos, parciais, imagem, jaNoBanco }, null, 2),
    'utf8'
  )
  console.log('\nResultado salvo em scripts/scan-resultado.json')
}

main().catch(e => { console.error(e); process.exit(1) })
