const db = require('better-sqlite3')('database/catalogo.db');
const rows = db.prepare("SELECT id, nome, pagina, dimensoes, texto_livre FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 9 AND 16 ORDER BY pagina").all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome} | dim: ${r.dimensoes} | tipo: ${r.texto_livre}`));
