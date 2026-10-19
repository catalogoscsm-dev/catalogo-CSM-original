const db = require('better-sqlite3')('database/catalogo.db');

// Atualiza produto principal (a) de cada página — remove nome combinado
const updates = [
  // pag 34: Jade + Sky (tem 34b)
  { id: 4794, nome: 'Jade',     pagina: 34, texto_livre: 'Mesa de Jantar', dimensoes: '200x100x75CM' },
  // pag 35: Cayman + Lapa (tem 35b) — Cayman aqui é mesa de jantar triangular (diferente do Cayman sofá)
  { id: 4796, nome: 'Cayman',   pagina: 35, texto_livre: 'Mesa de Jantar', dimensoes: '150x170x75CM' },
  // pag 36: Palermo + Diamantina (tem 36b) — Palermo aqui é mesa de jantar (diferente do Palermo mesa lateral pag 29)
  { id: 4798, nome: 'Palermo',  pagina: 36, texto_livre: 'Mesa de Jantar', dimensoes: 'Ø120x75CM' },
  // pag 37: Ettore + Duda (SEM b folder) — mantém só a mesa
  { id: 4800, nome: 'Ettore',   pagina: 37, texto_livre: 'Mesa de Jantar', dimensoes: '220x110x75CM' },
  // pag 38: Chicago + Amélia (tem 38b)
  { id: 4802, nome: 'Chicago',  pagina: 38, texto_livre: 'Mesa de Jantar', dimensoes: '220x100x75CM' },
  // pag 39: Gramado + Fox poltrona (SEM b folder) — mantém só a mesa
  { id: 4804, nome: 'Gramado',  pagina: 39, texto_livre: 'Mesa de Jantar', dimensoes: 'Ø150x75CM' },
  // pag 40: Nacional + Corbelle (tem 40b) — Nacional aqui é mesa de jantar
  { id: 4806, nome: 'Nacional', pagina: 40, texto_livre: 'Mesa de Jantar', dimensoes: 'Ø100x75CM' },
  // pag 41: Victus + Itapuã poltrona (SEM b folder) — mantém só a mesa (diferente do Victus Sofá)
  { id: 4808, nome: 'Victus',   pagina: 41, texto_livre: 'Mesa de Jantar', dimensoes: '220x100x75CM' },
  // pag 42: Fox mesa + Labirinto (tem 42b) — Fox aqui é mesa de jantar
  { id: 4810, nome: 'Fox',      pagina: 42, texto_livre: 'Mesa de Jantar', dimensoes: 'Ø106x75CM' },
  // pag 43: Turin + Amélia poltrona (SEM b folder) — mantém só a mesa
  { id: 4812, nome: 'Turin',    pagina: 43, texto_livre: 'Mesa de Jantar', dimensoes: 'Ø160x75CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

// Insere produtos b (segundo produto em páginas que têm pasta XXb)
const inserts = [
  { pagina: 34, nome: 'Sky',        texto_livre: 'Mesa de Jantar', dimensoes: '220x100x75CM',  descricao: 'Mesa de jantar retangular.' },
  { pagina: 35, nome: 'Lapa',       texto_livre: 'Mesa de Jantar', dimensoes: 'Ø120x75CM',      descricao: 'Mesa de jantar redonda.' },
  { pagina: 36, nome: 'Diamantina', texto_livre: 'Mesa de Jantar', dimensoes: '230x120x75CM',  descricao: 'Mesa de jantar oval.' },
  { pagina: 38, nome: 'Amélia',     texto_livre: 'Mesa de Jantar', dimensoes: '220x100x75CM',  descricao: 'Mesa de jantar retangular.' },
  { pagina: 40, nome: 'Corbelle',   texto_livre: 'Base de Mesa',   dimensoes: 'Ø70x75CM',       descricao: 'Base de mesa circular.' },
  { pagina: 42, nome: 'Labirinto',  texto_livre: 'Mesa de Jantar', dimensoes: '95x95x75CM',    descricao: 'Mesa de jantar quadrada.' },
];

const ins = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, @nome, @pagina, @texto_livre, @dimensoes, 'Alumínio', @descricao)`);
inserts.forEach(p => {
  const r = ins.run(p);
  console.log(`Inserido ${p.nome} pag ${p.pagina} → ID ${r.lastInsertRowid}`);
});

// Verificação
console.log('\n--- Resultado pag 34-43 ---');
const rows = db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 34 AND 43 ORDER BY pagina, id').all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
