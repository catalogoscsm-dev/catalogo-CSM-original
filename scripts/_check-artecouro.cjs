const db = require('better-sqlite3')('database/catalogo.db');
const rows = db.prepare("SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 17 AND 19 ORDER BY pagina").all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
