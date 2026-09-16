const Database = require("better-sqlite3");
const db = new Database("database/catalogo.db");

const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get("Adrián Line 2023");

// Ágape — pag 16 — módulos 150|170|190|210|230 cm, prof. ~100cm, alt. ~95cm
// Êxodo — pag 04 — módulos 80|90|100|110|120 cm, prof. ~107cm, alt. ~107cm
const updates = [
  {
    pagina: 16,
    nome: "Ágape",
    dimensoes: "150X100X95CM | 170X100X95CM | 190X100X95CM | 210X100X95CM | 230X100X95CM"
  },
  {
    pagina: 4,
    nome: "Êxodo",
    dimensoes: "80X107X107CM | 90X107X107CM | 100X107X107CM | 110X107X107CM | 120X107X107CM"
  }
];

for (const { pagina, nome, dimensoes } of updates) {
  const r = db.prepare(
    "UPDATE produtos SET dimensoes = ? WHERE catalogo_id = ? AND pagina = ?"
  ).run(dimensoes, cat.id, pagina);
  console.log(`${r.changes > 0 ? "✓" : "✗"} pag ${pagina} — ${nome}`);
}

db.close();
