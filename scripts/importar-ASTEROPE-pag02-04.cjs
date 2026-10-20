const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ASTEROPE MÓVEIS/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ASTEROPE MÓVEIS')

// ── Mapeamento de arquivos por página ──────────────────────────
// pag 02 (spread) → recortes nomeados "pag 3" pelo separador
// pag 04 (spread) → recortes nomeados "pag 5" pelo separador
const paginas = [
  {
    pasta: 'pag 02',
    prefixo: 'pag2',
    realPag: 2,
    recortes: ['recorte pag 3.png', 'recorte pag 3_2.png', 'recorte pag 3_3.png'],
    produtos: [
      { nome: 'Cadeira Urus', cod: '3930', dim: 'L48,5xA48,5xP56CM',  acab: 'Lâmina Tauari | Lâmina Carvalho', cat: 'Cadeira'       },
      { nome: 'Mesa Urus',    cod: '3920', dim: '1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM', acab: 'Lâmina Tauari | Lâmina Carvalho', cat: 'Mesa de Jantar' },
    ],
  },
  {
    pasta: 'pag 04',
    prefixo: 'pag4',
    realPag: 4,
    recortes: ['recorte pag 5.png', 'recorte pag 5_2.png', 'recorte pag 5_3.png', 'recorte pag 5_4.png'],
    produtos: [
      { nome: 'Cadeira Rubi', cod: '3950', dim: 'L51xA89xP56,5CM',    acab: 'Lâmina Tauari | Lâmina Carvalho', cat: 'Cadeira'       },
      { nome: 'Mesa Rubi',    cod: '3951', dim: '2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM', acab: 'Lâmina Tauari | Lâmina Carvalho', cat: 'Mesa de Jantar' },
    ],
  },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (10, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0

for (const pg of paginas) {
  const srcDir = path.join(SRC, pg.pasta)

  // ── Copiar capa ──
  const capaPublic = `${pg.prefixo}-capa.png`
  fs.copyFileSync(path.join(srcDir, 'capa.png'), path.join(DEST, capaPublic))

  // ── Copiar ficha ──
  const fichaPublic = `${pg.prefixo}-ficha.png`
  fs.copyFileSync(path.join(srcDir, 'ficha tecn.png'), path.join(DEST, fichaPublic))

  // ── Copiar recortes ──
  const recortesPublic = pg.recortes.map((nome, i) => {
    const destNome = `${pg.prefixo}-recorte_${i + 1}.png`
    fs.copyFileSync(path.join(srcDir, nome), path.join(DEST, destNome))
    return `/imagens/ASTEROPE MÓVEIS/${destNome}`
  })

  const imagens = JSON.stringify([
    `/imagens/ASTEROPE MÓVEIS/${capaPublic}`,
    `/imagens/ASTEROPE MÓVEIS/${fichaPublic}`,
    ...recortesPublic,
  ])

  // ── Inserir cada produto da página (compartilham as mesmas imagens) ──
  for (const p of pg.produtos) {
    stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, pg.realPag, imagens)
    console.log(`  ✓ pag ${pg.realPag} — ${p.nome} (${p.cod})`)
    inseridos++
  }
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
