const db = require('better-sqlite3')('database/catalogo.db');

// pag 78: split "Nacional e Marina"
db.prepare('UPDATE produtos SET nome=?, texto_livre=?, imagens=NULL WHERE id=?').run('Nacional', 'Espreguiçadeira', 4860);
console.log('ID 4860 → Nacional pag 78 ✓');

const r1 = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, material, descricao) VALUES (100,'Marina',78,'Espreguiçadeira','Alumínio','Espreguiçadeira com rodas em alumínio.')`).run();
console.log(`Inserido Marina pag 78 → ID ${r1.lastInsertRowid}`);

// pag 79: Fox lifestyle (produto novo no DB)
const r2 = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100,'Fox',79,'Espreguiçadeira','66x200x37CM','Alumínio','Espreguiçadeira trama design.')`).run();
console.log(`Inserido Fox pag 79 → ID ${r2.lastInsertRowid}`);

console.log('\n--- Resultado pag 78-79 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 78 AND 79 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
