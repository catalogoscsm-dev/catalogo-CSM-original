'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));
const r = db.prepare("UPDATE produtos SET imagens = '[]' WHERE catalogo_id = 9 AND pagina BETWEEN 6 AND 36").run();
console.log(`Reset OK — ${r.changes} produtos.`);
db.close();
