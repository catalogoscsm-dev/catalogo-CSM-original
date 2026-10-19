const db = require('better-sqlite3')('database/catalogo.db');
// Check if Rembrandt exists anywhere in catalog 101
const rows = db.prepare("SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = 101 AND (nome LIKE '%Rembrandt%' OR pagina = 44)").all();
console.log('Busca Rembrandt/pag44:', JSON.stringify(rows, null, 2));

// Also check current max page in catalog 101
const maxPag = db.prepare("SELECT MAX(pagina) as max FROM produtos WHERE catalogo_id = 101").get();
console.log('Max pag no Concept:', maxPag.max);
