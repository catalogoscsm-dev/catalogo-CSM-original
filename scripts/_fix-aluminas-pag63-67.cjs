const db = require('better-sqlite3')('database/catalogo.db');

const updates = [
  { id: 4842, nome: 'Amélia',   pagina: 63, texto_livre: 'Cadeira',   dimensoes: '46x65x85CM' },
  { id: 4844, nome: 'Amélia',   pagina: 66, texto_livre: 'Banqueta',  dimensoes: '52x58x105CM' },
  { id: 4845, nome: 'Nacional', pagina: 67, texto_livre: 'Banqueta',  dimensoes: '40x52x100CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

const r = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, 'Angra', 63, 'Cadeira', '48x62x83CM', 'Alumínio', 'Cadeira com estrutura em alumínio.')`).run();
console.log(`Inserido Angra pag 63 → ID ${r.lastInsertRowid}`);

console.log('\n--- Resultado pag 63-67 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 63 AND 67 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
