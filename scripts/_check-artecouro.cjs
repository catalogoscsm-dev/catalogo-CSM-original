const db = require('better-sqlite3')('database/catalogo.db');
const rows = db.prepare("SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina = 22 ORDER BY id").all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
