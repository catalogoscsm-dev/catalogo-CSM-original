const Database = require("better-sqlite3");
const db = new Database("database/catalogo.db");
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get("Adrián Line 2023");
const r = db.prepare("UPDATE produtos SET imagens = '[]' WHERE catalogo_id = ?").run(cat.id);
console.log(`${r.changes} produtos resetados (imagens = [])`);
db.close();
