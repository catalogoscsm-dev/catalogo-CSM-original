'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));

// IDs corretos que acabamos de inserir - manter estes
const MANTER = new Set([5560,5561,5562,5563,5564,5565,5566,5567,5568,5569,5570,5571,5572,5573,5574,5575,5576,5577,5578,5579,5580,5581,5582,5583,5584,5585,5586]);

// Busca todos os produtos do catálogo ARTESANO 2025 (ID 9) fora dos IDs corretos
const antigos = db.prepare('SELECT id, nome, pagina, codigo FROM produtos WHERE catalogo_id = 9 AND id NOT IN (' + [...MANTER].join(',') + ')').all();

if (!antigos.length) { console.log('Nenhuma entrada antiga encontrada.'); db.close(); process.exit(0); }

console.log(`Encontrados ${antigos.length} entrada(s) antiga(s):`);
for (const a of antigos) {
  console.log(`  pag ${a.pagina} | "${a.nome}" (ID ${a.id}, cod: ${a.codigo || 'NULL'})`);
}

const del = db.transaction(() => {
  for (const a of antigos) {
    db.prepare('DELETE FROM produtos WHERE id = ?').run(a.id);
  }
});
del();
console.log(`\n${antigos.length} entrada(s) removida(s).`);
db.close();
