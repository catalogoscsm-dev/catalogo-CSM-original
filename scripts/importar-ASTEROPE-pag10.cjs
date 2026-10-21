const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ASTEROPE MÓVEIS/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ASTEROPE MÓVEIS')

const paginas = [
  {
    pasta:   'pag 10',
    prefixo: 'pag10',
    realPag: 10,
    recortes: [
      'recorte pag 11.png',
      'recorte pag 11_2.png',
      'recorte pag 11_4.png',
    ],
    produto: {
      nome:  'Mesa Orion Retangular',
      cod:   '2400',
      dim:   '2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab:  'Borda laquead | Borda madeira | Canto reto | Canto arredondado',
      cat:   'Mesa de Jantar',
    },
  },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (10, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0

for (const pg of paginas) {
  const srcDir = path.join(SRC, pg.pasta)

  const capaPublic = `${pg.prefixo}-capa.png`
  fs.copyFileSync(path.join(srcDir, 'capa.png'), path.join(DEST, capaPublic))

  fs.copyFileSync(path.join(srcDir, 'ficha tecn.png'), path.join(DEST, `${pg.prefixo}-ficha.png`))

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

console.log(`\nConcluído: ${inseridos} produto(s) inserido(s).`)
