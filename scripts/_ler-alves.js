const fs = require('fs')
const path = require('path')

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerPath = path.resolve(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath.replace(/\\/g, '/')}`

  const pdfPath = path.join(__dirname, '../../catalogos separados/ALVES 2023 CORRETO/ALVES 2023 CORRETO.pdf')
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const pdfDoc = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise

  console.log('Total páginas:', pdfDoc.numPages)

  for (let i = 1; i <= Math.min(15, pdfDoc.numPages); i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map(item => item.str).join(' ').trim()
    if (text.length > 10) console.log(`\n--- PAG ${i} ---\n${text.substring(0, 400)}`)
  }
}

main().catch(e => console.error('Erro:', e.message))
