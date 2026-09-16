/**
 * consolidar-paginas-aluminas.js
 * Para cada página do ALUMINAS 2024 com múltiplos produtos:
 *   - Mantém apenas 1 produto (o primeiro por ID)
 *   - Atualiza nome e descrição para refletir todos os itens da página
 *   - Remove os duplicados
 */
const Database = require('better-sqlite3')
const path     = require('path')

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get('ALUMINAS 2024')
if (!cat) { console.error('Catálogo não encontrado.'); process.exit(1) }

const todos = db.prepare(
  'SELECT * FROM produtos WHERE catalogo_id = ? ORDER BY pagina, id'
).all(cat.id)

// Agrupa por página
const porPagina = {}
for (const p of todos) {
  if (!porPagina[p.pagina]) porPagina[p.pagina] = []
  porPagina[p.pagina].push(p)
}

let consolidados = 0
let removidos    = 0

const consolidar = db.transaction(() => {
  for (const [pagina, prods] of Object.entries(porPagina)) {
    if (prods.length === 1) continue // só um produto, não precisa fazer nada

    const principal = prods[0]
    const extras    = prods.slice(1)

    // Monta o nome: se todos têm o mesmo nome → usa só esse nome
    // Se têm nomes diferentes → "Nome1 e Nome2"
    const nomesUnicos = [...new Set(prods.map(p => p.nome))]
    const novoNome = nomesUnicos.length === 1
      ? nomesUnicos[0]
      : nomesUnicos.slice(0, -1).join(', ') + ' e ' + nomesUnicos.at(-1)

    // Monta a descrição: lista todas as categorias
    const cats = prods.map(p => p.descricao).filter(Boolean)
    const catsUnicas = [...new Set(cats)]
    const novaDesc = catsUnicas.length === 1
      ? catsUnicas[0]
      : catsUnicas.slice(0, -1).join(', ') + ' e ' + catsUnicas.at(-1)

    // Atualiza o produto principal
    db.prepare('UPDATE produtos SET nome = ?, descricao = ? WHERE id = ?')
      .run(novoNome, novaDesc, principal.id)

    // Remove os duplicados
    for (const extra of extras) {
      db.prepare('DELETE FROM produtos WHERE id = ?').run(extra.id)
      removidos++
    }

    console.log(`  pag ${String(pagina).padStart(3)}: "${novoNome}" — ${novaDesc}`)
    consolidados++
  }
})

consolidar()

console.log(`\n✓ ${consolidados} página(s) consolidadas | ${removidos} produto(s) removidos`)
db.close()
