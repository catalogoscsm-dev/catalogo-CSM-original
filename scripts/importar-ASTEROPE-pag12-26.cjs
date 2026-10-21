const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ASTEROPE MÓVEIS/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ASTEROPE MÓVEIS')

const paginas = [
  {
    pasta: 'pag 12', prefixo: 'pag12', realPag: 12,
    recortes: ['recorte pag 13_2.png', 'recorte pag 13_3.png', 'recorte pag 13_4.png', 'recorte pag 13_5.png'],
    produto: {
      nome: 'Mesa Alpha Retangular', cod: '2300', cat: 'Mesa de Jantar',
      dim: '2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Lâmina Carvalho | Lâmina Tauari',
    },
  },
  {
    pasta: 'pag 14', prefixo: 'pag14', realPag: 14,
    recortes: ['recorte pag 15.png', 'recorte pag 15_2.png', 'recorte pag 15_3.png'],
    produto: {
      nome: 'Mesa Havona', cod: '2652', cat: 'Mesa de Jantar',
      dim: '1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Tampo Barril Lâmina Carvalho | Tampo Barril Lâmina Tauari',
    },
  },
  {
    pasta: 'pag 16', prefixo: 'pag16', realPag: 16,
    recortes: ['recorte pag 17.png', 'recorte pag 17_2.png', 'recorte pag 17_3.png'],
    produto: {
      nome: 'Mesa Logos', cod: '3704', cat: 'Mesa de Jantar',
      dim: '1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Lâmina Carvalho | Lâmina Tauari',
    },
  },
  {
    pasta: 'pag 18', prefixo: 'pag18', realPag: 18,
    temFicha: false,
    recortes: ['recorte pag 19.png', 'recorte pag 19_2.png', 'recorte pag 19_3.png'],
    produto: {
      nome: 'Mesa Capela Retangular', cod: '1204', cat: 'Mesa de Jantar',
      dim: '2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Borda Laquead | Borda Madeira',
    },
  },
  {
    pasta: 'pag 20', prefixo: 'pag20', realPag: 20,
    recortes: ['recorte pag 21_2.png', 'recorte pag 21_3.png', 'recorte pag 21_4.png', 'recorte pag 21_5.png'],
    produto: {
      nome: 'Mesa Dália Retangular', cod: '1122', cat: 'Mesa de Jantar',
      dim: '2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Lâmina Carvalho',
    },
  },
  {
    pasta: 'pag 22', prefixo: 'pag22', realPag: 22,
    recortes: ['recorte pag 23.png', 'recorte pag 23_2.png', 'recorte pag 23_3.png', 'recorte pag 23_4.png', 'recorte pag 23_5.png', 'recorte pag 23_6.png'],
    produto: {
      nome: 'Mesa Cayman Retangular', cod: '454', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP100CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Borda Laquead | Borda Madeira',
    },
  },
  {
    pasta: 'pag 24', prefixo: 'pag24', realPag: 24,
    recortes: ['recorte pag 25.png', 'recorte pag 25_2.png', 'recorte pag 25_3.png', 'recorte pag 25_4.png'],
    produto: {
      nome: 'Mesa Venus Retangular', cod: '842', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Borda Laquead | Borda Madeira',
    },
  },
  {
    pasta: 'pag 26', prefixo: 'pag26', realPag: 26,
    recortes: ['recorte pag 27.png', 'recorte pag 27_2.png', 'recorte pag 27_3.png', 'recorte pag 27_4.png', 'recorte pag 27_5.png'],
    produto: {
      nome: 'Mesa Terra Retangular', cod: '356', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP120CM|2,40m-L240xA78xP120CM',
      acab: 'Borda Laquead | Borda Madeira',
    },
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

  const capaPublic = `${pg.prefixo}-capa.png`
  fs.copyFileSync(path.join(srcDir, 'capa.png'), path.join(DEST, capaPublic))

  const fichaPath = path.join(srcDir, 'ficha tecn.png')
  if (pg.temFicha !== false && fs.existsSync(fichaPath)) {
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
