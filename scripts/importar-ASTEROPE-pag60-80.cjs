const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ASTEROPE MÓVEIS/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ASTEROPE MÓVEIS')

const paginas = [
  {
    pasta: 'pag 60', prefixo: 'pag60', realPag: 60,
    recortes: ['recorte pag 61.png', 'recorte pag 61_2.png', 'recorte pag 61_3.png'],
    produto: { nome: 'Mesa Turquesa', cod: '3910', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP120CM|1,36m-L136xA78xP136CM',
      acab: 'Lâmina Carvalho | Lâmina Tauari' },
  },
  {
    pasta: 'pag 62', prefixo: 'pag62', realPag: 62,
    recortes: ['recorte pag 63.png', 'recorte pag 63_2.png'],
    produto: { nome: 'Mesa Nórdica', cod: '688', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP120CM|1,36m-L136xA78xP136CM',
      acab: 'Lâmina Carvalho | Lâmina Tauari' },
  },
  {
    pasta: 'pag 64', prefixo: 'pag64', realPag: 64,
    recortes: ['recorte pag 65.png', 'recorte pag 65_2.png', 'recorte pag 65_3.png'],
    produto: { nome: 'Mesa Áurea', cod: '2200', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP120CM|1,30m-L130xA78xP130CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 66', prefixo: 'pag66', realPag: 66,
    recortes: ['recorte pag 67.png', 'recorte pag 67_2.png', 'recorte pag 67_3.png', 'recorte pag 67_4.png'],
    produto: { nome: 'Mesa Trina', cod: '2250', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP120CM|1,36m-L136xA78xP136CM',
      acab: 'Lâmina Carvalho | Lâmina Tauari' },
  },
  {
    pasta: 'pag 68', prefixo: 'pag68', realPag: 68,
    recortes: ['recorte pag 69.png', 'recorte pag 69_2.png', 'recorte pag 69_3.png'],
    produto: { nome: 'Mesa Polaris', cod: '2500', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP120CM|1,30m-L130xA78xP130CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 70', prefixo: 'pag70', realPag: 70,
    recortes: ['recorte pag 71.png', 'recorte pag 71_2.png', 'recorte pag 71_3.png'],
    produto: { nome: 'Mesa Gold', cod: '691', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP120CM|1,30m-L130xA78xP130CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 72', prefixo: 'pag72', realPag: 72,
    recortes: ['recorte pag 73.png', 'recorte pag 73_2.png', 'recorte pag 73_3.png'],
    produto: { nome: 'Mesa Fenix', cod: '1044', cat: 'Mesa de Jantar',
      dim: '1,40m-L140xA78xP140CM|1,50m-L150xA78xP150CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 74', prefixo: 'pag74', realPag: 74,
    recortes: ['recorte pag 75.png', 'recorte pag 75_2.png', 'recorte pag 75_3.png'],
    produto: { nome: 'Mesa Nubia', cod: '2600', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP90CM|1,40m-L140xA78xP90CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 76', prefixo: 'pag76', realPag: 76,
    recortes: ['recorte pag 77.png', 'recorte pag 77_2.png', 'recorte pag 77_3.png'],
    produto: { nome: 'Mesa Delta', cod: '671', cat: 'Mesa de Jantar',
      dim: '1,10m-L110xA78xP110CM|1,20m-L120xA78xP90CM|1,40m-L140xA78xP90CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 78', prefixo: 'pag78', realPag: 78,
    recortes: ['recorte pag 79.png', 'recorte pag 79_2.png'],
    produto: { nome: 'Mesa Polaris Bistrô', cod: '2566', cat: 'Mesa de Jantar',
      dim: '0,60m-L60xA111xP60CM',
      acab: 'Borda Laquead | Lâmina Tauari' },
  },
  {
    pasta: 'pag 80', prefixo: 'pag80', realPag: 80,
    recortes: ['recorte pag 81.png', 'recorte pag 81_2.png'],
    produto: { nome: 'Banqueta Dália', cod: '837', cat: 'Banqueta',
      dim: 'L50xA112xP63CM',
      acab: 'Tela Quadrada | Tela Sextavada' },
  },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (10, ?, ?, ?, ?, ?, ?, ?)
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

  const recortesPublic = pg.recortes.map((nome, i) => {
    const destNome = `${pg.prefixo}-recorte_${i + 1}.png`
    fs.copyFileSync(path.join(srcDir, nome), path.join(DEST, destNome))
    return `/imagens/ASTEROPE MÓVEIS/${destNome}`
  })

  const imagens = JSON.stringify([
    `/imagens/ASTEROPE MÓVEIS/${capaPublic}`,
    ...recortesPublic,
  ])

  const p = pg.produto
  const info = stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, pg.realPag, imagens)
  ids.push({ pag: pg.realPag, id: info.lastInsertRowid, nome: p.nome })
  console.log(`  ✓ pag ${pg.realPag} — ${p.nome} (ID ${info.lastInsertRowid})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
console.log('IDs:', ids.map(x => `pag${x.pag}→${x.id}`).join(', '))
