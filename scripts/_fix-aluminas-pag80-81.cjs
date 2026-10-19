const db = require('better-sqlite3')('database/catalogo.db');

// pag 80: split "Living e Carmona"
db.prepare('UPDATE produtos SET nome=?, texto_livre=?, dimensoes=?, imagens=NULL WHERE id=?').run('Living', 'Espreguiçadeira', '64x200x35CM', 4862);
console.log('ID 4862 → Living pag 80 ✓');

const r1 = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100,'Carmona',80,'Chaise','84x182x80CM','Alumínio','Chaise longue em fibra sintética.')`).run();
console.log(`Inserido Carmona pag 80 → ID ${r1.lastInsertRowid}`);

// pag 81: Copacabana Chaise & Mesa Lateral
db.prepare('UPDATE produtos SET nome=?, texto_livre=?, dimensoes=?, imagens=NULL WHERE id=?').run('Copacabana', 'Chaise', 'Chaise-160x180x80CM | Mesa-Ø65x30CM', 4864);
console.log('ID 4864 → Copacabana pag 81 ✓');

console.log('\n--- Resultado pag 80-81 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 80 AND 81 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
