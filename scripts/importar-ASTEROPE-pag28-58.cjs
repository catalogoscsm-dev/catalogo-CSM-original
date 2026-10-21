const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ASTEROPE MÓVEIS/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ASTEROPE MÓVEIS')

const paginas = [
  {
    pasta: 'pag 28', prefixo: 'pag28', realPag: 28,
    recortes: ['recorte pag 29.png', 'recorte pag 29_2.png', 'recorte pag 29_3.png'],
    produto: { nome: 'Mesa Sigma Retangular', cod: '418', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Tampo Barril Borda Laquead | Tampo Barril Borda Madeira' },
  },
  {
    pasta: 'pag 30', prefixo: 'pag30', realPag: 30,
    recortes: ['recorte pag 31.png', 'recorte pag 31_2.png', 'recorte pag 31_3.png'],
    produto: { nome: 'Mesa Vortex Retangular', cod: '1242', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Tampo Barril Borda Laquead | Tampo Barril Borda Madeira' },
  },
  {
    pasta: 'pag 32', prefixo: 'pag32', realPag: 32,
    recortes: ['recorte pag 33.png', 'recorte pag 33_2.png', 'recorte pag 33_3.png'],
    produto: { nome: 'Mesa Germain Retangular', cod: '1067', cat: 'Mesa de Jantar',
      dim: '1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 34', prefixo: 'pag34', realPag: 34,
    recortes: ['recorte pag 35.png', 'recorte pag 35_2.png', 'recorte pag 35_3.png'],
    produto: { nome: 'Mesa Olimpo Retangular', cod: '1024', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Borda Laquead' },
  },
  {
    pasta: 'pag 36', prefixo: 'pag36', realPag: 36,
    recortes: ['recorte pag 37.png', 'recorte pag 37_2.png', 'recorte pag 37_3.png', 'recorte pag 37_4.png'],
    produto: { nome: 'Mesa Hermes', cod: '3010', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP90CM|2,20m-L220xA78xP110CM',
      acab: 'Lâmina Carvalho | Lâmina Tauari' },
  },
  {
    pasta: 'pag 38', prefixo: 'pag38', realPag: 38,
    recortes: ['recorte pag 39.png', 'recorte pag 39_2.png'],
    produto: { nome: 'Mesa Polaris Retangular', cod: '2550', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Borda Laquead' },
  },
  {
    pasta: 'pag 40', prefixo: 'pag40', realPag: 40,
    recortes: ['recorte pag 41.png', 'recorte pag 41_2.png', 'recorte pag 41_3.png', 'recorte pag 41_4.png'],
    produto: { nome: 'Mesa Atlas Retangular', cod: '615', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Borda Laquead' },
  },
  {
    pasta: 'pag 42', prefixo: 'pag42', realPag: 42,
    recortes: ['recorte pag 43.png', 'recorte pag 43_2.png', 'recorte pag 43_3.png', 'recorte pag 43_4.png'],
    produto: { nome: 'Mesa Maia Retangular', cod: '395', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Borda Laquead' },
  },
  {
    pasta: 'pag 44', prefixo: 'pag44', realPag: 44,
    recortes: ['recorte pag 45.png', 'recorte pag 45_2.png', 'recorte pag 45_3.png', 'recorte pag 45_4.png'],
    produto: { nome: 'Mesa Prisma Retangular', cod: '963', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Borda Laquead' },
  },
  {
    // pag 46 não tem capa.png — recorte pag 46.png serve como capa
    pasta: 'pag 46', prefixo: 'pag46', realPag: 46,
    capaArquivo: 'recorte pag 46.png',
    recortes: ['recorte pag 47.png', 'recorte pag 47_2.png', 'recorte pag 47_3.png', 'recorte pag 47_4.png'],
    produto: { nome: 'Mesa Omega Retangular', cod: '342', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM',
      acab: 'Borda Laquead' },
  },
  {
    pasta: 'pag 48', prefixo: 'pag48', realPag: 48,
    recortes: ['recorte pag 49.png', 'recorte pag 49_2.png', 'recorte pag 49_3.png', 'recorte pag 49_4.png'],
    produto: { nome: 'Mesa Turin Retangular', cod: '1019', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM|2,40m-L240xA78xP120CM',
      acab: 'Madeira' },
  },
  {
    pasta: 'pag 50', prefixo: 'pag50', realPag: 50,
    recortes: ['recorte pag 51.png', 'recorte pag 51_2.png', 'recorte pag 51_3.png', 'recorte pag 51_4.png', 'recorte pag 51_5.png', 'recorte pag 51_6.png'],
    produto: { nome: 'Mesa Veneza Retangular', cod: '334', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA82xP90CM|1,80m-L180xA82xP100CM|2,20m-L220xA82xP110CM|2,40m-L240xA82xP120CM',
      acab: 'Madeira' },
  },
  {
    pasta: 'pag 52', prefixo: 'pag52', realPag: 52,
    recortes: ['recorte pag 53.png', 'recorte pag 53_2.png', 'recorte pag 53_3.png'],
    produto: { nome: 'Mesa Sofia Retangular', cod: '3804', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Borda Laquead' },
  },
  {
    pasta: 'pag 54', prefixo: 'pag54', realPag: 54,
    recortes: ['recorte pag 55.png', 'recorte pag 55_2.png', 'recorte pag 55_3.png'],
    produto: { nome: 'Mesa Prince Retangular', cod: '1178', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM|2,20m-L220xA78xP110CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 56', prefixo: 'pag56', realPag: 56,
    recortes: ['recorte pag 57.png', 'recorte pag 57_2.png', 'recorte pag 57_3.png'],
    produto: { nome: 'Mesa Wynn Retangular', cod: '708', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP100CM|2,00m-L200xA78xP100CM',
      acab: 'Borda Laquead | Borda Madeira' },
  },
  {
    pasta: 'pag 58', prefixo: 'pag58', realPag: 58,
    recortes: ['recorte pag 59.png', 'recorte pag 59_2.png'],
    produto: { nome: 'Mesa Binah', cod: '3770', cat: 'Mesa de Jantar',
      dim: '1,60m-L160xA78xP90CM|1,80m-L180xA78xP90CM',
      acab: 'Borda Laquead' },
  },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (10, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0

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
  console.log(`  ✓ pag ${pg.realPag} — ${p.nome} (ID ${info.lastInsertRowid})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
