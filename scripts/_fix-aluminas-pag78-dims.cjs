const db = require('better-sqlite3')('database/catalogo.db');

// Nacional pag 78 (ID 4860)
db.prepare('UPDATE produtos SET dimensoes=? WHERE id=?').run('50x204x57CM', 4860);
console.log('ID 4860 → Nacional pag 78 dimensoes=50x204x57CM ✓');

// Marina pag 78 — encontrar pelo nome+pagina
const marina = db.prepare('SELECT id FROM produtos WHERE catalogo_id=100 AND nome=? AND pagina=?').get('Marina', 78);
if (marina) {
  db.prepare('UPDATE produtos SET dimensoes=? WHERE id=?').run('67x204x35CM', marina.id);
  console.log(`ID ${marina.id} → Marina pag 78 dimensoes=67x204x35CM ✓`);
} else {
  console.log('Marina pag 78 não encontrada!');
}

console.log('\n--- pag 78 ---');
db.prepare('SELECT id, nome, pagina, dimensoes FROM produtos WHERE catalogo_id=100 AND pagina=78 ORDER BY id').all()
  .forEach(r => console.log(`ID ${r.id} | ${r.nome} | ${r.dimensoes}`));
