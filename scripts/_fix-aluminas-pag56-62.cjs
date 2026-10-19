const db = require('better-sqlite3')('database/catalogo.db');

const updates = [
  { id: 4828, nome: 'Lass',       pagina: 56, texto_livre: 'Cadeira',  dimensoes: '58x50x83CM' },
  { id: 4830, nome: 'Sorrento',   pagina: 57, texto_livre: 'Balanço',  dimensoes: '73x91x100CM' },
  { id: 4832, nome: 'Martin',     pagina: 58, texto_livre: 'Cadeira',  dimensoes: '68x61x76CM' },
  { id: 4834, nome: 'Queen Alta', pagina: 59, texto_livre: 'Cadeira',  dimensoes: '88x90x140CM' },
  { id: 4836, nome: 'Duda',       pagina: 60, texto_livre: 'Cadeira',  dimensoes: '52x56x81CM' },
  { id: 4838, nome: 'Jade',       pagina: 61, texto_livre: 'Cadeira',  dimensoes: '49x65x82CM' },
  { id: 4840, nome: 'Malta',      pagina: 62, texto_livre: 'Cadeira',  dimensoes: '46x65x85CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

const inserts = [
  { pagina: 56, nome: 'Plaza',    texto_livre: 'Cadeira',  dimensoes: '54x50x75CM',                             descricao: 'Cadeira com estrutura em alumínio.' },
  { pagina: 57, nome: 'Orleans',  texto_livre: 'Poltrona', dimensoes: 'Poltrona-92x95x101CM | Puff-95x56x40CM', descricao: 'Poltrona com puff em alumínio.' },
  { pagina: 58, nome: 'Ibiza',    texto_livre: 'Poltrona', dimensoes: '101x90x97CM',                            descricao: 'Poltrona com estrutura em alumínio.' },
  { pagina: 59, nome: 'Ambiance', texto_livre: 'Cadeira',  dimensoes: '61x53x72CM',                             descricao: 'Cadeira com estrutura em alumínio.' },
  { pagina: 60, nome: 'Panamá',   texto_livre: 'Cadeira',  dimensoes: '53x57x87CM',                             descricao: 'Cadeira com estrutura em alumínio.' },
  { pagina: 61, nome: 'Búzios',   texto_livre: 'Cadeira',  dimensoes: '45x57x92CM',                             descricao: 'Cadeira com estrutura em alumínio.' },
  { pagina: 62, nome: 'Nacional', texto_livre: 'Cadeira',  dimensoes: '45x56x84CM',                             descricao: 'Cadeira com estrutura em alumínio.' },
];

const ins = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, @nome, @pagina, @texto_livre, @dimensoes, 'Alumínio', @descricao)`);
inserts.forEach(p => { const r = ins.run(p); console.log(`Inserido ${p.nome} pag ${p.pagina} → ID ${r.lastInsertRowid}`); });

console.log('\n--- Resultado pag 56-62 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 56 AND 62 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
