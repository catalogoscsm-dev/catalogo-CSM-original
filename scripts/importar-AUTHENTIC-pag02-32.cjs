const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/AUTHENTIC 05.24/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/AUTHENTIC 05.24')

fs.mkdirSync(DEST, { recursive: true })

// catalogo_id = 11 (AUTHENTIC 05.24)
const paginas = [
  {
    pasta: 'pag 02', prefixo: 'pag02', realPag: 2,
    produto: { nome: 'Bancada Áustria', cod: '', cat: 'Bancada',
      dim: '1,20m-L120xA110xP40CM|1,80m-L180xA110xP40CM|2,40m-L240xA110xP40CM',
      acab: '' },
  },
  {
    pasta: 'pag 03', prefixo: 'pag03', realPag: 3,
    produto: { nome: 'Banqueta Bella', cod: '', cat: 'Banqueta',
      dim: 'L51xA109xP48CM',
      acab: '' },
  },
  {
    pasta: 'pag 04', prefixo: 'pag04', realPag: 4,
    produto: { nome: 'Banqueta Orion', cod: '', cat: 'Banqueta',
      dim: 'L51xA109xP48CM',
      acab: '' },
  },
  {
    pasta: 'pag 05', prefixo: 'pag05', realPag: 5,
    produto: { nome: 'Banqueta Áustria', cod: '', cat: 'Banqueta',
      dim: 'L51xA109xP48CM',
      acab: '' },
  },
  {
    pasta: 'pag 06', prefixo: 'pag06', realPag: 6,
    produto: { nome: 'Banqueta Luna', cod: '', cat: 'Banqueta',
      dim: 'L45xA109xP48CM',
      acab: '' },
  },
  {
    pasta: 'pag 07', prefixo: 'pag07', realPag: 7,
    produto: { nome: 'Banqueta Sofia', cod: '', cat: 'Banqueta',
      dim: 'L48xA109xP48CM',
      acab: '' },
  },
  {
    pasta: 'pag 08', prefixo: 'pag08', realPag: 8,
    produto: { nome: 'Buffet Ayla', cod: '', cat: 'Buffet',
      dim: '1,80m-L180xA80xP43CM|2,00m-L200xA80xP43CM|2,20m-L220xA80xP43CM|2,40m-L240xA80xP43CM',
      acab: '' },
  },
  {
    pasta: 'pag 09', prefixo: 'pag09', realPag: 9,
    produto: { nome: 'Buffet Zara', cod: '', cat: 'Buffet',
      dim: '1,80m-L180xA80xP43CM|2,00m-L200xA80xP43CM|2,20m-L220xA80xP43CM|2,40m-L240xA80xP43CM',
      acab: '' },
  },
  {
    pasta: 'pag 10', prefixo: 'pag10', realPag: 10,
    produto: { nome: 'Buffet Luísa', cod: '', cat: 'Buffet',
      dim: '1,80m-L180xA79xP47CM|2,00m-L200xA79xP47CM|2,20m-L220xA79xP47CM|2,40m-L240xA79xP47CM',
      acab: '' },
  },
  {
    pasta: 'pag 11', prefixo: 'pag11', realPag: 11,
    produto: { nome: 'Buffet Rivera', cod: '', cat: 'Buffet',
      dim: '1,80m-L180xA68xP47CM|2,00m-L200xA68xP47CM|2,20m-L220xA68xP47CM',
      acab: '' },
  },
  {
    pasta: 'pag 12', prefixo: 'pag12', realPag: 12,
    produto: { nome: 'Buffet Vision', cod: '', cat: 'Buffet',
      dim: '1,80m-L180xA75xP47CM|2,00m-L200xA75xP47CM|2,20m-L220xA75xP47CM',
      acab: '' },
  },
  {
    pasta: 'pag 13', prefixo: 'pag13', realPag: 13,
    produto: { nome: 'Sala Maya', cod: '', cat: 'Sala de Jantar',
      dim: '2,20m-L220xA77xP100CM|2,25m-L225xA77xP122CM|2,60m-L260xA77xP122CM|2,80m-L280xA77xP122CM|3,00m-L300xA77xP130CM',
      acab: '' },
  },
  {
    pasta: 'pag 14', prefixo: 'pag14', realPag: 14,
    produto: { nome: 'Sala Ayla', cod: '', cat: 'Sala de Jantar',
      dim: '2,20m-L220xA77xP118CM|2,40m-L240xA77xP128CM|2,60m-L260xA77xP126CM|2,80m-L280xA77xP126CM|3,00m-L300xA77xP128CM',
      acab: '' },
  },
  {
    pasta: 'pag 15', prefixo: 'pag15', realPag: 15,
    produto: { nome: 'Sala Zara', cod: '', cat: 'Sala de Jantar',
      dim: '2,20m-L220xA77xP110CM|2,40m-L240xA77xP110CM|2,60m-L260xA77xP120CM|2,80m-L280xA77xP120CM|3,00m-L300xA77xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 16', prefixo: 'pag16', realPag: 16,
    produto: { nome: 'Sala Alice', cod: '', cat: 'Sala de Jantar',
      dim: '1,80m-L180xA76xP96CM|2,00m-L200xA76xP96CM|2,40m-L240xA78xP96CM|2,60m-L260xA79xP96CM',
      acab: '' },
  },
  {
    pasta: 'pag 17', prefixo: 'pag17', realPag: 17,
    produto: { nome: 'Mesa Áustria c/Cadeira Liz', cod: '', cat: 'Sala de Jantar',
      dim: '1,80m-L180xA77xP110CM|2,00m-L200xA77xP110CM|2,40m-L240xA77xP110CM|2,80m-L280xA77xP110CM|3,00m-L300xA77xP110CM',
      acab: '' },
  },
  {
    pasta: 'pag 18', prefixo: 'pag18', realPag: 18,
    produto: { nome: 'Sala Bella', cod: '', cat: 'Sala de Jantar',
      dim: '3,20m-L320xA76xP120CM|3,40m-L340xA76xP120CM|3,60m-L360xA76xP120CM|3,80m-L380xA76xP120CM|4,00m-L400xA76xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 19', prefixo: 'pag19', realPag: 19,
    produto: { nome: 'Sala Luísa', cod: '', cat: 'Sala de Jantar',
      dim: '3,20m-L320xA76xP120CM|3,40m-L340xA76xP120CM|3,60m-L360xA76xP120CM|3,80m-L380xA76xP120CM|4,00m-L400xA76xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 20', prefixo: 'pag20', realPag: 20,
    produto: { nome: 'Sala Jully', cod: '', cat: 'Sala de Jantar',
      dim: '1,50m-L150xA77xP90CM|1,80m-L180xA77xP90CM|2,00m-L200xA77xP90CM|2,40m-L240xA77xP100CM',
      acab: '' },
  },
  {
    pasta: 'pag 21', prefixo: 'pag21', realPag: 21,
    produto: { nome: 'Mesa Maya', cod: '', cat: 'Mesa de Jantar',
      dim: '2,00m-L200xA77xP100CM|2,20m-L220xA77xP100CM|2,40m-L240xA77xP100CM|2,60m-L260xA77xP120CM|2,80m-L280xA77xP120CM|3,00m-L300xA77xP130CM',
      acab: '' },
  },
  {
    // pag 22 não tem capa.png — usa recorte pag 22.png como capa
    pasta: 'pag 22', prefixo: 'pag22', realPag: 22,
    capaArquivo: 'recorte pag 22.png',
    produto: { nome: 'Mesa Elisa', cod: '', cat: 'Mesa de Jantar',
      dim: '2,80m-L280xA77xP120CM|3,20m-L320xA77xP120CM|3,40m-L340xA77xP120CM|3,60m-L360xA77xP120CM|3,80m-L380xA77xP120CM|4,00m-L400xA77xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 23', prefixo: 'pag23', realPag: 23,
    produto: { nome: 'Mesa Ayla', cod: '', cat: 'Mesa de Jantar',
      dim: '2,80m-L280xA77xP120CM|3,20m-L320xA77xP120CM|3,40m-L340xA77xP120CM|3,60m-L360xA77xP120CM|3,80m-L380xA77xP120CM|4,00m-L400xA77xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 24', prefixo: 'pag24', realPag: 24,
    produto: { nome: 'Mesa Zara', cod: '', cat: 'Mesa de Jantar',
      dim: '2,20m-L220xA77xP110CM|2,40m-L240xA77xP110CM|2,60m-L260xA77xP120CM|2,80m-L280xA77xP120CM|3,00m-L300xA77xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 25', prefixo: 'pag25', realPag: 25,
    produto: { nome: 'Mesa Alice', cod: '', cat: 'Mesa de Jantar',
      dim: '1,80m-L180xA77xP100CM|2,00m-L200xA77xP100CM|2,40m-L240xA77xP110CM|2,60m-L260xA77xP110CM|3,00m-L300xA77xP110CM',
      acab: '' },
  },
  {
    pasta: 'pag 26', prefixo: 'pag26', realPag: 26,
    produto: { nome: 'Mesa Bella', cod: '', cat: 'Mesa de Jantar',
      dim: '3,40m-L340xA76xP120CM|3,60m-L360xA76xP120CM|3,80m-L380xA76xP120CM|4,00m-L400xA76xP120CM|4,20m-L420xA76xP120CM|4,40m-L440xA76xP120CM',
      acab: '' },
  },
  {
    pasta: 'pag 27', prefixo: 'pag27', realPag: 27,
    produto: { nome: 'Mesa Luísa', cod: '', cat: 'Mesa de Jantar',
      dim: '3,20m-L320xA76xP110CM|3,40m-L340xA76xP110CM|3,60m-L360xA76xP110CM|3,80m-L380xA76xP110CM',
      acab: '' },
  },
  {
    pasta: 'pag 28', prefixo: 'pag28', realPag: 28,
    produto: { nome: 'Mesa Jully', cod: '', cat: 'Mesa de Jantar',
      dim: '1,50m-L150xA77xP80CM|1,80m-L180xA77xP80CM|2,00m-L200xA77xP80CM|2,40m-L240xA77xP80CM',
      acab: '' },
  },
  {
    pasta: 'pag 29', prefixo: 'pag29', realPag: 29,
    produto: { nome: 'Mesa Lívia', cod: '', cat: 'Mesa de Jantar',
      dim: '1,40m-L140xA76xP110CM|1,60m-L160xA76xP120CM|1,80m-L180xA76xP130CM',
      acab: '' },
  },
  {
    pasta: 'pag 30', prefixo: 'pag30', realPag: 30,
    produto: { nome: 'Cadeira Maya', cod: '', cat: 'Cadeira',
      dim: 'L57xA77xP58CM',
      acab: '' },
  },
  {
    pasta: 'pag 31', prefixo: 'pag31', realPag: 31,
    produto: { nome: 'Cadeira Ayla', cod: '', cat: 'Cadeira',
      dim: 'L60xA80xP60CM',
      acab: '' },
  },
  {
    pasta: 'pag 32', prefixo: 'pag32', realPag: 32,
    produto: { nome: 'Cadeira Zara', cod: '', cat: 'Cadeira',
      dim: 'L50xA82xP54CM',
      acab: '' },
  },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (11, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0
const ids = []

for (const pg of paginas) {
  const srcDir = path.join(SRC, pg.pasta)

  const capaArq    = pg.capaArquivo ?? 'capa.png'
  const capaPublic = `${pg.prefixo}-capa.png`
  fs.copyFileSync(path.join(srcDir, capaArq), path.join(DEST, capaPublic))

  const fichaPath = path.join(srcDir, 'ficha tecn.png')
  if (fs.existsSync(fichaPath)) {
    fs.copyFileSync(fichaPath, path.join(DEST, `${pg.prefixo}-ficha.png`))
  }

  const imagens = JSON.stringify([
    `/imagens/AUTHENTIC 05.24/${capaPublic}`,
  ])

  const p = pg.produto
  const info = stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, pg.realPag, imagens)
  ids.push({ pag: pg.realPag, id: info.lastInsertRowid, nome: p.nome })
  console.log(`  ✓ pag ${pg.realPag} — ${p.nome} (ID ${info.lastInsertRowid})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
console.log('IDs:', ids.map(x => `pag${x.pag}→${x.id}`).join(', '))
