const db = require('better-sqlite3')('database/catalogo.db');

const updates = [
  { id: 4815, nome: 'Itapuã',   pagina: 47, texto_livre: 'Poltrona', dimensoes: '52x71x83CM' },
  { id: 4816, nome: 'Itapuã',   pagina: 48, texto_livre: 'Poltrona', dimensoes: '52x71x83CM' },
  { id: 4818, nome: 'Nacional', pagina: 49, texto_livre: 'Poltrona', dimensoes: '57x59x83CM' },
  { id: 4819, nome: 'Millá',    pagina: 50, texto_livre: 'Poltrona', dimensoes: '55x58x83CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

const r = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, 'Jade', 48, 'Poltrona', '57x65x86CM', 'Alumínio', 'Poltrona com estrutura em alumínio.')`).run();
console.log(`Inserido Jade pag 48 → ID ${r.lastInsertRowid}`);

console.log('\n--- Resultado pag 47-50 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 47 AND 50 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
