/**
 * setup-adrian.cjs
 * Cria o catálogo "Adrián Line 2023" no banco com todos os 12 produtos,
 * e cria as pastas pag XX em "imagens dos produtos".
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const { BASE_CATALOGOS } = require('./config.cjs')

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))

const CATALOG_NOME  = 'Adrián Line 2023'
const CATALOG_PASTA = 'Adrián Line 2023'
const CATALOG_ANO   = 2023
const SRC_BASE      = path.join(BASE_CATALOGOS, CATALOG_PASTA, 'imagens dos produtos')

// ── 1. Catálogo ──────────────────────────────────────────────────────────────
let cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!cat) {
  db.prepare('INSERT INTO catalogos (nome, pasta, ano) VALUES (?, ?, ?)').run(CATALOG_NOME, CATALOG_PASTA, CATALOG_ANO)
  cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
  console.log('✓ Catálogo criado:', CATALOG_NOME)
} else {
  console.log('! Catálogo já existe, pulando inserção.')
}

const MAT_SOFA     = 'Estrutura interna em madeira 100% eucalipto, pés em metal'
const MAT_SOFA_MAD = 'Estrutura interna em madeira 100% eucalipto, pés em madeira'
const MAT_POLT     = 'Estrutura interna em madeira 100% eucalipto, base com ferragem reclinável motorizada zero wall lift'
const MAT_POLT_GIR = 'Estrutura interna em madeira 100% eucalipto, base giratória invisível'
const MAT_POLT_MET = 'Estrutura interna em madeira 100% eucalipto, pés em metal'
const ACAB_TEC     = 'Tecido'
const ACAB_COURO   = 'Couro'

// ── 2. Produtos ──────────────────────────────────────────────────────────────
// [pagina, nome, descricao(categoria), texto_livre, material, acabamento, dimensoes]
const produtos = [
  [2,  'Gênesis',  'Sofá',     'Sofá modular com encosto fixo, almofadas de fibra siliconada e assento com molas Bonnel.',                                                        MAT_SOFA,     ACAB_TEC,   '204 x 104 x 88 cm'],
  [4,  'Êxodo',    'Sofá',     'Sofá modular versátil com encosto fixo e almofadas soltas de fibra siliconada para fácil composição de ambientes.',                               MAT_SOFA,     ACAB_TEC,   'módulos: 80 | 90 | 100 | 110 | 120 cm'],
  [6,  'Filipus',  'Sofá',     'Sofá modular confortável e moderno com pés em madeira e ampla variedade de tamanhos de módulo.',                                                   MAT_SOFA_MAD, ACAB_TEC,   '122 x 95 x 88 cm (módulo base 100 cm)'],
  [8,  'Éfeso',    'Sofá',     'Sofá modular de design elegante com módulos fáceis de compor e pés em madeira, aliando versatilidade e conforto.',                                MAT_SOFA_MAD, ACAB_TEC,   '195 x 97 x 84 cm'],
  [10, 'Gálatas',  'Sofá',     'Sofá modular com assentos de molas Bonnel, encosto fixo com almofadas soltas e composições de até 2,05 m.',                                       MAT_SOFA,     ACAB_TEC,   '205 x 105 x 81 cm (módulo maior)'],
  [12, 'Pátmos',   'Sofá',     'Sofá de design moderno e exótico com encosto fixo, almofadas de fibra siliconada e assento com molas Bonnel.',                                    MAT_SOFA_MAD, ACAB_TEC,   '192 x 113 x 104 cm'],
  [14, 'Baruc',    'Sofá',     'Sofá retrátil em couro com encosto reclinável, chaise retrátil e duplo molejo no assento para máximo conforto.',                                  MAT_SOFA_MAD, ACAB_COURO, '165 x 112 x 105 cm (chaise: 225 cm aberta)'],
  [16, 'Ágape',    'Sofá',     'Sofá modular leve e moderno com encosto fixo, almofadas soltas de fibra siliconada e pés em metal.',                                              MAT_SOFA,     ACAB_TEC,   'módulos: 150 | 170 | 190 | 210 | 230 cm'],
  [18, 'Safira',   'Poltrona', 'Poltrona reclinável com 3 funções: Lift (auxilia idosos a levantar), Elétrica com carregador USB e Manual, base motorizada zero wall.',           MAT_POLT,     ACAB_TEC,   '90 x 90 x 80 cm'],
  [20, 'Jade',     'Poltrona', 'Poltrona reclinável com 4 funções: Lift, Elétrica (USB), Manual e Giratória com balanço e reclínio, base motorizada zero wall.',                  MAT_POLT,     ACAB_TEC,   '90 x 90 x 80 cm'],
  [22, 'Íris',     'Poltrona', 'Poltrona com base giratória invisível e encosto fixo com almofada solta, design elegante para complementar qualquer ambiente.',                   MAT_POLT_GIR, ACAB_TEC,   '104 x 88 cm'],
  [24, 'Lia',      'Poltrona', 'Poltrona elegante e resistente com encosto fixo em espuma D26, assento em D28 e pés em metal.',                                                   MAT_POLT_MET, ACAB_TEC,   '75 x 80 x 74 cm'],
]

const insert = db.prepare(`
  INSERT OR IGNORE INTO produtos (catalogo_id, nome, descricao, texto_livre, material, acabamento, dimensoes, pagina, imagens)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]')
`)

let inseridos = 0
for (const [pag, nome, cat2, desc, mat, acab, dim] of produtos) {
  const exists = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND pagina = ? AND nome = ?').get(cat.id, pag, nome)
  if (exists) { console.log(`  ! Já existe: ${nome} (pag ${pag})`); continue }
  insert.run(cat.id, nome, cat2, desc, mat, acab, dim, pag)
  inseridos++
  console.log(`  ✓ pag ${String(pag).padStart(2,'0')} — ${nome}`)
}
console.log(`\n${inseridos} produto(s) inserido(s).`)

// ── 3. Pastas pag XX ─────────────────────────────────────────────────────────
fs.mkdirSync(SRC_BASE, { recursive: true })

let pastasOk = 0
for (const [pag] of produtos) {
  const nome = `pag ${String(pag).padStart(2, '0')}`
  const pastaPath = path.join(SRC_BASE, nome)
  if (!fs.existsSync(pastaPath)) {
    fs.mkdirSync(pastaPath)
    pastasOk++
  }
}
console.log(`${pastasOk} pasta(s) criada(s) em:\n  ${SRC_BASE}`)

db.close()
console.log('\nPróximo passo: adicione as fotos nas pastas e rode importar-adrian.cjs')
