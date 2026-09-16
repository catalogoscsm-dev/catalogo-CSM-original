const Database = require("better-sqlite3");
const db = new Database("database/catalogo.db");

const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get("Adrián Line 2023");

// CONVENÇÃO: campo "dimensoes" guarda a medida representativa (exibição simplificada).
// Dados completos ficam documentados aqui para enriquecimento futuro se necessário.
//
// ÁGAPE — pag 16 — dados completos:
//   "150X100X95CM | 170X100X95CM | 190X100X95CM | 210X100X95CM | 230X100X95CM"
//
// ÊXODO — pag 04 — dados completos:
//   "80X107X107CM | 90X107X107CM | 100X107X107CM | 110X107X107CM | 120X107X107CM"

const updates = [
  {
    pagina: 16,
    nome: "Ágape",
    dimensoes: "190 x 100 x 95 cm"   // módulos de 150 a 230 cm — exibição representativa
  },
  {
    pagina: 4,
    nome: "Êxodo",
    dimensoes: "100 x 107 x 107 cm"  // módulos de 80 a 120 cm — exibição representativa
  }
];

for (const { pagina, nome, dimensoes } of updates) {
  const r = db.prepare(
    "UPDATE produtos SET dimensoes = ? WHERE catalogo_id = ? AND pagina = ?"
  ).run(dimensoes, cat.id, pagina);
  console.log(`${r.changes > 0 ? "✓" : "✗"} pag ${pagina} — ${nome}`);
}

db.close();
