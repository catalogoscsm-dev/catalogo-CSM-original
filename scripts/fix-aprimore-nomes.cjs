/**
 * fix-aprimore-nomes.cjs
 * Corrige os nomes dos produtos do catálogo Aprimore Decor 2025.
 * Os nomes reais estão escritos verticalmente no PDF (design gráfico),
 * por isso o extrator ignorou e capturou as dimensões como nome.
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(__dirname, '..', 'database', 'catalogo.db')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

const cat = db.prepare("SELECT id FROM catalogos WHERE pasta LIKE '%primore%'").get()
if (!cat) { console.error('Catálogo não encontrado'); process.exit(1) }

// pagina → nome correto (lido do _texto_extraido.txt)
const NOMES = {
   4: 'MESA DE JANTAR CONE',
   6: 'MESA DE JANTAR RETANGULAR',
   8: 'MESA DE JANTAR ORGÂNICA',
  10: 'MESA DE JANTAR OVAL',
  12: 'BUFFET FLOW',
  14: 'BUFFET ELIPSE',
  16: 'BUFFET ELIPSE RIPADO',
  18: 'BUFFET DALLAS',
  20: 'BUFFET SEVILHA',
  22: 'CARRINHO BAR EDGE',
  24: 'CARRINHO BAR FLOW',
  26: 'MESA LATERAL ROCK',
  28: 'MESA LATERAL WOOD',
  30: 'MESA LATERAL FREIJÓ',
  32: 'MESA LATERAL CONE',
  34: 'MESA DE CENTRO ELIPSE',
  36: 'MESA DE CENTRO ORGÂNICA',
  38: 'MESA DE CENTRO OVAL',
  40: 'MESA DE CENTRO MAYA',
  42: 'APARADOR BOLD',
  44: 'APARADOR BALI',
  46: 'RACK FLOW',
  48: 'RACK BOLD',
  50: 'RACK SEVILHA',
  52: 'MESA DE CABECEIRA BOLD',
  54: 'MESA DE CABECEIRA CLASSIC',
  56: 'MESA DE CABECEIRA IRON',
  58: 'MESA DE CABECEIRA AURORA',
  60: 'MESA DE CABECEIRA WOOD',
  62: 'MESA DE CABECEIRA SEVILHA',
  64: 'MESA DE CABECEIRA LUNA',
  66: 'MESA DE CABECEIRA SLIM',
  68: 'MESA DE CABECEIRA FLOW',
  70: 'MESA DE CABECEIRA FLOW COM NICHO',
  72: 'MESA DE CABECEIRA FLOW LAQUEADA',
  74: 'CÔMODA CLASSIC',
  76: 'CÔMODA FLOW LAQUEADA',
  78: 'CÔMODA IRON',
  80: 'CÔMODA FLOW',
  82: 'CÔMODA WOOD',
  84: 'ESCRIVANINHA ELIPSE',
  86: 'ESPELHO TRAPÉZIO',
}

const update = db.prepare('UPDATE produtos SET nome = ? WHERE catalogo_id = ? AND pagina = ?')

let atualizados = 0
for (const [paginaStr, nome] of Object.entries(NOMES)) {
  const pagina = Number(paginaStr)
  const result = update.run(nome, cat.id, pagina)
  if (result.changes > 0) {
    console.log(`  pag ${String(pagina).padStart(2)} → "${nome}"`)
    atualizados++
  } else {
    console.warn(`  pag ${pagina}: produto não encontrado no banco`)
  }
}

db.close()
console.log(`\n✓ ${atualizados} produto(s) renomeado(s).`)
console.log('  Execute agora: node scripts/export-data.js')
