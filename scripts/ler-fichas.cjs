const fs   = require('fs')
const path = require('path')
const pdf  = require('pdf-parse')

const pdfPath = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\Aço Mobilia 2025-7\\imagens dos produtos\\fichas_tecnicas_aco_mobilia.pdf'

pdf(fs.readFileSync(pdfPath)).then(data => {
  fs.writeFileSync(path.join(__dirname, '..', 'fichas_texto.txt'), data.text, 'utf8')
  console.log(`Páginas: ${data.numpages}`)
  console.log('Salvo em fichas_texto.txt')
})
