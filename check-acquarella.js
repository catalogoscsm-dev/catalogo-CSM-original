const Database = require("better-sqlite3");
const db = new Database("database/catalogo.db");
const cat = db.prepare("SELECT * FROM catalogos WHERE nome LIKE ?").get("%ACQUARELLA%");
console.log("Catalogo:", JSON.stringify(cat));
const produtos = db.prepare("SELECT id, nome, pagina, imagens FROM produtos WHERE catalogo_id = ? ORDER BY pagina").all(cat.id);
console.log("Total produtos:", produtos.length);
produtos.forEach(p => {
  const imgs = JSON.parse(p.imagens || "[]");
  console.log("  pag", p.pagina, "|", p.nome, "| fotos:", imgs.length);
});
