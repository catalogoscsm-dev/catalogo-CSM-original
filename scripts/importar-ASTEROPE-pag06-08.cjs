const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ASTEROPE MÓVEIS/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ASTEROPE MÓVEIS')

// Regra: um produto por pasta. Ficha tecn.png = referência interna, não entra nas imagens.
const paginas = [
  {
    pasta: 'pag 06',
    prefixo: 'pag6',
    realPag: 6,
    recortes: ['recorte pag 7.png', 'recorte pag 7_2.png', 'recorte pag 7_3.png', 'recorte pag 7_4.png'],
    produto: { nome: 'Mesa Esmeralda', cod: '2100', dim: '1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM', acab: 'Lâmina Tauari | Lâmina Carvalho', cat: 'Mesa de Jantar' },
  },
  {
    pasta: 'pag 08',
    prefixo: 'pag8',
    realPag: 8,
    recortes: ['recorte pag 9_1.png', 'recorte pag 9_2.png', 'recorte pag 9_3.png'],
    produto: { nome: 'Mesa Flow', cod: '2000', dim: '1,80m-L180xA78xP100CM|2,20m-L220xA78xP100CM', acab: 'Borda Laqueada | Borda Madeira', cat: 'Mesa de Jantar' },
  },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (10, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0

for (const pg of paginas) {
  const srcDir = path.join(SRC, pg.pasta)

  // Copiar capa
  const capaPublic = `${pg.prefixo}-capa.png`
  fs.copyFileSync(path.join(srcDir, 'capa.png'), path.join(DEST, capaPublic))

  // Copiar ficha (referência interna — não entra no array de imagens)
  fs.copyFileSync(path.join(srcDir, 'ficha tecn.png'), path.join(DEST, `${pg.prefixo}-ficha.png`))

  // Copiar recortes
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
  stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, pg.realPag, imagens)
  console.log(`  ✓ pag ${pg.realPag} — ${p.nome} (${p.cod})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
