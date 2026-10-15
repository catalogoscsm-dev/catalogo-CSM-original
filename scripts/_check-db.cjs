const Database = require('better-sqlite3');
const db = new Database('database/catalogo.db');
// Check schema first
const cols = db.prepare("PRAGMA table_info(produtos)").all().map(c => c.name);
const fotoCol = cols.includes('foto_capa') ? 'foto_capa' : cols.find(c => c.includes('foto')) || cols[0];
console.log('Columns:', cols.join(', '));

const rows = db.prepare(`
  SELECT c.nome,
         COUNT(p.id) as produtos
  FROM catalogos c
  LEFT JOIN produtos p ON p.catalogo_id = c.id
  GROUP BY c.id
  ORDER BY c.nome
`).all();
rows.forEach(r => console.log(`${r.nome} | produtos: ${r.produtos}`));
db.close();
