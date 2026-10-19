const db = require('better-sqlite3')('database/catalogo.db');
const rows = db.prepare(
  "SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina >= 34 ORDER BY pagina, id"
).all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
console.log('Total:', rows.length);
